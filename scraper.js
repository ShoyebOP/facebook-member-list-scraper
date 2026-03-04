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
const puppeteer = require('puppeteer');
const { KnownDevices } = require('puppeteer');

const MOBILE_DEVICE = KnownDevices['Galaxy S8'];

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

/**
 * Extracts member data from a member card element
 * @param {Object} page - Puppeteer page object
 * @param {ElementHandle} memberCard - Puppeteer element handle for member card
 * @returns {Promise<Object|null>} Member data object or null if extraction fails
 * @property {string} name - Member's display name
 * @property {string|null} work - Work/employment details (may be null)
 * @property {string|null} profileUrl - Facebook profile URL (may be null)
 */
async function extractMemberData(page, memberCard) {
  try {
    // Extract all data from the member card
    const memberData = await memberCard.evaluate((card) => {
      // Get all text spans with class f1 (Facebook's text class)
      const textSpans = Array.from(card.querySelectorAll('span.f1'));

      // First span is typically the name
      const name = textSpans[0]?.textContent?.trim() || null;

      // Second span is typically work/school info
      const work = textSpans[1]?.textContent?.trim() || null;

      // Get the data-action-id to construct profile URL
      // Facebook member cards have data-action-id which is the user ID
      const actionId = card.getAttribute('data-action-id');
      
      // Construct profile URL from action ID if available
      let profileUrl = null;
      if (actionId) {
        profileUrl = `https://www.facebook.com/${actionId}`;
      }

      // Also try to find any link inside the card
      if (!profileUrl) {
        const linkElement = card.querySelector('a[href*="facebook.com"]');
        if (linkElement && linkElement.href) {
          profileUrl = linkElement.href;
        }
      }

      return {
        name,
        work,
        profileUrl
      };
    });

    // Validate that we got at least a name
    if (!memberData.name) {
      return null;
    }

    return memberData;
  } catch (error) {
    console.error('Error extracting member data:', error.message);
    return null;
  }
}

module.exports = {
  CONFIG,
  SELECTORS,
  validateConfig,
  validateSession,
  extractMemberData,
  delay,
  randomDelay,
  scrollThroughMembers,
  exportToJSON,
  runScraper
};

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Delays execution for a random duration between min and max
 * @param {number} min - Minimum milliseconds
 * @param {number} max - Maximum milliseconds
 * @returns {Promise<void>}
 */
async function randomDelay(min, max) {
  const randomMs = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(randomMs);
}

/**
 * Scrolls through member list to load all members
 * @param {Object} page - Puppeteer page object
 * @param {Object} options - Scroll options
 * @returns {Promise<number>} Total number of scroll actions performed
 */
async function scrollThroughMembers(page, options = {}) {
  const { maxScrolls = 100, scrollDelay = 3000, minWaitAfterNoChange = 5000 } = options;
  let scrollCount = 0;
  let lastMemberCount = 0;
  let consecutiveNoChange = 0;
  const maxConsecutiveNoChange = 5;

  console.log('Starting member list scroll...');

  // Get initial member count
  lastMemberCount = await page.evaluate((selector) => {
    return document.querySelectorAll(selector).length;
  }, SELECTORS.MEMBER_CARD);

  console.log(`Initial member count: ${lastMemberCount}`);

  while (scrollCount < maxScrolls) {
    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    scrollCount++;
    console.log(`Scrolled ${scrollCount}/${maxScrolls} times...`);

    // Wait for content to load
    await delay(scrollDelay);

    // Check member count instead of page height
    const currentMemberCount = await page.evaluate((selector) => {
      return document.querySelectorAll(selector).length;
    }, SELECTORS.MEMBER_CARD);

    console.log(`Member count: ${currentMemberCount}`);

    if (currentMemberCount === lastMemberCount) {
      consecutiveNoChange++;
      console.log(`No new members loaded (${consecutiveNoChange}/${maxConsecutiveNoChange}). Waiting ${minWaitAfterNoChange}ms...`);
      
      // Wait longer before giving up
      await delay(minWaitAfterNoChange);
      
      // Check one more time after waiting
      const retryCount = await page.evaluate((selector) => {
        return document.querySelectorAll(selector).length;
      }, SELECTORS.MEMBER_CARD);
      
      if (retryCount === lastMemberCount) {
        consecutiveNoChange++;
        console.log(`Still no new members after waiting (${consecutiveNoChange}/${maxConsecutiveNoChange})`);
        
        if (consecutiveNoChange >= maxConsecutiveNoChange) {
          console.log('End of member list detected.');
          break;
        }
      } else {
        consecutiveNoChange = 0;
        lastMemberCount = retryCount;
      }
    } else {
      consecutiveNoChange = 0;
      lastMemberCount = currentMemberCount;
    }
  }

  return scrollCount;
}

