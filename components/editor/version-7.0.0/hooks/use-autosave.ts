import { useEffect, useRef, useState } from "react";
import {
  saveEditorState,
  loadEditorState,
  hasAutosave,
} from "../utils/indexdb-helper";

interface AutosaveOptions {
  /**
   * Interval in milliseconds between autosaves
   * @default 5000 (5 seconds)
   */
  interval?: number;

  /**
   * Function to call when an autosave is loaded
   */
  onLoad?: (data: any) => void;

  /**
   * Function to call when an autosave is saved
   */
  onSave?: () => void;

  /**
   * Function to call when an autosave is detected on initial load
   */
  onAutosaveDetected?: (timestamp: number) => void;
}

/**
 * Hook for automatically saving editor state to IndexedDB
 *
 * @param projectId Unique identifier for the project
 * @param state Current state to be saved
 * @param options Configuration options for autosave behavior
 * @returns Object with functions to manually save and load state
 */
export const useAutosave = (
  projectId: string,
  state: any,
  options: AutosaveOptions = {}
) => {
  const { interval = 5000, onLoad, onSave, onAutosaveDetected } = options;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<string>("");
  const [hasCheckedForAutosave, setHasCheckedForAutosave] = useState(false);

  // Check for existing autosave on mount, but only once
  useEffect(() => {
    const checkForAutosave = async () => {
      if (hasCheckedForAutosave) return;

      try {
        const timestamp = await hasAutosave(projectId);
        if (timestamp && onAutosaveDetected) {
          onAutosaveDetected(timestamp);
        }
        setHasCheckedForAutosave(true);
      } catch (error) {
        console.error("Failed to check for autosave:", error);
        setHasCheckedForAutosave(true);
      }
    };

    checkForAutosave();
  }, [projectId, onAutosaveDetected, hasCheckedForAutosave]);

  // Set up autosave timer
  useEffect(() => {
    // Don't start autosave if projectId is not valid
    if (!projectId) return;

    const saveIfChanged = async () => {
      const currentStateString = JSON.stringify(state);

      // Only save if state has changed since last save
      if (currentStateString !== lastSavedStateRef.current) {
        try {
          await saveEditorState(projectId, state);
          lastSavedStateRef.current = currentStateString;
          if (onSave) onSave();
        } catch (error) {
          console.error("Autosave failed:", error);
        }
      }
    };

    // Set up interval for autosave
    timerRef.current = setInterval(saveIfChanged, interval);

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [projectId, state, interval, onSave]);

  // Function to manually save state
  const saveState = async () => {
    try {
      await saveEditorState(projectId, state);
      lastSavedStateRef.current = JSON.stringify(state);
      if (onSave) onSave();
      return true;
    } catch (error) {
      console.error("Manual save failed:", error);
      return false;
    }
  };

  // Function to manually load state
  const loadState = async () => {
    try {
      const loadedState = await loadEditorState(projectId);
      if (loadedState && onLoad) {
        onLoad(loadedState);
      }
      return loadedState;
    } catch (error) {
      console.error("Load failed:", error);
      return null;
    }
  };

  return {
    saveState,
    loadState,
  };
};
