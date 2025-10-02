import { StickerTemplate } from "./base-template";
import { discountSticker } from "./discount-sticker";

import { emojiStickers } from "./emoji-sticker";
import { shapeStickers } from "./shapes";
import { circularProgress } from "./circular-progress";
import { cardFlip } from "./card-flip";
import { audioVisualiser } from "./audio-visualiser";
import { matrixRain } from "./matrix-effect";
import { boomEffect } from "./boom-effect";
import { barChart } from "./bar-chart";

// Import other sticker templates here

// This array will grow as you add more sticker templates
const templates: StickerTemplate[] = [
  discountSticker,
  circularProgress,
  audioVisualiser,
  cardFlip,
  matrixRain,
  boomEffect,
  barChart,
  ...emojiStickers,
  ...shapeStickers,
  // Add other sticker templates here
];

// Group templates by category
export const templatesByCategory = templates.reduce((acc, template) => {
  const { category } = template.config;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(template);
  return acc;
}, {} as Record<string, StickerTemplate[]>);

// Create a lookup map for quick access
export const templateMap = templates.reduce((acc, template) => {
  acc[template.config.id] = template;
  return acc;
}, {} as Record<string, StickerTemplate>);

// Helper to get all available categories
export const getStickerCategories = () => Object.keys(templatesByCategory);

// Helper to get templates for a category
export const getTemplatesForCategory = (category: string) =>
  templatesByCategory[category] || [];
