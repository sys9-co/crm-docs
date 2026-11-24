# Project Sales Category Tracker — Project Spec

**Feature:** project-sales-category-tracker  
**Version:** 1.1 (MVP + กฎสถานะใหม่ Win/Pending/Lose)  
**BA/SA Author:** ทิพย์ (Claude BA/SA agent)  
**Date:** 10 กรกฎาคม 2569 (แก้ไขล่าสุด 24 พฤศจิกายน 2569)  
**Status:** DRAFT — รอ PM อนุมัติ; backend กฎสถานะ v1.1 ส่งมอบแล้ว (CRM-1748) รอ frontend อัปเดต

> **v1.1 (24 พ.ย. 2569):** user แจ้งว่าหมวดที่ยังมีใบเสนอราคา/ใบสั่งขาย (SO) ที่**ยังไม่หมดอายุ** ไม่ควรแสดงเป็น "แพ้" — เปลี่ยนสถานะ **Draw ("รอติดตาม") → Pending ("รอการตัดสินใจ")** และนิยามใหม่ตามวันหมดอายุเอกสาร ดู section 5 · Plane: CRM-1748 (backend ส่ง status `pending`), CRM-1749 (bug เหตุผลที่แพ้ไม่บันทึก)

---

## 1. ภาพรวม Feature

ปัจจุบันทีมขายใน SYS9 CRM บันทึกรายการ BOQ (Bill of Quantities) สำหรับแต่ละโครงการ และผูก BOQ item แต่ละรายการเข้ากับ product category ได้แล้ว (endpoint: `GET /crm/{v}/product-categories/search`) อย่างไรก็ตาม ยังไม่มีวิดเจ็ตสรุปว่า **category ไหนชนะหรือแพ้การขาย** เมื่อเทียบกับเอกสารขายจริงจาก schema "merchant"

Feature นี้เพิ่ม **Tab ใหม่ชื่อ "สถานะหมวดสินค้า"** ใน Project Detail Page (`/projects/{id}?tab=category-sales`) แสดงตาราง matrix สรุป:

1. ยอดเงินรวมต่อ product category จากเอกสาร merchant (ใบเสนอราคา, ใบสั่งขาย, บิลขาย, ใบลดหนี้)
2. สถานะ **Win / Pending / Lose** ตาม business logic ที่กำหนด (Pending = รอการตัดสินใจ — ยังมีใบเสนอราคา/SO ที่ไม่หมดอายุ)
3. รองรับการบันทึก **lost reason** แบบ inline edit สำหรับ category ที่มีสถานะ Lose

---

## 2. Assumptions ที่ใช้ในการออกแบบ

| # | Assumption | สิ่งที่ต้องยืนยัน |
|---|-----------|-----------------|
| A1 | merchant schema ไม่มี `project_id` ตรงๆ — เชื่อม project ผ่าน `crm.projects.code` (เช่น "PJ2024-0018") โดย sales documents ใน merchant มี field ชื่อ `project_ref` หรือ `reference_no` ที่ตรงกัน | ยืนยันกับ backend team ว่า field ชื่ออะไร |
| A2 | Product category ใน CRM มี 5 ระดับ (level 1–5 ตาม `ProductCategorySearchItem.level`); matrix สรุปที่ **level 1** เป็นค่า default (เรียกว่า "Department" หรือ "ทีมจัดซื้อ") | ยืนยัน PM ว่า CAT1–CAT5 คือ 5 ระดับของ tree หรือ 5 ทีมแยก |
| A3 | credit_note ลดยอด invoice สุทธิ: `net_invoice_amount = invoice_amount - credit_note_amount` | ยืนยัน business rule กับ finance team |
| A4 | lost reason = free text สูงสุด 500 chars, ไม่มี predefined dropdown ใน MVP | ยืนยัน PM |
| A5 | backend query ข้อมูล merchant ผ่าน cross-schema JOIN หรือ service call — frontend ไม่ query merchant DB โดยตรง | Architecture decision |
| A6 | สิทธิ์แก้ไข lost reason: role `admin` และ `manage` เท่านั้น; `reader` ดูได้อย่างเดียว | อิง role ปัจจุบัน |

---

## 3. User Stories

### US-01: ดูสรุปสถานะ category ของโครงการ

