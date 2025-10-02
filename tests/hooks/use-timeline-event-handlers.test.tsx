import { renderHook } from "@testing-library/react";
import { useTimelineEventHandlers } from "../../components/editor/version-7.0.0/hooks/use-timeline-event-handlers";
import { createRef } from "react";

describe("useTimelineEventHandlers", () => {
  const mockHandleDrag = jest.fn();
  const mockHandleDragEnd = jest.fn();
  const mockSetGhostMarkerPosition = jest.fn();
  const timelineRef = createRef<HTMLDivElement>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle mouse movement when dragging", () => {
    const { result } = renderHook(() =>
      useTimelineEventHandlers({
        handleDrag: mockHandleDrag,
        handleDragEnd: mockHandleDragEnd,
        isDragging: true,
        timelineRef,
        setGhostMarkerPosition: mockSetGhostMarkerPosition,
      })
    );

    const mockEvent = {
      clientX: 100,
      clientY: 200,
    } as React.MouseEvent<HTMLDivElement>;

    result.current.handleMouseMove(mockEvent);

    expect(mockHandleDrag).toHaveBeenCalledWith(100, 200);
    expect(mockSetGhostMarkerPosition).not.toHaveBeenCalled();
  });

  it("should update ghost marker position when not dragging", () => {
    // Mock getBoundingClientRect
    const mockRect = { left: 0, width: 1000 };
    const mockTimelineRef = {
      current: {
        getBoundingClientRect: () => mockRect,
      },
    } as React.RefObject<HTMLDivElement>;

    const { result } = renderHook(() =>
      useTimelineEventHandlers({
        handleDrag: mockHandleDrag,
        handleDragEnd: mockHandleDragEnd,
        isDragging: false,
        timelineRef: mockTimelineRef,
        setGhostMarkerPosition: mockSetGhostMarkerPosition,
      })
    );

    const mockEvent = {
      clientX: 500,
      clientY: 200,
    } as React.MouseEvent<HTMLDivElement>;

    result.current.handleMouseMove(mockEvent);

    expect(mockHandleDrag).not.toHaveBeenCalled();
    expect(mockSetGhostMarkerPosition).toHaveBeenCalledWith(50); // 500/1000 * 100 = 50%
  });

  it("should handle touch movement when dragging", () => {
    const { result } = renderHook(() =>
      useTimelineEventHandlers({
        handleDrag: mockHandleDrag,
        handleDragEnd: mockHandleDragEnd,
        isDragging: true,
        timelineRef,
        setGhostMarkerPosition: mockSetGhostMarkerPosition,
      })
    );

    const mockTouchEvent = {
      touches: [{ clientX: 150, clientY: 250 }],
      changedTouches: [],
      targetTouches: [],
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      getModifierState: () => false,
      preventDefault: () => {},
      stopPropagation: () => {},
      target: document.createElement("div"),
      currentTarget: document.createElement("div"),
      bubbles: true,
      cancelable: true,
      type: "touchmove",
    } as unknown as React.TouchEvent<HTMLDivElement>;

    result.current.handleTouchMove(mockTouchEvent);

    expect(mockHandleDrag).toHaveBeenCalledWith(150, 250);
  });

  it("should not handle touch movement when not dragging", () => {
    const { result } = renderHook(() =>
      useTimelineEventHandlers({
        handleDrag: mockHandleDrag,
        handleDragEnd: mockHandleDragEnd,
        isDragging: false,
        timelineRef,
        setGhostMarkerPosition: mockSetGhostMarkerPosition,
      })
    );

    const mockTouchEvent = {
      touches: [{ clientX: 150, clientY: 250 }],
      changedTouches: [],
      targetTouches: [],
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      getModifierState: () => false,
      preventDefault: () => {},
      stopPropagation: () => {},
      target: document.createElement("div"),
      currentTarget: document.createElement("div"),
      bubbles: true,
      cancelable: true,
      type: "touchmove",
    } as unknown as React.TouchEvent<HTMLDivElement>;

    result.current.handleTouchMove(mockTouchEvent);

    expect(mockHandleDrag).not.toHaveBeenCalled();
  });

  it("should handle timeline mouse leave when dragging", () => {
    const { result } = renderHook(() =>
      useTimelineEventHandlers({
        handleDrag: mockHandleDrag,
        handleDragEnd: mockHandleDragEnd,
        isDragging: true,
        timelineRef,
        setGhostMarkerPosition: mockSetGhostMarkerPosition,
      })
    );

    result.current.handleTimelineMouseLeave();

    expect(mockSetGhostMarkerPosition).toHaveBeenCalledWith(null);
    expect(mockHandleDragEnd).toHaveBeenCalled();
  });

  it("should handle timeline mouse leave when not dragging", () => {
    const { result } = renderHook(() =>
      useTimelineEventHandlers({
        handleDrag: mockHandleDrag,
        handleDragEnd: mockHandleDragEnd,
        isDragging: false,
        timelineRef,
        setGhostMarkerPosition: mockSetGhostMarkerPosition,
      })
    );

    result.current.handleTimelineMouseLeave();

    expect(mockSetGhostMarkerPosition).toHaveBeenCalledWith(null);
    expect(mockHandleDragEnd).not.toHaveBeenCalled();
  });
});
