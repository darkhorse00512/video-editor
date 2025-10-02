/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useTimelineShortcuts } from "../../components/editor/version-7.0.0/hooks/use-timeline-shortcuts";
import { ZOOM_CONSTRAINTS } from "../../components/editor/version-7.0.0/constants";

describe("useTimelineShortcuts", () => {
  // Mock functions
  const mockHandlePlayPause = jest.fn();
  const mockUndo = jest.fn();
  const mockRedo = jest.fn();
  const mockSetZoomScale = jest.fn();

  // Mock props
  const defaultProps = {
    handlePlayPause: mockHandlePlayPause,
    undo: mockUndo,
    redo: mockRedo,
    canUndo: true,
    canRedo: true,
    zoomScale: 1,
    setZoomScale: mockSetZoomScale,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle play/pause shortcut (Alt + Space)", () => {
    renderHook(() => useTimelineShortcuts(defaultProps));

    // Simulate Alt + Space keypress
    const event = new KeyboardEvent("keydown", {
      key: " ",
      code: "Space",
      altKey: true,
    });
    document.dispatchEvent(event);

    expect(mockHandlePlayPause).toHaveBeenCalled();
  });

  it("should handle undo shortcut (Cmd/Ctrl + Z) when canUndo is true", () => {
    renderHook(() => useTimelineShortcuts(defaultProps));

    // Simulate Cmd/Ctrl + Z keypress
    const event = new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      metaKey: true, // For Mac
    });
    document.dispatchEvent(event);

    expect(mockUndo).toHaveBeenCalled();
  });

  it("should not handle undo shortcut when canUndo is false", () => {
    renderHook(() =>
      useTimelineShortcuts({
        ...defaultProps,
        canUndo: false,
      })
    );

    // Simulate Cmd/Ctrl + Z keypress
    const event = new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      metaKey: true,
    });
    document.dispatchEvent(event);

    expect(mockUndo).not.toHaveBeenCalled();
  });

  it("should handle redo shortcut (Cmd/Ctrl + Shift + Z) when canRedo is true", () => {
    renderHook(() => useTimelineShortcuts(defaultProps));

    // Simulate Cmd/Ctrl + Shift + Z keypress
    const event = new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      metaKey: true,
      shiftKey: true,
    });
    document.dispatchEvent(event);

    expect(mockRedo).toHaveBeenCalled();
  });

  it("should handle alternative redo shortcut (Cmd/Ctrl + Y) when canRedo is true", () => {
    renderHook(() => useTimelineShortcuts(defaultProps));

    // Simulate Cmd/Ctrl + Y keypress
    const event = new KeyboardEvent("keydown", {
      key: "y",
      code: "KeyY",
      metaKey: true,
    });
    document.dispatchEvent(event);

    expect(mockRedo).toHaveBeenCalled();
  });

  it("should not handle redo shortcut when canRedo is false", () => {
    renderHook(() =>
      useTimelineShortcuts({
        ...defaultProps,
        canRedo: false,
      })
    );

    // Simulate Cmd/Ctrl + Shift + Z keypress
    const event = new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      metaKey: true,
      shiftKey: true,
    });
    document.dispatchEvent(event);

    expect(mockRedo).not.toHaveBeenCalled();
  });

  it("should handle zoom in shortcut (Alt + Plus/=)", () => {
    renderHook(() => useTimelineShortcuts(defaultProps));

    // Simulate Alt + Plus keypress
    const event = new KeyboardEvent("keydown", {
      key: "=",
      code: "Equal",
      altKey: true,
    });
    document.dispatchEvent(event);

    expect(mockSetZoomScale).toHaveBeenCalledWith(
      Math.min(1 + ZOOM_CONSTRAINTS.step, ZOOM_CONSTRAINTS.max)
    );
  });

  it("should handle zoom out shortcut (Alt + Minus/-)", () => {
    renderHook(() => useTimelineShortcuts(defaultProps));

    // Simulate Alt + Minus keypress
    const event = new KeyboardEvent("keydown", {
      key: "-",
      code: "Minus",
      altKey: true,
    });
    document.dispatchEvent(event);

    expect(mockSetZoomScale).toHaveBeenCalledWith(
      Math.max(1 - ZOOM_CONSTRAINTS.step, ZOOM_CONSTRAINTS.min)
    );
  });

  it("should not zoom in beyond max constraint", () => {
    renderHook(() =>
      useTimelineShortcuts({
        ...defaultProps,
        zoomScale: ZOOM_CONSTRAINTS.max,
      })
    );

    // Simulate Alt + Plus keypress
    const event = new KeyboardEvent("keydown", {
      key: "=",
      code: "Equal",
      altKey: true,
    });
    document.dispatchEvent(event);

    expect(mockSetZoomScale).toHaveBeenCalledWith(ZOOM_CONSTRAINTS.max);
  });

  it("should not zoom out beyond min constraint", () => {
    renderHook(() =>
      useTimelineShortcuts({
        ...defaultProps,
        zoomScale: ZOOM_CONSTRAINTS.min,
      })
    );

    // Simulate Alt + Minus keypress
    const event = new KeyboardEvent("keydown", {
      key: "-",
      code: "Minus",
      altKey: true,
    });
    document.dispatchEvent(event);

    expect(mockSetZoomScale).toHaveBeenCalledWith(ZOOM_CONSTRAINTS.min);
  });
});
