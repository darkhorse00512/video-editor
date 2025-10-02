"use client";

import React, { useState } from "react";
import { useEditorContext } from "../../../contexts/editor-context";
import { OverlayType, TextOverlay } from "../../../types";

import { TextDetails } from "./text-details";
import { SelectTextOverlay } from "./select-text-overlay";

export const TextOverlaysPanel: React.FC = () => {
  const { selectedOverlayId, overlays } = useEditorContext();
  const [localOverlay, setLocalOverlay] = useState<TextOverlay | null>(null);

  // Update local overlay when selected overlay changes or when overlays change
  React.useEffect(() => {
    if (selectedOverlayId === null) {
      return;
    }

    const selectedOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );

    if (selectedOverlay?.type === OverlayType.TEXT) {
      setLocalOverlay(selectedOverlay as TextOverlay);
    }
  }, [selectedOverlayId, overlays]);

  const handleSetLocalOverlay = (overlay: TextOverlay) => {
    setLocalOverlay(overlay);
  };

  const isValidTextOverlay = localOverlay && selectedOverlayId !== null;

  return (
    <div className="p-2 h-full bg-background">
      {!isValidTextOverlay ? (
        <SelectTextOverlay setLocalOverlay={handleSetLocalOverlay} />
      ) : (
        <TextDetails
          localOverlay={localOverlay}
          setLocalOverlay={handleSetLocalOverlay}
        />
      )}
    </div>
  );
};
