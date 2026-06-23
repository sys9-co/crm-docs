# OSR Daily Trip & Field Visit Hub — API Specification

**Phase:** 0 — Trip API Spec (ba-sa draft)
**Plane:** [CRM-382] (parent [CRM-381]) — label `crm-backend`
**Status:** DRAFT — รอ backend ยืนยัน endpoint/payload
**Base URL:** `/crm/{api_version}/...`
**Auth:** `Authorization: Bearer {accessToken}` + `X-Merchant-UID: {merchantUUID}` (ทุก request — `ui/plugins/globals.client.ts:196-199`)
**Envelope:** `APIResponse<T>` = `{ status: boolean, message: string, data?: T, error_code?: string }` (`ui/types/api.ts:2-7`)

> Plugin ทุกตัว (`callGet/callPost/callPut/callDel`) คืน `response.data` ตรงๆ และตรวจ `res.status === true` (boolean) เป็นเงื่อนไขสำเร็จ (`globals.client.ts:201`, `visit/index.vue:597`). `export.vue:481-509` เป็น appointment summary ปัจจุบัน ระยะทาง/เวลาคำนวณฝั่ง client ด้วย Google Directions (`export.vue:692-701`).

---

## 1. ภาพรวม + User Journey

OSR (Outdoor Sales Rep) ทำงานเป็นรอบรายวัน: **เริ่มทริป** (1 ครั้ง/วัน) → เข้าเยี่ยมหลายจุด โดย **เช็คอิน/เช็คเอาท์ที่ลูกค้าทุกจุด** → **จบทริป** → ระบบสรุป trip รายวัน → หัวหน้าทีมดูภาพรวมทั้งทีม

### ⚠️ คำศัพท์ — แยก 2 ชั้นให้ชัด (PM ตัดสิน 2026-06-23)
| ระดับ | การกระทำ | คำที่ใช้ (UI) | field |
|---|---|---|---|
| **Trip รายวัน** (1/วัน) | เปิดวันทำงาน / ปิดวันทำงาน | **"เริ่มทริป" / "จบทริป"** (ไม่ใช้คำว่า check-in/out) | trip: `started_at` / `ended_at` (+ GPS) |
| **จุดแวะลูกค้า** (ทุก visit) | ถึงหน้างาน / ออกจากหน้างาน | **"เช็คอิน / เช็คเอาท์"** | visit: `check_in_at` / `check_out_at` (มีอยู่แล้ว) |

> **ข้อดีของการแยกแบบนี้:** per-stop เช็คอิน **ใช้ field `check_in_at/check_in_lat/check_in_lng/check_out_*` ที่มีอยู่แล้วใน visit** (`visit/[id]/index.vue:480-485`) — **ไม่ต้องเพิ่ม field backend** แค่เพิ่ม UI ปุ่ม "เช็คอิน/เช็คเอาท์" ในหน้า visit detail/edit; ส่วน trip-level เป็น entity ใหม่ใช้คำ `started_at/ended_at` (ไม่ปนกับ check-in)

```
                    ┌─────────────────────────────────────────────┐
                    │  Trip (1 ต่อ user ต่อวัน)  route_date=YYYY-MM-DD │
                    │                                               │
   เริ่มทริป ─POST─▶ │  started_at / start_lat / start_lng           │
                    │                                               │
                    │   ├─ Visit #1 → เช็คอิน/เช็คเอาท์ (visit field)│
                    │   ├─ Visit #2 → เช็คอิน/เช็คเอาท์              │
                    │   └─ Visit #3 (walk-in) ◀── route_date+owner  │
                    │                                               │
   จบทริป ──PUT───▶ │  ended_at / end_lat / end_lng                 │
                    │                                               │
   สรุป  ──GET────▶ │  summary: visit count / done / pending /      │
                    │           distance / work hours / expense     │
                    └─────────────────────────────────────────────┘
```

---

## 2. Trip Entity Schema

