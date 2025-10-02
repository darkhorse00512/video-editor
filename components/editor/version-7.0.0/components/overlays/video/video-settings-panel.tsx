import React from "react";
import { ClipOverlay } from "../../../types";
import { AnimationSettings } from "../../shared/animation-preview";
import { animationTemplates } from "../../../templates/animation-templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPEED_OPTIONS = [
  { value: 0.25, label: "0.25x" },
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x (Normal)" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
  { value: 4, label: "4x" },
];

/**
 * Props for the VideoSettingsPanel component
 * @interface VideoSettingsPanelProps
 * @property {ClipOverlay} localOverlay - The current overlay object containing video settings and styles
 * @property {Function} handleStyleChange - Callback function to update overlay styles
 * @property {Function} onSpeedChange - Callback function to update speed and duration
 */
interface VideoSettingsPanelProps {
  localOverlay: ClipOverlay;
  handleStyleChange: (updates: Partial<ClipOverlay["styles"]>) => void;
  onSpeedChange?: (speed: number, newDuration: number) => void;
}

/**
 * VideoSettingsPanel Component
 *
 * A panel that provides controls for configuring video overlay settings including:
 * - Volume control with mute/unmute functionality
 * - Enter/Exit animation selection
 *
 * The component uses a local overlay state and provides a UI for users to modify
 * video-specific settings. Changes are propagated through the handleStyleChange callback.
 *
 * @component
 * @param {VideoSettingsPanelProps} props - Component props
 * @returns {JSX.Element} The rendered settings panel
 */
export const VideoSettingsPanel: React.FC<VideoSettingsPanelProps> = ({
  localOverlay,
  handleStyleChange,
  onSpeedChange,
}) => {
  // Add state to control select open state
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);

  // Cleanup effect for unmounting
  React.useEffect(() => {
    return () => {
      // Ensure select is closed when component unmounts
      setIsSelectOpen(false);
    };
  }, []);

  const handleSpeedChange = (newSpeed: number) => {
    if (localOverlay) {
      // Get the base duration (duration at 1x speed)
      const baseDuration =
        localOverlay.durationInFrames * (localOverlay.speed ?? 1);
      // Calculate new duration based on new speed
      const newDuration = Math.round(baseDuration / newSpeed);

      if (onSpeedChange) {
        onSpeedChange(newSpeed, newDuration);
      } else {
        console.warn(
          "onSpeedChange not provided, speed changes will not work. Please provide onSpeedChange prop to handle speed updates."
        );
      }
      // Close select after change
      setIsSelectOpen(false);
    }
  };

  // Handlers for animation selection
  const handleEnterAnimationSelect = (animationKey: string) => {
    handleStyleChange({
      animation: {
        ...localOverlay?.styles?.animation,
        enter: animationKey,
      },
    });
  };

  const handleExitAnimationSelect = (animationKey: string) => {
    handleStyleChange({
      animation: {
        ...localOverlay?.styles?.animation,
        exit: animationKey,
      },
    });
  };

  return (
    <div className="space-y-2">
      {/* Volume Settings */}
      <div className="space-y-4 rounded-md bg-gray-100/50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Volume
          </h3>
          <button
            onClick={() =>
              handleStyleChange({
                volume: localOverlay?.styles?.volume === 0 ? 1 : 0,
              })
            }
            className={`text-xs px-2.5 py-1.5 rounded-md transition-colors ${
              (localOverlay?.styles?.volume ?? 1) === 0
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30"
                : "bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {(localOverlay?.styles?.volume ?? 1) === 0 ? "Unmute" : "Mute"}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localOverlay?.styles?.volume ?? 1}
            onChange={(e) =>
              handleStyleChange({ volume: parseFloat(e.target.value) })
            }
            className="flex-1 accent-blue-500 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[40px] text-right">
            {Math.round((localOverlay?.styles?.volume ?? 1) * 100)}%
          </span>
        </div>
      </div>

      {/* Speed Settings */}
      <div className="space-y-4 rounded-md bg-gray-100/50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Playback Speed
          </h3>
          <button
            onClick={() => {
              handleSpeedChange(1);
              setIsSelectOpen(false);
            }}
            className={`text-xs px-2.5 py-1.5 rounded-md transition-colors ${
              (localOverlay?.speed ?? 1) !== 1
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30"
                : "bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Select
            open={isSelectOpen}
            onOpenChange={setIsSelectOpen}
            value={String(localOverlay?.speed ?? 1)}
            onValueChange={(value) => handleSpeedChange(parseFloat(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select speed" />
            </SelectTrigger>
            <SelectContent>
              {SPEED_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Animation Settings - Using the new AnimationSettings component */}
      <AnimationSettings
        animations={animationTemplates}
        selectedEnterAnimation={localOverlay?.styles?.animation?.enter}
        selectedExitAnimation={localOverlay?.styles?.animation?.exit}
        onEnterAnimationSelect={handleEnterAnimationSelect}
        onExitAnimationSelect={handleExitAnimationSelect}
      />
    </div>
  );
};
