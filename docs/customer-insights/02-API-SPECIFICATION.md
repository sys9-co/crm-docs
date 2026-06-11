# Customer Insights — API Specification

> **Version 1.1** — reconciled with the actual frontend implementation (June 11, 2026). This document is the **single source of truth** for the backend team; where the current frontend code deviates, the deviation is listed in [04-GETTING-STARTED → Known Frontend Deviations](./04-GETTING-STARTED.md) and will be fixed frontend-side in Phase 5.

## Changelog v1.1

- **Added** missing endpoint specs the frontend already calls: `/customers/{uuid}/projects`, `/contacts`, `/visits` (§17–19) and the analytics pair `/customers/analytics`, `/customers/sleeping` (§20–21)
- **Decided** canonical analytics paths: `/customers/analytics` + `/customers/sleeping` (frontend currently calls `/dashboard/customer-insights` + `/dashboard/sleeping-customers` — to be changed in Phase 5)
- **Decided** canonical orders path: `/customers/{uuid}/orders` (frontend currently calls `/boq` — to be changed in Phase 5)
- **Unified** list/search query params (§14): `last_visit_from`/`last_visit_to` replace `date_from`/`date_to`; added `district`, `min_projects`; `sort_by` enum pinned
- **Standardized** every endpoint that accepts `page`/`size` to return the `PaginatedResponse<T>` envelope (§4–7, §15 GET, §19)
- **Removed** duplicate search endpoint `GET /customers/data` (former §13) — use `GET /customers` (§14)

## Endpoints Overview

**Base URL**: `/crm/v2`
**Module**: `crm`
**Authentication**: Bearer token + X-Merchant-UID header

Common headers:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

Response envelope:
```json
{
  "status": true,
  "message": "success",
  "data": {}
}
```

Paginated envelope — **every endpoint that accepts `page`/`size` returns `data` in this shape** (no bare arrays):
```json
{
  "status": true,
  "message": "success",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "size": 20,
    "has_more": false
  }
}
```

---

## 1. Customer Profile

### GET /crm/v2/customers/{uuid}

**Description**: Get customer profile detail for 360° view

**Response 200**:
```json
{
  "status": true,
  "data": {
    "uuid": "c7a2b3d4-...",
    "customer_code": "C001",
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "phone": "081-234-5678",
    "email": "somchai@email.com",
    "customer_type": "individual",
    "customer_tier": "gold",
    "customer_status": "active",
    "tags": ["สมาชิกเก่า", "เครดิตดี"],
    "avatar_url": "https://cdn.example.com/avatars/c7a2b3d4.jpg",
    "health_score": 85,
    "payment_behavior": "good",
    "on_time_payment_pct": 88,
    "avg_overdue_days": 5,
    "total_invoices": 120,
    "overdue_invoices": 8,
    "as_of_date": "2026-06-01",
    "days_since_last_order": 20
  }
}
```

---

## 2. Update Customer Profile

### PUT /crm/v2/customers/{uuid}

**Description**: Update customer profile fields (partial update)

**Request body**:
```json
{
  "first_name": "สมชาย",
  "last_name": "ใจดี",
  "phone": "081-234-5678",
  "email": "somchai@email.com",
  "customer_type": "individual",
  "customer_tier": "gold",
  "customer_status": "active",
  "tags": ["สมาชิกเก่า", "เครดิตดี"],
  "avatar_base64": "/9j/4AAQSkZJRg..."
}
```

**Response 200**: Updated customer object (same shape as GET)

---

## 3. Customer Overview / Metrics

### GET /crm/v2/customers/{uuid}/overview

**Description**: Get aggregated metrics for the 360° dashboard header

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `months` | int | 12 | Lookback period in months |

**Response 200**:
```json
{
  "status": true,
  "data": {
    "total_purchase_amount": 5830000,
    "purchase_count": 24,
    "avg_order_value": 242916,
    "last_purchase_date": "2026-05-15",
    "last_purchase_days": 20,
    "total_quotations": 12,
    "pending_quotations": 3,
    "total_projects": 2,
    "active_projects": 1
  }
}
```

---

## 4. Customer Timeline

### GET /crm/v2/customers/{uuid}/timeline

**Description**: Get chronological timeline of all customer interactions

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `months` | int | 3 | Lookback period |
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |
| `event_type` | string | — | Filter by event type (comma-separated for multiple) |

