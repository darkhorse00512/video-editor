import React from "react";
import { CaptionOverlay } from "../../../types";
import { captionTemplates } from "../../../templates/caption-templates";

/**
 * Props for the CaptionStylePanel component
 * @interface CaptionStylePanelProps
 * @property {CaptionOverlay} localOverlay - Current caption overlay being styled
 * @property {Function} setLocalOverlay - Function to update the caption overlay
 */
interface CaptionStylePanelProps {
  localOverlay: CaptionOverlay;
  setLocalOverlay: (overlay: CaptionOverlay) => void;
}

/**
 * CaptionStylePanel Component
 *
 * @component
 * @description
 * Provides a visual interface for selecting and customizing caption styles.
 * Features include:
 * - Pre-defined style templates
 * - Live preview of styles
 * - Color palette visualization
 * - Active state indication
 *
 * Each template includes:
 * - Preview text with highlight example
 * - Template name and status
 * - Color scheme visualization
 *
 * @example
 * ```tsx
 * <CaptionStylePanel
 *   localOverlay={captionOverlay}
 *   setLocalOverlay={handleStyleUpdate}
 * />
 * ```
 */
export const CaptionStylePanel: React.FC<CaptionStylePanelProps> = ({
  localOverlay,
  setLocalOverlay,
}) => {
  return (
    <div className="space-y-4">
      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(captionTemplates).map(([key, template]) => (
          <button
            key={key}
            onClick={() => {
              const updatedOverlay = {
                ...localOverlay,
                template: key,
                styles: template.styles,
              };
              setLocalOverlay(updatedOverlay);
            }}
            className={`group relative overflow-hidden rounded-lg border transition-all duration-200
              ${
                localOverlay?.template === key
                  ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30 dark:ring-blue-400/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
              }`}
          >
            {/* Preview Area with demo text */}
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-gray-900/90 dark:from-black/40 dark:to-gray-900/40">
              <div className="absolute inset-0 flex items-center justify-center p-10">
                <span
                  style={{
                    ...template.styles,
                    fontSize: "1.2rem",
                    lineHeight: "1.2",
                  }}
                >
                  Let&apos;s{" "}
                  <span
                    style={{
                      ...template.styles.highlightStyle,
                      transform: `scale(${
                        template.styles.highlightStyle?.scale || 1
                      })`,
                    }}
                  >
                    start
                  </span>{" "}
                  with a demo of your caption.
                </span>
              </div>
            </div>

            {/* Template Info and Color Palette */}
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm">
              {/* Template Name and Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {template.name}
                </span>
                {localOverlay?.template === key && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              {/* Color Palette Preview */}
              <div className="flex items-center gap-1.5">
                {[
                  template.styles.color,
                  template.styles.highlightStyle?.backgroundColor,
                ].map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full ring-1 ring-black/5 dark:ring-white/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
