---
layout: default
title: "CRM-727: Trips Expense — API Specification (Confirmed)"
---

# CRM-727: Trips Expense — API Specification (Confirmed)

**Feature:** `crm-727-trips-expense`
**Date:** 18 กรกฎาคม 2569
**Status:** CONFIRMED — PO (น้อย) อนุมัติ 18 ก.ค. 2569
**Backend Card:** ดู §7 (Plane card แจ้ง crm-backend)
**Parent Spec:** `docs/osr-field-visit/01-API-SPEC.md` §6c
**BA Spec:** `docs/crm-727-trips-expense/01-BA-SPEC.md`
**UI Mockup:** `docs/crm-727-trips-expense/03-UI-MOCKUPS.md`

---

## 1. สรุป PO Decisions (ที่กระทบ API)

| OQ | คำถาม | PO ตอบ | ผลต่อ API |
|---|---|---|---|
| OQ-1 | เพิ่ม expense ได้ระหว่าง active หรือต้องรอ? | ไม่สนสถานะ (ช่วงแรก) | ไม่ต้อง validate trip status |
| OQ-2 | enum ครบไหม? | ครบ + อื่นๆ กรอก text เพิ่มได้ | 7 ประเภทตาม spec |
| OQ-3 | ลบ expense ได้เฉพาะ active? | ไม่สนสถานะ | DELETE ไม่ check trip status |
| OQ-4 | 1 รูป หรือหลายรูป? | ≤3 รูป + annotation | `receipt_images[]` array max 3 |
| OQ-5 | Approval flow? | ยังไม่ต้องการ | status = pending เสมอ (phase 1) |
| OQ-7 | วงเงินสูงสุด? | ยังไม่มี | ไม่ต้อง ceiling validation |
| OQ-8 | spent_at เลือกเอง? | ใช่ เลือกเองได้ | datetime-local picker, optional |

---

## 2. Expense Entity (Confirmed Schema)

```json
{
  "id": 501,
  "trip_id": 101,
  "expense_type": "fuel",
  "amount": 450.00,
  "note": null,
  "receipt_images": [
    {
      "id": 1,
      "url": "https://cdn.example.com/receipts/501-1.jpg",
      "annotation": "ใบเสร็จน้ำมัน PTT"
    }
  ],
  "spent_at": "2026-07-18T10:30:00+07:00",
  "status": "pending",
  "created_by": 5,
  "created_at": "2026-07-18T10:35:00+07:00",
  "updated_at": "2026-07-18T10:35:00+07:00"
}
```

### 2.1 `expense_type` Enum (Confirmed)

| value | label ไทย | หมายเหตุ |
|---|---|---|
| `fuel` | น้ำมัน | |
| `toll` | ทางด่วน | |
| `parking` | จอดรถ | |
| `meal` | อาหาร/เบี้ยเลี้ยง | |
| `customer_hospitality` | รับรองลูกค้า | |
| `transport` | ค่าเดินทาง | |
| `other` | อื่นๆ | note บังคับ |

> ⚠️ **หมายเหตุ Backend:** Draft เก่าใน `docs/osr-field-visit/01-API-SPEC.md` §6c ใช้ชื่อ field `category` — spec ใหม่นี้เปลี่ยนเป็น `expense_type` ตาม BA spec CRM-727 ที่ PO อนุมัติแล้ว

---

## 3. Endpoints (Confirmed)

**Base URL:** `/crm/{v}/trips/{tripId}/expenses`
**Auth:** `Authorization: Bearer {token}` + `X-Merchant-UID: {uid}`

### 3.1 POST `/crm/{v}/trips/{tripId}/expenses` — เพิ่มค่าใช้จ่าย

**Request Body:**
```json
{
  "expense_type": "fuel",
  "amount": 450.00,
  "note": null,
  "spent_at": "2026-07-18T10:30:00+07:00",
  "receipt_images": [
    {
      "data_base64": "data:image/jpeg;base64,/9j/4AAQ...",
      "annotation": "ใบเสร็จน้ำมัน PTT"
    },
    {
      "data_base64": "data:image/jpeg;base64,/9j/4BBQ...",
      "annotation": null
    }
  ]
}
```

**Field Rules:**
| Field | Required | Validation |
|---|---|---|
| `expense_type` | ✅ | enum ตาม §2.1 |
| `amount` | ✅ | DECIMAL(10,2), > 0 |
| `note` | ⚠️ conditional | required เมื่อ `expense_type = "other"` |
| `spent_at` | ❌ | ISO8601, optional (default = created_at) |
| `receipt_images` | ❌ | array max 3 items; แต่ละ item max 5MB |

**Response 201:**
```json
{
  "status": true,
  "message": "บันทึกค่าใช้จ่ายสำเร็จ",
  "data": { /* Expense object ตาม §2 */ }
}
```

**Error Cases:**
```
400 INVALID_EXPENSE_TYPE  — expense_type ไม่ตรง enum
400 INVALID_AMOUNT        — amount <= 0
400 NOTE_REQUIRED         — expense_type = other แต่ note ว่าง
400 MAX_IMAGES_EXCEEDED   — receipt_images > 3 รายการ
400 IMAGE_TOO_LARGE       — รูปใบ > 5MB
403 FORBIDDEN             — ไม่ใช่ trip ของ user นี้
404 TRIP_NOT_FOUND
```

> ✅ **ไม่ต้อง validate trip status** — เพิ่มได้เสมอไม่ว่า trip จะ active/completed (PO น้อย ตอบ OQ-1)

---

### 3.2 PUT `/crm/{v}/trips/{tripId}/expenses/{expenseId}` — แก้ไข

**Request Body:** (partial update — ส่งเฉพาะ field ที่เปลี่ยน)
```json
{
  "amount": 500.00,
  "note": "แก้ไขยอด"
}
```

