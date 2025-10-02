import React from "react";
import { act, renderHook } from "@testing-library/react";
import {
  KeyframeProvider,
  useKeyframeContext,
} from "@/components/editor/version-7.0.0/contexts/keyframe-context";

describe("KeyframeContext", () => {
  // Mock data
  const mockKeyframeData = {
    frames: ["frame1", "frame2", "frame3"],
    previewFrames: [0, 15, 30],
    lastUpdated: Date.now(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <KeyframeProvider>{children}</KeyframeProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the Date.now() mock before each test
    jest.spyOn(Date, "now").mockImplementation(() => 1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useKeyframeContext());
    }).toThrow("useKeyframeContext must be used within a KeyframeProvider");
  });

  describe("Keyframe Management", () => {
    it("should return null for non-existent keyframes", () => {
      const { result } = renderHook(() => useKeyframeContext(), { wrapper });

      const keyframes = result.current.getKeyframes(1);
      expect(keyframes).toBeNull();
    });

    it("should store and retrieve keyframe data", () => {
      const { result } = renderHook(() => useKeyframeContext(), { wrapper });
      const overlayId = 1;

      act(() => {
        result.current.updateKeyframes(overlayId, mockKeyframeData);
      });

      const retrievedKeyframes = result.current.getKeyframes(overlayId);
      expect(retrievedKeyframes).toEqual({
        ...mockKeyframeData,
        lastUpdated: 1234567890,
      });
    });

    it("should update existing keyframe data", () => {
      const { result } = renderHook(() => useKeyframeContext(), { wrapper });
      const overlayId = 1;
      const updatedKeyframeData = {
        ...mockKeyframeData,
        frames: ["newFrame1", "newFrame2"],
        previewFrames: [0, 20],
      };

      // First update
      act(() => {
        result.current.updateKeyframes(overlayId, mockKeyframeData);
      });

      // Second update
      act(() => {
        result.current.updateKeyframes(overlayId, updatedKeyframeData);
      });

      const retrievedKeyframes = result.current.getKeyframes(overlayId);
      expect(retrievedKeyframes).toEqual({
        ...updatedKeyframeData,
        lastUpdated: 1234567890,
      });
    });

    it("should clear keyframes for specific overlay", () => {
      const { result } = renderHook(() => useKeyframeContext(), { wrapper });
      const overlayId = 1;

      // Add keyframes
      act(() => {
        result.current.updateKeyframes(overlayId, mockKeyframeData);
      });

      // Verify keyframes were added
      expect(result.current.getKeyframes(overlayId)).not.toBeNull();

      // Clear keyframes
      act(() => {
        result.current.clearKeyframes(overlayId);
      });

      // Verify keyframes were cleared
      expect(result.current.getKeyframes(overlayId)).toBeNull();
    });

    it("should clear all keyframes", () => {
      const { result } = renderHook(() => useKeyframeContext(), { wrapper });

      // Add keyframes for multiple overlays
      act(() => {
        result.current.updateKeyframes(1, mockKeyframeData);
        result.current.updateKeyframes(2, mockKeyframeData);
      });

      // Verify keyframes were added
      expect(result.current.getKeyframes(1)).not.toBeNull();
      expect(result.current.getKeyframes(2)).not.toBeNull();

      // Clear all keyframes
      act(() => {
        result.current.clearAllKeyframes();
      });

      // Verify all keyframes were cleared
      expect(result.current.getKeyframes(1)).toBeNull();
      expect(result.current.getKeyframes(2)).toBeNull();
    });

    it("should handle multiple updates to the same overlay", () => {
      const { result } = renderHook(() => useKeyframeContext(), { wrapper });
      const overlayId = 1;

      // Series of updates
      act(() => {
        result.current.updateKeyframes(overlayId, {
          frames: ["frame1"],
          previewFrames: [0],
          lastUpdated: Date.now(),
        });

        result.current.updateKeyframes(overlayId, {
          frames: ["frame1", "frame2"],
          previewFrames: [0, 15],
          lastUpdated: Date.now(),
        });

        result.current.updateKeyframes(overlayId, {
          frames: ["frame1", "frame2", "frame3"],
          previewFrames: [0, 15, 30],
          lastUpdated: Date.now(),
        });
      });

      const finalKeyframes = result.current.getKeyframes(overlayId);
      expect(finalKeyframes).toEqual({
        frames: ["frame1", "frame2", "frame3"],
        previewFrames: [0, 15, 30],
        lastUpdated: 1234567890,
      });
    });

    it("should maintain separate keyframe data for different overlays", () => {
      const { result } = renderHook(() => useKeyframeContext(), { wrapper });

      const overlay1Data = {
        frames: ["frame1"],
        previewFrames: [0],
        lastUpdated: Date.now(),
      };

      const overlay2Data = {
        frames: ["frame2"],
        previewFrames: [15],
        lastUpdated: Date.now(),
      };

      act(() => {
        result.current.updateKeyframes(1, overlay1Data);
        result.current.updateKeyframes(2, overlay2Data);
      });

      const keyframes1 = result.current.getKeyframes(1);
      const keyframes2 = result.current.getKeyframes(2);

      expect(keyframes1?.frames).toEqual(["frame1"]);
      expect(keyframes2?.frames).toEqual(["frame2"]);
    });
  });
});
