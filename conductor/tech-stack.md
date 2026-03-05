# Technology Stack

## Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Language** | JavaScript | ES6+ (CommonJS) | Primary programming language |
| **Runtime** | Node.js | Latest LTS | JavaScript runtime environment |
| **Package Manager** | npm | Bundled with Node.js | Dependency management |

## Libraries & Frameworks

| Library | Version | Purpose |
|---------|---------|---------|
| **Puppeteer** | ^24.37.5 | Headless browser automation for scraping Facebook |

## Data & Storage

| Component | Format | Purpose |
|-----------|--------|---------|
| **Data Export** | JSON | Structured output for member data |
| **Session Storage** | Chrome/Chromium profile | Persistent Facebook login sessions |

## Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **Puppeteer (bundled Chromium)** | Browser automation |

## Architecture Notes

- **Module System:** CommonJS (`require()`/`module.exports`)
- **Async Pattern:** Async/await for all Puppeteer operations
- **Browser:** Chromium (bundled with Puppeteer)
- **Device Emulation:** Galaxy S8 mobile profile
- **Extraction Strategy:** Iterative "extract-click-delete" for memory efficiency and URL verification

## Dependencies

```json
{
  "puppeteer": "^24.37.5"
}
```
