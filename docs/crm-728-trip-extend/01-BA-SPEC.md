---
layout: default
title: "CRM-728: Trip Extend Options — เลือกพาหนะ + ถ่ายไมล์มิเตอร์ ตอน trip_start/stop"
---

# CRM-728: Trip Extend Options — เลือกพาหนะ + ถ่ายไมล์มิเตอร์ ตอน trip_start/stop

**Plane Card:** CRM-728
**BA/SA:** ทิพย์ (Claude BA/SA agent)
**Date:** 18 กรกฎาคม 2569
**Status:** CONFIRMED — PO (น้อย) อนุมัติ 18 ก.ค. 2569 → พร้อม handoff Designer
**Depends on:** `docs/osr-field-visit/01-API-SPEC.md` §2 (resolves [OQ-23])

---

## 1. ภาพรวม

### สถานะปัจจุบัน

Trip flow ปัจจุบัน (`my-day.vue`):
1. กด "เริ่มทริป" → `AlertDialog` ธรรมดา → POST `/crm/{v}/trips` (เฉพาะ GPS)
2. กด "จบทริป" → `AlertDialog` ธรรมดา → PUT `/crm/{v}/trips/{id}/end` (เฉพาะ GPS + distance)

**ปัญหา:** ไม่บันทึกข้อมูลพาหนะและไมล์มิเตอร์ → ไม่สามารถ audit ค่าน้ำมัน/ค่าเดินทางจริงได้

### เป้าหมาย

แทน AlertDialog ด้วย Form Dialog ที่มีขั้นตอนเพิ่มเติม:

| ตอนเริ่มทริป | ตอนจบทริป |
|---|---|
| เลือกพาหนะ (**[OQ-728-4]**: required?) | ไมล์สิ้นสุด (optional) |
| ไมล์เริ่มต้น (optional) | ถ่ายภาพไมล์ (optional) |
| ถ่ายภาพไมล์ (optional) | ยืนยันจบทริป |
| ยืนยันเริ่มทริป | |

---

## 2. User Stories

### US-1: เลือกพาหนะและกรอกไมล์ตอนเริ่มทริป

**AC-1.1 — Dialog เปิดก่อน confirm start**
```
Given: tripState = 'NO_TRIP'
When: กด "เริ่มทริป"
Then: Dialog "เริ่มทริปวันนี้" แสดง:
  - Vehicle type selector (4 ตัวเลือก)
  - Input "เลขไมล์มิเตอร์เริ่มต้น" (number, optional)
  - ปุ่ม "ถ่ายภาพไมล์" (optional)
  - [ยกเลิก] [ยืนยัน] (disabled จนเลือก vehicle_type — ถ้า OQ-728-4 = required)
```

**AC-1.2 — Validation เลขไมล์**
```
When: กรอก start_odometer ที่ไม่ใช่ตัวเลขบวก
Then: error "กรุณากรอกเลขไมล์ที่ถูกต้อง"
  And: ปุ่ม "ยืนยัน" disabled
```

**AC-1.3 — ถ่ายภาพ optional**
```
When: กดปุ่ม "ถ่ายภาพไมล์"
Then: เปิด camera/gallery (reuse pattern จาก create-v2.vue)
  And: thumbnail แสดงใน Dialog พร้อมปุ่ม [X ลบ]
```

**AC-1.4 — Confirm เริ่มทริป**
```
When: กด "ยืนยัน"
Then: POST /crm/{v}/trips พร้อม vehicle_type, start_odometer, start_odometer_photo_base64
  And: tripState → 'ACTIVE'
```

### US-2: บันทึกไมล์ตอนจบทริป

**AC-2.1 — Dialog จบทริปแสดงฟอร์มไมล์**
```
Given: tripState = 'ACTIVE'
When: กด "จบทริป"
Then: Dialog "จบทริปวันนี้" แสดง:
  - vehicle_type จาก trip (read-only)
  - start_odometer ที่บันทึกไว้ (read-only, ถ้ามี)
  - Input "เลขไมล์มิเตอร์สิ้นสุด" (optional)
  - Preview "ระยะทางจากมิเตอร์: X กม." (real-time ถ้ามีทั้ง start+end)
  - ปุ่ม "ถ่ายภาพไมล์" (optional)
  - [ยกเลิก] [ยืนยันจบทริป] (enabled เสมอ)
```

