import React, { useMemo } from "react";
import { useEditorContext } from "../../../contexts/editor-context";
import { useTimelinePositioning } from "../../../hooks/use-timeline-positioning";
import { OverlayType, TextOverlay } from "../../../types";
import { useTimeline } from "../../../contexts/timeline-context";
import { textOverlayTemplates } from "../../../templates/text-overlay-templates";

/**
 * Interface for the SelectTextOverlay component props
 */
interface SelectTextOverlayProps {
  /** Callback function to set the local text overlay state */
  setLocalOverlay: (overlay: TextOverlay) => void;
}

/**
 * SelectTextOverlay Component
 *
 * This component renders a grid of text overlay templates that users can select from.
 * When a template is selected, it creates a new text overlay with predefined styles
 * and positions it at the next available spot in the timeline.
 *
 * Features:
 * - Displays a grid of text overlay templates with preview and information
 * - Automatically positions new overlays in the timeline
 * - Applies template styles while maintaining consistent base properties
 * - Supports dark/light mode with appropriate styling
 *
 * @component
 */
export const SelectTextOverlay: React.FC<SelectTextOverlayProps> = () => {
  const { addOverlay, overlays, durationInFrames } = useEditorContext();
  const { findNextAvailablePosition } = useTimelinePositioning();
  const { visibleRows } = useTimeline();

  /**
   * Creates and adds a new text overlay to the editor
   * @param option - The selected template option from textOverlayTemplates
   */
  const handleAddOverlay = (option: (typeof textOverlayTemplates)[0]) => {
    const { from, row } = findNextAvailablePosition(
      overlays,
      visibleRows,
      durationInFrames
    );

    const newOverlay: TextOverlay = {
      left: 100,
      top: 100,
      width: 300,
      height: 50,
      durationInFrames: 90,
      from,
      id: Date.now(),
      row,
      rotation: 0,
      isDragging: false,
      type: OverlayType.TEXT,
      content: option.content ?? "Testing",
      styles: {
        ...option.styles,
        fontSize: "3rem",
        opacity: 1,
        zIndex: 1,
        transform: "none",
        textAlign: option.styles.textAlign as "left" | "center" | "right",
      },
    };

    addOverlay(newOverlay);
  };

  return useMemo(
    () => (
      <div className="grid grid-cols-1 gap-3 p-2">
        {Object.entries(textOverlayTemplates).map(([key, option]) => (
          <div
            key={key}
            onClick={() => handleAddOverlay(option)}
            className="group relative overflow-hidden border-2  bg-gray-200  dark:bg-gray-900/40  rounded-md border-white/10 transition-all duration-200 dark:hover:border-white/20 hover:border-blue-500/80 cursor-pointer"
          >
            {/* Preview Container */}
            <div className="aspect-[16/6] w-full flex items-center justify-center p-2 pb-12">
              <div
                className="text-base transform-gpu transition-transform duration-200 group-hover:scale-102 dark:text-white text-gray-900/90"
                style={{
                  ...option.styles,
                  fontSize: "1.25rem",
                  padding: option.styles.padding || undefined,
                  fontFamily: undefined,
                  color: undefined,
                }}
              >
                {option.content}
              </div>
            </div>

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 dark:bg-black/40 bg-white/40 backdrop-blur-[2px] px-3 py-1.5">
              <div className="font-medium dark:text-white/95 text-black/95 text-[11px]">
                {option.name}
              </div>
              <div className="text-black/70 dark:text-white/70 text-[9px] leading-tight">
                {option.preview}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    []
  );
};
