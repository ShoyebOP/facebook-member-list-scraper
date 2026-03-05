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
 * Based on DOM inspection (2026-03-05):
 * - Member cards are containers with data-focusable, data-mcomponent="MContainer" and bg-s2 class
 * - Names and work details are in span.f1 inside the card
 * 
 * @constant {Object} SELECTORS
 * @property {string} MEMBER_CARD - Selector for member card container
 * @property {string} NAME - Selector for member name element
 * @property {string} WORK_DETAILS - Selector for work/employment info
 * @property {string} PROFILE_LINK - Selector for profile link element
 */
const SELECTORS = {
  MEMBER_CARD: '[data-focusable="true"][data-mcomponent="MContainer"].bg-s2',
  NAME_CONTAINER: '[data-mcomponent="ServerTextArea"]',
  NAME: 'span.f1', // First span.f1 is name
  WORK_DETAILS: 'span.f1', // Subsequent span.f1 are details
  PROFILE_LINK: 'img', // We'll extract ID from img src
  AVATAR_IMG: 'img'
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
    const memberData = await memberCard.evaluate((card) => {
      // Find all spans within this specific card
      const spans = Array.from(card.querySelectorAll('span.f1'));
      const name = spans[0]?.textContent?.trim() || null;
      // All other spans combined as work/details
      const work = spans.slice(1).map(s => s.textContent.trim()).join(' | ') || null;
      
      const img = card.querySelector('img');
      const imageUrl = img?.src || null;
      const dataImageId = img?.getAttribute('data-image-id');
      let profileUrl = null;

      if (dataImageId && dataImageId.length > 5 && !dataImageId.startsWith('-')) {
        profileUrl = `https://www.facebook.com/profile.php?id=${dataImageId}`;
      } else if (imageUrl) {
        // Look for any long sequence of digits (13-18 digits) which is common for FBIDs
        const digitMatch = imageUrl.match(/(\d{13,18})/);
        if (digitMatch) {
          profileUrl = `https://www.facebook.com/profile.php?id=${digitMatch[1]}`;
        } else {
          // Fallback to the previous logic for smaller IDs or different patterns
          const match = imageUrl.match(/\/(\d+)_/);
          if (match && match[1] && match[1].length >= 10) {
            profileUrl = `https://www.facebook.com/profile.php?id=${match[1]}`;
          }
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
 * Uses up/down scrolling strategy to trigger lazy loading
 * @param {Object} page - Puppeteer page object
 * @param {Object} options - Scroll options
 * @returns {Promise<number>} Total number of scroll actions performed
 */
async function scrollThroughMembers(page, options = {}) {
  const { maxScrolls = 500, scrollDelay = 3000 } = options;
  let scrollCount = 0;
  let lastMemberCount = 0;
  let consecutiveNoChange = 0;
  const maxConsecutiveNoChange = 6;

  console.log('Starting member list scroll (smart strategy)...');

  while (scrollCount < maxScrolls) {
    scrollCount++;
    
    // Scroll down incrementally
    await page.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    await delay(scrollDelay);

    const currentMemberCount = await page.evaluate((selector) => {
      return document.querySelectorAll(selector).length;
    }, SELECTORS.MEMBER_CARD);

    if (currentMemberCount > lastMemberCount) {
      console.log(`Scroll ${scrollCount}/${maxScrolls}: Found ${currentMemberCount} members (+${currentMemberCount - lastMemberCount})`);
      consecutiveNoChange = 0;
      lastMemberCount = currentMemberCount;
    } else {
      consecutiveNoChange++;
      console.log(`Scroll ${scrollCount}/${maxScrolls}: No change (${consecutiveNoChange}/${maxConsecutiveNoChange})`);
      
      // If stalled for a few cycles, look for "See all" or "Load more"
      if (consecutiveNoChange >= 2) {
        const clicked = await page.evaluate(() => {
          // Look for "See all" buttons. In WebLite, these are often divs with role="button"
          const buttons = Array.from(document.querySelectorAll('[role="button"], [data-focusable="true"]'));
          
          // Strategy: Find "See all" buttons and click them one by one if they are visible
          const seeAllButtons = buttons.filter(b => {
            const text = b.textContent.trim().toLowerCase();
            return (text === 'see all' || text === 'see more' || text === 'load more') && 
                   b.offsetParent !== null;
          });

          if (seeAllButtons.length > 0) {
            // Click the one that's furthest down the page
            const target = seeAllButtons[seeAllButtons.length - 1];
            target.scrollIntoView();
            target.click();
            return true;
          }
          return false;
        });
        
        if (clicked) {
          console.log(`  Clicked a load button, waiting...`);
          await delay(5000);
        }
      }

      if (consecutiveNoChange >= maxConsecutiveNoChange) {
        console.log(`  Trying a larger scroll to trigger lazy loading...`);
        await page.evaluate(() => window.scrollBy(0, 2000));
        await delay(5000);
        
        const finalCheckCount = await page.evaluate((selector) => {
          return document.querySelectorAll(selector).length;
        }, SELECTORS.MEMBER_CARD);
        
        if (finalCheckCount === lastMemberCount) {
          console.log('End of list reached or stuck.');
          break;
        }
        lastMemberCount = finalCheckCount;
        consecutiveNoChange = 0;
      }
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
  });

  const members = [];

  try {
    // Get all open pages and reuse the first one
    const pages = await browser.pages();
    const page = pages[0];
    
    // Close any other tabs
    for (let i = 1; i < pages.length; i++) {
      await pages[i].close();
    }
    
    await page.emulate(MOBILE_DEVICE);

    console.log('\nNavigating to group member list...');
    await page.goto(groupUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Wait for body and then a fixed delay for dynamic content
    await page.waitForSelector('body');
    await delay(10000);

    console.log('✓ Page loaded');

    // Remove unwanted panels to focus only on members
    console.log('\nCleaning up page layout...');
    await page.evaluate(() => {
      const unwantedKeywords = [
        'admins and moderators', 
        'members with things in common', 
        'pages', 
        'new people and pages'
      ];
      
      const containers = Array.from(document.querySelectorAll('[data-mcomponent="MContainer"]'));
      containers.forEach(container => {
        const text = container.textContent.toLowerCase();
        // DON'T remove if it contains a load button
        if (text.includes('see all') || text.includes('see more')) return;

        if (unwantedKeywords.some(keyword => text.includes(keyword)) && 
            !text.includes('recently joined')) { 
          container.remove();
        }
      });
    });

    console.log('Starting iterative extraction...');
    
    // Iterative extraction loop
    let consecutiveNoMember = 0;
    const maxConsecutiveNoMember = 15;
    
    while (members.length < 10000) { // Safety limit
      // Aggressively remove loaders in EVERY iteration
      await page.evaluate(() => {
        const loaderSpans = Array.from(document.querySelectorAll('span')).filter(s => s.textContent.includes('Loading'));
        loaderSpans.forEach(span => {
          // Find the container to remove - in WebLite it's usually an MContainer or similar
          let container = span.closest('[data-mcomponent]') || span.parentElement;
          if (container && container.tagName !== 'BODY') {
            container.remove();
          }
        });
      });

      const memberCardSelector = '[data-focusable="true"][data-mcomponent="MContainer"].bg-s2';
      const card = await page.$(memberCardSelector);
      
      if (!card) {
        consecutiveNoMember++;
        console.log(`\nNo member card found (${consecutiveNoMember}/${maxConsecutiveNoMember}). Checking for load buttons...`);
        
        // Strategy: 1. Click "See more" buttons if they appear
        const clicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('[role="button"], [data-focusable="true"]'));
          const moreBtn = buttons.find(b => {
            const t = b.textContent.trim().toLowerCase();
            return (t === 'see all' || t === 'see more' || t === 'load more') && b.offsetParent !== null;
          });
          if (moreBtn) {
            moreBtn.scrollIntoView();
            moreBtn.click();
            return true;
          }
          return false;
        });

        if (clicked) {
          console.log('  ✓ Clicked a "See more" button');
          await delay(6000);
          consecutiveNoMember = 0;
          continue;
        }

        // Strategy: 2. Scroll down to trigger load if no buttons found
        console.log('  Scrolling to trigger load...');
        await page.evaluate(() => window.scrollBy(0, 1000));
        await delay(4000);
        
        if (consecutiveNoMember >= maxConsecutiveNoMember) break;
        continue;
      }
      
      consecutiveNoMember = 0;
      const memberData = await extractMemberData(page, card);
      
      if (memberData && memberData.name) {
        process.stdout.write(`\rExtracting member ${members.length + 1}: ${memberData.name.padEnd(30)}`);
        
        // Get real URL via click
        try {
          const originalUrl = await page.url();
          // Find the avatar image which is a very reliable click target
          const clickTarget = await card.$(SELECTORS.AVATAR_IMG).catch(() => card);
          
          if (clickTarget) {
            await clickTarget.click();
            
            // Wait for URL to change to something that is NOT a members list
            try {
              await page.waitForFunction(
                (oldUrl) => window.location.href !== oldUrl && !window.location.href.includes('/members'),
                { timeout: 8000 },
                originalUrl
              );
              
              const finalUrl = await page.url();
              if (finalUrl !== originalUrl && !finalUrl.includes('/members')) {
                memberData.profileUrl = finalUrl;
              }
              
              // Always try to go back if the URL changed
              await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
              await delay(1500);
            } catch (waitErr) {}
          }
        } catch (err) {}
        
        members.push(memberData);
      }
      
      // DELETE the card so next one comes up
      // We find the direct child of the scroller
      await page.evaluate((el) => {
        let scroller = el.closest('[data-type="vscroller"]') || el.closest('[scrollable="true"]') || el.parentElement;
        if (!scroller) {
          el.remove();
          return;
        }
        
        let toRemove = el;
        while (toRemove.parentElement && toRemove.parentElement !== scroller) {
          toRemove = toRemove.parentElement;
        }
        
        // Remove spacers/fillers that might follow
        let next = toRemove.nextElementSibling;
        while (next && (next.textContent.trim() === '' || next.offsetHeight < 10)) {
          let temp = next.nextElementSibling;
          next.remove();
          next = temp;
        }
        
        toRemove.remove();
      }, card);
      
      // Periodically export
      if (members.length % 20 === 0) {
        await exportToJSON(members, outputfile, groupUrl);
      }
    }

    console.log(`✓ Extracted ${members.length} members`);

    // Export to JSON
    console.log('Exporting data...');
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
