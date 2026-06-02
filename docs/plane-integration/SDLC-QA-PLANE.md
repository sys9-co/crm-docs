---
name: sdlc-qa-plane
description: SDLC QA loop integrated with Plane project management for the SYS9 CRM project. Auto-creates Plane issues on test failure, auto-closes on fix. Covers state transitions, dedup policy, assignee rules, and QA report format. Use when running QA cycles, tracking bugs, or understanding the QA-to-Plane workflow.
---

# SDLC QA + Plane Integration — SYS9 CRM

## Plane Instance

| Field | Value |
|-------|-------|
| URL | `https://plane.sys9.co` |
| Workspace | `sys9` |
| Project | `42274dc1-be6c-474d-9883-a7fe72feef44` |
| Issue URL | `https://plane.sys9.co/sys9/projects/42274dc1-be6c-474d-9883-a7fe72feef44/issues/` |

## State IDs

| State | UUID | Group |
|-------|------|-------|
| Backlog | `da93daba-2f57-4be6-acc8-f7fc88354dc2` | backlog |
| **Todo** | `103c64f2-ce49-46e3-a5c4-5bea3fd9679f` | unstarted |
| In Progress | `5064a47f-84c8-4a15-aa30-8219c331571b` | started |
| **Done** | `350c93e8-f23c-4da2-99e8-88bce77899de` | completed |
| Cancelled | `468b9a3a-ec45-4b01-ba6b-22a0399e92ef` | cancelled |
| QA | `90159e0f-89c2-4b75-a4ab-6b5cea144f47` | started |

## Label IDs

| Label | UUID |
|-------|------|
| **BUG** | `5a03879e-6fb4-4b76-be8a-49e56974a48d` |

## Default Assignee

| Name | Email | UUID |
|------|-------|------|
| satit(Noi) | satit@nopadol.com | `93b18c70-1537-41be-b9b7-81f22e0f1c9c` |

## Cycles

| Cycle | UUID | Period |
|-------|------|--------|
| พ.ค.69 | `08ed7201-0312-40de-96d1-1b16a410bdea` | 1 May - 31 May 2026 |
| มิ.ย.69 | `c0e7c9d3-43f4-42cc-92dd-78ae30f1eb33` | 1 Jun - 30 Jun 2026 |

**Cycle auto-detection**: plane-sync fetches all cycles via API and picks the one where `now` is between `start_date` and `end_date`. If no active cycle, picks the nearest upcoming one. Issue is added to the current cycle automatically on create and reopen.

## Automated State Transitions

```
Test FAIL (new)       → Create issue: Todo + BUG label + assign satit + link parent
Test FAIL (reopened)  → Done/Cancelled → Todo + comment + add to cycle
Test FAIL (active)    → Todo/QA/In Progress → comment only
Agent implements      → Todo → In Progress (auto via startIssue)
Test PASS (was bug)   → Todo/In Progress/QA → Done + auto-close comment
```

## Golden Rule: Test Spec → Plane Card Link

Every test spec references its Plane card ID via `@plane` tag. This creates bi-directional traceability:

### Test Spec Format
```typescript
// tests/e2e/saleplan-edit.spec.ts
/**
 * @plane CRM-73
 */
test('[CRM-73] Sale plan line should have Edit button', async ({ page }) => {
  await expect(page.getByRole('button', { name: /แก้ไข/i })).toBeVisible()
})
```

### How @plane tag works

1. Reporter reads test file → finds `@plane CRM-73`
2. Resolves `CRM-73` → UUID via Plane API (search by `sequence_id`)
3. Creates bug issue with `parent: <CRM-73 UUID>` → linked as child
4. Agent starts fix → calls `startIssueByTag("CRM-73")` → moves to In Progress
5. Test passes → auto-close (Done)

### QA Agent: Close Card + Create Test Spec

**Command:** `/qa close-plane CRM-73 "Edit button added by form-builder"`

1. QA reads @plane tag from test spec → finds Plane ID
2. Calls `closeIssueById(issueId, comment)` → moves card to Done
3. If test spec doesn't exist, QA creates one with `@plane` tag

### Auto "In Progress"

When agent starts implementing a fix:
```typescript
import { startIssue, startIssueByTag, resolvePlaneTag } from '../scripts/plane-sync.js'

// Option 1: By @plane tag
await startIssueByTag('CRM-73')

// Option 2: By issue UUID
await startIssue('issue-uuid-here')
```

