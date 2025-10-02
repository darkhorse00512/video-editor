import { renderHook, act } from "@testing-library/react";
import { useTimelineZoom } from "../../components/editor/version-7.0.0/hooks/use-timeline-zoom";
import { ZOOM_CONSTRAINTS } from "../../components/editor/version-7.0.0/constants";

describe("useTimelineZoom", () => {
  const mockTimelineRef = {
    current: document.createElement("div"),
  };

  // Create a parent element for the timeline
  beforeEach(() => {
    const parentDiv = document.createElement("div");
    parentDiv.appendChild(mockTimelineRef.current);
    Object.defineProperty(parentDiv, "getBoundingClientRect", {
      value: () => ({
        left: 0,
        right: 1000,
        top: 0,
        bottom: 100,
        width: 1000,
        height: 100,
      }),
    });
    Object.defineProperty(parentDiv, "scrollLeft", {
      value: 0,
      writable: true,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

    expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.default);
    expect(result.current.scrollPosition).toBe(0);
  });

  it("should update zoom scale directly", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

    act(() => {
      result.current.setZoomScale(2);
    });

    expect(result.current.zoomScale).toBe(2);
  });

  it("should update scroll position directly", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

    act(() => {
      result.current.setScrollPosition(100);
    });

    expect(result.current.scrollPosition).toBe(100);
  });

  it("should handle wheel zoom with ctrl/cmd key", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

    const wheelEvent = new WheelEvent("wheel", {
      deltaY: -100,
      ctrlKey: true,
      clientX: 500,
    });

    act(() => {
      result.current.handleWheelZoom(wheelEvent);
    });

    expect(result.current.zoomScale).toBeGreaterThan(ZOOM_CONSTRAINTS.default);
  });

  it("should not zoom beyond constraints", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

    // Try to zoom to max
    act(() => {
      // Using handleZoom with a large enough delta to reach max
      result.current.setZoomScale(ZOOM_CONSTRAINTS.max);
    });
    expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.max);

    // Try to zoom beyond max
    act(() => {
      result.current.handleZoom(1, 500);
    });
    expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.max);

    // Try to zoom to min
    act(() => {
      result.current.setZoomScale(ZOOM_CONSTRAINTS.min);
    });
    expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.min);

    // Try to zoom beyond min
    act(() => {
      result.current.handleZoom(-1, 500);
    });
    expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.min);
  });

  it("should ignore wheel events without ctrl/cmd key", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));
    const initialZoom = result.current.zoomScale;

    const wheelEvent = new WheelEvent("wheel", {
      deltaY: -100,
      ctrlKey: false,
      clientX: 500,
    });

    act(() => {
      result.current.handleWheelZoom(wheelEvent);
    });

    expect(result.current.zoomScale).toBe(initialZoom);
  });

  it("should handle programmatic zoom", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));
    const initialZoom = result.current.zoomScale;

    act(() => {
      result.current.handleZoom(1, 500);
    });

    expect(result.current.zoomScale).toBeGreaterThan(initialZoom);
  });
});
