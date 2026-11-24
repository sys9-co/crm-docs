# Project Sales Category Tracker — API Specification

**Feature:** project-sales-category-tracker  
**Version:** 1.2 (เพิ่ม status `pending` + `expire_date`/`is_expired` — 24 พ.ย. 2569; backend ส่งมอบแล้ว CRM-1748)  
**BA/SA Author:** ทิพย์ (Claude BA/SA agent)  
**Status:** CONFIRMED (Postman collection ยืนยันแล้ว)

> **หมายเหตุ v1.1:** Backend ส่ง field ชื่อต่างจาก spec v1.0 ในหลายจุด และไม่ส่ง `status` / `summary` มาให้ — frontend ต้องคำนวณเองดูหัวข้อ 3.4

---

## 1. Base URL & Authentication

```
Base URL : /crm/{api_version}/...
Headers  :
  Authorization : Bearer {accessToken}
  X-Merchant-UID: {merchantUUID}
  Content-Type  : application/json
```

`{api_version}` ดึงจาก `config.public.api_version` — ปัจจุบัน = `v2`

---

## 2. Standard Response Shape

```json
// Success
{ "status": true, "message": "...", "data": { ... } }

// Error
{ "status": false, "message": "..." }
```

---

## 3. GET category-sales-summary

```http
GET /crm/v2/projects/{id}/category-sales-summary?group_level=1
```

### Path Parameters

| Parameter | Type | Required | คำอธิบาย |
|-----------|------|----------|----------|
| `id` | integer | Yes | Project ID |

### Query Parameters

| Parameter | Type | Required | Default | คำอธิบาย |
|-----------|------|----------|---------|----------|
| `group_level` | integer | No | `1` | 1=family, 2=department, 3=category, 4=subcat |

### Response 200 — Actual Backend Shape

```json
{
  "status": true,
  "message": "โหลดข้อมูลสถานะหมวดสินค้าสำเร็จ",
  "data": {
    "project_id": 1,
    "projectcode": "PRJ-2026-001",
    "group_level": 1,
    "items": [
      {
        "family": "IT",
        "department": "",
        "category": "",
        "subcat": "",
        "quotation_amount": 1500000.00,
        "quotation_remain": 800000.00,
        "saleorder_amount": 700000.00,
        "saleorder_remain": 200000.00,
        "invoice_amount": 500000.00,
        "lost_reason": "ราคาสูงกว่าคู่แข่ง"
      },
      {
        "family": "Network",
        "department": "",
        "category": "",
        "subcat": "",
        "quotation_amount": 500000.00,
        "quotation_remain": 500000.00,
        "saleorder_amount": 0.00,
        "saleorder_remain": 0.00,
        "invoice_amount": 0.00,
        "lost_reason": ""
      }
    ]
  }
}
```

### 3.1 Field Mapping (v1.0 spec → v1.1 actual)

| Field เดิม (spec) | Field จริง (backend) | หมายเหตุ |
|-------------------|---------------------|---------|
| `categories` | **`items`** | array key เปลี่ยน |
| `so_amount` | **`saleorder_amount`** | ชื่อเต็ม |
| `so_remain` | **`saleorder_remain`** | ชื่อเต็ม |
| `project_code` | **`projectcode`** | ไม่มี underscore |
| `status` | **ไม่มี** | frontend คำนวณเอง (ดู 3.4) |
| `summary` | **ไม่มี** | frontend คำนวณเอง (ดู 3.4) |
| `boq_amount` | **ไม่มี** | Phase 2 |
| `null` (unused fields) | **`""`** (empty string) | frontend normalize เป็น null |
| `lost_reason: null` | **`lost_reason: ""`** | frontend normalize |

### 3.2 TypeScript Types (ตาม backend จริง)

