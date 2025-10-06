import React from "react";
import { ImageOverlay, OverlayType, ClipOverlay } from "../types";
import { DISABLE_VIDEO_KEYFRAMES, FPS } from "../constants";
import { useKeyframeContext } from "../contexts/keyframe-context";
import { toAbsoluteUrl } from "../utils/url-helper";
import { extractVideoFrame, testVideoUrlAccessibility } from "../utils/video-frame-extractor";

interface UseKeyframesProps {
  overlay: ClipOverlay | ImageOverlay;
  containerRef: React.RefObject<HTMLDivElement>;
  currentFrame: number;
  zoomScale: number;
  baseUrl?: string;
}

interface FrameInfo {
  frameNumber: number;
  dataUrl: string;
}

/**
 * A custom hook that extracts and manages keyframes from video overlays for timeline preview.
 * Uses an optimized approach combining browser capabilities with Remotion utilities.
 *
 * @param {Object} props - The hook properties
 * @param {Overlay} props.overlay - The video overlay object containing source and duration information
 * @param {React.RefObject<HTMLDivElement>} props.containerRef - Reference to the container element for width calculations
 * @param {number} props.currentFrame - The current frame position in the timeline
 * @param {number} props.zoomScale - The current zoom level of the timeline
 *
 * @returns {Object} An object containing:
 *   - frames: Array of extracted frame data URLs
 *   - previewFrames: Array of frame numbers to show in the timeline
 *   - isFrameVisible: Function to determine if a preview frame should be visible
 *   - isLoading: Boolean indicating whether frames are currently being extracted
 *
 * @description
 * This hook handles:
 * - Extracting preview frames from video overlays
 * - Calculating optimal number of keyframes based on container width and zoom level
 * - Managing frame visibility based on current timeline position
 * - Responsive updates when container size changes
 */
