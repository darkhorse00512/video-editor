import { useState, useEffect, RefObject } from "react";
import { Overlay } from "../types"; // Adjust path as needed
import { SNAPPING_CONFIG } from "../constants"; // Import snapping config

// Define the GhostElement type based on its usage in Timeline.tsx
// Consider defining this in a shared types file if used elsewhere
type GhostElement = {
  left: number; // Position from left as percentage
  width: number; // Width as percentage
  top: number; // Vertical position
} | null;

// Define the structure expected in dragInfo.current
// Adjust if the actual structure is different
type DragInfo = {
  action: "move" | "resize-start" | "resize-end";
  // include other properties if the hook needs them
} | null;

// Define the snap target type
interface SnapTarget {
  targetFrame: number; // The frame of the edge we are aligning TO
  ghostEdge: "start" | "end"; // Which edge of the GHOST is close?
}

interface UseTimelineSnappingProps {
  isDragging: boolean;
  ghostElement: GhostElement;
  draggedItem: Overlay | null;
  dragInfo: RefObject<DragInfo>; // Pass the ref containing action
  overlays: Overlay[];
  durationInFrames: number;
  visibleRows: number;
  snapThreshold?: number; // Threshold now defaults using the constant
}

interface UseTimelineSnappingResult {
  alignmentLines: number[];
  snappedGhostElement: GhostElement;
}

