import React, { useCallback } from "react";
import { AbsoluteFill } from "remotion";

import { Overlay } from "../types";
import { SortedOutlines } from "../components/selection/sorted-outlines";
import { Layer } from "../components/core/layer";

/**
 * Props for the Main component
 */
export type MainProps = {
  /** Array of overlay objects to be rendered */
  readonly overlays: Overlay[];
  /** Function to set the currently selected overlay ID */
  readonly setSelectedOverlayId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  /** Currently selected overlay ID, or null if none selected */
  readonly selectedOverlayId: number | null;
  /**
   * Function to update an overlay
   * @param overlayId - The ID of the overlay to update
   * @param updater - Function that receives the current overlay and returns an updated version
   */
  readonly changeOverlay: (
    overlayId: number,
    updater: (overlay: Overlay) => Overlay
  ) => void;
  /** Duration in frames of the composition */
  readonly durationInFrames: number;
  /** Frames per second of the composition */
  readonly fps: number;
  /** Width of the composition */
  readonly width: number;
  /** Height of the composition */
  readonly height: number;
  /** Base URL for media assets (optional) */
  readonly baseUrl?: string;
};

const outer: React.CSSProperties = {
  backgroundColor: "#111827",
};

const layerContainer: React.CSSProperties = {
  overflow: "hidden",
  maxWidth: "3000px",
};

/**
 * Main component that renders a canvas-like area with overlays and their outlines.
 * Handles selection of overlays and provides a container for editing them.
 *
 * @param props - Component props of type MainProps
 * @returns React component that displays overlays and their interactive outlines
 */
export const Main: React.FC<MainProps> = ({
  overlays,
  setSelectedOverlayId,
  selectedOverlayId,
  changeOverlay,
  baseUrl,
}) => {
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) {
        return;
      }

      setSelectedOverlayId(null);
    },
    [setSelectedOverlayId]
  );

  return (
    <AbsoluteFill
      style={{
        ...outer,
      }}
      onPointerDown={onPointerDown}
    >
      <AbsoluteFill style={layerContainer}>
        {overlays.map((overlay) => {
          return (
            <Layer
              key={overlay.id}
              overlay={overlay}
              selectedOverlayId={selectedOverlayId}
              baseUrl={baseUrl}
            />
          );
        })}
      </AbsoluteFill>
      <SortedOutlines
        selectedOverlayId={selectedOverlayId}
        overlays={overlays}
        setSelectedOverlayId={setSelectedOverlayId}
        changeOverlay={changeOverlay}
      />
    </AbsoluteFill>
  );
};