export const useKeyframes = ({
  overlay,
  containerRef,
  zoomScale,
  baseUrl,
}: UseKeyframesProps) => {
  const { getKeyframes, updateKeyframes } = useKeyframeContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [frames, setFrames] = React.useState<FrameInfo[]>([]);
  const extractionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Memoize stable overlay values
  const overlayMeta = React.useMemo(
    () => {
      const src = "src" in overlay ? overlay.src : undefined;
      const content = "content" in overlay ? overlay.content : undefined;
      const durationInFrames = "durationInFrames" in overlay ? overlay.durationInFrames : undefined;
      
      console.log("useKeyframes: overlayMeta created:", {
        id: overlay.id,
        src,
        content,
        durationInFrames,
        type: overlay.type
      });
      
      return {
        id: overlay.id,
        src,
        content,
        durationInFrames,
        type: overlay.type,
      };
    },
    [
      overlay.id,
      overlay.src,
      overlay.content,
      overlay.durationInFrames,
      overlay.type,
    ]
  );

  // Store previous overlay details
  const previousOverlayRef = React.useRef<{
    id: string | number;
    src?: string;
    durationInFrames?: number;
  } | null>(null);

  const calculateFrameCount = React.useCallback(() => {
    if (!containerRef.current) return 10;
    const containerWidth = containerRef.current.clientWidth;
    const baseCount = Math.ceil(containerWidth / (150 * zoomScale));
    return Math.min(Math.max(baseCount, 5), 30);
  }, [containerRef, zoomScale]);

  // Memoize frame data transformations
  const frameData = React.useMemo(() => {
    return {
      dataUrls: frames.map((f) => f.dataUrl),
      frameNumbers: frames.map((f) => f.frameNumber),
    };
  }, [frames]);

  // Create a new video and canvas for each extraction
  const createVideoAndCanvas = React.useCallback(
    async (dimensions: { width: number; height: number }) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.preload = "auto";
      video.playbackRate = 16;

      const canvas = document.createElement("canvas");
      const maxWidth = 240;
      const scale = Math.min(
        1,
        (maxWidth * Math.max(1, zoomScale)) / dimensions.width
      );
      canvas.width = Math.floor(dimensions.width * scale);
      canvas.height = Math.floor(dimensions.height * scale);

      const context = canvas.getContext("2d", {
        willReadFrequently: true,
        alpha: false,
      });

      if (!context) {
        throw new Error("Could not get canvas context");
      }

      return { video, canvas, context };
    },
    [zoomScale]
  );

  // Cleanup function to release resources
  const cleanup = React.useCallback((video?: HTMLVideoElement) => {
    if (extractionTimeoutRef.current) {
      clearTimeout(extractionTimeoutRef.current);
      extractionTimeoutRef.current = null;
    }
    if (video) {
      video.src = "";
      video.load();
    }
  }, []);

  // Move the extraction logic into a separate function
  const performExtraction = React.useCallback(async () => {
    if (overlayMeta.type !== OverlayType.VIDEO) return;
    
    // Get the video URL from either src or content property
    const videoUrl = overlayMeta.src || overlayMeta.content;
    if (!videoUrl) {
      console.warn("No video URL found in overlay:", overlayMeta);
      return;
    }
    
    console.log("Extracting frames from video URL:", videoUrl, "for overlay:", overlayMeta.id);

    // Check if we need to re-extract frames
    const previousOverlay = previousOverlayRef.current;
    const shouldReextract =
      !previousOverlay ||
      String(previousOverlay.id) !== String(overlayMeta.id) ||
      previousOverlay.src !== videoUrl ||
      previousOverlay.durationInFrames !== overlayMeta.durationInFrames;

    // Update previous overlay reference
    previousOverlayRef.current = {
      id: overlayMeta.id,
      src: videoUrl,
      durationInFrames: overlayMeta.durationInFrames,
    };

    if (!shouldReextract) return;

    let video: HTMLVideoElement | undefined;

    try {
      setIsLoading(true);
      setFrames([]); // Reset frames

             // Add error tracking with more lenient retry logic
             let extractionErrors = 0;
             const MAX_ERRORS = 10; // Increased from 5 to 10
             const MAX_RETRIES = 5; // Increased from 3 to 5

      // Check cache first but also verify cache integrity
      const overlayIdString = String(overlayMeta.id);
      const cachedFrames = getKeyframes(overlayIdString);
      if (
        cachedFrames &&
        cachedFrames.frames &&
        cachedFrames.frames.length > 0 &&
        cachedFrames.frames.every((frame) => frame?.startsWith("data:image")) &&
        cachedFrames.durationInFrames === overlayMeta.durationInFrames &&
        Date.now() - cachedFrames.lastUpdated < 300000
      ) {
        setFrames(
          cachedFrames.previewFrames.map((frameNumber, index) => ({
            frameNumber,
            dataUrl: cachedFrames.frames[index],
          }))
        );
        return;
      }

      // Process video source URL consistently with video-layer-content
      let processedVideoSrc = videoUrl;
      console.log("useKeyframes: Original video URL:", videoUrl);
      
      // If it's a relative URL and baseUrl is provided
      if (videoUrl.startsWith("/") && baseUrl && !videoUrl.startsWith("/api/")) {
        processedVideoSrc = `${baseUrl}${videoUrl}`;
        console.log("useKeyframes: Processed with baseUrl:", processedVideoSrc);
      }
      // Otherwise use the toAbsoluteUrl helper for relative URLs (but not API routes)
      else if (videoUrl.startsWith("/") && !videoUrl.startsWith("/api/")) {
        processedVideoSrc = toAbsoluteUrl(videoUrl);
        console.log("useKeyframes: Processed with toAbsoluteUrl:", processedVideoSrc);
      } else {
        console.log("useKeyframes: Using original URL (API route or absolute):", processedVideoSrc);
      }

      // Test if the video URL is accessible
      console.log("useKeyframes: Testing video URL accessibility");
      const isAccessible = await testVideoUrlAccessibility(processedVideoSrc);
      if (!isAccessible) {
        console.error("useKeyframes: Video URL is not accessible:", processedVideoSrc);
        return;
      }
      console.log("useKeyframes: Video URL is accessible, proceeding with extraction");

             // Create a temporary video element to get dimensions
             const tempVideo = document.createElement("video");
             tempVideo.crossOrigin = "anonymous";
             tempVideo.muted = true;
             tempVideo.preload = "auto"; // Changed to auto for better loading
             tempVideo.playsInline = true;
             tempVideo.src = processedVideoSrc;

      const dimensions = await new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          const onLoadedMetadata = () => {
            resolve({
              width: tempVideo.videoWidth,
              height: tempVideo.videoHeight,
            });
            cleanup();
          };

          const onError = (e: ErrorEvent) => {
            console.warn(`Video loading failed (likely CORS): ${tempVideo.src}`);
            // Return default dimensions instead of rejecting
            resolve({
              width: 1280,
              height: 720,
            });
            cleanup();
          };

          const cleanup = () => {
            tempVideo.removeEventListener("loadedmetadata", onLoadedMetadata);
            tempVideo.removeEventListener("error", onError);
            tempVideo.src = "";
            tempVideo.load();
          };

          tempVideo.addEventListener("loadedmetadata", onLoadedMetadata);
          tempVideo.addEventListener("error", onError);

                 // Extended timeout for metadata loading
                 setTimeout(() => {
                   cleanup();
                   reject(new Error("Timeout while loading video metadata"));
                 }, 30000);
        }
      );

      if (!dimensions.width || !dimensions.height) {
        throw new Error("Could not get video dimensions");
      }

             // Create new video and canvas elements for this extraction
             const {
               video: newVideo,
               canvas,
               context,
             } = await createVideoAndCanvas(dimensions);
             video = newVideo;
             video.crossOrigin = "anonymous";
             video.muted = true;
             video.preload = "auto"; // Use auto preload for better loading
             video.playsInline = true;
             video.src = processedVideoSrc;

             await new Promise<void>((resolve, reject) => {
               let loadAttempts = 0;
               const MAX_LOAD_ATTEMPTS = 5; // Increased from 3 to 5

               const attemptLoad = () => {
                 loadAttempts++;
                 console.log(`useKeyframes: Attempting video load ${loadAttempts}/${MAX_LOAD_ATTEMPTS} for:`, processedVideoSrc);
                 video!.load();

                 const onLoad = () => {
                   console.log(`useKeyframes: Video load attempt ${loadAttempts} - readyState:`, video!.readyState);
                   if (video!.readyState >= 2) {
                     cleanup();
                     resolve();
                   } else if (loadAttempts < MAX_LOAD_ATTEMPTS) {
                     cleanup();
                     // Add delay between retries for slower videos
                     setTimeout(() => attemptLoad(), 2000);
                   } else {
                     cleanup();
                     reject(
                       new Error(
                         `Video failed to reach ready state after ${MAX_LOAD_ATTEMPTS} attempts`
                       )
                     );
                   }
                 };

                 const onError = (e: ErrorEvent) => {
                   console.warn(`useKeyframes: Video load error on attempt ${loadAttempts}:`, e);
                   cleanup();
                   if (loadAttempts < MAX_LOAD_ATTEMPTS) {
                     // Add delay between retries for failed loads
                     setTimeout(() => attemptLoad(), 3000);
                   } else {
                     reject(
                       new Error(
                         `Video load failed after ${MAX_LOAD_ATTEMPTS} attempts: ${e.message}`
                       )
                     );
                   }
                 };

                 const cleanup = () => {
                   video!.removeEventListener("loadeddata", onLoad);
                   video!.removeEventListener("error", onError);
                 };

                 video!.addEventListener("loadeddata", onLoad);
                 video!.addEventListener("error", onError);
               };

               attemptLoad();
             });

      const frameCount = calculateFrameCount();
      const frameInterval = Math.max(
        1,
        Math.floor(overlayMeta.durationInFrames! / frameCount)
      );

      const frameNumbers = Array.from({ length: frameCount }, (_, i) =>
        Math.min(
          Math.floor(i * frameInterval),
          overlayMeta.durationInFrames! - 1
        )
      );

      const extractedFrames: FrameInfo[] = [];
      const EXTRACTION_BATCH_SIZE = 3; // Smaller batches for better performance

      // Extract frames using the utility function for better reliability
      extractionLoop: for (
        let i = 0;
        i < frameNumbers.length;
        i += EXTRACTION_BATCH_SIZE
      ) {
        const batchFrameNumbers = frameNumbers.slice(
          i,
          i + EXTRACTION_BATCH_SIZE
        );

        // Extract frames in parallel for better performance
        const framePromises = batchFrameNumbers.map(async (frameNumber) => {
          const timeInSeconds = frameNumber / FPS;
          let retryCount = 0;
          
          while (retryCount < MAX_RETRIES) {
            try {
              // Use the utility function for frame extraction
              console.log(`Extracting frame ${frameNumber} at ${timeInSeconds}s from:`, processedVideoSrc);
              const dataUrl = await extractVideoFrame(processedVideoSrc, timeInSeconds);
              
              if (dataUrl && dataUrl.startsWith("data:image")) {
                console.log(`Successfully extracted frame ${frameNumber}:`, dataUrl.substring(0, 50) + "...");
                const frameInfo: FrameInfo = {
                  frameNumber,
                  dataUrl,
                };
                
                // Update frames immediately for better UX
                extractedFrames.push(frameInfo);
                setFrames([...extractedFrames]);
                
                return frameInfo;
              } else {
                console.error(`Failed to extract frame ${frameNumber}:`, dataUrl);
                throw new Error("Invalid frame data URL returned");
              }
            } catch (error) {
              console.warn(
                `Frame extraction failed for frame ${frameNumber} (attempt ${
                  retryCount + 1
                }/${MAX_RETRIES}):`,
                error
              );
              retryCount++;

                     if (retryCount < MAX_RETRIES) {
                       // Longer delays for retries to handle slower videos
                       const delay = Math.min(1000 * Math.pow(1.5, retryCount), 5000);
                       console.log(`useKeyframes: Waiting ${delay}ms before retry ${retryCount + 1}/${MAX_RETRIES} for frame ${frameNumber}`);
                       await new Promise((resolve) => setTimeout(resolve, delay));
                     }
            }
          }
          
          console.error(
            `Failed to extract frame ${frameNumber} after ${MAX_RETRIES} attempts`
          );
          return null;
        });

        // Wait for all frames in this batch to complete
        const batchResults = await Promise.allSettled(framePromises);
        
        // Check for too many failures
        const failedFrames = batchResults.filter(result => 
          result.status === 'rejected' || result.value === null
        ).length;
        
        extractionErrors += failedFrames;
        
        if (
          extractionErrors >= MAX_ERRORS &&
          extractedFrames.length > 0
        ) {
          console.warn(
            `Too many extraction errors (${extractionErrors}), using partial results`
          );
          break extractionLoop;
        }

        // Add a small delay between batches to prevent overload
        if (i + EXTRACTION_BATCH_SIZE < frameNumbers.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Only cache if we got enough frames
      if (extractedFrames.length >= Math.ceil(frameCount * 0.7)) {
        updateKeyframes(overlayIdString, {
          frames: extractedFrames.map((f) => f.dataUrl),
          previewFrames: extractedFrames.map((f) => f.frameNumber),
          durationInFrames: overlayMeta.durationInFrames!,
          lastUpdated: Date.now(),
        });
      } else {
        console.warn(
          `Not enough frames extracted (got ${extractedFrames.length}/${frameCount}), skipping cache update`
        );
      }
    } catch (error) {
      console.error("[Keyframes] Extraction error:", error);
    } finally {
      setIsLoading(false);
      cleanup(video);
    }
  }, [
    overlayMeta,
    calculateFrameCount,
    getKeyframes,
    updateKeyframes,
    cleanup,
    createVideoAndCanvas,
    baseUrl,
  ]);

  React.useEffect(() => {
    console.log("useKeyframes: useEffect triggered", {
      disabled: DISABLE_VIDEO_KEYFRAMES,
      overlayType: overlayMeta.type,
      overlayId: overlayMeta.id
    });
    
    if (!DISABLE_VIDEO_KEYFRAMES) {
      console.log("useKeyframes: Calling performExtraction");
      performExtraction();
    } else {
      console.log("useKeyframes: Video keyframes disabled");
    }
    return () => cleanup();
  }, [performExtraction, cleanup]);

  // Return empty arrays if disabled
  if (DISABLE_VIDEO_KEYFRAMES) {
    return {
      frames: [],
      previewFrames: [],
      isLoading: false,
    };
  }

  return {
    frames: frameData.dataUrls,
    previewFrames: frameData.frameNumbers,
    isLoading,
  };
};
