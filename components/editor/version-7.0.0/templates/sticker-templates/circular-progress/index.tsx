import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { StickerTemplate, StickerTemplateProps } from "../base-template";

interface CircularProgressProps extends StickerTemplateProps {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  dotColor?: string;
}

const CircularProgressComponent: React.FC<CircularProgressProps> = ({
  overlay,
  primaryColor = "#3b82f6",
  secondaryColor = "#1e3a8a",
  backgroundColor = "rgba(255, 255, 255, 0.1)",
  dotColor = "#3b82f6",
}) => {
  const frame = useCurrentFrame();
  //   const { fps } = useVideoConfig();

  // Calculate progress based on frame
  const progress = interpolate(frame % 90, [0, 90], [0, 100], {
    extrapolateRight: "clamp",
  });

  // Calculate rotation for the loading effect
  const rotation = (frame * 4) % 360;

  // Calculate radius and circumference
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Pulse effect
  const pulse = 1 + Math.sin(frame / 10) * 0.05;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: Math.min(overlay.width, overlay.height) * 0.9,
          height: Math.min(overlay.width, overlay.height) * 0.9,
          transform: `scale(${pulse})`,
        }}
      >
        {/* Background circle */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
          style={{
            position: "absolute",
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth="12"
          />
        </svg>

        {/* Progress circle */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
          style={{
            position: "absolute",
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={primaryColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />

          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>
        </svg>

        {/* Rotating dots */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
          style={{
            position: "absolute",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <circle cx="100" cy="20" r="8" fill={dotColor} />
        </svg>

        {/* Percentage text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: `${overlay.height * 0.15}px`,
            fontWeight: "bold",
            color: "white",
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

export const circularProgress: StickerTemplate = {
  config: {
    id: "circular-progress",
    name: "Circular Progress",
    category: "Default",
    layout: "single",
    defaultProps: {
      primaryColor: "#3b82f6",
      secondaryColor: "#1e3a8a",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      dotColor: "#3b82f6",
    },
    isPro: true,
  },
  Component: CircularProgressComponent,
};
