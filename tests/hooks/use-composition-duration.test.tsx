import { renderHook } from "@testing-library/react";
import { useCompositionDuration } from "../../components/editor/version-7.0.0/hooks/use-composition-duration";
import {
  Overlay,
  OverlayType,
} from "../../components/editor/version-7.0.0/types";
import { FPS } from "../../components/editor/version-7.0.0/constants";

describe("useCompositionDuration", () => {
  it("should return minimum duration when no overlays are provided", () => {
    const { result } = renderHook(() => useCompositionDuration([]));

    expect(result.current.durationInFrames).toBe(FPS * 1); // 1 second minimum
    expect(result.current.durationInSeconds).toBe(1);
    expect(result.current.fps).toBe(FPS);
  });

  it("should calculate correct duration based on overlays", () => {
    const overlays: Overlay[] = [
      {
        from: 0,
        durationInFrames: 30,
        id: 1,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        isDragging: false,
        rotation: 0,
        row: 0,
        content: "test-video-1.mp4",
        src: "test-video-1.mp4",
        styles: {
          opacity: 1,
          zIndex: 1,
          transform: "none",
        },
      },
      {
        from: 20,
        durationInFrames: 40,
        id: 2,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        isDragging: false,
        rotation: 0,
        row: 1,
        content: "test-video-2.mp4",
        src: "test-video-2.mp4",
        styles: {
          opacity: 1,
          zIndex: 1,
          transform: "none",
        },
      },
    ];

    const { result } = renderHook(() => useCompositionDuration(overlays));

    // Second overlay starts at 20 and lasts 40 frames, so total should be 60
    expect(result.current.durationInFrames).toBe(60);
    expect(result.current.durationInSeconds).toBe(60 / FPS);
  });

  it("should handle overlapping overlays correctly", () => {
    const overlays: Overlay[] = [
      {
        from: 0,
        durationInFrames: 50,
        id: 3,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        isDragging: false,
        rotation: 0,
        row: 0,
        content: "test-video-3.mp4",
        src: "test-video-3.mp4",
        styles: {
          opacity: 1,
          zIndex: 1,
          transform: "none",
        },
      },
      {
        from: 30,
        durationInFrames: 20,
        id: 4,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        isDragging: false,
        rotation: 0,
        row: 1,
        content: "test-video-4.mp4",
        src: "test-video-4.mp4",
        styles: {
          opacity: 1,
          zIndex: 1,
          transform: "none",
        },
      },
    ];

    const { result } = renderHook(() => useCompositionDuration(overlays));

    expect(result.current.durationInFrames).toBe(50);
    expect(result.current.durationInSeconds).toBe(50 / FPS);
  });

  it("should provide correct utility functions", () => {
    const overlays: Overlay[] = [
      {
        from: 0,
        durationInFrames: 60,
        id: 5,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        isDragging: false,
        rotation: 0,
        row: 0,
        content: "test-video-5.mp4",
        src: "test-video-5.mp4",
        styles: {
          opacity: 1,
          zIndex: 1,
          transform: "none",
        },
      },
    ];

    const { result } = renderHook(() => useCompositionDuration(overlays));

    expect(result.current.getDurationInFrames()).toBe(60);
    expect(result.current.getDurationInSeconds()).toBe(60 / FPS);
  });
});
