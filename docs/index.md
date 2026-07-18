---
layout: default
title: SYS9 CRM Documentation
---

# SYS9 CRM Documentation

📋 **Official documentation for backend implementation**

## 🎯 Sale Plan v2 - Excel-style Table

Complete specification package ready for development:

### **📡 Critical for Backend:**
- **[API Specification](sale-plan-v2/02-API-SPECIFICATION.html)** - 5 endpoints implementation
- **[Database Schema](sale-plan-v2/04-DATABASE-SCHEMA.html)** - Tables and indexes  
- **[Business Logic](sale-plan-v2/05-BUSINESS-LOGIC.html)** - Validation rules

### **🤝 Coordination:**
- **[Integration Guide](sale-plan-v2/06-INTEGRATION-GUIDE.html)** - Step-by-step workflow
- **[Project Overview](sale-plan-v2/01-PROJECT-OVERVIEW.html)** - Background context

### **📋 Reference:**
- **[UI Mockups](sale-plan-v2/03-UI-MOCKUPS.html)** - Frontend design
- **[Test Specification](sale-plan-v2/07-TEST-SPECIFICATION.html)** - Testing strategy

---

## 🎯 Dashboard v2 - KPI Command Center

Complete specification package for development:

### **📡 Critical for Backend:**
- **[API Specification](dashboard-v2/02-API-SPECIFICATION.html)** - 6 endpoints implementation
- **[Database Schema](dashboard-v2/04-DATABASE-SCHEMA.html)** - Tables and indexes
- **[Business Logic](dashboard-v2/05-BUSINESS-LOGIC.html)** - KPI calculations and trend detection

### **🤝 Coordination:**
- **[Integration Guide](dashboard-v2/06-INTEGRATION-GUIDE.html)** - Step-by-step workflow
- **[Project Overview](dashboard-v2/01-PROJECT-OVERVIEW.html)** - Background context

### **📋 Reference:**
- **[UI Mockups](dashboard-v2/03-UI-MOCKUPS.html)** - Frontend design
- **[Test Specification](dashboard-v2/07-TEST-SPECIFICATION.html)** - Testing strategy

---

## 🎯 Customer Insights — 360° Customer View + Analytics

Complete specification package for development:

### **📡 Critical for Backend:**
- **[API Specification](customer-insights/02-API-SPECIFICATION.html)** — 12 endpoints covering customer data, timeline, related entities, and analytics
- **[Database Schema](customer-insights/03-DATABASE-SCHEMA.html)** — Tables, indexes, and constraints
- **[Integration Guide](customer-insights/04-GETTING-STARTED.html)** — Step-by-step frontend-to-backend workflow

### **📋 Reference:**
- **[Project Overview](customer-insights/01-PROJECT-OVERVIEW.html)** — Background, goals, and architecture
- **[UI/UX Mockups](customer-insights/05-UI-MOCKUPS.html)** — Wireframes, layout, design tokens

---

## 🎨 UI Design System

Complete design system documentation extracted from the CRM codebase:

- **[Full Design System Reference](design-system/index.html)** — Design tokens, component patterns, layout, forms, navigation, data display, responsive, icons, and Thai conventions

---

## 🔄 Plane Project Management

Automated QA-to-Plane issue tracking system:

- **[SDLC QA + Plane Integration](plane-integration/SDLC-QA-PLANE.html)** - Full integration spec with state transitions, dedup, and workflow
- **[Session Handoff](plane-integration/SESSION-HANDOFF.html)** - QA system setup and configuration
- **[Plane Overview](plane-integration/README.html)** - Quick reference, card list, and scripts

---

## 🚀 Quick Implementation Guide

### **Step 1: Database Setup**
```sql
-- Implement tables from Database Schema
CREATE TABLE saleplan_v2_headers (...);
CREATE TABLE saleplan_v2_entries (...);
```

### **Step 2: API Development**
```
GET  /crm/v2/projects/{id}/saleplan-v2     -- Load matrix
POST /crm/v2/projects/{id}/saleplan-v2     -- Save matrix
...
```

### **Step 3: Business Logic**
```
Matrix validation, Thai date formatting, calculation rules
```

---

## 🎯 CRM-728: Trip Extend Options — เลือกพาหนะ + ถ่ายไมล์มิเตอร์

เพิ่ม 7 fields ใหม่ใน trips table เพื่อ audit ค่าเดินทาง — vehicle_type + odometer ตอน start/stop trip:

### **📡 Critical for Backend:**
- **[API Specification](crm-728-trip-extend/02-API-SPEC.html)** — แก้ POST /trips + PUT /trips/{id}/end + GET embed (7 fields ใหม่)
- **[Section Home](crm-728-trip-extend/index.html)** — DB migration, key decisions, field name changes

### **📋 Reference:**
- **[BA Spec](crm-728-trip-extend/01-BA-SPEC.html)** — 3 User Stories, AC, Business Rules, VehicleType enum
- **[UI Mockups](crm-728-trip-extend/03-UI-MOCKUPS.html)** — Start/Stop Trip Dialog ใหม่ + vehicle selector + odometer form

