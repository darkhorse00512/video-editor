import { useCallback } from "react";
import { Overlay, OverlayType } from "../types";
import { ENABLE_PUSH_ON_DRAG } from "../constants";

// Add PushCalculationResult interface back
interface PushCalculationResult {
  canPush: boolean;
  pushedItems: Map<number, number>; // <itemId, pushDistance>
}

// Revert DragInfo type
interface DragInfo {
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
  currentRow?: number;
  // Remove potential position fields again
}

interface UseTimelineDragAndDropProps {
  overlays: Overlay[];
  durationInFrames: number;
  onOverlayChange: (updatedOverlay: Overlay) => void;
  // Revert updateGhostElement signature to expect pushedItems
  updateGhostElement: (
    newLeft: number,
    newWidth: number,
    newTop: number,
    pushedItems: Map<number, number> // Expect pushedItems again
  ) => void;
  resetDragState: () => void;
  timelineRef: React.RefObject<HTMLDivElement>;
  dragInfo: React.MutableRefObject<DragInfo | null>;
  maxRows: number;
}

/**
 * Hook to handle drag and drop functionality for timeline overlays.
 * Manages overlay positioning, resizing, and collision detection.
 *
 * @param props.overlays - Array of overlay items to manage
 * @param props.durationInFrames - Total duration of the timeline in frames
 * @param props.onOverlayChange - Callback when an overlay is modified
 * @param props.updateGhostElement - Function to update the ghost element's position during drag
 * @param props.resetDragState - Function to reset the drag state
 * @param props.timelineRef - Reference to the timeline DOM element
 * @param props.dragInfo - Mutable reference holding the current drag state
 * @param props.maxRows - Maximum number of rows in the timeline
 * @returns Object containing drag handler functions
 */
