import { useState, useEffect, useRef, useCallback } from "react";
import { PlayerRef } from "@remotion/player";
import { FPS } from "../constants";

/**
 * Custom hook for managing video player functionality
 * @returns An object containing video player controls and state
 */
export const useVideoPlayer = () => {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const playerRef = useRef<PlayerRef>(null);

  // Frame update effect
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdateTime = 0;
    const frameInterval = 1000 / FPS;

    const updateCurrentFrame = () => {
      const now = performance.now();
      if (now - lastUpdateTime >= frameInterval) {
        if (playerRef.current) {
          const frame = Math.round(playerRef.current.getCurrentFrame());
          setCurrentFrame(frame);
        }
        lastUpdateTime = now;
      }

      animationFrameId = requestAnimationFrame(updateCurrentFrame);
    };

    // Start the animation frame loop
    animationFrameId = requestAnimationFrame(updateCurrentFrame);

    // Clean up
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, FPS]);

  /**
   * Starts playing the video
   */
  const play = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  }, [playerRef]);

  /**
   * Toggles between play and pause states
   */
  const togglePlayPause = useCallback(() => {
    if (playerRef.current) {
      if (!isPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
      setIsPlaying(!isPlaying);
    }
  }, [playerRef, isPlaying]);

  /**
   * Converts frame count to formatted time string
   * @param frames - Number of frames to convert
   * @returns Formatted time string in MM:SS format
   */
  const formatTime = useCallback((frames: number) => {
    const totalSeconds = frames / FPS;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const frames2Digits = Math.floor(frames % FPS)
      .toString()
      .padStart(2, "0");

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${frames2Digits}`;
  }, []);

  /**
   * Seeks to a specific frame in the video
   * @param frame - Target frame number
   */
  const seekTo = useCallback(
    (frame: number) => {
      if (playerRef.current) {
        setCurrentFrame(frame);
        playerRef.current.seekTo(frame);
      }
    },
    [playerRef]
  );

  return {
    isPlaying,
    currentFrame,
    playerRef,
    togglePlayPause,
    formatTime,
    play,
    seekTo,
  };
};
