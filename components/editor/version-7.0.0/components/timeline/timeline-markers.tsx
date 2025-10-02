import React, { useCallback } from "react";
import { FPS } from "../../constants";

/**
 * Props for the TimeMarkers component
 * @typedef {Object} TimeMarkersProps
 * @property {number} durationInFrames - Total number of frames in the timeline
 * @property {function} handleTimelineClick - Callback function when timeline is clicked
 * @property {number} zoomScale - Current zoom level of the timeline
 */
type TimeMarkersProps = {
  durationInFrames: number;
  handleTimelineClick: (clickPosition: number) => void;
  zoomScale: number;
};

/**
 * Renders timeline markers with adaptive scaling based on zoom level
 * Displays time indicators and clickable markers for timeline navigation
 */
const TimeMarkers = ({
  durationInFrames,
  handleTimelineClick,
  zoomScale,
}: TimeMarkersProps): JSX.Element => {
  const generateMarkers = (): JSX.Element[] => {
    const markers: JSX.Element[] = [];
    // Calculate total seconds more precisely using frames
    const totalSeconds = durationInFrames / FPS;

    // Dynamic interval calculation based on zoom level
    const baseInterval = ((): number => {
      const targetMarkerCount = Math.max(
        8,
        Math.min(40, Math.floor(25 * zoomScale))
      );
      const rawInterval = totalSeconds / targetMarkerCount;

      const niceIntervals: number[] = [
        0.04, 0.08, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300,
      ];

      if (isNaN(rawInterval) || rawInterval <= 0) {
        return niceIntervals[0];
      }

      return niceIntervals.reduce((prev, curr) =>
        Math.abs(curr - rawInterval) < Math.abs(prev - rawInterval)
          ? curr
          : prev
      );
    })();

    // Calculate sub-intervals for different marker types
    const majorInterval = baseInterval;
    const minorInterval = baseInterval / 4;
    const microInterval = baseInterval / 8;
    const labelInterval = majorInterval * 2;

    // Safeguard against division by zero or excessively small microInterval
    if (microInterval < 1e-6) {
      if (totalSeconds > 1e-9) {
        const zeroMarker: JSX.Element = (
          <div
            key="0s-marker-guard"
            className="absolute top-0 flex flex-col items-center"
            data-timeline-marker="tick"
            style={{
              left: "0%",
              transform: "translateX(-50%)",
            }}
          >
            <div
              className="h-2 w-[1px] bg-gray-300 dark:bg-gray-600/50"
              data-timeline-marker="indicator"
            />
            <span
              className="text-[8px] font-light tracking-tight text-gray-700 dark:text-gray-300/90 mt-0.5 select-none"
              data-timeline-marker="label"
            >
              0.00s
            </span>
          </div>
        );
        return [zeroMarker];
      }
      return []; // No duration or too small interval, no markers
    }

    // Calculate number of micro steps for each interval type. These should be integers.
    const numMicroStepsInMajor = Math.round(majorInterval / microInterval);
    const numMicroStepsInMinor = Math.round(minorInterval / microInterval);
    const numMicroStepsInLabel = Math.round(labelInterval / microInterval);

    const effectiveTotalSeconds = Math.max(0, totalSeconds);
    const totalMicroSteps = Math.floor(effectiveTotalSeconds / microInterval);

    const epsilon = 1e-9; // Small value for floating point comparisons

    for (let i = 0; i <= totalMicroSteps; i++) {
      const timeCandidate = i * microInterval;

      if (timeCandidate > effectiveTotalSeconds + epsilon && i > 0) {
        continue;
      }
      const currentTime = Math.min(timeCandidate, effectiveTotalSeconds);

      const preMinutes = Math.floor(currentTime / 60);
      const preSeconds = currentTime % 60;

      const resolvedSeconds =
        Math.abs(preSeconds - 60) < epsilon ? 0 : preSeconds;
      const resolvedMinutes =
        Math.abs(preSeconds - 60) < epsilon &&
        preMinutes < Number.MAX_SAFE_INTEGER
          ? preMinutes + 1
          : preMinutes;

      const isMajorTick = i % numMicroStepsInMajor === 0;
      const isMinorTick = i % numMicroStepsInMinor === 0;
      const shouldShowLabel = i % numMicroStepsInLabel === 0;

      const positionPercentage =
        effectiveTotalSeconds > epsilon
          ? (currentTime / effectiveTotalSeconds) * 100
          : 0;

      const markerElement: JSX.Element = (
        <div
          key={i}
          className="absolute top-0 flex flex-col items-center"
          data-timeline-marker="tick"
          style={{
            left: `${positionPercentage}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div
            className={`
              ${
                isMajorTick
                  ? "h-2 w-[1px] bg-gray-300 dark:bg-gray-600/50"
                  : isMinorTick
                  ? "h-1 w-px bg-gray-300 dark:bg-gray-600/40"
                  : "h-0.5 w-px bg-gray-200 dark:bg-gray-600/30"
              }
              transition-all duration-150 ease-in-out
              group-hover:bg-blue-500/50 dark:group-hover:bg-blue-300/50
            `}
            data-timeline-marker="indicator"
          />
          {shouldShowLabel && (
            <span
              className={`
                text-[8px] font-light tracking-tight
                text-gray-700 dark:text-gray-300/90
                mt-0.5 select-none
                duration-150
              `}
              data-timeline-marker="label"
            >
              {resolvedMinutes > 0
                ? `${resolvedMinutes}m ${resolvedSeconds
                    .toFixed(0)
                    .padStart(2, "0")}s`
                : `${resolvedSeconds.toFixed(2)}s`}
            </span>
          )}
        </div>
      );

      markers.push(markerElement);
    }

    return markers;
  };

  /**
   * Handles click events on the timeline
   * Calculates the relative position of the click and calls the handler
   * Only processes clicks that originated on the timeline markers, not bubbled from items
   */
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Only process clicks that originated on the timeline itself, not from items
      if (
        event.target === event.currentTarget ||
        (event.target as HTMLElement).closest("[data-timeline-marker]")
      ) {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        const clickPosition = (event.clientX - left) / width;
        // Convert click position to frame-accurate position
        const framePosition =
          Math.round(clickPosition * durationInFrames) / durationInFrames;
        handleTimelineClick(framePosition);
      }
    },
    [handleTimelineClick, durationInFrames]
  );

  return (
    <div
      className="absolute top-0 left-0 right-0 h-12  
        cursor-pointer
        z-10"
      data-timeline-marker="root"
      onClick={handleClick}
    >
      {generateMarkers()}
    </div>
  );
};

export default TimeMarkers;
