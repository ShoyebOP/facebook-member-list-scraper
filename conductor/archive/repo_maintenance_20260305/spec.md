# Specification: Repository Maintenance and Documentation

## Overview
This track aims to optimize the repository size, fix the dependency installation issue caused by the missing `package.json` and accidental commits of large directories, and provide a clear setup guide for future use.

## Functional Requirements
1. **Repository Size Optimization**
   - Identify and remove `my_facebook_session/` and `node_modules/` from the Git history using `git filter-repo` or similar tools.
   - Drastically reduce the repository size from ~100MB to a more appropriate size (likely <1MB).
2. **Dependency Management**
   - Restore and verify the `package.json` file.
   - Update `.gitignore` to ensure `node_modules/`, `my_facebook_session/`, and other temporary files are never committed again.
   - Ensure `npm install` runs successfully.
3. **Documentation**
   - Create a `README.md` at the project root.
   - The README must include:
     - Project overview.
     - Prerequisites (Node.js, Puppeteer requirements).
     - Installation steps.
     - Usage instructions (how to run the scraper).
     - Configuration details (session management, group IDs).

## Non-Functional Requirements
- **Efficiency:** The repository should be lean and easy to clone.
- **Maintainability:** The setup process should be reproducible on any machine with Node.js.

## Acceptance Criteria
- Repository size is significantly reduced (verified with `du -sh .git`).
- `npm install` completes without errors.
- `.gitignore` correctly excludes sensitive and large directories.
- `README.md` is present and provides clear, working instructions.
- All scraper scripts can be executed after following the README.

## Out of Scope
- Implementing new features for the scraper.
- Fixing bugs within the scraping logic itself (unless they prevent setup).
