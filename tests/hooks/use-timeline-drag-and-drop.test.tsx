/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useTimelineDragAndDrop } from "../../components/editor/version-7.0.0/hooks/use-timeline-drag-and-drop";
import {
  OverlayType,
  ClipOverlay,
  CaptionOverlay,
} from "../../components/editor/version-7.0.0/types";

describe("useTimelineDragAndDrop", () => {
  // Mock data and helper functions
  const createMockOverlay = (
    id: number,
    from: number,
    durationInFrames: number,
    row: number
  ): ClipOverlay => ({
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
      objectFit: "cover",
    },
  });

  const createMockTimelineRef = () => {
    const div = document.createElement("div");
    // Mock the getBoundingClientRect implementation directly
    div.getBoundingClientRect = () => ({
      width: 1000,
      height: 300,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 300,
      toJSON: () => ({}),
    });
    return { current: div } as React.RefObject<HTMLDivElement>;
  };

  const createMockProps = () => ({
    overlays: [createMockOverlay(1, 0, 100, 0)],
    durationInFrames: 300,
    onOverlayChange: jest.fn(),
    updateGhostElement: jest.fn(),
    resetDragState: jest.fn(),
    timelineRef: createMockTimelineRef(),
    dragInfo: { current: null } as React.MutableRefObject<any>,
    maxRows: 3,
  });

  let mockProps: ReturnType<typeof createMockProps>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProps = createMockProps();
  });

  describe("handleDragStart", () => {
    it("should initialize drag state correctly", () => {
      const { result } = renderHook(() => useTimelineDragAndDrop(mockProps));
      const overlay = createMockOverlay(1, 0, 100, 0);

      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "move");
      });

      expect(mockProps.dragInfo.current).toEqual({
        id: 1,
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 100,
        startRow: 0,
      });

      // Use toBeCloseTo for floating point comparison
      const [left, width, top, pushedItems] =
        mockProps.updateGhostElement.mock.calls[0];
      expect(left).toBe(0);
      expect(width).toBeCloseTo(33.33333333333333, 5);
      expect(top).toBe(0);
      expect(pushedItems).toEqual(new Map());
    });
  });

  describe("handleDrag", () => {
    it("should update ghost element position during move", () => {
      const { result } = renderHook(() => useTimelineDragAndDrop(mockProps));
      const overlay = createMockOverlay(1, 0, 100, 0);

      // Start drag
      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "move");
      });

      // Move right by 100px (10% of timeline width)
      act(() => {
        result.current.handleDrag(200, 50);
      });

      expect(mockProps.updateGhostElement).toHaveBeenLastCalledWith(
        expect.any(Number),
        expect.any(Number),
        0,
        expect.any(Map)
      );
      expect(mockProps.dragInfo.current.ghostLeft).toBeGreaterThan(0);
    });

    it("should handle resize-start action", () => {
      const { result } = renderHook(() => useTimelineDragAndDrop(mockProps));
      const overlay = createMockOverlay(1, 50, 100, 0);

      // Start resize
      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "resize-start");
      });

      // Move left by 50px
      act(() => {
        result.current.handleDrag(50, 50);
      });

      expect(mockProps.updateGhostElement).toHaveBeenCalled();
      expect(mockProps.dragInfo.current.ghostLeft).toBeLessThan(
        (overlay.from / mockProps.durationInFrames) * 100
      );
    });

    it("should handle resize-end action", () => {
      const { result } = renderHook(() => useTimelineDragAndDrop(mockProps));
      const overlay = createMockOverlay(1, 0, 100, 0);

      // Start resize
      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "resize-end");
      });

      // Move right by 50px
      act(() => {
        result.current.handleDrag(150, 50);
      });

      expect(mockProps.updateGhostElement).toHaveBeenCalled();
      expect(mockProps.dragInfo.current.ghostWidth).toBeGreaterThan(
        (overlay.durationInFrames / mockProps.durationInFrames) * 100
      );
    });

    it("should handle vertical movement and row changes", () => {
      const { result } = renderHook(() => useTimelineDragAndDrop(mockProps));
      const overlay = createMockOverlay(1, 0, 100, 0);

      // Start drag
      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "move");
      });

      // Move down by one row (100px)
      act(() => {
        result.current.handleDrag(100, 150);
      });

      expect(mockProps.updateGhostElement).toHaveBeenLastCalledWith(
        expect.any(Number),
        expect.any(Number),
        100 / 3,
        expect.any(Map)
      );
    });
  });

  describe("handleDragEnd", () => {
    it("should update overlay position after move", () => {
      const { result } = renderHook(() => useTimelineDragAndDrop(mockProps));
      const overlay = createMockOverlay(1, 0, 100, 0);

      // Start drag
      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "move");
      });

      // Move right and down
      act(() => {
        result.current.handleDrag(200, 150);
      });

      // End drag
      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockProps.onOverlayChange).toHaveBeenCalled();
      expect(mockProps.resetDragState).toHaveBeenCalled();
    });

    it("should handle video start time adjustment during resize-start", () => {
      const videoOverlay: ClipOverlay = {
        ...createMockOverlay(1, 50, 100, 0),
        videoStartTime: 0,
      };
      const props = {
        ...mockProps,
        overlays: [videoOverlay],
      };

      const { result } = renderHook(() => useTimelineDragAndDrop(props));

      // Start resize
      act(() => {
        result.current.handleDragStart(videoOverlay, 100, 50, "resize-start");
      });

      // Move right to trim start
      act(() => {
        result.current.handleDrag(150, 50);
      });

      // End drag
      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockProps.onOverlayChange).toHaveBeenCalledWith(
        expect.objectContaining({
          videoStartTime: expect.any(Number),
        }),
        expect.any(Number),
        expect.any(Array)
      );
    });

    it("should handle caption timing adjustment during resize-start", () => {
      const captionOverlay: CaptionOverlay = {
        id: 1,
        type: OverlayType.CAPTION,
        from: 50,
        durationInFrames: 100,
        row: 0,
        height: 100,
        width: 100,
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
            confidence: 0.9,
            words: [
              { word: "Test", startMs: 0, endMs: 500, confidence: 0.9 },
              { word: "caption", startMs: 500, endMs: 1000, confidence: 0.9 },
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
      const props = {
        ...mockProps,
        overlays: [captionOverlay],
      };

      const { result } = renderHook(() => useTimelineDragAndDrop(props));

      // Start resize
      act(() => {
        result.current.handleDragStart(captionOverlay, 100, 50, "resize-start");
      });

      // Move right to trim start
      act(() => {
        result.current.handleDrag(150, 50);
      });

      // End drag
      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockProps.onOverlayChange).toHaveBeenCalledWith(
        expect.objectContaining({
          captions: expect.arrayContaining([
            expect.objectContaining({
              startMs: expect.any(Number),
              endMs: expect.any(Number),
            }),
          ]),
        }),
        expect.any(Number),
        expect.any(Array)
      );
    });

    it("should maintain minimum duration during resize operations", () => {
      const { result } = renderHook(() => useTimelineDragAndDrop(mockProps));
      const overlay = createMockOverlay(1, 50, 100, 0);

      // Start resize-end
      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "resize-end");
      });

      // Try to resize to very small duration
      act(() => {
        result.current.handleDrag(0, 50); // Attempt to make duration very small
      });

      // End drag
      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockProps.onOverlayChange).toHaveBeenCalledWith(
        expect.objectContaining({
          durationInFrames: expect.any(Number),
        }),
        expect.any(Number),
        expect.any(Array)
      );

      const lastCall = mockProps.onOverlayChange.mock.lastCall[0];
      expect(lastCall.durationInFrames).toBeGreaterThanOrEqual(1); // Minimum duration should be 1 frame
    });

    it("should handle collision detection and row adjustment", () => {
      const existingOverlay = createMockOverlay(2, 100, 100, 1);
      const props = {
        ...mockProps,
        overlays: [createMockOverlay(1, 0, 100, 0), existingOverlay],
      };

      const { result } = renderHook(() => useTimelineDragAndDrop(props));
      const overlay = props.overlays[0];

      // Start drag
      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "move");
      });

      // Move to position that would overlap with existing overlay
      act(() => {
        result.current.handleDrag(200, 150); // Move to row 1 and overlap position
      });

      // End drag
      act(() => {
        result.current.handleDragEnd();
      });

      // Verify the push logic resulted in two updates
      expect(mockProps.onOverlayChange).toHaveBeenCalledTimes(2);

      // Get the arguments for each call
      const calls = mockProps.onOverlayChange.mock.calls;

      // Find the update for the dragged overlay (id 1) and the pushed overlay (id 2)
      const updateForDragged = calls.find(
        (callArgs) => callArgs[0].id === 1
      )?.[0];
      const updateForPushed = calls.find(
        (callArgs) => callArgs[0].id === 2
      )?.[0];

      // Check final state of dragged overlay (id 1)
      expect(updateForDragged).toBeDefined();
      expect(updateForDragged?.from).toBe(30); // Moved from 0, deltaX resulted in +30 frames
      expect(updateForDragged?.row).toBe(1); // Moved from row 0 to row 1

      // Check final state of pushed overlay (id 2)
      expect(updateForPushed).toBeDefined();
      expect(updateForPushed?.from).toBe(130); // Original 100, pushed by 30 frames
      expect(updateForPushed?.row).toBe(1); // Should remain in row 1

      // Optional: Verify no overlap between the FINAL states
      if (updateForDragged && updateForPushed) {
        const draggedEnd =
          updateForDragged.from + updateForDragged.durationInFrames;
        const pushedEnd =
          updateForPushed.from + updateForPushed.durationInFrames;
        const noOverlap =
          draggedEnd <= updateForPushed.from ||
          updateForDragged.from >= pushedEnd;
        expect(noOverlap).toBeTruthy();
      }
    });

    it("should handle sound overlay timing adjustment during resize-start", () => {
      const soundOverlay = {
        ...createMockOverlay(1, 50, 100, 0),
        type: OverlayType.SOUND,
        src: "/test-audio.mp3",
        startFromSound: 0,
        content: "",
        styles: {
          opacity: 1,
          zIndex: 1,
          volume: 1,
        },
      } as const;
      const props = {
        ...mockProps,
        overlays: [soundOverlay],
      };

      const { result } = renderHook(() => useTimelineDragAndDrop(props));

      // Start resize
      act(() => {
        result.current.handleDragStart(soundOverlay, 100, 50, "resize-start");
      });

      // Move right to trim start
      act(() => {
        result.current.handleDrag(150, 50);
      });

      // End drag
      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockProps.onOverlayChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startFromSound: expect.any(Number),
        }),
        expect.any(Number),
        expect.any(Array)
      );
    });

    it("should handle row boundaries correctly", () => {
      const { result } = renderHook(() => useTimelineDragAndDrop(mockProps));
      const overlay = createMockOverlay(1, 0, 100, 0);

      // Start drag
      act(() => {
        result.current.handleDragStart(overlay, 100, 50, "move");
      });

      // Try to move beyond top row (negative)
      act(() => {
        result.current.handleDrag(100, -50);
      });

      expect(mockProps.updateGhostElement).toHaveBeenLastCalledWith(
        expect.any(Number),
        expect.any(Number),
        0,
        expect.any(Map)
      );

      // Try to move beyond bottom row
      act(() => {
        result.current.handleDrag(100, 500); // Way beyond max rows
      });

      // End drag
      act(() => {
        result.current.handleDragEnd();
      });

      const lastCall = mockProps.onOverlayChange.mock.lastCall[0];
      expect(lastCall.row).toBeLessThan(mockProps.maxRows);
      expect(lastCall.row).toBeGreaterThanOrEqual(0);
    });
  });
});
