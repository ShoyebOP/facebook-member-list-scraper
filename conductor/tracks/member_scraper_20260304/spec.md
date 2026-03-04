# Track Specification: Build Core Member List Extraction Functionality

## Overview
This track implements the core functionality to extract member information from Facebook groups, including names, work details, and profile links.

## Objectives
1. Navigate to a Facebook group's member list page
2. Extract member data (name, work details, profile link) from each member card
3. Export collected data to JSON format
4. Handle pagination through member list pages
5. Implement rate limiting to avoid detection

## Scope

### In Scope
- Member list extraction from public Facebook groups
- Data fields: name, work details, profile URL
- JSON export to `members.json`
- Session reuse from existing `my_facebook_session/` directory
- Mobile emulation (Galaxy S8) for Facebook mobile site
- Rate limiting with configurable delays

### Out of Scope
- Profile image extraction
- Real-time monitoring or alerts
- Multi-group batch processing
- CSV/Excel export formats
- Scheduled/automated scraping

## Technical Requirements

### Input
- Facebook group URL (provided by user at runtime)
- Existing browser session in `./my_facebook_session/`

### Output
- JSON file (`members.json`) with structure:
```json
{
  "group_url": "https://facebook.com/groups/...",
  "scraped_at": "2026-03-04T12:00:00Z",
  "member_count": 150,
  "members": [
    {
      "name": "John Doe",
      "work": "Software Engineer at Acme Corp",
      "profile_url": "https://facebook.com/john.doe"
    }
  ]
}
```

### Dependencies
- Puppeteer ^24.37.5
- Node.js (LTS)

## Acceptance Criteria
1. [ ] Tool successfully logs in using existing session
2. [ ] Tool navigates to provided group member list URL
3. [ ] Tool extracts all visible members with correct data fields
4. [ ] Tool handles pagination (scrolling or next page)
5. [ ] Exported JSON is valid and contains all extracted members
6. [ ] Rate limiting prevents Facebook from blocking requests
7. [ ] Error handling provides clear user feedback

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Facebook changes DOM structure | Use robust selectors, add fallback selectors |
| Session expires | Validate session before scraping, prompt re-login |
| Rate limiting triggers blocks | Implement conservative delays, randomize timing |
| Large groups timeout | Implement pagination with progress tracking |

## Success Metrics
- Successfully extracts 100% of visible member data
- Completes without triggering Facebook anti-scraping
- Produces valid JSON output file
