import { useCallback } from "react";

type PlayerRef = React.RefObject<{
  seekTo: (time: number) => void;
}>;

/**
 * A custom hook that creates a click handler for timeline/progress bar interactions.
 * When clicked, it calculates the relative position and seeks the player to that timestamp.
 *
 * @param playerRef - A ref to the player component that implements a seekTo method
 * @param durationInFrames - The total duration of the media in frames
 * @returns A callback function that handles click events on the timeline
 *
 * @example
 * ```tsx
 * const playerRef = useRef<PlayerType>(null);
 * const handleTimelineClick = useTimelineClick(playerRef, 180); // 180 frames (e.g., for a 6-second video at 30fps)
 *
 * return <div onClick={handleTimelineClick} className="timeline" />;
 * ```
 */
export const useTimelineClick = (
  playerRef: PlayerRef,
  durationInFrames: number
) => {
  return useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (playerRef.current) {
        const timelineRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - timelineRect.left;
        const clickPercentage = clickX / timelineRect.width;
        const newTime = clickPercentage * durationInFrames;
        playerRef.current.seekTo(newTime);
      }
    },
    [playerRef, durationInFrames]
  );
};
