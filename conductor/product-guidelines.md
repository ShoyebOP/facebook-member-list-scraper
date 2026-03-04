# Product Guidelines

## Prose Style
**Minimal/Direct** - All user-facing text should be short, action-oriented, and free of unnecessary embellishment.

- Use imperative verbs for instructions (e.g., "Enter group URL", "Press Enter to continue")
- Avoid filler words and marketing language
- Keep console output clean and scannable
- Example: `✓ Exported 150 members to members.json`

## Branding
**Terminal-focused** - The tool operates entirely via CLI with colored console output.

- Use consistent color coding:
  - Green (`✓`) for success/completion
  - Yellow (`!`) for warnings
  - Red (`✗`) for errors
  - Blue (`→`) for progress/info
- Use separators (`---`, `===`) to organize output sections
- Display clear section headers in uppercase

## UX Principles

### Transparency
- Log each major action before and after execution
- Show real-time progress during scraping operations
- Display count of extracted items periodically
- Example: `Scraping page 1 of 15... (12 members found)`

### Safety First
- Confirm before overwriting existing data files
- Validate Facebook session before starting scrape
- Include rate-limiting delays by default (no option to disable)
- Graceful exit on unexpected page structures
- Never store passwords - rely on browser session cookies only

## Error Handling
**Detailed + User-Friendly** - Errors should include both technical context and actionable guidance.

Format:
```
✗ Error: [Brief description]
  Cause: [What went wrong]
  Fix: [What user should do]
  Details: [Technical info for debugging]
```

Example:
```
✗ Error: Failed to extract member data
  Cause: Facebook page structure changed or element not found
  Fix: Ensure you're logged in and the group URL is valid
  Details: Selector '.member-card' returned null at line 45
```

## Code Quality Standards
- All async operations must have proper error handling
- Use descriptive variable names (no single-letter variables)
- Comment complex logic, especially selectors that may break
- Keep functions focused (single responsibility)
