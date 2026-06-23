---
layout: default
title: OSR Daily Trip & Field Visit Hub
---

# OSR Daily Trip & Field Visit Hub

OSR (Outdoor Sales Rep) daily trip management — trip lifecycle, per-stop check-in/out, expense capture, team summary.

## Architecture

2-layer model:
- **Trip** (1/user/day): `started_at`/`ended_at` + GPS — new entity
- **Per-stop Visit**: `check_in_at`/`check_out_at` — reuse existing visit fields

## Documents

### Critical for Backend:
- **[API Specification](01-API-SPEC.html)** — 10 endpoints, Trip + Expense entities, 28 open questions, state machine, validation rules

### UI/UX Design:
- **[UI Mockups](03-UI-MOCKUPS.html)** — My Day hub, Visit Card (project+customer), Trip Timeline drilldown, Team Summary (manager view)

### Status
- **Spec version:** v2.1 (expert-reviewed 2026-06-23, team summary added)
- **Frontend:** Waiting for backend endpoints (mock fallback per ADR-002)
- **Backend:** Implementation required — see Plane card with label `crm-backend`
- **Blockers:** OQ-6 (Trip-Visit binding), OQ-12 (distance calc), OQ-17 (visit_type field name), OQ-28 (team trip list shape)
