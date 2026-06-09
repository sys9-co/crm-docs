---
layout: default
title: Calendar + Visits Integration
---

# Calendar + Visits Integration — Unified Calendar View

Complete specification for showing both appointments and visits on the `/appointment` calendar page:

## 📡 For Backend:

### **Priority 1 — Must Read:**
- **[📡 API Specification](02-API-SPECIFICATION.html)** — 11 endpoints, data models, request/response schemas, backend gaps

### **Priority 2 — Coordination:**
- **[📊 Project Overview](01-PROJECT-OVERVIEW.html)** — Data model, UI layout, color scheme, implementation scope

---

## 📊 Implementation Overview

### Key Technical Details:
- **Module**: `crm`
- **API Base**: `/crm/v2`
- **Unified Endpoint**: `GET /crm/v2/calendar-events?from=&to=`
- **Authentication**: Bearer token + X-Merchant-UID header
- **Data Structure**: Single `CalendarEvent` interface with `event_type` discriminator

### Backend Gaps (6 fields):

| # | Missing Field | Severity |
|---|--------------|----------|
| 1 | `appointment_type` in appointment events | 🔴 |
| 2 | `location` in appointment events | 🔴 |
| 3 | `color` in appointment events | 🟡 |
| 4 | `geo_lat`, `geo_lng` in appointment events | 🟡 |
| 5 | `contact_info` in appointment events | 🟢 |

### Status:
- **Frontend**: 🔄 Ready (waiting for backend)
- **Backend**: ⏳ API gaps need fixing
- **Documentation**: ✅ Complete

---

## 🔗 Related Links

- **Frontend Calendar**: `/appointment` (localhost:3031)
- **Plane Card**: [CRM-246](https://plane.sys9.co/sys9/projects/42274dc1-be6c-474d-9883-a7fe72feef44/issues/CRM-246) — Calendar + Visits Integration

[← Back to Main Documentation](../)