**Event types**: `appointment`, `visit`, `quotation`, `sale_plan`, `project_update`, `contact`, `note`

**Response 200** (paginated envelope):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "evt-001",
        "event_type": "appointment",
        "title": "นัดดูงาน",
        "description": "นัดดูโครงการตัวอย่าง",
        "event_date": "2026-05-20T10:00:00Z",
        "created_at": "2026-05-19T14:30:00Z",
        "related_type": "quotation",
        "related_id": "Q2026-001",
        "created_by": {
          "id": 1,
          "name": "พนักงาน ขาย"
        }
      }
    ],
    "total": 42,
    "page": 1,
    "size": 20,
    "has_more": true
  }
}
```

---

## 5. Customer Quotations

### GET /crm/v2/customers/{uuid}/quotations

**Description**: Get customer quotations list

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |

**Response 200** (paginated envelope):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "Q2026-001",
        "quotation_date": "2026-05-01",
        "total_amount": 250000,
        "status": "approved",
        "description": "ค่าวัสดุก่อสร้าง โครงการบ้าน ABC",
        "expire_date": "2026-06-01"
      }
    ],
    "total": 12,
    "page": 1,
    "size": 20,
    "has_more": false
  }
}
```

---

## 6. Customer Sale Plans

### GET /crm/v2/customers/{uuid}/sale-plans

**Description**: Get customer sale plans list

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |

**Response 200** (paginated envelope):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "SP2026-001",
        "title": "แผนขาย โครงการบ้าน ABC",
        "total_amount": 5000000,
        "status": "active",
        "start_date": "2026-05-01",
        "end_date": "2026-08-31",
        "progress_pct": 45
      }
    ],
    "total": 3,
    "page": 1,
    "size": 20,
    "has_more": false
  }
}
```

---

## 7. Customer Orders

### GET /crm/v2/customers/{uuid}/orders

**Description**: Get customer orders list (BOQ-based purchase orders)

> **Canonical path decision (v1.1)**: `/orders`. The current frontend calls `/customers/{uuid}/boq` — frontend will migrate to `/orders` in Phase 5. Backend implements `/orders` only.

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |

**Response 200** (paginated envelope):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "ORD2026-001",
        "order_date": "2026-04-15",
        "total_amount": 1200000,
        "status": "delivered",
        "payment_status": "paid",
        "items_count": 5
      }
    ],
    "total": 24,
    "page": 1,
    "size": 20,
    "has_more": true
  }
}
```

---

## 8. Customer Credit Info

### GET /crm/v2/customers/{uuid}/credit

**Description**: Get customer credit information

**Response 200**:
```json
{
  "status": true,
  "data": {
    "credit_limit": 5000000,
    "credit_used": 1200000,
    "credit_remaining": 3800000,
    "credit_utilization_pct": 24,
    "on_time_payment_pct": 88,
    "avg_overdue_days": 5,
    "total_invoices": 120,
    "overdue_invoices": 8,
    "payment_behavior": "good",
    "as_of_date": "2026-06-01"
  }
}
```

---

## 9. Add Customer Note

### POST /crm/v2/customers/{uuid}/notes

**Description**: Add a quick note to customer timeline

**Request body**:
```json
{
  "content": "ลูกค้าสนใจโครงการบ้านตัวอย่าง"
}
```

**Response 201**:
```json
{
  "status": true,
  "data": {
    "id": "note-uuid",
    "content": "ลูกค้าสนใจโครงการบ้านตัวอย่าง",
    "created_at": "2026-06-04T10:00:00Z"
  }
}
```

---

## 10. Purchase Trend

### GET /crm/v2/customers/{uuid}/purchase-trend

**Description**: Get monthly purchase amounts for trend chart

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `months` | int | 12 | Number of months to return |

**Response 200**:
```json
{
  "status": true,
  "data": [
    { "month": "2025-07", "amount": 320000 },
    { "month": "2025-08", "amount": 450000 },
    { "month": "2025-09", "amount": 380000 },
    { "month": "2025-10", "amount": 520000 },
    { "month": "2025-11", "amount": 410000 },
    { "month": "2025-12", "amount": 600000 },
    { "month": "2026-01", "amount": 480000 },
    { "month": "2026-02", "amount": 560000 },
    { "month": "2026-03", "amount": 620000 },
    { "month": "2026-04", "amount": 440000 },
    { "month": "2026-05", "amount": 580000 },
    { "month": "2026-06", "amount": 500000 }
  ]
}
```

