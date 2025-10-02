import React from "react";
import { StickerOverlay } from "../../types";

export interface StickerTemplateProps {
  overlay: StickerOverlay;
  isSelected: boolean;
  onUpdate?: (updates: Partial<StickerOverlay>) => void;
}

export interface StickerTemplateConfig {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  defaultProps?: Record<string, any>;
  isPro?: boolean;
  layout?: "single" | "double";
}

export interface StickerTemplate {
  config: StickerTemplateConfig;
  Component: React.ComponentType<StickerTemplateProps>;
}
