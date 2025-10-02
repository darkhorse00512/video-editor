import React from "react";
import { act, renderHook } from "@testing-library/react";
import {
  AssetLoadingProvider,
  useAssetLoading,
} from "@/components/editor/version-7.0.0/contexts/asset-loading-context";

describe("AssetLoadingContext", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AssetLoadingProvider>{children}</AssetLoadingProvider>
  );

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useAssetLoading());
    }).toThrow("useAssetLoading must be used within an AssetLoadingProvider");
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useAssetLoading(), { wrapper });

    expect(result.current.isLoadingAssets).toBe(true);
    expect(result.current.isInitialLoad).toBe(true);
  });

  it("should handle asset loading state changes", () => {
    const { result } = renderHook(() => useAssetLoading(), { wrapper });

    // Start loading asset
    act(() => {
      result.current.handleAssetLoadingChange(1, true);
    });
    expect(result.current.isLoadingAssets).toBe(true);

    // Stop loading asset
    act(() => {
      result.current.handleAssetLoadingChange(1, false);
    });

    // Should still be loading due to timeout
    expect(result.current.isLoadingAssets).toBe(true);

    // After timeout, loading should be false
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.isLoadingAssets).toBe(false);
  });

  it("should handle multiple assets loading simultaneously", () => {
    const { result } = renderHook(() => useAssetLoading(), { wrapper });

    // Start loading multiple assets
    act(() => {
      result.current.handleAssetLoadingChange(1, true);
      result.current.handleAssetLoadingChange(2, true);
    });
    expect(result.current.isLoadingAssets).toBe(true);

    // Stop loading first asset
    act(() => {
      result.current.handleAssetLoadingChange(1, false);
    });
    expect(result.current.isLoadingAssets).toBe(true);

    // Stop loading second asset
    act(() => {
      result.current.handleAssetLoadingChange(2, false);
    });

    // After timeout, loading should be false
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.isLoadingAssets).toBe(false);
  });

  it("should handle initial load completion", () => {
    const { result } = renderHook(() => useAssetLoading(), { wrapper });

    expect(result.current.isInitialLoad).toBe(true);

    act(() => {
      result.current.setInitialLoadComplete();
    });
    expect(result.current.isInitialLoad).toBe(false);

    // Calling setInitialLoadComplete again should not change the state
    act(() => {
      result.current.setInitialLoadComplete();
    });
    expect(result.current.isInitialLoad).toBe(false);
  });

  it("should clear timeout on unmount", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const { result, unmount } = renderHook(() => useAssetLoading(), {
      wrapper,
    });

    // Start loading and then stop to create a timeout
    act(() => {
      result.current.handleAssetLoadingChange(1, true);
      result.current.handleAssetLoadingChange(1, false);
    });

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
