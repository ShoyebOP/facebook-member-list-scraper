/**
 * Facebook Member List Scraper
 * 
 * Extracts member information from Facebook groups including names,
 * work details, and profile links. Exports data to JSON format.
 * 
 * @module scraper
 */

/**
 * Configuration constants for the scraper
 * @constant {Object} CONFIG
 * @property {string} OUTPUT_FILE - Default output file for scraped data
 * @property {number} DELAY_MS - Base delay between operations (ms)
 * @property {number} RANDOM_DELAY_MIN - Minimum random delay (ms)
 * @property {number} RANDOM_DELAY_MAX - Maximum random delay (ms)
 * @property {string} SESSION_DIR - Directory for browser session data
 */
const CONFIG = {
  OUTPUT_FILE: 'members.json',
  DELAY_MS: 2000,
  RANDOM_DELAY_MIN: 1000,
  RANDOM_DELAY_MAX: 3000,
  SESSION_DIR: './my_facebook_session'
};

/**
 * DOM selectors for Facebook mobile site
 * Note: These selectors are for Facebook's mobile interface and may need
 * updates if Facebook changes their DOM structure.
 * @constant {Object} SELECTORS
 * @property {string} MEMBER_CARD - Selector for member card container
 * @property {string} NAME - Selector for member name element
 * @property {string} WORK_DETAILS - Selector for work/employment info
 * @property {string} PROFILE_LINK - Selector for profile link element
 */
const SELECTORS = {
  MEMBER_CARD: '[data-testid="member-cell"]',
  NAME: 'span[dir="auto"]',
  WORK_DETAILS: '[data-testid="profile_subtitle"]',
  PROFILE_LINK: 'a[href*="/"]'
};

/**
 * Validates configuration object
 * @param {Object} config - Configuration object to validate
 * @returns {boolean} True if config is valid, false otherwise
 */
function validateConfig(config) {
  if (!config) return false;
  
  // Check required string fields
  if (typeof config.OUTPUT_FILE !== 'string' || config.OUTPUT_FILE.length === 0) {
    return false;
  }
  
  if (typeof config.SESSION_DIR !== 'string' || config.SESSION_DIR.length === 0) {
    return false;
  }
  
  // Check numeric fields
  if (typeof config.DELAY_MS !== 'number' || config.DELAY_MS <= 0) {
    return false;
  }
  
  if (typeof config.RANDOM_DELAY_MIN !== 'number' || config.RANDOM_DELAY_MIN <= 0) {
    return false;
  }
  
  if (typeof config.RANDOM_DELAY_MAX !== 'number' || config.RANDOM_DELAY_MAX <= 0) {
    return false;
  }
  
  // Check delay relationship
  if (config.RANDOM_DELAY_MAX <= config.RANDOM_DELAY_MIN) {
    return false;
  }
  
  return true;
}

module.exports = {
  CONFIG,
  SELECTORS,
  validateConfig
};