---

## 11. Top Products

### GET /crm/v2/customers/{uuid}/top-products

**Description**: Get top N products by total purchase amount

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 5 | Number of products to return |

**Response 200**:
```json
{
  "status": true,
  "data": [
    { "product_name": "ปูนซีเมนต์ปอร์ตแลนด์ ประเภท 1", "quantity": 2500, "total_amount": 4250000 },
    { "product_name": "เหล็กเส้นข้ออ้อย SD40 ขนาด 16 มม.", "quantity": 850, "total_amount": 2380000 },
    { "product_name": "เหล็กเส้นกลม SR24 ขนาด 12 มม.", "quantity": 600, "total_amount": 1440000 },
    { "product_name": "กระเบื้องเซรามิก ขนาด 60x60 ซม.", "quantity": 3200, "total_amount": 960000 },
    { "product_name": "ทรายหยาบ", "quantity": 180, "total_amount": 720000 }
  ]
}
```

---

## 12. Payment Behavior

### GET /crm/v2/customers/{uuid}/payment-behavior

**Description**: Get customer payment behavior summary

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `months` | int | 12 | Lookback period for invoice data |

**Response 200**:
```json
{
  "status": true,
  "data": {
    "on_time_payment_pct": 85,
    "avg_overdue_days": 8,
    "total_invoices": 48,
    "overdue_invoices": 7
  }
}
```

---

## 13. ~~Customer Data (Search)~~ — REMOVED in v1.1

`GET /crm/v2/customers/data` duplicated §14 with the same response shape and is **not used by the frontend**. Use `GET /crm/v2/customers` (§14). Section number kept to avoid renumbering churn.

---

## 14. List / Search Customers

### GET /crm/v2/customers

**Description**: List customers with full-text search and filters for the `/customers` list page. This is the **only** customer search endpoint.

**Query params** (unified v1.1 — matches what the UI collects):
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Full-text keyword: name, code, phone, email |
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |
| `customer_type` | string | — | Filter: `individual`, `juristic` |
| `customer_tier` | string | — | Filter: `regular`, `silver`, `gold`, `platinum` |
| `customer_status` | string | — | Filter: `active`, `inactive`, `sleeping`, `blacklist`. **`sleeping` MUST be computed server-side** (last interaction ≥ threshold; default 365 days) — client-side filtering breaks pagination |
| `province` | string | — | Filter by province name |
| `district` | string | — | Filter by district name |
| `min_projects` | int | — | Only customers with at least N projects (UI quick filter "มีโครงการ" sends `min_projects=1`) |
| `last_visit_from` | string | — | Last-visit range start (YYYY-MM-DD) |
| `last_visit_to` | string | — | Last-visit range end (YYYY-MM-DD) |
| `tag` | string | — | Filter by tag |
| `sort_by` | string | `updated_at` | One of: `name`, `last_interacted`, `project_count`, `contact_count`, `updated_at` |
| `sort_order` | string | `desc` | `asc` or `desc` |

> v1.1 note: `date_from`/`date_to` are **replaced** by `last_visit_from`/`last_visit_to` (the UI filter is semantically "ช่วงวันที่เข้าเยี่ยมล่าสุด").

