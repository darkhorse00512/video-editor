import React from "react";
import { Sequence } from "remotion";
import { SelectionOutline } from "./selected-outline";
import { Overlay } from "../../types";

/**
 * Sorts overlays by their row number to maintain proper stacking order
 * Lower row numbers should appear later in the array (top)
 */
const sortOverlaysByRow = (overlays: Overlay[]): Overlay[] => {
  const sorted = [...overlays].sort((a, b) => (a.row || 0) - (b.row || 0));
  return sorted;
};

/**
 * Renders a sorted list of selection outlines for overlays
 * Maintains natural stacking order based on row numbers
 * Each outline is wrapped in a Remotion Sequence component for timeline positioning
 *
 * @param props
 * @param props.overlays - Array of overlay objects to render
 * @param props.selectedOverlayId - ID of currently selected overlay
 * @param props.changeOverlay - Callback to modify an overlay's properties
 * @param props.setSelectedOverlayId - State setter for selected overlay ID
 */
export const SortedOutlines: React.FC<{
  overlays: Overlay[];
  selectedOverlayId: number | null;
  changeOverlay: (
    overlayId: number,
    updater: (overlay: Overlay) => Overlay
  ) => void;
  setSelectedOverlayId: React.Dispatch<React.SetStateAction<number | null>>;
}> = ({ overlays, selectedOverlayId, changeOverlay, setSelectedOverlayId }) => {
  const overlaysToDisplay = React.useMemo(
    () => sortOverlaysByRow(overlays),
    [overlays]
  );

  const isDragging = React.useMemo(
    () => overlays.some((overlay) => overlay.isDragging),
    [overlays]
  );

  return overlaysToDisplay.map((overlay) => {
    return (
      <Sequence
        key={overlay.id}
        from={overlay.from}
        durationInFrames={overlay.durationInFrames}
        layout="none"
      >
        <SelectionOutline
          changeOverlay={changeOverlay}
          overlay={overlay}
          setSelectedOverlayId={setSelectedOverlayId}
          selectedOverlayId={selectedOverlayId}
          isDragging={isDragging}
        />
      </Sequence>
    );
  });
};
