import { Overlay, OverlayType } from "./types";

// Default and maximum number of rows to display in the editor
export const INITIAL_ROWS = 5;
export const MAX_ROWS = 8;
// Frames per second for video rendering
export const FPS = 30;

// Name of the component being tested/rendered
export const COMP_NAME = "TestComponent";

// Video configuration
export const DURATION_IN_FRAMES = 30;
export const VIDEO_WIDTH = 1280; // 720p HD video dimensions
export const VIDEO_HEIGHT = 720;

// UI configuration
export const ROW_HEIGHT = 44; // Slightly increased from 48
export const SHOW_LOADING_PROJECT_ALERT = true; // Controls visibility of asset loading indicator
export const DISABLE_MOBILE_LAYOUT = false;

/**
 * This constant disables video keyframe extraction in the browser. Enable this if you're working with
 * multiple videos or large video files to improve performance. Keyframe extraction is CPU-intensive and can
 * cause browser lag. For production use, consider moving keyframe extraction to the server side.
 * Future versions of Remotion may provide more efficient keyframe handling.
 */
export const DISABLE_VIDEO_KEYFRAMES = false;

// AWS deployment configuration
export const SITE_NAME = "sams-site";
export const LAMBDA_FUNCTION_NAME =
  "remotion-render-4-0-272-mem2048mb-disk2048mb-120sec";
export const REGION = "us-east-1";

// Zoom control configuration
export const ZOOM_CONSTRAINTS = {
  min: 0.2, // Minimum zoom level
  max: 10, // Maximum zoom level
  step: 0.1, // Smallest increment for manual zoom controls
  default: 1, // Default zoom level
  zoomStep: 0.15, // Zoom increment for zoom in/out buttons
  wheelStep: 0.3, // Zoom increment for mouse wheel
  transitionDuration: 100, // Animation duration in milliseconds
  easing: "cubic-bezier(0.4, 0.0, 0.2, 1)", // Smooth easing function for zoom transitions
};

// Timeline Snapping configuration
export const SNAPPING_CONFIG = {
  thresholdFrames: 1, // Default snapping sensitivity in frames
  enableVerticalSnapping: true, // Enable snapping to items in adjacent rows
};

// Add new constant for push behavior
export const ENABLE_PUSH_ON_DRAG = false; // Set to false to disable pushing items on drag

// Render configuration
// NOTE: TO CHANGE RENDER TYPE, UPDATE THE RENDER_TYPE CONSTANT
export const RENDER_TYPE: "ssr" | "lambda" = "lambda";

// Autosave configuration
export const AUTO_SAVE_INTERVAL = 10000; // Autosave every 10 seconds

