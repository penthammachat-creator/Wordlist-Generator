# Update Project Context

Project: Create Word for Dictionary Attack
Type: Web App
Documents available: prd.md, architecture.md, tasks.md
Primary goal: ต้องการสร้างคำที่ใช้ในการ Burteforce Password โดยการ Random จากเงื่อนไขที่เรากำหนด โดยการสร้าง output ออกมาเป็น text เราสามารถ split ให้ไฟล์ไม่ใหญ่เกินไปได้ตามที่เรากำหนดได้
Prompt pack level: standard
Platform instruction: Treat this as a browser-based web application first. Prefer responsive web implementation unless the documents explicitly request native mobile or desktop code.
Respond bilingually in Thai and English where useful.

After implementation, update the project context documents so the exported blueprint stays current.

Update these files when they are affected:
- tasks.md: mark completed work, add new follow-up tasks, and reorder priorities if implementation changed the execution plan
- memory.md: capture durable decisions, blockers, assumptions, and important discoveries for the next working session
- architecture.md: update stack, module boundaries, API shape, data flow, auth flow, or technical decisions if implementation changed them
- prd.md: update scope, feature intent, user flow, or success criteria only when the product direction truly changed

Rules:
- Do not rewrite documents that were not affected
- Keep updates concise and source-of-truth oriented
- Call out assumptions before editing if the change is ambiguous
- End with a short handoff summary of what changed, what remains, and which documents were updated