/**
 * Exports member data to JSON file
 * @param {Array} members - Array of member data objects
 * @param {string} outputPath - Path to output file
 * @param {string} groupUrl - Source Facebook group URL
 * @returns {Promise<string>} Path to created file
 */
async function exportToJSON(members, outputPath, groupUrl) {
  const exportData = {
    group_url: groupUrl,
    scraped_at: new Date().toISOString(),
    member_count: members.length,
    members: members
  };

  await fs.promises.writeFile(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`Exported ${members.length} members to ${outputPath}`);
  
  return outputPath;
}

/**
 * Main scraper orchestration function
 * @param {string} groupUrl - Facebook group member list URL
 * @param {Object} options - Scraper options
 * @returns {Promise<Object>} Scraper result
 */
async function runScraper(groupUrl, options = {}) {
  const {
    outputfile = CONFIG.OUTPUT_FILE,
    sessionDir = CONFIG.SESSION_DIR,
    maxScrolls = 50
  } = options;

  console.log('=================================================');
  console.log('Facebook Member List Scraper');
  console.log('=================================================');
  console.log(`Target URL: ${groupUrl}`);
  console.log(`Output File: ${outputfile}`);
  console.log('=================================================\n');

  // Validate session
  console.log('Validating session...');
  const sessionResult = await validateSession(sessionDir);
  
  if (!sessionResult.valid) {
    throw new Error(`Session validation failed: ${sessionResult.error}`);
  }
  
  console.log('✓ Session validated', sessionResult.hasCookies ? '(with cookies)' : '');

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: sessionDir,
    args: ['--start-maximized']
  });

  const members = [];

  try {
    const page = await browser.newPage();
    await page.emulate(MOBILE_DEVICE);

    console.log('\nNavigating to group member list...');
    await page.goto(groupUrl, {
      waitUntil: 'networkidle0',
      timeout: 120000
    });

    console.log('✓ Page loaded');

    // Scroll through member list
    console.log('\nLoading all members...');
    const scrollCount = await scrollThroughMembers(page, { maxScrolls });
    console.log(`Completed ${scrollCount} scroll actions`);

    // Extract member data
    console.log('\nExtracting member data...');
    const memberCards = await page.$$(SELECTORS.MEMBER_CARD);
    console.log(`Found ${memberCards.length} member cards`);

    for (const card of memberCards) {
      const memberData = await extractMemberData(page, card);
      if (memberData) {
        members.push(memberData);
        console.log(`  Extracted: ${memberData.name}${memberData.work ? ` - ${memberData.work}` : ''}`);
      }
    }

    console.log(`\n✓ Extracted ${members.length} members`);

    // Export to JSON
    console.log('\nExporting data...');
    await exportToJSON(members, outputfile, groupUrl);

  } catch (error) {
    console.error('\n✗ Error during scraping:', error.message);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('\n=================================================');
  console.log('SCRAPING COMPLETE');
  console.log('=================================================');
  console.log(`Total members extracted: ${members.length}`);
  console.log(`Output file: ${outputfile}`);
  console.log('=================================================\n');

  return {
    success: true,
    memberCount: members.length,
    outputFile: outputfile
  };
}