Agent flow:
1. Read `@plane` tag from failing test file
2. Call `startIssueByTag(tag)` → finds child bug issue → moves to In Progress
3. Implement the fix
4. Re-run tests → if pass → auto-close (Done)

### Manual Close API

```typescript
// plane-sync.ts exports
closeIssueById(issueId: string, comment?: string): Promise<boolean>
findIssueByName(name: string): Promise<PlaneIssue | null>
startIssue(issueId: string): Promise<boolean>
startIssueByTag(tag: string): Promise<boolean>
resolvePlaneTag(tag: string): Promise<string | null>
parsePlaneTag(fileContent: string): string | null
```

## Dedup Policy

- Fingerprint: `pw:{sha256(filePath:testTitle)[:12]}`
- Stored in Plane `external_id` field
- `external_source`: `playwright-crm`
- Before creating: search by `external_id`
- Same fingerprint = same bug = update, never duplicate

## Files

| File | Purpose |
|------|---------|
| `ui/scripts/qa-plane.config.ts` | Config: Plane URL, UUIDs, env overrides |
| `ui/scripts/plane-sync.ts` | API client: CRUD, dedup, auto-close |
| `ui/scripts/plane-reporter.ts` | Custom Playwright reporter |
| `create-sale-plan-v2-cards.js` | Auto-create Sale Plan v2 project structure |
| `update-plane-assignees.js` | Bulk assign cards to team members |
| `update-plane-status.js` | Sync card status with actual progress |
| `update-feature-card-content.js` | Update cards with documentation |
| `check-plane-card.js` | Verify individual card status |
| `list-all-cards.js` | List all cards in project for analysis |

## Commands

```bash
cd ui

# Run E2E with Plane sync (auto in playwright.config.ts)
npx playwright test

# Run with Plane reporter only (no list output)
npm run test:e2e:plane

# Run without Plane sync (unset API key)
PLANE_API_KEY= npx playwright test
```

