#!/usr/bin/env node

/**
 * Facebook Member List Scraper - CLI
 * 
 * Usage: node scraper-cli.js <group-url>
 * Example: node scraper-cli.js https://www.facebook.com/groups/123456/members
 */

const { runScraper, CONFIG } = require('./scraper');

async function main() {
  const groupUrl = process.argv[2];

  if (!groupUrl) {
    console.log('=================================================');
    console.log('Facebook Member List Scraper');
    console.log('=================================================');
    console.log('\nUsage: node scraper-cli.js <group-url>');
    console.log('\nExample:');
    console.log('  node scraper-cli.js https://www.facebook.com/groups/123456/members');
    console.log('\nThe group URL should point to the members page.');
    console.log('Make sure you have logged in using login.js first.');
    console.log('=================================================\n');
    process.exit(1);
  }

  try {
    const result = await runScraper(groupUrl);
    console.log('\n✓ Scraping completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Scraping failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure you are logged in to Facebook');
    console.error('  2. Run login.js first to create a session: node login.js');
    console.error('  3. Verify the group URL is correct and accessible');
    console.error('  4. Check that the group has members visible');
    process.exit(1);
  }
}

main();
