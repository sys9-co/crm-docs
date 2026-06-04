# Customer Insights — API Specification

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

**Response 200**:
```json
{
  "status": true,
  "data": [
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
  ]
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

**Response 200**:
```json
{
  "status": true,
  "data": [
    {
      "id": "Q2026-001",
      "quotation_date": "2026-05-01",
      "total_amount": 250000,
      "status": "approved",
      "description": "ค่าวัสดุก่อสร้าง โครงการบ้าน ABC",
      "expire_date": "2026-06-01"
    }
  ]
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

**Response 200**:
```json
{
  "status": true,
  "data": [
    {
      "id": "SP2026-001",
      "title": "แผนขาย โครงการบ้าน ABC",
      "total_amount": 5000000,
      "status": "active",
      "start_date": "2026-05-01",
      "end_date": "2026-08-31",
      "progress_pct": 45
    }
  ]
}
```

---

## 7. Customer Orders

### GET /crm/v2/customers/{uuid}/orders

**Description**: Get customer orders list

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
      "id": "ORD2026-001",
      "order_date": "2026-04-15",
      "total_amount": 1200000,
      "status": "delivered",
      "payment_status": "paid",
      "items_count": 5
    }
  ]
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

## 13. Customer Data (Search)

### GET /crm/v2/customers/data

**Description**: Search customers by keyword

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search keyword (name, code, phone) |
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |

**Response 200**:
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
        "avatar_url": "https://cdn.example.com/avatars/c7a2b3d4.jpg",
        "last_interaction_date": "2026-05-15"
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

## 14. List Customers (Filtered)

### GET /crm/v2/customers

**Description**: List customers with filters for list page

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search keyword |
| `page` | int | 1 | Page number |
| `size` | int | 20 | Items per page |
| `customer_type` | string | — | Filter: individual, juristic |
| `customer_tier` | string | — | Filter: regular, silver, gold, platinum |
| `customer_status` | string | — | Filter: active, inactive, sleeping, blacklist |
| `province` | string | — | Filter by province name |
| `sort_by` | string | `updated_at` | Sort field |
| `sort_order` | string | `desc` | asc or desc |
| `date_from` | string | — | Start date (YYYY-MM-DD) |
| `date_to` | string | — | End date (YYYY-MM-DD) |
| `tag` | string | — | Filter by tag |

**Response 200**: Same shape as `/customers/data` with pagination

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