| Field | Type | Nullable | คำอธิบาย |
|---|---|---|---|
| `id` | int | No | trip id |
| `merchant_uid` | string | No | ตาม X-Merchant-UID (สอดคล้อง visit `merchant_uid`) |
| `route_date` | string `YYYY-MM-DD` | No | วันของ trip — คีย์ผูก visits (สอดคล้อง visit `date`) |
| `owner_user_id` | int | No | OSR เจ้าของ trip (สอดคล้อง visit `owner_user_id`) |
| `owner_user_info` | object\|null | Yes | ข้อมูล user ฝัง (สอดคล้อง visit `owner_user_info`) |
| `team_id` | int | No | ทีม (สอดคล้อง visit `team_id`) — ใช้ filter team summary |
| `started_at` | string ISO8601 | Yes | เวลา**เริ่มทริป** (null = ยังไม่เริ่ม) |
| `start_lat` | number\|null | Yes | พิกัดตอนเริ่มทริป |
| `start_lng` | number\|null | Yes | พิกัดตอนเริ่มทริป |
| `ended_at` | string ISO8601 | Yes | เวลา**จบทริป** (null = ยังไม่จบ → trip ยัง active) |
| `end_lat` | number\|null | Yes | พิกัดตอนจบทริป |
| `end_lng` | number\|null | Yes | พิกัดตอนจบทริป |
| `status` | string | No | `active` / `completed` / `cancelled` — **[OQ-1]** ยืนยัน enum (expert แนะนำเพิ่ม `cancelled` สำหรับ OSR ป่วย/ถูกสั่งกลับกลางวัน) |
| `note` | string\|null | Yes | บันทึกท้ายวัน (optional) |
| `start_address_text` | string\|null | Yes | reverse geocode ตำแหน่งเริ่มทริป (ให้ manager อ่านได้ — expert D-2) |
| `end_address_text` | string\|null | Yes | reverse geocode ตำแหน่งจบทริป |
| `start_gps_accuracy` | number\|null | Yes | GPS accuracy (meters) ตอนเริ่มทริป — ใช้ตัดสิน reliability |
| `end_gps_accuracy` | number\|null | Yes | GPS accuracy (meters) ตอนจบทริป |
| `odometer_start` | number\|null | Yes | เลขไมล์เริ่มต้น (optional, audit ค่าน้ำมัน — **[OQ-23]**) |
| `odometer_end` | number\|null | Yes | เลขไมล์สิ้นสุด |
| `created_at` | string ISO8601 | No | |
| `updated_at` | string ISO8601 | No | |
| `visits` | array | (เฉพาะ detail) | visit objects — shape ตาม visit เดิม |
| `expenses` | array | (เฉพาะ detail) | รายการค่าใช้จ่ายของ trip (ดู §6c) |
| `summary` | object | (เฉพาะ detail) | สรุป (ดู §6) |

> วันที่ใน payload เป็น **ISO 8601** ส่วน UI แสดงเป็น **พ.ศ.** ผ่าน `$formatThaiDate` (`visit/index.vue:381`)

---

## 3. Endpoints ที่เสนอ (ให้ backend ยืนยัน/แก้)

### 3.1 POST `/crm/{v}/trips` — เริ่มทริป (เปิดวัน)
```json
{ "route_date": "2026-06-23", "start_lat": 13.7563, "start_lng": 100.5018, "start_gps_accuracy": 12.5, "note": null }
```
- `team_id`/`owner_user_id` backend derive จาก token (เหมือน appointment ที่ใช้ `user.team_id` — `export.vue:485-491`). **[OQ-2]** หรือ frontend ส่ง?

Response (200):
```json
{ "status": true, "message": "Trip started",
  "data": { "id": 101, "route_date": "2026-06-23", "owner_user_id": 5, "team_id": 2,
    "started_at": "2026-06-23T08:12:00+07:00", "start_lat": 13.7563, "start_lng": 100.5018,
    "ended_at": null, "end_lat": null, "end_lng": null, "status": "active" } }
```
เริ่มทริปซ้ำ: `{ "status": false, "message": "Trip already exists for today", "error_code": "TRIP_EXISTS" }` — **[OQ-3]** error หรือ idempotent return trip เดิม?