**As** ผู้จัดการฝ่ายขาย  
**I want** เห็น matrix สรุปยอดขายและสถานะ Win/Pending/Lose ต่อ product category ในโครงการ  
**So that** ประเมินได้ว่า category ไหนที่ทีมชนะและแพ้การขาย เพื่อวางแผนยุทธศาสตร์ต่อไป

**AC-01.1 — เข้าถึง Tab สถานะหมวดสินค้า**
```
Given: ผู้ใช้อยู่ที่ /projects/{id}
When:  ผู้ใช้คลิก tab "สถานะหมวดสินค้า"
Then:  ระบบแสดงตาราง matrix ที่โหลดข้อมูลจาก GET /crm/v2/projects/{id}/category-sales-summary
  And: แสดง LoadOverlay ระหว่างโหลด
  And: ถ้า API คืน status: false → แสดง empty state "ไม่พบข้อมูล"
```

**AC-01.2 — แสดงตาราง matrix**
```
Given: API คืนข้อมูล categories และยอดเงิน
When:  ข้อมูลโหลดสำเร็จ
Then:  ตารางแสดง columns: [หมวดสินค้า | ใบเสนอราคา | ใบสั่งขาย | บิลขาย (สุทธิ) | สถานะ | เหตุผลที่แพ้]
  And: แต่ละ row = 1 product category (กลุ่มตาม level-1 Department)
  And: ยอดเงินทุกค่าแสดงรูปแบบ "1,234,567.00 ฿"
```

**AC-01.3 — Color coding ตามสถานะ**
```
Given: ข้อมูล category แต่ละแถว
When:  คำนวณสถานะแล้ว
Then:  Win  → badge สีเขียว (#16a34a) ข้อความ "ชนะ"
  And: Pending → badge สีเหลือง (#ca8a04) ข้อความ "รอการตัดสินใจ"
  And: Lose → badge สีแดง (#dc2626)   ข้อความ "แพ้"
```

**AC-01.5 — Pending vs Lose ตามวันหมดอายุ (v1.1)**
```
Given: หมวดสินค้าไม่มีบิลขาย
When:  หมวดนั้นมีใบเสนอราคา หรือ SO อย่างน้อย 1 ใบที่ยังไม่หมดอายุ
Then:  แสดง badge "รอการตัดสินใจ" (ไม่แสดง "แพ้")
When:  ใบเสนอราคาและ SO ทุกใบหมดอายุแล้ว หรือไม่มียอดขายเลย
Then:  แสดง badge "แพ้" และให้บันทึกเหตุผลที่แพ้ได้
  And: เมื่อเอกสารหมดอายุ สถานะเปลี่ยนจาก Pending → Lose เองตอนโหลดข้อมูลครั้งถัดไป (ไม่ต้องมี job)
```

**AC-01.4 — Empty state**
```
Given: โครงการยังไม่มี BOQ item ที่ผูก product_category_id
When:  API คืน data.categories: []
Then:  แสดง "ยังไม่มีข้อมูลหมวดสินค้า กรุณาเพิ่มรายการ BOQ พร้อมระบุหมวดสินค้าก่อน"
  And: มีปุ่ม "ไปที่ BOQ" ลิงก์ไป ?tab=boq
```

---

### US-02: บันทึกเหตุผลที่แพ้ (Lost Reason)

**AC-02.1 — แก้ไข inline**
```
Given: category มีสถานะ Lose + ผู้ใช้มี role admin/manage
  (v1.1: สถานะ Pending ไม่ให้แก้ — ยังไม่ถือว่าแพ้)
When:  คลิกที่ cell "เหตุผลที่แพ้"
Then:  cell เปลี่ยนเป็น textarea inline (max 500 chars) + ปุ่ม [บันทึก] [ยกเลิก]
```

**AC-02.2 — บันทึกสำเร็จ**
```
Given: ผู้ใช้พิมพ์เหตุผลแล้วคลิก [บันทึก]
When:  PUT /crm/v2/projects/{id}/category-lost-reasons สำเร็จ
Then:  cell แสดง text ที่บันทึกแบบ read-only + toast สีเขียว "บันทึกเหตุผลสำเร็จ"
  And: ไม่ต้อง refresh หน้า (optimistic update)
```

**AC-02.3 — ยกเลิก**
```
Given: ผู้ใช้เปิด textarea แล้วคลิก [ยกเลิก] หรือกด Escape
Then:  cell กลับไปแสดง text เดิม ไม่มี API call
```

