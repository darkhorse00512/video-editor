import { useState, useCallback, useRef } from "react";
import { Overlay } from "../types";

// Type for the ghost element's visual properties
interface GhostElementState {
  left: number;
  width: number;
  top: number;
}

// Type for the drag information stored in the ref
interface DragInfoState {
  id: number;
  action: "move" | "resize-start" | "resize-end";
  startX: number;
  startY: number;
  startPosition: number;
  startDuration: number;
  startRow: number;
  ghostLeft?: number;
  ghostWidth?: number;
  ghostTop?: number;
}

/**
 * Custom hook to manage the state related to timeline drag and drop operations.
 * Tracks the dragging state, dragged item, ghost element position, and ghost marker position.
 *
 * @param durationInFrames - Total duration of the timeline in frames.
 * @param maxRows - Maximum number of rows allowed in the timeline.
 * @returns An object containing state variables and functions to manage timeline drag state.
 */
export const useTimelineState = (
  durationInFrames: number,
  maxRows: number,
  timelineRef: React.RefObject<HTMLDivElement | null>
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Overlay | null>(null);
  const [ghostElement, setGhostElement] = useState<GhostElementState | null>(
    null
  );
  const [livePushOffsets, setLivePushOffsets] = useState<Map<number, number>>(
    new Map()
  );
  const [ghostMarkerPosition, setGhostMarkerPosition] = useState<number | null>(
    null
  );
  const dragInfo = useRef<DragInfoState | null>(null);

  const handleDragStart = useCallback(
    (
      overlay: Overlay,
      clientX: number,
      clientY: number,
      action: "move" | "resize-start" | "resize-end"
    ) => {
      if (!timelineRef.current) {
        return;
      }

      setIsDragging(true);
      setDraggedItem(overlay);

      dragInfo.current = {
        id: overlay.id,
        action,
        startX: clientX,
        startY: clientY,
        startPosition: overlay.from,
        startDuration: overlay.durationInFrames,
        startRow: overlay.row || 0,
      };

      setGhostElement({
        left: (overlay.from / durationInFrames) * 100,
        width: (overlay.durationInFrames / durationInFrames) * 100,
        top: (overlay.row || 0) * (100 / maxRows),
      });
      setLivePushOffsets(new Map());
    },
    [durationInFrames, maxRows, timelineRef]
  );

  const updateGhostElement = useCallback(
    (
      newLeft: number,
      newWidth: number,
      newTop: number,
      pushedItems: Map<number, number>
    ) => {
      setGhostElement({ left: newLeft, width: newWidth, top: newTop });

      if (dragInfo.current) {
        dragInfo.current.ghostLeft = newLeft;
        dragInfo.current.ghostWidth = newWidth;
        dragInfo.current.ghostTop = newTop;
      }
      setLivePushOffsets(pushedItems);
    },
    []
  );

  const resetDragState = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    setGhostElement(null);
    setLivePushOffsets(new Map());
    setGhostMarkerPosition(null);
    dragInfo.current = null;
  }, []);

  return {
    isDragging,
    draggedItem,
    ghostElement,
    livePushOffsets,
    ghostMarkerPosition,
    dragInfo,
    handleDragStart,
    updateGhostElement,
    resetDragState,
    setGhostMarkerPosition,
  };
};
