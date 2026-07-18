---
layout: default
title: CRM-728 Trip Extend Options
---

# CRM-728: Trip Extend Options — เลือกพาหนะ + ถ่ายไมล์มิเตอร์

📊 **เพิ่ม 7 fields ใหม่ใน trips table เพื่อ audit ค่าน้ำมัน/ค่าเดินทาง — vehicle_type + odometer ตอน start/stop trip**

**Status:** ✅ CONFIRMED — PO อนุมัติ 18 ก.ค. 2569 | Backend: [CRM-737]

## 🚀 Critical for Backend Implementation

### **Priority 1 — Must Read:**
- **[📡 API Specification](02-API-SPEC.html)** — แก้ POST /trips + PUT /trips/{id}/end + GET embed
- **[📋 BA Spec](01-BA-SPEC.html)** — 3 User Stories + AC + Business Rules
- **[🎨 UI Mockups](03-UI-MOCKUPS.html)** — Start/Stop Trip Dialog ใหม่ พร้อม vehicle selector + odometer

---

## 📊 Implementation Overview

| Item | Value |
|------|-------|
| Plane Card | [CRM-737] Trip Extend Fields backend |
| API Base | `/crm/{v}/trips` (แก้ endpoints เดิม) |
| Auth | Bearer token + X-Merchant-UID |
| Migration | `trips` table: เพิ่ม 7 columns |
| Status | 📋 Todo (backend), 🔜 Ready for Coder (frontend) |

## 🗄️ DB Migration — trips table เพิ่ม 7 columns

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `vehicle_type` | VARCHAR(20) ENUM | YES | private_car/company_car/motorcycle/other |
| `vehicle_type_note` | TEXT | YES | required เมื่อ vehicle_type=other |
| `start_odometer` | INTEGER | YES | เลขไมล์เริ่ม (กิโลเมตร) |
| `end_odometer` | INTEGER | YES | เลขไมล์จบ |
| `odometer_distance_km` | INTEGER | YES | **คำนวณ backend เท่านั้น** = end − start |
| `start_odometer_photo_url` | TEXT | YES | URL รูปไมล์เริ่ม |
| `end_odometer_photo_url` | TEXT | YES | URL รูปไมล์จบ |

## 📡 Endpoints ที่ต้องแก้

| Method | Path | Changes |
|--------|------|---------|
| POST | `/trips` | เพิ่ม: vehicle_type, vehicle_type_note, start_odometer, start_odometer_photo_base64 |
| PUT | `/trips/{id}/end` | เพิ่ม: end_odometer, end_odometer_photo_base64; คำนวณ odometer_distance_km |
| GET | `/trips/today` + `/trips/{id}` | embed 7 fields ใหม่ (null ถ้าไม่มีข้อมูล) |
| GET | `/trips` (list) | embed vehicle_type + odometer_distance_km (team-summary) |

## 🔑 Key Decisions (PO น้อย อนุมัติ)

| เรื่อง | Decision |
|--------|----------|
| vehicle_type required? | ❌ Optional |
| vehicle_type = other | vehicle_type_note required |
| end < start odometer | 400 ODOMETER_END_LESS_THAN_START (block) |
| odometer_distance_km | คำนวณ backend เท่านั้น |
| Field name | `start_odometer`/`end_odometer` (⚠️ ไม่ใช่ `odometer_start`/`odometer_end` ในสเปคเก่า) |
| OCR ไมล์มิเตอร์ | ❌ Phase II — ไม่ implement Phase I |
| Upload pattern | base64 ใน body (ไม่แยก endpoint) |
| Backward compat | trip เก่า → 7 fields = null (UI ซ่อน section ไมล์) |
| GPS distance | ไม่เปลี่ยน — แสดงแยกจาก odometer_distance_km |

## ⚠️ Note for Backend

- Field ชื่อ **`start_odometer`/`end_odometer`** — draft เก่าใน `osr-field-visit/01-API-SPEC.md §2` ใช้ชื่อ `odometer_start`/`odometer_end` (OQ-23) ซึ่งเปลี่ยนแล้ว
- spec ใหม่ `02-API-SPEC.md` คือ source of truth

## 🚫 Phase II (ไม่ implement ใน CRM-728)

- **OCR ไมล์มิเตอร์** — ถ่ายรูปแล้ว OCR ดึงตัวเลขอัตโนมัติ (PO น้อย confirm ไว้ Phase II)

---

[← Back to Main Documentation](../)
