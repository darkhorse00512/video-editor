import { useState, useCallback } from "react";
import { TimelineRow } from "../types";
import { MAX_ROWS } from "../constants";

/**
 * A custom hook for managing timeline rows in the editor.
 * Initializes with 3 default rows and provides functionality to add new rows
 * up to a maximum limit defined by MAX_ROWS.
 *
 * @returns {Object} An object containing:
 *   - rows: Array of TimelineRow objects, each with an id and index
 *   - addRow: Function to append a new row to the timeline
 */
export const useTimelineRows = () => {
  const [rows, setRows] = useState<TimelineRow[]>([
    { id: 1, index: 0 },
    { id: 2, index: 1 },
    { id: 3, index: 2 },
  ]);

  const addRow = useCallback(() => {
    setRows((currentRows) => {
      if (currentRows.length >= MAX_ROWS) {
        return currentRows;
      }

      const newRow: TimelineRow = {
        id: Date.now(),
        index: currentRows.length,
      };

      return [...currentRows, newRow];
    });
  }, []);

  return {
    rows,
    addRow,
  };
};