```typescript
// Raw shape จาก backend
interface CategorySalesItemRaw {
  family: string        // level 1 — "" ถ้าไม่มีค่า
  department: string    // level 2 — "" ถ้าไม่มีค่า
  category: string      // level 3 — "" ถ้าไม่มีค่า
  subcat: string        // level 4 — "" ถ้าไม่มีค่า

  quotation_amount: number
  quotation_remain: number
  saleorder_amount: number
  saleorder_remain: number
  invoice_amount: number

  lost_reason: string   // "" ถ้าไม่มี (ไม่ใช่ null)
}

interface CategorySalesResponseRaw {
  project_id: number
  projectcode: string
  group_level: number
  items: CategorySalesItemRaw[]
}

// Normalized shape สำหรับใช้ใน component (หลัง normalizeItem())
// v1.2: 'draw' ถูกแทนที่ด้วย 'pending' (รอการตัดสินใจ)
type CategoryStatus = 'win' | 'pending' | 'lose'

interface CategorySalesItem {
  family: string | null
  department: string | null
  category: string | null
  subcat: string | null

  quotation_amount: number
  quotation_remain: number
  saleorder_amount: number
  saleorder_remain: number
  invoice_amount: number

  lost_reason: string | null

  // computed by frontend:
  status: CategoryStatus
}

interface CategorySalesSummary {
  total_categories: number
  win_count: number
  pending_count: number
  lose_count: number
  invoice_total: number
}
```

### 3.3 Response Errors

```json
// 404
{ "status": false, "message": "ไม่พบโครงการ" }

// 403
{ "status": false, "message": "forbidden" }
```

### 3.4 Frontend Normalization (REQUIRED)

Backend ไม่ส่ง `status` และ `summary` — frontend ต้องคำนวณทุกครั้งหลัง GET:

```typescript
// normalizeItem: แปลง raw → normalized
function normalizeItem(raw: CategorySalesItemRaw): CategorySalesItem {
  return {
    family:     raw.family     || null,
    department: raw.department || null,
    category:   raw.category   || null,
    subcat:     raw.subcat     || null,
    quotation_amount: raw.quotation_amount,
    quotation_remain: raw.quotation_remain,
    saleorder_amount: raw.saleorder_amount,
    saleorder_remain: raw.saleorder_remain,
    invoice_amount:   raw.invoice_amount,
    lost_reason: raw.lost_reason || null,
    status: calcStatus(raw),
  }
}

// calcStatus: Win/Pending/Lose logic (v1.2)
// backend ส่ง item.status มาให้ (CRM-1748) — ใช้ค่าจาก backend เป็นหลัก
// fallback ด้านล่างใช้เฉพาะตอน backend ยังไม่ส่ง status (ไม่รู้วันหมดอายุ จึงประมาณจากยอดคงเหลือเท่านั้น)
function calcStatus(item: CategorySalesItemRaw & { status?: string }): CategoryStatus {
  if (item.status === 'win' || item.status === 'pending' || item.status === 'lose') return item.status
  if (item.invoice_amount > 0) return 'win'
  if (item.saleorder_amount > 0) return 'pending'   // เดิม 'draw'
  return 'lose'
}

// calcSummary: คำนวณ KPI จาก normalized items
function calcSummary(items: CategorySalesItem[]): CategorySalesSummary {
  return {
    total_categories: items.length,
    win_count:   items.filter(c => c.status === 'win').length,
    pending_count: items.filter(c => c.status === 'pending').length,
    lose_count:  items.filter(c => c.status === 'lose').length,
    invoice_total: items.reduce((sum, c) => sum + c.invoice_amount, 0),
  }
}

// Usage in component:
const loadSummary = async () => {
  is_load.value = true
  const res = await $callGet(
    `/crm/${config.public.api_version}/projects/${projectId}/category-sales-summary`
  )
  if (res?.status) {
    const rawItems: CategorySalesItemRaw[] = res.data.items
    items.value   = rawItems.map(normalizeItem)
    summary.value = calcSummary(items.value)
  } else {
    toast.error(res?.message || 'โหลดข้อมูลไม่สำเร็จ')
  }
  is_load.value = false
}
```

### 3.5 Status contract v1.2 — backend ส่งมอบแล้ว (CRM-1748)

> **Endpoint ที่ backend ระบุ:** `GET /crm/v1/projects/{project_id}/category-sales-summary?group_level={0-3}&from=&to=` — URL/params ไม่เปลี่ยน (backward compatible). ⚠️ backend เขียน `v1` แต่ frontend เรียกผ่าน `config.public.api_version` (ปัจจุบัน `v2`) — ต้องยืนยันกับ backend ว่าทั้งสอง version ใช้ได้
> **Response keys จริง:** `data.categories[]`, `so_amount`, `so_remain`, `project_code` (ตามโค้ด frontend ปัจจุบัน — ตาราง 3.1 ด้านบนเป็น shape ของ v1.1 เก่า)

