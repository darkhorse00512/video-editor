import React from "react";
import { random, useCurrentFrame } from "remotion";
import { StickerTemplate, StickerTemplateProps } from "../base-template";

interface AudioVisualiserProps extends StickerTemplateProps {
  barColor?: string;
  glowColor?: string;
  barCount?: number;
  barWidth?: number;
  barGap?: number;
}

const AudioVisualiserComponent: React.FC<AudioVisualiserProps> = ({
  overlay,
  barColor = "#3B82F6",
  glowColor = "rgba(59, 130, 246, 0.6)",
  barCount = 40,
  barWidth = 12,
  barGap = 4,
}) => {
  console.log("overlay", overlay);
  const frame = useCurrentFrame();

  const bars = Array.from({ length: barCount }).map((_, i) => {
    const seed = i * 1000;
    const height =
      Math.abs(Math.sin(frame / 10 + i / 2)) * 60 + random(seed) * 30;

    return {
      height,
      hue: (i / barCount) * 180 + frame,
    };
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: `${barGap}px`,
        padding: "32px",
      }}
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            width: `${barWidth}px`,
            height: `${bar.height}px`,
            background: barColor,
            borderRadius: `${barWidth / 2}px`,
            transition: "height 0.1s ease",
            boxShadow: `0 0 10px ${glowColor}`,
          }}
        />
      ))}
    </div>
  );
};

export const audioVisualiser: StickerTemplate = {
  config: {
    id: "audio-visualiser",
    name: "Audio Visualiser",
    category: "Default",
    layout: "double",
    defaultProps: {
      barColor: "#3B82F6",

      barCount: 40,
      barWidth: 12,
      barGap: 4,
    },
    isPro: true,
  },
  Component: AudioVisualiserComponent,
};
