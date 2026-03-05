# Initial Concept

A Node.js/Puppeteer automation tool that scrapes Facebook member lists by emulating a mobile device (Galaxy S8) to access Facebook's mobile site.

# Product Definition

## Overview
A Node.js/Puppeteer automation tool designed for individual users to extract member information from Facebook groups for lead generation purposes. The tool emulates a mobile device to access Facebook's mobile interface and scrape member data efficiently.

## Target Users
- **Individual Users** - Personal use for lead generation and prospecting from Facebook groups

## Core Features
1. **Member List Extraction**
   - Extract all members from specified Facebook groups
   - Capture member name, work details, and Facebook profile link
   - Exclude profile images (data only, no media)
   
2. **Data Export**
   - Export scraped data in JSON format
   - Structured output for easy integration and analysis

3. **Session Management**
   - Persistent browser sessions to avoid repeated logins
   - Secure handling of Facebook authentication cookies

4. **Rate Limiting**
   - Built-in delays to avoid Facebook's anti-scraping detection
   - Configurable request throttling for safe operation

## Technical Approach
- Mobile emulation (Galaxy S8) for accessing Facebook mobile site
- Puppeteer for browser automation
- User data directory for session persistence
- Iterative extraction: Capture one member at a time and delete their DOM element to trigger list reflow
- Verified profile URLs: Programmatically click member avatars to capture and verify real vanity URLs

## Success Criteria
- Successfully extract member data from Facebook groups
- Export clean, structured JSON output
- Maintain session across multiple scraping sessions
- Operate without triggering Facebook's rate limits
