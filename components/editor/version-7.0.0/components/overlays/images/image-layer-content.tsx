import React from "react";
import { useCurrentFrame } from "remotion";
import { ImageOverlay } from "../../../types";
import { animationTemplates } from "../../../templates/animation-templates";
import { Img } from "remotion";
import { toAbsoluteUrl } from "../../../utils/url-helper";

/**
 * Props for the ImageLayerContent component
 * @interface ImageLayerContentProps
 * @property {ImageOverlay} overlay - The image overlay object containing source and style information
 * @property {string | undefined} baseUrl - The base URL for the image
 */
interface ImageLayerContentProps {
  overlay: ImageOverlay;
  baseUrl?: string;
}

/**
 * ImageLayerContent Component
 *
 * @component
 * @description
 * Renders an image layer in the video editor with animation support.
 * Features include:
 * - Enter/exit animations
 * - Style customization (fit, position, opacity)
 * - Transform effects
 * - Visual effects (filters, shadows, borders)
 * - Filter presets (retro, vintage, noir, etc.)
 * - Border radius customization
 *
 * The component handles both the visual presentation and animation
 * timing for image overlays.
 *
 * @example
 * ```tsx
 * <ImageLayerContent
 *   overlay={{
 *     src: "path/to/image.jpg",
 *     styles: {
 *       objectFit: "cover",
 *       filter: "contrast(120%) saturate(110%)", // Can be a preset or custom filter
 *       borderRadius: "8px",
 *       animation: {
 *         enter: "fadeIn",
 *         exit: "fadeOut"
 *       }
 *     }
 *   }}
 * />
 * ```
 */
export const ImageLayerContent: React.FC<ImageLayerContentProps> = ({
  overlay,
  baseUrl,
}) => {
  const frame = useCurrentFrame();
  const isExitPhase = frame >= overlay.durationInFrames - 30;

  /**
   * Apply enter animation only during entry phase
   */
  const enterAnimation =
    !isExitPhase && overlay.styles.animation?.enter
      ? animationTemplates[overlay.styles.animation.enter]?.enter(
          frame,
          overlay.durationInFrames
        )
      : {};

  /**
   * Apply exit animation only during exit phase
   */
  const exitAnimation =
    isExitPhase && overlay.styles.animation?.exit
      ? animationTemplates[overlay.styles.animation.exit]?.exit(
          frame,
          overlay.durationInFrames
        )
      : {};

  /**
   * Combine base styles with current animation phase
   */
  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: overlay.styles.objectFit || "cover",
    objectPosition: overlay.styles.objectPosition,
    opacity: overlay.styles.opacity,
    transform: overlay.styles.transform || "none",
    filter: overlay.styles.filter || "none",
    borderRadius: overlay.styles.borderRadius || "0px",
    boxShadow: overlay.styles.boxShadow || "none",
    border: overlay.styles.border || "none",
    ...(isExitPhase ? exitAnimation : enterAnimation),
  };

  /**
   * Create a container style that includes padding and background color
   */
  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    padding: overlay.styles.padding || "0px",
    backgroundColor: overlay.styles.paddingBackgroundColor || "transparent",
    display: "flex", // Use flexbox for centering
    alignItems: "center",
    justifyContent: "center",
  };

  // Determine the image source URL
  let imageSrc = overlay.src;

  // If it's a relative URL and baseUrl is provided, use baseUrl
  if (overlay.src.startsWith("/") && baseUrl) {
    imageSrc = `${baseUrl}${overlay.src}`;
  }
  // Otherwise use the toAbsoluteUrl helper for relative URLs
  else if (overlay.src.startsWith("/")) {
    imageSrc = toAbsoluteUrl(overlay.src);
  }

  return (
    <div style={containerStyle}>
      <Img src={imageSrc} style={imageStyle} alt="" />
    </div>
  );
};