**Response 200** (paginated envelope):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "uuid": "c7a2b3d4-...",
        "customer_code": "C001",
        "first_name": "สมชาย",
        "last_name": "ใจดี",
        "phone": "081-234-5678",
        "customer_type": "individual",
        "customer_tier": "gold",
        "customer_status": "active",
        "province": "กรุงเทพมหานคร",
        "avatar_url": "https://cdn.example.com/avatars/c7a2b3d4.jpg",
        "last_interaction_date": "2026-05-15",
        "project_count": 4,
        "contact_count": 2
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20,
    "has_more": false
  }
}
```

---

## 15. Customer Documents

### GET /crm/v2/customers/{uuid}/documents

**Description**: Get list of uploaded documents for a customer

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |

**Response 200**:
```json
{
  "status": true,
  "data": [
    {
      "id": "doc-uuid-001",
      "filename": "ใบเสนอราคา.pdf",
      "file_type": "application/pdf",
      "file_size": 245760,
      "document_type": "quotation",
      "description": "ใบเสนอราคางานโครงสร้าง",
      "uploaded_at": "2026-06-04T10:30:00Z",
      "uploaded_by": "พนักงาน ขาย",
      "url": "https://cdn.example.com/documents/doc-uuid-001.pdf"
    }
  ]
}
```

### POST /crm/v2/customers/{uuid}/documents

**Description**: Upload a new document for a customer

**Request body**:
```json
{
  "filename": "ใบเสนอราคา.pdf",
  "file_type": "application/pdf",
  "file_size": 245760,
  "document_type": "quotation",
  "description": "ใบเสนอราคางานโครงสร้าง",
  "content_base64": "JVBERi0xLjQK...",
  "content_type": "file"
}
```

**Field details**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | Yes | Original filename with extension |
| `file_type` | string | Yes | MIME type |
| `file_size` | number | Yes | File size in bytes (max 20MB) |
| `document_type` | string | Yes | Document category: quotation, invoice, contract, delivery_note, other |
| `description` | string | No | Optional description |
| `content_base64` | string | Yes | Base64-encoded file content |
| `content_type` | string | No | Source: `file`, `camera`, `clipboard` |

**Accepted MIME types**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Response 201**:
```json
{
  "status": true,
  "data": {
    "id": "doc-uuid-001",
    "filename": "ใบเสนอราคา.pdf",
    "file_size": 245760,
    "uploaded_at": "2026-06-04T10:30:00Z"
  }
}
```

### DELETE /crm/v2/customers/{uuid}/documents/{id}

**Description**: Delete a customer document

**Response 204**: No content

---

## 16. Customer Addresses

### GET /crm/v2/customers/{uuid}/addresses

**Description**: Get list of customer addresses

**Response 200**:
```json
{
  "status": true,
  "data": [
    {
      "uuid": "addr-uuid-001",
      "type": "head_office",
      "label": "หัวมุมถนนสุขุมวิท",
      "address_line1": "123/45 ถนนสุขุมวิท",
      "subdistrict": "คลองเตย",
      "district": "คลองเตย",
      "province": "กรุงเทพมหานคร",
      "postal_code": "10110",
      "is_primary": true
    }
  ]
}
```

**Address types**: `head_office` (สำนักงานใหญ่), `project_site` (หน้างาน), `warehouse` (คลังสินค้า), `billing` (ที่ออกใบแจ้งหนี้), `other` (อื่นๆ)

### POST /crm/v2/customers/{uuid}/addresses

**Description**: Add a new address for a customer

**Request body**:
```json
{
  "type": "head_office",
  "label": "หัวมุมถนนสุขุมวิท",
  "address_line1": "123/45 ถนนสุขุมวิท",
  "subdistrict": "คลองเตย",
  "district": "คลองเตย",
  "province": "กรุงเทพมหานคร",
  "postal_code": "10110",
  "is_primary": true
}
```

**Response 201**: Created address object (same shape as GET item)

### PUT /crm/v2/customers/{uuid}/addresses/{id}

**Description**: Update an existing address

**Request body**: Same shape as POST (partial update supported)

**Response 200**: Updated address object

### DELETE /crm/v2/customers/{uuid}/addresses/{id}

**Description**: Delete a customer address

**Response 204**: No content

### PUT /crm/v2/customers/{uuid}/addresses/{id}/primary

**Description**: Set an address as the primary address (unsets primary on others)

**Response 200**: Updated address object

---

## 17. Customer Projects *(new in v1.1 — frontend already calls this)*

### GET /crm/v2/customers/{uuid}/projects

**Description**: Get projects linked to this customer (360° page "โครงการ" card — `CustomerProjects.vue`)

**Response 200**:
```json
{
  "status": true,
  "data": [
    {
      "id": "proj-uuid-001",
      "name": "โครงการบ้าน ABC",
      "code": "PRJ-2026-001",
      "status": "active"
    }
  ]
}
```

---

## 18. Customer Contacts *(new in v1.1 — frontend already calls this)*

### GET /crm/v2/customers/{uuid}/contacts

**Description**: Get contact persons linked to this customer (360° page "รายชื่อติดต่อ" card — `CustomerContacts.vue`)

**Response 200**:
```json
{
  "status": true,
  "data": [
    {
      "id": "contact-uuid-001",
      "contact_name": "สมหญิง ใจดี",
      "phone": "081-234-5678",
      "email": "somying@email.com"
    }
  ]
}
```

---

## 19. Customer Visits *(new in v1.1 — frontend already calls this)*

### GET /crm/v2/customers/{uuid}/visits

**Description**: Get site visits for this customer with load-more pagination (360° page "การเข้าเยี่ยม" card — `CustomerVisits.vue`)

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `size` | int | 10 | Items per page |

**Response 200** (paginated envelope):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "visit-uuid-001",
        "title": "เข้าเยี่ยมหน้างาน",
        "description": "ติดตามความคืบหน้างานโครงสร้าง",
        "date": "2026-05-20T10:00:00Z"
      }
    ],
    "total": 18,
    "page": 1,
    "size": 10,
    "has_more": true
  }
}
```

