import React, { createContext, useContext, useRef, useMemo } from "react";
import { useTimelineZoom } from "../hooks/use-timeline-zoom";
import { useVisibleRows } from "../hooks/use-visible-rows";
import { useOverlays } from "../hooks/use-overlays";

/**
 * Context interface for managing timeline state and interactions.
 * @interface TimelineContextType
 */
interface TimelineContextType {
  /** Number of currently visible rows in the timeline */
  visibleRows: number;
  /** Update the number of visible rows */
  setVisibleRows: (rows: number) => void;
  /** Add a new row to the timeline */
  addRow: () => void;
  /** Remove the last row from the timeline */
  removeRow: () => void;
  /** Reference to the timeline DOM element */
  timelineRef: React.RefObject<HTMLDivElement>;
  /** Current zoom level of the timeline */
  zoomScale: number;
  /** Update the zoom scale */
  setZoomScale: (scale: number) => void;
  /** Current horizontal scroll position */
  scrollPosition: number;
  /** Update the scroll position */
  setScrollPosition: (position: number) => void;
  /** Handle zoom interactions with delta and client X position */
  handleZoom: (delta: number, clientX: number) => void;
  /** Handle zoom interactions from wheel events */
  handleWheelZoom: (event: WheelEvent) => void;
  /** Reset all timeline overlays to their default state */
  resetOverlays: () => void;
}

/**
 * Context for sharing timeline state and functionality across components.
 */
export const TimelineContext = createContext<TimelineContextType | null>(null);

/**
 * Provider component that manages timeline state and makes it available to child components.
 * Combines functionality from multiple hooks to handle timeline interactions.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to the timeline context
 */
export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { visibleRows, setVisibleRows, addRow, removeRow } = useVisibleRows();
  const { resetOverlays } = useOverlays();

  const timelineRef = useRef<HTMLDivElement>(null);

  const {
    zoomScale,
    scrollPosition,
    setZoomScale,
    setScrollPosition,
    handleZoom,
    handleWheelZoom,
  } = useTimelineZoom(timelineRef);

  const value = useMemo(
    () => ({
      visibleRows,
      setVisibleRows,
      addRow,
      removeRow,
      timelineRef,
      zoomScale,
      setZoomScale,
      scrollPosition,
      setScrollPosition,
      handleZoom,
      handleWheelZoom,
      resetOverlays,
    }),
    [
      visibleRows,
      timelineRef,
      zoomScale,
      setZoomScale,
      scrollPosition,
      setScrollPosition,
      handleZoom,
      handleWheelZoom,
      resetOverlays,
    ]
  );

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};

/**
 * Hook to access timeline context and functionality.
 * Must be used within a TimelineProvider component.
 *
 * @returns {TimelineContextType} Timeline context object containing state and methods
 * @throws {Error} If used outside of a TimelineProvider
 */
export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
};