### 3.2 PUT `/crm/{v}/trips/{id}/end` — จบทริป (ปิดวัน)
```json
{ "end_lat": 13.7460, "end_lng": 100.5340, "end_gps_accuracy": 8.2, "note": "ปิดงานครบ 5 จุด" }
```
Response: trip object `status: "completed"` + `ended_at` set
> ค่าใช้จ่าย (expenses) **ไม่ส่งรวมใน end body** — เพิ่ม/ลบผ่าน endpoint แยก §6c (เพราะมีไฟล์แนบใบเสร็จ + เพิ่มทีละรายการได้ระหว่างวัน) UI หน้าจบทริปจะแสดงฟอร์มเพิ่ม expense ก่อนกดยืนยัน — **[OQ-13]** backend ยืนยันว่ายอมให้เพิ่ม expense ตอน trip ยัง active ได้ (ไม่บังคับรอจบทริป)

### 3.2b POST `/crm/{v}/visits/{id}/checkin` + `/checkout` — เช็คอิน/เช็คเอาท์รายจุด (per-stop)
**ใช้ field visit ที่มีอยู่แล้ว** (`check_in_at/check_in_lat/check_in_lng`, `check_out_at/check_out_lat/check_out_lng` — `visit/[id]/index.vue:480-485`) — ไม่เพิ่ม field ใหม่
```json
// POST /visits/{id}/checkin   → { "check_in_lat": 13.74, "check_in_lng": 100.53, "gps_accuracy": 12.5 }
// POST /visits/{id}/checkout  → { "check_out_lat": 13.74, "check_out_lng": 100.53, "gps_accuracy": 8.0 }
```
- **[OQ-16]** backend มี endpoint set field พวกนี้แล้วหรือยัง? (ปัจจุบันไม่มี UI ไหนเขียนค่า — search = 0) ถ้าไม่มี ให้เพิ่ม 2 endpoint นี้ (set ค่าลง column visit เดิม ไม่เปลี่ยน schema)
- UI: ปุ่ม "เช็คอิน" ในหน้า visit detail/edit ตอนถึงหน้างาน, "เช็คเอาท์" ตอนออก — reuse GPS `getCurrentLocation`

### 3.3 GET `/crm/{v}/trips?from=&to=&team_id=&owner_user_id=` — list (team summary)
Query (สอดคล้อง `visit/index.vue:575-593`, `export.vue:487-496`):

| Param | Type | Required | คำอธิบาย |
|---|---|---|---|
| `from` | `YYYY-MM-DD` | No | filter `route_date` >= |
| `to` | `YYYY-MM-DD` | No | filter `route_date` <= |
| `team_id` | int | No | filter ทีม |
| `owner_user_id` | int | No | filter OSR คนเดียว |
| `page` / `size` | int | No | pagination (default size 20) |

Response: `data` = array ของ trip objects (รวม `summary` ย่อ, **ไม่รวม `visits[]`** เพื่อ payload เบา — **[OQ-4]**)

### 3.4 GET `/crm/{v}/trips/{id}` — trip detail + visits[] + summary
```json
{ "status": true, "message": "OK",
  "data": { "id": 101, "route_date": "2026-06-23", "owner_user_id": 5, "team_id": 2,
    "started_at": "2026-06-23T08:12:00+07:00", "ended_at": "2026-06-23T17:30:00+07:00",
    "start_lat": 13.7563, "start_lng": 100.5018, "end_lat": 13.7460, "end_lng": 100.5340,
    "status": "completed",
    "summary": { "visit_total": 5, "visit_completed": 4, "visit_pending": 1,
      "distance_km": 42.7, "work_seconds": 33480, "work_hours_text": "9 ชั่วโมง 18 นาที" },
    "visits": [ { "id": 880, "title": "...", "visit_type": "onsite", "status": "completed",
      "date": "2026-06-23", "starts_at": "...", "ends_at": "...", "geo_lat": 13.74, "geo_lng": 100.53,
      "check_in_at": "2026-06-23T09:05:00+07:00", "check_in_lat": 13.7401, "check_in_lng": 100.5298,
      "check_out_at": "2026-06-23T09:48:00+07:00", "check_out_lat": 13.7402, "check_out_lng": 100.5299,
      "address_text": "...", "progress_percent": 100, "org_contact_name": "...", "owner_user_id": 5 } ] } }
```
> visit fields คัดลอก shape เดิมทั้งหมดจาก `visit/[id]/index.vue:455-486` + `export.vue:512-523` — ไม่เพิ่ม/เปลี่ยน field ใดของ visit

