/** localStorage key for the desktop sidebar's collapsed/expanded preference. */
export const SIDEBAR_STORAGE_KEY = 'java2go:sidebar';

/**
 * Runs in <head> before first paint so a collapsed sidebar never flashes open.
 * Kept tiny and dependency-free; storage access can throw in private modes.
 */
export const sidebarInitScript = `try{if(localStorage.getItem(${JSON.stringify(
  SIDEBAR_STORAGE_KEY,
)})==='collapsed')document.documentElement.dataset.sidebar='collapsed'}catch(e){}`;
