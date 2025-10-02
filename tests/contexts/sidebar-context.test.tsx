import React from "react";
import { act, renderHook } from "@testing-library/react";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/editor/version-7.0.0/contexts/sidebar-context";
import { OverlayType } from "@/components/editor/version-7.0.0/types";
import * as UISidebar from "@/components/ui/sidebar";

// Mock the UI sidebar hook
jest.mock("@/components/ui/sidebar", () => ({
  useSidebar: jest.fn(() => ({
    setOpen: jest.fn(),
  })),
}));

describe("SidebarContext", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SidebarProvider>{children}</SidebarProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useSidebar());
    }).toThrow("useSidebar must be used within a SidebarProvider");
  });

  it("should initialize with TEXT as default active panel", () => {
    const { result } = renderHook(() => useSidebar(), { wrapper });
    expect(result.current.activePanel).toBe(OverlayType.TEXT);
  });

  describe("Panel Management", () => {
    it("should change active panel", () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result.current.setActivePanel(OverlayType.IMAGE);
      });

      expect(result.current.activePanel).toBe(OverlayType.IMAGE);
    });

    it("should handle multiple panel changes", () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      // Change to IMAGE
      act(() => {
        result.current.setActivePanel(OverlayType.IMAGE);
      });
      expect(result.current.activePanel).toBe(OverlayType.IMAGE);

      // Change to VIDEO
      act(() => {
        result.current.setActivePanel(OverlayType.VIDEO);
      });
      expect(result.current.activePanel).toBe(OverlayType.VIDEO);

      // Change back to TEXT
      act(() => {
        result.current.setActivePanel(OverlayType.TEXT);
      });
      expect(result.current.activePanel).toBe(OverlayType.TEXT);
    });
  });

  describe("Sidebar Visibility", () => {
    it("should call UI sidebar setOpen", () => {
      const mockSetOpen = jest.fn();
      (UISidebar.useSidebar as jest.Mock).mockImplementation(() => ({
        setOpen: mockSetOpen,
      }));

      const { result } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(mockSetOpen).toHaveBeenCalledWith(true);

      act(() => {
        result.current.setIsOpen(false);
      });

      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });

    it("should handle rapid visibility toggles", () => {
      const mockSetOpen = jest.fn();
      (UISidebar.useSidebar as jest.Mock).mockImplementation(() => ({
        setOpen: mockSetOpen,
      }));

      const { result } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result.current.setIsOpen(true);
        result.current.setIsOpen(false);
        result.current.setIsOpen(true);
      });

      expect(mockSetOpen).toHaveBeenCalledTimes(3);
      expect(mockSetOpen.mock.calls).toEqual([[true], [false], [true]]);
    });
  });

  describe("Context Integration", () => {
    it("should maintain panel state while toggling visibility", () => {
      const mockSetOpen = jest.fn();
      (UISidebar.useSidebar as jest.Mock).mockImplementation(() => ({
        setOpen: mockSetOpen,
      }));

      const { result } = renderHook(() => useSidebar(), { wrapper });

      // Set initial panel
      act(() => {
        result.current.setActivePanel(OverlayType.IMAGE);
      });

      // Toggle visibility
      act(() => {
        result.current.setIsOpen(false);
      });

      // Panel should remain unchanged
      expect(result.current.activePanel).toBe(OverlayType.IMAGE);

      // Toggle visibility again
      act(() => {
        result.current.setIsOpen(true);
      });

      // Panel should still be unchanged
      expect(result.current.activePanel).toBe(OverlayType.IMAGE);
    });

    it("should handle panel change while sidebar is closed", () => {
      const mockSetOpen = jest.fn();
      (UISidebar.useSidebar as jest.Mock).mockImplementation(() => ({
        setOpen: mockSetOpen,
      }));

      const { result } = renderHook(() => useSidebar(), { wrapper });

      // Close sidebar
      act(() => {
        result.current.setIsOpen(false);
      });

      // Change panel while closed
      act(() => {
        result.current.setActivePanel(OverlayType.VIDEO);
      });

      expect(result.current.activePanel).toBe(OverlayType.VIDEO);
      expect(mockSetOpen).toHaveBeenLastCalledWith(false);
    });
  });
});
