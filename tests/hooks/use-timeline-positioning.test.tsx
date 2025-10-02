import { renderHook } from "@testing-library/react";
import { useTimelinePositioning } from "../../components/editor/version-7.0.0/hooks/use-timeline-positioning";
import {
  Overlay,
  OverlayType,
} from "../../components/editor/version-7.0.0/types";

describe("useTimelinePositioning", () => {
  const { result } = renderHook(() => useTimelinePositioning());

  describe("findNextAvailablePosition", () => {
    // Test case 1: Empty timeline
    it("should return position 0, row 0 when no overlays exist", () => {
      const position = result.current.findNextAvailablePosition([], 3, 100);
      expect(position).toEqual({ from: 0, row: 0 });
    });

    // Test case 2: Single row with one overlay
    it("should find position after single overlay", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          from: 0,
          durationInFrames: 10,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test.mp4",
          src: "test.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
      ];
      const position = result.current.findNextAvailablePosition(
        overlays,
        1,
        100
      );
      expect(position).toEqual({ from: 10, row: 0 });
    });

    // Test case 3: Multiple rows with first row occupied
    it("should use empty row when available", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          from: 0,
          durationInFrames: 20,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test.mp4",
          src: "test.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
      ];
      const position = result.current.findNextAvailablePosition(
        overlays,
        2,
        100
      );
      expect(position).toEqual({ from: 0, row: 1 });
    });

    // Test case 4: Gap between overlays
    it("should find gap between overlays", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          from: 0,
          durationInFrames: 10,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test1.mp4",
          src: "test1.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 2,
          from: 20,
          durationInFrames: 10,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test2.mp4",
          src: "test2.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
      ];
      const position = result.current.findNextAvailablePosition(
        overlays,
        1,
        100
      );
      expect(position).toEqual({ from: 10, row: 0 });
    });

    // Test case 5: Overlapping across rows
    it("should handle overlapping across rows", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          from: 0,
          durationInFrames: 20,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test1.mp4",
          src: "test1.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 2,
          from: 5,
          durationInFrames: 10,
          row: 1,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test2.mp4",
          src: "test2.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
      ];
      const position = result.current.findNextAvailablePosition(
        overlays,
        2,
        100
      );
      expect(position).toEqual({ from: 20, row: 0 });
    });

    // Test case 6: Timeline fully occupied up to duration
    it("should handle timeline at capacity", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          from: 0,
          durationInFrames: 100,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test1.mp4",
          src: "test1.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 2,
          from: 0,
          durationInFrames: 100,
          row: 1,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test2.mp4",
          src: "test2.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
      ];
      const position = result.current.findNextAvailablePosition(
        overlays,
        2,
        100
      );
      expect(position).toEqual({ from: 100, row: 0 });
    });

    // Test case 7: Uneven row end times
    it("should choose row with earliest end time when no gaps available", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          from: 0,
          durationInFrames: 30,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test1.mp4",
          src: "test1.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 2,
          from: 0,
          durationInFrames: 20,
          row: 1,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test2.mp4",
          src: "test2.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 3,
          from: 0,
          durationInFrames: 40,
          row: 2,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test3.mp4",
          src: "test3.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
      ];
      const position = result.current.findNextAvailablePosition(
        overlays,
        3,
        100
      );
      expect(position).toEqual({ from: 40, row: 2 });
    });

    // Test case 8: Multiple small gaps
    it("should find earliest suitable gap", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          from: 0,
          durationInFrames: 5,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test1.mp4",
          src: "test1.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 2,
          from: 10,
          durationInFrames: 5,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test2.mp4",
          src: "test2.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 3,
          from: 20,
          durationInFrames: 5,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test3.mp4",
          src: "test3.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 4,
          from: 7,
          durationInFrames: 10,
          row: 1,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test4.mp4",
          src: "test4.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
      ];
      const position = result.current.findNextAvailablePosition(
        overlays,
        2,
        100
      );
      expect(position).toEqual({ from: 5, row: 0 });
    });

    // Test case 9: Exact fit between overlays
    it("should handle exact fit scenarios", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          from: 0,
          durationInFrames: 10,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test1.mp4",
          src: "test1.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
        {
          id: 2,
          from: 11,
          durationInFrames: 10,
          row: 0,
          type: OverlayType.VIDEO,
          height: 100,
          width: 100,
          left: 0,
          top: 0,
          isDragging: false,
          rotation: 0,
          content: "test2.mp4",
          src: "test2.mp4",
          styles: { opacity: 1, zIndex: 1 },
        },
      ];
      const position = result.current.findNextAvailablePosition(
        overlays,
        1,
        100
      );
      expect(position).toEqual({ from: 10, row: 0 });
    });
  });
});
