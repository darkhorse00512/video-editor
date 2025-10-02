import React from "react";
import { ImageOverlay } from "../../../types";
import { PaintBucket, Settings } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../ui/tabs";
import { ImageStylePanel } from "./image-style-panel";
import { ImageSettingsPanel } from "./image-settings-panel";

/**
 * Props for the ImageDetails component
 * @interface ImageDetailsProps
 * @property {ImageOverlay} localOverlay - Current image overlay being edited
 * @property {Function} setLocalOverlay - Function to update the image overlay
 */
interface ImageDetailsProps {
  localOverlay: ImageOverlay;
  setLocalOverlay: (overlay: ImageOverlay) => void;
}

/**
 * ImageDetails Component
 *
 * @component
 * @description
 * Provides a tabbed interface for managing image settings and styles.
 * Features include:
 * - Image preview
 * - Style customization panel
 * - Settings configuration panel
 * - Real-time updates
 *
 * The component serves as the main configuration interface
 * for image overlays in the editor.
 *
 * @example
 * ```tsx
 * <ImageDetails
 *   localOverlay={imageOverlay}
 *   setLocalOverlay={handleOverlayUpdate}
 * />
 * ```
 */
export const ImageDetails: React.FC<ImageDetailsProps> = ({
  localOverlay,
  setLocalOverlay,
}) => {
  const handleStyleChange = (updates: Partial<ImageOverlay["styles"]>) => {
    const updatedOverlay = {
      ...localOverlay,
      styles: {
        ...localOverlay.styles,
        ...updates,
      },
    };
    setLocalOverlay(updatedOverlay);
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-sm border border-border bg-muted/40">
        <img
          src={localOverlay.src}
          alt="Image preview"
          className="h-full w-full object-cover"
        />
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-sm border border-gray-200 dark:border-gray-700 gap-1">
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
            rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <span className="flex items-center gap-2 text-xs">
              <Settings className="w-3 h-3" />
              Settings
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="style"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
            rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <span className="flex items-center gap-2 text-xs">
              <PaintBucket className="w-3 h-3" />
              Style
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-4 mt-4">
          <ImageStylePanel
            localOverlay={localOverlay}
            handleStyleChange={handleStyleChange}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <ImageSettingsPanel
            localOverlay={localOverlay}
            handleStyleChange={handleStyleChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
