/**
 * Format utilities for displaying file sizes, durations, etc.
 */

/**
 * Formats a byte size into a human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats a duration in seconds to a human-readable string (MM:SS)
 */
export function formatDuration(seconds?: number): string {
  if (seconds === undefined) return '--:--';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Formats a date timestamp to a human-readable string
 */
export function formatDate(timestamp?: number): string {
  if (timestamp === undefined) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a filename to ensure it's safe for file systems
 */
export function formatSafeFilename(filename: string): string {
  // Replace invalid characters with underscores
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase();
}
