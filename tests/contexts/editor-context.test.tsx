import React from "react";
import { act, renderHook } from "@testing-library/react";
import {
  EditorProvider,
  useEditorContext,
} from "@/components/editor/version-7.0.0/contexts/editor-context";
import {
  AspectRatio,
  CaptionStyles,
  OverlayType,
  TextOverlay,
} from "@/components/editor/version-7.0.0/types";

describe("EditorContext", () => {
  // Mock values for the context provider
  const mockPlayerRef = { current: { currentTime: 0 } };
  const defaultOverlay: TextOverlay = {
    id: 1,
    type: OverlayType.TEXT,
    content: "Test",
    durationInFrames: 100,
    from: 0,
    height: 50,
    width: 300,
    row: 0,
    left: 100,
    top: 100,
    isDragging: false,
    rotation: 0,
    styles: {
      fontSize: "16px",
      fontWeight: "normal",
      color: "#000000",
      backgroundColor: "transparent",
      fontFamily: "Arial",
      fontStyle: "normal",
      textDecoration: "none",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      textAlign: "center",
    },
  };

  const mockContextValue = {
    overlays: [defaultOverlay],
    selectedOverlayId: null,
    setSelectedOverlayId: jest.fn(),
    changeOverlay: jest.fn(),
    setOverlays: jest.fn(),
    isPlaying: false,
    currentFrame: 0,
    playerRef: mockPlayerRef,
    playbackRate: 1,
    setPlaybackRate: jest.fn(),
    togglePlayPause: jest.fn(),
    formatTime: jest.fn(),
    handleTimelineClick: jest.fn(),
    handleOverlayChange: jest.fn(),
    addOverlay: jest.fn(),
    deleteOverlay: jest.fn(),
    duplicateOverlay: jest.fn(),
    splitOverlay: jest.fn(),
    aspectRatio: "16:9" as AspectRatio,
    setAspectRatio: jest.fn(),
    playerDimensions: { width: 1920, height: 1080 },
    updatePlayerDimensions: jest.fn(),
    getAspectRatioDimensions: jest.fn(),
    durationInFrames: 300,
    durationInSeconds: 10,
    renderMedia: jest.fn(),
    state: {},
    deleteOverlaysByRow: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: false,
    canRedo: false,
    updateOverlayStyles: jest.fn(),
    resetOverlays: jest.fn(),
    saveProject: jest.fn(),
    renderType: "ssr" as const,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <EditorProvider value={mockContextValue}>{children}</EditorProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useEditorContext());
    }).toThrow("useEditorContext must be used within an EditorProvider");
  });

  it("should provide context values when used within provider", () => {
    const { result } = renderHook(() => useEditorContext(), { wrapper });
    expect(result.current).toEqual(mockContextValue);
  });

  describe("Overlay Management", () => {
    it("should handle overlay selection", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setSelectedOverlayId(1);
      });

      expect(mockContextValue.setSelectedOverlayId).toHaveBeenCalledWith(1);
    });

    it("should handle overlay changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const updatedOverlay = { ...defaultOverlay, text: "Updated" };

      act(() => {
        result.current.changeOverlay(1, updatedOverlay);
      });

      expect(mockContextValue.changeOverlay).toHaveBeenCalledWith(
        1,
        updatedOverlay
      );
    });

    it("should handle overlay addition", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.addOverlay(defaultOverlay);
      });

      expect(mockContextValue.addOverlay).toHaveBeenCalledWith(defaultOverlay);
    });

    it("should handle overlay deletion", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.deleteOverlay(1);
      });

      expect(mockContextValue.deleteOverlay).toHaveBeenCalledWith(1);
    });
  });

  describe("Player Controls", () => {
    it("should handle playback rate changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setPlaybackRate(2);
      });

      expect(mockContextValue.setPlaybackRate).toHaveBeenCalledWith(2);
    });

    it("should handle play/pause toggle", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.togglePlayPause();
      });

      expect(mockContextValue.togglePlayPause).toHaveBeenCalled();
    });
  });

  describe("Video Dimensions", () => {
    it("should handle aspect ratio changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setAspectRatio("4:3" as AspectRatio);
      });

      expect(mockContextValue.setAspectRatio).toHaveBeenCalledWith("4:3");
    });

    it("should handle player dimension updates", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.updatePlayerDimensions(1280, 720);
      });

      expect(mockContextValue.updatePlayerDimensions).toHaveBeenCalledWith(
        1280,
        720
      );
    });
  });

  describe("History Management", () => {
    it("should handle undo/redo operations", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.undo();
        result.current.redo();
      });

      expect(mockContextValue.undo).toHaveBeenCalled();
      expect(mockContextValue.redo).toHaveBeenCalled();
    });
  });

  describe("Style Management", () => {
    it("should handle overlay style updates", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const newStyles: Partial<CaptionStyles> = { fontSize: "16px" };

      act(() => {
        result.current.updateOverlayStyles(1, newStyles);
      });

      expect(mockContextValue.updateOverlayStyles).toHaveBeenCalledWith(
        1,
        newStyles
      );
    });
  });

  describe("Project Management", () => {
    it("should handle project saving", async () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      await act(async () => {
        await result.current.saveProject?.();
      });

      expect(mockContextValue.saveProject).toHaveBeenCalled();
    });

    it("should handle overlay reset", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.resetOverlays();
      });

      expect(mockContextValue.resetOverlays).toHaveBeenCalled();
    });
  });
});