**ฟิลด์ใหม่ใน `categories[]`:**

| Field | Type | คำอธิบาย |
|-------|------|----------|
| `status` | `'win' \| 'pending' \| 'lose'` | backend คำนวณ (เลิกใช้ `draw`) |
| `expire_date` | `string \| null` (`YYYY-MM-DD`) | วันหมดอายุล่าสุดของใบเสนอราคา/SO ในหมวด = `GREATEST(quotation.expiredate, saleorder.deliverydate)` |
| `is_expired` | `boolean` | `true` = หมดอายุแล้ว (`expire_date < วันนี้`) |

**`summary` เพิ่ม `pending_count`:** `{ total_categories, win_count, draw_count (เป็น 0 เสมอ, เก็บไว้ backward compat), pending_count, lose_count, invoice_total }` — frontend เลิกใช้ `draw_count` และใช้ `pending_count`

**กฎสถานะ (ต่อหมวด):**

| status | เงื่อนไข |
|--------|---------|
| `win` | มี invoice |
| `pending` | ไม่มี invoice แต่มีใบเสนอราคาหรือ SO ที่ยังไม่หมดอายุ (`is_expired = false`) |
| `lose` | หมดอายุแล้วไม่มี invoice หรือไม่มีใบเสนอราคา/SO เลย |

**ข้อสังเกต / ข้อตกลง:**
- ใช้ **วันหมดอายุล่าสุด** ของทั้งหมวด → หมวดที่มีทั้งเอกสารหมดอายุและไม่หมดอายุ จึงเป็น `pending` (ตรงกับที่ user ยืนยัน)
- **วันหมดอายุของ SO = `crm_project_saleorder_history.deliverydate`** (backend ยืนยัน; ปิด OQ เรื่อง field ของ SO)
- backend ไม่ได้ส่ง `quotation_active_amount` / `so_active_amount` ตามที่ร่างไว้ — ใช้ `expire_date` + `is_expired` แทน; เงื่อนไข `remainamount > 0` และ `iscancel` ที่ร่างไว้ในสเปกฝั่ง frontend ขึ้นกับ implementation ของ backend (ไม่ได้ระบุในรายการส่งมอบ)
- ตัวกรอง `from`/`to` ไม่เปลี่ยนนิยามหมดอายุ (เทียบกับวันนี้)

**ตัวอย่าง item:**
```json
{ "family": "Network", "department": null, "category": null, "subcat": null,
  "boq_amount": null, "quotation_amount": 500000.00, "so_amount": 0.00, "so_remain": 0.00,
  "invoice_amount": 0.00, "status": "pending", "expire_date": "2026-12-31", "is_expired": false,
  "lost_reason": null, "lost_reason_updated_at": null, "lost_reason_updated_by": null }
```

**TypeScript (frontend ต้องอัปเดต):**
```typescript
// CategorySalesItem เพิ่ม
expire_date?: string | null
is_expired: boolean
// CategorySalesSummary เพิ่ม
pending_count: number
```

**UI ที่ต้องเพิ่ม:** column/indicator แสดง `expire_date` + badge "หมดอายุ" เมื่อ `is_expired === true`; badge/KPI/filter `pending` (แนะนำสีฟ้า/น้ำเงิน)

---

## 4. PUT category-lost-reasons

```http
PUT /crm/v2/projects/{id}/category-lost-reasons
```

### Request Body

```json
{
  "reasons": [
    {
      "family": "IT",
      "department": "",
      "category": "",
      "subcat": "",
      "lost_reason": "ราคาสูงกว่าคู่แข่ง"
    }
  ]
}
```

