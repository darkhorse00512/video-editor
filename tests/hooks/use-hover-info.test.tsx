import { renderHook, act } from "@testing-library/react";
import { useHoverInfo } from "../../components/editor/version-7.0.0/hooks/use-hover-info";

describe("useHoverInfo", () => {
  it("should initialize with null hover info", () => {
    const { result } = renderHook(() => useHoverInfo());
    expect(result.current.hoverInfo).toBe(null);
  });

  it("should update hover info using handleHoverInfoChange", () => {
    const { result } = renderHook(() => useHoverInfo());
    const newHoverInfo = { itemId: 1, position: 100 };

    act(() => {
      result.current.handleHoverInfoChange(newHoverInfo);
    });

    expect(result.current.hoverInfo).toEqual(newHoverInfo);
  });

  it("should update hover info using setHoverInfo", () => {
    const { result } = renderHook(() => useHoverInfo());
    const newHoverInfo = { itemId: 2, position: 200 };

    act(() => {
      result.current.setHoverInfo(newHoverInfo);
    });

    expect(result.current.hoverInfo).toEqual(newHoverInfo);
  });

  it("should clear hover info when setting to null", () => {
    const { result } = renderHook(() => useHoverInfo());

    // First set some hover info
    act(() => {
      result.current.setHoverInfo({ itemId: 1, position: 100 });
    });
    expect(result.current.hoverInfo).not.toBe(null);

    // Then clear it
    act(() => {
      result.current.setHoverInfo(null);
    });
    expect(result.current.hoverInfo).toBe(null);
  });

  it("should maintain reference equality of handleHoverInfoChange between renders", () => {
    const { result, rerender } = renderHook(() => useHoverInfo());
    const initialCallback = result.current.handleHoverInfoChange;

    rerender();

    expect(result.current.handleHoverInfoChange).toBe(initialCallback);
  });
});
