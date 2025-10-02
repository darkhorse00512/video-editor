import React from "react";
import { StickerTemplate, StickerTemplateProps } from "../base-template";
import { random, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface BoomEffectProps extends StickerTemplateProps {
  text?: string;
  particleCount?: number;
  baseColor?: string;
}

const BoomEffectComponent: React.FC<BoomEffectProps> = ({
  overlay,
  text = "BOOM!",
  particleCount = 150,
  baseColor = "200",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const particles = Array.from({ length: particleCount }).map((_, i) => {
    const baseAngle = (i / particleCount) * Math.PI * 2;
    const rotationSpeed = 0.015;
    const rotatingAngle = baseAngle + frame * rotationSpeed;

    const scale = spring({
      frame,
      fps,
      from: 0,
      to: random(i) * 0.8 + 0.2,
      config: { mass: 0.2, damping: 8 },
    });

    const distance = spring({
      frame,
      fps,
      from: 0,
      to: Math.min(overlay.width, overlay.height) * 0.45 + random(i) * 30,
      config: { mass: 0.3, damping: 8 },
    });

    const x = Math.cos(rotatingAngle) * distance;
    const y = Math.sin(rotatingAngle) * distance;
    const opacity = Math.max(0, 1 - frame / 45);

    return { x, y, opacity, scale };
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: Math.min(overlay.width, overlay.height) * 0.9,
        height: Math.min(overlay.width, overlay.height) * 0.9,
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${Math.min(
              1.2,
              frame / 8
            )})`,
            fontSize: `${Math.min(overlay.width, overlay.height) * 0.16}px`,
            fontWeight: "900",
            color: "white",
            textShadow: "0 0 15px rgba(255,255,255,0.7)",
            zIndex: 2,
          }}
        >
          {text}
        </div>

        {particles.map((particle, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px) scale(${particle.scale})`,
              width: "8px",
              height: "8px",
              backgroundColor: `hsl(${
                Number(baseColor) + (i / particleCount) * 30
              }, 100%, 65%)`,
              borderRadius: "50%",
              opacity: particle.opacity,
              boxShadow: "0 0 8px rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const boomEffect: StickerTemplate = {
  config: {
    id: "boom-effect",
    name: "Boom Effect",
    category: "Default",
    layout: "single",
    defaultProps: {
      text: "BOOM!",
      particleCount: 150,
      baseColor: "200",
    },
    isPro: true,
  },
  Component: BoomEffectComponent,
};
