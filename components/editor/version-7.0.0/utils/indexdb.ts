/**
 * IndexedDB Utility
 * 
 * This utility provides functions to:
 * - Initialize the database
 * - Add, retrieve, update, and delete media items
 * - Query media items by user ID
 */

import { isIndexedDBSupported } from './browser-check';

// Database configuration
const DB_NAME = 'VideoEditorDB';
const DB_VERSION = 1;
const MEDIA_STORE = 'userMedia';

// Media item interface
export interface UserMediaItem {
  id: string;
  userId: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  serverPath: string;
  size: number;
  lastModified: number;
  thumbnail?: string;
  duration?: number;
  createdAt: number;
}

/**
 * Initialize the IndexedDB database
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject(new Error('Could not open IndexedDB'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for user media
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        const store = db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

/**
 * Add a media item to the database
 */
export const addMediaItem = async (mediaItem: UserMediaItem): Promise<string> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MEDIA_STORE], 'readwrite');
      const store = transaction.objectStore(MEDIA_STORE);
      
      const request = store.add(mediaItem);
      
      request.onsuccess = () => {
        resolve(mediaItem.id);
      };
      
      request.onerror = (event) => {
        console.error('Error adding media item:', event);
        reject(new Error('Failed to add media item'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in addMediaItem:', error);
    throw error;
  }
};

/**
 * Get a media item by ID
 */
export const getMediaItem = async (id: string): Promise<UserMediaItem | null> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MEDIA_STORE], 'readonly');
      const store = transaction.objectStore(MEDIA_STORE);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error('Error getting media item:', event);
        reject(new Error('Failed to get media item'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getMediaItem:', error);
    // Return null instead of throwing if IndexedDB is not supported
    if (error instanceof Error && error.message.includes('not supported')) {
      return null;
    }
    throw error;
  }
};

/**
 * Get all media items for a user
 */
export const getUserMediaItems = async (userId: string): Promise<UserMediaItem[]> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MEDIA_STORE], 'readonly');
      const store = transaction.objectStore(MEDIA_STORE);
      const index = store.index('userId');
      
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = (event) => {
        console.error('Error getting user media items:', event);
        reject(new Error('Failed to get user media items'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getUserMediaItems:', error);
    // Return empty array instead of throwing if IndexedDB is not supported
    if (error instanceof Error && error.message.includes('not supported')) {
      return [];
    }
    throw error;
  }
};

/**
 * Delete a media item by ID
 */
export const deleteMediaItem = async (id: string): Promise<boolean> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MEDIA_STORE], 'readwrite');
      const store = transaction.objectStore(MEDIA_STORE);
      
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error deleting media item:', event);
        reject(new Error('Failed to delete media item'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in deleteMediaItem:', error);
    // Return false instead of throwing if IndexedDB is not supported
    if (error instanceof Error && error.message.includes('not supported')) {
      return false;
    }
    throw error;
  }
};

/**
 * Clear all media items for a user
 */
export const clearUserMedia = async (userId: string): Promise<boolean> => {
  try {
    // Get all user media items
    const mediaItems = await getUserMediaItems(userId);
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MEDIA_STORE], 'readwrite');
      const store = transaction.objectStore(MEDIA_STORE);
      
      // Delete each item
      let deleteCount = 0;
      
      for (const item of mediaItems) {
        const request = store.delete(item.id);
        
        request.onsuccess = () => {
          deleteCount++;
          if (deleteCount === mediaItems.length) {
            resolve(true);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error deleting media item:', event);
          reject(new Error('Failed to clear user media'));
        };
      }
      
      // If there are no items to delete, resolve immediately
      if (mediaItems.length === 0) {
        resolve(true);
      }
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in clearUserMedia:', error);
    // Return false instead of throwing if IndexedDB is not supported
    if (error instanceof Error && error.message.includes('not supported')) {
      return false;
    }
    throw error;
  }
};