export const useTimelineSnapping = ({
  isDragging,
  ghostElement,
  draggedItem,
  dragInfo,
  overlays,
  durationInFrames,
  visibleRows,
  snapThreshold = SNAPPING_CONFIG.thresholdFrames, // Use constant for default
}: UseTimelineSnappingProps): UseTimelineSnappingResult => {
  const [alignmentLines, setAlignmentLines] = useState<number[]>([]);
  const [snapTargets, setSnapTargets] = useState<SnapTarget[]>([]);

  // Effect 1: Calculate Potential Snap Targets and Alignment Lines
  useEffect(() => {
    // Ensure dragInfo.current exists before accessing action
    if (
      SNAPPING_CONFIG.enableVerticalSnapping && // Check if vertical snapping is enabled
      isDragging &&
      ghostElement &&
      draggedItem &&
      visibleRows > 0 &&
      dragInfo.current
    ) {
      const singleRowHeightPercentage = 100 / visibleRows;
      const targetRowIndex = Math.min(
        visibleRows - 1,
        Math.max(0, Math.floor(ghostElement.top / singleRowHeightPercentage))
      );

      const ghostStartFrame = (ghostElement.left / 100) * durationInFrames;
      const ghostEndFrame =
        ((ghostElement.left + ghostElement.width) / 100) * durationInFrames;

      const newAlignmentLines = new Set<number>();
      const newSnapTargets: SnapTarget[] = [];

      overlays.forEach((overlay) => {
        const isAdjacentRow =
          overlay.row === targetRowIndex - 1 ||
          overlay.row === targetRowIndex + 1;
        if (overlay.id !== draggedItem.id && isAdjacentRow) {
          const otherStartFrame = overlay.from;
          const otherEndFrame = overlay.from + overlay.durationInFrames;

          if (Math.abs(ghostStartFrame - otherStartFrame) <= snapThreshold) {
            newAlignmentLines.add(otherStartFrame);
            newSnapTargets.push({
              targetFrame: otherStartFrame,
              ghostEdge: "start",
            });
          }
          if (Math.abs(ghostStartFrame - otherEndFrame) <= snapThreshold) {
            newAlignmentLines.add(otherEndFrame);
            newSnapTargets.push({
              targetFrame: otherEndFrame,
              ghostEdge: "start",
            });
          }
          if (Math.abs(ghostEndFrame - otherStartFrame) <= snapThreshold) {
            newAlignmentLines.add(otherStartFrame);
            newSnapTargets.push({
              targetFrame: otherStartFrame,
              ghostEdge: "end",
            });
          }
          if (Math.abs(ghostEndFrame - otherEndFrame) <= snapThreshold) {
            newAlignmentLines.add(otherEndFrame);
            newSnapTargets.push({
              targetFrame: otherEndFrame,
              ghostEdge: "end",
            });
          }
        }
      });

      const currentLines = Array.from(newAlignmentLines).sort((a, b) => a - b);
      if (JSON.stringify(currentLines) !== JSON.stringify(alignmentLines)) {
        setAlignmentLines(currentLines);
      }
      if (JSON.stringify(newSnapTargets) !== JSON.stringify(snapTargets)) {
        setSnapTargets(newSnapTargets);
      }

      if (!SNAPPING_CONFIG.enableVerticalSnapping) {
        if (alignmentLines.length > 0) setAlignmentLines([]);
        if (snapTargets.length > 0) setSnapTargets([]);
        return;
      }
    } else {
      if (alignmentLines.length > 0) setAlignmentLines([]);
      if (snapTargets.length > 0) setSnapTargets([]);
    }
  }, [
    SNAPPING_CONFIG.enableVerticalSnapping,
    isDragging,
    ghostElement,
    draggedItem,
    overlays,
    durationInFrames,
    alignmentLines,
    snapTargets,
    snapThreshold,
    visibleRows,
    dragInfo, // Add dragInfo to deps
  ]);

  // Effect 2: Calculate the Snapped Ghost Element based on Action
  const [snappedGhostElement, setSnappedGhostElement] =
    useState<GhostElement>(null);

  useEffect(() => {
    // Added check for dragInfo.current here as well
    if (
      !SNAPPING_CONFIG.enableVerticalSnapping || // Check if vertical snapping is enabled
      !isDragging ||
      !ghostElement ||
      !dragInfo.current ||
      snapTargets.length === 0
    ) {
      if (snappedGhostElement !== ghostElement) {
        setSnappedGhostElement(ghostElement);
      }
      return;
    }

    const action = dragInfo.current.action;
    const rawGhostStartFrame = (ghostElement.left / 100) * durationInFrames;
    const rawGhostEndFrame =
      ((ghostElement.left + ghostElement.width) / 100) * durationInFrames;
    const rawGhostDurationFrames = Math.round(
      rawGhostEndFrame - rawGhostStartFrame
    );

    let bestSnapDiff = Infinity;
    let bestSnapTarget: SnapTarget | null | any = null;

    snapTargets.forEach((target: SnapTarget) => {
      let diff = Infinity;
      if (action === "move" || action === "resize-start") {
        diff = Math.min(
          diff,
          Math.abs(rawGhostStartFrame - target.targetFrame)
        );
      }
      if (action === "move" || action === "resize-end") {
        diff = Math.min(diff, Math.abs(rawGhostEndFrame - target.targetFrame));
      }
      if (diff < bestSnapDiff && diff <= snapThreshold) {
        bestSnapDiff = diff;
        bestSnapTarget = target;
      }
    });

    if (bestSnapTarget !== null) {
      let snappedStartFrame: number | null = null;
      let snappedEndFrame: number | null = null;
      let snappedDurationFrames = Math.max(1, rawGhostDurationFrames);
      const targetFrame = bestSnapTarget.targetFrame;

      if (action === "move") {
        if (Math.abs(rawGhostStartFrame - targetFrame) <= snapThreshold) {
          snappedStartFrame = Math.round(targetFrame);
        } else {
          snappedEndFrame = Math.round(targetFrame);
          snappedStartFrame = snappedEndFrame - snappedDurationFrames;
        }
        if (snappedEndFrame === null && snappedStartFrame !== null) {
          snappedEndFrame = snappedStartFrame + snappedDurationFrames;
        }
      } else if (action === "resize-start") {
        snappedStartFrame = Math.round(targetFrame);
        snappedEndFrame = Math.round(
          rawGhostStartFrame + rawGhostDurationFrames
        );
        snappedDurationFrames = Math.max(
          1,
          snappedEndFrame - snappedStartFrame
        );
        if (
          snappedDurationFrames === 1 &&
          snappedEndFrame <= snappedStartFrame
        ) {
          snappedEndFrame = snappedStartFrame + 1;
        }
      } else if (action === "resize-end") {
        snappedEndFrame = Math.round(targetFrame);
        snappedStartFrame = Math.round(rawGhostStartFrame);
        snappedDurationFrames = Math.max(
          1,
          snappedEndFrame - snappedStartFrame
        );
        if (
          snappedDurationFrames === 1 &&
          snappedStartFrame >= snappedEndFrame
        ) {
          snappedStartFrame = snappedEndFrame - 1;
        }
      }

      if (snappedStartFrame === null) {
        // Use raw ghost if calculation failed
        if (snappedGhostElement !== ghostElement)
          setSnappedGhostElement(ghostElement);
        return;
      }

      const snappedLeftPercent = (snappedStartFrame / durationInFrames) * 100;
      const snappedWidthPercent =
        (snappedDurationFrames / durationInFrames) * 100;
      const finalLeft = Math.max(0, snappedLeftPercent);
      const finalWidth = Math.max(0.0001, snappedWidthPercent);

      const newGhost: GhostElement = {
        // Ensure newGhost always has top, even if original ghostElement was null briefly
        // Use a default or handle null case more robustly if ghostElement can be null initially
        top: ghostElement.top,
        left: finalLeft,
        width: finalWidth,
      };

      const tolerance = 0.001;
      const isDifferent =
        !snappedGhostElement ||
        Math.abs(newGhost.left - snappedGhostElement.left) > tolerance ||
        Math.abs(newGhost.width - snappedGhostElement.width) > tolerance ||
        newGhost.top !== snappedGhostElement.top;

      if (isDifferent) {
        setSnappedGhostElement(newGhost);
      }
    } else {
      if (snappedGhostElement !== ghostElement) {
        setSnappedGhostElement(ghostElement);
      }
    }
  }, [
    SNAPPING_CONFIG.enableVerticalSnapping,
    ghostElement,
    snapTargets,
    isDragging,
    durationInFrames,
    snapThreshold,
    dragInfo,
    snappedGhostElement, // Keep snappedGhostElement in deps for comparison safety
  ]);

  return { alignmentLines, snappedGhostElement };
};
