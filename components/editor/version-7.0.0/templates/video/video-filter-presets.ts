/**
 * Re-export MediaFilterPresets to maintain backward compatibility
 * @deprecated Use media-filter-presets.ts instead
 */
export type { MediaFilterPreset as VideoFilterPreset } from "../common/media-filter-presets";
export {
  MEDIA_FILTER_PRESETS as VIDEO_FILTER_PRESETS,
  parseFilterString,
  getPresetById,
} from "../common/media-filter-presets";