export const useTimelineDragAndDrop = ({
  overlays,
  durationInFrames,
  onOverlayChange,
  updateGhostElement,
  resetDragState,
  timelineRef,
  dragInfo,
  maxRows,
}: UseTimelineDragAndDropProps) => {
  const snapToGrid = useCallback((value: number) => {
    const GRID_SIZE = 1; // Assuming frame-level snapping
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, []);

  // --- Move calculatePush logic back inside ---
  const calculatePush = useCallback(
    (
      draggedItemId: number,
      intendedNewFrom: number,
      intendedNewDuration: number,
      intendedNewRow: number
    ): PushCalculationResult => {
      const intendedNewEnd = intendedNewFrom + intendedNewDuration;
      let canPush = true;
      const pushedItems = new Map<number, number>();

      const otherItemsInTargetRow = overlays
        .filter((o) => o.id !== draggedItemId && o.row === intendedNewRow)
        .sort((a, b) => a.from - b.from);

      const findOverlay = (id: number) => overlays.find((o) => o.id === id);

      const checkAndCalculatePush = (
        itemToCheckId: number,
        requiredPush: number
      ): boolean => {
        const itemToCheck = findOverlay(itemToCheckId);
        if (!itemToCheck) return false;

        const existingPush = pushedItems.get(itemToCheckId) || 0;
        if (
          existingPush !== 0 &&
          Math.sign(existingPush) !== Math.sign(requiredPush)
        ) {
          return false;
        }
        const finalPush =
          Math.abs(requiredPush) > Math.abs(existingPush)
            ? requiredPush
            : existingPush;

        if (finalPush === existingPush && existingPush !== 0) {
          return true;
        }

        const newPushedFrom = itemToCheck.from + finalPush;
        if (newPushedFrom < 0) {
          return false;
        }

        pushedItems.set(itemToCheckId, finalPush);

        for (const other of otherItemsInTargetRow) {
          if (other.id === itemToCheckId) continue;

          const otherExistingPush = pushedItems.get(other.id) || 0;
          const otherCurrentFrom = other.from + otherExistingPush;
          const otherCurrentEnd = otherCurrentFrom + other.durationInFrames;
          const itemToCheckPushedFrom = itemToCheck.from + finalPush;
          const itemToCheckPushedEnd =
            itemToCheckPushedFrom + itemToCheck.durationInFrames;

          let subsequentPushAmount = 0;
          if (
            finalPush > 0 &&
            itemToCheckPushedEnd > otherCurrentFrom &&
            itemToCheckPushedFrom < otherCurrentEnd
          ) {
            subsequentPushAmount = itemToCheckPushedEnd - otherCurrentFrom;
          } else if (
            finalPush < 0 &&
            itemToCheckPushedFrom < otherCurrentEnd &&
            itemToCheckPushedEnd > otherCurrentFrom
          ) {
            subsequentPushAmount = itemToCheckPushedFrom - otherCurrentEnd;
          }

          if (subsequentPushAmount !== 0) {
            if (!checkAndCalculatePush(other.id, subsequentPushAmount)) {
              if (existingPush === 0) {
                pushedItems.delete(itemToCheckId);
              } else {
                pushedItems.set(itemToCheckId, existingPush);
              }
              return false;
            }
          }
        }
        return true;
      };

      for (const other of otherItemsInTargetRow) {
        const otherOriginalFrom = other.from;
        const otherOriginalEnd = other.from + other.durationInFrames;
        const overlaps =
          intendedNewEnd > otherOriginalFrom &&
          intendedNewFrom < otherOriginalEnd;
        if (!overlaps) continue;

        const movingItemCenter = intendedNewFrom + intendedNewDuration / 2;
        const otherItemCenter = otherOriginalFrom + other.durationInFrames / 2;
        let initialPushAmount = 0;
        if (movingItemCenter < otherItemCenter) {
          initialPushAmount = intendedNewEnd - otherOriginalFrom;
        } else {
          initialPushAmount = intendedNewFrom - otherOriginalEnd;
        }

        if (initialPushAmount !== 0) {
          if (!pushedItems.has(other.id)) {
            if (!checkAndCalculatePush(other.id, initialPushAmount)) {
              canPush = false;
              pushedItems.clear();
              break;
            }
          }
        }
      }
      return { canPush, pushedItems };
    },
    [overlays]
  );
  // -------------------------------------------

  const handleDragStart = useCallback(
    (
      overlay: Overlay,
      clientX: number,
      clientY: number,
      action: "move" | "resize-start" | "resize-end"
    ) => {
      if (timelineRef.current) {
        dragInfo.current = {
          id: overlay.id,
          action,
          startX: clientX,
          startY: clientY,
          startPosition: overlay.from,
          startDuration: overlay.durationInFrames,
          startRow: overlay.row || 0,
        };

        // Call updateGhostElement with empty map initially
        updateGhostElement(
          (overlay.from / durationInFrames) * 100,
          (overlay.durationInFrames / durationInFrames) * 100,
          (overlay.row || 0) * (100 / maxRows),
          new Map() // Start with no pushes
        );
      }
    },
    [durationInFrames, maxRows, updateGhostElement]
  );

  const handleDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragInfo.current || !timelineRef.current) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const deltaX = clientX - dragInfo.current.startX;
      const deltaY = clientY - dragInfo.current.startY;

      const rawDeltaTime = (deltaX / timelineRect.width) * durationInFrames;
      const rowHeight = timelineRect.height / maxRows;
      const deltaRow = Math.round(deltaY / rowHeight);

      let newStartFrame: number;
      let newEndFrame: number;
      let newDurationFrames: number;
      let newRow = dragInfo.current.startRow + deltaRow;
      newRow = Math.max(0, Math.min(maxRows - 1, newRow));
      dragInfo.current.currentRow = newRow;

      switch (dragInfo.current.action) {
        case "move":
          newStartFrame = dragInfo.current.startPosition + rawDeltaTime;
          newEndFrame = newStartFrame + dragInfo.current.startDuration;
          break;
        case "resize-start": {
          const originalEndFrame =
            dragInfo.current.startPosition + dragInfo.current.startDuration;
          newStartFrame = dragInfo.current.startPosition + rawDeltaTime;
          newEndFrame = originalEndFrame;
          break;
        }
        case "resize-end": {
          const originalStartFrame = dragInfo.current.startPosition;
          newStartFrame = originalStartFrame;
          newEndFrame =
            originalStartFrame + dragInfo.current.startDuration + rawDeltaTime;
          break;
        }
      }

      // Original snapping and adjustment logic
      const snappedStartFrame = snapToGrid(newStartFrame);
      const snappedEndFrame = snapToGrid(newEndFrame);
      newDurationFrames = Math.max(1, snappedEndFrame - snappedStartFrame);

      let finalStartFrame = snappedStartFrame;
      let finalEndFrame = snappedStartFrame + newDurationFrames;

      if (
        dragInfo.current.action === "resize-start" &&
        finalEndFrame !== snappedEndFrame
      ) {
        finalEndFrame = snappedEndFrame;
        finalStartFrame = Math.min(finalEndFrame - 1, snappedStartFrame);
        newDurationFrames = Math.max(1, finalEndFrame - finalStartFrame);
        finalStartFrame = finalEndFrame - newDurationFrames;
      } else if (
        dragInfo.current.action === "resize-end" &&
        finalStartFrame !== snappedStartFrame
      ) {
        finalStartFrame = snappedStartFrame;
        finalEndFrame = Math.max(finalStartFrame + 1, snappedEndFrame);
        newDurationFrames = Math.max(1, finalEndFrame - finalStartFrame);
        finalEndFrame = finalStartFrame + newDurationFrames;
      }

      finalStartFrame = Math.max(0, finalStartFrame);
      finalEndFrame = Math.max(finalStartFrame + 1, finalEndFrame);
      newDurationFrames = finalEndFrame - finalStartFrame;

      let canPush = true;
      let pushedItems = new Map<number, number>();

      // Conditionally calculate push
      if (ENABLE_PUSH_ON_DRAG) {
        const potentialEndFrom = Math.max(
          0,
          snapToGrid(
            ((finalStartFrame / durationInFrames) * 100 * durationInFrames) /
              100
          ) // More direct frame calculation
        );
        const potentialEndDuration = Math.max(
          1,
          snapToGrid(
            ((newDurationFrames / durationInFrames) * 100 * durationInFrames) /
              100
          ) // More direct frame calculation
        );
        const potentialEndRow = newRow;

        const result = calculatePush(
          dragInfo.current.id,
          potentialEndFrom,
          potentialEndDuration,
          potentialEndRow
        );
        canPush = result.canPush;
        pushedItems = result.pushedItems;
      }

      // Calculate ghost percentages
      const newLeftPercent = (finalStartFrame / durationInFrames) * 100;
      const newWidthPercent = (newDurationFrames / durationInFrames) * 100;
      const finalTop = newRow * (100 / maxRows);

      const finalLeft = Math.max(0, newLeftPercent);
      const finalWidth = Math.max(0.0001, newWidthPercent);

      // Pass potentially empty map if push is disabled or not possible
      updateGhostElement(
        finalLeft,
        finalWidth,
        finalTop,
        canPush ? pushedItems : new Map()
      );

      // Update dragInfo with the calculated percentage values
      dragInfo.current.ghostLeft = finalLeft;
      dragInfo.current.ghostWidth = finalWidth;
      dragInfo.current.ghostTop = finalTop;
    },
    // Re-add calculatePush to dependencies
    [
      durationInFrames,
      maxRows,
      snapToGrid,
      updateGhostElement,
      dragInfo,
      calculatePush,
    ]
  );

  const handleDragEnd = useCallback(() => {
    const currentDragInfo = dragInfo.current;

    if (
      !currentDragInfo ||
      currentDragInfo.ghostLeft === undefined ||
      currentDragInfo.ghostWidth === undefined ||
      currentDragInfo.ghostTop === undefined
    ) {
      resetDragState();
      return;
    }

    const originalOverlay = overlays.find(
      (overlay) => overlay.id === currentDragInfo.id
    );

    if (!originalOverlay) {
      resetDragState();
      return;
    }

    const intendedNewFrom = Math.max(
      0,
      snapToGrid((currentDragInfo.ghostLeft / 100) * durationInFrames)
    );
    const intendedNewDuration = Math.max(
      1,
      snapToGrid((currentDragInfo.ghostWidth / 100) * durationInFrames)
    );
    const intendedNewRow =
      currentDragInfo.currentRow ?? currentDragInfo.startRow;

    // --- Always calculate final push possibility ---
    const { canPush, pushedItems } = calculatePush(
      currentDragInfo.id,
      intendedNewFrom,
      intendedNewDuration,
      intendedNewRow
    );
    // -----------------------------------------------

    const itemsToUpdate: Overlay[] = [];

    // If the final position is valid (no collision or resolvable collision)
    if (canPush) {
      let additionalUpdates = {};
      if (currentDragInfo.action === "resize-start") {
        // ... (resize logic remains same)
        const trimmedFrames = Math.max(
          0,
          intendedNewFrom - currentDragInfo.startPosition
        );
        const trimmedMs = (trimmedFrames / 30) * 1000;

        if (originalOverlay.type === OverlayType.VIDEO) {
          additionalUpdates = {
            videoStartTime: Math.max(
              0,
              (originalOverlay.videoStartTime || 0) + trimmedFrames
            ),
          };
        } else if (originalOverlay.type === OverlayType.SOUND) {
          additionalUpdates = {
            startFromSound: Math.max(
              0,
              (originalOverlay.startFromSound || 0) + trimmedFrames
            ),
          };
        } else if (originalOverlay.type === OverlayType.CAPTION) {
          const adjustTiming = (time: number) => Math.max(0, time - trimmedMs);
          additionalUpdates = {
            captions: originalOverlay.captions.map((caption) => ({
              ...caption,
              startMs: adjustTiming(caption.startMs),
              endMs: adjustTiming(caption.endMs),
              words: caption.words.map((word) => ({
                ...word,
                startMs: adjustTiming(word.startMs),
                endMs: adjustTiming(word.endMs),
              })),
            })),
          };
        }
      }

      // Always add the dragged item update if the position is valid
      itemsToUpdate.push({
        ...originalOverlay,
        ...additionalUpdates,
        from: intendedNewFrom,
        durationInFrames: intendedNewDuration,
        row: intendedNewRow,
      });

      // Always add pushed items update if canPush is true
      // Remove conditional check for ENABLE_PUSH_ON_DRAG here
      pushedItems.forEach((pushDist, itemId) => {
        const pushedOverlay = overlays.find((o) => o.id === itemId);
        if (pushedOverlay) {
          itemsToUpdate.push({
            ...pushedOverlay,
            from: snapToGrid(pushedOverlay.from + pushDist),
          });
        }
      });

      itemsToUpdate.forEach(onOverlayChange);
    } else {
      // If canPush is false (final position is invalid/causes unresolvable collision),
      // always revert the dragged item.
      const startOverlay = overlays.find(
        (overlay) => overlay.id === currentDragInfo.id
      );
      if (startOverlay) {
        onOverlayChange({
          ...startOverlay,
          from: currentDragInfo.startPosition,
          durationInFrames: currentDragInfo.startDuration,
          row: currentDragInfo.startRow,
        });
      }
    }

    resetDragState();
  }, [
    overlays,
    dragInfo,
    durationInFrames,
    maxRows,
    snapToGrid,
    onOverlayChange,
    resetDragState,
    calculatePush,
  ]);

  return {
    /**
     * Initializes drag operation for an overlay
     * @param overlay - The overlay being dragged
     * @param clientX - Initial mouse X position
     * @param clientY - Initial mouse Y position
     * @param action - Type of drag operation: 'move', 'resize-start', or 'resize-end'
     */
    handleDragStart,

    /**
     * Updates overlay position/size during drag
     * @param clientX - Current mouse X position
     * @param clientY - Current mouse Y position
     */
    handleDrag,

    /**
     * Finalizes drag operation and updates overlay state
     * Handles collision detection and adjusts position if needed
     */
    handleDragEnd,
  };
};
