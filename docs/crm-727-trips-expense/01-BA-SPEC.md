---
layout: default
title: "CRM-727: Trips Expense — บันทึกค่าใช้จ่ายและแนบไฟล์ต่อ trip"
---

# CRM-727: Trips Expense — บันทึกค่าใช้จ่ายและแนบไฟล์ต่อ trip

**Feature:** `crm-727-trips-expense`
**BA/SA:** ทิพย์ (Claude BA/SA agent)
**Date:** 18 กรกฎาคม 2569
**Status:** CONFIRMED — PO (น้อย) อนุมัติ 18 ก.ค. 2569 → พร้อม handoff Designer
**Depends on:** `docs/osr-field-visit/01-API-SPEC.md` §6c
**Related:** CRM-726 (Trips Report)

---

## 1. ภาพรวม

Trip flow ปัจจุบัน:
```
เริ่มทริป (GPS) → เช็คอิน visit → บันทึกเยี่ยม → เช็คเอาท์ → [repeat] → จบทริป (GPS)
```

`TripSummary` มี `expense_total` + `expense_count` field อยู่แล้วใน `useTrip.ts:65–66` แต่ยังไม่มี Expense entity, endpoints, หรือ UI

CRM-727 = **implementation spec** เพิ่มรายละเอียด AC, UI flow, open questions

---

## 2. User Stories

### US-01: OSR บันทึกค่าใช้จ่ายระหว่าง trip

**AC-01.1 — เปิด Expense Form จาก My Day**
```
Given: OSR มี trip ที่ status = active
  And: อยู่หน้า /appointment/my-day
When: กดปุ่ม "+ ค่าใช้จ่าย" ใน ACTIVE TRIP CARD
Then: แสดง Drawer "เพิ่มค่าใช้จ่าย"
  And: ฟอร์มมี: [หมวด] [จำนวนเงิน (บาท)] [หมายเหตุ] [แนบใบเสร็จ (optional)]
  And: ปุ่ม "บันทึก" disabled จนกว่า expense_type + amount > 0
```

**AC-01.2 — เลือกหมวดค่าใช้จ่าย**
```
Given: OSR อยู่ใน Expense Form
When: กดเลือก [หมวด]
Then: แสดง chip grid: ⛽น้ำมัน / 🛣ทางด่วน / 🅿จอดรถ / 🍱อาหาร / ☕รับรองลูกค้า / 🚌ค่าเดินทาง / 📋อื่นๆ
  And: เลือกได้ 1 หมวดเท่านั้น
  And: ถ้าเลือก "อื่นๆ" → [หมายเหตุ] กลายเป็น required
```

**AC-01.3 — บันทึก expense**
```
Given: OSR เลือกหมวดและกรอกจำนวนเงิน
When: กด "บันทึก"
Then: POST /crm/{v}/trips/{tripId}/expenses
  And: Drawer ปิด
  And: list อัปเดตทันที + expense_total อัปเดต
  And: ถ้า error → toast.error
```

**AC-01.4 — Validation**
```
- expense_type ไม่ได้เลือก → "กรุณาเลือกหมวดค่าใช้จ่าย"
- amount = 0 หรือ blank → "กรุณากรอกจำนวนเงินที่มากกว่า 0"
- amount > 99,999 → warning "ค่าใช้จ่ายสูงกว่าปกติ — กรุณายืนยัน" (ไม่ block)
- expense_type = other + note blank → "กรุณาระบุรายละเอียด"
```

### US-02: OSR แนบรูปใบเสร็จ

**AC-02.1 — แนบรูป (optional)**
```
Given: OSR อยู่ใน Expense Form
When: กด "แนบใบเสร็จ"
Then: dropdown: [เลือกจาก gallery] [ถ่ายรูป] (mobile only)
  And: compress + convert base64 (pattern เดียวกับ CustomerDocuments.vue)
  And: thumbnail แสดงใน form
  And: ไฟล์เกิน 5MB → toast.warning "ไฟล์ต้องไม่เกิน 5 MB"
  And: ส่งเป็น receipt_image_base64 ใน POST body
```

