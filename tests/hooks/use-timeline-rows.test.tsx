import { renderHook, act } from "@testing-library/react";
import { useTimelineRows } from "../../components/editor/version-7.0.0/hooks/use-timeline-rows";
import { MAX_ROWS } from "../../components/editor/version-7.0.0/constants";

describe("useTimelineRows", () => {
  beforeEach(() => {
    // Reset Date.now to a fixed value for consistent testing
    jest.spyOn(Date, "now").mockImplementation(() => 1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should initialize with 3 default rows", () => {
    const { result } = renderHook(() => useTimelineRows());

    expect(result.current.rows).toHaveLength(3);
    expect(result.current.rows).toEqual([
      { id: 1, index: 0 },
      { id: 2, index: 1 },
      { id: 3, index: 2 },
    ]);
  });

  it("should add a new row when addRow is called", () => {
    const { result } = renderHook(() => useTimelineRows());

    act(() => {
      result.current.addRow();
    });

    expect(result.current.rows).toHaveLength(4);
    expect(result.current.rows[3]).toEqual({
      id: 1234567890,
      index: 3,
    });
  });

  it("should not add rows beyond MAX_ROWS limit", () => {
    const { result } = renderHook(() => useTimelineRows());

    // Add rows until reaching MAX_ROWS
    for (let i = 0; i < MAX_ROWS - 3; i++) {
      act(() => {
        result.current.addRow();
      });
    }

    expect(result.current.rows).toHaveLength(MAX_ROWS);

    // Try to add one more row
    act(() => {
      result.current.addRow();
    });

    // Length should remain the same
    expect(result.current.rows).toHaveLength(MAX_ROWS);
  });
});
