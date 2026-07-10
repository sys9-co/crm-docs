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