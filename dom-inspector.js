/**
 * DOM Inspector for Facebook Member List
 * 
 * This script opens Facebook mobile with existing session and inspects
 * the DOM structure of member list pages to discover selectors.
 * 
 * Usage: node dom-inspector.js <group-url>
 * Example: node dom-inspector.js https://www.facebook.com/groups/yourgroup/members
 */

const puppeteer = require('puppeteer');
const { KnownDevices } = require('puppeteer');
const fs = require('fs');
const path = require('path');

const MOBILE_DEVICE = KnownDevices['Galaxy S8'];
const SESSION_DIR = './my_facebook_session';
const OUTPUT_FILE = 'dom-inspection-results.json';

async function inspectDOM(groupUrl) {
  console.log('=================================================');
  console.log('Facebook DOM Inspector');
  console.log('=================================================');
  console.log(`Session Directory: ${SESSION_DIR}`);
  console.log(`Target URL: ${groupUrl || 'https://www.facebook.com'}`);
  console.log('=================================================\n');

  // Validate session directory first
  if (!fs.existsSync(SESSION_DIR)) {
    console.error('✗ Error: Session directory not found');
    console.error(`  Fix: Run login.js first to create session: node login.js`);
    process.exit(1);
  }

  console.log('✓ Session directory exists');

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: SESSION_DIR,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    await page.emulate(MOBILE_DEVICE);

    console.log('✓ Browser launched with mobile emulation (Galaxy S8)');
    console.log('\nACTION: If not already logged in, please log in to Facebook.');
    console.log('The browser will remain open for inspection.\n');

    // Navigate to Facebook or provided group URL
    const targetUrl = groupUrl || 'https://www.facebook.com';
    console.log(`Navigating to: ${targetUrl}`);
    
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 120000
    });

    console.log('✓ Page loaded');

    // Wait for user to navigate to member list if needed
    console.log('\n=================================================');
    console.log('MANUAL STEP:');
    console.log('1. Navigate to a Facebook group member list page');
    console.log('2. The URL should look like:');
    console.log('   https://www.facebook.com/groups/<group-id>/members');
    console.log('3. Wait for members to load');
    console.log('4. Press Enter in this terminal when ready...');
    console.log('=================================================\n');

    // Wait for user confirmation
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

    // Get current URL
    const currentUrl = await page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Inspect the DOM
    console.log('\n=================================================');
    console.log('INSPECTING DOM STRUCTURE');
    console.log('=================================================\n');

    const inspectionResults = {
      inspectedAt: new Date().toISOString(),
      url: currentUrl,
      pageTitle: await page.title(),
      htmlStructure: {},
      potentialSelectors: {},
      memberElements: null
    };

    // Get basic page structure
    console.log('1. Analyzing page structure...');
    inspectionResults.htmlStructure = await page.evaluate(() => {
      return {
        doctype: document.doctype ? document.doctype.name : 'unknown',
        bodyClasses: document.body.className,
        totalElements: document.querySelectorAll('*').length,
        mainContainers: Array.from(document.querySelectorAll('body > *'))
          .slice(0, 10)
          .map(el => ({
            tag: el.tagName,
            id: el.id || null,
            classes: el.className || null,
            role: el.getAttribute('role') || null
          }))
      };
    });

    console.log('   - Doctype:', inspectionResults.htmlStructure.doctype);
    console.log('   - Total elements:', inspectionResults.htmlStructure.totalElements);
    console.log('   - Main containers:', inspectionResults.htmlStructure.mainContainers.length);

    // Look for member-related elements
    console.log('\n2. Searching for member-related elements...');
    
    const memberSelectorsToTry = [
      '[data-testid="member-cell"]',
      '[data-testid="member_cell"]',
      '.member-cell',
      '[role="listitem"]',
      'a[href*="/profile"]',
      'a[href*="facebook.com/"]',
      '[data-pagelet="MainFeed"]',
      '[data-pagelet="BrowseList"]',
      '.x1lliihq',
      '.x78zum5',
      '.x1n2onr6'
    ];

    inspectionResults.potentialSelectors = {};
    
    for (const selector of memberSelectorsToTry) {
      try {
        const count = await page.evaluate((sel) => {
          return document.querySelectorAll(sel).length;
        }, selector);
        
        if (count > 0) {
          inspectionResults.potentialSelectors[selector] = count;
          console.log(`   ✓ ${selector} - Found ${count} elements`);
        }
      } catch (e) {
        // Invalid selector, skip
      }
    }

    // Get detailed info about first few member-like elements
    console.log('\n3. Extracting sample member element structure...');
    
    inspectionResults.memberElements = await page.evaluate(() => {
      // Try to find elements that look like member cards
      const allLinks = Array.from(document.querySelectorAll('a[href*="/"]'));
      const memberLikeElements = allLinks
        .filter(link => {
          const text = link.textContent?.trim() || '';
          const href = link.href || '';
          // Look for profile-like links
          return href.includes('facebook.com') && 
                 !href.includes('privacy') &&
                 !href.includes('settings') &&
                 text.length > 0 &&
                 text.length < 100;
        })
        .slice(0, 5);

      return memberLikeElements.map(link => {
        // Get parent structure
        let parent = link.parentElement;
        let parentInfo = null;
        
        if (parent) {
          parentInfo = {
            tag: parent.tagName,
            id: parent.id || null,
            classes: parent.className || null,
            dataAttrs: Array.from(parent.attributes)
              .filter(attr => attr.name.startsWith('data-'))
              .map(attr => `${attr.name}="${attr.value}"`)
              .join(' ')
          };
        }

        return {
          linkText: link.textContent?.trim() || '',
          linkHref: link.href,
          linkClasses: link.className || null,
          linkDataAttrs: Array.from(link.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(' '),
          parent: parentInfo,
          fullHTML: link.outerHTML.substring(0, 500)
        };
      });
    });

    if (inspectionResults.memberElements.length > 0) {
      console.log(`   Found ${inspectionResults.memberElements.length} sample member-like elements`);
      console.log('\n   Sample element structure:');
      inspectionResults.memberElements.forEach((elem, idx) => {
        console.log(`\n   --- Sample ${idx + 1} ---`);
        console.log(`   Text: "${elem.linkText}"`);
        console.log(`  Href: ${elem.linkHref}`);
        console.log(`   Parent: ${elem.parent?.tag}${elem.parent?.id ? '#' + elem.parent.id : ''}${elem.parent?.classes ? '.' + elem.parent.classes.split(' ')[0] : ''}`);
      });
    } else {
      console.log('   No member-like elements found automatically.');
      console.log('   Please manually inspect the page using browser DevTools.');
    }

    // Look for work details / subtitles
    console.log('\n4. Searching for work/details text elements...');
    
    const subtitleSelectors = [
      '[data-testid="profile_subtitle"]',
      '.x1n2onr6',
      '.x78zum5',
      'span[dir="auto"]'
    ];

    for (const selector of subtitleSelectors) {
      try {
        const elements = await page.evaluate((sel) => {
          return Array.from(document.querySelectorAll(sel))
            .slice(0, 3)
            .map(el => ({
              text: el.textContent?.trim() || '',
              classes: el.className || null
            }))
            .filter(el => el.text.length > 0);
        }, selector);
        
        if (elements.length > 0) {
          console.log(`\n   ${selector}:`);
          elements.forEach(el => {
            console.log(`     - "${el.text}" (classes: ${el.classes || 'none'})`);
          });
        }
      } catch (e) {
        // Skip invalid selectors
      }
    }

    // Save results to file
    const outputPath = path.resolve(OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(inspectionResults, null, 2));
    console.log('\n=================================================');
    console.log('RESULTS SAVED');
    console.log('=================================================');
    console.log(`Output file: ${outputPath}`);
    console.log('\nReview the file to identify the correct selectors.');
    console.log('Look for patterns in the memberElements array.');

    console.log('\n=================================================');
    console.log('NEXT STEPS:');
    console.log('=================================================');
    console.log('1. Open dom-inspection-results.json');
    console.log('2. Identify consistent selectors for:');
    console.log('   - Member card containers');
    console.log('   - Member names (links)');
    console.log('   - Work details/subtitles');
    console.log('3. Update SELECTORS in scraper.js with discovered values');
    console.log('4. Close the browser when done');
    console.log('=================================================\n');

    // Keep browser open for manual inspection
    console.log('Browser remains open for manual DevTools inspection.');
    console.log('Press Ctrl+C to exit.\n');

    // Wait indefinitely until user closes browser or presses Ctrl+C
    await new Promise(() => {});

  } catch (error) {
    console.error('\n✗ Error during inspection:', error.message);
    console.error('  Details:', error.stack);
  } finally {
    await browser.close();
  }
}

// Main execution
const groupUrl = process.argv[2];
inspectDOM(groupUrl).catch(console.error);
