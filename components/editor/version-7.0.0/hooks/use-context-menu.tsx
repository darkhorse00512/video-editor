import { useState, useCallback } from "react";

/**
 * Represents an item in the context menu.
 */
interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

/**
 * A custom hook for managing a context menu.
 * @returns An object containing functions to show and hide the context menu, and a component to render it.
 */
export const useContextMenu = () => {
  // State to store the current context menu position and items
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: MenuItem[];
  } | null>(null);

  /**
   * Shows the context menu at the specified position with the given items.
   * @param e - The mouse event that triggered the context menu.
   * @param items - An array of MenuItem objects to display in the context menu.
   */
  const showContextMenu = useCallback(
    (e: React.MouseEvent, items: MenuItem[]) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        items,
      });
    },
    []
  );

  /**
   * Hides the context menu.
   */
  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  /**
   * A component that renders the context menu.
   * @returns A JSX element representing the context menu, or null if the menu is not visible.
   */
  const ContextMenuComponent = useCallback(() => {
    if (!contextMenu) return null;

    return (
      <div
        className="absolute bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50"
        style={{ top: contextMenu.y, left: contextMenu.x }}
      >
        {contextMenu.items.map((item, index) => (
          <button
            key={index}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center text-gray-200 transition-colors duration-150"
            onClick={() => {
              item.action();
              hideContextMenu();
            }}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    );
  }, [contextMenu, hideContextMenu]);

  // Return the functions and component for external use
  return { showContextMenu, hideContextMenu, ContextMenuComponent };
};
