import React from "react";
import { TextOverlay } from "../../../types";
import { AnimationSettings } from "../../shared/animation-preview";
import { animationTemplates } from "../../../templates/animation-templates";

/**
 * Props for the TextSettingsPanel component
 * @interface TextSettingsPanelProps
 * @property {TextOverlay} localOverlay - The current text overlay object containing styles and animation settings
 * @property {Function} handleStyleChange - Callback function to handle style changes for the text overlay
 */
interface TextSettingsPanelProps {
  localOverlay: TextOverlay;
  handleStyleChange: (field: keyof TextOverlay["styles"], value: any) => void;
}

/**
 * Panel component for managing text overlay animation settings
 * Allows users to select enter and exit animations for text overlays
 *
 * @component
 * @param {TextSettingsPanelProps} props - Component props
 * @returns {JSX.Element} A panel with animation selection options
 */
export const TextSettingsPanel: React.FC<TextSettingsPanelProps> = ({
  localOverlay,
  handleStyleChange,
}) => {
  // Handlers for animation selection
  const handleEnterAnimationSelect = (animationKey: string) => {
    handleStyleChange("animation", {
      ...localOverlay.styles.animation,
      enter: animationKey,
    });
  };

  const handleExitAnimationSelect = (animationKey: string) => {
    handleStyleChange("animation", {
      ...localOverlay.styles.animation,
      exit: animationKey,
    });
  };

  return (
    <AnimationSettings
      animations={animationTemplates}
      selectedEnterAnimation={localOverlay.styles.animation?.enter}
      selectedExitAnimation={localOverlay.styles.animation?.exit}
      onEnterAnimationSelect={handleEnterAnimationSelect}
      onExitAnimationSelect={handleExitAnimationSelect}
    />
  );
};
