/**
 * Utility functions for converting URLs between local proxy and Lambda-compatible formats
 */

/**
 * Converts a video-proxy URL back to its original URL for Lambda rendering
 * @param url - The URL to convert (could be video-proxy URL or original URL)
 * @returns The original URL that Lambda can access directly
 */
export const convertUrlForLambda = (url: string): string => {
  console.log('convertUrlForLambda called with:', url);
  
  // If it's a video-proxy URL, extract the original URL
  if (url.includes('/api/video-proxy?url=')) {
    try {
      // Handle relative URLs by adding a base
      const fullUrl = url.startsWith('/') ? `http://localhost:3000${url}` : url;
      const urlObj = new URL(fullUrl);
      const encodedUrl = urlObj.searchParams.get('url');
      if (encodedUrl) {
        const originalUrl = decodeURIComponent(encodedUrl);
        console.log('Converting video-proxy URL to original URL:', {
          proxyUrl: url,
          fullUrl: fullUrl,
          originalUrl: originalUrl
        });
        return originalUrl;
      }
    } catch (error) {
      console.error('Error converting video-proxy URL:', error);
    }
  }
  
  // If it's not a video-proxy URL, return as-is
  console.log('URL is not a video-proxy URL, returning as-is:', url);
  return url;
};

/**
 * Converts an original URL to a video-proxy URL for local use (CORS handling)
 * @param url - The original URL to convert
 * @returns The video-proxy URL for local use
 */
export const convertUrlForLocal = (url: string): string => {
  // Only convert external HTTP URLs to video-proxy URLs
  if (url.startsWith('http') && !url.includes('/api/video-proxy')) {
    const proxyUrl = `/api/video-proxy?url=${encodeURIComponent(url)}`;
    console.log('Converting original URL to video-proxy URL:', {
      originalUrl: url,
      proxyUrl: proxyUrl
    });
    return proxyUrl;
  }
  
  // Return as-is for relative URLs or already proxied URLs
  return url;
};

/**
 * Processes overlay URLs for Lambda rendering by converting all video-proxy URLs back to original URLs
 * @param overlays - Array of overlays to process
 * @returns Array of overlays with Lambda-compatible URLs
 */
export const processOverlaysForLambda = (overlays: any[]): any[] => {
  console.log('processOverlaysForLambda called with:', overlays.length, 'overlays');
  
  return overlays.map((overlay, index) => {
    console.log(`Processing overlay ${index}:`, {
      type: overlay.type,
      src: overlay.src,
      content: overlay.content,
      audio_url: overlay.audio_url,
    });
    
    const processedOverlay = { ...overlay };
    
    // List of properties that might contain URLs
    const urlProperties = ['src', 'content', 'file', 'audio_url', 'video_url'];
    
    // Convert all URL properties
    urlProperties.forEach(prop => {
      if (processedOverlay[prop] && typeof processedOverlay[prop] === 'string') {
        const originalValue = processedOverlay[prop];
        processedOverlay[prop] = convertUrlForLambda(processedOverlay[prop]);
        console.log(`Converted ${prop}:`, {
          original: originalValue,
          converted: processedOverlay[prop]
        });
      }
    });
    
    // Special handling for nested objects (like styles that might have background images)
    if (processedOverlay.styles) {
      const processedStyles = { ...processedOverlay.styles };
      
      // Convert any URL properties in styles
      urlProperties.forEach(prop => {
        if (processedStyles[prop] && typeof processedStyles[prop] === 'string') {
          const originalValue = processedStyles[prop];
          processedStyles[prop] = convertUrlForLambda(processedStyles[prop]);
          console.log(`Converted styles.${prop}:`, {
            original: originalValue,
            converted: processedStyles[prop]
          });
        }
      });
      
      processedOverlay.styles = processedStyles;
    }
    
    console.log(`Processed overlay ${index} result:`, {
      type: processedOverlay.type,
      src: processedOverlay.src,
      content: processedOverlay.content,
      audio_url: processedOverlay.audio_url,
    });
    
    return processedOverlay;
  });
};

/**
 * Processes overlay URLs for local use by converting external URLs to video-proxy URLs
 * @param overlays - Array of overlays to process
 * @returns Array of overlays with local-compatible URLs
 */
export const processOverlaysForLocal = (overlays: any[]): any[] => {
  return overlays.map(overlay => {
    const processedOverlay = { ...overlay };
    
    // Convert src URL if it exists
    if (processedOverlay.src) {
      processedOverlay.src = convertUrlForLocal(processedOverlay.src);
    }
    
    // Convert content URL if it exists
    if (processedOverlay.content) {
      processedOverlay.content = convertUrlForLocal(processedOverlay.content);
    }
    
    return processedOverlay;
  });
};
