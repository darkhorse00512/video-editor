/**
 * Media Upload Utility
 *
 * This utility provides functions for:
 * - Uploading media files to the server
 * - Generating thumbnails
 * - Getting media duration
 */

import { getUserId } from "./user-id";
import { UserMediaItem, addMediaItem } from "./indexdb";

/**
 * Uploads a file to the server and stores the reference in IndexedDB
 */
export const uploadMediaFile = async (file: File): Promise<UserMediaItem> => {
  try {
    // Generate thumbnail and get duration
    const thumbnail = await generateThumbnail(file);
    const duration = await getMediaDuration(file);

    // Determine file type
    let fileType: "video" | "image" | "audio";
    if (file.type.startsWith("video/")) {
      fileType = "video";
    } else if (file.type.startsWith("image/")) {
      fileType = "image";
    } else if (file.type.startsWith("audio/")) {
      fileType = "audio";
    } else {
      throw new Error("Unsupported file type");
    }

    // Get user ID
    const userId = getUserId();

    // Create form data for upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    // Upload file to server
    const response = await fetch("/api/latest/local-media/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload file");
    }

    const { id, serverPath, size } = await response.json();

    // Create media item for IndexedDB
    const mediaItem: UserMediaItem = {
      id,
      userId,
      name: file.name,
      type: fileType,
      serverPath,
      size,
      lastModified: file.lastModified,
      thumbnail: thumbnail || "",
      duration,
      createdAt: Date.now(),
    };

    // Store in IndexedDB
    await addMediaItem(mediaItem);

    return mediaItem;
  } catch (error) {
    console.error("Error uploading media file:", error);
    throw error;
  }
};

/**
 * Generates a thumbnail for image or video files
 */
export const generateThumbnail = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || "");
      };
      reader.onerror = () => {
        console.error("Error reading image file");
        resolve("");
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";

      // Set timeout to handle cases where video loading hangs
      const timeoutId = setTimeout(() => {
        console.warn("Video thumbnail generation timed out");
        resolve("");
      }, 5000); // 5 second timeout

      video.onloadedmetadata = () => {
        // Set the time to 1 second or the middle of the video
        video.currentTime = Math.min(1, video.duration / 2);
      };

      video.onloadeddata = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = 180;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL("image/jpeg");
          resolve(thumbnail);
        } catch (error) {
          console.error("Error generating video thumbnail:", error);
          resolve("");
        } finally {
          URL.revokeObjectURL(video.src);
        }
      };

      video.onerror = () => {
        clearTimeout(timeoutId);
        console.error("Error loading video for thumbnail");
        URL.revokeObjectURL(video.src);
        resolve("");
      };

      video.src = URL.createObjectURL(file);
    } else {
      // For audio files, use a default audio icon
      resolve("");
    }
  });
};

/**
 * Gets the duration of a media file
 */
export const getMediaDuration = async (
  file: File
): Promise<number | undefined> => {
  if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
    return new Promise((resolve) => {
      const media = file.type.startsWith("audio/")
        ? document.createElement("audio")
        : document.createElement("video");

      // Set timeout to handle cases where media loading hangs
      const timeoutId = setTimeout(() => {
        console.warn("Media duration detection timed out");
        URL.revokeObjectURL(media.src);
        resolve(undefined);
      }, 5000); // 5 second timeout

      media.preload = "metadata";
      media.onloadedmetadata = () => {
        clearTimeout(timeoutId);
        resolve(media.duration);
        URL.revokeObjectURL(media.src);
      };
      media.onerror = () => {
        clearTimeout(timeoutId);
        console.error("Error getting media duration");
        URL.revokeObjectURL(media.src);
        resolve(undefined);
      };
      media.src = URL.createObjectURL(file);
    });
  }
  return undefined;
};

/**
 * Deletes a media file from the server
 */
export const deleteMediaFile = async (
  userId: string,
  filePath: string
): Promise<boolean> => {
  try {
    const response = await fetch("/api/media/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, filePath }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete file");
    }

    return true;
  } catch (error) {
    console.error("Error deleting media file:", error);
    return false;
  }
};
