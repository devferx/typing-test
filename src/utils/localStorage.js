/**
 * @typedef {Object} config
 * @property {string} text
 * @property {number} timeLimit
 * @property {number} wpm
 * @property {number} accuracy
 * @returns {config} config - The config object
 */
export function getAppOptions() {
  const options = localStorage.getItem("app-config");
  return JSON.parse(options);
}

export const appOptions = getAppOptions();
