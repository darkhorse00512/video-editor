import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { StickerTemplate, StickerTemplateProps } from "../base-template";

interface CardFlipProps extends StickerTemplateProps {
  frontColor?: string;
  backColor?: string;
  frontText?: string;
  backText?: string;
}

const CardFlipComponent: React.FC<CardFlipProps> = ({
  overlay,
  frontColor = "linear-gradient(45deg, #1e3a8a, #3b82f6)",
  backColor = "linear-gradient(45deg, #1e3a8a, #3b82f6)",
  frontText = "Remotion 👋",
  backText = "Back",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotation = spring({
    frame,
    fps,
    from: 0,
    to: 360,
    config: {
      damping: 15,
      mass: 0.5,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
      }}
    >
      <div
        style={{
          width: `${overlay.width}px`,
          height: `${overlay.height}px`,
          transform: `translate(-50%, -50%) rotateY(${rotation}deg)`,
          transformStyle: "preserve-3d",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: frontColor,
            borderRadius: "6px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: `${overlay.height * 0.1}px`,
            fontWeight: "bold",
            color: "white",
          }}
        >
          {frontText}
        </div>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: backColor,
            borderRadius: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: `${overlay.height * 0.1}px`,
            fontWeight: "bold",
            color: "white",
            transform: "rotateY(180deg)",
          }}
        >
          {backText}
        </div>
      </div>
    </div>
  );
};

export const cardFlip: StickerTemplate = {
  config: {
    id: "card-flip",
    name: "Card Flip",
    category: "Default",
    layout: "double",
    defaultProps: {
      frontColor: "linear-gradient(45deg, #1e3a8a, #3b82f6)",
      backColor: "linear-gradient(45deg, #1e3a8a, #3b82f6)",
      frontText: "React Video Editor!",
      backText: "Flip me!",
    },
    isPro: true,
  },
  Component: CardFlipComponent,
};
