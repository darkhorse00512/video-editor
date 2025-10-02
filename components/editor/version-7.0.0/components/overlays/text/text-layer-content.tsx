import React from "react";
import { useCurrentFrame } from "remotion";
import { TextOverlay } from "../../../types";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMerriweather } from "@remotion/google-fonts/Merriweather";
import { loadFont as loadRobotoMono } from "@remotion/google-fonts/RobotoMono";
import { loadFont as loadVT323 } from "@remotion/google-fonts/VT323";
import { loadFont as loadLeagueSpartan } from "@remotion/google-fonts/LeagueSpartan";
import { loadFont as loadBungeeInline } from "@remotion/google-fonts/BungeeInline";
import { animationTemplates } from "../../../templates/animation-templates";

// Updated font loading with specific weights and subsets
const { fontFamily: interFontFamily } = loadInter("normal", {
  weights: ["700"],
});

const { fontFamily: merriweatherFontFamily } = loadMerriweather("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: robotoMonoFontFamily } = loadRobotoMono("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const { fontFamily: vt323FontFamily } = loadVT323("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const { fontFamily: leagueSpartanFontFamily } = loadLeagueSpartan("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const { fontFamily: bungeeInlineFontFamily } = loadBungeeInline("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

interface TextLayerContentProps {
  overlay: TextOverlay;
}

// Font family mapping function
const getFontFamily = (fontClass: string) => {
  switch (fontClass) {
    case "font-sans":
      return interFontFamily;
    case "font-serif":
      return merriweatherFontFamily;
    case "font-mono":
      return robotoMonoFontFamily;
    case "font-retro":
      return vt323FontFamily;
    case "font-league-spartan":
      return leagueSpartanFontFamily;
    case "font-bungee-inline":
      return bungeeInlineFontFamily;
    default:
      return interFontFamily;
  }
};

export const TextLayerContent: React.FC<TextLayerContentProps> = ({
  overlay,
}) => {
  const frame = useCurrentFrame();

  // Calculate if we're in the exit phase (last 30 frames)
  const isExitPhase = frame >= overlay.durationInFrames - 30;

  // Apply enter animation only during entry phase
  const enterAnimation =
    !isExitPhase && overlay.styles.animation?.enter
      ? animationTemplates[overlay.styles.animation.enter]?.enter(
          frame,
          overlay.durationInFrames
        )
      : {};

  // Apply exit animation only during exit phase
  const exitAnimation =
    isExitPhase && overlay.styles.animation?.exit
      ? animationTemplates[overlay.styles.animation.exit]?.exit(
          frame,
          overlay.durationInFrames
        )
      : {};

  // Calculate base font size using a more sophisticated approach
  const calculateFontSize = () => {
    const aspectRatio = overlay.width / overlay.height;
    const lines = overlay.content.split("\n");
    const numLines = lines.length;
    const maxLineLength = Math.max(...lines.map((line) => line.length));

    // Base size on container dimensions
    const areaBasedSize = Math.sqrt(
      (overlay.width * overlay.height) / (maxLineLength * numLines)
    );
    let fontSize = areaBasedSize * 1.2; // Scaling factor

    // Adjust for number of lines
    if (numLines > 1) {
      fontSize *= Math.max(0.5, 1 - numLines * 0.1);
    }

    // Adjust for line length
    if (maxLineLength > 20) {
      fontSize *= Math.max(0.6, 1 - (maxLineLength - 20) / 100);
    }

    // Adjust for extreme aspect ratios
    if (aspectRatio > 2 || aspectRatio < 0.5) {
      fontSize *= 0.8;
    }

    // Set minimum and maximum bounds
    return Math.max(12, Math.min(fontSize, (overlay.height / numLines) * 0.8));
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center", // Center vertically
    textAlign: overlay.styles.textAlign,
    justifyContent:
      overlay.styles.textAlign === "center"
        ? "center"
        : overlay.styles.textAlign === "right"
        ? "flex-end"
        : "flex-start",
    overflow: "hidden",
    ...(isExitPhase ? exitAnimation : enterAnimation),
  };

  const { ...restStyles } = overlay.styles;
  console.log("OVERLAY", overlay.styles.backgroundColor);
  const textStyle: React.CSSProperties = {
    ...restStyles,
    animation: undefined,
    fontSize: `${calculateFontSize()}px`,
    fontFamily: getFontFamily(overlay.styles.fontFamily),
    maxWidth: "100%",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    lineHeight: "1.2",
    padding: "0.1em",
    ...(isExitPhase ? exitAnimation : enterAnimation),
  };

  return (
    <div style={containerStyle}>
      <div style={textStyle}>{overlay.content}</div>
    </div>
  );
};
