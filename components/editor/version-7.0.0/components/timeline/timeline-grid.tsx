/**
 * TimelineGrid Component
 * Renders a grid-based timeline view for managing overlay items across multiple rows.
 * Supports drag and drop, resizing, and various item management operations.
 */

import React, { useMemo } from "react";
import { ROW_HEIGHT } from "../../constants";
import { useTimeline } from "../../contexts/timeline-context";
import { Overlay } from "../../types";
import GapIndicator from "./timeline-gap-indicator";
import TimelineItem from "./timeline-item";
import { SNAPPING_CONFIG } from "../../constants";

/**
 * Props for the TimelineGrid component
 * @interface TimelineGridProps
 */
interface TimelineGridProps {
  /** Array of overlay items to display in the timeline */
  overlays: Overlay[];
  /** Indicates if an item is currently being dragged */
  isDragging: boolean;
  /** The overlay item currently being dragged, if any */
  draggedItem: Overlay | null;
  /** ID of the currently selected overlay */
  selectedOverlayId: number | null;
  /** Callback to update the selected overlay ID */
  setSelectedOverlayId: (id: number | null) => void;
  /** Callback triggered when dragging starts */
  handleDragStart: (
    overlay: Overlay,
    clientX: number,
    clientY: number,
    action: "move" | "resize-start" | "resize-end"
  ) => void;
  /** Total duration of the timeline in seconds */
  totalDuration: number;
  /** Visual element showing drag preview (snapped) */
  ghostElement: {
    left: number; // Position from left as percentage
    width: number; // Width as percentage
    top: number; // Vertical position
  } | null;
  /** Live push offsets during drag (from useTimelineState) */
  livePushOffsets: Map<number, number>; // <itemId, pushDistanceInFrames>
  /** Callback to delete an overlay item */
  onDeleteItem: (id: number) => void;
  /** Callback to duplicate an overlay item */
  onDuplicateItem: (id: number) => void;
  /** Callback to split an overlay item at current position */
  onSplitItem: (id: number) => void;
  /** Callback when hovering over an item */
  onHover: (itemId: number, position: number) => void;
  /** Callback when context menu state changes */
  onContextMenuChange: (open: boolean) => void;
  /** Callback to remove gap between items */
  onRemoveGap?: (rowIndex: number, gapStart: number, gapEnd: number) => void; // Revert signature
  /** Current frame of the timeline */
  currentFrame: number;
  /** Zoom scale of the timeline */
  zoomScale: number;
  /** Callback when rows are reordered */
  onReorderRows?: (fromIndex: number, toIndex: number) => void;
  /** Index of the row being dragged */
  draggedRowIndex: number | null;
  /** Index of the row being hovered over */
  dragOverRowIndex: number | null;
  /** Callback when asset loading state changes */
  onAssetLoadingChange?: (overlayId: number, isLoading: boolean) => void;
  /** Array of calculated frame positions for alignment lines */
  alignmentLines: number[];
}

/**
 * TimelineGrid component that displays overlay items in a row-based timeline view
 */
