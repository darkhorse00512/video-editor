import { useState, useEffect } from "react";
import { Search, Film, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useEditorContext } from "../../../contexts/editor-context";
import { useTimelinePositioning } from "../../../hooks/use-timeline-positioning";

import { usePexelsVideos } from "../../../hooks/use-pexels-video";
import { useAspectRatio } from "../../../hooks/use-aspect-ratio";
import { useTimeline } from "../../../contexts/timeline-context";
import { ClipOverlay, Overlay, OverlayType } from "../../../types";
import { VideoDetails } from "./video-details";
import VideoSelector from "./video-selector";
import config from "@/config/config";

// Note: Removed thumbnail generation functions since we now use video file directly
// The TimelineKeyframes component handles extracting frames from the video URL

interface PexelsVideoFile {
  quality: string;
  link: string;
}

interface PexelsVideo {
  id: number | string;
  image: string;
  video_files: PexelsVideoFile[];
}

/**
 * VideoOverlayPanel is a component that provides video search and management functionality.
 * It allows users to:
 * - Search and browse videos from the Pexels API
 * - Add videos to the timeline as overlays
 * - Manage video properties when a video overlay is selected
 *
 * The component has two main states:
 * 1. Search/Browse mode: Shows a search input and grid of video thumbnails
 * 2. Edit mode: Shows video details panel when a video overlay is selected
 *
 * @component
 * @example
 * ```tsx
 * <VideoOverlayPanel />
 * ```
 */
