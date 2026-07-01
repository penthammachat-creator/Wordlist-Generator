# Architecture
## Project Type
Web App
## Platform Guidance
- Start with responsive web screens before considering native mobile or desktop wrappers.
- Prioritize clear routes, form states, loading states, and browser-friendly deployment.
## Preferred Stack
- HTML5, CSS3, vanilla JavaScript (no framework)
- Responsive design with CSS Flexbox/Grid
- No build step required; can be opened directly in browser
- Deployment: GitHub Pages or Netlify

## Design System
- VoiceBox editorial design system (bold, magazine-style)
- Colors: Black (#0A0A0A), Red (#EF4444), White (#FAFAFA)
- Typography: Archivo Black (headings), Work Sans (body), Space Mono (code/stats)
- All elements: 0px border radius, no shadows, 2px borders
- Google Fonts loaded via CSS @import

## Thai Keyboard Layout
- Kedmanee layout for Thai-to-English character mapping

## Word Generation Logic
- Charset permutations (all combinations of selected character sets)
- Custom words used as-is (no permutation, no case variations)
- Leetspeak substitution (a→@, e→3, i→1, o→0, s→5, t→7, l→1, b→8, g→9)
- Prefix/suffix appending
- Number range suffix (0-9, 00-99, 000-999)
- Year range append (configurable start/end year)
- Word combination/mashup with separator options
- Common passwords bundle (top 500)
- Import existing wordlist (.txt file upload)
- Deduplication via Set before output

## Threading
- Web Worker (js/wordgen-worker.js) for CPU-intensive generation
- Batch processing (5000 words per batch) with streaming progress
- Real-time progress reporting with stage labels from worker
- UI remains responsive during generation

## Input Validation
- minLength must be <= maxLength
- At least one character type or custom word required
- Back navigation between all wizard steps

## File Splitting
- Support both split-by-number-of-files and split-by-max-file-size

## Export Formats
- Plain text (.txt)
- Hashcat mask format (.hc)
- John the Ripper format (.john)

## File Naming
- Default pattern: wordlist_001.txt, wordlist_002.txt, ...
- Zero-padded index for consistent sorting

## Wizard Flow
- 3 steps: Configure → Generate → Download
## Authentication
Not required in MVP
## Roles
- owner
- user
## Database
No database required
## External Integrations
- No external integrations defined yet.