**AC-02.4 — สิทธิ์ Reader**
```
Given: ผู้ใช้มี role reader
Then:  column "เหตุผลที่แพ้" แสดง read-only เท่านั้น ไม่มี click-to-edit
```

**AC-02.5 — Win category**
```
Given: category มีสถานะ Win
Then:  column "เหตุผลที่แพ้" แสดง "—" และไม่ clickable
```

**AC-02.6 — Pending category (v1.1)**
```
Given: category มีสถานะ Pending (รอการตัดสินใจ)
Then:  column "เหตุผลที่แพ้" แสดงข้อความที่เคยบันทึกไว้แบบ read-only ถ้ามี มิฉะนั้นแสดง "—" และไม่ clickable
```

**AC-02.7 — เหตุผลต้องคงอยู่หลัง reload (CRM-1749)**
```
Given: ผู้ใช้บันทึกเหตุผลสำเร็จ (PUT คืน status: true)
When:  refresh หน้า หรือกดรีเฟรช หรือเปลี่ยนตัวกรองวันที่
Then:  GET category-sales-summary ต้องคืน lost_reason เดิมตรงแถวเดิมเสมอ
  And: backend ต้องถือ NULL กับ "" ของ department/category/subcat เป็นค่าเดียวกัน (ทั้งตอน upsert และ JOIN)
```

---

### US-03: กรองและค้นหา

**AC-03.1** Filter ตามสถานะ (Win/Pending/Lose/ทั้งหมด; URL query `status=win|pending|lose`) → แสดง "N จาก M หมวด"  
**AC-03.2** Search ชื่อ category แบบ client-side (case-insensitive)

---

### US-04: KPI Summary

**AC-04.1** — แสดง KPI 4 cards บนตาราง: [Win N หมวด] [Pending N หมวด] [Lose N หมวด] [ยอดบิลสุทธิ X ฿]

---

### US-05: Manual Refresh

**AC-05.1** — ปุ่ม [รีเฟรช] เรียก GET API อีกครั้ง + แสดง loading state

---

### US-06: BOQ vs ยอดขาย *(Phase 2)*

**As** ผู้จัดการโครงการ  
**I want** เห็นยอด BOQ (ประมาณการภายใน) เทียบกับยอดขายจริง ต่อ category ในหน้าเดียวกัน  
**So that** วัดได้ทันทีว่า category ไหนที่ทีมขายได้ตามเป้า BOQ

**AC-06.1 — Column BOQ ในตาราง**
```
Given: Phase 2 enabled
When:  ผู้ใช้เปิด tab สถานะหมวดสินค้า
Then:  ตารางมี column "BOQ" แสดง SUM(boq_items.total) per family
  And: แสดงก่อน column ใบเสนอราคา
  And: BOQ = 0 หรือ NULL → แสดง "—"
```

**AC-06.2 — BOQ Mapping Logic**
```
crm.boq_items.product_category_fullpath = "ระบบไฟฟ้า > ไฟฟ้าแรงดันต่ำ > สวิตช์"
  → parse level-1 (split " > " แล้วเอาตัวแรก) = "ระบบไฟฟ้า"
  → match กับ family ใน history tables
  → SUM(total) ของทุก boq_items ที่ level-1 = family นั้น
```

**AC-06.3 — BOQ ที่ไม่มี category**
```
Given: boq_item ที่ product_category_id = NULL
Then:  จัดอยู่ใน group "(ไม่ระบุหมวด)" ร่วมกับ history ที่ family = NULL
```

---

## 4. Data Model

### ตารางที่มีอยู่แล้ว (ใช้แต่ไม่แก้ไข)

| Table | Schema | Column ที่เกี่ยวข้อง |
|-------|--------|---------------------|
| `projects` | crm | `id`, `code`, `merchant_uid` |
| `boq_items` | crm | `id`, `project_id`, `product_category_id`, `total` |
| `product_categories` | crm | `id`, `name`, `parent_id`, `level`, `full_path` |
| `quotation_lines` | merchant | `id`, `quotation_id`, `product_category_id`, `amount` |
| `sales_order_lines` | merchant | `id`, `sales_order_id`, `product_category_id`, `amount` |
| `invoice_lines` | merchant | `id`, `invoice_id`, `product_category_id`, `amount` |
| `credit_note_lines` | merchant | `id`, `credit_note_id`, `product_category_id`, `amount` |

