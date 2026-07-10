# Project Sales Category Tracker — API Specification

**Feature:** project-sales-category-tracker  
**Version:** 1.0 (MVP)  
**BA/SA Author:** ทิพย์ (Claude BA/SA agent)  
**Date:** 10 กรกฎาคม 2569  
**Status:** DRAFT

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
{ "status": false, "message": "...", "error_code": "MACHINE_CODE" }
```

---

## 3. GET category-sales-summary

```http
GET /crm/v2/projects/{id}/category-sales-summary
```

### Path Parameters

| Parameter | Type | Required | คำอธิบาย |
|-----------|------|----------|----------|
| `id` | integer | Yes | Project ID |

### Query Parameters

| Parameter | Type | Required | Default | คำอธิบาย |
|-----------|------|----------|---------|----------|
| `group_level` | integer | No | `1` | ระดับ category ที่ใช้ group (1–5) |

### Response 200

```json
{
  "status": true,
  "message": "โหลดข้อมูลสถานะหมวดสินค้าสำเร็จ",
  "data": {
    "project_id": 3150,
    "project_code": "PJ2024-0018",
    "group_level": 1,
    "summary": {
      "total_categories": 3,
      "win_count": 1,
      "draw_count": 1,
      "lose_count": 1,
      "invoice_total": 480000.00
    },
    "categories": [
      {
        "family": "ห้องครัว",
        "department": null,
        "category": null,
        "subcat": null,
        "boq_amount": null,
        "quotation_amount": 500000.00,
        "so_amount": 490000.00,
        "so_remain": 10000.00,
        "invoice_amount": 480000.00,
        "status": "win",
        "lost_reason": null,
        "lost_reason_updated_at": null,
        "lost_reason_updated_by": null
      },
      {
        "family": "ระบบประปา",
        "department": null,
        "category": null,
        "subcat": null,
        "quotation_amount": 200000.00,
        "so_amount": 200000.00,
        "so_remain": 200000.00,
        "invoice_amount": 0.00,
        "status": "draw",
        "lost_reason": "ลูกค้าขอ hold ไปก่อน รอ Q4",
        "lost_reason_updated_at": "2026-07-08T10:30:00.000+07:00",
        "lost_reason_updated_by": "สมชาย ใจดี"
      },
      {
        "family": "ระบบไฟฟ้า",
        "department": null,
        "category": null,
        "subcat": null,
        "quotation_amount": 300000.00,
        "so_amount": 0.00,
        "so_remain": 0.00,
        "invoice_amount": 0.00,
        "status": "lose",
        "lost_reason": "ราคาสูงกว่าคู่แข่ง 15%",
        "lost_reason_updated_at": "2026-07-09T14:00:00.000+07:00",
        "lost_reason_updated_by": "วิภา มั่นคง"
      }
    ]
  }
}
```

> **หมายเหตุ:** เมื่อ `group_level=1` — `department`, `category`, `subcat` จะเป็น `null` เสมอ  
> เมื่อ `group_level=4` — ทุก field จะมีค่าตามข้อมูลจริง

### Response Errors

```json
// 404
{ "status": false, "message": "ไม่พบโครงการ", "error_code": "PROJECT_NOT_FOUND" }

// 403
{ "status": false, "message": "ไม่มีสิทธิ์", "error_code": "FORBIDDEN" }
```

### TypeScript Types

```typescript
type CategorySalesStatus = 'win' | 'draw' | 'lose'

interface CategorySalesItem {
  // Category path (text-based, denormalized จาก history tables)
  family: string | null      // Level 1
  department: string | null  // Level 2
  category: string | null    // Level 3
  subcat: string | null      // Level 4

  // ยอดเงินแต่ละประเภท
  boq_amount: number | null  // [Phase 2] SUM(boq_items.total) per level-1 family; null ใน Phase 1
  quotation_amount: number   // SUM จาก crm_project_quotation_history
  so_amount: number          // SUM จาก crm_project_saleorder_history
  so_remain: number          // SUM(remainamount) — ยังไม่บิล
  invoice_amount: number     // SUM จาก crm_project_invoice_history

  // Win/Draw/Lose (คำนวณจาก backend)
  status: CategorySalesStatus

  // Lost reason (จาก project_category_lost_reasons)
  lost_reason: string | null
  lost_reason_updated_at: string | null  // ISO 8601
  lost_reason_updated_by: string | null  // ชื่อ user
}

interface CategorySalesSummary {
  total_categories: number
  win_count: number
  draw_count: number
  lose_count: number
  invoice_total: number  // SUM invoice_amount ทุก category
}

interface CategorySalesResponse {
  project_id: number
  project_code: string   // = projectcode ใน history tables
  group_level: number
  summary: CategorySalesSummary
  categories: CategorySalesItem[]
}
```

### Business Logic ที่ Backend ต้องทำ

1. ดึง `code` ของ project จาก `crm.projects WHERE id = $project_id`
2. Query 3 history tables โดยใช้ `projectcode = projects.code` + `iscancel = 0 OR NULL`
3. GROUP BY ตาม `group_level`:
   - level 1 → `GROUP BY family`
   - level 2 → `GROUP BY family, department`
   - level 3 → `GROUP BY family, department, category`
   - level 4 → `GROUP BY family, department, category, subcat`
4. FULL OUTER JOIN ทั้ง 3 ตาราง → SUM amount แต่ละประเภท
5. คำนวณ status:
   - **win** → `invoice_amount > 0`
   - **draw** → `so_amount > 0 AND invoice_amount = 0`
   - **lose** → `quotation_amount > 0 AND so_amount = 0 AND invoice_amount = 0`
6. LEFT JOIN `crm.project_category_lost_reasons` ด้วย `IS NOT DISTINCT FROM` สำหรับ NULL-safe match
7. **หมายเหตุ type:** `amount` ใน quotation/saleorder เป็น type `money` — ต้อง `CAST(amount AS numeric)` ก่อน SUM (ยืนยันแล้ว)
8. **MVP Scope:** ยังไม่รวม Credit Note และ BOQ column — Phase 2:
   - **BOQ:** JOIN `crm.boq_items` + `crm.product_categories` → get level-1 ancestor name → match `family` → SUM(total); field = `boq_amount` (null ใน Phase 1)
   - **Credit Note:** เพิ่ม `crm_project_creditnote_history` + ปรับ logic `net_invoice = invoice - credit_note`

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
      "family": "ระบบไฟฟ้า",
      "department": null,
      "category": null,
      "subcat": null,
      "lost_reason": "ราคาสูงกว่าคู่แข่ง 15% ลูกค้าเลือกผู้รับเหมาเดิม"
    },
    {
      "family": "ระบบประปา",
      "department": null,
      "category": null,
      "subcat": null,
      "lost_reason": "ลูกค้าขอ hold ไปก่อน รอ Q4"
    }
  ]
}
```