**AC-2.2 — คำนวณ preview real-time**
```
Given: start_odometer = 12000
When: กรอก end_odometer = 12150
Then: แสดง "ระยะทางจากมิเตอร์: 150 กม."
  And: ถ้า end < start → warning "เลขไมล์สิ้นสุดต้องมากกว่าเลขไมล์เริ่มต้น"
```

**AC-2.3 — Confirm จบทริป**
```
When: กด "ยืนยันจบทริป"
Then: PUT /crm/{v}/trips/{id}/end พร้อม end_odometer, end_odometer_photo_base64
  And: tripState → 'COMPLETED'
```

### US-3: ดูข้อมูลพาหนะ/ไมล์ใน Summary

**AC-3.1**
```
Given: trip completed + มี vehicle_type, odometer data
When: ดู trip summary
Then: แสดง vehicle_type label ไทย + odometer_distance_km
  And: GPS distance แสดงแยกกัน (ไม่ overwrite)
```

**AC-3.2 — ไม่มีข้อมูลไมล์ → ซ่อน section**
```
Given: start_odometer = null และ end_odometer = null
Then: v-if ซ่อน section ไมล์มิเตอร์
```

---

## 3. Data Model

### 3.1 Fields ใหม่ใน Trip Entity

| Field | Type | Nullable | คำอธิบาย |
|---|---|---|---|
| `vehicle_type` | string enum | Yes | private_car / company_car / motorcycle / other |
| `vehicle_type_note` | string\|null | Yes | กรณี 'other' (optional — **[OQ-728-1]**) |
| `start_odometer` | integer\|null | Yes | เลขไมล์เริ่ม |
| `end_odometer` | integer\|null | Yes | เลขไมล์จบ |
| `odometer_distance_km` | integer\|null | Yes | คำนวณ backend: end − start |
| `start_odometer_photo_url` | string\|null | Yes | URL รูปไมล์เริ่ม |
| `end_odometer_photo_url` | string\|null | Yes | URL รูปไมล์จบ |

### 3.2 Vehicle Type Enum

| value | label ไทย | icon (Lucide) |
|---|---|---|
| `private_car` | รถยนต์ส่วนตัว | `Car` |
| `company_car` | รถบริษัท | `Building` |
| `motorcycle` | รถจักรยานยนต์ | `Bike` |
| `other` | อื่นๆ | `MoreHorizontal` |

### 3.3 TypeScript Interface (เพิ่มใน useTrip.ts)

```typescript
export type VehicleType = 'private_car' | 'company_car' | 'motorcycle' | 'other'

// เพิ่มใน Trip interface:
vehicle_type: VehicleType | null
vehicle_type_note: string | null
start_odometer: number | null
end_odometer: number | null
odometer_distance_km: number | null
start_odometer_photo_url: string | null
end_odometer_photo_url: string | null
```

---

## 4. API Specification

### POST `/crm/{v}/trips` — เพิ่ม fields

```json
// Body เพิ่ม:
{
  "vehicle_type": "private_car",
  "vehicle_type_note": null,
  "start_odometer": 12000,
  "start_odometer_photo_base64": "data:image/jpeg;base64,..."
}

// Response เพิ่ม 7 fields ใหม่ใน data object
```

### PUT `/crm/{v}/trips/{id}/end` — เพิ่ม fields

```json
// Body เพิ่ม:
{
  "end_odometer": 12150,
  "end_odometer_photo_base64": "data:image/jpeg;base64,..."
}
// backend คำนวณ odometer_distance_km = end − start
```

### GET `/crm/{v}/trips/today` + GET `/crm/{v}/trips/{id}`

