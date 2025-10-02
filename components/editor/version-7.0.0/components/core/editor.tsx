"use client";

import React from "react";
import { EditorHeader } from "./editor-header";

import { useEditorContext } from "../../contexts/editor-context";
import { TimelineControls } from "../timeline/timeline-controls";
import { DISABLE_MOBILE_LAYOUT, FPS } from "../../constants";
import Timeline from "../timeline/timeline";
import { VideoPlayer } from "./video-player";

/**
 * Main Editor Component
 *
 * @component
 * @description
 * The core editor interface that orchestrates the video editing experience.
 * This component manages:
 * - Video playback and controls
 * - Timeline visualization and interaction
 * - Overlay management (selection, modification, deletion)
 * - Responsive behavior for desktop/mobile views
 *
 * The component uses the EditorContext to manage state and actions across
 * its child components. It implements a responsive design that shows a
 * mobile-specific message for smaller screens.
 *
 * Key features:
 * - Video player integration
 * - Timeline controls (play/pause, seeking)
 * - Overlay management (selection, modification)
 * - Frame-based navigation
 * - Mobile detection and fallback UI
 *
 * @example
 * ```tsx
 * <Editor />
 * ```
 */
export const Editor: React.FC = () => {
  /** State to track if the current viewport is mobile-sized */
  const [isMobile, setIsMobile] = React.useState(false);

  /**
   * Effect to handle mobile detection and window resize events
   * Uses 768px as the standard mobile breakpoint
   */
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Effect to prevent any scrolling and handle mobile viewport issues
   */
  React.useEffect(() => {
    // Function to handle viewport issues on mobile
    const handleResize = () => {
      // Set CSS custom property for viewport height to use instead of h-screen
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Initial call
    handleResize();

    // Handle orientation changes and resizes
    window.addEventListener("resize", handleResize);

    // Prevent any scrolling on body
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  /**
   * Destructure values and functions from the editor context
   * These provide core functionality for the editor's features
   */
  const {
    overlays, // Array of current overlay objects
    selectedOverlayId, // ID of the currently selected overlay
    setSelectedOverlayId, // Function to update selected overlay
    isPlaying, // Current playback state
    currentFrame, // Current frame position
    playerRef, // Reference to video player
    togglePlayPause, // Function to toggle play/pause
    formatTime, // Function to format time display
    handleOverlayChange, // Function to handle overlay modifications
    handleTimelineClick, // Function to handle timeline interaction
    deleteOverlay, // Function to remove an overlay
    duplicateOverlay, // Function to clone an overlay
    splitOverlay, // Function to split an overlay at current position
    durationInFrames, // Total duration in frames
    setOverlays, // Function to update overlays
  } = useEditorContext();

  /**
   * Mobile fallback UI
   * Displays a message when accessed on mobile devices
   */
  if (isMobile && DISABLE_MOBILE_LAYOUT) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 p-6">
        <div className="text-center text-gray-900 dark:text-white">
          <h2 className="text-xl font-bold mb-3">React Video Editor</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light mb-4">
            Currently, React Video Editor is designed as a full-screen desktop
            experience. We&apos;re actively working on making it
            mobile-friendly! 👀
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
            Want mobile support? Let us know by voting{" "}
            <a
              href="https://reactvideoeditor.featurebase.app/p/bulb-mobile-layout-version-2"
              className="text-blue-600 font-medium dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            !
          </p>
        </div>
      </div>
    );
  }

  /**
   * Main editor layout
   * Organized in a column layout with the following sections:
   * 1. Editor header (controls and options)
   * 2. Main content area (video player)
   * 3. Timeline controls
   * 4. Timeline visualization
   */
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "calc(var(--vh, 1vh) * 100)",
        maxHeight: "-webkit-fill-available" /* Safari fix */,
      }}
    >
      <EditorHeader />
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        <VideoPlayer playerRef={playerRef} />
      </div>

      <TimelineControls
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        currentFrame={currentFrame}
        totalDuration={durationInFrames}
        formatTime={formatTime}
      />

      {/* 
        Timeline Component
        Note: On mobile devices, this component also renders the MobileNavBar 
        at the bottom with a scrollable interface similar to TimelineControls
        for easy access to content creation tools.
      */}
      <Timeline
        currentFrame={currentFrame}
        overlays={overlays}
        durationInFrames={durationInFrames}
        selectedOverlayId={selectedOverlayId}
        setSelectedOverlayId={setSelectedOverlayId}
        onOverlayChange={handleOverlayChange}
        onOverlayDelete={deleteOverlay}
        onOverlayDuplicate={duplicateOverlay}
        onSplitOverlay={splitOverlay}
        setCurrentFrame={(frame) => {
          if (playerRef.current) {
            playerRef.current.seekTo(frame / FPS);
          }
        }}
        setOverlays={setOverlays}
        onTimelineClick={handleTimelineClick}
      />
    </div>
  );
};