### 3.5 GET `/crm/{v}/trips/today` — trip ของ user วันนี้ (My Day)
trip object เดียว (เหมือน detail) ของ owner = token user, `route_date = today`
- ยังไม่เริ่มทริป: `{ "status": true, "message": "No trip today", "data": null }` (frontend แสดงปุ่ม "เริ่มทริป")
- **[OQ-5]** จำเป็นไหม หรือ derive จาก `GET /trips?from=today&to=today&owner_user_id={me}`? (แนะนำให้มี `today` — semantic ชัด + รวม visits[] ครั้งเดียว)

**สรุป: 5 trip endpoints** (POST เริ่มทริป, PUT `/end` จบทริป, GET list, GET detail, GET today) **+ 2 per-stop visit endpoints** (POST `/visits/{id}/checkin` + `/checkout`)

---

## 4. ความสัมพันธ์ Trip ↔ Visit (ให้ backend เลือก 1 ใน 2)

### ทางเลือก A — Implicit join: `route_date` + `owner_user_id` (แนะนำ)
Trip detail ดึง visits โดย `visits WHERE date = trip.route_date AND owner_user_id = trip.owner_user_id`
- ✅ **ไม่ต้องแก้ visit schema เลย** — visit เดิมมี `date` + `owner_user_id` ครบ (`visit/[id]/index.vue:466,475`)
- ✅ walk-in ผูก trip อัตโนมัติทันทีที่ตรง date+owner
- ❌ ถ้า >1 trip/วัน แยก visit เข้า trip ไหนไม่ได้ → บังคับกฎ 1 trip/user/วัน (§5)

### ทางเลือก B — Explicit FK: เพิ่ม `trip_id` ใน visit
- ✅ ผูกแน่นอน รองรับหลาย trip/วัน
- ❌ **ต้องเพิ่ม column + แก้ logic create visit** → กระทบ payload/flow visit เดิม ขัดขอบเขตเฟสนี้

**คำแนะนำ ba-sa:** เริ่มด้วย **ทางเลือก A (implicit)** — non-breaking ต่อ visit ตรงเจตนา "Trip ครอบ visits ไม่ใช่แก้ visit"; เก็บ B ไว้เป็น migration อนาคต **[OQ-6]**

---

## 5. Trip State Machine (Expert Review: ต้องมี)

```
(ไม่มี trip) ──POST /trips──▶ [active]
                                 │
                   PUT /end ─────┤──▶ [completed]
                                 │
                   cancel ───────┤──▶ [cancelled]  (OSR ป่วย/หัวหน้าสั่งกลับ)
                                 │
                auto-close ──────┘──▶ [completed]  (trip ค้างข้ามเที่ยงคืน OQ-9)

[completed] ──reopen?──▶ [active]  (ภายในวันเดียวกัน BR-4 — [OQ-7])
[cancelled] ──ห้ามกลับ active──
```

**Transition rules:**
| From | To | Trigger | เงื่อนไข |
|---|---|---|---|
| (none) | `active` | `POST /trips` | ไม่มี trip วันนี้ |
| `active` | `completed` | `PUT /trips/{id}/end` | ต้อง active |
| `active` | `cancelled` | `PUT /trips/{id}/cancel` (ใหม่) | ต้อง active — **[OQ-27]** endpoint นี้ต้องมีไหม? |
| `completed` | `active` | reopen (BR-4) | ภายในวันเดียวกันเท่านั้น |
| `active` | `completed` | auto-close cron | ข้ามเที่ยงคืน (OQ-9) — ใช้ last check_out GPS |
| `cancelled` | - | ห้าม transition กลับ | - |

### Per-Stop Check-in Business Rules (Expert Review: ต้องเพิ่ม)
| # | กฎ | เหตุผล |
|---|---|---|
| BR-CI-1 | **ต้อง checkout visit ก่อนหน้าก่อน checkin visit ถัดไป** | ป้องกัน overlap dwell time → KPI ผิด — **[OQ-19]** |
| BR-CI-2 | เช็คอินได้เฉพาะเมื่อ trip ยัง `active` | ไม่มี trip = ยังไม่เริ่มวัน |
| BR-CI-3 | GPS required สำหรับ check-in (block ถ้า denied) | ต้องยืนยันว่า OSR ถึงหน้างานจริง — **[OQ-24]** PM ตัดสิน: block หรือ allow with warning |

