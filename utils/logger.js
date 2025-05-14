/**
 * Utility for logging that only outputs in development environment
 */

// Log function that only logs in development
export const log = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// Error function that only logs in development
export const error = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
};

// Warning function that only logs in development
export const warn = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args);
  }
};