const TimelineGrid: React.FC<TimelineGridProps> = ({
  overlays,
  isDragging,
  draggedItem,
  selectedOverlayId,
  setSelectedOverlayId,
  handleDragStart,
  totalDuration,
  ghostElement,
  livePushOffsets,
  onDeleteItem,
  onDuplicateItem,
  onSplitItem,
  onHover,
  onContextMenuChange,
  onRemoveGap,
  currentFrame,
  zoomScale,
  draggedRowIndex,
  dragOverRowIndex,
  onAssetLoadingChange,
  alignmentLines,
}) => {
  const { visibleRows } = useTimeline();

  // Create a memoized selectedItem object
  const selectedItem = useMemo(
    () => (selectedOverlayId !== null ? { id: selectedOverlayId } : null),
    [selectedOverlayId]
  );

  /**
   * Finds gaps between overlay items in a single timeline row
   * @param rowItems - Array of Overlay items in the current row
   * @returns Array of gap objects, each containing start and end times
   *
   * @example
   * // For a row with items: [0-30], [50-80], [100-120]
   * // Returns: [{start: 30, end: 50}, {start: 80, end: 100}]
   *
   * @description
   * This function identifies empty spaces (gaps) between overlay items in a timeline row:
   * 1. Converts each item into start and end time points
   * 2. Sorts all time points chronologically
   * 3. Identifies three types of gaps:
   *    - Gaps at the start (if first item doesn't start at 0)
   *    - Gaps between items
   *    - Gaps at the end are not included as they're considered infinite
   */
  const findGapsInRow = (rowItems: Overlay[]) => {
    if (rowItems.length === 0) return [];

    const timePoints = rowItems
      .flatMap((item) => [
        { time: item.from, type: "start" },
        { time: item.from + item.durationInFrames, type: "end" },
      ])
      .sort((a, b) => a.time - b.time);

    // Handle special case: if no items start at 0, add a gap from 0
    const gaps: { start: number; end: number }[] = [];

    // Handle gap at the start
    if (timePoints.length > 0 && timePoints[0].time > 0) {
      gaps.push({ start: 0, end: timePoints[0].time });
    }

    // Handle gaps between items
    for (let i = 0; i < timePoints.length - 1; i++) {
      const currentPoint = timePoints[i];
      const nextPoint = timePoints[i + 1];

      if (
        currentPoint.type === "end" &&
        nextPoint.type === "start" &&
        nextPoint.time > currentPoint.time
      ) {
        gaps.push({ start: currentPoint.time, end: nextPoint.time });
      }
    }

    return gaps;
  };

  return (
    <div
      className="relative overflow-x-auto overflow-y-hidden bg-white dark:bg-gray-900 h-full"
      style={{ height: `${visibleRows * ROW_HEIGHT}px` }}
    >
      {/* Container for Rows and Alignment Lines */}
      <div className="absolute inset-0 flex flex-col gap-2 pt-2 pb-2">
        {/* Render Alignment Lines - Conditionally visible and higher contrast */}
        {isDragging &&
          SNAPPING_CONFIG.enableVerticalSnapping &&
          alignmentLines.map((frame) => (
            <div
              key={`align-${frame}`}
              className="absolute top-0 bottom-0 w-px border-r border-dashed border-gray-500 dark:border-gray-200 z-40 pointer-events-none"
              style={{
                left: `${(frame / totalDuration) * 100}%`,
                height: "100%", // Ensure line spans full grid height
              }}
              aria-hidden="true"
            />
          ))}

        {/* Render Rows (existing code) */}
        {Array.from({ length: visibleRows }).map((_, rowIndex) => {
          const rowItems = overlays.filter(
            (overlay) => overlay.row === rowIndex
          );
          const gaps = findGapsInRow(rowItems);

          // Debug log for first row gaps
          if (rowIndex === 0) {
            console.log("First row items:", rowItems);
            console.log("First row gaps:", gaps);
            console.log("isDragging state:", isDragging);
          }

          return (
            <div
              key={rowIndex}
              className={`flex-1 bg-slate-100/90 dark:bg-gray-800  relative
                transition-all duration-200 ease-in-out
                hover:bg-slate-200/90 dark:hover:bg-gray-700/90
                ${
                  dragOverRowIndex === rowIndex
                    ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }
                ${draggedRowIndex === rowIndex ? "opacity-50" : ""}
                ${
                  selectedOverlayId && overlays.some((o) => o.row === rowIndex)
                    ? "shadow-sm"
                    : ""
                }`}
            >
              {rowItems.map((overlay) => {
                // Calculate the live push offset percentage for this specific item
                const pushOffsetFrames = livePushOffsets.get(overlay.id) || 0;
                const livePushOffsetPercent =
                  totalDuration > 0
                    ? (pushOffsetFrames / totalDuration) * 100
                    : 0;

                return (
                  <TimelineItem
                    key={overlay.id}
                    item={overlay}
                    isDragging={isDragging}
                    draggedItem={draggedItem}
                    selectedItem={selectedItem}
                    setSelectedItem={(item) => setSelectedOverlayId(item.id)}
                    handleMouseDown={(action, e) =>
                      handleDragStart(overlay, e.clientX, e.clientY, action)
                    }
                    handleTouchStart={(action, e) => {
                      const touch = e.touches[0];
                      handleDragStart(
                        overlay,
                        touch.clientX,
                        touch.clientY,
                        action
                      );
                    }}
                    totalDuration={totalDuration}
                    onDeleteItem={onDeleteItem}
                    onDuplicateItem={onDuplicateItem}
                    onSplitItem={onSplitItem}
                    onHover={onHover}
                    onContextMenuChange={onContextMenuChange}
                    currentFrame={currentFrame}
                    zoomScale={zoomScale}
                    onAssetLoadingChange={onAssetLoadingChange}
                    livePushOffsetPercent={livePushOffsetPercent}
                  />
                );
              })}

              {/* Gap indicators */}
              {!isDragging &&
                gaps.map((gap, gapIndex) => (
                  <GapIndicator
                    key={`gap-${rowIndex}-${gapIndex}`}
                    gap={gap}
                    rowIndex={rowIndex}
                    totalDuration={totalDuration}
                    onRemoveGap={onRemoveGap}
                  />
                ))}

              {/* Ghost element with updated colors */}
              {ghostElement &&
                Math.floor(ghostElement.top / (100 / visibleRows)) ===
                  rowIndex && (
                  <div
                    className="absolute inset-y-[0.9px] rounded-md border-black dark:border-white border-2 bg-blue-100/30 dark:bg-gray-400/30 pointer-events-none shadow-md"
                    style={{
                      left: `${ghostElement.left}%`,
                      width: `${Math.max(ghostElement.width, 1)}%`,
                      zIndex: 50,
                    }}
                  />
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineGrid;
