import { useRef, useState, useCallback } from "react";
import { Overlay } from "../types";

// Interfaces for managing drag and drop functionality
interface GhostElement {
  left: number; // Percentage from left edge
  width: number; // Percentage of total width
  top: number; // Percentage from top edge
}

// Re-add livePushOffsets to state interface
interface TimelineDragState {
  isDragging: boolean;
  draggedItem: Overlay | null;
  ghostElement: GhostElement | null;
  ghostMarkerPosition: number | null;
  livePushOffsets: Map<number, number>; // <itemId, pushDistanceInFrames>
}

interface DragInfo {
  id: number;
  action: "move" | "resize-start" | "resize-end"; // Type of drag operation
  startX: number; // Initial mouse X position
  startY: number; // Initial mouse Y position
  startPosition: number; // Initial overlay position
  startDuration: number; // Initial overlay duration
  startRow: number; // Initial row number
  ghostElement: null;
  ghostMarkerPosition: null;
}

export const useTimelineState = (
  totalDuration: number,
  maxRows: number,
  timelineRef: React.RefObject<HTMLDivElement>
) => {
  // Consolidated state object
  const [dragState, setDragState] = useState<TimelineDragState>({
    isDragging: false,
    draggedItem: null,
    ghostElement: null,
    ghostMarkerPosition: null,
    livePushOffsets: new Map(), // Re-initialize with empty map
  });

  // Persistent reference to current drag operation details
  const dragInfo = useRef<DragInfo | null>(null);

  const handleDragStart = useCallback(
    (
      overlay: Overlay,
      clientX: number,
      clientY: number,
      action: "move" | "resize-start" | "resize-end"
    ) => {
      if (timelineRef.current) {
        // Store initial drag state in dragInfo
        dragInfo.current = {
          id: overlay.id,
          action,
          startX: clientX,
          startY: clientY,
          startPosition: overlay.from,
          startDuration: overlay.durationInFrames,
          startRow: overlay.row || 0,
          ghostElement: null,
          ghostMarkerPosition: null,
        };

        // Update UI states for drag operation
        setDragState((prev) => ({
          ...prev,
          isDragging: true,
          draggedItem: overlay,
          ghostElement: {
            left: (overlay.from / totalDuration) * 100,
            width: (overlay.durationInFrames / totalDuration) * 100,
            top: (overlay.row || 0) * (100 / maxRows),
          },
          livePushOffsets: new Map(), // Reset offsets on new drag start
        }));
      }
    },
    [totalDuration, maxRows]
  );

  // Updates the visual position of the ghost element
  const updateGhostElement = useCallback(
    (
      newLeft: number,
      newWidth: number,
      newTop: number,
      pushedItems: Map<number, number> // Re-add pushedItems
    ) => {
      setDragState((prev) => ({
        ...prev,
        ghostElement: { left: newLeft, width: newWidth, top: newTop },
        livePushOffsets: pushedItems, // Update live push offsets again
      }));
    },
    []
  );

  // Function to update only the ghost marker position
  const setGhostMarkerPosition = useCallback((position: number | null) => {
    setDragState((prev) => ({
      ...prev,
      ghostMarkerPosition: position,
    }));
  }, []);

  // Cleans up all drag-related states
  const resetDragState = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      ghostElement: null,
      ghostMarkerPosition: null,
      livePushOffsets: new Map(), // Clear offsets on reset again
    });
    dragInfo.current = null;
  }, []);

  return {
    // Spread the state values for easy consumption
    ...dragState,
    // Keep dragInfo separate as it's a ref
    dragInfo,
    // Actions
    handleDragStart,
    updateGhostElement,
    resetDragState,
    setGhostMarkerPosition,
  };
};