---

## 5b. กฎเชิง Business (ให้ backend ยืนยัน)

| # | กฎที่เสนอ | สถานะ |
|---|---|---|
| BR-1 | **1 trip ต่อ user ต่อ route_date** (unique `owner_user_id + route_date`) | **[OQ-3]** |
| BR-2 | เริ่มทริปซ้ำ → return trip เดิม (idempotent) หรือ error `TRIP_EXISTS` | **[OQ-3]** |
| BR-3 | จบทริปได้เฉพาะ `status = active`; ซ้ำ → `TRIP_ALREADY_CLOSED` | **[OQ-7]** |
| BR-4 | หลังจบทริปแก้ได้ไหม? เสนอ: แก้ได้ภายในวันเดียวกัน, ข้ามวันล็อก | **[OQ-7]** |
| BR-5 | walk-in หลังเริ่มทริป → ผูก trip อัตโนมัติด้วย date+owner | **[OQ-6]** |
| BR-6 | visit ก่อนเริ่มทริป → ยังนับเข้า trip เมื่อเริ่มทริปภายหลัง (date ตรง) | **[OQ-8]** |
| BR-7 | ไม่จบทริปจนสิ้นวัน → trip ค้าง `active`; auto-close เที่ยงคืนไหม? | **[OQ-9]** |
| BR-8 | OSR เห็นเฉพาะตัวเอง, หัวหน้าทีมเห็นทั้งทีม | **[OQ-10]** |

---

## 6. Summary Fields

| Field | ที่มา | หมายเหตุ |
|---|---|---|
| `visit_total` | นับ visits ใน trip | backend นับ |
| `visit_completed` | visits `status = completed` | **[OQ-11]** ค่า status ที่ถือว่า "เสร็จ" |
| `visit_pending` | total − completed | |
| `distance_km` | **[OQ-12] จุดตัดสินใจ** | ปัจจุบัน client คำนวณด้วย Google Directions (`export.vue:692-701`). เสนอ: ระยะยาวให้ **backend คำนวณ** server-side เพื่อความสม่ำเสมอ |
| `work_seconds` / `work_hours_text` | `ended_at − started_at` | trip active → null/"กำลังทำงาน"; format `"X ชั่วโมง Y นาที"` (`export.vue:701`) |
| `expense_total` | sum `expenses[].amount` | ยอดรวมค่าใช้จ่ายของ trip (บาท) |
| `expense_count` | นับ `expenses[]` | จำนวนรายการ |
| `visit_onsite_count` | visits ที่ `visit_type = onsite` | แยก onsite vs call — KPI field sales นับแต่ onsite (expert D-7) |
| `visit_call_count` | visits ที่ `visit_type = call` | call ไม่ถือว่าออกเยี่ยม |
| `first_check_in_at` | เวลาเช็คอินจุดแรก | วัด punctuality (expert field-sales) |
| `last_check_out_at` | เวลาเช็คเอาท์จุดสุดท้าย | จับคู่กับ first_check_in_at ดู productive hours |
| `total_dwell_minutes` | sum(check_out_at − check_in_at) ต่อ visit | net productive time อยู่หน้าลูกค้าจริง (ไม่รวมเดินทาง) |
| `planned_visit_count` | visits ที่มีนัดล่วงหน้า | แยก planned vs walk-in — **[OQ-26]** |
| `walkin_visit_count` | visits ที่สร้างวันนั้น (walk-in) | heuristic: `created_at >= route_date` |

---

## 6c. Trip Expenses — บันทึกค่าใช้จ่าย + แนบใบเสร็จ

OSR บันทึกค่าใช้จ่ายที่เกิดขึ้นระหว่าง trip (เช่น ค่าปะยาง, ค่าซื้อกาแฟลูกค้า, อื่นๆ) พร้อมแนบรูปใบเสร็จ — แสดงฟอร์มในหน้า **จบทริป** (เพิ่มได้ระหว่าง trip ยัง active ด้วย — **[OQ-13]**)

