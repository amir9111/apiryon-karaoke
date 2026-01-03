/**
 * Safe localStorage/sessionStorage wrapper
 * Handles errors gracefully when storage is not available
 * (e.g., private/incognito mode, Safari blocking)
 */

const createSafeStorage = (storage) => ({
  getItem: (key) => {
    try {
      if (typeof window === 'undefined') return null;
      return storage.getItem(key);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Failed to get item "${key}" from storage:`, error);
      }
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined') return false;
      storage.setItem(key, value);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Failed to set item "${key}" in storage:`, error);
      }
      return false;
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window === 'undefined') return false;
      storage.removeItem(key);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Failed to remove item "${key}" from storage:`, error);
      }
      return false;
    }
  },

  clear: () => {
    try {
      if (typeof window === 'undefined') return false;
      storage.clear();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to clear storage:', error);
      }
      return false;
    }
  }
});

export const safeLocalStorage = createSafeStorage(
  typeof window !== 'undefined' ? window.localStorage : {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
);

export const safeSessionStorage = createSafeStorage(
  typeof window !== 'undefined' ? window.sessionStorage : {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
);