export const VideoOverlayPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { videos, isLoading, fetchVideos } = usePexelsVideos();
  const {
    addOverlay,
    overlays,
    durationInFrames,
    selectedOverlayId,
    changeOverlay,
  } = useEditorContext();
  const { findNextAvailablePosition } = useTimelinePositioning();
  const { getAspectRatioDimensions } = useAspectRatio();
  const { visibleRows } = useTimeline();
  const [localOverlay, setLocalOverlay] = useState<Overlay | null>(null);
  const [showVideoSelector, setShowVideoSelector] = useState(false);

  useEffect(() => {
    if (selectedOverlayId === null) {
      setLocalOverlay(null);
      return;
    }

    const selectedOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );

    if (selectedOverlay?.type === OverlayType.VIDEO) {
      setLocalOverlay(selectedOverlay);
    }
  }, [selectedOverlayId, overlays]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchVideos(searchQuery);
    }
  };

  // Handle video selection from video selector
  const handleVideoSelect = async (videoData: any) => {
    console.log("Selected video data in overlay panel:", videoData);
    
    // Calculate duration in frames first (default to 200 frames if duration is not available)
    const durationInSeconds = videoData.duration || 6.67; // Default to ~200 frames at 30fps
    const durationInFrames = Math.round(durationInSeconds * 30);
    
    const { width, height } = getAspectRatioDimensions();
    const { from, row } = findNextAvailablePosition(
      overlays,
      visibleRows,
      durationInFrames
    );

    // Build video URL with fallbacks
    let videoUrl = "";
    if (videoData.video_url) {
      // The video_url should already be processed by the video-selector
      // But let's ensure it's properly formatted
      if (videoData.video_url.startsWith('http') && !videoData.video_url.includes('/api/video-proxy')) {
        videoUrl = `/api/video-proxy?url=${encodeURIComponent(videoData.video_url)}`;
      } else {
        videoUrl = videoData.video_url;
      }
    } else if (videoData.user_uuid && videoData.video_id) {
      const originalUrl = `${config.data_url}/${videoData.user_uuid}/video/${videoData.video_id}.mp4`;
      videoUrl = `/api/video-proxy?url=${encodeURIComponent(originalUrl)}`;
    } else {
      // No valid video URL available - don't create overlay
      console.error("No valid video URL available for video:", videoData);
      return;
    }

    // Use video file directly for timeline display
    // The TimelineKeyframes component will handle extracting frames from the video URL
    console.log("Using video file directly for timeline display:", videoUrl);
    
    // Set the video URL as the content - this will be used by TimelineKeyframes to extract frames
    const thumbnailUrl = videoUrl;
    
    const newOverlay: Overlay = {
      left: 0,
      top: 0,
      width,
      height,
      durationInFrames: durationInFrames,
      from,
      id: Date.now(),
      rotation: 0,
      row,
      isDragging: false,
      type: OverlayType.VIDEO,
      content: thumbnailUrl,
      src: videoUrl,
      videoStartTime: 0,
      styles: {
        opacity: 1,
        zIndex: 100,
        transform: "none",
        objectFit: "cover",
      },
    };

    console.log("Created overlay for timeline:", {
      ...newOverlay,
      videoUrl: videoUrl,
      thumbnailUrl: thumbnailUrl,
      durationInSeconds: durationInSeconds,
      position: { from, row },
      dimensions: { width, height }
    });
    
    addOverlay(newOverlay);
    setShowVideoSelector(false);
    
    console.log("Video overlay added to timeline successfully");
  };

  const handleAddClip = (video: PexelsVideo) => {
    const { width, height } = getAspectRatioDimensions();

    const { from, row } = findNextAvailablePosition(
      overlays,
      visibleRows,
      durationInFrames
    );

    // Find the best quality video file (prioritize UHD > HD > SD)
    const videoFile =
      video.video_files.find(
        (file: PexelsVideoFile) => file.quality === "uhd"
      ) ||
      video.video_files.find(
        (file: PexelsVideoFile) => file.quality === "hd"
      ) ||
      video.video_files.find(
        (file: PexelsVideoFile) => file.quality === "sd"
      ) ||
      video.video_files[0]; // Fallback to first file if no matches

    const newOverlay: Overlay = {
      left: 0,
      top: 0,
      width,
      height,
      durationInFrames: 200,
      from,
      id: Date.now(),
      rotation: 0,
      row,
      isDragging: false,
      type: OverlayType.VIDEO,
      content: video.image,
      src: videoFile?.link ?? "",
      videoStartTime: 0,
      styles: {
        opacity: 1,
        zIndex: 100,
        transform: "none",
        objectFit: "cover",
      },
    };

    addOverlay(newOverlay);
  };

  const handleUpdateOverlay = (updatedOverlay: Overlay) => {
    setLocalOverlay(updatedOverlay);
    changeOverlay(updatedOverlay.id, updatedOverlay);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-100/40 dark:bg-gray-900/40 h-full">
      {!localOverlay ? (
        <>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-white/5 text-gray-900 dark:text-zinc-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-blue-400"
              onChange={(e) => setSearchQuery(e.target.value)}
              // NOTE: Stops zooming in on input focus on iPhone
              style={{ fontSize: "16px" }}
            />
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-zinc-200 border-gray-200 dark:border-white/5"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Video Library Button */}
          <div className="mb-4">
            <Button
              onClick={() => setShowVideoSelector(true)}
              variant="outline"
              className="w-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
            >
              <Video className="h-4 w-4 mr-2" />
              Browse Video Library
            </Button>
          </div>


          <div className="columns-2 sm:columns-2 gap-3 space-y-3">
            {isLoading ? (
              Array.from({ length: 16 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="relative aspect-video w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-sm break-inside-avoid mb-3"
                />
              ))
            ) : videos.length > 0 ? (
              videos.map((video) => (
                <button
                  key={video.id}
                  className="relative block w-full cursor-pointer border border-transparent rounded-md overflow-hidden break-inside-avoid mb-3"
                  onClick={() => handleAddClip(video)}
                >
                  <div className="relative">
                    <video
                      src={video.video_files[0]?.link || video.video_files.find(f => f.quality === 'hd')?.link || video.video_files[0]?.link}
                      className="w-full h-auto rounded-sm object-cover hover:opacity-60 transition-opacity duration-200"
                      preload="metadata"
                      muted
                      loop
                      onMouseEnter={(e) => {
                        const videoElement = e.target as HTMLVideoElement;
                        videoElement.currentTime = 0;
                        videoElement.play().catch((err) => console.log("Play failed:", err));
                      }}
                      onMouseLeave={(e) => {
                        const videoElement = e.target as HTMLVideoElement;
                        videoElement.pause();
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-gray-500"></div>
            )}
          </div>
        </>
      ) : (
        <VideoDetails
          localOverlay={localOverlay as ClipOverlay}
          setLocalOverlay={handleUpdateOverlay}
        />
      )}

      {/* Video Selector Dialog */}
      <VideoSelector
        open={showVideoSelector}
        onOpenChange={setShowVideoSelector}
        onVideoSelect={handleVideoSelect}
        title="Select Video from Library"
        description="Browse your video library and select a video to use in your project"
      />
    </div>
  );
};
