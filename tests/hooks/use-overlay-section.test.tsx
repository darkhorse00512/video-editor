/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useOverlaySelection } from "../../components/editor/version-7.0.0/hooks/use-overlay-section";
import { OverlayType } from "../../components/editor/version-7.0.0/types";

// Mock the context hooks
const mockSetSelectedOverlayId = jest.fn();
const mockSetActivePanel = jest.fn();

jest.mock(
  "../../components/editor/version-7.0.0/contexts/editor-context",
  () => ({
    useEditorContext: () => ({
      setSelectedOverlayId: mockSetSelectedOverlayId,
    }),
  })
);

jest.mock(
  "../../components/editor/version-7.0.0/contexts/sidebar-context",
  () => ({
    useSidebar: () => ({
      setActivePanel: mockSetActivePanel,
    }),
  })
);

describe("useOverlaySelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle text overlay selection", () => {
    const { result } = renderHook(() => useOverlaySelection());
    const mockTextOverlay = {
      id: "text-1",
      type: OverlayType.TEXT,
    };

    result.current.handleOverlaySelect(mockTextOverlay as any);

    expect(mockSetSelectedOverlayId).toHaveBeenCalledWith("text-1");
    expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.TEXT);
  });

  it("should handle video overlay selection", () => {
    const { result } = renderHook(() => useOverlaySelection());
    const mockVideoOverlay = {
      id: "video-1",
      type: OverlayType.VIDEO,
    };

    result.current.handleOverlaySelect(mockVideoOverlay as any);

    expect(mockSetSelectedOverlayId).toHaveBeenCalledWith("video-1");
    expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.VIDEO);
  });

  it("should handle image overlay selection", () => {
    const { result } = renderHook(() => useOverlaySelection());
    const mockImageOverlay = {
      id: "image-1",
      type: OverlayType.IMAGE,
    };

    result.current.handleOverlaySelect(mockImageOverlay as any);

    expect(mockSetSelectedOverlayId).toHaveBeenCalledWith("image-1");
    expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.IMAGE);
  });

  it("should handle sticker overlay selection", () => {
    const { result } = renderHook(() => useOverlaySelection());
    const mockStickerOverlay = {
      id: "sticker-1",
      type: OverlayType.STICKER,
    };

    result.current.handleOverlaySelect(mockStickerOverlay as any);

    expect(mockSetSelectedOverlayId).toHaveBeenCalledWith("sticker-1");
    expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.STICKER);
  });

  it("should handle sound overlay selection", () => {
    const { result } = renderHook(() => useOverlaySelection());
    const mockSoundOverlay = {
      id: "sound-1",
      type: OverlayType.SOUND,
    };

    result.current.handleOverlaySelect(mockSoundOverlay as any);

    expect(mockSetSelectedOverlayId).toHaveBeenCalledWith("sound-1");
    expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.SOUND);
  });

  it("should handle caption overlay selection", () => {
    const { result } = renderHook(() => useOverlaySelection());
    const mockCaptionOverlay = {
      id: "caption-1",
      type: OverlayType.CAPTION,
    };

    result.current.handleOverlaySelect(mockCaptionOverlay as any);

    expect(mockSetSelectedOverlayId).toHaveBeenCalledWith("caption-1");
    expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.CAPTION);
  });
});
