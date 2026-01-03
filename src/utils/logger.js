/**
 * Safe logger utility
 * Only logs in development mode to avoid exposing sensitive info in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },

  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },

  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  }
};
