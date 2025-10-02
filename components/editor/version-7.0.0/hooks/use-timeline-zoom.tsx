import { useState, useCallback, RefObject } from "react";
import { ZOOM_CONSTRAINTS } from "../constants";

type ZoomState = {
  scale: number;
  scroll: number;
};

/**
 * A custom hook that manages zoom and scroll behavior for a timeline component.
 * Handles both programmatic and wheel-based zooming while maintaining the zoom point
 * relative to the cursor position.
 *
 * @param timelineRef - React ref object pointing to the timeline DOM element
 * @returns {Object} An object containing:
 *   - zoomScale: Current zoom level
 *   - scrollPosition: Current scroll position
 *   - setZoomScale: Function to directly set zoom level
 *   - setScrollPosition: Function to directly set scroll position
 *   - handleZoom: Function to handle programmatic zooming
 *   - handleWheelZoom: Event handler for wheel-based zooming
 */
export const useTimelineZoom = (timelineRef: RefObject<HTMLDivElement>) => {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: ZOOM_CONSTRAINTS.default,
    scroll: 0,
  });

  const calculateNewZoom = useCallback(
    (prevZoom: number, delta: number): number => {
      return Math.min(
        ZOOM_CONSTRAINTS.max,
        Math.max(ZOOM_CONSTRAINTS.min, prevZoom + delta * ZOOM_CONSTRAINTS.step)
      );
    },
    []
  );

  const handleZoom = useCallback(
    (delta: number, clientX: number) => {
      const scrollContainer = timelineRef.current?.parentElement;
      if (!scrollContainer) return;

      const newZoom = calculateNewZoom(zoomState.scale, delta);
      if (newZoom === zoomState.scale) return;

      const rect = scrollContainer.getBoundingClientRect();
      const relativeX = clientX - rect.left + scrollContainer.scrollLeft;
      const zoomFactor = newZoom / zoomState.scale;
      const newScroll = relativeX * zoomFactor - (clientX - rect.left);

      requestAnimationFrame(() => {
        scrollContainer.scrollLeft = newScroll;
      });

      setZoomState({ scale: newZoom, scroll: newScroll });
    },
    [timelineRef, zoomState.scale, calculateNewZoom]
  );

  const handleWheelZoom = useCallback(
    (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const delta = -Math.sign(event.deltaY) * ZOOM_CONSTRAINTS.wheelStep;
        handleZoom(delta, event.clientX);
      }
    },
    [handleZoom]
  );

  return {
    zoomScale: zoomState.scale,
    scrollPosition: zoomState.scroll,
    setZoomScale: (newScale: number) =>
      setZoomState((prev) => ({ ...prev, scale: newScale })),
    setScrollPosition: (newScroll: number) =>
      setZoomState((prev) => ({ ...prev, scroll: newScroll })),
    handleZoom,
    handleWheelZoom,
  };
};
