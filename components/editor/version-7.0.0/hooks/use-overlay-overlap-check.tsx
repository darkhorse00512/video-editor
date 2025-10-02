import { useCallback } from "react";
import { Overlay } from "../types";

interface ShiftResult {
  hasOverlap: boolean;
  adjustedOverlays: Overlay[];
}

/**
 * Hook that provides functions to check and handle overlay overlaps
 * Can be used for any operation that modifies overlay position or duration
 */
export const useOverlayOverlapCheck = () => {
  /**
   * Checks if an overlay would overlap with existing overlays in the same row
   * @param overlay - The overlay to check (can be new or modified existing overlay)
   * @param currentOverlays - Current state of all overlays
   * @returns boolean indicating if there would be an overlap
   */
  const checkOverlap = useCallback(
    (overlay: Overlay, currentOverlays: Overlay[]): boolean => {
      // Get all other overlays in the same row (excluding self if it's an existing overlay)
      const overlaysInRow = currentOverlays.filter(
        (o) => o.row === overlay.row && o.id !== overlay.id
      );

      // Check for overlaps with any existing overlay
      return overlaysInRow.some((existingOverlay) => {
        // Skip if this is the same overlay (could happen with duplicates that haven't been saved yet)
        if (existingOverlay.id === overlay.id) return false;

        const overlayEnd = overlay.from + overlay.durationInFrames;
        const existingEnd =
          existingOverlay.from + existingOverlay.durationInFrames;

        // Add a small buffer to prevent exact edge alignments from triggering overlap
        const buffer = 1;

        // Check all possible overlap scenarios with buffer
        return (
          (overlay.from >= existingOverlay.from - buffer &&
            overlay.from < existingEnd + buffer) || // Start overlaps
          (overlayEnd > existingOverlay.from - buffer &&
            overlayEnd <= existingEnd + buffer) || // End overlaps
          (overlay.from <= existingOverlay.from + buffer &&
            overlayEnd >= existingEnd - buffer) // Encompasses
        );
      });
    },
    []
  );

  /**
   * Checks for overlaps and calculates new positions for affected overlays
   * @param overlay - The overlay to check and make space for
   * @param currentOverlays - Current state of all overlays
   * @returns Object containing overlap status and adjusted overlays if needed
   */
  const checkAndAdjustOverlaps = useCallback(
    (overlay: Overlay, currentOverlays: Overlay[]): ShiftResult => {
      // Get fresh overlays from the current state, excluding any with matching IDs
      const overlaysInRow = currentOverlays.filter(
        (o) => o.row === overlay.row && o.id !== overlay.id
      );

      // If no overlays in row or no overlap, return early
      if (
        overlaysInRow.length === 0 ||
        !checkOverlap(overlay, currentOverlays)
      ) {
        return {
          hasOverlap: false,
          adjustedOverlays: [],
        };
      }

      // Sort overlays by start position
      const sortedOverlays = [...overlaysInRow].sort((a, b) => a.from - b.from);

      // Find overlapping overlays and calculate required shifts
      const overlayEnd = overlay.from + overlay.durationInFrames;
      const adjustedOverlays: Overlay[] = [];
      let currentPosition = overlayEnd;

      // Add a small gap between overlays to prevent exact edge alignments
      const gap = 1;

      sortedOverlays.forEach((existingOverlay) => {
        const existingEnd =
          existingOverlay.from + existingOverlay.durationInFrames;

        // Check if this overlay needs to be shifted, using the same logic as checkOverlap
        if (
          (existingOverlay.from >= overlay.from - gap &&
            existingOverlay.from < overlayEnd + gap) || // Start overlaps
          (existingEnd > overlay.from - gap &&
            existingEnd <= overlayEnd + gap) || // End overlaps
          (existingOverlay.from <= overlay.from + gap &&
            existingEnd >= overlayEnd - gap) // Encompasses
        ) {
          const adjustedOverlay = {
            ...existingOverlay,
            from: currentPosition + gap,
          };
          adjustedOverlays.push(adjustedOverlay);
          currentPosition =
            adjustedOverlay.from + adjustedOverlay.durationInFrames;
        }
      });

      return {
        hasOverlap: true,
        adjustedOverlays,
      };
    },
    [checkOverlap]
  );

  return {
    checkOverlap,
    checkAndAdjustOverlaps,
  };
};
