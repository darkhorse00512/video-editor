import React from "react";
import { StickerTemplate, StickerTemplateProps } from "../base-template";
import { interpolate, useCurrentFrame } from "remotion";

interface BarChartProps extends StickerTemplateProps {
  data?: Array<{ x: number; y: number; label: string }>;
  accentColor?: string;
}

const BarChartComponent: React.FC<BarChartProps> = ({
  overlay,
  data = [
    { x: 0, y: 50, label: "Jan" },
    { x: 1, y: 80, label: "Feb" },
    { x: 2, y: 30, label: "Mar" },
    { x: 3, y: 70, label: "Apr" },
    { x: 4, y: 45, label: "May" },
    { x: 5, y: 90, label: "Jun" },
    { x: 6, y: 60, label: "Jul" },
    { x: 7, y: 75, label: "Aug" },
    { x: 8, y: 40, label: "Sep" },
    { x: 9, y: 85, label: "Oct" },
  ],
}) => {
  const frame = useCurrentFrame();

  // Color palette for bars
  const colors = [
    "#4361ee",
    "#3a0ca3",
    "#7209b7",
    "#f72585",
    "#4cc9f0",
    "#4895ef",
    "#560bad",
    "#b5179e",
    "#f15bb5",
    "#00b4d8",
  ];

  // Adjust container and chart dimensions
  const containerWidth = overlay?.width || 900;
  const containerHeight = overlay?.height || 500;
  const chartWidth = containerWidth * 0.9; // Add some margin
  const chartHeight = containerHeight * 0.85; // Add space for labels
  const padding = Math.min(20, chartWidth * 0.025); // Reduce padding

  // Scale data to fit chart dimensions
  const xScale = (x: number) =>
    (x / (data.length - 1)) * (chartWidth - padding * 2) + padding;

  const barWidth = ((chartWidth - padding * 2) / data.length) * 0.85;

  // Add dynamic font size calculations
  const baseFontSize = Math.min(containerWidth, containerHeight) * 0.038;
  const labelFontSize = baseFontSize * 0.9;
  const valueFontSize = baseFontSize;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: `0px`,
          overflow: "hidden",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${containerWidth} ${containerHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Center the chart group */}
          <g
            transform={`translate(${(containerWidth - chartWidth) / 2}, ${
              (containerHeight - chartHeight) / 2
            })`}
          >
            {/* X-axis line */}
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
            />

            {/* X-axis labels with dynamic font size */}
            {data.map((point, i) => (
              <text
                key={`x-label-${i}`}
                x={xScale(point.x)}
                y={chartHeight - padding + 25}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.8)"
                fontSize={labelFontSize}
                fontWeight="500"
              >
                {point.label}
              </text>
            ))}

            {/* Bar chart with animation and different colors */}
            {data.map((point, i) => {
              const barHeight = (point.y / 100) * (chartHeight - padding * 2);

              // Animation that grows bars from bottom
              const barProgress = interpolate(
                frame,
                [i * 3, 15 + i * 3],
                [0, 1],
                { extrapolateRight: "clamp" }
              );

              const currentHeight = barHeight * barProgress;
              const currentY = chartHeight - padding - currentHeight;

              return (
                <g key={`bar-${i}`}>
                  <rect
                    x={xScale(point.x) - barWidth / 2}
                    y={currentY}
                    width={barWidth}
                    height={currentHeight}
                    fill={colors[i % colors.length]}
                    rx="0"
                    ry="0"
                    filter="url(#shadow)"
                  />
                  <text
                    x={xScale(point.x)}
                    y={currentY - 10}
                    textAnchor="middle"
                    fill="white"
                    fontSize={valueFontSize}
                    fontWeight="bold"
                    opacity={barProgress > 0.9 ? 1 : 0}
                  >
                    {point.y}
                  </text>
                </g>
              );
            })}

            {/* Define shadow filter */}
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="4"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>
          </g>
        </svg>
      </div>
    </div>
  );
};

export const barChart: StickerTemplate = {
  config: {
    id: "bar-chart",
    name: "Bar Chart",
    category: "Default",
    layout: "double",
    defaultProps: {
      data: [
        { x: 0, y: 50, label: "Jan" },
        { x: 1, y: 80, label: "Feb" },
        { x: 2, y: 30, label: "Mar" },
        { x: 3, y: 70, label: "Apr" },
        { x: 4, y: 45, label: "May" },
      ],
      width: 280, // Match the preview width
      height: 140, // Match the preview height
    },
    isPro: true,
  },
  Component: BarChartComponent,
};
