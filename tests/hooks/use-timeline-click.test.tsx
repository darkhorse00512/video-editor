import { renderHook } from "@testing-library/react";
import { useTimelineClick } from "../../components/editor/version-7.0.0/hooks/use-timeline-click";

describe("useTimelineClick", () => {
  // Mock player ref
  const mockSeekTo = jest.fn();
  const mockPlayerRef = {
    current: {
      seekTo: mockSeekTo,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize and return a callback function", () => {
    const { result } = renderHook(() => useTimelineClick(mockPlayerRef, 180));
    expect(typeof result.current).toBe("function");
  });

  it("should calculate correct seek position when timeline is clicked", () => {
    const { result } = renderHook(() => useTimelineClick(mockPlayerRef, 180));

    // Mock click event
    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 0,
          width: 1000,
        }),
      },
      clientX: 500, // Click in the middle
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent<HTMLDivElement>;

    // Call the click handler
    result.current(mockEvent);

    // Should seek to middle of timeline (90 frames)
    expect(mockSeekTo).toHaveBeenCalledWith(90);
  });

  it("should handle clicks at different positions", () => {
    const { result } = renderHook(() => useTimelineClick(mockPlayerRef, 300));

    const testCases = [
      { clickX: 0, expected: 0 }, // Start
      { clickX: 1000, expected: 300 }, // End
      { clickX: 250, expected: 75 }, // Quarter
      { clickX: 750, expected: 225 }, // Three quarters
    ];

    testCases.forEach(({ clickX, expected }) => {
      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 0,
            width: 1000,
          }),
        },
        clientX: clickX,
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent<HTMLDivElement>;

      result.current(mockEvent);
      expect(mockSeekTo).toHaveBeenCalledWith(expected);
    });
  });

  it("should handle offset timeline position", () => {
    const { result } = renderHook(() => useTimelineClick(mockPlayerRef, 100));

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 100, // Timeline is offset by 100px
          width: 1000,
        }),
      },
      clientX: 600, // Click at 500px relative to timeline
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent<HTMLDivElement>;

    result.current(mockEvent);
    expect(mockSeekTo).toHaveBeenCalledWith(50); // Should account for offset
  });

  it("should not call seekTo when player ref is null", () => {
    const nullPlayerRef = { current: null };
    const { result } = renderHook(() => useTimelineClick(nullPlayerRef, 100));

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 0,
          width: 1000,
        }),
      },
      clientX: 500,
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent<HTMLDivElement>;

    result.current(mockEvent);
    expect(mockSeekTo).not.toHaveBeenCalled();
  });
});
