import React from "react";
import { act, renderHook } from "@testing-library/react";
import {
  TimelineProvider,
  useTimeline,
} from "@/components/editor/version-7.0.0/contexts/timeline-context";

// Mock the custom hooks
jest.mock("@/components/editor/version-7.0.0/hooks/use-timeline-zoom", () => ({
  useTimelineZoom: jest.fn(() => ({
    zoomScale: 1,
    scrollPosition: 0,
    setZoomScale: jest.fn(),
    setScrollPosition: jest.fn(),
    handleZoom: jest.fn(),
    handleWheelZoom: jest.fn(),
  })),
}));

jest.mock("@/components/editor/version-7.0.0/hooks/use-visible-rows", () => ({
  useVisibleRows: jest.fn(() => ({
    visibleRows: 3,
    setVisibleRows: jest.fn(),
    addRow: jest.fn(),
    removeRow: jest.fn(),
  })),
}));

jest.mock("@/components/editor/version-7.0.0/hooks/use-overlays", () => ({
  useOverlays: jest.fn(() => ({
    resetOverlays: jest.fn(),
  })),
}));

// Import the mocked hooks for type assertions
import { useTimelineZoom } from "@/components/editor/version-7.0.0/hooks/use-timeline-zoom";
import { useVisibleRows } from "@/components/editor/version-7.0.0/hooks/use-visible-rows";
import { useOverlays } from "@/components/editor/version-7.0.0/hooks/use-overlays";

describe("TimelineContext", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TimelineProvider>{children}</TimelineProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useTimeline());
    }).toThrow("useTimeline must be used within a TimelineProvider");
  });

  describe("Timeline State", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useTimeline(), { wrapper });

      expect(result.current.visibleRows).toBe(3);
      expect(result.current.zoomScale).toBe(1);
      expect(result.current.scrollPosition).toBe(0);
      expect(result.current.timelineRef.current).toBe(null);
    });

    it("should provide timeline ref", () => {
      const { result } = renderHook(() => useTimeline(), { wrapper });
      expect(result.current.timelineRef).toBeDefined();
    });
  });

  describe("Row Management", () => {
    it("should handle visible rows changes", () => {
      const mockSetVisibleRows = jest.fn();
      (useVisibleRows as jest.Mock).mockImplementation(() => ({
        visibleRows: 3,
        setVisibleRows: mockSetVisibleRows,
        addRow: jest.fn(),
        removeRow: jest.fn(),
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });

      act(() => {
        result.current.setVisibleRows(5);
      });

      expect(mockSetVisibleRows).toHaveBeenCalledWith(5);
    });

    it("should handle adding rows", () => {
      const mockAddRow = jest.fn();
      (useVisibleRows as jest.Mock).mockImplementation(() => ({
        visibleRows: 3,
        setVisibleRows: jest.fn(),
        addRow: mockAddRow,
        removeRow: jest.fn(),
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });

      act(() => {
        result.current.addRow();
      });

      expect(mockAddRow).toHaveBeenCalled();
    });

    it("should handle removing rows", () => {
      const mockRemoveRow = jest.fn();
      (useVisibleRows as jest.Mock).mockImplementation(() => ({
        visibleRows: 3,
        setVisibleRows: jest.fn(),
        addRow: jest.fn(),
        removeRow: mockRemoveRow,
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });

      act(() => {
        result.current.removeRow();
      });

      expect(mockRemoveRow).toHaveBeenCalled();
    });
  });

  describe("Zoom Management", () => {
    it("should handle zoom scale changes", () => {
      const mockSetZoomScale = jest.fn();
      (useTimelineZoom as jest.Mock).mockImplementation(() => ({
        zoomScale: 1,
        scrollPosition: 0,
        setZoomScale: mockSetZoomScale,
        setScrollPosition: jest.fn(),
        handleZoom: jest.fn(),
        handleWheelZoom: jest.fn(),
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });

      act(() => {
        result.current.setZoomScale(2);
      });

      expect(mockSetZoomScale).toHaveBeenCalledWith(2);
    });

    it("should handle scroll position changes", () => {
      const mockSetScrollPosition = jest.fn();
      (useTimelineZoom as jest.Mock).mockImplementation(() => ({
        zoomScale: 1,
        scrollPosition: 0,
        setZoomScale: jest.fn(),
        setScrollPosition: mockSetScrollPosition,
        handleZoom: jest.fn(),
        handleWheelZoom: jest.fn(),
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });

      act(() => {
        result.current.setScrollPosition(100);
      });

      expect(mockSetScrollPosition).toHaveBeenCalledWith(100);
    });

    it("should handle zoom interactions", () => {
      const mockHandleZoom = jest.fn();
      (useTimelineZoom as jest.Mock).mockImplementation(() => ({
        zoomScale: 1,
        scrollPosition: 0,
        setZoomScale: jest.fn(),
        setScrollPosition: jest.fn(),
        handleZoom: mockHandleZoom,
        handleWheelZoom: jest.fn(),
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });

      act(() => {
        result.current.handleZoom(1, 100);
      });

      expect(mockHandleZoom).toHaveBeenCalledWith(1, 100);
    });

    it("should handle wheel zoom events", () => {
      const mockHandleWheelZoom = jest.fn();
      (useTimelineZoom as jest.Mock).mockImplementation(() => ({
        zoomScale: 1,
        scrollPosition: 0,
        setZoomScale: jest.fn(),
        setScrollPosition: jest.fn(),
        handleZoom: jest.fn(),
        handleWheelZoom: mockHandleWheelZoom,
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });
      const mockWheelEvent = new WheelEvent("wheel");

      act(() => {
        result.current.handleWheelZoom(mockWheelEvent);
      });

      expect(mockHandleWheelZoom).toHaveBeenCalledWith(mockWheelEvent);
    });
  });

  describe("Overlay Management", () => {
    it("should handle resetting overlays", () => {
      const mockResetOverlays = jest.fn();
      (useOverlays as jest.Mock).mockImplementation(() => ({
        resetOverlays: mockResetOverlays,
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });

      act(() => {
        result.current.resetOverlays();
      });

      expect(mockResetOverlays).toHaveBeenCalled();
    });
  });

  describe("Context Integration", () => {
    it("should maintain state across multiple operations", () => {
      const mockSetZoomScale = jest.fn();
      const mockSetVisibleRows = jest.fn();
      const mockResetOverlays = jest.fn();

      (useTimelineZoom as jest.Mock).mockImplementation(() => ({
        zoomScale: 1,
        scrollPosition: 0,
        setZoomScale: mockSetZoomScale,
        setScrollPosition: jest.fn(),
        handleZoom: jest.fn(),
        handleWheelZoom: jest.fn(),
      }));

      (useVisibleRows as jest.Mock).mockImplementation(() => ({
        visibleRows: 3,
        setVisibleRows: mockSetVisibleRows,
        addRow: jest.fn(),
        removeRow: jest.fn(),
      }));

      (useOverlays as jest.Mock).mockImplementation(() => ({
        resetOverlays: mockResetOverlays,
      }));

      const { result } = renderHook(() => useTimeline(), { wrapper });

      act(() => {
        result.current.setZoomScale(2);
        result.current.setVisibleRows(5);
        result.current.resetOverlays();
      });

      expect(mockSetZoomScale).toHaveBeenCalledWith(2);
      expect(mockSetVisibleRows).toHaveBeenCalledWith(5);
      expect(mockResetOverlays).toHaveBeenCalled();
    });
  });
});
