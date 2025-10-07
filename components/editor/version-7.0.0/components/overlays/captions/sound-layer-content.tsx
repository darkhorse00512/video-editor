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

  // If it's a video-proxy URL, it should already be converted to original URL by Lambda render route
  // But if we're still seeing video-proxy URLs, convert them here as a fallback
  if (audioSrc.includes('/api/video-proxy?url=')) {
    try {
      const urlObj = new URL(audioSrc, 'http://localhost:3000'); // Use localhost as base for parsing
      const encodedUrl = urlObj.searchParams.get('url');
      if (encodedUrl) {
        audioSrc = decodeURIComponent(encodedUrl);
        console.log('SoundLayerContent: Converted video-proxy URL to original:', {
          original: overlay.src,
          converted: audioSrc
        });
      }
    } catch (error) {
      console.error('SoundLayerContent: Error converting video-proxy URL:', error);
    }
  }
  // If it's a relative URL and baseUrl is provided, use baseUrl
  else if (audioSrc.startsWith("/") && baseUrl) {
    audioSrc = `${baseUrl}${audioSrc}`;
  }
  // Otherwise use the toAbsoluteUrl helper for relative URLs
  else if (audioSrc.startsWith("/")) {
    audioSrc = toAbsoluteUrl(audioSrc);
  }

  return (
    <Audio
      src={audioSrc}
      startFrom={overlay.startFromSound || 0}
      volume={overlay.styles?.volume ?? 1}
    />
  );
};