**AC-02.2 — ดูรูปใบเสร็จ**
```
Given: expense มี receipt_image_url
When: กด thumbnail รูป
Then: Dialog preview รูปเต็ม (pattern CustomerDocuments)
```

### US-03: OSR ดูและจัดการรายการ expense

**AC-03.1 — แสดงรายการใน ACTIVE TRIP CARD**
```
Given: trip มี expense >= 1 รายการ
When: เปิดหน้า my-day
Then: ACTIVE TRIP CARD มี section "ค่าใช้จ่าย" (collapsed)
  And: header: "💰 ค่าใช้จ่าย (N รายการ · ฿X,XXX)"
  And: expand → list: [icon] [label] [amount] [thumbnail?] [ลบ]
  And: ท้าย: "รวม: ฿X,XXX" + ปุ่ม "+ ค่าใช้จ่าย"
```

**AC-03.2 — ลบ expense**
```
When: กด trash icon → confirm dialog → ยืนยัน
Then: DELETE /crm/{v}/trips/{tripId}/expenses/{expenseId}
  And: list + ยอดรวมอัปเดตทันที
```

**AC-03.3 — แก้ไข expense**
```
When: กดที่รายการ (ไม่ใช่ trash)
Then: เปิด Expense Form พร้อม pre-fill
When: กด "บันทึก"
Then: PUT /crm/{v}/trips/{tripId}/expenses/{expenseId}
```

**AC-03.4 — หลังจบทริป (readonly)**
```
Given: trip.status = completed
Then: COMPLETED TRIP CARD แสดง expense_total ใน summary
  And: ดู list ได้ แต่ไม่มีปุ่มลบ/แก้ไข/เพิ่ม
```

### US-04: Expense summary ใน End Trip Dialog

**AC-04.1**
```
Given: OSR กด "จบทริป"
When: AlertDialog แสดง
Then: มี section: "💰 ค่าใช้จ่ายวันนี้: N รายการ · ฿X,XXX"
  And: [ลิงก์ "ดูรายละเอียด"] (optional)
  And: ถ้า expense = 0 → "ยังไม่มีค่าใช้จ่าย" (ไม่ block จบทริป)
```

---

## 3. Data Model

### 3.1 TripExpense Interface (frontend)

```typescript
export interface TripExpense {
  id: number
  trip_id: number
  expense_type: ExpenseType
  amount: number                     // บาท, > 0
  note: string | null                // required เมื่อ type = 'other'
  receipt_image_url: string | null
  spent_at: string                   // ISO8601
  status: 'pending' | 'approved' | 'rejected'  // phase 1 = always 'pending'
  created_at: string
  updated_at: string
}

export type ExpenseType =
  | 'fuel'                  // ⛽ น้ำมัน
  | 'toll'                  // 🛣 ทางด่วน
  | 'parking'               // 🅿 จอดรถ
  | 'meal'                  // 🍱 อาหาร/เบี้ยเลี้ยง
  | 'customer_hospitality'  // ☕ รับรองลูกค้า
  | 'transport'             // 🚌 ค่าเดินทางอื่น
  | 'other'                 // 📋 อื่นๆ (note required)
```

### 3.2 ExpenseType Labels

| type | label ไทย | Lucide icon |
|---|---|---|
| `fuel` | น้ำมัน | `Fuel` |
| `toll` | ทางด่วน | `Route` |
| `parking` | จอดรถ | `ParkingSquare` |
| `meal` | อาหาร/เบี้ยเลี้ยง | `UtensilsCrossed` |
| `customer_hospitality` | รับรองลูกค้า | `Coffee` |
| `transport` | ค่าเดินทาง | `Bus` |
| `other` | อื่นๆ | `MoreHorizontal` |

---

## 4. API Endpoints ที่ต้องขอ Backend

Base: `/crm/{v}/trips/{tripId}/expenses`

### POST — เพิ่มค่าใช้จ่าย (201)

```json
// Request
{
  "expense_type": "fuel",
  "amount": 450,
  "note": null,
  "spent_at": "2026-07-18T10:30:00+07:00",
  "receipt_image_base64": "data:image/jpeg;base64,..."
}

// Response
{
  "status": true,
  "data": {
    "id": 501, "trip_id": 101, "expense_type": "fuel",
    "amount": 450, "note": null,
    "receipt_image_url": "https://cdn.example.com/receipts/501.jpg",
    "spent_at": "...", "status": "pending",
    "created_at": "...", "updated_at": "..."
  }
}
```

