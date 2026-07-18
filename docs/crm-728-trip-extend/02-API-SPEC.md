---
layout: default
title: "CRM-728: Trip Extend Options — API Specification (Confirmed)"
---

# CRM-728: Trip Extend Options — API Specification (Confirmed)

**Feature:** `crm-728-trip-extend`
**Date:** 18 กรกฎาคม 2569
**Status:** CONFIRMED — PO (น้อย) อนุมัติ 18 ก.ค. 2569
**Backend Card:** ดู §6 (Plane card แจ้ง crm-backend)
**Parent Spec:** `docs/osr-field-visit/01-API-SPEC.md` §2 (resolves [OQ-23])
**BA Spec:** `docs/crm-728-trip-extend/01-BA-SPEC.md`
**UI Mockup:** `docs/crm-728-trip-extend/03-UI-MOCKUPS.md`

---

## 1. สรุป PO Decisions (ที่กระทบ API)

| OQ | คำถาม | PO ตอบ | ผลต่อ API |
|---|---|---|---|
| OQ-728-1 | vehicle_type = other → note required? | required | `vehicle_type_note` บังคับเมื่อ `vehicle_type = "other"` |
| OQ-728-2 | หน่วยเลขไมล์: กม. หรือ mile? | กิโลเมตร | field ชื่อ odometer, unit = km |
| OQ-728-3 | vehicle_type: hardcode หรือ API? | hardcode 4 ตัว | enum ใน backend |
| OQ-728-4 | vehicle_type required? | optional (ข้ามได้) | nullable |
| OQ-728-6 | end < start: warn หรือ block? | warn + block | backend return 400 |
| OQ-728-7 | OCR? | Phase II | ไม่ implement Phase I |
| OQ-728-8 | ชื่อ field: start_odometer หรือ odometer_start? | `start_odometer` | ใช้ `start_odometer` / `end_odometer` |
| OQ-728-9 | รูปถ่ายรวม body หรือแยก endpoint? | รวม body (base64) | base64 ใน POST/PUT body |
| Q17 | แสดงใน team-summary? | ใช่ แสดงแยกพนักงาน + รวม | GET /trips list ต้องส่ง vehicle_type + odometer_distance_km |

---

## 2. Trip Entity — Fields ใหม่ (Confirmed)

เพิ่มเข้า Trip object ที่มีอยู่แล้ว (backward compatible — null ถ้าไม่มีข้อมูล):

| Field | Type | Nullable | คำอธิบาย |
|---|---|---|---|
| `vehicle_type` | VARCHAR(20) ENUM\|null | Yes | private_car / company_car / motorcycle / other |
| `vehicle_type_note` | TEXT\|null | Yes | required เมื่อ vehicle_type = "other" |
| `start_odometer` | INTEGER\|null | Yes | เลขไมล์เริ่ม (กิโลเมตร) |
| `end_odometer` | INTEGER\|null | Yes | เลขไมล์จบ (กิโลเมตร) |
| `odometer_distance_km` | INTEGER\|null | Yes | คำนวณ backend: end_odometer − start_odometer (null ถ้าไม่มีทั้งคู่) |
| `start_odometer_photo_url` | TEXT\|null | Yes | URL รูปไมล์มิเตอร์ตอนเริ่ม |
| `end_odometer_photo_url` | TEXT\|null | Yes | URL รูปไมล์มิเตอร์ตอนจบ |

### `vehicle_type` Enum (Confirmed)

| value | label ไทย | หมายเหตุ |
|---|---|---|
| `private_car` | รถยนต์ส่วนตัว | |
| `company_car` | รถบริษัท | |
| `motorcycle` | รถจักรยานยนต์ | |
| `other` | อื่นๆ | `vehicle_type_note` บังคับ |

> ⚠️ **หมายเหตุ Backend:** Draft เก่าใน `docs/osr-field-visit/01-API-SPEC.md` §2 ใช้ชื่อ field `odometer_start`/`odometer_end` — spec ใหม่นี้เปลี่ยนเป็น `start_odometer`/`end_odometer` ตาม BA spec CRM-728 ที่ PO อนุมัติแล้ว (resolves [OQ-728-8])

---

## 3. Endpoints ที่ต้องแก้ไข

### 3.1 POST `/crm/{v}/trips` — เพิ่ม fields ใหม่