### Request Validation

| Field | Type | Required | Constraint |
|-------|------|----------|-----------|
| `reasons` | array | Yes | 1–100 items |
| `reasons[].family` | string\|null | Yes | ชื่อ category level 1 (ต้องตรงกับค่าใน history tables) |
| `reasons[].department` | string\|null | No | level 2 (null ถ้า group_level < 2) |
| `reasons[].category` | string\|null | No | level 3 |
| `reasons[].subcat` | string\|null | No | level 4 |
| `reasons[].lost_reason` | string | Yes | max 500 chars; `""` = clear (set NULL) |

### Response 200

```json
{
  "status": true,
  "message": "บันทึกเหตุผลสำเร็จ 2 หมวด",
  "data": {
    "updated_count": 2,
    "updated_at": "2026-07-10T09:30:00.000+07:00"
  }
}
```

### Response Errors

```json
// 400
{ "status": false, "message": "เหตุผลเกิน 500 ตัวอักษร (category_id: 12)", "error_code": "VALIDATION_ERROR" }

// 403
{ "status": false, "message": "ไม่มีสิทธิ์แก้ไข", "error_code": "FORBIDDEN" }

// 404
{ "status": false, "message": "ไม่พบโครงการ", "error_code": "PROJECT_NOT_FOUND" }
```

### TypeScript Types

```typescript
interface LostReasonItem {
  family: string | null      // ต้องตรงกับค่าใน history tables
  department: string | null
  category: string | null
  subcat: string | null
  lost_reason: string        // "" = clear (set NULL)
}

interface UpdateLostReasonsPayload {
  reasons: LostReasonItem[]
}

interface UpdateLostReasonsResponse {
  updated_count: number
  updated_at: string    // ISO 8601
}
```

### Business Logic ที่ Backend ต้องทำ

1. ตรวจ role: `admin` หรือ `manage` เท่านั้น
2. ตรวจว่า project_id ถูกต้องและอยู่ใน merchant ของ `X-Merchant-UID`
3. Upsert ใน `crm.project_category_lost_reasons` per item:
   - key = `(project_id, family, department, category, subcat)` — ใช้ `IS NOT DISTINCT FROM` สำหรับ NULL
   - ไม่มี row → INSERT (พร้อม `projectcode` จาก `crm.projects.code`)
   - มีแล้ว → UPDATE `lost_reason`, `updated_by`, `updated_at`
   - `lost_reason = ""` → SET `lost_reason = NULL`
4. บันทึก `updated_by = user_id` จาก JWT

---

## 5. Frontend Usage Pattern

```javascript
// ui/components/project/CategorySalesView.vue
const { $callGet, $callPut } = useNuxtApp()
const config = useRuntimeConfig()

// GET
const loadSummary = async () => {
  is_load.value = true
  const res = await $callGet(
    `/crm/${config.public.api_version}/projects/${projectId}/category-sales-summary`
  )
  if (res?.status) {
    summaryData.value = res.data
  } else {
    toast.error(res?.message || 'โหลดข้อมูลไม่สำเร็จ')
  }
  is_load.value = false
}

// PUT (single category → wrap ใน array)
const saveLostReason = async (categoryId, reason) => {
  const res = await $callPut(
    `/crm/${config.public.api_version}/projects/${projectId}/category-lost-reasons`,
    { reasons: [{ category_id: categoryId, lost_reason: reason }] }
  )
  if (res?.status) {
    toast.success('บันทึกเหตุผลสำเร็จ')
    // optimistic update ใน local state
  } else {
    toast.error(res?.message || 'บันทึกไม่สำเร็จ')
  }
}
```

---

## 6. Error Codes Reference

| Error Code | HTTP | คำอธิบาย |
|-----------|------|----------|
| `PROJECT_NOT_FOUND` | 404 | ไม่พบโครงการ |
| `FORBIDDEN` | 403 | ไม่มีสิทธิ์ (→ toast only ตาม global auth) |
| `UNAUTHORIZED` | 401 | Token หมดอายุ (→ redirect login) |
| `VALIDATION_ERROR` | 400 | Input ไม่ถูกต้อง |
| `MERCHANT_LINK_ERROR` | 500 | Cross-schema query ล้มเหลว |

---

## 7. Endpoint Summary

| # | Method | Path | วัตถุประสงค์ | Role |
|---|--------|------|------------|------|
| 1 | `GET` | `/crm/v2/projects/{id}/category-sales-summary` | Matrix Win/Draw/Lose | all |
| 2 | `PUT` | `/crm/v2/projects/{id}/category-lost-reasons` | Bulk upsert lost reasons | admin/manage |
