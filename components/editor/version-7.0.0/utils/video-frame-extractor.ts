/**
 * Video Frame Extractor Utility
 * 
 * This utility provides functions to extract frames from video URLs for use in filter previews.
 * It handles CORS issues and provides fallbacks for different video sources.
 */

/**
 * Extracts the first frame from a video URL and returns it as a data URL
 * 
 * @param videoUrl - The URL of the video to extract frame from
 * @param time - The time in seconds to extract frame from (default: 0 for first frame)
 * @returns Promise<string> - Data URL of the extracted frame, or empty string if failed
 */
export const extractVideoFrame = async (
  videoUrl: string, 
  time: number = 0
): Promise<string> => {
  console.log('extractVideoFrame: Starting extraction for:', videoUrl, 'at time:', time);
  
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('extractVideoFrame: Could not get canvas context for video frame extraction');
      resolve('');
      return;
    }

    console.log('extractVideoFrame: Created video and canvas elements');

           // Set up video element with better loading configuration
           video.crossOrigin = 'anonymous';
           video.muted = true;
           video.preload = 'auto'; // Changed from 'metadata' to 'auto' for better loading
           video.playsInline = true;
    
    // Handle successful frame extraction
    const handleLoadedData = () => {
      try {
        console.log('extractVideoFrame: Video loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        console.log('extractVideoFrame: Seeking to time:', time);
        // Seek to the specified time
        video.currentTime = time;
      } catch (error) {
        console.error('extractVideoFrame: Error setting video time:', error);
        resolve('');
      }
    };

    const handleSeeked = () => {
      try {
        console.log('extractVideoFrame: Video seeked, drawing frame to canvas');
        // Draw the current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log('extractVideoFrame: Successfully extracted frame, data URL length:', dataUrl.length);
        resolve(dataUrl);
      } catch (error) {
        console.error('extractVideoFrame: Error drawing video frame to canvas:', error);
        resolve('');
      }
    };

    const handleError = (error: Event) => {
      console.error('extractVideoFrame: Error loading video for frame extraction:', error);
      console.error('extractVideoFrame: Video src was:', video.src);
      resolve('');
    };

           // Set up event listeners for different loading states
           video.addEventListener('loadeddata', handleLoadedData);
           video.addEventListener('loadedmetadata', handleLoadedData); // Also listen for metadata
           video.addEventListener('canplay', handleLoadedData); // Also listen for canplay
           video.addEventListener('seeked', handleSeeked);
           video.addEventListener('error', handleError);
    
    // Clean up function
    const cleanup = () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedData);
      video.removeEventListener('canplay', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      video.src = '';
      video.load();
    };

    // Set video source and start loading
    console.log('extractVideoFrame: Setting video src to:', videoUrl);
    video.src = videoUrl;
    video.load();

           // Extended timeout fallback for slower videos
           setTimeout(() => {
             console.warn('extractVideoFrame: Timeout reached, cleaning up');
             cleanup();
             resolve('');
           }, 30000); // 30 second timeout for slower videos
  });
};

/**
 * Extracts multiple frames from a video URL at different time points
 * 
 * @param videoUrl - The URL of the video to extract frames from
 * @param times - Array of times in seconds to extract frames from
 * @returns Promise<string[]> - Array of data URLs of extracted frames
 */
export const extractVideoFrames = async (
  videoUrl: string, 
  times: number[]
): Promise<string[]> => {
  const framePromises = times.map(time => extractVideoFrame(videoUrl, time));
  return Promise.all(framePromises);
};

/**
 * Creates a thumbnail from video URL with fallback handling
 * 
 * @param videoUrl - The URL of the video to create thumbnail from
 * @returns Promise<string> - Data URL of the thumbnail or empty string if failed
 */
export const createVideoThumbnail = async (videoUrl: string): Promise<string> => {
  try {
    // First try to extract the first frame
    const firstFrame = await extractVideoFrame(videoUrl, 0);
    
    if (firstFrame) {
      return firstFrame;
    }
    
    // If first frame extraction fails, try a different time point
    const fallbackFrame = await extractVideoFrame(videoUrl, 1);
    
    if (fallbackFrame) {
      return fallbackFrame;
    }
    
    // If all attempts fail, return empty string
    console.warn('Could not extract frame from video:', videoUrl);
    return '';
    
  } catch (error) {
    console.error('Error creating video thumbnail:', error);
    return '';
  }
};

/**
 * Cache for video thumbnails to avoid repeated extraction
 */
const thumbnailCache = new Map<string, string>();

/**
 * Test if a video URL is accessible
 * @param videoUrl - The URL to test
 * @returns Promise<boolean> - True if accessible, false otherwise
 */
export const testVideoUrlAccessibility = async (videoUrl: string): Promise<boolean> => {
  try {
    console.log('testVideoUrlAccessibility: Testing URL:', videoUrl);
    const response = await fetch(videoUrl, { method: 'HEAD' });
    const isAccessible = response.ok;
    console.log('testVideoUrlAccessibility: URL accessible:', isAccessible, 'Status:', response.status);
    return isAccessible;
  } catch (error) {
    console.error('testVideoUrlAccessibility: Error testing URL:', error);
    return false;
  }
};

/**
 * Gets a cached video thumbnail or creates a new one
 * 
 * @param videoUrl - The URL of the video to get thumbnail for
 * @returns Promise<string> - Data URL of the thumbnail or empty string if failed
 */
export const getCachedVideoThumbnail = async (videoUrl: string): Promise<string> => {
  // Check cache first
  if (thumbnailCache.has(videoUrl)) {
    return thumbnailCache.get(videoUrl) || '';
  }
  
  // Extract thumbnail and cache it
  const thumbnail = await createVideoThumbnail(videoUrl);
  
  if (thumbnail) {
    thumbnailCache.set(videoUrl, thumbnail);
  }
  
  return thumbnail;
};
