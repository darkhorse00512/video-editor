import { useState } from "react";
import { INITIAL_ROWS, MAX_ROWS } from "../constants";

/**
 * A custom React hook that manages the number of visible rows in a component.
 * The number of rows is bounded between INITIAL_ROWS and MAX_ROWS.
 *
 * @returns {Object} An object containing:
 *   - visibleRows: The current number of visible rows
 *   - getVisibleRows: Function to get the current visible rows count
 *   - setVisibleRows: Function to directly set the visible rows count
 *   - addRow: Function to increment visible rows (up to MAX_ROWS)
 *   - removeRow: Function to decrement visible rows (down to INITIAL_ROWS)
 */
export const useVisibleRows = () => {
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);

  /**
   * Increments the number of visible rows by 1, up to MAX_ROWS
   */
  const addRow = () => {
    setVisibleRows((current) => Math.min(current + 1, MAX_ROWS));
  };

  /**
   * Decrements the number of visible rows by 1, down to INITIAL_ROWS
   */
  const removeRow = () => {
    setVisibleRows((current) => Math.max(current - 1, INITIAL_ROWS));
  };

  return {
    visibleRows,
    getVisibleRows: () => visibleRows,
    setVisibleRows,
    addRow,
    removeRow,
  };
};
