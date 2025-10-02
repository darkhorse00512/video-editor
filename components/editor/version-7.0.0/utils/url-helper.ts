/**
 * URL Helper Utility
 *
 * Provides functions to handle URL transformations for consistent
 * access between browser and SSR renderer.
 */

/**
 * Get the base URL from environment variables or default to localhost:3000
 */
export const getBaseUrl = (): string => {
  // Use environment variable if available, otherwise default to localhost:3000
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

/**
 * Convert a relative URL to an absolute URL
 *
 * @param url The URL to convert
 * @returns Absolute URL with the correct base
 */
export const toAbsoluteUrl = (url: string): string => {
  // If the URL is already absolute, return it as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If it's a relative URL starting with /, add the base URL
  if (url.startsWith("/")) {
    return `${getBaseUrl()}${url}`;
  }

  // Otherwise, add the base URL with a / separator
  return `${getBaseUrl()}/${url}`;
};

/**
 * Resolves a media URL to ensure it works in both browser and SSR contexts
 *
 * @param url The URL to resolve
 * @param baseUrl Optional base URL to use
 * @returns Properly formatted URL for the current context
 */
export const resolveMediaUrl = (url: string, baseUrl?: string): string => {
  // If the URL is already absolute, return it as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If baseUrl is provided, use it
  if (baseUrl) {
    // Ensure there's no double slash
    if (url.startsWith("/") && baseUrl.endsWith("/")) {
      return `${baseUrl}${url.substring(1)}`;
    }

    // Ensure there's at least one slash
    if (!url.startsWith("/") && !baseUrl.endsWith("/")) {
      return `${baseUrl}/${url}`;
    }

    return `${baseUrl}${url}`;
  }

  // If we're in the browser, use window.location.origin
  if (typeof window !== "undefined") {
    return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  // In SSR context, use the base URL
  return toAbsoluteUrl(url);
};
