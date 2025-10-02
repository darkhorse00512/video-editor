import React from "react";
import { ImageOverlay } from "../../../types";
import { MediaFilterPresetSelector } from "../common/media-filter-preset-selector";
import { MediaPaddingControls } from "../common/media-padding-controls";

/**
 * Props for the ImageStylePanel component
 */
interface ImageStylePanelProps {
  /** The current state of the image overlay being edited */
  localOverlay: ImageOverlay;
  /** Callback to update the overlay's style properties */
  handleStyleChange: (updates: Partial<ImageOverlay["styles"]>) => void;
}

/**
 * ImageStylePanel Component
 *
 * A panel that allows users to adjust visual appearance settings for an image overlay.
 * Provides controls for various CSS filter properties to modify the image's appearance.
 *
 * Features:
 * - Filter presets (retro, vintage, noir, etc.)
 * - Brightness adjustment (0-200%)
 * - Padding and padding background controls
 * - Maintains existing filters while updating individual properties
 * - Real-time preview of adjustments
 *
 * Note: The filter string is managed as a space-separated list of CSS filter functions,
 * allowing multiple filters to be applied simultaneously.
 */
export const ImageStylePanel: React.FC<ImageStylePanelProps> = ({
  localOverlay,
  handleStyleChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="space-y-4 rounded-md bg-muted/50 p-4 border border-border">
        <h3 className="text-sm font-medium text-foreground">Appearance</h3>

        {/* Object Fit Setting */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Fit</label>
          <select
            value={localOverlay?.styles?.objectFit ?? "cover"}
            onChange={(e) =>
              handleStyleChange({ objectFit: e.target.value as any })
            }
            className="w-full bg-background border border-input rounded-md text-xs p-2 hover:border-accent-foreground transition-colors"
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
            <label className="text-xs text-muted-foreground">
              Border Radius
            </label>
            <span className="text-xs text-muted-foreground min-w-[40px] text-right">
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
            className="w-full bg-background border border-input rounded-md text-xs p-2 hover:border-accent-foreground transition-colors"
          />
        </div>

        {/* Brightness Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Brightness</label>
            <span className="text-xs text-muted-foreground min-w-[40px] text-right">
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
              className="flex-1 accent-primary h-1.5 rounded-full bg-muted"
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
