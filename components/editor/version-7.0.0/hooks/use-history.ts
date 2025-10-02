import { useState, useCallback, useEffect } from "react";
import { Overlay } from "../types";

interface HistoryState {
  past: Overlay[][];
  present: Overlay[];
  future: Overlay[][];
}

export function useHistory(
  overlays: Overlay[],
  setOverlays: (overlays: Overlay[]) => void
) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: overlays,
    future: [],
  });

  useEffect(() => {
    setHistory((prev) => {
      // Don't record history if this change was from undo/redo
      if (prev.present === overlays) return prev;

      return {
        past: [...prev.past, prev.present],
        present: overlays,
        future: [],
      };
    });
  }, [overlays]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];

      // Update overlays directly
      setOverlays(newPresent);

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, [setOverlays]);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = prev.future.slice(1);
      const newPresent = prev.future[0];

      // Update overlays directly
      setOverlays(newPresent);

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, [setOverlays]);

  return {
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