## SDLC Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Developer   │     │  QA Agent    │     │    Plane     │     │  Developer   │
│  commits     │────►│  runs tests  │────►│  creates     │────►│  fixes bug   │
│  code        │     │  (Playwright)│     │  issue       │     │  (moves to   │
│              │     │              │     │  (auto)      │     │   In Progress│
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                       │
                                                                       ▼
                                                 ┌──────────────┐     ┌──────────────┐
                                                 │  Done        │◄────│  QA Agent    │
                                                 │  (auto-close)│◄────│  re-runs     │
                                                 │              │     │  tests       │
                                                 └──────────────┘     └──────────────┘
```

## QA Report Format (with Plane mapping)

```
# QA Report — [date]

## Environment
- Node: [version]
- Browser: Chromium [version]
- Commit: [hash]

## Results
### Build: ✅/❌
### Tests: X/Y passed (Z flaky)
### Console errors: [none/issues]

## Failed tests
1. test name — failure reason

## Plane Issues
| Plane ID | Test | State | Action | Link |
|----------|------|-------|--------|------|
| CRM-XX | test name | Todo | Created | https://plane.sys9.co/.../issues/XX |

## Plane Sync Summary
- 🆕 [n] new issues created
- 🔄 [n] issues reopened
- 💬 [n] still failing (comment added)
- ✅ [n] auto-closed
- ⏭️ [n] skipped (API error)

## Warnings
- [items to address before release]

## Suggestions
- [improvement suggestions]
```

## Team Rules

1. **All QA bugs** go to Plane automatically via reporter
2. **Default assignee**: satit — can be reassigned in Plane
3. **BUG label** applied automatically
4. **Never create duplicate** — dedup via fingerprint
5. **Auto-close only** when test passes — manual close still works
6. **Reopened bugs** get a comment with new failure details
7. **State flow**: Todo → In Progress → QA → Done (manual by dev, auto-close by QA)

## Plane API — UTF-8 / Thai Rules (CRITICAL)

When calling Plane API from **PowerShell on Windows**, `Invoke-RestMethod` + `ConvertTo-Json` **corrupts Thai text** (ภาษาไทยเพี้ยน). Always use one of these patterns:

### Pattern 1: curl.exe (recommended for manual API calls)
```powershell
$jsonPath = "$env:TEMP\plane-payload.json"
$json = @'
{"name": "ชื่อภาษาไทย", "description_html": "<p>อาการ: บั๊กภาษาไทย</p>"}
'@
[System.IO.File]::WriteAllText($jsonPath, $json, (New-Object System.Text.UTF8Encoding $false))
$issueId = "issue-uuid"
$apiKey = "plane_api_xxxxx"
$apiUrl = "https://plane.sys9.co/api/v1/workspaces/sys9/projects/42274dc1-be6c-474d-9883-a7fe72feef44/work-items/$issueId/"
curl.exe -s -X PATCH -H "X-API-Key: $apiKey" -H "Content-Type: application/json" --data-binary "@$jsonPath" $apiUrl
```

### Pattern 2: Node.js (for scripts like plane-sync.ts)
```typescript
// plane-sync.ts already uses fetch() which handles UTF-8 correctly — no changes needed
const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
```

### NEVER use (breaks Thai)
```powershell
# ❌ BROKEN — ConvertTo-Json corrupts Thai characters
$body = @{ name = "ภาษาไทย" } | ConvertTo-Json
Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"

# ❌ BROKEN — Invoke-RestMethod with Thai string body
Invoke-RestMethod -Uri $url -Method PATCH -Body (@{ description_html = "<p>ภาษาไทย</p>" } | ConvertTo-Json)
```

### Git on Windows
Git may not be on PATH. Use: `$env:Path = "C:\Program Files\Git\cmd;" + $env:Path`

## Sale Plan v2 Project Integration

Sale Plan v2 มี complete Plane integration:

### Cards Structure
| Card | ID | Status | Description |
|------|----|---------|-----------| 
| Main Feature | f8f4bc30-2881-4b03-bc30-62b402cb662a | In Progress | Excel-style table implementation |
| Frontend | ac30c979-f8fd-4b43-bc76-cd1e986efacf | Done | Vue 3 components completed |
| Backend API | 727b3477-7444-433e-8a2c-9f20d971eb31 | Todo | 5 endpoints specification ready |
| UI/UX | 8f78e3e8-cefd-4221-b371-0142781dfe89 | Done | Responsive design completed |
| Testing | bb4b6092-3299-4d79-b04a-2fed61c863df | Todo | E2E tests awaiting real API |

### Integration Scripts
- `create-sale-plan-v2-cards.js` - Auto-create project cards
- `update-plane-assignees.js` - Bulk assignee updates  
- `update-plane-status.js` - Status sync with actual progress
- `update-feature-card-content.js` - Documentation sync

### Workflow
```
1. E2E tests with @plane CRM-121 tags link to feature cards
2. Test failures create child bug issues under feature cards
3. Bug fixes auto-move parent cards to In Progress
4. Test passes auto-close bug issues and update feature status
```

## Public Documentation (GitHub Pages)

เอกสาร spec ถูกเผยแพร่สู่สาธารณะผ่าน GitHub Pages สำหรับ backend team:

| Field | Value |
|-------|-------|
| Repo | `github.com/sys9-co/crm-docs` (public) |
| Pages URL | `https://sys9-co.github.io/crm-docs/` |
| Source folder | `/docs` |
| Theme | `jekyll-theme-cayman` |
| Main CRM copy | `docs/` in private `sys9-co/crm` repo |

### Structure
```
crm-docs/
├── docs/                    # GitHub Pages source
│   ├── index.md            # Homepage (Jekyll layout)
│   ├── _config.yml         # Cayman theme, kramdown
│   └── sale-plan-v2/       # Full 7-file spec package
└── README.md
```

### Sync Rules
- ไฟล์ใน `crm/docs/` (private repo) ต้อง mirror ไป `crm-docs/docs/` (public repo)
- ไม่มี automation — ต้อง manual sync
- Links ใน Pages ใช้ `.html` extension (Jekyll convention)
- ถ้าแก้ docs → commit ทั้ง 2 repos

### Plane Card
- CRM-127 — GitHub Pages Documentation Repository (Done)

## Environment Setup

```bash
# Required in ui/.env  
PLANE_API_KEY=your-plane-api-key

# Optional overrides (defaults are hardcoded)
PLANE_BASE_URL=https://plane.sys9.co
```
