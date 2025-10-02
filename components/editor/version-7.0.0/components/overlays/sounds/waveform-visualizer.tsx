import { memo, useMemo } from "react";
import { WaveformData } from "../../../types";

/**
 * Interface for the WaveformVisualizer component props
 * @interface
 * @property {WaveformData} waveformData - Audio waveform data containing peaks
 * @property {number} totalDuration - Total duration of the audio in seconds
 * @property {number} durationInFrames - Duration in frames (at 30fps)
 */
interface WaveformVisualizerProps {
  waveformData: WaveformData;
  totalDuration: number;
  durationInFrames: number;
}

/**
 * WaveformVisualizer Component
 *
 * A memoized component that renders an audio waveform visualization.
 * Features:
 * - Responsive visualization that scales with the duration
 * - Automatic peak sampling for optimal display
 * - Visual representation of audio amplitude
 *
 * The component uses a logarithmic scale (power of 0.7) to better represent
 * the perceived loudness of the audio.
 *
 * @component
 * @param {WaveformVisualizerProps} props - Component properties
 * @returns {JSX.Element} Rendered waveform visualization
 */
const WaveformVisualizer = memo(
  ({
    waveformData,
    totalDuration,
    durationInFrames,
  }: WaveformVisualizerProps) => {
    const itemWidth = (durationInFrames / totalDuration) * 100;
    const peaksToShow = Math.min(
      waveformData.peaks.length,
      Math.max(50, Math.floor(itemWidth * 4))
    );

    const sampledPeaks = useMemo(
      () =>
        waveformData.peaks.filter(
          (_, index) =>
            index % Math.ceil(waveformData.peaks.length / peaksToShow) === 0
        ),
      [waveformData.peaks, peaksToShow]
    );

    return (
      <div className="absolute inset-0 flex items-center justify-between px-2">
        {sampledPeaks.map((peak, index) => {
          const height = Math.max(Math.pow(peak, 0.7) * 90, 4);
          return (
            <div
              key={index}
              className="relative flex-1 mx-[0.5px]"
              style={{ height: "100%" }}
            >
              <div
                className="absolute bottom-1/2 w-full bg-yellow-200 rounded-sm transform origin-center"
                style={{
                  height: `${height}%`,
                  transform: `translateY(50%)`,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

WaveformVisualizer.displayName = "WaveformVisualizer";

export default WaveformVisualizer;