> **หมายเหตุ:** Backend ใช้ `""` (empty string) ไม่ใช่ `null` สำหรับ field ที่ไม่ใช้ — ส่ง `""` ไปตาม backend
>
> **⚠️ Known issue (CRM-1749):** user รายงานว่าเหตุผลที่บันทึกแล้วหายหลัง reload — สงสัยว่าตารางประวัติเก็บค่าว่างเป็น `NULL` แต่ PUT เก็บ `""` ทำให้ JOIN (`IS NOT DISTINCT FROM`) ไม่เจอ ข้อกำหนด: backend ต้อง normalize `NULL` ↔ `""` ให้เป็นค่าเดียวกันทั้งตอน upsert และตอน JOIN ใน GET; และ GET ต้องคืน `lost_reason` ครบแม้ใช้ตัวกรอง `from`/`to`

### Request Validation

| Field | Type | Required | Constraint |
|-------|------|----------|-----------|
| `reasons` | array | Yes | 1–100 items |
| `reasons[].family` | string | Yes | ชื่อ category level 1 |
| `reasons[].department` | string | No | `""` ถ้า group_level < 2 |
| `reasons[].category` | string | No | `""` ถ้า group_level < 3 |
| `reasons[].subcat` | string | No | `""` ถ้า group_level < 4 |
| `reasons[].lost_reason` | string | Yes | max 500 chars; `""` = clear |

### Response 200

```json
{
  "status": true,
  "message": "บันทึก lost reason สำเร็จ",
  "data": {
    "upserted": 2
  }
}
```

### Response Errors

```json
// 400
{ "status": false, "message": "missing required field: reasons" }

// 403
{ "status": false, "message": "forbidden" }
```

### TypeScript Types

```typescript
interface LostReasonItem {
  family: string      // ใช้ "" ไม่ใช่ null
  department: string  // "" ถ้าไม่ใช้
  category: string    // "" ถ้าไม่ใช้
  subcat: string      // "" ถ้าไม่ใช้
  lost_reason: string // "" = clear
}

interface UpdateLostReasonsPayload {
  reasons: LostReasonItem[]
}

interface UpdateLostReasonsResponse {
  upserted: number
}
```

### Frontend Usage

```typescript
const saveLostReason = async (item: CategorySalesItem, reason: string) => {
  const res = await $callPut(
    `/crm/${config.public.api_version}/projects/${projectId}/category-lost-reasons`,
    {
      reasons: [{
        family:      item.family     ?? '',
        department:  item.department ?? '',
        category:    item.category   ?? '',
        subcat:      item.subcat     ?? '',
        lost_reason: reason,   // "" = clear
      }]
    }
  )
  if (res?.status) {
    toast.success('บันทึกเหตุผลสำเร็จ')
    item.lost_reason = reason || null  // optimistic update
  } else {
    toast.error(res?.message || 'บันทึกไม่สำเร็จ')
  }
}
```

---

## 5. Endpoint Summary

| # | Method | Path | วัตถุประสงค์ | Permission |
|---|--------|------|------------|------------|
| 1 | `GET` | `/crm/v2/projects/{id}/category-sales-summary` | Matrix Win/Pending/Lose | `merchant.crm.read` |
| 2 | `PUT` | `/crm/v2/projects/{id}/category-lost-reasons` | Bulk upsert lost reasons | `merchant.crm.manage` |

---

## 6. Error Reference

| HTTP | message | สาเหตุ |
|------|---------|-------|
| 400 | `missing required field: reasons` | PUT body ไม่มี reasons array |
| 403 | `forbidden` | ไม่มี permission (→ toast only) |
| 401 | (standard) | Token หมดอายุ (→ redirect login) |

---

## 7. Changelog

| Version | วันที่ | รายการ |
|---------|-------|-------|
| v1.0 | 10 ก.ค. 2569 | Initial spec |
| v1.2 | 24 พ.ย. 2569 | status `draw` → `pending` (รอการตัดสินใจ) ตามวันหมดอายุใบเสนอราคา/SO (section 3.5, CRM-1748); บันทึก known issue lost_reason (CRM-1749) |
| v1.1 | 10 ก.ค. 2569 | อัปเดตให้ตรงกับ backend จริง: `items` แทน `categories`, `saleorder_amount/remain` แทน `so_amount/remain`, `projectcode` แทน `project_code`, เพิ่ม normalization functions, PUT response `upserted` แทน `updated_count` |