### ตารางใหม่

| Table | Schema | วัตถุประสงค์ |
|-------|--------|------------|
| `project_category_lost_reasons` | crm | เก็บ lost reason ต่อ project + category |

---

## 5. Business Logic: Win / Pending / Lose (v1.1)

ประเมินต่อ 1 หมวดสินค้า ตามลำดับ (ข้อแรกที่ตรงชนะ):

| ลำดับ | สถานะ | เงื่อนไข | สี | ข้อความ |
|------|-------|---------|-----|--------|
| 1 | **Win** | `net_invoice_amount > 0` | #16a34a เขียว | "ชนะ" |
| 2 | **Pending** | ไม่มีบิล AND มีใบเสนอราคา **หรือ** SO อย่างน้อย 1 ใบที่ "ยังไม่หมดอายุ" (นิยามด้านล่าง) | #ca8a04 เหลือง | "รอการตัดสินใจ" |
| 3 | **Lose** | นอกนั้น (ใบเสนอราคาและ SO ทุกใบหมดอายุ หรือไม่มียอดขายเลย) | #dc2626 แดง | "แพ้" |

**เอกสาร "ยังไม่หมดอายุ" (active)** — ใช้ logic เดียวกันทั้งใบเสนอราคาและ SO:
```
iscancel = 0 OR NULL
AND expiredate >= วันนี้            (วันนี้ = วันที่ตอน query, วันหมดอายุนับรวมวันนั้น)
AND remainamount > 0               (ยังมียอดคงเหลือ ไม่ได้ออกเอกสารถัดไปครบแล้ว)
```

กติกาเพิ่มเติม (user ยืนยัน 24 พ.ย. 2569):
- หมวดที่มีทั้งเอกสารหมดอายุและไม่หมดอายุ → ถือเป็น **Pending**
- SO มีวันหมดอายุเช่นเดียวกับใบเสนอราคา ใช้ logic เดียวกัน
- สถานะ "Draw / รอติดตาม" เดิม (มี SO แต่ยังไม่มีบิล) ถูกยกเลิก — รวมเข้า Pending ถ้า SO ยังไม่หมดอายุ ถ้า SO หมดอายุและไม่มีบิล = Lose
- ใบเสนอราคาที่ออก SO ครบแล้ว (`remainamount = 0`) ไม่นับเป็น active; ตัดสินจาก SO ต่อ *(เจตนาตอนร่างสเปก — backend ที่ส่งมอบใช้ `expire_date` ล่าสุดของหมวดและไม่ได้ระบุเรื่อง `remainamount`; ให้ QA ตรวจกรณีนี้กับ backend)*
- ไม่มียอดขายและไม่มีเอกสารเลย → Lose เหมือนเดิม

**ผู้คำนวณ:** backend ส่ง `status: 'win' | 'pending' | 'lose'` พร้อม `expire_date` / `is_expired` ต่อ item (CRM-1748 — ส่งมอบแล้ว) — frontend ไม่คำนวณเอง (มี fallback เดิมเฉพาะกรณี backend ไม่ส่ง status)

**Implementation จริงของ backend (CRM-1748):** `expire_date = GREATEST(quotation.expiredate, saleorder.deliverydate)` ต่อหมวด, `is_expired = expire_date < วันนี้`; `pending` = ไม่มีบิลและยังไม่หมดอายุ. **วันหมดอายุของ SO = `deliverydate`** (ปิด OQ แล้ว). รายละเอียดดู `02-API.md` section 3.5

**UI เพิ่ม:** column/indicator `expire_date` + badge "หมดอายุ" เมื่อ `is_expired` (ดู 04-UI-MOCKUPS)

```
net_invoice_amount = invoice_amount - credit_note_amount
```

Product category ที่ level > 1 → หา ancestor level 1 แล้ว group ร่วมกัน  
BOQ item ที่ไม่มี `product_category_id` → จัดอยู่ใน "(ไม่ระบุหมวด)"

---

## 6. UI Behavior

### Layout

