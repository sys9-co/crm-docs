---
layout: default
title: CRM-727 Trip Expenses
---

# CRM-727: Trips Expense — บันทึกค่าใช้จ่ายระหว่าง Trip

📊 **OSR บันทึกค่าใช้จ่าย (น้ำมัน/ทางด่วน/อาหาร/อื่นๆ) + แนบรูปใบเสร็จ ≤3 รูป ต่อ trip รายวัน**

**Status:** ✅ CONFIRMED — PO อนุมัติ 18 ก.ค. 2569 | Backend: [CRM-736]

## 🚀 Critical for Backend Implementation

### **Priority 1 — Must Read:**
- **[📡 API Specification](02-API-SPEC.html)** — POST/PUT/DELETE /trips/{id}/expenses + embed ใน GET /trips/today + GET /trips/{id}
- **[📋 BA Spec](01-BA-SPEC.html)** — 4 User Stories + AC + Business Rules
- **[🎨 UI Mockups](03-UI-MOCKUPS.html)** — Mobile-first 390px, collapsible expense section, bottom sheet form

---

## 📊 Implementation Overview

| Item | Value |
|------|-------|
| Plane Card | [CRM-736] Trip Expenses backend |
| API Base | `/crm/{v}/trips/{tripId}/expenses` |
| Auth | Bearer token + X-Merchant-UID |
| New Tables | `trip_expenses`, `trip_expense_images` |
| Status | 📋 Todo (backend), 🔜 Ready for Coder (frontend) |

## 🗄️ New Tables

**`trip_expenses`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `trip_id` | BIGINT FK | |
| `expense_type` | ENUM | fuel/toll/parking/meal/customer_hospitality/transport/other |
| `amount` | DECIMAL(10,2) | > 0 |
| `note` | TEXT | required เมื่อ type=other |
| `spent_at` | TIMESTAMPTZ | optional, default=created_at |
| `status` | VARCHAR | default='pending' (Phase 1) |
| `created_by` | INT FK | users.id |

**`trip_expense_images`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `trip_expense_id` | BIGINT FK | CASCADE DELETE |
| `image_url` | TEXT | หลัง upload base64 |
| `annotation` | TEXT | nullable |
| `sort_order` | SMALLINT | |

## 📡 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/trips/{tripId}/expenses` | เพิ่ม expense + upload ≤3 รูป |
| PUT | `/trips/{tripId}/expenses/{id}` | แก้ไข (partial update) |
| DELETE | `/trips/{tripId}/expenses/{id}` | ลบ (ไม่ check trip status) |
| GET embed | ใน GET /trips/today + GET /trips/{id} | `expenses[]` + `summary.expense_total/expense_count` |

## 🔑 Key Decisions (PO น้อย อนุมัติ)

| เรื่อง | Decision |
|--------|----------|
| สนสถานะ trip? | ❌ ไม่สน — เพิ่ม/ลบได้เสมอ |
| จำนวนรูป | ≤3 รูป + annotation ต่อ expense |
| spent_at | เลือกเองได้ (datetime-local picker) |
| Approval | Phase 1 = ไม่มี (status=pending เสมอ) |
| Field name | `expense_type` (⚠️ ไม่ใช่ `category` ในสเปคเก่า) |
| Upload pattern | base64 JSON (ไม่ใช่ multipart) |

## ⚠️ Note for Backend

- Field ชื่อ **`expense_type`** — draft เก่าใน `osr-field-visit/01-API-SPEC.md §6c` ใช้ชื่อ `category` ซึ่งผิด
- spec ใหม่ `02-API-SPEC.md` คือ source of truth

---

[← Back to Main Documentation](../)