Error cases: `403 FORBIDDEN` (ไม่ใช่ trip ของตัวเอง), `400 TRIP_CLOSED` (ถ้า OQ-1 block), `400 INVALID_EXPENSE_TYPE`, `400 INVALID_AMOUNT`, `400 NOTE_REQUIRED`

### PUT `/{expenseId}` — แก้ไข (partial update)
### DELETE `/{expenseId}` — ลบ

### GET — ไม่ต้อง endpoint แยก
Embed `expenses[]` ใน GET /trips/{id} + GET /trips/today response พร้อม `summary.expense_total` + `summary.expense_count`

---

## 5. UI Flow

### 5.1 ACTIVE TRIP CARD — Expense Section

```
ACTIVE TRIP CARD
├── strip: กำลังออกเยี่ยม · เริ่ม 08:12  [จบทริป]
├── progress: 2/5 จุด ██░░░ 40%
└── EXPENSE SECTION (ใหม่)
    ┌─────────────────────────────────────────┐
    │ 💰 ค่าใช้จ่าย (2 รายการ · ฿750)   [v] │
    │─────────────────────────────────────────│
    │ ⛽ น้ำมัน              ฿450  [🖼] [🗑] │
    │ 🛣 ทางด่วน             ฿300       [🗑] │
    │─────────────────────────────────────────│
    │                     รวม: ฿750           │
    │                [+ เพิ่มค่าใช้จ่าย]      │
    └─────────────────────────────────────────┘
```

### 5.2 Bottom Sticky Bar

```
2/5 จุด · 28.5 กม. · ฿750    [ดูสรุป >]
                    ↑ เพิ่ม expense_total
```

### 5.3 COMPLETED TRIP CARD

```
✓ จบทริปแล้ว  4/5 จุด · 42.7 กม. · 9 ชม. 18 นาที · ฿1,200   [ดูสรุป]
(ไม่มีปุ่ม + เพิ่มค่าใช้จ่าย)
```

### 5.4 End Trip Dialog

```
AlertDialog: จบทริปวันนี้?
├── [body เดิม]
├── ──────────────────────────────
├── 💰 ค่าใช้จ่ายวันนี้: 2 รายการ · ฿750
│      [ดูรายละเอียด →]
├── ──────────────────────────────
└── [ยกเลิก]  [ยืนยันจบทริป]
```

---

## 6. Business Rules

| # | กฎ | เหตุผล |
|---|---|---|
| BR-E1 | เพิ่ม expense ได้เฉพาะ trip.status = active (pending OQ-1) | ป้องกันย้อนหลังข้ามวัน |
| BR-E2 | amount > 0 | ไม่มีค่าใช้จ่ายติดลบ |
| BR-E3 | expense_type = 'other' → note บังคับ | ต้องรู้ว่าคืออะไร |
| BR-E4 | receipt_image max 5 MB (pattern CustomerDocuments) | ลด bandwidth |
| BR-E5 | ลบได้เฉพาะ trip active (pending OQ-3) | audit trail |
| BR-E6 | status ของ expense = 'pending' เสมอใน phase 1 | reserve approval phase 2 |
| BR-E7 | role manage/admin เห็น expenses ของทีมใน Trips Report | RBAC ตาม pattern เดิม |
| BR-E8 | expense_total = sum(amount WHERE status != 'rejected') | phase 2 เป็นต้นไป |

---

## 7. Backend Fields ที่ต้องเพิ่ม

### Table ใหม่: `trip_expenses`

| Column | Type | Nullable | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT PK | No | |
| `trip_id` | BIGINT FK | No | |
| `merchant_uid` | VARCHAR | No | |
| `expense_type` | VARCHAR ENUM | No | fuel/toll/parking/meal/customer_hospitality/transport/other |
| `amount` | DECIMAL(10,2) | No | |
| `note` | TEXT | Yes | required ถ้า type = other |
| `receipt_image_url` | VARCHAR | Yes | URL หลัง backend เก็บ base64 |
| `spent_at` | TIMESTAMPTZ | Yes | default = created_at |
| `status` | VARCHAR ENUM | No | pending/approved/rejected; default pending |
| `created_by` | INT FK → users.id | No | |
| `created_at` | TIMESTAMPTZ | No | |
| `updated_at` | TIMESTAMPTZ | No | |