Response trip object เพิ่ม 7 fields ใหม่ (backward compatible — null ถ้าไม่มีข้อมูล)

---

## 5. UI Flow

### 5.1 Start Trip Dialog

```
[Dialog: เริ่มทริปวันนี้]
┌────────────────────────────────────┐
│  พาหนะที่ใช้วันนี้ *                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌─────┐│
│  │ รถส่วน│ │ รถบริ│ │มอเตอ │ │อื่นๆ││
│  │ตัว   │ │ษัท   │ │ไซค์  │ │     ││
│  └──────┘ └──────┘ └──────┘ └─────┘│
│                                    │
│  เลขไมล์เริ่มต้น (ไม่บังคับ)         │
│  [_______________]                 │
│                                    │
│  [ถ่ายภาพไมล์] (ไม่บังคับ)           │
│  [thumbnail][X]                    │
│                                    │
│       [ยกเลิก]  [เริ่มทริป ▶]       │
└────────────────────────────────────┘
```

### 5.2 Stop Trip Dialog

```
[Dialog: จบทริปวันนี้]
┌────────────────────────────────────┐
│  พาหนะ: รถยนต์ส่วนตัว (read-only)   │
│  ไมล์เริ่ม: 12,000 กม.              │
│  ──────────────────────────────    │
│  เลขไมล์สิ้นสุด (ไม่บังคับ)          │
│  [_______________]                 │
│  ระยะทางจากมิเตอร์: 150 กม.         │
│                                    │
│  [ถ่ายภาพไมล์] (ไม่บังคับ)           │
│                                    │
│     [ยกเลิก]  [ยืนยันจบทริป ■]      │
└────────────────────────────────────┘
```

---

## 6. Business Rules

| # | กฎ |
|---|---|
| BR-728-1 | vehicle_type optional (backward compat) — pending OQ-728-4 |
| BR-728-2 | start_odometer + end_odometer optional |
| BR-728-3 | end_odometer ต้อง > start_odometer → warning (pending OQ-728-6: block หรือ warn?) |
| BR-728-4 | odometer_distance_km คำนวณ backend เท่านั้น |
| BR-728-5 | ไม่แทนที่ GPS distance_km — แสดง 2 ค่าแยก |
| BR-728-6 | Photo base64 max 5MB (pattern เดียวกับ visit photos) |
| BR-728-7 | vehicle_type ใน stop dialog = read-only (ดึงจาก trip.vehicle_type ตอน start) |
| BR-728-8 | trip เก่าที่ไม่มีข้อมูล → fields ใหม่ = null → UI ซ่อน section ไมล์ |

---

## 7. Backend Fields ที่ต้องเพิ่ม (สำหรับ crm-backend Plane card)

**trips table — เพิ่ม 7 columns:**

| Column | Type | Nullable | Default |
|---|---|---|---|
| `vehicle_type` | VARCHAR(20) ENUM | YES | NULL |
| `vehicle_type_note` | TEXT | YES | NULL |
| `start_odometer` | INTEGER | YES | NULL |
| `end_odometer` | INTEGER | YES | NULL |
| `odometer_distance_km` | INTEGER | YES | NULL |
| `start_odometer_photo_url` | TEXT | YES | NULL |
| `end_odometer_photo_url` | TEXT | YES | NULL |

---

## 8. E2E Tests (@plane CRM-728)

| ID | Scenario |
|---|---|
| E2E-728-1 | กด "เริ่มทริป" → Dialog เปิดพร้อม vehicle selector + odometer input |
| E2E-728-2 | ยังไม่เลือกพาหนะ → ปุ่ม "ยืนยัน" disabled (ถ้า OQ-728-4 = required) |
| E2E-728-3 | เลือก private_car + ใส่ 12000 → POST /trips กับ vehicle_type+start_odometer |
| E2E-728-4 | ไม่กรอก odometer → POST /trips กับ start_odometer=null → success |
| E2E-728-5 | กด "จบทริป" → Dialog แสดง vehicle read-only + odometer input |
| E2E-728-6 | กรอก end=12150, start=12000 → preview "150 กม." |
| E2E-728-7 | กรอก end < start → warning แสดง |
| E2E-728-8 | ไม่กรอก end_odometer → PUT /trips/{id}/end กับ end_odometer=null → success |
| E2E-728-9 | trip completed → summary แสดง vehicle label + odometer_distance_km |

