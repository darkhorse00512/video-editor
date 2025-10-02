import React from "react";
import { CaptionOverlay, CaptionStyles, Caption } from "../../../types";

import { AlignLeft, PaintBucket, Mic } from "lucide-react";

import { CaptionStylePanel } from "./caption-style-panel";
import { CaptionTimeline } from "./caption-timeline";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../ui/tabs";

/**
 * Props for the CaptionSettings component
 * @interface CaptionSettingsProps
 * @property {CaptionOverlay} localOverlay - Current caption overlay being edited
 * @property {Function} setLocalOverlay - Function to update the caption overlay
 * @property {number} currentFrame - Current frame position in the video
 * @property {number} startFrame - Starting frame of the caption overlay
 * @property {Caption[]} captions - Array of caption objects
 */
interface CaptionSettingsProps {
  localOverlay: CaptionOverlay;
  setLocalOverlay: (overlay: CaptionOverlay) => void;
  currentFrame: number;
  startFrame: number;
  captions: Caption[];
}

/**
 * Default styling configuration for captions
 * Defines the base appearance for all captions including font, size, colors, and highlight effects
 */
export const defaultCaptionStyles: CaptionStyles = {
  fontFamily: "Inter, sans-serif",
  fontSize: "2.5rem",
  lineHeight: 1.4,
  textAlign: "center",
  color: "#FFFFFF",
  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
  padding: "24px",
  highlightStyle: {
    backgroundColor: "rgba(20, 184, 166, 0.95)",
    scale: 1.1,
    fontWeight: 600,
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
  },
};

/**
 * CaptionSettings Component
 *
 * @component
 * @description
 * Provides a tabbed interface for managing caption settings including:
 * - Caption text and timing management
 * - Visual style customization
 * - Voice settings (planned feature)
 *
 * The component uses a tab-based layout to organize different aspects of caption
 * configuration, making it easier for users to focus on specific settings.
 *
 * @example
 * ```tsx
 * <CaptionSettings
 *   localOverlay={captionOverlay}
 *   setLocalOverlay={handleOverlayUpdate}
 *   currentFrame={30}
 *   startFrame={0}
 *   captions={[...]}
 * />
 * ```
 */
export const CaptionSettings: React.FC<CaptionSettingsProps> = ({
  localOverlay,
  setLocalOverlay,
  currentFrame,
}) => {
  const currentMs = (currentFrame / 30) * 1000;

  return (
    <Tabs defaultValue="captions" className="w-full">
      {/* Tab Navigation */}
      <TabsList className="w-full grid grid-cols-3 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-sm border border-gray-200 dark:border-gray-700 gap-1">
        {/* Captions Tab */}
        <TabsTrigger
          value="captions"
          className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
            rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
        >
          <span className="flex items-center gap-2 text-xs">
            <AlignLeft className="w-3 h-3" />
            Captions
          </span>
        </TabsTrigger>

        {/* Display Tab */}
        <TabsTrigger
          value="display"
          className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
            rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
        >
          <span className="flex items-center gap-2 text-xs">
            <PaintBucket className="w-3 h-3" />
            Style
          </span>
        </TabsTrigger>

        {/* Voice Tab (Coming Soon) */}
        <TabsTrigger
          value="voice"
          disabled
          className="cursor-not-allowed opacity-50 rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400"
        >
          <span className="flex items-center gap-2 text-xs">
            <Mic className="w-3 h-3" />
            Voice
            <span className="text-[9px] ml-2 text-amber-700 dark:text-amber-400 font-medium bg-amber-100/50 dark:bg-yellow-800/50 rounded-sm px-1 py-0.5">
              SOON
            </span>
          </span>
        </TabsTrigger>
      </TabsList>

      {/* Tab Content */}
      <TabsContent
        value="display"
        className="space-y-4 mt-4 focus-visible:outline-none"
      >
        <CaptionStylePanel
          localOverlay={localOverlay}
          setLocalOverlay={setLocalOverlay}
        />
      </TabsContent>

      <TabsContent
        value="captions"
        className="space-y-4 mt-4 focus-visible:outline-none"
      >
        <CaptionTimeline
          localOverlay={localOverlay}
          setLocalOverlay={setLocalOverlay}
          currentMs={currentMs}
        />
      </TabsContent>
    </Tabs>
  );
};