**Response 200:** Expense object ที่อัปเดตแล้ว

**Error Cases:** เหมือน POST + `404 EXPENSE_NOT_FOUND`

---

### 3.3 DELETE `/crm/{v}/trips/{tripId}/expenses/{expenseId}` — ลบ

**Response 200:**
```json
{ "status": true, "message": "ลบค่าใช้จ่ายสำเร็จ" }
```

> ✅ **ไม่ต้อง validate trip status** — ลบได้เสมอ (PO น้อย ตอบ OQ-3)

**Error Cases:**
```
403 FORBIDDEN          — ไม่ใช่ expense ของ user นี้
404 EXPENSE_NOT_FOUND
```

---

### 3.4 GET — ไม่มี Endpoint แยก

`expenses[]` **embed มาพร้อม** GET /trips/today และ GET /trips/{id}:

```json
{
  "id": 101,
  "status": "active",
  "summary": {
    "visit_total": 5,
    "visit_completed": 3,
    "distance_km": 28.5,
    "expense_total": 750.00,
    "expense_count": 2
  },
  "expenses": [
    { /* Expense object §2 */ },
    { /* Expense object §2 */ }
  ]
}
```

---

## 4. Receipt Image Upload Pattern

Pattern เดียวกับ `CustomerDocuments.vue` และ `visit` photos:

```
Frontend:
  File → compress (if image > 1MB) → FileReader.readAsDataURL()
  → "data:image/jpeg;base64,{base64string}"
  → ส่งใน receipt_images[].data_base64

Backend:
  decode base64 → validate MIME type (image/jpeg, image/png, image/webp)
  → resize/compress ถ้าจำเป็น
  → เก็บใน storage → return URL ใน receipt_images[].url
```

**Constraints:**
- max 3 รูปต่อ 1 expense item
- max 5MB ต่อรูป (ก่อน base64 encode)
- MIME types ที่ยอมรับ: `image/jpeg`, `image/png`, `image/webp`

---

## 5. Summary Fields ใน Trip Response (ยืนยัน)

| Field | Type | คำอธิบาย |
|---|---|---|
| `expense_total` | DECIMAL(10,2) | ยอดรวมค่าใช้จ่ายทุก expense ใน trip |
| `expense_count` | INTEGER | จำนวนรายการ expense |

> fields เหล่านี้มีอยู่ใน `ui/composables/useTrip.ts` บรรทัด 65-66 แล้ว — backend เพียงต้องคำนวณและส่งมา

---

## 6. Backend Database Schema

### ตาราง `trip_expenses` (ใหม่)

| Column | Type | Nullable | Default | คำอธิบาย |
|---|---|---|---|---|
| `id` | BIGINT PK | No | AUTO | |
| `trip_id` | BIGINT FK → trips.id | No | | |
| `merchant_uid` | VARCHAR(50) | No | | |
| `expense_type` | VARCHAR(30) ENUM | No | | fuel/toll/parking/meal/customer_hospitality/transport/other |
| `amount` | DECIMAL(10,2) | No | | > 0 |
| `note` | TEXT | Yes | NULL | required ถ้า type = other |
| `spent_at` | TIMESTAMPTZ | Yes | NULL | default = created_at ถ้าไม่ส่งมา |
| `status` | VARCHAR(10) ENUM | No | `pending` | pending/approved/rejected (phase 1 = pending เสมอ) |
| `created_by` | INT FK → users.id | No | | |
| `created_at` | TIMESTAMPTZ | No | NOW() | |
| `updated_at` | TIMESTAMPTZ | No | NOW() | |

### ตาราง `trip_expense_images` (ใหม่)

| Column | Type | Nullable | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT PK | No | |
| `trip_expense_id` | BIGINT FK → trip_expenses.id | No | CASCADE DELETE |
| `image_url` | TEXT | No | URL หลัง upload |
| `annotation` | TEXT | Yes | คำบรรยายรูป |
| `sort_order` | SMALLINT | No | ลำดับแสดงรูป (0-based) |
| `created_at` | TIMESTAMPTZ | No | |

### trips table — fields ที่ต้องอัปเดต

`summary.expense_total` และ `summary.expense_count` ใน GET /trips/today + GET /trips/{id}  
(fields ใน frontend interface มีอยู่แล้ว รอ backend ส่งค่าจริงมา)

---

## 7. สรุปงาน Backend (สำหรับ Plane card)

| งาน | รายละเอียด |
|---|---|
| **DB Migration** | สร้างตาราง `trip_expenses` + `trip_expense_images` |
| **POST** | `/crm/{v}/trips/{tripId}/expenses` — บันทึก expense + upload images |
| **PUT** | `/crm/{v}/trips/{tripId}/expenses/{expenseId}` — partial update |
| **DELETE** | `/crm/{v}/trips/{tripId}/expenses/{expenseId}` — ลบ (ไม่ check trip status) |
| **GET Embed** | เพิ่ม `expenses[]` + `summary.expense_total/expense_count` ใน GET /trips/today + GET /trips/{id} |
| **Image Storage** | decode base64 → store → return URL |
| **Validation** | expense_type enum, amount > 0, note required (other), max 3 images, max 5MB/image |

---

## 8. Backward Compatibility

- Trip response เดิมที่ไม่มี expense → `expenses = []`, `expense_total = 0`, `expense_count = 0`
- ไม่กระทบ visit API หรือ field เดิมใดๆ
- field ชื่อ `expense_type` (ไม่ใช่ `category` ใน draft เก่า §6c) — backend ใช้ชื่อใหม่นี้

---

*ไฟล์นี้เป็น source of truth สำหรับ backend implementation — ห้ามแก้โดยไม่แจ้ง PM*
