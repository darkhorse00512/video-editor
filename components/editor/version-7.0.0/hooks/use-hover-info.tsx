import { useState, useCallback } from "react";

// Defines the structure for hover information
// itemId: identifies the hovered item
// position: tracks the position of the hover (e.g., cursor position)
interface HoverInfo {
  itemId: number;
  position: number;
}

// Custom hook to manage hover state information
export const useHoverInfo = () => {
  // State to store current hover information, can be null when nothing is hovered
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  // Memoized callback to update hover information
  // This prevents unnecessary re-renders when passed as a prop
  const handleHoverInfoChange = useCallback(
    (newHoverInfo: HoverInfo | null) => {
      setHoverInfo(newHoverInfo);
    },
    []
  );

  // Returns an object with:
  // - hoverInfo: current hover state
  // - handleHoverInfoChange: memoized function to update hover state
  // - setHoverInfo: direct state setter (useful for simpler updates)
  return {
    hoverInfo,
    handleHoverInfoChange,
    setHoverInfo,
  };
};
