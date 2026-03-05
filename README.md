# Facebook Group Member Scraper

A Node.js and Puppeteer-based automation tool designed to extract member information from Facebook groups. It emulates a mobile device to efficiently capture member names, work details, and profile links while verifying vanity URLs.

## Features

- **Member List Extraction:** Scrapes member names, work details, and profile links.
- **Vanity URL Verification:** Programmatically verifies real profile URLs by clicking avatars.
- **Mobile Emulation:** Uses Galaxy S8 profile to access Facebook's mobile site.
- **Memory Efficient:** Deletes processed DOM elements to trigger list reflow and maintain performance.
- **Session Management:** Supports persistent browser sessions to avoid frequent logins.

## Prerequisites

- **Node.js:** Latest LTS version recommended.
- **npm:** Bundled with Node.js.
- **Chrome/Chromium:** Puppeteer will download its own version during installation.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd facebook-member-list-scraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The scraper uses a `CONFIG` object in `scraper.js` (or environment variables/CLI arguments depending on implementation).

- **`OUTPUT_FILE`**: Path to the JSON file where results will be saved (default: `./members.json`).
- **`SESSION_DIR`**: Directory for storing browser profile and cookies (default: `./my_facebook_session`).
- **`DELAY_MS`**: Base delay between actions in milliseconds.

## Usage

### 1. Login
To create a persistent session, you may need to run the login script first:
```bash
node login.js
```
Follow the manual login process in the browser window that opens.

### 2. Scraping
Run the scraper by providing the Facebook group ID:
```bash
node scraper-cli.js <group-id>
```

### 3. Testing
Run the automated test suite:
```bash
npm test
```

## Project Structure

- `scraper.js`: Core scraping logic and configuration.
- `scraper-cli.js`: CLI entry point for running the scraper.
- `login.js`: Helper script for session initialization.
- `dom-inspector.js`: Utility for analyzing the Facebook DOM structure.

## Safety & Rate Limiting

This tool includes built-in delays to avoid detection. However, excessive use may result in temporary blocks from Facebook. Always use responsibly and adhere to Facebook's Terms of Service.

## License

ISC