---

## 20. Customer Analytics Dashboard *(new in v1.1)*

### GET /crm/v2/customers/analytics

**Description**: Aggregated analytics for the `/customers/insights` dashboard — KPIs, distributions, trends, segmentation

> **Canonical path decision (v1.1)**: `/customers/analytics`. The current frontend calls `/dashboard/customer-insights` — frontend will migrate in Phase 5. Backend implements `/customers/analytics` only.
>
> ⚠️ Routing note: this route MUST be registered **before** `/customers/{uuid}` so that `analytics` is not captured as a UUID path param (same for `/customers/sleeping`, §21).

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `sleeping_threshold_days` | int | 365 | Days without interaction to count a customer as inactive/sleeping |

**Response 200**:
```json
{
  "status": true,
  "data": {
    "total_customers": 520,
    "active_customers": 380,
    "inactive_customers": 140,
    "new_customers_this_month": 12,
    "customers_by_province": [ { "province": "กรุงเทพมหานคร", "count": 180 } ],
    "customers_by_district": [ { "district": "คลองเตย", "count": 45 } ],
    "new_customers_over_time": [ { "month": "2026-01", "count": 8 } ],
    "top_customers_by_value": [
      {
        "customer": { "uuid": "uuid-cust-001", "customer_code": "CUST-001", "customer_name": "หจก.ก่อสร้างเจริญกิจ" },
        "total_value": 18500000
      }
    ],
    "customers_by_project_count": [ { "range": "1-2 โครงการ", "count": 240 } ],
    "acquisition_trend": [ { "month": "2026-01", "cumulative": 420 } ]
  }
}
```

**Field notes**:
- `top_customers_by_value`: `total_value` = quotation + sale plan + order value combined; max 10 rows, sorted desc
- `customers_by_province` / `customers_by_district`: top 10 / top 5, sorted by count desc
- `new_customers_over_time` / `acquisition_trend`: last 6 months, ISO month `YYYY-MM`

---

## 21. Sleeping Customers *(new in v1.1)*

### GET /crm/v2/customers/sleeping

**Description**: Customers with no interaction beyond the threshold (insights dashboard table + outreach triggers)

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `threshold_days` | int | 365 | Days without interaction |
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |

**Response 200** (paginated envelope):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "uuid": "uuid-sleep-001",
        "customer_name": "ร้านทองสุขการค้า",
        "customer_code": "CUST-010",
        "phone": "089-123-4567",
        "last_interaction_date": "2025-03-15T10:00:00Z",
        "days_since_last_interaction": 446,
        "total_visits": 8,
        "total_projects": 2
      }
    ],
    "total": 37,
    "page": 1,
    "size": 20,
    "has_more": true
  }
}
```

**Sorted by** `days_since_last_interaction` desc (longest-sleeping first).

---

## Data Models

### CustomerPurchaseTrend
| Field | Type | Description |
|-------|------|-------------|
| `month` | string | ISO month `YYYY-MM` |
| `amount` | number | Total purchase amount |

### CustomerTopProduct
| Field | Type | Description |
|-------|------|-------------|
| `product_name` | string | Product name |
| `quantity` | number | Units purchased |
| `total_amount` | number | Total purchase amount |

### CustomerPaymentBehavior
| Field | Type | Description |
|-------|------|-------------|
| `on_time_payment_pct` | number | Percentage of invoices paid on time (0–100) |
| `avg_overdue_days` | number | Average days overdue |
| `total_invoices` | number | Total invoices in period |
| `overdue_invoices` | number | Number of overdue invoices |

### CustomerTimelineEvent
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Event UUID |
| `event_type` | string | One of: appointment, visit, quotation, sale_plan, project_update, contact, note |
| `title` | string | Event title |
| `description` | string | Event description |
| `event_date` | string | ISO datetime |
| `created_at` | string | ISO datetime |
| `related_type` | string | Related entity type |
| `related_id` | string | Related entity ID |
| `created_by` | object | `{ id: number, name: string }` |

### CustomerCreditInfo
| Field | Type | Description |
|-------|------|-------------|
| `credit_limit` | number | Credit limit |
| `credit_used` | number | Used credit |
| `credit_remaining` | number | Remaining credit |
| `credit_utilization_pct` | number | Utilization percentage |
| `on_time_payment_pct` | number | On-time payment percentage |
| `avg_overdue_days` | number | Average overdue days |
| `total_invoices` | number | Total invoices |
| `overdue_invoices` | number | Overdue invoices |
| `payment_behavior` | string | Rating: excellent, good, fair, poor |
| `as_of_date` | string | Date (YYYY-MM-DD) |

### CustomerNote
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Note UUID |
| `content` | string | Note content |
| `created_at` | string | ISO datetime |

### CustomerDocument
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document UUID |
| `filename` | string | Original filename |
| `file_type` | string | MIME type |
| `file_size` | number | File size in bytes |
| `document_type` | string | Category: quotation, invoice, contract, delivery_note, other |
| `description` | string | Optional description |
| `uploaded_at` | string | ISO datetime of upload |
| `uploaded_by` | string | Uploader name |
| `url` | string | Download URL |

### CustomerAddress
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Address UUID |
| `type` | string | One of: head_office, project_site, warehouse, billing, other |
| `label` | string | Address label |
| `address_line1` | string | Street address line 1 |
| `subdistrict` | string | Sub-district (tambon) |
| `district` | string | District (amphoe) |
| `province` | string | Province |
| `postal_code` | string | Postal code |
| `is_primary` | boolean | Whether this is the primary address |

### CustomerProjectItem *(v1.1)*
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Project UUID |
| `name` | string | Project name |
| `code` | string | Project code |
| `status` | string | Project status |

### CustomerContactItem *(v1.1)*
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Contact UUID |
| `contact_name` | string | Contact person name |
| `phone` | string | Phone number |
| `email` | string | Email |

### CustomerVisitItem *(v1.1)*
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Visit UUID |
| `title` | string | Visit title |
| `description` | string | Visit description |
| `date` | string | ISO datetime of the visit |

### CustomerAnalytics *(v1.1)*
| Field | Type | Description |
|-------|------|-------------|
| `total_customers` | number | Total customer count |
| `active_customers` | number | Customers with interaction within threshold |
| `inactive_customers` | number | Customers beyond threshold (sleeping) |
| `new_customers_this_month` | number | Customers created this calendar month |
| `customers_by_province` | array | `{ province: string, count: number }[]` — top 10 |
| `customers_by_district` | array | `{ district: string, count: number }[]` — top 5 |
| `new_customers_over_time` | array | `{ month: "YYYY-MM", count: number }[]` — last 6 months |
| `top_customers_by_value` | array | `{ customer: { uuid, customer_code, customer_name }, total_value: number }[]` — top 10 |
| `customers_by_project_count` | array | `{ range: string, count: number }[]` — segmentation buckets |
| `acquisition_trend` | array | `{ month: "YYYY-MM", cumulative: number }[]` — cumulative growth |

### SleepingCustomer *(v1.1)*
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Customer UUID |
| `customer_name` | string | Display name |
| `customer_code` | string | Customer code |
| `phone` | string | Phone number |
| `last_interaction_date` | string | ISO datetime of last interaction |
| `days_since_last_interaction` | number | Days since last interaction |
| `total_visits` | number | Lifetime visit count |
| `total_projects` | number | Lifetime project count |

---

**API Specification Version**: 1.1
**Last Updated**: June 11, 2026
**Status**: Ready for Backend Implementation
**Endpoint count**: 25 routes across 20 active sections