export const DEFAULT_OVERLAYS: Overlay[] = [
  {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    durationInFrames: 61,
    from: 0,
    id: 791325,
    rotation: 0,
    row: 3,
    isDragging: false,
    type: OverlayType.VIDEO,
    content: "/images/video-player-placeholder.png",
    src: "/api/video-proxy?url=" + encodeURIComponent("https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"),
    videoStartTime: 0,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      padding: "50px",
      paddingBackgroundColor: "#ffffff",
      filter:
        "contrast(130%) sepia(45%) brightness(85%) saturate(160%) hue-rotate(5deg)",
    },
  },
  {
    left: 24,
    top: 127,
    width: 1195,
    height: 444,
    durationInFrames: 47,
    from: 9,
    id: 407242,
    row: 1,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "MAKE",
    styles: {
      fontSize: "3rem",
      fontWeight: "700",
      color: "rgba(255, 169, 2, 1)",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.1",
      textAlign: "center",
      letterSpacing: "-0.03em",
      opacity: 1,
      zIndex: 1,
      transform: "none",
    },
  },
  {
    left: 38,
    top: 141,
    width: 1195,
    height: 444,
    durationInFrames: 48,
    from: 9,
    id: 162812,
    row: 2,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "MAKE",
    styles: {
      fontSize: "3rem",
      fontWeight: "700",
      color: "rgb(24, 23, 22)",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.1",
      textAlign: "center",
      letterSpacing: "-0.03em",
      opacity: 1,
      zIndex: 1,
      transform: "none",
    },
  },
  {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    durationInFrames: 52,
    from: 57,
    id: 634772,
    rotation: 0,
    row: 2,
    isDragging: false,
    type: OverlayType.VIDEO,
    content:
      "https://images.pexels.com/videos/7778850/pexels-photo-7778850.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    src: "https://videos.pexels.com/video-files/7778850/7778850-uhd_2732_1440_25fps.mp4",
    videoStartTime: 0,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      filter:
        "contrast(130%) sepia(45%) brightness(85%) saturate(160%) hue-rotate(5deg)",
      padding: "50px",
      paddingBackgroundColor: "#ffffff",
    },
  },
  {
    left: 24,
    top: 127,
    width: 1195,
    height: 444,
    durationInFrames: 40,
    from: 62,
    id: 957241,
    row: 0,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "GREAT",
    styles: {
      fontSize: "3rem",
      fontWeight: "700",
      color: "rgba(255, 169, 2, 1)",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.1",
      textAlign: "center",
      letterSpacing: "-0.03em",
      opacity: 1,
      zIndex: 1,
      transform: "none",
    },
  },
  {
    left: 38,
    top: 141,
    width: 1195,
    height: 444,
    durationInFrames: 41,
    from: 62,
    id: 671754,
    row: 1,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "GREAT",
    styles: {
      fontSize: "3rem",
      fontWeight: "700",
      color: "rgb(24, 23, 22)",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.1",
      textAlign: "center",
      letterSpacing: "-0.03em",
      opacity: 1,
      zIndex: 1,
      transform: "none",
    },
  },
  {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    durationInFrames: 54,
    from: 101,
    id: 949039,
    rotation: 0,
    row: 3,
    isDragging: false,
    type: OverlayType.VIDEO,
    content: "/images/video-player-placeholder.png",
    src: "/api/video-proxy?url=" + encodeURIComponent("https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"),
    videoStartTime: 0,
    styles: {
      opacity: 1,
      padding: "50px",
      paddingBackgroundColor: "#ffffff",
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      filter:
        "contrast(130%) sepia(45%) brightness(85%) saturate(160%) hue-rotate(5deg)",
    },
  },
  {
    left: 24,
    top: 127,
    width: 1195,
    height: 444,
    durationInFrames: 47,
    from: 108,
    id: 947381,
    row: 0,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "VIDEOS",
    styles: {
      fontSize: "3rem",
      fontWeight: "700",
      color: "rgba(255, 169, 2, 1)",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.1",
      textAlign: "center",
      letterSpacing: "-0.03em",
      padding: "50px",
      paddingBackgroundColor: "#ffffff",
      opacity: 1,
      zIndex: 1,
      transform: "none",
    },
  },
  {
    left: 38,
    top: 141,
    width: 1195,
    height: 444,
    durationInFrames: 47,
    from: 108,
    id: 286216,
    row: 1,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "VIDEOS",
    styles: {
      fontSize: "3rem",
      fontWeight: "700",
      color: "rgb(24, 23, 22)",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1.1",
      textAlign: "center",
      letterSpacing: "-0.03em",
      opacity: 1,
      zIndex: 1,
      transform: "none",
    },
  },
  {
    id: 957242,
    type: OverlayType.SOUND,
    content: "Another Lowfi",
    src: "https://rwxrdxvxndclnqvznxfj.supabase.co/storage/v1/object/public/sounds/sound-3.mp3?t=2024-11-04T03%3A52%3A35.101Z",
    from: 0,
    row: 4,
    left: 0,
    top: 0,
    width: 1920,
    height: 100,
    rotation: 0,
    isDragging: false,
    durationInFrames: 156,
    styles: {
      opacity: 1,
    },
  },
];
