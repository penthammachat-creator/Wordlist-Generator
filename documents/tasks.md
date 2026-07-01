# Tasks
## Backlog
### T-001 Kick Off The Project Context
- Status: `Completed`
- Detail:
  - Review generated documents.
  - Confirm missing assumptions with the product owner.
  - Confirmed decisions:
    - Tech stack: HTML, CSS, vanilla JavaScript (no framework).
    - Thai keyboard layout: Kedmanee.
    - Word generation logic: Generate all permutations of user-provided words.
    - Split logic: Both by number of files and max file size per file.
    - File naming: wordlist_001.txt, wordlist_002.txt, ...
    - Wizard steps: 3 steps (Configure → Generate → Download).

### T-001a Set Up Project Structure
- Status: `Completed`
- Detail:
  - Create index.html with basic HTML5 structure.
  - Create styles.css for responsive layout.
  - Create app.js for main application logic.
  - Set up folder structure (css/, js/, assets/ if needed).
  - Ensure the app can be opened directly in browser (no build step).
  - Created files: index.html, css/styles.css, js/app.js with wizard UI and placeholder logic.

### T-002 Implement The Core Feature Set
- Status: `Completed`
- Detail:
  - 1. สามารถสร้างคำ ตามเงื่อนไขได้ เช่น ต้องการกี่ตัวอักษร มีตัวเลขไหม มีออักขระพิเศษหรือเปล่า ตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่
  - 2. สร้างแปลงตัวหนังสือภาษาไทย โดยการพิมพ์แบบแป้นคียบอร์ดภาษาอังกฤษ เช่นคำว่า "ธรรมชาติ" จะเป็น "Tii,=k9B" เป็นต้น
  - 3. สามารถตั้งค่า split ไฟล์ output ได้ตาม Config เช่น ต้องการ 3 ไฟล์ หรือ ต้องการไฟล์ละ 5 kb เป็นต้น
  - 4. สามารถ Download output ออกมาเป็น .txt หรือ .zip (กรณี output มีหลายไฟล์)
  - 5. สามารถตั้งชื่อ output ไฟล์ได้
  - Implemented: charset generation, Thai mapping, word permutations, split by count/size, zip download.
### T-003 Validate Success Criteria
- Status: `Cancelled`
- Detail:
  - Skipped per product owner request. Manual validation not required.

