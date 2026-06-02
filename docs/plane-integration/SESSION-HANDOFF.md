---
name: plane-qa-session-handoff
description: Session handoff prompt for Plane QA integration. Copy this to inform other sessions/agents about the automated QA-to-Plane issue tracking system. Use when starting a new session that needs context about the SDLC QA + Plane setup.
---

# Session Handoff: SDLC QA + Plane Integration

## สิ่งที่ติดตั้งแล้ว

ระบบ QA loop เชื่อมต่อกับ Plane project management อัตโนมัติ — Playwright E2E test failures จะสร้าง/เปิด issue ใน Plane, test passes จะ auto-close

## ไฟล์ที่สร้าง/แก้ไข

### สร้างใหม่
| ไฟล์ | หน้าที่ |
|------|---------|
| `ui/scripts/qa-plane.config.ts` | Config: Plane URL `https://plane.sys9.co`, workspace `sys9`, project UUIDs, state/label IDs |
| `ui/scripts/plane-sync.ts` | Plane API client: create/find/update/comment work items, dedup via `external_id`, auto-close |
| `ui/scripts/plane-reporter.ts` | Custom Playwright reporter — calls plane-sync on every test end |
| `.opencode/skills/sdlc-qa-plane/SKILL.md` | Project skill: CRM-specific SDLC rules + Plane config |
| `~/.agents/skills/plane-qa-sync/SKILL.md` | Shared skill: generic pattern สำหรับโปรเจคอื่น |

### แก้ไข
| ไฟล์ | เปลี่ยน |
|------|--------|
| `ui/playwright.config.ts` | เพิ่ม `plane-reporter.ts` เข้า reporters |
| `ui/package.json` | เพิ่ม script `test:e2e:plane` |
| `ui/.env.example` | เพิ่ม `PLANE_API_KEY=` |
| `ui/.env` | เพิ่ม API key จริง (ไม่ commit) |
| `.opencode/agents/qa.md` | เพิ่ม Plane sync step + report format |
| `.opencode/skills/e2e-testing/SKILL.md` | เพิ่ม Plane sync section |
| `.opencode/skills/verification-loop/SKILL.md` | เพิ่ม Plane sync section |
| `.opencode/skills/tdd-workflow/SKILL.md` | เพิ่ม Plane tracking section |
| `.opencode/agents/test-writer.md` | เพิ่ม Plane awareness block |

## Plane Config (hardcoded)

```
URL: https://plane.sys9.co
Workspace: sys9
Project: 42274dc1-be6c-474d-9883-a7fe72feef44 (CRM)
Assignee: satit (93b18c70-1537-41be-b9b7-81f22e0f1c9c)
API Key: your-plane-api-key (ใน ui/.env)

States: 
- Backlog=da93daba-2f57-4be6-acc8-f7fc88354dc2
- Todo=103c64f2-ce49-46e3-a5c4-5bea3fd9679f  
- In Progress=5064a47f-84c8-4a15-aa30-8219c331571b
- QA=90159e0f-89c2-4b75-a4ab-6b5cea144f47
- Done=350c93e8-f23c-4da2-99e8-88bce77899de
- Cancelled=468b9a3a-ec45-4b01-ba6b-22a0399e92ef

Labels:
- BUG: 5a03879e-6fb4-4b76-be8a-49e56974a48d

Cycles:
- พ.ค.69: 08ed7201-0312-40de-96d1-1b16a410bdea (1 May - 31 May 2026)
- มิ.ย.69: c0e7c9d3-43f4-42cc-92dd-78ae30f1eb33 (1 Jun - 30 Jun 2026)
```

## State Transitions (automatic)

```
Test FAIL (new)      → Create issue: Todo + BUG + assign satit
Test FAIL (reopened) → Done/Cancelled → Todo + comment
Test FAIL (active)   → comment only
Test PASS (was bug)  → Todo/QA/In Progress → Done + comment
```

## Dedup

```
Fingerprint: pw:{sha256(filePath:testTitle)[:12]}
Stored in: Plane external_id field
external_source: playwright-crm
```

## วิธีใช้

```bash
cd ui

# รัน E2E — Plane sync อัตโนมัติ
npx playwright test

# รันเฉพาะ Plane reporter
npm run test:e2e:plane

# รันโดยไม่ sync
PLANE_API_KEY= npx playwright test
```

## Sale Plan v2 Project Integration

Sale Plan v2 มี Plane cards พร้อมแล้ว:
- Main Feature Card: f8f4bc30-2881-4b03-bc30-62b402cb662a (In Progress)
- 4 Sub-tasks: Frontend (Done), Backend API (Todo), UI/UX (Done), Testing (Todo)
- ทุก cards assigned ให้ satit และมี complete documentation

## หมายเหตุสำคัญ

- `PLANE_API_KEY` อยู่ใน `ui/.env` — ไม่ commit (อยู่ใน .gitignore)
- ถ้าไม่มี key → reporter ข้ามไปเงียบๆ ไม่ crash
- plane-sync.ts ใช้ `fetch()` native (Node 18+) — ไม่ต้อง dependency เพิ่ม
- plane-reporter.ts เป็น Playwright Reporter interface — import จาก `@playwright/test/reporter`
- ทุก skill/agent ที่เกี่ยวกับ testing รู้จัก Plane sync แล้ว (e2e-testing, verification-loop, tdd-workflow, test-writer, qa)
- Plane API ใช้ `X-API-Key` header (ไม่ใช่ `Authorization: Bearer`)

## Public Documentation (GitHub Pages)

| Field | Value |
|-------|-------|
| Public repo | `github.com/sys9-co/crm-docs` |
| Pages URL | `https://sys9-co.github.io/crm-docs/` |
| Spec docs | Sale Plan v2 (7 files) |
| Card | CRM-127 (Done) |
| Sync | Manual — mirror `crm/docs/` → `crm-docs/docs/` |

## Plane API — UTF-8 / Thai (CRITICAL)

**ห้ามใช้** `Invoke-RestMethod` + `ConvertTo-Json` กับภาษาไทย — จะเพี้ยน
**ให้ใช้** `curl.exe` + `--data-binary "@$jsonPath"` โดยเขียน JSON ผ่าน `[System.IO.File]::WriteAllText($jsonPath, $json, (New-Object System.Text.UTF8Encoding $false))`
ดูวิธีทำใน skill `sdlc-qa-plane`
