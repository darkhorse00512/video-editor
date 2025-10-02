import React from "react";

/**
 * Props for the TimelineItemHandle component
 */
interface TimelineItemHandleProps {
  /** Position of the handle - either on the left or right side */
  position: "left" | "right";
  /** Whether this handle is currently selected */
  isSelected: boolean;
  /** Handler for mouse down events */
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Handler for touch start events - for mobile support */
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
}

/**
 * A draggable handle component used in timeline items.
 * Renders a semi-transparent vertical bar with two lines indicating it's draggable.
 * The handle becomes visible on hover or when selected, and supports both mouse and touch interactions.
 */
export const TimelineItemHandle: React.FC<TimelineItemHandleProps> = ({
  position,
  isSelected,
  onMouseDown,
  onTouchStart,
}) => {
  return (
    <div
      className={`bg-gray-400/20 dark:bg-white/10 backdrop-blur-sm w-4 absolute ${position}-0 top-0 bottom-0 w-2 cursor-ew-resize z-50
      hover:bg-gray-400/30 dark:hover:bg-white/20 opacity-0 group-hover:opacity-100 ${
        isSelected ? "opacity-100" : ""
      }
      transition-all duration-200 ease-in-out border-r border-l border-gray-400/30 dark:border-white/20`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`space-x-0.5 flex ${
            position === "left" ? "ml-0" : "mr-0"
          }`}
        >
          <div
            className={`w-[1px] h-4 bg-gray-600/90 dark:bg-white/90 rounded-full shadow-glow`}
          />
          <div
            className={`w-[1px] h-4 bg-gray-600/90 dark:bg-white/90 rounded-full shadow-glow`}
          />
        </div>
      </div>
    </div>
  );
};