### T-004 Redesign UI with VoiceBox Design System
- Status: `Completed`
- Detail:
  - Applied VoiceBox editorial design system: bold, high-contrast, magazine-style aesthetic.
  - Color scheme: Black (#0A0A0A), Red (#EF4444), White (#FAFAFA).
  - Typography: Archivo Black for headings, Work Sans for body, Space Mono for stats.
  - All elements: sharp corners (0px radius), no shadows, 2px borders.
  - Updated index.html with overline labels and editorial structure.
  - Updated css/styles.css with full VoiceBox tokens and component styles.

### T-005 Quick Wins: Dedup, Validation, Back Button, Charset Preview
- Status: `Completed`
- Priority: `High`
- Detail:
  - Add deduplication: filter generatedWords array to remove duplicates before download.
  - Add validation: check minLength <= maxLength, at least one charset selected, non-empty custom/thai words before allowing step 2.
  - Add back button: allow navigating back from step 2/3 to step 1.
  - Add charset preview: show the actual characters that will be used based on selected checkboxes.
  - Add word count estimate: calculate and display estimated total words before generation starts.

### T-006 Leetspeak Substitution
- Status: `Completed`
- Priority: `High`
- Detail:
  - Add leetspeak mapping: a→@, e→3, i→1, o→0, s→5, t→7, l→1, b→8, g→9.
  - User can toggle leetspeak on/off.
  - When enabled, generate leetspeak variations of each custom word.
  - Example: "password" → "p@ssw0rd", "p@ssw0r7", etc.

### T-007 Rule-Based Mutations (Prefix/Suffix/Append)
- Status: `Completed`
- Priority: `High`
- Detail:
  - Add prefix input: prepend a string to every generated word (e.g., "admin").
  - Add suffix input: append a string to every generated word (e.g., "123", "!").
  - Add number range suffix: append sequential numbers (e.g., 0-99, 0-999).
  - Add common suffix presets: !, @, #, 123, 123!, !@#, year.

### T-008 Year/Date Append
- Status: `Completed`
- Priority: `High`
- Detail:
  - Add year range selector (e.g., 2020-2026).
  - Append selected years to every generated word.
  - Example: "password" + years → "password2024", "password2025", "password2026".

### T-009 Combination Mashup
- Status: `Completed`
- Priority: `High`
- Detail:
  - Allow user to input multiple words and combine them.
  - Example: words ["man", "123"] → "man123", "123man", "man-123", "man_123".
  - Separator options: none, dash, underscore, dot.

### T-010 Preview Before Download
- Status: `Completed`
- Priority: `Medium`
- Detail:
  - Show first 50 and last 50 words in step 3 before download.
  - Show total word count and estimated file size.
  - Allow user to scroll through preview.

### T-011 Real Progress with Web Worker
- Status: `Completed`
- Priority: `Medium`
- Detail:
  - Move word generation to a Web Worker to prevent browser freeze.
  - Report real progress percentage from worker.
  - Show generation speed (words/second).

### T-012 Common Password List + Export Formats
- Status: `Completed`
- Priority: `Medium`
- Detail:
  - Bundle a small common password list (top 500 passwords).
  - Allow user to include/exclude common passwords in output.
  - Export format options: plain text, hashcat mask format, john format.

### T-013 Import Existing Wordlist
- Status: `Completed`
- Priority: `Medium`
- Detail:
  - Allow user to upload an existing .txt wordlist.
  - Merge imported words with generated words.
  - Deduplicate after merge.

### T-014 Output Size Warning
- Status: `Completed`
- Priority: `Medium`
- Detail:
  - Estimate total output size before generation.
  - Warn user if estimated size exceeds 10MB.
  - Suggest split options if output is large.

### T-015 Custom Words: Use As-Is (No Permutation)
- Status: `Completed`
- Priority: `High`
- Detail:
  - Custom words are now used directly without permutation or case variations.
  - Only leetspeak variations are applied if enabled.
  - Updated label to "คำที่ต้องการ (ใช้ตรงๆ ไม่สลับตำแหน่ง)".
  - Updated estimate to count each custom word as 1 (not factorial).
  - Updated worker to skip permutation for custom words.
  - Updated manual.md to reflect new behavior.

### T-016 Performance: Streaming Progress + Batch Processing
- Status: `Completed`
- Priority: `High`
- Detail:
  - Worker now processes in batches of 5000 words.
  - Progress bar shows real-time updates with stage labels.
  - Worker streams progress back to UI during generation.
  - UI shows stage names (charset, custom, thai, combine, etc.).

### T-017 Remove engToThai() Unused Function
- Status: `Completed`
- Priority: `Low`
- Detail:
  - Removed EN_to_TH mapping object and engToThai() function from thai-map.js.
  - Only Thai→English mapping is needed (Kedmanee layout).
  - Updated export to only expose thaiToEng and TH_to_EN.

### T-018 Preserve Form Values on Back Navigation
- Status: `Completed`
- Priority: `Low`
- Detail:
  - Removed configForm.reset() from restart() function to preserve form values when navigating back.
  - Back buttons in wizard already call nextStep() directly (not restart()), so form values were already preserved.
  - Cleaned up misleading dead code.

### T-019 Add Download Size Warning
- Status: `Completed`
- Priority: `Medium`
- Detail:
  - Added size check at beginning of downloadFiles() before triggering download.
  - Shows confirm dialog if estimated size exceeds 10MB, asking user to confirm or cancel.
  - User can still proceed with download if desired.

### T-020 Fix Charset Generation Truncation Bug
- Status: `Completed`
- Priority: `High`
- Detail:
  - Removed 5M word cap entirely — split feature handles large outputs.
  - Worker generates all combinations without limit, using batched processing.
  - Removed cap from estimate display in app.js.
  - Updated manual.md to remove maxSize note.