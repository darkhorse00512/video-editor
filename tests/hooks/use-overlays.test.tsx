import { renderHook, act } from "@testing-library/react";
import { useOverlays } from "../../components/editor/version-7.0.0/hooks/use-overlays";
import {
  OverlayType,
  ClipOverlay,
  CaptionOverlay,
} from "../../components/editor/version-7.0.0/types";

describe("useOverlays", () => {
  // Mock data
  const mockCaptionOverlay: CaptionOverlay = {
    id: 0,
    type: OverlayType.CAPTION,
    from: 0,
    row: 0,
    durationInFrames: 100,
    height: 100,
    width: 300,
    left: 0,
    top: 0,
    rotation: 0,
    isDragging: false,
    captions: [
      {
        text: "Test caption",
        startMs: 0,
        endMs: 1000,
        timestampMs: 0,
        confidence: 0.95,
        words: [
          { word: "Test", startMs: 0, endMs: 500, confidence: 0.9 },
          { word: "caption", startMs: 500, endMs: 1000, confidence: 0.95 },
        ],
      },
    ],
    styles: {
      fontSize: "16px",
      fontFamily: "Arial",
      color: "#FFFFFF",
      backgroundColor: "#000000",
      lineHeight: 1.2,
      textAlign: "center",
    },
  };

  const mockVideoOverlay: ClipOverlay = {
    id: 1,
    type: OverlayType.VIDEO,
    from: 0,
    row: 1,
    durationInFrames: 100,
    videoStartTime: 0,
    height: 100,
    width: 100,
    left: 0,
    top: 0,
    rotation: 0,
    isDragging: false,
    content: "Test video",
    src: "test-video.mp4",
    styles: {
      opacity: 1,
      zIndex: 1,
      objectFit: "cover",
    },
  };

  describe("initialization", () => {
    it("should initialize with empty overlays when no initial overlays provided", () => {
      const { result } = renderHook(() => useOverlays());
      expect(result.current.overlays).toEqual([]);
      expect(result.current.selectedOverlayId).toBeNull();
    });

    it("should initialize with provided overlays", () => {
      const { result } = renderHook(() => useOverlays([mockCaptionOverlay]));
      expect(result.current.overlays).toEqual([mockCaptionOverlay]);
    });
  });

  describe("addOverlay", () => {
    it("should add a new overlay with generated ID", () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...overlayWithoutId } = mockCaptionOverlay;
        result.current.addOverlay(overlayWithoutId);
      });

      expect(result.current.overlays).toHaveLength(1);
      expect(result.current.overlays[0].id).toBe(0);
      expect(result.current.selectedOverlayId).toBe(0);
    });

    it("should generate incremental IDs for multiple overlays", () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: idFirst, ...overlay1 } = mockCaptionOverlay;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: idSecond, ...overlay2 } = mockVideoOverlay;
        result.current.addOverlay(overlay1);
        result.current.addOverlay(overlay2);
      });

      expect(result.current.overlays).toHaveLength(2);
      expect(result.current.overlays[0].id).toBe(0);
      expect(result.current.overlays[1].id).toBe(1);
    });
  });

  describe("deleteOverlay", () => {
    it("should remove an overlay by ID", () => {
      const { result } = renderHook(() => useOverlays([mockCaptionOverlay]));

      act(() => {
        result.current.deleteOverlay(0);
      });

      expect(result.current.overlays).toHaveLength(0);
      expect(result.current.selectedOverlayId).toBeNull();
    });

    it("should not affect other overlays when deleting", () => {
      const { result } = renderHook(() =>
        useOverlays([mockCaptionOverlay, mockVideoOverlay])
      );

      act(() => {
        result.current.deleteOverlay(0);
      });

      expect(result.current.overlays).toHaveLength(1);
      expect(result.current.overlays[0].id).toBe(1);
    });
  });

  describe("deleteOverlaysByRow", () => {
    it("should remove all overlays in specified row", () => {
      const overlay1 = { ...mockCaptionOverlay, row: 0 };
      const overlay2 = { ...mockVideoOverlay, row: 0 };
      const overlay3 = { ...mockCaptionOverlay, id: 2, row: 1 };

      const { result } = renderHook(() =>
        useOverlays([overlay1, overlay2, overlay3])
      );

      act(() => {
        result.current.deleteOverlaysByRow(0);
      });

      expect(result.current.overlays).toHaveLength(1);
      expect(result.current.overlays[0].row).toBe(1);
    });
  });

  describe("changeOverlay", () => {
    it("should update overlay properties directly", () => {
      const { result } = renderHook(() => useOverlays([mockCaptionOverlay]));
      const initialWidth = result.current.overlays[0].width;

      act(() => {
        result.current.changeOverlay(0, { width: initialWidth + 100 });
      });

      expect(result.current.overlays[0].width).toBe(initialWidth + 100);
    });

    it("should update overlay properties using function updater", () => {
      const { result } = renderHook(() => useOverlays([mockCaptionOverlay]));
      const initialWidth = result.current.overlays[0].width;

      act(() => {
        result.current.changeOverlay(0, (overlay) => ({
          ...overlay,
          width: overlay.width + 100,
        }));
      });

      expect(result.current.overlays[0].width).toBe(initialWidth + 100);
    });
  });

  describe("duplicateOverlay", () => {
    it("should create a copy of an existing overlay", () => {
      const { result } = renderHook(() => useOverlays([mockCaptionOverlay]));
      const initialLength = result.current.overlays.length;

      act(() => {
        result.current.duplicateOverlay(0);
      });

      expect(result.current.overlays).toHaveLength(initialLength + 1);
      const duplicated =
        result.current.overlays[result.current.overlays.length - 1];
      expect(duplicated).toMatchObject({
        ...mockCaptionOverlay,
        id: 1,
        from: mockCaptionOverlay.durationInFrames,
      });
    });

    it("should handle overlapping positions when duplicating", () => {
      const overlay1 = {
        ...mockCaptionOverlay,
        from: 0,
        durationInFrames: 100,
      };
      const overlay2 = {
        ...mockCaptionOverlay,
        id: 1,
        from: 100,
        durationInFrames: 100,
      };
      const { result } = renderHook(() => useOverlays([overlay1, overlay2]));

      act(() => {
        result.current.duplicateOverlay(0);
      });

      expect(result.current.overlays).toHaveLength(3);
      // Due to overlap avoidance logic, it should position at 201 (after existing overlays + 1 frame gap)
      expect(result.current.overlays[2].from).toBe(201);
    });
  });

  describe("splitOverlay", () => {
    it("should split a video overlay at specified frame", () => {
      const { result } = renderHook(() => useOverlays([mockVideoOverlay]));
      const videoOverlay = result.current.overlays[0];
      const splitFrame = Math.floor(videoOverlay.durationInFrames / 2);

      act(() => {
        result.current.splitOverlay(videoOverlay.id, splitFrame);
      });

      expect(result.current.overlays).toHaveLength(2);
      expect(result.current.overlays[0].durationInFrames).toBe(splitFrame);
      expect(result.current.overlays[1].from).toBe(splitFrame);
      expect(result.current.overlays[1].durationInFrames).toBe(
        videoOverlay.durationInFrames - splitFrame
      );
    });

    it("should split a caption overlay and properly distribute words", () => {
      const fps = 30;
      const msPerFrame = 1000 / fps;
      const captionOverlay = {
        ...mockCaptionOverlay,
        captions: [
          {
            text: "First caption",
            startMs: 0,
            endMs: 2000,
            timestampMs: 0,
            confidence: 0.95,
            words: [
              {
                word: "First",
                startMs: 0,
                endMs: msPerFrame * 50,
                confidence: 0.9,
              },
              {
                word: "caption",
                startMs: msPerFrame * 50,
                endMs: msPerFrame * 100,
                confidence: 0.95,
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useOverlays([captionOverlay]));
      const splitFrame = 50; // Exactly half of durationInFrames: 100

      act(() => {
        result.current.splitOverlay(0, splitFrame);
      });

      expect(result.current.overlays).toHaveLength(2);
      const firstHalf = result.current.overlays[0] as CaptionOverlay;
      const secondHalf = result.current.overlays[1] as CaptionOverlay;

      // Check first half
      expect(firstHalf.type).toBe(OverlayType.CAPTION);
      expect(firstHalf.captions).toHaveLength(1);
      expect(firstHalf.captions[0].words).toHaveLength(1);
      expect(firstHalf.captions[0].words[0].word).toBe("First");

      // Check second half
      expect(secondHalf.type).toBe(OverlayType.CAPTION);
      expect(secondHalf.captions).toHaveLength(1);
      expect(secondHalf.captions[0].words).toHaveLength(1);
      expect(secondHalf.captions[0].words[0].word).toBe("caption");
    });

    it("should not split overlay at invalid frame points", () => {
      const { result } = renderHook(() => useOverlays([mockVideoOverlay]));
      const initialLength = result.current.overlays.length;
      const videoOverlay = result.current.overlays[0];

      act(() => {
        // Try to split before start
        result.current.splitOverlay(videoOverlay.id, videoOverlay.from - 1);
      });
      expect(result.current.overlays).toHaveLength(initialLength);

      act(() => {
        // Try to split after end
        result.current.splitOverlay(
          videoOverlay.id,
          videoOverlay.from + videoOverlay.durationInFrames + 1
        );
      });
      expect(result.current.overlays).toHaveLength(initialLength);
    });
  });

  describe("updateOverlayStyles", () => {
    it("should update caption styles", () => {
      const { result } = renderHook(() => useOverlays([mockCaptionOverlay]));

      act(() => {
        result.current.updateOverlayStyles(0, { fontSize: "24px" });
      });

      const captionOverlay = result.current.overlays[0] as CaptionOverlay;
      expect(captionOverlay.styles?.fontSize).toBe("24px");
    });

    it("should not affect non-caption overlays", () => {
      const { result } = renderHook(() => useOverlays([mockVideoOverlay]));

      act(() => {
        result.current.updateOverlayStyles(1, { fontSize: "24px" });
      });

      expect(result.current.overlays[0]).toEqual(mockVideoOverlay);
    });
  });

  describe("resetOverlays", () => {
    it("should clear all overlays and selection", () => {
      const { result } = renderHook(() =>
        useOverlays([mockCaptionOverlay, mockVideoOverlay])
      );
      expect(result.current.overlays.length).toBeGreaterThan(0);

      act(() => {
        result.current.resetOverlays();
      });

      expect(result.current.overlays).toHaveLength(0);
      expect(result.current.selectedOverlayId).toBeNull();
    });
  });
});