```
[Tab: สถานะหมวดสินค้า]
──────────────────────────────────────────────────────
 [Win 3]  [Pending 2]  [Lose 4]  [ยอดบิลสุทธิ 1,234,567 ฿]
──────────────────────────────────────────────────────
 [🔍 ค้นหา...]  [Filter: ทั้งหมด ▼]  [🔄 รีเฟรช]
──────────────────────────────────────────────────────
 Phase 1 (MVP):
 ┌──────────────┬────────────┬────────────┬────────────┬────────┬──────────────┐
 │ หมวดสินค้า   │ ใบเสนอราคา │ ใบสั่งขาย  │ บิลสุทธิ   │ สถานะ  │ เหตุผลที่แพ้ │
 ├──────────────┼────────────┼────────────┼────────────┼────────┼──────────────┤
 │ ห้องครัว     │ 500,000    │ 490,000    │ 480,000    │ [ชนะ]  │ —            │
 │ ห้องน้ำ      │ 200,000    │ 200,000    │ 0          │[รอตัดสินใจ]│ —        │
 │ ระบบไฟฟ้า    │ 300,000    │ 0          │ 0          │ [แพ้]  │ ราคาสูงกว่า  │
 └──────────────┴────────────┴────────────┴────────────┴────────┴──────────────┘

 Phase 2 (เพิ่ม BOQ column):
 ┌──────────────┬──────────┬────────────┬────────────┬────────────┬────────┬──────────────┐
 │ หมวดสินค้า   │ BOQ      │ ใบเสนอราคา │ ใบสั่งขาย  │ บิลสุทธิ   │ สถานะ  │ เหตุผลที่แพ้ │
 ├──────────────┼──────────┼────────────┼────────────┼────────────┼────────┼──────────────┤
 │ ห้องครัว     │ 550,000  │ 500,000    │ 490,000    │ 480,000    │ [ชนะ]  │ —            │
 │ ห้องน้ำ      │ 180,000  │ 200,000    │ 200,000    │ 0          │[รอตัดสินใจ]│ —        │
 │ ระบบไฟฟ้า    │ 400,000  │ 300,000    │ 0          │ 0          │ [แพ้]  │ ราคาสูงกว่า  │
 └──────────────┴──────────┴────────────┴────────────┴────────────┴────────┴──────────────┘
```

### Inline Edit Lost Reason
- คลิก cell Lose → `<textarea>` inline พร้อม char counter "NN / 500"
- Ctrl+Enter หรือ [บันทึก] → PUT API
- Escape หรือ [ยกเลิก] → คืนค่าเดิม
- Win → "—" ไม่ clickable
- Pending → read-only (แสดงข้อความเดิมถ้ามี) ไม่ clickable

### Mobile (< 768px)
- ตาราง: horizontal scroll
- KPI cards: 2×2 grid

---

## 7. Scope MVP

### ใน Scope
- Tab "สถานะหมวดสินค้า" ใน Project Detail
- Matrix ต่อ category level 1
- Win/Pending/Lose badge + color
- KPI 4 cards
- Inline edit lost reason (free text)
- Filter ตาม status + client-side search
- Manual refresh

### นอก Scope (MVP)
- Export CSV/PDF
- Drill-down level 2–5
- Chart/Graph
- Predefined lost reason dropdown
- Historical status tracking
- Email notification
- **BOQ column** (→ Phase 2)
- **Credit Note** (→ Phase 2)

### Phase 2 Scope
| Item | รายละเอียด |
|------|-----------|
| BOQ column | SUM(boq_items.total) GROUP BY level-1 family; mapping ผ่าน `product_category_fullpath` |
| Credit Note | เพิ่ม `crm_project_creditnote_history`; ปรับ Win/Pending/Lose logic ใหม่ |
| Drill-down | กด expand per row → แสดง level 2–4 |

---

## 8. E2E Test Scenarios

