import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";
import { MEDIA_FILTER_PRESETS } from "../../../templates/common/media-filter-presets";
import { ClipOverlay, ImageOverlay } from "../../../types";
import { getCachedVideoThumbnail } from "../../../utils/video-frame-extractor";

interface MediaFilterPresetSelectorProps {
  localOverlay: ClipOverlay | ImageOverlay;
  handleStyleChange: (
    updates: Partial<ClipOverlay["styles"] | ImageOverlay["styles"]>
  ) => void;
}

/**
 * MediaFilterPresetSelector Component
 *
 * A visual component for selecting predefined filters/presets for media (images and videos).
 * Displays visual previews of each filter applied to a thumbnail of the current media.
 *
 * @component
 * @param {MediaFilterPresetSelectorProps} props - Component props
 * @returns {JSX.Element} A grid of filter previews
 */
export const MediaFilterPresetSelector: React.FC<
  MediaFilterPresetSelectorProps
> = ({ localOverlay, handleStyleChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string>("");
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  // Extract video thumbnail when component mounts or video URL changes
  useEffect(() => {
    const extractThumbnail = async () => {
      if (localOverlay.type === "video") {
        const videoUrl = (localOverlay as ClipOverlay).content;
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
      }
    };

    extractThumbnail();
  }, [localOverlay, videoThumbnail]);

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

  // Get the content to display in the preview (either video thumbnail or image src)
  const getMediaContent = () => {
    if (localOverlay.type === "video") {
      // For videos, use the extracted thumbnail if available, otherwise fall back to video URL
      return videoThumbnail || (localOverlay as ClipOverlay).content;
    } else {
      return (localOverlay as ImageOverlay).src;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground">Filter Preset</label>
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
                {/* Media thumbnail with filter applied */}
                <div className="relative h-12 w-full mb-1 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {localOverlay.type === "video" && isLoadingThumbnail ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={getMediaContent()}
                      alt={`${preset.name} preview`}
                      className="w-full h-full object-cover"
                      style={{ filter: preset.filter }}
                      onError={(e) => {
                        // Fallback for when thumbnail extraction fails
                        const target = e.target as HTMLImageElement;
                        if (localOverlay.type === "video") {
                          target.src = (localOverlay as ClipOverlay).content;
                        }
                      }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                      <Check className="h-3 w-3 text-background" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
