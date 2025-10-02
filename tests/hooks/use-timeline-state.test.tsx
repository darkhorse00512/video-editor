import { renderHook, act } from "@testing-library/react";
import { useTimelineState } from "../../components/editor/version-7.0.0/hooks/use-timeline-state";
import {
  ClipOverlay,
  OverlayType,
} from "../../components/editor/version-7.0.0/types";

describe("useTimelineState", () => {
  const mockTimelineRef = { current: document.createElement("div") };
  const totalDuration = 1000;
  const maxRows = 5;

  const mockOverlay: ClipOverlay = {
    id: 1,
    from: 100,
    durationInFrames: 200,
    row: 2,
    type: OverlayType.VIDEO,
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    isDragging: false,
    rotation: 0,
    content: "test-content",
    src: "test-video.mp4",
    styles: {
      opacity: 1,
      zIndex: 1,
      transform: "none",
      objectFit: "cover" as const,
    },
  };

  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    expect(result.current.isDragging).toBe(false);
    expect(result.current.draggedItem).toBeNull();
    expect(result.current.ghostElement).toBeNull();
    expect(result.current.ghostMarkerPosition).toBeNull();
  });

  it("should handle drag start correctly", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    act(() => {
      result.current.handleDragStart(mockOverlay, 100, 200, "move");
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.draggedItem).toEqual(mockOverlay);
    expect(result.current.ghostElement).toEqual({
      left: 10, // (100 / 1000) * 100
      width: 20, // (200 / 1000) * 100
      top: 40, // (2 * (100 / 5))
    });
  });

  it("should update ghost element position", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    act(() => {
      result.current.updateGhostElement(15, 25, 45, new Map());
    });

    expect(result.current.ghostElement).toEqual({
      left: 15,
      width: 25,
      top: 45,
    });
  });

  it("should reset drag state", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    // First set up some drag state
    act(() => {
      result.current.handleDragStart(mockOverlay, 100, 200, "move");
    });

    // Then reset it
    act(() => {
      result.current.resetDragState();
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.draggedItem).toBeNull();
    expect(result.current.ghostElement).toBeNull();
  });

  it("should set ghost marker position", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    act(() => {
      result.current.setGhostMarkerPosition(50);
    });

    expect(result.current.ghostMarkerPosition).toBe(50);
  });

  it("should handle resize-start drag action correctly", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    act(() => {
      result.current.handleDragStart(mockOverlay, 100, 200, "resize-start");
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.draggedItem).toEqual(mockOverlay);
    expect(result.current.dragInfo.current?.action).toBe("resize-start");
    expect(result.current.dragInfo.current?.startPosition).toBe(
      mockOverlay.from
    );
    expect(result.current.dragInfo.current?.startDuration).toBe(
      mockOverlay.durationInFrames
    );
  });

  it("should handle resize-end drag action correctly", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    act(() => {
      result.current.handleDragStart(mockOverlay, 100, 200, "resize-end");
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.draggedItem).toEqual(mockOverlay);
    expect(result.current.dragInfo.current?.action).toBe("resize-end");
    expect(result.current.dragInfo.current?.startPosition).toBe(
      mockOverlay.from
    );
    expect(result.current.dragInfo.current?.startDuration).toBe(
      mockOverlay.durationInFrames
    );
  });

  it("should handle overlay with row 0", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    const overlayWithRowZero = { ...mockOverlay, row: 0 };

    act(() => {
      result.current.handleDragStart(overlayWithRowZero, 100, 200, "move");
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.ghostElement?.top).toBe(0); // Row 0 should be at top
    expect(result.current.dragInfo.current?.startRow).toBe(0);
  });

  it("should handle overlay without row property", () => {
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    const overlayWithoutRow: any = { ...mockOverlay, row: undefined };

    act(() => {
      result.current.handleDragStart(overlayWithoutRow, 100, 200, "move");
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.ghostElement?.top).toBe(0); // Should default to row 0
    expect(result.current.dragInfo.current?.startRow).toBe(0);
  });

  it("should not start drag if timelineRef is null", () => {
    const nullTimelineRef = { current: null };
    const { result } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, nullTimelineRef)
    );

    act(() => {
      result.current.handleDragStart(mockOverlay, 100, 200, "move");
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.draggedItem).toBeNull();
    expect(result.current.ghostElement).toBeNull();
  });

  it("should maintain drag info reference between renders", () => {
    const { result, rerender } = renderHook(() =>
      useTimelineState(totalDuration, maxRows, mockTimelineRef)
    );

    act(() => {
      result.current.handleDragStart(mockOverlay, 100, 200, "move");
    });

    const originalDragInfo = result.current.dragInfo.current;

    rerender();

    expect(result.current.dragInfo.current).toBe(originalDragInfo);
  });
});
