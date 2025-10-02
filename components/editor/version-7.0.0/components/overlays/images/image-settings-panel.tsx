import React from "react";
import { ImageOverlay } from "../../../types";
import { AnimationSettings } from "../../shared/animation-preview";
import { animationTemplates } from "../../../templates/animation-templates";

/**
 * Props for the ImageSettingsPanel component
 */
interface ImageSettingsPanelProps {
  /** The current state of the image overlay being edited */
  localOverlay: ImageOverlay;
  /** Callback to update the overlay's style properties */
  handleStyleChange: (updates: Partial<ImageOverlay["styles"]>) => void;
}

/**
 * ImageSettingsPanel Component
 *
 * A panel that allows users to configure animation settings for an image overlay.
 * Provides options to set both enter and exit animations from a predefined set
 * of animation templates.
 *
 * Features:
 * - Enter animation selection
 * - Exit animation selection
 * - Option to remove animations ("None" selection)
 */
export const ImageSettingsPanel: React.FC<ImageSettingsPanelProps> = ({
  localOverlay,
  handleStyleChange,
}) => {
  // Handlers for animation selection
  const handleEnterAnimationSelect = (animationKey: string) => {
    handleStyleChange({
      animation: {
        ...localOverlay.styles.animation,
        enter: animationKey === "none" ? undefined : animationKey,
      },
    });
  };

  const handleExitAnimationSelect = (animationKey: string) => {
    handleStyleChange({
      animation: {
        ...localOverlay.styles.animation,
        exit: animationKey === "none" ? undefined : animationKey,
      },
    });
  };

  return (
    <div className="space-y-6">
      <AnimationSettings
        animations={animationTemplates}
        selectedEnterAnimation={localOverlay.styles.animation?.enter}
        selectedExitAnimation={localOverlay.styles.animation?.exit}
        onEnterAnimationSelect={handleEnterAnimationSelect}
        onExitAnimationSelect={handleExitAnimationSelect}
      />
    </div>
  );
};
