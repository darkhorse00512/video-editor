import React from "react";
import { ClipOverlay, ImageOverlay } from "../../types";
import { FPS } from "../../constants";
import { useKeyframes } from "../../hooks/use-keyframes";
import Image from "next/image";
import { DISABLE_VIDEO_KEYFRAMES } from "../../constants";

/**
 * Props for the TimelineKeyframes component
 */
interface TimelineKeyframesProps {
  /** The overlay object containing video/animation data */
  overlay: ClipOverlay | ImageOverlay;
  /** The current frame number in the timeline */
  currentFrame: number;
  /** Scale factor for timeline zoom level */
  zoomScale: number;
  /** Callback when loading state changes */
  onLoadingChange?: (isLoading: boolean) => void;
}

/**
 * TimelineKeyframes component displays a timeline of video frames
 * with preview thumbnails at regular intervals.
 *
 * @component
 * @param props.overlay - The overlay object containing video/animation data
 * @param props.currentFrame - The current frame number in the timeline
 * @param props.zoomScale - Scale factor for timeline zoom level
 * @param props.onLoadingChange - Callback when loading state changes
 *
 * @example
 * ```tsx
 * <TimelineKeyframes
 *   overlay={videoOverlay}
 *   currentFrame={30}
 *   zoomScale={1}
 *   onLoadingChange={(isLoading) => console.log('Loading:', isLoading)}
 * />
 * ```
 */
export const TimelineKeyframes: React.FC<TimelineKeyframesProps> = ({
  overlay,
  currentFrame,
  zoomScale,
  onLoadingChange,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { frames, previewFrames, isLoading } = useKeyframes({
    overlay,
    containerRef,
    currentFrame,
    zoomScale,
  });

  React.useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // Only show loaded frames
  const loadedFrames = frames.filter(Boolean);
  const TOTAL_SLOTS = 5;

  // Create an array of frames to display, filling remaining slots with the last loaded frame
  const displayFrames = Array(TOTAL_SLOTS)
    .fill(null)
    .map((_, index) => {
      if (index < loadedFrames.length) {
        return loadedFrames[index];
      }
      // Fill remaining slots with the last loaded frame
      return loadedFrames[loadedFrames.length - 1] || null;
    });

  if (DISABLE_VIDEO_KEYFRAMES) {
    return (
      <div className="flex h-full overflow-hidden w-full bg-pink-100 hover:bg-pink-200 dark:bg-pink-600 dark:hover:bg-pink-500"></div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full overflow-hidden w-full bg-slate-100 dark:bg-gray-900"
    >
      <div className="flex h-full w-full">
        {displayFrames.map((frame, index) => {
          const previewFrame =
            previewFrames[Math.min(index, previewFrames.length - 1)];
          const isLast = index === TOTAL_SLOTS - 1;
          const timestamp = previewFrame ? Math.floor(previewFrame / FPS) : 0;

          return (
            <div
              key={`${overlay.id}-${index}`}
              className={`relative ${
                !isLast ? "border-r border-slate-300 dark:border-gray-700" : ""
              }`}
              style={{ width: `${100 / TOTAL_SLOTS}%` }}
            >
              {frame && (
                <div className="relative h-full w-full group">
                  <Image
                    src={frame}
                    alt={`Frame at ${timestamp}s`}
                    className="object-cover transition-opacity group-hover:opacity-90"
                    fill
                    sizes={`${100 / TOTAL_SLOTS}vw`}
                    priority={true}
                    quality={85}
                    loading="eager"
                    style={{
                      imageRendering: "crisp-edges",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
