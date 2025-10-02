import { Composition } from "remotion";
import { Main } from "./main";
import { COMP_NAME, DURATION_IN_FRAMES, FPS } from "../constants";

/**
 * Root component for the Remotion project.
 * Sets up the composition and provides default props.
 */
export const RemotionRoot: React.FC = () => {
  const defaultMyCompProps: any = {
    overlays: [],
    durationInFrames: DURATION_IN_FRAMES,
    fps: FPS,
    width: 1920,
    height: 1920,
    src: "",
    setSelectedOverlayId: () => {},
    selectedOverlayId: null,
    changeOverlay: () => {},
  };

  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1920}
        /**
         * Dynamically calculates the video metadata based on the composition props.
         * These values will be reflected in the Remotion player/preview.
         * When the composition renders, it will use these dimensions and duration.
         *
         * @param props - The composition props passed to the component
         * @returns An object containing the video dimensions and duration
         */
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames,
            width: props.width,
            height: props.height,
          };
        }}
        defaultProps={defaultMyCompProps}
      />
    </>
  );
};