---

## 9. Open Questions (ต้องถาม PO ก่อน Design)

| # | คำถาม | Priority | แนะนำ |
|---|---|---|---|
| **OQ-728-1** | vehicle_type = 'other' → note required หรือ optional? | HIGH | optional |
| **OQ-728-2** | หน่วยเลขไมล์: **กิโลเมตร** หรือ **ไมล์ (mile)**? | HIGH | กิโลเมตร |
| **OQ-728-3** | vehicle_type: **hardcode 4 ตัว** หรือ master data API? | HIGH | hardcode |
| **OQ-728-4** | vehicle_type **required** หรือ **optional** (skip ได้)? | HIGH | optional |
| **OQ-728-5** | GET /trips (list) ต้องแสดง vehicle_type + odometer_distance_km ไหม? | MEDIUM | ใช่ |
| **OQ-728-6** | end_odometer < start_odometer: **warning** เท่านั้น หรือ **block confirm**? | MEDIUM | warning เท่านั้น |
| **OQ-728-7** | OCR จากรูปถ่าย → prefill เลขไมล์อัตโนมัติ — ใน scope นี้ไหม? | ~~MEDIUM~~ | **Phase II** — PO น้อย confirm 18 ก.ค. 2569 |
| **OQ-728-8** | ชื่อ field API: `start_odometer` (spec ใหม่) หรือ `odometer_start` (spec เดิม [OQ-23])? | HIGH | start_odometer |
| **OQ-728-9** | รูปถ่าย upload **พร้อมกับ POST body** (base64) หรือ **แยก endpoint**? | MEDIUM | รวม body (simpler) |
| **OQ-728-10** | trip เก่าที่ไม่มี vehicle_type ตอน stop → ต้องให้กรอกพาหนะไหม? | LOW | ไม่บังคับ |

---

## 10. Assumptions

1. vehicle_type optional — backward compat กับ trip เดิม
2. odometer optional — ไม่บังคับพนักงาน
3. ไม่มี OCR — ไม่ใน scope นี้
4. odometer_distance_km คำนวณ backend เท่านั้น
5. ไม่แทนที่ GPS distance — แสดง 2 ค่าแยก
6. หน่วยเป็นกิโลเมตร — รอ confirm OQ-728-2
7. ชื่อ field = `start_odometer`/`end_odometer` — รอ confirm OQ-728-8

---

## 11. Handoff Checklist สำหรับ Designer

**ต้องตอบก่อนออกแบบ:** OQ-728-1, OQ-728-2, OQ-728-3, OQ-728-4, OQ-728-6

- [ ] อ่าน `ui/pages/appointment/my-day.vue` บรรทัด 335–370 (existing dialogs)
- [ ] ออกแบบ **Start Trip Dialog** (แทน AlertDialog เดิม)
- [ ] ออกแบบ **Stop Trip Dialog** (แทน AlertDialog เดิม)
- [ ] ออกแบบ vehicle type selector (Button group หรือ Card selector — ไม่ใช่ Radio input)
- [ ] ระบุ Camera button icon (reuse `Camera` จาก lucide-vue-next)
- [ ] ออกแบบ empty state: stop dialog ที่ trip ไม่มี start_odometer
- [ ] ออกแบบ summary row ใน completed trip (vehicle + odometer_distance_km)
- [ ] mobile-first 390px — Dialog ต้องไม่ overflow บน phone

---

**ไฟล์อ้างอิง:**
- `ui/pages/appointment/my-day.vue` — Start/Stop Trip buttons + dialogs
- `ui/composables/useTrip.ts` — Trip interfaces + composables
- `docs/osr-field-visit/01-API-SPEC.md` §2 — odometer fields [OQ-23]
