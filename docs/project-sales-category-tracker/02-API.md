# Project Sales Category Tracker — API Specification

**Feature:** project-sales-category-tracker  
**Version:** 1.1 (อัปเดตให้ตรงกับ backend จริง — 10 ก.ค. 2569)  
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
type CategoryStatus = 'win' | 'draw' | 'lose'

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
  draw_count: number
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

// calcStatus: Win/Draw/Lose logic
function calcStatus(item: CategorySalesItemRaw): CategoryStatus {
  if (item.invoice_amount > 0)   return 'win'
  if (item.saleorder_amount > 0) return 'draw'
  return 'lose'
}

// calcSummary: คำนวณ KPI จาก normalized items
function calcSummary(items: CategorySalesItem[]): CategorySalesSummary {
  return {
    total_categories: items.length,
    win_count:   items.filter(c => c.status === 'win').length,
    draw_count:  items.filter(c => c.status === 'draw').length,
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
| 1 | `GET` | `/crm/v2/projects/{id}/category-sales-summary` | Matrix Win/Draw/Lose | `merchant.crm.read` |
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
| v1.1 | 10 ก.ค. 2569 | อัปเดตให้ตรงกับ backend จริง: `items` แทน `categories`, `saleorder_amount/remain` แทน `so_amount/remain`, `projectcode` แทน `project_code`, เพิ่ม normalization functions, PUT response `upserted` แทน `updated_count` |
