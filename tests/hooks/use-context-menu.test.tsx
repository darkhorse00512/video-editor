import { renderHook, act } from "@testing-library/react";
import { useContextMenu } from "../../components/editor/version-7.0.0/hooks/use-context-menu";

describe("useContextMenu", () => {
  it("should initialize with null context menu", () => {
    const { result } = renderHook(() => useContextMenu());
    expect(result.current.ContextMenuComponent()).toBe(null);
  });

  it("should show context menu at specified position with items", () => {
    const { result } = renderHook(() => useContextMenu());
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;

    const menuItems = [
      {
        label: "Test Item",
        icon: <span>🔍</span>,
        action: jest.fn(),
      },
    ];

    act(() => {
      result.current.showContextMenu(mockEvent, menuItems);
    });

    const menuComponent = result.current.ContextMenuComponent();
    expect(menuComponent).not.toBe(null);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it("should hide context menu", () => {
    const { result } = renderHook(() => useContextMenu());
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.showContextMenu(mockEvent, [
        {
          label: "Test Item",
          icon: <span>🔍</span>,
          action: jest.fn(),
        },
      ]);
    });

    expect(result.current.ContextMenuComponent()).not.toBe(null);

    act(() => {
      result.current.hideContextMenu();
    });

    expect(result.current.ContextMenuComponent()).toBe(null);
  });

  it("should execute menu item action and hide menu when clicked", () => {
    const { result } = renderHook(() => useContextMenu());
    const mockAction = jest.fn();
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.showContextMenu(mockEvent, [
        {
          label: "Test Item",
          icon: <span>🔍</span>,
          action: mockAction,
        },
      ]);
    });

    const menuComponent = result.current.ContextMenuComponent();
    expect(menuComponent).not.toBe(null);

    // Simulate clicking the menu item
    if (menuComponent) {
      act(() => {
        const button = menuComponent.props.children[0];
        button.props.onClick();
      });

      expect(mockAction).toHaveBeenCalled();
      expect(result.current.ContextMenuComponent()).toBe(null);
    }
  });
});
