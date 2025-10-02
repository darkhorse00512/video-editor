/**
 * Browser feature detection utilities
 */

/**
 * Check if IndexedDB is supported in the current browser environment
 */
export const isIndexedDBSupported = (): boolean => {
  try {
    // Check if window and indexedDB are available
    if (typeof window === 'undefined' || !window.indexedDB) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking IndexedDB support:', error);
    return false;
  }
};

/**
 * Check if localStorage is supported in the current browser environment
 */
export const isLocalStorageSupported = (): boolean => {
  try {
    // Check if window and localStorage are available
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    // Test localStorage by setting and removing a test item
    const testKey = '__test_local_storage__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    
    return true;
  } catch (error) {
    console.error('Error checking localStorage support:', error);
    return false;
  }
};

/**
 * Check if the browser supports the File API
 */
export const isFileAPISupported = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           !!window.File && 
           !!window.FileReader && 
           !!window.FileList && 
           !!window.Blob;
  } catch (error) {
    console.error('Error checking File API support:', error);
    return false;
  }
};