### Expense Entity Schema
| Field | Type | Nullable | คำอธิบาย |
|---|---|---|---|
| `id` | int | No | expense id |
| `trip_id` | int | No | trip ที่ผูก |
| `category` | string | No | enum: `fuel` (ค่าน้ำมัน), `tire` (ค่าปะยาง), `customer_hospitality` (ค่ารับรองลูกค้า/กาแฟ), `parking` (ค่าจอดรถ), `toll` (ค่าทางด่วน), `meal` (ค่าอาหาร/เบี้ยเลี้ยง), `transport` (ค่าเดินทางอื่น เช่น แท็กซี่/BTS), `other` (อื่นๆ) — **[OQ-14]** ยืนยัน enum + label ไทย (expert เพิ่ม `meal` + `transport`) |
| `amount` | number | No | จำนวนเงิน (บาท) > 0 |
| `note` | string\|null | Yes | รายละเอียด (บังคับกรอกเมื่อ `category = other`) |
| `receipt_image_url` | string\|null | Yes | URL ใบเสร็จที่อัปโหลด (null = ไม่แนบ) — **[OQ-21]** พิจารณาเปลี่ยนเป็น `receipt_images: string[]` รองรับหลายรูป (หน้า-หลังใบเสร็จ) |
| `spent_at` | string ISO8601 | Yes | เวลาที่จ่าย (default = เวลาบันทึก) |
| `status` | string | No | `pending` / `approved` / `rejected` — default `pending`; phase แรกไม่ implement approval flow แต่ **reserve field ใน schema** ตั้งแต่ต้นเพื่อไม่ต้อง migrate — **[OQ-22]** |
| `created_at` | string ISO8601 | No | |
| `updated_at` | string ISO8601 | No | (expert D-4: ทุก entity ต้องมี updated_at) |

### Endpoints
```
POST   /crm/{v}/trips/{id}/expenses              → เพิ่มรายการ + ใบเสร็จ (base64)
PUT    /crm/{v}/trips/{id}/expenses/{expenseId}  → แก้ไขรายการ (expert D-5: ไม่ต้อง delete+recreate)
DELETE /crm/{v}/trips/{id}/expenses/{expenseId}  → ลบรายการ
GET    expenses[] รวมมาใน GET /trips/{id} (detail) อยู่แล้ว
```

POST body (reuse pattern อัปโหลดรูป base64 เดียวกับ visit photos — `visit/[id]/edit-v2.vue:733-741`):
```json
{
  "category": "tire",
  "amount": 350,
  "note": "ปะยางหน้าซ้าย",
  "spent_at": "2026-06-23T14:20:00+07:00",
  "receipt_image_base64": "data:image/jpeg;base64,..."   // optional
}
```
- ถ้าแนบใบเสร็จ ส่ง `receipt_image_base64` (รูปจาก in-page camera/gallery ตาม ADR-008) backend เก็บแล้วคืน `receipt_image_url` — **[OQ-15]** หรือแยกเป็น 2 step (POST expense → POST receipt) เหมือน visit photos? (visit ใช้ field `image_base64` — `edit-v2.vue:736`)
- response: expense object ที่สร้าง

### UI (Phase 2 — หน้าจบทริป)
- ก่อนกด "ยืนยันจบทริป": section "ค่าใช้จ่ายวันนี้" — list รายการ + ปุ่ม "+ เพิ่มค่าใช้จ่าย"
- ฟอร์มเพิ่ม: segmented/select หมวด (chip ไอคอน) + ช่องจำนวนเงิน + note (แสดงเมื่อ "อื่นๆ") + ปุ่มแนบใบเสร็จ (reuse in-page camera `create-v2.vue` ADR-008 + gallery)
- แสดงยอดรวม `expense_total` ท้าย section
- **ไม่บังคับ** มีค่าใช้จ่าย — จบทริปได้แม้ไม่มีรายการ

---

## 7. Open Questions สำหรับ Backend (16 ข้อ)

