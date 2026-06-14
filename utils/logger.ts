declare const __DEV__: boolean | undefined;
const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : false;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
};

export default logger;
