# Plane Integration — SYS9 CRM

## Overview

SYS9 CRM uses [Plane](https://plane.sys9.co) for project management. The QA system is integrated with Plane to auto-create issues on test failure and auto-close on fix.

## Contents

| File | Description |
|------|-------------|
| `SDLC-QA-PLANE.md` | Full SDLC QA + Plane integration spec: state transitions, dedup, assignee rules, UTF-8/Thai handling |
| `SESSION-HANDOFF.md` | Session handoff prompt — copy this to inform new sessions about the Plane QA setup |

## Quick Reference

| Field | Value |
|-------|-------|
| Plane URL | `https://plane.sys9.co` |
| Workspace | `sys9` |
| Project | `42274dc1-be6c-474d-9883-a7fe72feef44` (CRM) |
| Assignee | satit |
| Issue URL | `https://plane.sys9.co/sys9/projects/42274dc1-be6c-474d-9883-a7fe72feef44/issues/` |

## Key Scripts (in main CRM repo `ui/scripts/`)

- `plane-sync.ts` — API client: CRUD, dedup, auto-close
- `plane-reporter.ts` — Custom Playwright reporter
- `qa-plane.config.ts` — Config: Plane URL, UUIDs, env overrides

## Automation Scripts (in main CRM repo root)

- `create-sale-plan-v2-cards.js` — Auto-create Sale Plan v2 project cards
- `update-plane-status.js` — Sync card status with actual progress
- `update-plane-assignees.js` — Bulk assign cards to team members
- `check-plane-card.js` — Verify individual card status
- `list-all-cards.js` — List all cards in project

## Setup

```bash
# Required in ui/.env
PLANE_API_KEY=your-plane-api-key

# Optional overrides (defaults are hardcoded)
PLANE_BASE_URL=https://plane.sys9.co
```

## Sale Plan v2 Cards

| Card | Status | Description |
|------|--------|-------------|
| CRM-121 — Main Feature | In Progress | Excel-style table implementation |
| CRM-122 — Frontend | Done | Vue 3 components completed |
| CRM-123 — Backend API | Todo | 5 endpoints specification ready |
| CRM-124 — UI/UX | Done | Responsive design completed |
| CRM-125 — Testing | Todo | E2E tests awaiting real API |
| CRM-127 — GitHub Pages Docs | Done | Public documentation repository |

## Documentation

- Public Pages: [sys9-co.github.io/crm-docs](https://sys9-co.github.io/crm-docs/)
- Main CRM docs: `docs/sale-plan-v2/`