### Trip response ที่ต้องอัปเดต
- `summary.expense_total` — frontend interface มีอยู่แล้ว `useTrip.ts:65`
- `summary.expense_count` — frontend interface มีอยู่แล้ว `useTrip.ts:66`
- Embed `expenses[]` ใน GET /trips/today + GET /trips/{id}

---

## 8. E2E Test Outline (@plane CRM-727)

| TC | Scenario |
|---|---|
| TC-01 | เพิ่ม "น้ำมัน ฿450" → ปรากฏใน list + ยอดรวมอัปเดต |
| TC-02 | ลบ expense → หายจาก list + ยอดรวมเป็น 0 |
| TC-03 | expense_type = อื่นๆ + note ว่าง → validation error |
| TC-04 | กดจบทริป → End Trip Dialog แสดง expense summary |
| TC-05 | trip completed → expense list readonly, ไม่มีปุ่มเพิ่ม |

---

## 9. Open Questions (ต้องถาม PO ก่อน Design)

| # | คำถาม | ผลกระทบ | แนะนำ |
|---|---|---|---|
| **OQ-1** | เพิ่ม expense ได้ระหว่าง trip active หรือต้องรอจบทริป? | placement ปุ่ม ทั้งหมด | แนะนำ: ระหว่าง active ได้ |
| **OQ-2** | enum expense_type ครบไหม? ต้องเพิ่ม/ตัด? | backend schema + chip UI | ตรวจกับ HR/บัญชี |
| **OQ-3** | ลบ expense ได้เฉพาะ active หรือหลังจบด้วย? | readonly logic | แนะนำ: เฉพาะ active |
| **OQ-4** | 1 รูปหรือหลายรูปต่อ expense? | schema + UI | แนะนำ: 1 รูปก่อน |
| **OQ-5** | Approval flow ต้องการในตอนนี้ไหม? ใครเป็น approver? | scope phase | แนะนำ: ไม่มี phase 1 |
| **OQ-6** | expense_total แสดงใน Trips Report (CRM-726) ไหม? | scope CRM-726 | แนะนำ: ใช่ |
| **OQ-7** | มี ceiling จำนวนเงิน? | validation | แนะนำ: warning >5,000 บาท |
| **OQ-8** | spent_at OSR เลือกเองหรือ default เวลาบันทึก? | form field | แนะนำ: default |

---

## 10. Assumptions

1. Base64 upload ใช้ pattern เดียวกับ `CustomerDocuments.vue` (max 5 MB)
2. 1 รูปต่อ expense จนกว่า OQ-4 จะตัดสิน
3. ไม่มี approval phase 1 — status = pending เสมอ
4. expenses embed มาใน GET /trips/today + GET /trips/{id} (ไม่มี endpoint GET แยก)
5. RBAC ตาม role เดิม: OSR เห็น trip ตัวเอง; manager/admin เห็นทีม

---

## 11. Handoff Checklist สำหรับ Designer

- [ ] อ่าน `docs/osr-field-visit/03-UI-MOCKUPS.md` — ACTIVE TRIP CARD ปัจจุบัน
- [ ] ออกแบบ collapsible Expense Section ใน ACTIVE TRIP CARD (§5.1)
- [ ] ออกแบบ Expense Form Drawer (chip + amount + receipt)
- [ ] ออกแบบ End Trip Dialog ใหม่ที่มี expense summary (§5.4)
- [ ] ออกแบบ COMPLETED TRIP CARD ที่แสดง expense_total (§5.3)
- [ ] อัปเดต Bottom Sticky Bar ให้แสดง expense_total (§5.2)
- [ ] ออกแบบ Receipt Image Preview Dialog
- [ ] **mobile-first 390px — Expense Form เป็น bottom sheet**
- [ ] **รอ PO ตัดสิน OQ-1 และ OQ-2 ก่อนออกแบบ**
