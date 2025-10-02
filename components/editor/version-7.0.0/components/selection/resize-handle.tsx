import React, { useCallback, useMemo } from "react";
import { useCurrentScale } from "remotion";
import { Overlay, OverlayType } from "../../types";
import { MAX_ROWS } from "../../constants";

const HANDLE_SIZE = 12;

/**
 * ResizeHandle component renders a draggable handle for resizing overlays in the editor.
 * It appears as a small white square with a blue border at the corners of a selected overlay.
 *
 * @component
 * @param {Object} props
 * @param {'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'} props.type - Position of the handle
 * @param {Function} props.setOverlay - Callback to update the overlay's properties
 * @param {Overlay} props.overlay - The overlay object being resized
 *
 * Features:
 * - Scales appropriately with zoom level using Remotion's useCurrentScale
 * - Maintains correct z-index based on overlay row position
 * - Supports dragging to resize from any corner
 * - Prevents resizing below 1x1 pixels
 * - Updates overlay dimensions and position in real-time while dragging
 * - Not displayed for sound-type overlays
 */
export const ResizeHandle: React.FC<{
  type: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  setOverlay: (
    overlayId: number,
    updater: (overlay: Overlay) => Overlay
  ) => void;
  overlay: Overlay;
}> = ({ type, setOverlay, overlay }) => {
  const scale = useCurrentScale();
  const size = Math.round(HANDLE_SIZE / scale);
  const borderSize = 1 / scale;

  const sizeStyle: React.CSSProperties = useMemo(() => {
    const zIndex = (MAX_ROWS - (overlay.row || 0)) * 10 + 20000;
    return {
      position: "absolute",
      height: Number.isFinite(size) ? size : HANDLE_SIZE,
      width: Number.isFinite(size) ? size : HANDLE_SIZE,
      backgroundColor: "white",
      border: `${borderSize}px solid #3B8BF2`,
      zIndex,
      pointerEvents: "all",
    };
  }, [borderSize, size, overlay.row]);

  const margin = -size / 2 - borderSize;

  const style: React.CSSProperties = useMemo(() => {
    if (type === "top-left") {
      return {
        ...sizeStyle,
        marginLeft: margin,
        marginTop: margin,
        cursor: "nwse-resize",
      };
    }

    if (type === "top-right") {
      return {
        ...sizeStyle,
        marginTop: margin,
        marginRight: margin,
        right: 0,
        cursor: "nesw-resize",
      };
    }

    if (type === "bottom-left") {
      return {
        ...sizeStyle,
        marginBottom: margin,
        marginLeft: margin,
        bottom: 0,
        cursor: "nesw-resize",
      };
    }

    if (type === "bottom-right") {
      return {
        ...sizeStyle,
        marginBottom: margin,
        marginRight: margin,
        right: 0,
        bottom: 0,
        cursor: "nwse-resize",
      };
    }

    throw new Error("Unknown type: " + JSON.stringify(type));
  }, [margin, sizeStyle, type]);

  const onPointerDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.button !== 0) {
        return;
      }

      const initialX = e.clientX;
      const initialY = e.clientY;

      const onPointerMove = (pointerMoveEvent: PointerEvent) => {
        const offsetX = (pointerMoveEvent.clientX - initialX) / scale;
        const offsetY = (pointerMoveEvent.clientY - initialY) / scale;

        const isLeft = type === "top-left" || type === "bottom-left";
        const isTop = type === "top-left" || type === "top-right";

        setOverlay(overlay.id, (i) => {
          const newWidth = overlay.width + (isLeft ? -offsetX : offsetX);
          const newHeight = overlay.height + (isTop ? -offsetY : offsetY);
          const newLeft = overlay.left + (isLeft ? offsetX : 0);
          const newTop = overlay.top + (isTop ? offsetY : 0);

          return {
            ...i,
            width: Math.max(1, Math.round(newWidth)),
            height: Math.max(1, Math.round(newHeight)),
            left: Math.min(
              overlay.left + overlay.width - 1,
              Math.round(newLeft)
            ),
            top: Math.min(overlay.top + overlay.height - 1, Math.round(newTop)),
            isDragging: true,
          };
        });
      };

      const onPointerUp = () => {
        setOverlay(overlay.id, (i) => {
          return {
            ...i,
            isDragging: false,
          };
        });
        window.removeEventListener("pointermove", onPointerMove);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", onPointerUp, {
        once: true,
      });
    },
    [overlay, scale, setOverlay, type]
  );

  if (overlay.type === OverlayType.SOUND) {
    return null;
  }

  return <div onPointerDown={onPointerDown} style={style} />;
};
