/**
 * User ID Management Utility
 * 
 * This utility provides functions to:
 * - Generate a unique user ID
 * - Store and retrieve the user ID from localStorage
 * - Get the user's server directory path
 */

import { v4 as uuidv4 } from 'uuid';
import { isLocalStorageSupported } from './browser-check';

// Key used to store the user ID in localStorage
const USER_ID_KEY = 'videoEditorUserId';

/**
 * Generate a unique user ID
 */
const generateUserId = (): string => {
  return uuidv4();
};

/**
 * Get the user ID from localStorage or generate a new one
 */
export const getUserId = (): string => {
  try {
    // Check if localStorage is supported
    if (!isLocalStorageSupported()) {
      // Use a temporary ID if localStorage is not available
      return `temp-${generateUserId()}`;
    }

    // Try to get the existing user ID
    let userId = localStorage.getItem(USER_ID_KEY);
    
    // If no user ID exists, generate and store a new one
    if (!userId) {
      userId = generateUserId();
      localStorage.setItem(USER_ID_KEY, userId);
    }
    
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Return a temporary ID if there's an error
    return `temp-${generateUserId()}`;
  }
};

/**
 * Get the server directory path for the user's media files
 */
export const getUserDirectoryPath = (): string => {
  const userId = getUserId();
  return `/users/${userId}`;
};

/**
 * Check if the user has a persistent ID (not a temporary one)
 */
export const hasPersistentUserId = (): boolean => {
  try {
    if (!isLocalStorageSupported()) {
      return false;
    }
    
    const userId = localStorage.getItem(USER_ID_KEY);
    return !!userId && !userId.startsWith('temp-');
  } catch (error) {
    console.error('Error checking persistent user ID:', error);
    return false;
  }
};
