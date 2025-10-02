/**
 * IndexedDB Helper Utility
 * 
 * Provides functions to interact with IndexedDB for autosaving editor state.
 */

const DB_NAME = 'VideoEditorProDB';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const AUTOSAVE_STORE = 'autosave';

/**
 * Initialize the IndexedDB database
 * @returns Promise that resolves when the database is ready
 */
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create projects store
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectsStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectsStore.createIndex('name', 'name', { unique: false });
        projectsStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
      
      // Create autosave store
      if (!db.objectStoreNames.contains(AUTOSAVE_STORE)) {
        const autosaveStore = db.createObjectStore(AUTOSAVE_STORE, { keyPath: 'id' });
        autosaveStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

/**
 * Save editor state to autosave store
 * @param projectId Unique identifier for the project
 * @param editorState Current state of the editor
 * @returns Promise that resolves when the save is complete
 */
export const saveEditorState = async (projectId: string, editorState: any): Promise<void> => {
  try {
    const db = await initDatabase();
    const transaction = db.transaction([AUTOSAVE_STORE], 'readwrite');
    const store = transaction.objectStore(AUTOSAVE_STORE);

    const autosaveData = {
      id: projectId,
      editorState,
      timestamp: new Date().getTime()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(autosaveData);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error saving editor state:', event);
        reject('Error saving editor state');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to save editor state:', error);
    throw error;
  }
};

/**
 * Load editor state from autosave store
 * @param projectId Unique identifier for the project
 * @returns Promise that resolves with the editor state or null if not found
 */
export const loadEditorState = async (projectId: string): Promise<any | null> => {
  try {
    const db = await initDatabase();
    const transaction = db.transaction([AUTOSAVE_STORE], 'readonly');
    const store = transaction.objectStore(AUTOSAVE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(projectId);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.editorState : null);
      };
      
      request.onerror = (event) => {
        console.error('Error loading editor state:', event);
        reject('Error loading editor state');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to load editor state:', error);
    throw error;
  }
};

/**
 * Clear autosave data for a project
 * @param projectId Unique identifier for the project
 * @returns Promise that resolves when the delete is complete
 */
export const clearAutosave = async (projectId: string): Promise<void> => {
  try {
    const db = await initDatabase();
    const transaction = db.transaction([AUTOSAVE_STORE], 'readwrite');
    const store = transaction.objectStore(AUTOSAVE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.delete(projectId);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error clearing autosave:', event);
        reject('Error clearing autosave');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to clear autosave:', error);
    throw error;
  }
};

/**
 * Check if there's an autosave for a project
 * @param projectId Unique identifier for the project
 * @returns Promise that resolves with the timestamp of the autosave or null if not found
 */
export const hasAutosave = async (projectId: string): Promise<number | null> => {
  try {
    const db = await initDatabase();
    const transaction = db.transaction([AUTOSAVE_STORE], 'readonly');
    const store = transaction.objectStore(AUTOSAVE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(projectId);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.timestamp : null);
      };
      
      request.onerror = (event) => {
        console.error('Error checking autosave:', event);
        reject('Error checking autosave');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to check autosave:', error);
    throw error;
  }
};