- **OQ-1:** enum `trip.status` — `active`/`completed` พอไหม มี `cancelled`?
- **OQ-2:** `team_id`/`owner_user_id` ตอนเริ่มทริป — derive จาก token หรือ frontend ส่ง?
- **OQ-3:** เริ่มทริปซ้ำ → idempotent หรือ error? (BR-1/BR-2)
- **OQ-4:** GET list รวม `visits[]` ไหม (แนะนำไม่รวม)?
- **OQ-5:** ต้องมี `/trips/today` แยกไหม?
- **OQ-6 [BLOCKER]:** Trip↔Visit implicit (A) vs explicit `trip_id` (B)? (แนะนำ A)
- **OQ-7:** จบทริปซ้ำ/แก้หลังจบทริป, ล็อกข้ามวัน? (BR-3/BR-4)
- **OQ-8:** visit ก่อนเริ่มทริป นับเข้า trip ไหม? (BR-6)
- **OQ-9:** trip ค้าง active ข้ามวัน auto-close ไหม? (BR-7)
- **OQ-10:** visibility OSR vs หัวหน้าทีม? (BR-8)
- **OQ-11:** ค่า `visit.status` ที่ถือว่า "เสร็จ"?
- **OQ-12 [BLOCKER]:** `distance_km` client vs backend?
- **OQ-13:** เพิ่ม expense ได้ระหว่าง trip `active` หรือเฉพาะตอนจบทริป?
- **OQ-14:** enum `expense.category` + label ไทย ตามที่เสนอ (fuel/tire/customer_hospitality/parking/toll/other) ครบไหม?
- **OQ-15:** อัปโหลดใบเสร็จ — แนบ base64 ใน POST expense ครั้งเดียว หรือแยก 2 step (POST expense → POST receipt) เหมือน visit photos?
- **OQ-16:** per-stop เช็คอิน/เช็คเอาท์ — มี endpoint set field `check_in_at/check_out_at` ใน visit แล้วหรือยัง? (ปัจจุบันไม่มี UI เขียนค่า) ถ้าไม่มี เพิ่ม `POST /visits/{id}/checkin` + `/checkout` (set ค่าลง column เดิม ไม่เปลี่ยน schema)

### Open Questions เพิ่มจาก Expert Review (OQ-17 ถึง OQ-27)

- **OQ-17:** Visit field `visit_type` ที่อ้างใน example (line 129) — field จริงชื่ออะไร? (`appointment_type` ใน export.vue:506 หรือ field ใหม่?) → **Blocker** ก่อน finalize schema
- **OQ-18:** Geofence / distance-to-customer ตอน per-stop check-in — validate server-side หรือเก็บ `check_in_distance_meters` ให้ manager ดู? (threshold warning เช่น >500m แสดง flag ไม่ block)
- **OQ-19:** Concurrent check-in — อนุญาตให้เช็คอินซ้อนกันได้ไหม (visit A ยัง active + เช็คอิน visit B)? Expert แนะนำ: **ไม่อนุญาต** ต้อง checkout ก่อน (ป้องกัน overlap dwell time)
- **OQ-20:** Expense edit — ต้องมี PUT endpoint แก้ไข expense ไหม? (spec เพิ่มแล้วตาม expert) หรือ delete+recreate พอ?
- **OQ-21:** Receipt images — singular `receipt_image_url` หรือ plural `receipt_images[]`? (expert แนะนำ plural ตั้งแต่ต้นเพื่อไม่ต้อง migrate)
- **OQ-22:** Expense approval workflow — `status: pending/approved/rejected` phase ไหน implement? schema ต้องรองรับตั้งแต่ต้น (field reserved แล้วใน spec)
- **OQ-23:** Odometer — ต้องการ field เลขไมล์เริ่ม/สิ้นสุดไหม? (optional, ช่วย audit ค่าน้ำมัน — field reserved แล้วใน schema)
- **OQ-24:** GPS denied = **block** เริ่มทริป/เช็คอิน หรือ **allow with warning**? (expert แนะนำ: block + dialog อธิบาย + link settings)
- **OQ-25:** Timezone storage — backend เก็บ UTC หรือ +07:00? (ตัวอย่างใน spec ใช้ +07:00)
- **OQ-26:** Planned vs walk-in visit — ใช้ heuristic (`created_at < route_date` = planned) หรือเพิ่ม boolean field `is_walkin`?
- **OQ-27:** Trip cancel endpoint — `PUT /trips/{id}/cancel` ต้องมีแยกไหม? (เพื่อ OSR ป่วย/หัวหน้าสั่งกลับ) หรือใช้ PATCH status ทั่วไป?
- **OQ-28:** Team trip list — `GET /trips?team_id=` ต้อง nested visits + owner info (owner_first_name, owner_last_name, owner_avatar_url, visit_completed_count, visit_total_count, total_distance_km, expense_total) สำหรับหัวหน้าทีมดู team summary — shape ยืนยันกับ backend

