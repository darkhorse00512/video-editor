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
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get canvas context for video frame extraction');
      resolve('');
      return;
    }

    // Set up video element
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'metadata';
    
    // Handle successful frame extraction
    const handleLoadedData = () => {
      try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Seek to the specified time
        video.currentTime = time;
      } catch (error) {
        console.error('Error setting video time:', error);
        resolve('');
      }
    };

    const handleSeeked = () => {
      try {
        // Draw the current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        console.error('Error drawing video frame to canvas:', error);
        resolve('');
      }
    };

    const handleError = (error: Event) => {
      console.error('Error loading video for frame extraction:', error);
      resolve('');
    };

    // Set up event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);
    
    // Clean up function
    const cleanup = () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      video.src = '';
      video.load();
    };

    // Set video source and start loading
    video.src = videoUrl;
    video.load();

    // Timeout fallback
    setTimeout(() => {
      cleanup();
      resolve('');
    }, 10000); // 10 second timeout
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