**Request Body เพิ่ม:**
```json
{
  "route_date": "2026-07-18",
  "start_lat": 13.7563,
  "start_lng": 100.5018,
  "start_gps_accuracy": 12.5,
  "note": null,

  "vehicle_type": "private_car",
  "vehicle_type_note": null,
  "start_odometer": 12000,
  "start_odometer_photo_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Field Rules เพิ่ม:**
| Field | Required | Validation |
|---|---|---|
| `vehicle_type` | ❌ | enum ตาม §2 หรือ null |
| `vehicle_type_note` | ⚠️ conditional | required เมื่อ `vehicle_type = "other"` |
| `start_odometer` | ❌ | INTEGER >= 0 หรือ null |
| `start_odometer_photo_base64` | ❌ | base64 data URI, max 5MB, image/jpeg|png|webp |

**Response 201 — เพิ่ม 7 fields ใหม่ใน data object:**
```json
{
  "status": true,
  "message": "Trip started",
  "data": {
    "id": 101,
    "route_date": "2026-07-18",
    "status": "active",
    "started_at": "2026-07-18T08:12:00+07:00",
    "vehicle_type": "private_car",
    "vehicle_type_note": null,
    "start_odometer": 12000,
    "end_odometer": null,
    "odometer_distance_km": null,
    "start_odometer_photo_url": "https://cdn.example.com/odometer/101-start.jpg",
    "end_odometer_photo_url": null
  }
}
```

**Error Cases เพิ่ม:**
```
400 INVALID_VEHICLE_TYPE    — vehicle_type ไม่ตรง enum
400 VEHICLE_NOTE_REQUIRED   — vehicle_type = other แต่ vehicle_type_note ว่าง
400 INVALID_ODOMETER        — start_odometer < 0
400 IMAGE_TOO_LARGE         — odometer photo > 5MB
```

---

### 3.2 PUT `/crm/{v}/trips/{id}/end` — เพิ่ม fields ใหม่

**Request Body เพิ่ม:**
```json
{
  "end_lat": 13.7460,
  "end_lng": 100.5340,
  "end_gps_accuracy": 8.2,
  "note": "ปิดงาน",

  "end_odometer": 12150,
  "end_odometer_photo_base64": "data:image/jpeg;base64,/9j/4BBQ..."
}
```

**Field Rules เพิ่ม:**
| Field | Required | Validation |
|---|---|---|
| `end_odometer` | ❌ | INTEGER >= 0 หรือ null |
| `end_odometer_photo_base64` | ❌ | base64 data URI, max 5MB |

**Backend Logic:**
```
ถ้า end_odometer != null AND start_odometer != null:
  ถ้า end_odometer < start_odometer:
    return 400 ODOMETER_END_LESS_THAN_START
  odometer_distance_km = end_odometer - start_odometer
ถ้า end_odometer != null AND start_odometer == null:
  odometer_distance_km = null (ไม่สามารถคำนวณได้)
```

**Response 200 — เพิ่ม 7 fields ใหม่ใน data object:**
```json
{
  "status": true,
  "message": "Trip ended",
  "data": {
    "id": 101,
    "status": "completed",
    "ended_at": "2026-07-18T17:30:00+07:00",
    "vehicle_type": "private_car",
    "vehicle_type_note": null,
    "start_odometer": 12000,
    "end_odometer": 12150,
    "odometer_distance_km": 150,
    "start_odometer_photo_url": "https://cdn.example.com/odometer/101-start.jpg",
    "end_odometer_photo_url": "https://cdn.example.com/odometer/101-end.jpg"
  }
}
```

**Error Cases เพิ่ม:**
```
400 ODOMETER_END_LESS_THAN_START — end_odometer < start_odometer (block ไม่ให้จบทริป)
400 IMAGE_TOO_LARGE              — odometer photo > 5MB
```

---

### 3.3 GET `/crm/{v}/trips/today` + GET `/crm/{v}/trips/{id}`

Response เพิ่ม 7 fields ใหม่ใน trip object (backward compatible — null ถ้าไม่มีข้อมูล)

---

### 3.4 GET `/crm/{v}/trips` (list) — เพิ่ม fields

Response แต่ละ trip ใน array เพิ่ม:
```json
{
  "vehicle_type": "private_car",
  "vehicle_type_note": null,
  "odometer_distance_km": 150
}
```

> ใช้แสดงใน team-summary (Q17) แยกตามพนักงาน + รวมทีม

---

## 4. Odometer Photo Upload Pattern

Pattern เดียวกับ visit photos + receipt images (CRM-727):

```
Frontend:
  Camera / Gallery → compress → FileReader.readAsDataURL()
  → "data:image/jpeg;base64,{base64string}"
  → ส่งใน start_odometer_photo_base64 หรือ end_odometer_photo_base64

Backend:
  decode base64 → validate MIME (image/jpeg, image/png, image/webp)
  → เก็บใน storage → return URL ใน start_odometer_photo_url / end_odometer_photo_url
```

**Constraints:**
- 1 รูปต่อ checkpoint (start หรือ end)
- max 5MB ก่อน base64 encode

---

## 5. Backward Compatibility

- trip เก่าที่ไม่มี vehicle_type → fields ทั้ง 7 = null (UI ซ่อน section ไมล์มิเตอร์)
- `start_lat/start_lng/end_lat/end_lng` และ `distance_km` (GPS) ไม่เปลี่ยน — แสดงแยกกัน
- ไม่กระทบ visit API หรือ expense API

---

## 6. สรุปงาน Backend (สำหรับ Plane card)

| งาน | รายละเอียด |
|---|---|
| **DB Migration** | trips table: เพิ่ม 7 columns ตาม §2 |
| **POST /trips** | รับ vehicle_type, vehicle_type_note, start_odometer, start_odometer_photo_base64 |
| **PUT /trips/{id}/end** | รับ end_odometer, end_odometer_photo_base64; คำนวณ odometer_distance_km |
| **GET /trips/today** | embed 7 fields ใหม่ |
| **GET /trips/{id}** | embed 7 fields ใหม่ |
| **GET /trips (list)** | embed vehicle_type + odometer_distance_km (สำหรับ team-summary) |
| **Image Storage** | decode base64 → store → return URL (2 images ต่อ trip) |
| **Validation** | vehicle_type enum, vehicle_type_note required (other), end >= start |
| **Compute** | odometer_distance_km = end_odometer − start_odometer (backend เท่านั้น) |

---

## 7. Phase II (ไม่ implement ใน CRM-728)

- **OCR ไมล์มิเตอร์**: PO น้อย confirm ไว้ Phase II — ถ่ายรูปแล้ว OCR ดึงตัวเลขอัตโนมัติ
- ต้องการ: OCR service integration ฝั่ง backend

---

*ไฟล์นี้เป็น source of truth สำหรับ backend implementation — ห้ามแก้โดยไม่แจ้ง PM*
