# Create Word for Dictionary Attack

ไฟล์ ZIP นี้สร้างจาก AI Project Bootstrapper เพื่อใช้เป็นชุดเอกสารตั้งต้นสำหรับให้ AI coding tool ทำงานต่อ

เริ่มอ่านไฟล์นี้ก่อน แล้วค่อยส่ง prompt ด้านล่างให้ AI อ่านเอกสารในโฟลเดอร์ `documents/` และ `prompts/`

## เริ่มใช้งานหลังได้ ZIP

1. แตกไฟล์ ZIP นี้ไว้ในโฟลเดอร์โปรเจกต์ที่ต้องการให้ AI ทำงานต่อ
2. เปิด AI coding tool เช่น Codex, Cursor, Antigravity, Claude หรือเครื่องมือที่คุณใช้
3. คัดลอกข้อความในหัวข้อ `Recommended AI Starter Prompt` ด้านล่างไปวางสั่ง AI
4. ให้ AI อ่าน `README.md`, `documents/prd.md`, `documents/architecture.md`, `documents/tasks.md` และไฟล์ใน `prompts/` ก่อนเริ่มเขียนโค้ด
5. หลัง AI แก้โค้ด ให้สั่งให้ AI อัปเดต `tasks.md`, `architecture.md`, และ `prd.md` ถ้าสิ่งที่ทำเปลี่ยนแผนหรือขอบเขตงาน

## Project Snapshot

- Project type: Web App
- Primary goal: ต้องการสร้างคำที่ใช้ในการ Burteforce Password โดยการ Random จากเงื่อนไขที่เรากำหนด โดยการสร้าง output ออกมาเป็น text เราสามารถ split ให้ไฟล์ไม่ใหญ่เกินไปได้ตามที่เรากำหนดได้
- Target users: pentester ที่ทำหน้าที่ทดสอบเจาะระบบ
- Output language: bilingual
- Prompt pack level: standard

## Platform Guidance

Browser-based application that users open through a web browser on desktop or mobile devices.

- Start with responsive web screens before considering native mobile or desktop wrappers.
- Prioritize clear routes, form states, loading states, and browser-friendly deployment.

AI instruction: Treat this as a browser-based web application first. Prefer responsive web implementation unless the documents explicitly request native mobile or desktop code.

## AI Target Context

- Target workflow: Generic Agent
- Provider mode: Standard Fallback
- Provider model: not specified
- Provider timeout: default
- Workflow style: Tool-agnostic, markdown-first, easy to adapt
- Handoff style: สื่อสารชัดเป็นขั้นตอน ใช้ภาษาเรียบและลด assumption ที่ผูกกับ IDE ใด IDE หนึ่ง
- Prompt bias: เน้น context completeness, next-task execution และ memory updates แบบทั่วไป

## What Is Inside

### Documents

- documents/prd.md
- documents/architecture.md
- documents/tasks.md

### Prompts

- prompts/start-project.md - Start Project
- prompts/implement-next-task.md - Implement Next Task
- prompts/review-output.md - Review Output
- prompts/update-project-context.md - Update Project Context
- prompts/update-memory.md - Update Memory

### Optional Bundles

- AI pack: Not included in this export
- AI analysis: Not included in this export
- Provider diagnostics: No provider diagnostics included
- Context sync: No context sync bundle included
- Team template: Not included
- Baseline snapshots: 0

## Recommended Reading Order

1. `README.md` - คู่มือเริ่มต้นและ prompt สำหรับส่งต่อให้ AI
2. `documents/prd.md` - เป้าหมายของโปรแกรมและขอบเขตที่ควรทำ
3. `documents/architecture.md` - โครงสร้างระบบและแนวทางเทคนิค
4. `documents/tasks.md` - งานถัดไปที่ควรให้ AI ทำทีละข้อ
5. `prompts/start-project.md` - prompt เริ่มงานสำหรับ AI coding tool
6. `prompts/update-project-context.md` - prompt สำหรับสั่ง AI อัปเดตเอกสารหลังแก้โค้ด
7. ไฟล์เสริม เช่น `rules.md`, `memory.md`, `api.md`, `database.md` ให้อ่านเมื่อมีอยู่ใน ZIP

## Recommended AI Starter Prompt

Copy this into your AI coding tool after unzipping this project pack:

```text
ผมมี project pack ที่สร้างจาก AI Project Bootstrapper อยู่ใน workspace นี้แล้ว

Please read `README.md` first.
Then read `documents/prd.md`, `documents/architecture.md`, `documents/tasks.md`, and the files in `prompts/`.

Use the generated documents as the source of truth.
If optional files such as `rules.md`, `memory.md`, `api.md`, or `database.md` exist, read them too before changing code.

Start by summarizing what you understand in simple bullet points.
Then identify the next safest task from `documents/tasks.md` before changing code.

When you change code, update the relevant project context documents in the same pass.
At minimum, keep `tasks.md`, `architecture.md`, and `prd.md` synchronized when implementation changes the plan, system structure, or product scope.

Do not invent product requirements, database tables, API contracts, providers, auth models, or integrations unless they are supported by the documents or the existing code.
If evidence is weak, add a confirmation task in `documents/tasks.md` instead of treating the assumption as fact.
```

## Operating Rules

- Treat generated documents as living source-of-truth files, not one-time scaffolding.
- Keep code, `tasks.md`, `memory.md`, `architecture.md`, and `prd.md` synchronized as the project changes.
- Use `tasks.md` to work in small, reviewable steps.
- Use `memory.md` to preserve durable decisions and assumptions for the next session.
- If this pack came from Import Existing Project, confirm weak evidence before treating it as final truth.

## Machine-Readable Summary

See `project-summary.json` for structured metadata about this export.