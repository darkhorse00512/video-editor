import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, Check, Video } from "lucide-react";
import { MEDIA_FILTER_PRESETS } from "../../../templates/common/media-filter-presets";
import { ClipOverlay } from "../../../types";
import { getCachedVideoThumbnail } from "../../../utils/video-frame-extractor";

interface VideoFilterPresetSelectorProps {
  localOverlay: ClipOverlay;
  handleStyleChange: (updates: Partial<ClipOverlay["styles"]>) => void;
}

/**
 * VideoFilterPresetSelector Component
 *
 * A specialized component for selecting predefined filters for video overlays.
 * Uses the first frame of the video as a preview thumbnail for each filter preset.
 * This provides users with an accurate preview of how each filter will look on their video.
 *
 * @component
 * @param {VideoFilterPresetSelectorProps} props - Component props
 * @returns {JSX.Element} A grid of filter previews using video frames
 */
export const VideoFilterPresetSelector: React.FC<
  VideoFilterPresetSelectorProps
> = ({ localOverlay, handleStyleChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string>("");
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  // Extract video thumbnail when component mounts or video URL changes
  useEffect(() => {
    const extractThumbnail = async () => {
      const videoUrl = localOverlay.content;
      if (videoUrl && videoUrl !== videoThumbnail) {
        setIsLoadingThumbnail(true);
        try {
          const thumbnail = await getCachedVideoThumbnail(videoUrl);
          setVideoThumbnail(thumbnail);
        } catch (error) {
          console.error("Error extracting video thumbnail:", error);
          setVideoThumbnail("");
        } finally {
          setIsLoadingThumbnail(false);
        }
      }
    };

    extractThumbnail();
  }, [localOverlay.content, videoThumbnail]);

  // Determine which preset (if any) is currently active
  const getCurrentPresetId = (): string => {
    const currentFilter = localOverlay?.styles?.filter || "none";

    // If no filter is applied or it's explicitly "none", return "none"
    if (!currentFilter || currentFilter === "none") {
      return "none";
    }

    // Try to find a matching preset
    const matchingPreset = MEDIA_FILTER_PRESETS.find(
      (preset) => preset.filter === currentFilter
    );

    // Return the matching preset ID or "custom" if no match is found
    return matchingPreset?.id || "custom";
  };

  // Get the current preset name for display
  const getCurrentPresetName = (): string => {
    const currentId = getCurrentPresetId();
    if (currentId === "custom") return "Custom";
    const preset = MEDIA_FILTER_PRESETS.find((p) => p.id === currentId);
    return preset?.name || "None";
  };

  // When a new preset is selected, apply its filter
  const handlePresetChange = (presetId: string) => {
    const selectedPreset = MEDIA_FILTER_PRESETS.find(
      (preset) => preset.id === presetId
    );

    if (selectedPreset) {
      // Preserve any brightness adjustments if the user has made them
      let newFilter = selectedPreset.filter;

      // If we're selecting "none", remove all filters
      if (presetId === "none") {
        newFilter = "none";
      }
      // Otherwise, try to preserve brightness from existing filter
      else {
        const currentFilter = localOverlay?.styles?.filter;
        const brightnessMatch = currentFilter?.match(/brightness\((\d+)%\)/);

        if (
          brightnessMatch &&
          brightnessMatch[1] &&
          !newFilter.includes("brightness") &&
          newFilter !== "none"
        ) {
          // Add brightness to the new filter if the new filter doesn't already have it
          newFilter = `${newFilter} brightness(${brightnessMatch[1]}%)`;
        }
      }

      handleStyleChange({ filter: newFilter });
      setIsExpanded(false);
    }
  };

  // Get the content to display in the preview
  const getMediaContent = () => {
    // For videos, use the extracted thumbnail if available, otherwise fall back to video URL
    return videoThumbnail || localOverlay.content;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Video className="w-3 h-3 text-muted-foreground" />
          <label className="text-xs text-muted-foreground">Video Filter Preset</label>
        </div>
      </div>

      {/* Current filter display and toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center w-full bg-background border border-input rounded-md text-xs p-2 hover:border-accent-foreground transition-colors text-foreground"
      >
        <span>{getCurrentPresetName()}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded filter grid */}
      {isExpanded && (
        <div className="mt-2 grid grid-cols-3 gap-2 bg-background p-2 rounded-md border border-input shadow-sm">
          {MEDIA_FILTER_PRESETS.map((preset) => {
            const isActive = getCurrentPresetId() === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`relative p-1 rounded-md overflow-hidden flex flex-col items-center transition-all ${
                  isActive ? "ring-2 ring-primary" : "hover:bg-muted"
                }`}
              >
                {/* Video thumbnail with filter applied */}
                <div className="relative h-12 w-full mb-1 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {isLoadingThumbnail ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={getMediaContent()}
                      alt={`${preset.name} video filter preview`}
                      className="w-full h-full object-cover"
                      style={{ filter: preset.filter }}
                      onError={(e) => {
                        // Fallback for when thumbnail extraction fails
                        const target = e.target as HTMLImageElement;
                        target.src = localOverlay.content;
                      }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                      <Check className="h-3 w-3 text-background" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] leading-tight text-center">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Show video info when thumbnail is loading */}
      {localOverlay.type === "video" && isLoadingThumbnail && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          Extracting video frame for filter preview...
        </div>
      )}
    </div>
  );
};