| Test ID | Scenario |
|---------|----------|
| E2E-CAT-01 | Tab "สถานะหมวดสินค้า" แสดง KPI cards |
| E2E-CAT-02 | Win badge สีเขียว "ชนะ" |
| E2E-CAT-03 | Pending badge สีเหลือง "รอการตัดสินใจ" (v1.1; เดิม Draw "รอติดตาม") |
| E2E-CAT-04 | Lose badge สีแดง "แพ้" |
| E2E-CAT-05 | manage role: คลิก Lose → textarea → บันทึก → PUT API |
| E2E-CAT-13 | v1.1: status `pending` จาก API → badge "รอการตัดสินใจ", cell เหตุผลไม่ clickable |
| E2E-CAT-14 | v1.1: Filter "รอการตัดสินใจ" → เฉพาะ row pending; URL `status=pending` restore ได้ |
| E2E-CAT-15 | CRM-1749: บันทึกเหตุผล → reload → GET คืน lost_reason เดิม (ต้องรอ backend แก้) |
| E2E-CAT-06 | ยกเลิก inline edit → ไม่เรียก API |
| E2E-CAT-07 | reader role: ไม่สามารถ click-to-edit |
| E2E-CAT-08 | Filter "Lose" → เฉพาะ row Lose |
| E2E-CAT-09 | Search "ครัว" → กรอง row ที่มีคำนั้น |
| E2E-CAT-10 | ไม่มี BOQ category → empty state + ปุ่ม "ไปที่ BOQ" |
| E2E-CAT-11 | ปุ่ม [รีเฟรช] → เรียก GET API ใหม่ |
| E2E-CAT-12 | API error → empty state ไม่ crash |

---

## 9. Open Questions

| OQ | คำถาม | Priority | ถามใคร |
|----|--------|----------|--------|
| OQ-01 | merchant schema link project ผ่าน field ชื่ออะไร? | ✅ RESOLVED | `projectcode` = `crm.projects.code` |
| OQ-02 | CAT1–CAT5 = 5 ระดับ tree หรือ 5 ทีมแยก? | ✅ RESOLVED | text 4 ระดับ family/department/category/subcat |
| OQ-03 | เอกสาร `iscancel` นับยอดไหม? | ✅ RESOLVED | filter `iscancel = 0 OR NULL` |
| OQ-04 | Lost reason: dropdown หรือ free text? | ✅ RESOLVED | free text 500 chars MVP |
| OQ-05 | สิทธิ์บันทึก lost reason | ✅ RESOLVED | admin + manage เท่านั้น |
| OQ-06 | BOQ item ไม่มี category → แสดงอย่างไร? | ✅ RESOLVED | จัดใน "(ไม่ระบุหมวด)"; Phase 2 |
| OQ-07 | Credit Note อยู่ที่ไหน? | ✅ RESOLVED | Phase 2 — table แยก |
| OQ-08 | ต้องการ drill-down level 2–5? | ✅ RESOLVED | Phase 2 |
| OQ-09 | BOQ mapping Phase 2: parse `product_category_fullpath` level-1 แล้ว match กับ `family` ใน history tables | ✅ CONFIRMED | ดู US-06 |

---

## 10. Proposed Plane Cards

```
Phase 1 (MVP):
[FEATURE] Project Sales Category Tracker — Phase 1
  ├── [TASK] BA/SA: spec (✅ DONE)
  ├── [TASK] Design: UI mockup CategorySalesView + inline lost reason editor
  ├── [TASK] Backend: 2 endpoints + migration project_category_lost_reasons (label: crm-backend)
  ├── [TASK] Coder: CategorySalesView.vue + tab integration
  └── [TASK] QA: E2E tests E2E-CAT-01 ถึง E2E-CAT-12

Phase 2 (หลัง Phase 1 stable):
[FEATURE] Project Sales Category Tracker — Phase 2
  ├── [TASK] Backend: BOQ column — JOIN boq_items + traverse product_categories → level-1 → SUM per family
  ├── [TASK] Backend: Credit Note — crm_project_creditnote_history + ปรับ Win/Pending/Lose
  ├── [TASK] Coder: เพิ่ม column BOQ + Drill-down level 2–4
  └── [TASK] QA: E2E-CAT-16 ถึง E2E-CAT-XX

v1.1 (แยกการ์ด):
  ├── CRM-1748 [FEATURE][API] backend ส่ง status pending ตามวันหมดอายุเอกสาร (crm-backend)
  ├── CRM-1749 [BUG][API] เหตุผลที่แพ้ไม่ถูกบันทึก/ไม่ถูกส่งกลับ (crm-backend)
  └── [TASK] Coder (หลัง CRM-1748): badge/KPI/filter สถานะ pending + แก้ e2e
```

---

## 11. Handoff → Designer Agent

- อ่าน section 6 (UI Behavior) ก่อน
- Badge colors: Win=#16a34a, Pending=#ca8a04, Lose=#dc2626
- Mockup path: `docs/features/project-sales-category-tracker/03-UI-MOCKUPS.md`
- ใช้ design system เดิม (shadcn-vue + Tailwind + lucide-vue-next)
