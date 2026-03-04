const puppeteer = require('puppeteer');
const { KnownDevices } = require('puppeteer');

// 1. We define the device we want to emulate
// Puppeteer has a list of predefined devices like 'iPhone X', 'Pixel 2', etc.
const MOBILE_DEVICE = KnownDevices['Galaxy S8'];

async function setupLogin() {
  console.log("Opening browser in MOBILE view...");

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './my_facebook_session',
    args: ['--start-maximized'] // The window will still open, but the content will be phone-sized
  });

  const page = await browser.newPage();

  // 2. Apply the mobile emulation BEFORE navigating
  await page.emulate(MOBILE_DEVICE);

  console.log("Navigating to Facebook (Mobile Site)...");

  await page.goto('https://www.facebook.com', {
    waitUntil: 'domcontentloaded',
    timeout: 120000
  });

  console.log("------------------------------------------------");
  console.log("ACTION: Log in to Facebook.");
  console.log("Close the browser when done to save session.");

  browser.on('disconnected', () => {
    console.log("Session saved!");
    process.exit(0);
  });
}

setupLogin();
