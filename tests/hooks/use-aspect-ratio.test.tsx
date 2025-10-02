import { renderHook, act } from "@testing-library/react";
import { useAspectRatio } from "../../components/editor/version-7.0.0/hooks/use-aspect-ratio";

describe("useAspectRatio", () => {
  it("should initialize with default aspect ratio (16:9)", () => {
    const { result } = renderHook(() => useAspectRatio());
    expect(result.current.aspectRatio).toBe("16:9");
  });

  it("should initialize with custom aspect ratio", () => {
    const { result } = renderHook(() => useAspectRatio("1:1"));
    expect(result.current.aspectRatio).toBe("1:1");
  });

  it("should call onRatioChange callback when aspect ratio changes", () => {
    const onRatioChange = jest.fn();
    const { result } = renderHook(() => useAspectRatio("16:9", onRatioChange));

    act(() => {
      result.current.setAspectRatio("9:16");
    });

    expect(onRatioChange).toHaveBeenCalledWith("9:16");
  });

  it("should update player dimensions based on container size", () => {
    const { result } = renderHook(() => useAspectRatio("16:9"));

    act(() => {
      result.current.updatePlayerDimensions(1920, 1080);
    });

    expect(result.current.playerDimensions).toEqual({
      width: 1920,
      height: 1080,
    });

    // Test with a different container size
    act(() => {
      result.current.updatePlayerDimensions(800, 600);
    });

    expect(result.current.playerDimensions).toEqual({
      width: 800,
      height: 450, // Maintains 16:9 ratio
    });
  });

  it("should return correct dimensions for different aspect ratios", () => {
    const { result } = renderHook(() => useAspectRatio());

    // Test 16:9
    expect(result.current.getAspectRatioDimensions()).toEqual({
      width: 1280,
      height: 720,
    });

    // Test 1:1
    act(() => {
      result.current.setAspectRatio("1:1");
    });
    expect(result.current.getAspectRatioDimensions()).toEqual({
      width: 1080,
      height: 1080,
    });

    // Test 9:16
    act(() => {
      result.current.setAspectRatio("9:16");
    });
    expect(result.current.getAspectRatioDimensions()).toEqual({
      width: 1080,
      height: 1920,
    });

    // Test 4:5
    act(() => {
      result.current.setAspectRatio("4:5");
    });
    expect(result.current.getAspectRatioDimensions()).toEqual({
      width: 1080,
      height: 1350,
    });
  });
});
