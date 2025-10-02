import React from "react";
import { ClipOverlay } from "../../../types";
import { MediaFilterPresetSelector } from "../common/media-filter-preset-selector";
import { MediaPaddingControls } from "../common/media-padding-controls";

/**
 * Props for the VideoStylePanel component
 * @interface VideoStylePanelProps
 * @property {ClipOverlay} localOverlay - The current overlay object containing video styles
 * @property {Function} handleStyleChange - Callback function to update overlay styles
 */
interface VideoStylePanelProps {
  localOverlay: ClipOverlay;
  handleStyleChange: (updates: Partial<ClipOverlay["styles"]>) => void;
}

/**
 * VideoStylePanel Component
 *
 * A panel that provides controls for styling video overlays. It allows users to adjust:
 * - Object fit (cover, contain, fill)
 * - Border radius
 * - Brightness
 * - Filter presets (retro, vintage, Wes Anderson, etc.)
 * - Padding and padding background color
 *
 * The component uses a local overlay state and propagates changes through the handleStyleChange callback.
 * All style controls maintain both light and dark theme compatibility.
 *
 * @component
 * @param {VideoStylePanelProps} props - Component props
 * @returns {JSX.Element} A styled form containing video appearance controls
 */
export const VideoStylePanel: React.FC<VideoStylePanelProps> = ({
  localOverlay,
  handleStyleChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="space-y-4 rounded-md bg-gray-100/50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Appearance
        </h3>

        <div className="space-y-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">
            Fit
          </label>
          <select
            value={localOverlay?.styles?.objectFit ?? "cover"}
            onChange={(e) =>
              handleStyleChange({ objectFit: e.target.value as any })
            }
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs p-2 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-gray-900 dark:text-gray-100"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
          </select>
        </div>

        {/* Filter Preset Selector */}
        <MediaFilterPresetSelector
          localOverlay={localOverlay}
          handleStyleChange={handleStyleChange}
        />

        {/* Border Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              Border Radius
            </label>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[40px] text-right">
              {localOverlay?.styles?.borderRadius ?? "0px"}
            </span>
          </div>
          <input
            type="number"
            value={parseInt(localOverlay?.styles?.borderRadius ?? "0")}
            onChange={(e) =>
              handleStyleChange({ borderRadius: `${e.target.value}px` })
            }
            min="0"
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs p-2 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Brightness</label>
            <span className="text-xs text-gray-400 min-w-[40px] text-right">
              {parseInt(
                localOverlay?.styles?.filter?.match(
                  /brightness\((\d+)%\)/
                )?.[1] ?? "100"
              )}
              %
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={parseInt(
                localOverlay?.styles?.filter?.match(
                  /brightness\((\d+)%\)/
                )?.[1] ?? "100"
              )}
              onChange={(e) => {
                const currentFilter = localOverlay?.styles?.filter || "";
                const newFilter =
                  currentFilter.replace(/brightness\(\d+%\)/, "") +
                  ` brightness(${e.target.value}%)`;
                handleStyleChange({ filter: newFilter.trim() });
              }}
              className="flex-1 accent-blue-500 h-1.5 rounded-full bg-gray-700"
            />
          </div>
        </div>

        {/* Media Padding Controls */}
        <MediaPaddingControls
          localOverlay={localOverlay}
          handleStyleChange={handleStyleChange}
        />
      </div>
    </div>
  );
};
