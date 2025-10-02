import { interpolate } from "remotion";

export type AnimationTemplate = {
  name: string;
  preview: string;
  isPro?: boolean;
  enter: (
    frame: number,
    durationInFrames: number
  ) => {
    transform?: string;
    opacity?: number;
  };
  exit: (
    frame: number,
    durationInFrames: number
  ) => {
    transform?: string;
    opacity?: number;
  };
};

export const animationTemplates: Record<string, AnimationTemplate> = {
  fade: {
    name: "Fade",
    preview: "Simple fade in/out",
    enter: (frame) => ({
      opacity: interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
    }),
    exit: (frame, duration) => ({
      opacity: interpolate(frame, [duration - 15, duration], [1, 0], {
        extrapolateLeft: "clamp",
      }),
    }),
  },
  slideRight: {
    name: "Slide",
    preview: "Slide in from left",
    isPro: true,
    enter: (frame) => ({
      transform: `translateX(${interpolate(frame, [0, 15], [-100, 0], {
        extrapolateRight: "clamp",
      })}%)`,
      opacity: interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
    }),
    exit: (frame, duration) => ({
      transform: `translateX(${interpolate(
        frame,
        [duration - 15, duration],
        [0, 100],
        { extrapolateLeft: "clamp" }
      )}%)`,
      opacity: interpolate(frame, [duration - 15, duration], [1, 0], {
        extrapolateLeft: "clamp",
      }),
    }),
  },
  scale: {
    name: "Scale",
    preview: "Scale in/out",
    enter: (frame) => ({
      transform: `scale(${interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      })})`,
      opacity: interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
    }),
    exit: (frame, duration) => ({
      transform: `scale(${interpolate(
        frame,
        [duration - 15, duration],
        [1, 0],
        { extrapolateLeft: "clamp" }
      )})`,
      opacity: interpolate(frame, [duration - 15, duration], [1, 0], {
        extrapolateLeft: "clamp",
      }),
    }),
  },
  bounce: {
    name: "Bounce",
    preview: "Elastic bounce entrance",
    isPro: true,
    enter: (frame) => ({
      transform: `translateY(${interpolate(
        frame,
        [0, 10, 13, 15],
        [100, -10, 5, 0],
        { extrapolateRight: "clamp" }
      )}px)`,
      opacity: interpolate(frame, [0, 10], [0, 1], {
        extrapolateRight: "clamp",
      }),
    }),
    exit: (frame, duration) => ({
      transform: `translateY(${interpolate(
        frame,
        [duration - 15, duration - 13, duration - 10, duration],
        [0, 5, -10, 100],
        { extrapolateLeft: "clamp" }
      )}px)`,
      opacity: interpolate(frame, [duration - 10, duration], [1, 0], {
        extrapolateLeft: "clamp",
      }),
    }),
  },
  flipX: {
    name: "Flip",
    preview: "3D flip around X axis",
    isPro: true,
    enter: (frame) => ({
      transform: `perspective(400px) rotateX(${interpolate(
        frame,
        [0, 15],
        [90, 0],
        { extrapolateRight: "clamp" }
      )}deg)`,
      opacity: interpolate(frame, [0, 5, 15], [0, 0.7, 1], {
        extrapolateRight: "clamp",
      }),
    }),
    exit: (frame, duration) => ({
      transform: `perspective(400px) rotateX(${interpolate(
        frame,
        [duration - 15, duration],
        [0, -90],
        { extrapolateLeft: "clamp" }
      )}deg)`,
      opacity: interpolate(
        frame,
        [duration - 15, duration - 5, duration],
        [1, 0.7, 0],
        {
          extrapolateLeft: "clamp",
        }
      ),
    }),
  },
  zoomBlur: {
    name: "Zoom",
    preview: "Zoom with blur effect",
    isPro: true,
    enter: (frame) => ({
      transform: `scale(${interpolate(frame, [0, 15], [1.5, 1], {
        extrapolateRight: "clamp",
      })})`,
      opacity: interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
      filter: `blur(${interpolate(frame, [0, 15], [10, 0], {
        extrapolateRight: "clamp",
      })}px)`,
    }),
    exit: (frame, duration) => ({
      transform: `scale(${interpolate(
        frame,
        [duration - 15, duration],
        [1, 1.5],
        { extrapolateLeft: "clamp" }
      )})`,
      opacity: interpolate(frame, [duration - 15, duration], [1, 0], {
        extrapolateLeft: "clamp",
      }),
      filter: `blur(${interpolate(frame, [duration - 15, duration], [0, 10], {
        extrapolateLeft: "clamp",
      })}px)`,
    }),
  },
  slideUp: {
    name: "Slide",
    preview: "Modern slide from bottom",
    enter: (frame) => ({
      transform: `translateY(${interpolate(frame, [0, 15], [30, 0], {
        extrapolateRight: "clamp",
      })}px)`,
      opacity: interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
    }),
    exit: (frame, duration) => ({
      transform: `translateY(${interpolate(
        frame,
        [duration - 15, duration],
        [0, -30],
        { extrapolateLeft: "clamp" }
      )}px)`,
      opacity: interpolate(frame, [duration - 15, duration], [1, 0], {
        extrapolateLeft: "clamp",
      }),
    }),
  },
  snapRotate: {
    name: "Snap",
    preview: "Quick rotate with snap",
    isPro: true,
    enter: (frame) => ({
      transform: `rotate(${interpolate(frame, [0, 8, 12, 15], [-10, 5, -2, 0], {
        extrapolateRight: "clamp",
      })}deg) scale(${interpolate(frame, [0, 15], [0.8, 1], {
        extrapolateRight: "clamp",
      })})`,
      opacity: interpolate(frame, [0, 10], [0, 1], {
        extrapolateRight: "clamp",
      }),
    }),
    exit: (frame, duration) => ({
      transform: `rotate(${interpolate(
        frame,
        [duration - 15, duration - 12, duration - 8, duration],
        [0, -2, 5, -10],
        { extrapolateLeft: "clamp" }
      )}deg) scale(${interpolate(frame, [duration - 15, duration], [1, 0.8], {
        extrapolateLeft: "clamp",
      })})`,
      opacity: interpolate(frame, [duration - 10, duration], [1, 0], {
        extrapolateLeft: "clamp",
      }),
    }),
  },
  glitch: {
    name: "Glitch",
    preview: "Digital glitch effect",
    isPro: true,
    enter: (frame) => {
      const progress = interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      });
      // Create glitchy movements at specific keyframes
      const xOffset =
        frame % 3 === 0 ? (Math.random() * 10 - 5) * (1 - progress) : 0;
      const yOffset =
        frame % 4 === 0 ? (Math.random() * 8 - 4) * (1 - progress) : 0;

      return {
        transform: `translate(${xOffset}px, ${yOffset}px) scale(${interpolate(
          frame,
          [0, 3, 6, 10, 15],
          [0.9, 1.05, 0.95, 1.02, 1],
          { extrapolateRight: "clamp" }
        )})`,
        opacity: interpolate(frame, [0, 3, 5, 15], [0, 0.7, 0.8, 1], {
          extrapolateRight: "clamp",
        }),
      };
    },
    exit: (frame, duration) => {
      const progress = interpolate(frame, [duration - 15, duration], [0, 1], {
        extrapolateLeft: "clamp",
      });
      // Create glitchy movements at specific keyframes
      const xOffset =
        (duration - frame) % 3 === 0 ? (Math.random() * 10 - 5) * progress : 0;
      const yOffset =
        (duration - frame) % 4 === 0 ? (Math.random() * 8 - 4) * progress : 0;

      return {
        transform: `translate(${xOffset}px, ${yOffset}px) scale(${interpolate(
          frame,
          [duration - 15, duration - 10, duration - 6, duration - 3, duration],
          [1, 1.02, 0.95, 1.05, 0.9],
          { extrapolateLeft: "clamp" }
        )})`,
        opacity: interpolate(
          frame,
          [duration - 15, duration - 5, duration - 3, duration],
          [1, 0.8, 0.7, 0],
          {
            extrapolateLeft: "clamp",
          }
        ),
      };
    },
  },
  swipeReveal: {
    name: "Swipe",
    preview: "Reveals content with a swipe",
    isPro: true,
    enter: (frame) => ({
      transform: `translateX(${interpolate(frame, [0, 15], [0, 0], {
        extrapolateRight: "clamp",
      })}px)`,
      opacity: 1,
      clipPath: `inset(0 ${interpolate(frame, [0, 15], [100, 0], {
        extrapolateRight: "clamp",
      })}% 0 0)`,
    }),
    exit: (frame, duration) => ({
      transform: `translateX(${interpolate(
        frame,
        [duration - 15, duration],
        [0, 0],
        { extrapolateLeft: "clamp" }
      )}px)`,
      opacity: 1,
      clipPath: `inset(0 0 0 ${interpolate(
        frame,
        [duration - 15, duration],
        [0, 100],
        { extrapolateLeft: "clamp" }
      )}%)`,
    }),
  },
  floatIn: {
    name: "Float",
    preview: "Smooth floating entrance",
    enter: (frame) => ({
      transform: `translate(${interpolate(frame, [0, 15], [10, 0], {
        extrapolateRight: "clamp",
      })}px, ${interpolate(frame, [0, 15], [-20, 0], {
        extrapolateRight: "clamp",
      })}px)`,
      opacity: interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
    }),
    exit: (frame, duration) => ({
      transform: `translate(${interpolate(
        frame,
        [duration - 15, duration],
        [0, -10],
        { extrapolateLeft: "clamp" }
      )}px, ${interpolate(frame, [duration - 15, duration], [0, -20], {
        extrapolateLeft: "clamp",
      })}px)`,
      opacity: interpolate(frame, [duration - 15, duration], [1, 0], {
        extrapolateLeft: "clamp",
      }),
    }),
  },
};
