/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useOverlayOverlapCheck } from "../../components/editor/version-7.0.0/hooks/use-overlay-overlap-check";
import {
  Overlay,
  OverlayType,
} from "../../components/editor/version-7.0.0/types";

describe("useOverlayOverlapCheck", () => {
  // Helper function to create mock overlays for testing
  const createMockOverlay = (
    id: number,
    from: number,
    durationInFrames: number,
    row: number
  ): Overlay => ({
    id,
    type: OverlayType.VIDEO,
    from,
    durationInFrames,
    row,
    src: "/test-video.mp4",
    height: 100,
    width: 100,
    left: 0,
    top: 0,
    rotation: 0,
    isDragging: false,
    content: "",
    styles: {
      opacity: 1,
      zIndex: 1,
    },
  });

  describe("checkOverlap", () => {
    it("should return false when there are no overlays in the same row", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 100, 1);
      const currentOverlays = [createMockOverlay(2, 0, 100, 2)];

      const hasOverlap = result.current.checkOverlap(overlay, currentOverlays);
      expect(hasOverlap).toBe(false);
    });

    it("should return false when overlays are adjacent but not overlapping", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 100, 50, 1);
      const currentOverlays = [createMockOverlay(2, 0, 98, 1)]; // Gap of 2 frames

      const hasOverlap = result.current.checkOverlap(overlay, currentOverlays);
      expect(hasOverlap).toBe(false);
    });

    it("should detect overlap when start time overlaps with existing overlay", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 50, 100, 1);
      const currentOverlays = [createMockOverlay(2, 0, 100, 1)];

      const hasOverlap = result.current.checkOverlap(overlay, currentOverlays);
      expect(hasOverlap).toBe(true);
    });

    it("should detect overlap when end time overlaps with existing overlay", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 150, 1);
      const currentOverlays = [createMockOverlay(2, 100, 100, 1)];

      const hasOverlap = result.current.checkOverlap(overlay, currentOverlays);
      expect(hasOverlap).toBe(true);
    });

    it("should detect overlap when new overlay encompasses existing overlay", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 200, 1);
      const currentOverlays = [createMockOverlay(2, 50, 50, 1)];

      const hasOverlap = result.current.checkOverlap(overlay, currentOverlays);
      expect(hasOverlap).toBe(true);
    });

    it("should ignore overlays with same ID", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 100, 1);
      const currentOverlays = [createMockOverlay(1, 0, 100, 1)]; // Same ID

      const hasOverlap = result.current.checkOverlap(overlay, currentOverlays);
      expect(hasOverlap).toBe(false);
    });
  });

  describe("checkAndAdjustOverlaps", () => {
    it("should return empty result when there are no overlaps", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 100, 1);
      const currentOverlays = [createMockOverlay(2, 150, 100, 1)];

      const { hasOverlap, adjustedOverlays } =
        result.current.checkAndAdjustOverlaps(overlay, currentOverlays);

      expect(hasOverlap).toBe(false);
      expect(adjustedOverlays).toEqual([]);
    });

    it("should adjust single overlapping overlay", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 100, 1);
      const currentOverlays = [createMockOverlay(2, 50, 100, 1)];

      const { hasOverlap, adjustedOverlays } =
        result.current.checkAndAdjustOverlaps(overlay, currentOverlays);

      expect(hasOverlap).toBe(true);
      expect(adjustedOverlays).toHaveLength(1);
      expect(adjustedOverlays[0].from).toBe(101); // Original overlay end (100) + gap (1)
    });

    it("should adjust multiple overlapping overlays in sequence", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 100, 1);
      const currentOverlays = [
        createMockOverlay(2, 50, 50, 1),
        createMockOverlay(3, 75, 50, 1),
      ];

      const { hasOverlap, adjustedOverlays } =
        result.current.checkAndAdjustOverlaps(overlay, currentOverlays);

      expect(hasOverlap).toBe(true);
      expect(adjustedOverlays).toHaveLength(2);
      expect(adjustedOverlays[0].from).toBe(101); // First overlay starts after main overlay
      expect(adjustedOverlays[1].from).toBe(152); // Second overlay starts after first adjusted overlay
    });

    it("should maintain relative order of overlays when adjusting", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 100, 1);
      const currentOverlays = [
        createMockOverlay(3, 80, 50, 1), // Later overlay
        createMockOverlay(2, 50, 50, 1), // Earlier overlay
      ];

      const { adjustedOverlays } = result.current.checkAndAdjustOverlaps(
        overlay,
        currentOverlays
      );

      expect(adjustedOverlays[0].id).toBe(2); // Earlier overlay should be adjusted first
      expect(adjustedOverlays[1].id).toBe(3);
      expect(adjustedOverlays[0].from).toBeLessThan(adjustedOverlays[1].from);
    });

    it("should only adjust overlays in the same row", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 100, 1);
      const currentOverlays = [
        createMockOverlay(2, 50, 50, 1), // Same row
        createMockOverlay(3, 50, 50, 2), // Different row
      ];

      const { adjustedOverlays } = result.current.checkAndAdjustOverlaps(
        overlay,
        currentOverlays
      );

      expect(adjustedOverlays).toHaveLength(1);
      expect(adjustedOverlays[0].id).toBe(2);
    });

    it("should handle edge case with zero duration overlays", () => {
      const { result } = renderHook(() => useOverlayOverlapCheck());
      const overlay = createMockOverlay(1, 0, 0, 1);
      const currentOverlays = [createMockOverlay(2, 0, 0, 1)];

      const { hasOverlap, adjustedOverlays } =
        result.current.checkAndAdjustOverlaps(overlay, currentOverlays);

      expect(hasOverlap).toBe(true);
      expect(adjustedOverlays).toHaveLength(1);
      expect(adjustedOverlays[0].from).toBe(1); // Should still maintain gap
    });
  });
});
