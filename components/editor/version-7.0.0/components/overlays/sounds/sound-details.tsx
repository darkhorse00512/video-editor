import React, { useRef, useState, useEffect } from "react";
import { SoundOverlay } from "../../../types";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Interface for the props passed to the SoundDetails component
 * @interface
 * @property {SoundOverlay} localOverlay - The current sound overlay object containing source and styles
 * @property {Function} setLocalOverlay - Callback function to update the sound overlay
 */
interface SoundDetailsProps {
  localOverlay: SoundOverlay;
  setLocalOverlay: (overlay: SoundOverlay) => void;
}

/**
 * SoundDetails Component
 *
 * A component that provides an interface for playing and controlling sound overlays.
 * Features include:
 * - Play/pause functionality
 * - Volume control with mute/unmute option
 * - Visual feedback for playback state
 *
 * @component
 * @param {SoundDetailsProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const SoundDetails: React.FC<SoundDetailsProps> = ({
  localOverlay,
  setLocalOverlay,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(localOverlay.src);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [localOverlay.src]);

  /**
   * Toggles the play/pause state of the audio
   * Handles audio playback and updates the UI state
   */
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * Updates the styles of the sound overlay
   * @param {Partial<SoundOverlay["styles"]>} updates - Partial style updates to apply
   */
  const handleStyleChange = (updates: Partial<SoundOverlay["styles"]>) => {
    const updatedOverlay = {
      ...localOverlay,
      styles: {
        ...localOverlay.styles,
        ...updates,
      },
    };
    setLocalOverlay(updatedOverlay);
  };

  return (
    <div className="space-y-4">
      {/* Sound Info with Play Button */}
      <div className="flex items-center gap-3 p-4 bg-background/50 rounded-md border">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="h-8 w-8 rounded-full bg-transparent hover:bg-accent text-foreground"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {localOverlay.content}
          </p>
        </div>
      </div>

      {/* Settings Tabs */}

      <div className="space-y-4 mt-4">
        <div className="space-y-6">
          {/* Volume Settings */}
          <div className="space-y-4 rounded-md bg-background/50 p-4 border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Volume</h3>
              <button
                onClick={() =>
                  handleStyleChange({
                    volume: localOverlay?.styles?.volume === 0 ? 1 : 0,
                  })
                }
                className={`text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                  (localOverlay?.styles?.volume ?? 1) === 0
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {(localOverlay?.styles?.volume ?? 1) === 0 ? "Unmute" : "Mute"}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localOverlay?.styles?.volume ?? 1}
                onChange={(e) =>
                  handleStyleChange({ volume: parseFloat(e.target.value) })
                }
                className="flex-1 accent-primary h-1.5 rounded-full bg-muted"
              />
              <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                {Math.round((localOverlay?.styles?.volume ?? 1) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
