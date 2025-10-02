import React from "react";
import { ImageOverlay, OverlayType, ClipOverlay } from "../types";
import { DISABLE_VIDEO_KEYFRAMES, FPS } from "../constants";
import { useKeyframeContext } from "../contexts/keyframe-context";
import { toAbsoluteUrl } from "../utils/url-helper";

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
    () => ({
      id: overlay.id,
      src: "src" in overlay ? overlay.src : undefined,
      durationInFrames:
        "durationInFrames" in overlay ? overlay.durationInFrames : undefined,
      type: overlay.type,
    }),
    [
      overlay.id,
      "src" in overlay ? overlay.src : null,
      "durationInFrames" in overlay ? overlay.durationInFrames : null,
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
    if (overlayMeta.type !== OverlayType.VIDEO || !overlayMeta.src) return;

    // Check if we need to re-extract frames
    const previousOverlay = previousOverlayRef.current;
    const shouldReextract =
      !previousOverlay ||
      String(previousOverlay.id) !== String(overlayMeta.id) ||
      previousOverlay.src !== overlayMeta.src ||
      previousOverlay.durationInFrames !== overlayMeta.durationInFrames;

    // Update previous overlay reference
    previousOverlayRef.current = {
      id: overlayMeta.id,
      src: overlayMeta.src,
      durationInFrames: overlayMeta.durationInFrames,
    };

    if (!shouldReextract) return;

    let video: HTMLVideoElement | undefined;

    try {
      setIsLoading(true);
      setFrames([]); // Reset frames

      // Add error tracking with more lenient retry logic
      let extractionErrors = 0;
      const MAX_ERRORS = 5;
      const MAX_RETRIES = 3;

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
      let processedVideoSrc = overlayMeta.src;
      // If it's a relative URL and baseUrl is provided
      if (overlayMeta.src.startsWith("/") && baseUrl) {
        processedVideoSrc = `${baseUrl}${overlayMeta.src}`;
      }
      // Otherwise use the toAbsoluteUrl helper for relative URLs
      else if (overlayMeta.src.startsWith("/")) {
        processedVideoSrc = toAbsoluteUrl(overlayMeta.src);
      }

      // Create a temporary video element to get dimensions
      const tempVideo = document.createElement("video");
      tempVideo.crossOrigin = "anonymous";
      tempVideo.muted = true;
      tempVideo.preload = "metadata";
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
            reject(new Error(`Failed to load video metadata: ${e.message}`));
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

          // Add timeout for metadata loading
          setTimeout(() => {
            cleanup();
            reject(new Error("Timeout while loading video metadata"));
          }, 10000);
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
      video.src = processedVideoSrc;

      await new Promise<void>((resolve, reject) => {
        let loadAttempts = 0;
        const MAX_LOAD_ATTEMPTS = 3;

        const attemptLoad = () => {
          loadAttempts++;
          video!.load();

          const onLoad = () => {
            if (video!.readyState >= 2) {
              cleanup();
              resolve();
            } else if (loadAttempts < MAX_LOAD_ATTEMPTS) {
              cleanup();
              attemptLoad();
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
            cleanup();
            if (loadAttempts < MAX_LOAD_ATTEMPTS) {
              attemptLoad();
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
      const FRAME_TIMEOUT = 8000;
      const SEEK_TIMEOUT = 1000;
      const EXTRACTION_BATCH_SIZE = 5; // Process frames in smaller batches

      extractionLoop: for (
        let i = 0;
        i < frameNumbers.length;
        i += EXTRACTION_BATCH_SIZE
      ) {
        const batchFrameNumbers = frameNumbers.slice(
          i,
          i + EXTRACTION_BATCH_SIZE
        );

        for (const frameNumber of batchFrameNumbers) {
          let retryCount = 0;
          let frameExtracted = false;

          while (retryCount < MAX_RETRIES && !frameExtracted) {
            try {
              const timeInSeconds = frameNumber / FPS;

              // Seek with timeout and better error handling
              const seekPromise = new Promise<void>((resolve, reject) => {
                let seekTimeout = setTimeout(() => {
                  reject(new Error("Seek timeout"));
                }, SEEK_TIMEOUT);

                const onSeeked = () => {
                  clearTimeout(seekTimeout);
                  video!.removeEventListener("seeked", onSeeked);
                  resolve();
                };

                const onError = (error: ErrorEvent) => {
                  clearTimeout(seekTimeout);
                  video!.removeEventListener("seeked", onSeeked);
                  video!.removeEventListener("error", onError);
                  reject(new Error(`Seek error: ${error.message}`));
                };

                video!.addEventListener("seeked", onSeeked);
                video!.addEventListener("error", onError);

                seekTimeout = setTimeout(() => {
                  video!.removeEventListener("seeked", onSeeked);
                  video!.removeEventListener("error", onError);
                  reject(new Error("Seek timeout"));
                }, SEEK_TIMEOUT);

                video!.currentTime = timeInSeconds;
              });

              await seekPromise;

              // Extract frame with timeout and better error handling
              await new Promise<void>((resolve, reject) => {
                const extractFrame = () => {
                  try {
                    // Ensure video is still valid
                    if (!video!.videoWidth || !video!.videoHeight) {
                      throw new Error(
                        "Invalid video dimensions during extraction"
                      );
                    }

                    context.drawImage(
                      video!,
                      0,
                      0,
                      canvas.width,
                      canvas.height
                    );
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);

                    if (!dataUrl.startsWith("data:image")) {
                      throw new Error("Invalid frame data URL");
                    }

                    extractedFrames.push({
                      frameNumber,
                      dataUrl,
                    });
                    setFrames([...extractedFrames]);
                    resolve();
                  } catch (error) {
                    reject(error);
                  }
                };

                // Add a small delay before extraction to ensure frame is ready
                setTimeout(extractFrame, 50);

                // Set timeout for the entire extraction process
                setTimeout(() => {
                  reject(new Error("Frame extraction timeout"));
                }, FRAME_TIMEOUT);
              });

              frameExtracted = true;
            } catch (error) {
              console.warn(
                `Frame extraction failed for frame ${frameNumber} (attempt ${
                  retryCount + 1
                }/${MAX_RETRIES}):`,
                error
              );
              retryCount++;

              if (retryCount === MAX_RETRIES) {
                extractionErrors++;
                if (
                  extractionErrors >= MAX_ERRORS &&
                  extractedFrames.length > 0
                ) {
                  console.warn(
                    `Too many extraction errors (${extractionErrors}), using partial results`
                  );
                  break extractionLoop;
                }
              }

              // Exponential backoff for retries
              await new Promise((resolve) =>
                setTimeout(
                  resolve,
                  Math.min(100 * Math.pow(2, retryCount), 1000)
                )
              );
            }
          }

          if (!frameExtracted) {
            console.error(
              `Failed to extract frame ${frameNumber} after ${MAX_RETRIES} attempts`
            );
          }
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
    if (!DISABLE_VIDEO_KEYFRAMES) {
      performExtraction();
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
