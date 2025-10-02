import { Audio } from "remotion";
import { SoundOverlay } from "../../../types";
import { toAbsoluteUrl } from "../../../utils/url-helper";

interface SoundLayerContentProps {
  overlay: SoundOverlay;
  baseUrl?: string;
}

export const SoundLayerContent: React.FC<SoundLayerContentProps> = ({
  overlay,
  baseUrl,
}) => {
  // Determine the audio source URL
  let audioSrc = overlay.src;

  // If it's a relative URL and baseUrl is provided, use baseUrl
  if (overlay.src.startsWith("/") && baseUrl) {
    audioSrc = `${baseUrl}${overlay.src}`;
  }
  // Otherwise use the toAbsoluteUrl helper for relative URLs
  else if (overlay.src.startsWith("/")) {
    audioSrc = toAbsoluteUrl(overlay.src);
  }

  return (
    <Audio
      src={audioSrc}
      startFrom={overlay.startFromSound || 0}
      volume={overlay.styles?.volume ?? 1}
    />
  );
};
