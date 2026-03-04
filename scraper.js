/**
 * Facebook Member List Scraper
 * 
 * Extracts member information from Facebook groups including names,
 * work details, and profile links. Exports data to JSON format.
 * 
 * @module scraper
 */

const fs = require('fs');
const path = require('path');

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
 * 
 * Based on DOM inspection (2026-03-04):
 * - Member cards are containers with data-focusable and data-action-id attributes
 * - Names are in span.f1 inside ServerTextArea with color #1d2129
 * - Work details are in span.f1 inside ServerTextArea with color #4b4f56
 * 
 * @constant {Object} SELECTORS
 * @property {string} MEMBER_CARD - Selector for member card container
 * @property {string} NAME - Selector for member name element
 * @property {string} WORK_DETAILS - Selector for work/employment info
 * @property {string} PROFILE_LINK - Selector for profile link element
 */
const SELECTORS = {
  MEMBER_CARD: '[data-focusable="true"][data-action-id]',
  NAME_CONTAINER: '[data-mcomponent="ServerTextArea"]',
  NAME: '[data-mcomponent="ServerTextArea"]:first-of-type span.f1',
  WORK_DETAILS: '[data-mcomponent="ServerTextArea"]:nth-of-type(2) span.f1',
  PROFILE_LINK: '[data-focusable="true"][data-action-id]',
  AVATAR_IMG: '[data-mcomponent="ServerImageArea"] img'
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

/**
 * Validates Facebook session directory
 * @param {string} sessionDir - Path to the browser session directory
 * @returns {Promise<Object>} Validation result with valid status and optional error message
 * @property {boolean} valid - True if session directory is valid
 * @property {string} [error] - Error message if validation failed
 * @property {boolean} [hasCookies] - True if Cookies file exists in session directory
 */
async function validateSession(sessionDir) {
  // Validate input
  if (!sessionDir || typeof sessionDir !== 'string' || sessionDir.length === 0) {
    return {
      valid: false,
      error: 'Invalid session directory path provided'
    };
  }
  
  // Check if directory exists
  if (!fs.existsSync(sessionDir)) {
    return {
      valid: false,
      error: `Session directory not found: ${sessionDir}`
    };
  }
  
  // Check if it's actually a directory
  const stats = fs.statSync(sessionDir);
  if (!stats.isDirectory()) {
    return {
      valid: false,
      error: `Path is not a directory: ${sessionDir}`
    };
  }
  
  // Check for Cookies file (Chromium/Chrome session data)
  const cookiesPath = path.join(sessionDir, 'Cookies');
  const hasCookies = fs.existsSync(cookiesPath);
  
  return {
    valid: true,
    hasCookies
  };
}

module.exports = {
  CONFIG,
  SELECTORS,
  validateConfig,
  validateSession
};