---

## 8. Validation Rules (Expert Review)

| Rule | คำอธิบาย |
|---|---|
| `category = 'other'` → `note` required | backend return 400 ถ้า note blank |
| `amount > 0` | ค่าใช้จ่ายต้องเป็นบวก |
| `receipt_image_base64` max size | **แนะนำ 5MB** (ตาม pattern visit photos) — client compress ก่อนส่ง |
| concurrent check-in blocked | ต้อง checkout visit ก่อนหน้าก่อน checkin ใหม่ (OQ-19) |
| GPS required for trip start + check-in | return error ถ้า lat/lng = null (OQ-24 — PM ตัดสิน) |

---

## 8b. Offline / Mobile Edge Cases (Expert Review)

| Edge Case | ข้อเสนอ |
|---|---|
| Offline เริ่มทริป/เช็คอิน | Frontend queue: เก็บ payload + `client_timestamp` ใน localStorage, sync เมื่อ online — **[OQ-23b]** ถ้า implement, backend ต้องรับ `client_timestamp` แยกจาก `created_at` |
| GPS timeout ในอาคาร | Set `{ timeout: 15000, maximumAge: 30000, enableHighAccuracy: true }` — code เดิมไม่ set timeout |
| Trip ค้าง + เปิด app วันใหม่ | Frontend เช็ค: ถ้ามี active trip วันก่อน → prompt "คุณมีทริปค้างวันที่ XX กรุณาจบทริปก่อน" หรือ auto-close (OQ-9) |
| แบตหมดกลางทาง | เหมือน trip ค้าง — auto-close ใช้ last check_out GPS เป็น end location |
| Walk-in ก่อนเริ่มทริป | UI เตือน "คุณยังไม่ได้เริ่มทริปวันนี้" — implicit join (date+owner) จะจับได้ภายหลัง (BR-6) |
| Trip ข้ามเที่ยงคืน | `route_date` = วันที่กดเริ่มทริป; visits join ด้วย range `started_at <= visit.date <= ended_at` แทน exact date match |

---

## 9. Mock Fallback Note (ระหว่างรอ backend)

ตาม **ADR-002** — ระหว่าง backend ยังไม่ส่ง trip endpoints จริง frontend ใช้ **mock data shape ตรงตาม spec นี้** เพื่อให้ designer/coder เดินงานต่อ และเมื่อ backend พร้อม สลับเป็น `$callGet/$callPost/$callPut` จริงโดยไม่เปลี่ยน UI:
- mock `GET /trips/today` → trip object (active, 3 visits)
- mock `POST /trips` → trip ใหม่ status active (started_at set)
- mock `PUT /trips/{id}/end` → trip status completed + summary
- mock `POST /visits/{id}/checkin` + `/checkout` → visit ที่ set check_in_at/check_out_at
- mock `POST /trips/{id}/expenses` → expense object + receipt_image_url (mock)
- mock `GET /trips?...` → array 5 trips (team summary)
- ทุก mock ห่อด้วย `APIResponse<T>` (`status: true`)

---

## 10. Handoff สำหรับ Designer (Phase 1)

- [ ] ออกแบบ 3 จอ: **My Day** (เริ่มทริป → list visits วันนี้ + เช็คอิน/เช็คเอาท์รายจุด → จบทริป), **Trip Detail/Summary** (สรุป + แผนที่ route + visits), **Team Overview** (list trips ทั้งทีม)
- [ ] reuse visit card เดิม (`visit/index.vue:339-385`), Google route render (`export.vue:551-707`)
- [ ] วันที่แสดง พ.ศ. ผ่าน `$formatThaiDate`
- [ ] distance client/backend ผูกกับ OQ-12 — รอ backend ตอบก่อนวาด summary card
- [ ] ห้ามแตะ/ออกแบบใหม่ visit detail & appointment edit เดิม