### **Key Points:**
- Migration: `trips` table เพิ่ม 7 columns (vehicle_type, vehicle_type_note, start_odometer, end_odometer, odometer_distance_km, photo_urls)
- `odometer_distance_km` คำนวณ backend เท่านั้น (= end − start)
- ⚠️ field name เปลี่ยน: `start_odometer`/`end_odometer` (ไม่ใช่ `odometer_start`/`end` ในสเปคเก่า)
- Backward compat: trip เก่า → 7 fields = null (UI ซ่อน section ไมล์อัตโนมัติ)
- OCR ไมล์มิเตอร์: Phase II reserved — ไม่ implement Phase I
- Backend card: **[CRM-737]**

---

## 🎯 CRM-727: Trips Expense — บันทึกค่าใช้จ่ายระหว่าง Trip

OSR บันทึกค่าใช้จ่าย (น้ำมัน/ทางด่วน/อาหาร/อื่นๆ) + แนบรูปใบเสร็จ ≤3 รูป ต่อ trip รายวัน:

### **📡 Critical for Backend:**
- **[API Specification](crm-727-trips-expense/02-API-SPEC.html)** — POST/PUT/DELETE /trips/{id}/expenses + embed ใน GET /trips/today + GET /trips/{id}
- **[Section Home](crm-727-trips-expense/index.html)** — New tables, key decisions, field name changes

### **📋 Reference:**
- **[BA Spec](crm-727-trips-expense/01-BA-SPEC.html)** — 4 User Stories, AC, ExpenseType enum, E2E test outline
- **[UI Mockups](crm-727-trips-expense/03-UI-MOCKUPS.html)** — Collapsible expense section, bottom sheet form, receipt preview

### **Key Points:**
- New tables: `trip_expenses` + `trip_expense_images` (cascade delete)
- เพิ่ม/ลบ expense ได้เสมอ ไม่สน trip status (PO อนุมัติ)
- ≤3 รูปใบเสร็จ + annotation ต่อ 1 expense; base64 JSON upload (ไม่ใช่ multipart)
- ⚠️ field name: `expense_type` (ไม่ใช่ `category` ในสเปคเก่า `osr-field-visit/01-API-SPEC.md §6c`)
- Backend card: **[CRM-736]**

---

## 🎯 Project Sales Category Tracker — Win / Draw / Lose per Category

Tab ใหม่ใน Project Detail แสดงสถานะการขายต่อ product category (Win/Draw/Lose) เทียบกับเอกสารขาย:

### **📡 Critical for Backend:**
- **[API Specification](project-sales-category-tracker/02-API.html)** — GET category-sales-summary + PUT category-lost-reasons (bulk upsert)
- **[Database Schema](project-sales-category-tracker/03-DB.html)** — 3 history tables (ETL, read-only) + 1 new table `project_category_lost_reasons`

### **📋 Reference:**
- **[Feature Spec](project-sales-category-tracker/01-SPEC.html)** — 5 User Stories, AC, Business Logic, UI Behavior, Test Scenarios
- **[Section Home](project-sales-category-tracker/index.html)** — Quick reference, Win/Draw/Lose logic, Phase roadmap

### **Key Points:**
- Data source: `crm.crm_project_quotation/saleorder/invoice_history` (ETL อยู่แล้ว, ห้าม ALTER)
- Link field: `projectcode` = `crm.projects.code` (ไม่มี cross-schema JOIN)
- Category: text 4 ระดับ `family › department › category › subcat`
- Migration: สร้างแค่ 1 ตาราง (`project_category_lost_reasons`)
- Credit Note: Phase 2

---

## 🎯 Calendar + Visits Integration — Unified Calendar View

Complete specification for showing both appointments and visits on the `/appointment` calendar page:

### **📡 For Backend:**
- **[Project Overview](calendar-visits/01-PROJECT-OVERVIEW.html)** — Data model, UI layout, API requirements, color scheme, and implementation scope
- **[API Specification](calendar-visits/02-API-SPECIFICATION.html)** — 11 endpoints, request/response schemas, CalendarEvent data model, backend gaps

### **📋 Reference:**
- **[Section Home](calendar-visits/index.html)** — Quick navigation, status, backend gaps summary

---

## 🚚 OSR Daily Trip & Field Visit Hub — Trip Lifecycle + Per-Stop Check-in

Complete specification for OSR daily field visit management:

### **📡 For Backend:**
- **[API Specification](osr-field-visit/01-API-SPEC.html)** — 10 endpoints (Trip CRUD, per-stop check-in/out, expenses), Trip + Expense entities, state machine, 28 open questions
- **[Section Home](osr-field-visit/index.html)** — Architecture overview, blockers, status

### **📋 UI/UX Design:**
- **[UI Mockups](osr-field-visit/03-UI-MOCKUPS.html)** — My Day hub, Visit Card, Trip Timeline drilldown, Team Summary (manager view)

### **Key Points:**
- 2-layer architecture: Trip daily (`started_at`/`ended_at`) + per-stop Visit (`check_in_at`/`check_out_at`)
- Trip entity: new (backend must implement); Visit check-in/out: reuse existing fields
- Expense capture with receipt images, 8 categories, approval workflow (schema reserved)
- **3 Blockers:** OQ-6 (Trip-Visit binding), OQ-12 (distance calc), OQ-17 (visit_type field)

---

## 📊 Current Status

- **Frontend**: ✅ Complete prototype
- **Backend**: ⏳ Ready for implementation  
- **Live Demo**: [localhost:3031](http://localhost:3031/projects/123/edit?tab=plan-v2)

**🎯 Ready to code!**