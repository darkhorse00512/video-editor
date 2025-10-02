import { renderHook, act } from "@testing-library/react";
import { useVisibleRows } from "../../components/editor/version-7.0.0/hooks/use-visible-rows";
import {
  INITIAL_ROWS,
  MAX_ROWS,
} from "../../components/editor/version-7.0.0/constants";

describe("useVisibleRows", () => {
  it("should initialize with INITIAL_ROWS", () => {
    const { result } = renderHook(() => useVisibleRows());
    expect(result.current.visibleRows).toBe(INITIAL_ROWS);
  });

  it("should add a row up to MAX_ROWS", () => {
    const { result } = renderHook(() => useVisibleRows());

    // Add rows until MAX_ROWS
    for (let i = INITIAL_ROWS; i < MAX_ROWS; i++) {
      act(() => {
        result.current.addRow();
      });
      expect(result.current.visibleRows).toBe(i + 1);
    }

    // Try to add one more row - should stay at MAX_ROWS
    act(() => {
      result.current.addRow();
    });
    expect(result.current.visibleRows).toBe(MAX_ROWS);
  });

  it("should remove a row down to INITIAL_ROWS", () => {
    const { result } = renderHook(() => useVisibleRows());

    // First add some rows
    act(() => {
      result.current.setVisibleRows(MAX_ROWS);
    });

    // Remove rows until INITIAL_ROWS
    for (let i = MAX_ROWS; i > INITIAL_ROWS; i--) {
      act(() => {
        result.current.removeRow();
      });
      expect(result.current.visibleRows).toBe(i - 1);
    }

    // Try to remove one more row - should stay at INITIAL_ROWS
    act(() => {
      result.current.removeRow();
    });
    expect(result.current.visibleRows).toBe(INITIAL_ROWS);
  });

  it("should directly set visible rows within bounds", () => {
    const { result } = renderHook(() => useVisibleRows());

    // Set to a valid number between INITIAL_ROWS and MAX_ROWS
    const validNumber = Math.floor((INITIAL_ROWS + MAX_ROWS) / 2);
    act(() => {
      result.current.setVisibleRows(validNumber);
    });
    expect(result.current.visibleRows).toBe(validNumber);
  });

  it("should return correct value from getVisibleRows", () => {
    const { result } = renderHook(() => useVisibleRows());

    expect(result.current.getVisibleRows()).toBe(INITIAL_ROWS);

    act(() => {
      result.current.addRow();
    });

    expect(result.current.getVisibleRows()).toBe(INITIAL_ROWS + 1);
  });
});
