import React, { memo } from "react";
import { StickerOverlay } from "../../../types";
import { templateMap } from "../../../templates/sticker-templates/sticker-helpers";

interface StickerLayerContentProps {
  overlay: StickerOverlay;
  isSelected: boolean;
  onUpdate?: (updates: Partial<StickerOverlay>) => void;
}

export const StickerLayerContent: React.FC<StickerLayerContentProps> = memo(
  ({ overlay, isSelected, onUpdate }) => {
    const template = templateMap[overlay.content];

    if (!template) {
      console.warn(`No sticker template found for id: ${overlay.content}`);
      return null;
    }

    const { Component } = template;
    const MemoizedComponent = memo(Component);
    const props = {
      ...template.config.defaultProps,
      overlay,
      isSelected,
      onUpdate,
    };

    return <MemoizedComponent {...props} />;
  },
  (prevProps, nextProps) => {
    // Only re-render if these props change
    return (
      prevProps.overlay.content === nextProps.overlay.content &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.overlay.styles?.opacity === nextProps.overlay.styles?.opacity &&
      prevProps.overlay.rotation === nextProps.overlay.rotation &&
      prevProps.overlay.width === nextProps.overlay.width &&
      prevProps.overlay.height === nextProps.overlay.height
    );
  }
);

StickerLayerContent.displayName = "StickerLayerContent";
