# Memory
## Project: Create Word for Dictionary Attack
## Key Decisions
- Tech stack: HTML, CSS, vanilla JavaScript (no framework).
- Thai keyboard layout: Kedmanee.
- Word generation logic: Generate all permutations of user-provided words.
- Split logic: Both by number of files and max file size per file.
- File naming: wordlist_001.txt, wordlist_002.txt, ...
- Wizard flow: 3 steps (Configure → Generate → Download).
- Design system: VoiceBox editorial (bold, magazine-style, high-contrast).
- Colors: Black (#0A0A0A), Red (#EF4444), White (#FAFAFA).
- Typography: Archivo Black (headings), Work Sans (body), Space Mono (stats).
- UI style: Sharp corners, no shadows, 2px borders, flat editorial look.

## Assumptions
- No database, no authentication.
- Browser-based web app, responsive.
- Deployable on GitHub/Netlify.
- Output is text files (.txt, .hc, .john) or zip archive.
- Project structure: index.html, css/styles.css, js/app.js (vanilla JS).
- jszip loaded from CDN for zip functionality.

## Blockers
- None currently.

## Notes
- The project is a tool for pentesters to generate password brute-force wordlists.
- Thai words are converted to English keyboard layout (e.g., "ธรรมชาติ" → "Tii,=k9B").
- Custom words are used as-is (no permutations, no case variations). Leetspeak still applies if enabled.
- Leetspeak: a→@, e→3, i→1, o→0, s→5, t→7, l→1, b→8, g→9.
- Export formats: plain text, hashcat mask, john the ripper.
- Web Worker streams progress back to UI with stage labels.
- Worker processes in batches of 5000 words and reports progress.
- Estimate uses uniquePermutations (multinomial) for charset, but custom words are counted as 1 each.
- Common passwords bundle: top 500 most used passwords.
- Import: user can upload .txt file, words merged and deduplicated.
- Size warning: shown when estimated output exceeds 10MB.

## Implementation Progress
- Basic project structure created.
- Thai mapping implemented.
- Word generation from charset and custom words implemented.
- Split logic implemented.
- Zip download implemented.
- UI wizard steps functional.
- VoiceBox design system applied (T-004 completed).
- T-005 completed: Dedup, validation, back button, charset preview, word estimate.
- T-006 completed: Leetspeak substitution.
- T-007 completed: Rule-based mutations (prefix/suffix/number suffix).
- T-008 completed: Year/date append.
- T-009 completed: Combination mashup.
- T-010 completed: Preview before download.
- T-011 completed: Web Worker for generation.
- T-012 completed: Common password list + export formats.
- T-013 completed: Import existing wordlist.
- T-014 completed: Output size warning.
- All tasks completed.
- Bug fixes: common passwords + imported words now passed to worker.
- Bug fixes: worker terminated on back navigation.
- Bug fixes: import file cleared on restart.
- Bug fixes: step 2 "ถัดไป" button disabled until generation complete.