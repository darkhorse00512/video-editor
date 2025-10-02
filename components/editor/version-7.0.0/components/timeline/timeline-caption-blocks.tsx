import { useTimeline } from "../../contexts/timeline-context";
import { Caption } from "../../types";
import { Type } from "lucide-react";

/**
 * Props for the TimelineCaptionBlocks component
 */
interface TimelineCaptionBlocksProps {
  /** Array of caption objects containing words and timing information */
  captions: Caption[];
  /** Total number of frames in the video */
  durationInFrames: number;
  /** Current frame being displayed */
  currentFrame: number;
  /** Starting frame of the timeline segment */
  startFrame: number;
  /** Total duration of the video in frames */
  totalDuration: number;
}

/**
 * TimelineCaptionBlocks component displays caption words as interactive blocks on a timeline.
 *
 * The component has two display modes:
 * 1. Label mode (when zoomed out): Shows a simple "Captions" label with word count
 * 2. Detailed mode (when zoomed in): Shows individual words as blocks with dynamic sizing
 *
 * Features:
 * - Words are positioned based on their timing information
 * - Active words are highlighted as the video plays
 * - Font size scales logarithmically with zoom level
 * - Responsive design with hover states and transitions
 *
 * @param props - {@link TimelineCaptionBlocksProps}
 */
const TimelineCaptionBlocks: React.FC<TimelineCaptionBlocksProps> = ({
  captions,
  durationInFrames,
  currentFrame,
  startFrame,
  totalDuration,
}) => {
  const { zoomScale } = useTimeline();

  const relativeFrame = currentFrame - startFrame;
  const currentMs = (relativeFrame / 30) * 1000; // Assuming 30fps

  const totalDurationSeconds = totalDuration / 30;
  const shouldShowLabel = zoomScale <= 1 && totalDurationSeconds > 20;

  if (shouldShowLabel) {
    const totalWords = captions.reduce(
      (sum, caption) => sum + caption.words.length,
      0
    );

    return (
      <div className="absolute inset-0 flex items-center z-20">
        <div className="flex items-center text-[9px] rounded px-1.5 py-0.5 mx-1 group-hover:mx-6 active:mx-6 selection:mx-6 transition-all duration-200 ease-in-out bg-blue-900/90 text-blue-200 min-w-0">
          <div className="flex items-center gap-0.5 min-w-0">
            <Type className="w-2 h-2 flex-shrink-0" />
            <span className="capitalize truncate min-w-[20px] max-w-[80px]">
              Captions
            </span>
            {/* Hide word count on very small widths */}
            <div className="hidden xs:flex items-center">
              <span className="opacity-75 mx-1 font-light">|</span>
              <span className="opacity-75 font-light whitespace-nowrap">
                {totalWords} words
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Improved font size calculation with logarithmic scaling
  const getFontSize = () => {
    const minSize = 8;
    const maxSize = 11; // Reduced from 12
    // Use logarithmic scaling for smoother growth at higher zoom levels
    const scale = Math.log10(zoomScale + 1);
    const size = minSize + Math.min(scale * 2, 3) * ((maxSize - minSize) / 3);
    return `${Math.round(size)}px`;
  };

  return (
    <div className="absolute inset-0 flex w-full h-full z-10 pointer-events-none">
      {captions?.map((caption, index) => {
        const captionWidth =
          ((caption.endMs - caption.startMs) /
            ((durationInFrames / 30) * 1000)) *
          100;

        return (
          <div
            key={index}
            className="h-full flex items-center justify-start pointer-events-auto"
            style={{
              width: `${captionWidth}%`,
              left: `${
                (caption.startMs / ((durationInFrames / 30) * 1000)) * 100
              }%`,
              position: "absolute",
            }}
          >
            {caption.words.map((word, wordIndex) => {
              const wordWidth =
                ((word.endMs - word.startMs) /
                  (caption.endMs - caption.startMs)) *
                100;
              const isWordActive =
                currentMs >= word.startMs && currentMs < word.endMs;

              return (
                <div
                  key={wordIndex}
                  className={`flex p-[3px] items-center justify-center mx-[1px] rounded-[3px] transition-all duration-150 ${
                    isWordActive ? "bg-blue-500" : "bg-blue-700/50"
                  }`}
                  style={{
                    width: `${wordWidth}%`,
                  }}
                >
                  <span
                    className={`truncate ${
                      isWordActive ? "text-white font-medium" : "text-blue-200"
                    }`}
                    style={{
                      fontSize: getFontSize(),
                    }}
                  >
                    {word.word}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default TimelineCaptionBlocks;
