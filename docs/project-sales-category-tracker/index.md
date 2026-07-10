---
layout: default
title: Project Sales Category Tracker
---

# Project Sales Category Tracker

📊 **Tab ใหม่ใน Project Detail — แสดงสถานะ Win / Draw / Lose ต่อ product category เทียบกับเอกสารขาย**

## 🚀 Critical for Backend Implementation

### **Priority 1 — Must Read:**
- **[📡 API Specification](02-API.html)** — 2 endpoints: GET category-sales-summary + PUT category-lost-reasons
- **[🗄️ Database Schema](03-DB.html)** — 3 existing history tables + 1 new table (`project_category_lost_reasons`)
- **[📋 Feature Spec](01-SPEC.html)** — 5 User Stories, Acceptance Criteria, Business Logic, UI Behavior

---

## 📊 Implementation Overview

### **Key Technical Details:**

| Item | Value |
|------|-------|
| Module | `crm` |
| API Base | `/crm/v2/projects/{id}/` |
| Authentication | Bearer token + X-Merchant-UID header |
| Database | PostgreSQL (`crm` schema) |
| Status | 📝 DRAFT — รอ Designer + Backend |

### **Data Source (อยู่ใน crm schema แล้ว):**

| Table | สถานะ | วัตถุประสงค์ |
|-------|-------|------------|
| `crm.crm_project_quotation_history` | ✅ มีอยู่แล้ว (ETL) | ใบเสนอราคา |
| `crm.crm_project_saleorder_history` | ✅ มีอยู่แล้ว (ETL) | ใบสั่งขาย |
| `crm.crm_project_invoice_history` | ✅ มีอยู่แล้ว (ETL) | บิลขาย |
| `crm.project_category_lost_reasons` | 🆕 ต้องสร้างใหม่ | Lost reason ที่ user ระบุ |

### **Category Hierarchy (text-based):**

```
family → department → category → subcat
(Level 1)  (Level 2)   (Level 3)  (Level 4)
```

> Link field: `projectcode` (VARCHAR) = `crm.projects.code`  
> ไม่ต้อง cross-schema JOIN — ข้อมูลทั้งหมดอยู่ใน `crm` schema

---

## 🎯 Win / Draw / Lose Logic

| Status | เงื่อนไข |
|--------|---------|
| 🟢 **Win** | `invoice_amount > 0` (มีบิลขายแล้ว) |
| 🔵 **Draw** | `so_amount > 0` AND `invoice_amount = 0` (มี SO แต่ยังไม่บิล) |
| 🔴 **Lose** | `quotation_amount > 0` AND `so_amount = 0` (มีใบเสนอแต่ไม่ได้ SO) |

> **iscancel filter:** `WHERE iscancel = 0 OR iscancel IS NULL`  
> **CAST:** `amount` ใน quotation/saleorder เป็น type `money` → ต้อง `CAST(amount AS numeric)` ก่อน SUM

---

## 🔗 API Endpoints

```
GET  /crm/v2/projects/{id}/category-sales-summary    -- Matrix Win/Draw/Lose ทุก category
PUT  /crm/v2/projects/{id}/category-lost-reasons     -- บันทึก lost reason (bulk upsert)
```

---

## 🗄️ Migration Required

```sql
-- สร้างเพียง 1 ตารางใหม่
CREATE TABLE crm.project_category_lost_reasons (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id  BIGINT NOT NULL,
    projectcode VARCHAR(30) NOT NULL,
    family      VARCHAR(60) NULL,
    department  VARCHAR(60) NULL,
    category    VARCHAR(60) NULL,
    subcat      VARCHAR(60) NULL,
    lost_reason TEXT NULL,
    updated_by  BIGINT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pclr_project_cat_uq UNIQUE (project_id, family, department, category, subcat),
    CONSTRAINT pclr_project_fk FOREIGN KEY (project_id) REFERENCES crm.projects(id) ON DELETE CASCADE,
    CONSTRAINT pclr_user_fk FOREIGN KEY (updated_by) REFERENCES crm.users(id) ON DELETE SET NULL
);
```

---

## 📅 Phase Roadmap

| Phase | ขอบเขต |
|-------|--------|
| **Phase 1 (MVP)** | quotation + saleorder + invoice + lost reason |
| **Phase 2** | **BOQ column** + Credit Note + Drill-down level 2–4 |

### Phase 2: BOQ Column

**เป็นไปได้** — BOQ items มี `product_category_fullpath` เช่น `"ระบบไฟฟ้า > ไฟฟ้าแรงดันต่ำ"`

```
crm.boq_items.product_category_fullpath
  → split(" > ")[0] = "ระบบไฟฟ้า"   ← level-1
  → match กับ family ใน history tables
  → SUM(total) = boq_amount per family
```

Matrix Phase 2:

| หมวดสินค้า | **BOQ** | ใบเสนอราคา | ใบสั่งขาย | บิลสุทธิ | สถานะ |
|-----------|---------|-----------|---------|---------|-------|
| ระบบไฟฟ้า | 400,000 | 300,000 | 0 | 0 | 🔴 แพ้ |
| ห้องครัว | 550,000 | 500,000 | 490,000 | 480,000 | 🟢 ชนะ |

> `boq_amount` field อยู่ใน API response แล้ว (Phase 1 = `null`) — Phase 2 backend populate ค่า

---

## ✅ Open Questions — All Resolved

| OQ | ข้อสรุป |
|----|--------|
| OQ-DB-01 | link field = `projectcode` = `crm.projects.code` ✅ |
| OQ-DB-02 | category = text 4 ระดับ (family/department/category/subcat) ✅ |
| OQ-DB-03 | `updated_by + updated_at` เพียงพอ ✅ |
| OQ-DB-04 | PostgreSQL ✅ |
| OQ-DB-05 | Credit Note = Phase 2 ✅ |
| OQ-DB-06 | `CAST(amount AS numeric)` ยืนยันแล้ว ✅ |

---

[← Back to Main Documentation](../)
