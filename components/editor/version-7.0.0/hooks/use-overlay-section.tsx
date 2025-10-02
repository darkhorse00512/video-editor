// hooks/use-overlay-selection.tsx
import { useCallback } from "react";
import { useEditorContext } from "../contexts/editor-context";
import { useSidebar } from "../contexts/sidebar-context";
import { Overlay, OverlayType } from "../types";

/**
 * A custom hook that manages overlay selection in the editor.
 *
 * @returns {Object} An object containing:
 *   - handleOverlaySelect: A callback function to handle overlay selection and update the sidebar panel
 *
 * @example
 * const { handleOverlaySelect } = useOverlaySelection();
 * // Later in your component:
 * <OverlayComponent onClick={() => handleOverlaySelect(overlay)} />
 */
export const useOverlaySelection = () => {
  const { setSelectedOverlayId } = useEditorContext();
  const { setActivePanel } = useSidebar();

  const handleOverlaySelect = useCallback(
    (overlay: Overlay) => {
      setSelectedOverlayId(overlay.id);

      // Set the appropriate sidebar panel based on overlay type
      switch (overlay.type) {
        case OverlayType.TEXT:
          setActivePanel(OverlayType.TEXT);
          break;
        case OverlayType.VIDEO:
          setActivePanel(OverlayType.VIDEO);
          break;
        case OverlayType.SOUND:
          setActivePanel(OverlayType.SOUND);
          break;
        case OverlayType.STICKER:
          setActivePanel(OverlayType.STICKER);
          break;
        case OverlayType.IMAGE:
          setActivePanel(OverlayType.IMAGE);
          break;
        case OverlayType.CAPTION:
          setActivePanel(OverlayType.CAPTION);
          break;
      }
    },
    [setSelectedOverlayId, setActivePanel]
  );

  return { handleOverlaySelect };
};
