# Customer Insights — API Specification

## 📡 API Overview

**Base URL**: `/crm/{api_version}`  
**Module**: `crm`  
**Authentication**: Bearer token + X-Merchant-UID header  
**Response Format**: All responses follow `APIResponse<T>` wrapper

### Standard Headers
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
Accept: application/json
```

### Standard Response Patterns

**Success (200)**:
```json
{
  "status": true,
  "message": "ดำเนินการสำเร็จ",
  "data": { }
}
```

**Error (4xx/5xx)**:
```json
{
  "status": false,
  "message": "Human-readable Thai error message",
  "error_code": "MACHINE_READABLE_CODE",
  "data": { }
}
```

**Paginated Response**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลสำเร็จ",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "size": 20,
    "has_more": true
  }
}
```

---

## 🔑 Core Endpoints

### **1. GET /customers — Customer List & Search**

```http
GET /crm/v1/customers?search=ก่อสร้าง&page=1&size=20&sort_by=name&sort_order=asc&province=กรุงเทพมหานคร&last_visit_from=2026-01-01&last_visit_to=2026-06-01
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | — | Full-text search on name, code, phone, email |
| `page` | integer | No | 1 | Page number (1-indexed) |
| `size` | integer | No | 20 | Items per page (max 100) |
| `sort_by` | string | No | `name` | Sort field: `name`, `last_interacted`, `project_count`, `contact_count` |
| `sort_order` | string | No | `asc` | Sort direction: `asc`, `desc` |
| `province` | string | No | — | Filter by province |
| `district` | string | No | — | Filter by district |
| `last_visit_from` | string (date) | No | — | Filter by last visit date >= (ISO 8601 date) |
| `last_visit_to` | string (date) | No | — | Filter by last visit date <= (ISO 8601 date) |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "ค้นหาลูกค้าสำเร็จ",
  "data": {
    "items": [
      {
        "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "customer_code": "CUST-001",
        "customer_name": "หจก.ก่อสร้างเจริญกิจ",
        "phone": "081-234-5678",
        "email": "info@charoenkit.com",
        "province": "กรุงเทพมหานคร",
        "avatar_url": "https://cdn.example.com/avatars/a1b2c3d4.jpg",
        "last_interaction_date": "2026-05-20T14:30:00Z",
        "project_count": 8,
        "contact_count": 5
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20,
    "has_more": false
  }
}
```

**Error Codes**: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **2. GET /customers/{customer_uuid} — Customer Detail**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `customer_uuid` | string (UUID) | Primary UUID of the customer |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลลูกค้าสำเร็จ",
  "data": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customer_code": "CUST-001",
    "customer_name": "หจก.ก่อสร้างเจริญกิจ",
    "customer_type": "contractor",
    "phone": "081-234-5678",
    "email": "info@charoenkit.com",
    "tax_id": "1234567890123",
    "address_line1": "123 ถ.สุขุมวิท",
    "subdistrict": "คลองเตย",
    "district": "คลองเตย",
    "province": "กรุงเทพมหานคร",
    "postal_code": "10110",
    "avatar_url": "https://cdn.example.com/avatars/a1b2c3d4.jpg",
    "profile_image": "https://cdn.example.com/profiles/a1b2c3d4.jpg",
    "birth_date": "1989-03-15",
    "age": 37,
    "occupation": "รับเหมาก่อสร้าง",
    "contact_person": "นายสมชาย ใจดี",
    "contact_phone": "089-876-5432",
    "social_media": {
      "facebook": "facebook.com/charoenkit",
      "line": "@charoenkit_off",
      "instagram": "@charoenkit_construction",
      "tiktok": "@charoenkit_tiktok",
      "website": "https://charoenkit.com"
    },
    "last_interacted": "2026-05-20T14:30:00Z",
    "total_projects": 8,
    "total_quotations": 5,
    "total_sale_plans": 12,
    "total_orders": 4,
    "total_contacts": 3,
    "total_visits": 62,
    "active_status": 1,
    "created_at": "2024-01-15T08:30:00Z",
    "updated_at": "2026-05-20T14:30:00Z"
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND` (404), `UNAUTHORIZED`, `FORBIDDEN`

---

### **3. PUT /customers/{customer_uuid} — Update Customer**

```http
PUT /crm/v2/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Content-Type: application/json
```

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customer_name` | string | No | ชื่อลูกค้า |
| `phone` | string | No | เบอร์โทรศัพท์ |
| `email` | string | No | อีเมล |
| `customer_type` | string | No | ประเภทลูกค้า (`contractor`, `supplier`, `developer`, `retailer`, `sub_contractor`, `architect`, `other`) |
| `tier` | string | No | ระดับ (`A`, `B`, `C`) |
| `customer_status` | string | No | สถานะ (`active`, `dormant`, `churned`) |
| `tags` | string[] | No | แท็ก (array of strings) |
| `credit_term` | number | No | เครดิตเทอม (วัน) |
| `credit_limit` | number | No | วงเงินเครดิต |
| `address_line1` | string | No | ที่อยู่ |
| `province` | string | No | จังหวัด |
| `district` | string | No | เขต/อำเภอ |
| `subdistrict` | string | No | แขวง/ตำบล |
| `postal_code` | string | No | รหัสไปรษณีย์ |

**Example Request**:
```json
{
  "customer_name": "หจก.ก่อสร้างเจริญกิจ (แก้ไข)",
  "phone": "081-234-5678",
  "email": "info@charoenkit.com",
  "customer_type": "contractor",
  "tier": "A",
  "customer_status": "active",
  "tags": ["VIP", "ประจำ"],
  "credit_term": 30,
  "credit_limit": 1000000.00,
  "province": "กรุงเทพมหานคร",
  "district": "คลองเตย"
}
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "บันทึกข้อมูลลูกค้าสำเร็จ",
  "data": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customer_name": "หจก.ก่อสร้างเจริญกิจ (แก้ไข)",
    "updated_at": "2026-06-04T14:30:00Z"
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND` (404), `VALIDATION_ERROR` (422), `UNAUTHORIZED`, `FORBIDDEN`

---

### **4. GET /customers/{customer_uuid}/credit — Credit Info**

```http
GET /crm/v2/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/credit
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลเครดิตสำเร็จ",
  "data": {
    "credit_limit": 1000000.00,
    "credit_used": 450000.00,
    "credit_available": 550000.00,
    "credit_term": 30,
    "payment_due_days": 15,
    "overdue_amount": 0.00,
    "last_payment_date": "2026-05-15",
    "last_payment_amount": 150000.00
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND` (404), `UNAUTHORIZED`, `FORBIDDEN`

---

### **5. POST /customers/{customer_uuid}/notes — Add Note**

```http
POST /crm/v2/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/notes
Content-Type: application/json
```

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | เนื้อหาโน๊ต |

**Example Request**:
```json
{
  "content": "ลูกค้าสนใจสินค้ากลุ่มเหล็กโครงสร้าง"
}
```

**Response Success (201)**:
```json
{
  "status": true,
  "message": "เพิ่มโน๊ตสำเร็จ",
  "data": {
    "id": 101,
    "customer_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "content": "ลูกค้าสนใจสินค้ากลุ่มเหล็กโครงสร้าง",
    "created_by": "พนักงาน ขายดี",
    "created_at": "2026-06-04T14:30:00Z"
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND` (404), `VALIDATION_ERROR` (422), `UNAUTHORIZED`, `FORBIDDEN`

---

### **6. GET /customers/{customer_uuid}/overview — Customer Metrics Overview**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/overview
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลภาพรวมสำเร็จ",
  "data": {
    "total_contacts": 5,
    "total_projects": 8,
    "total_appointments": 24,
    "total_visits": 62,
    "total_quotation_value": 5800000.00,
    "total_sale_plan_value": 12500000.00,
    "total_boq_value": 8500000.00,
    "last_interaction_date": "2026-05-20T14:30:00Z"
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND` (404), `UNAUTHORIZED`, `FORBIDDEN`

---

## 🔗 Related Entity Endpoints

### **7. GET /customers/{customer_uuid}/timeline — Activity Timeline**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/timeline?page=1&size=20
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `size` | integer | No | 20 | Items per page (max 50) |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดไทม์ไลน์สำเร็จ",
  "data": {
    "items": [
      {
        "id": "evt-001",
        "event_type": "visit",
        "title": "เข้าเยี่ยมลูกค้าที่โครงการ พูดคุยความคืบหน้า",
        "description": "รายละเอียดเพิ่มเติมสำหรับการเข้าเยี่ยม",
        "timestamp": "2026-05-20T09:00:00Z",
        "actor_name": "สมชาย ใจดี",
        "reference_type": "visit",
        "reference_uuid": "visit-001",
        "reference_url": "/visits/visit-001"
      },
      {
        "id": "evt-002",
        "event_type": "quotation",
        "title": "ออกใบเสนอราคาเลขที่ QT-2026-001",
        "description": "งานปรับปรุงโครงการบ้านกลางเมือง",
        "timestamp": "2026-05-15T11:30:00Z",
        "actor_name": "วิไล รักดี",
        "reference_type": "quotation",
        "reference_uuid": "qt-001",
        "reference_url": "/quotations/qt-001"
      },
      {
        "id": "evt-003",
        "event_type": "appointment",
        "title": "นัดหมายเพื่อเสนอราคางานปรับปรุง",
        "description": "",
        "timestamp": "2026-05-10T14:00:00Z",
        "actor_name": "ประเสริฐ มั่งคั่ง",
        "reference_type": null,
        "reference_uuid": null,
        "reference_url": null
      }
    ],
    "total": 45,
    "page": 1,
    "size": 20,
    "has_more": true
  }
}
```

**Event Types**: `appointment`, `visit`, `project_update`, `quotation`, `sale_plan`, `contact`, `note`

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **8. GET /customers/{customer_uuid}/quotations — Quotations**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/quotations?page=1&size=20&status=เสนอราคา
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `size` | integer | No | 20 | Items per page (max 100) |
| `status` | string | No | — | Filter by status name (e.g., `เสนอราคา`, `อนุมัติ`) |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลใบเสนอราคาสำเร็จ",
  "data": {
    "items": [
      {
        "uuid": "qt-001",
        "quotation_no": "QT-2026-001",
        "quotation_date": "2026-05-15",
        "project_name": "โครงการบ้านกลางเมือง",
        "total_amount": 2500000.00,
        "status_name": "เสนอราคา",
        "sale_name": "สมชาย ใจดี"
      }
    ],
    "total": 5,
    "page": 1,
    "size": 20,
    "has_more": false
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **9. GET /customers/{customer_uuid}/sale-plans — Sale Plans**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/sale-plans?page=1&size=20&status=active
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `size` | integer | No | 20 | Items per page (max 100) |
| `status` | string | No | — | Filter by status |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลแผนขายสำเร็จ",
  "data": {
    "items": [
      {
        "id": 1,
        "project_name": "โครงการบ้านกลางเมือง",
        "period_month": "2026-05",
        "total_amount": 1500000.00,
        "line_count": 8,
        "note": "งานโครงสร้างหลัก"
      }
    ],
    "total": 12,
    "page": 1,
    "size": 20,
    "has_more": false
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **10. GET /customers/{customer_uuid}/orders — Customer Orders / BOQ**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/orders?page=1&size=20&status=ดำเนินการ
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `size` | integer | No | 20 | Items per page (max 100) |
| `status` | string | No | — | Filter by status (e.g., `ดำเนินการ`, `แล้วเสร็จ`) |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลคำสั่งซื้อสำเร็จ",
  "data": {
    "items": [
      {
        "id": 1,
        "project_name": "โครงการบ้านกลางเมือง",
        "boq_name": "งานคอนกรีต",
        "quantity": 100,
        "unit_price": 350.00,
        "total": 35000.00,
        "date": "2026-05-10",
        "status": "ดำเนินการ"
      }
    ],
    "total": 4,
    "page": 1,
    "size": 20,
    "has_more": false
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **11. GET /customers/{customer_uuid}/projects — Customer Projects**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/projects
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลโครงการสำเร็จ",
  "data": [
    {
      "id": 101,
      "name": "โครงการบ้านกลางเมือง",
      "code": "PRJ-001",
      "status": "กำลังดำเนินการ"
    },
    {
      "id": 102,
      "name": "ร้านทรัพย์ทวีวัสดุ",
      "code": "PRJ-002",
      "status": "แล้วเสร็จ"
    }
  ]
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **12. GET /customers/{customer_uuid}/contacts — Customer Contacts**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/contacts
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลผู้ติดต่อสำเร็จ",
  "data": [
    {
      "id": 1,
      "contact_name": "นายสมชาย ใจดี",
      "phone": "089-876-5432",
      "email": "somchai@charoenkit.com",
      "position": "ผู้จัดการโครงการ",
      "is_primary": true
    },
    {
      "id": 2,
      "contact_name": "นางสาววิไล รักดี",
      "phone": "088-765-4321",
      "email": "wilai@charoenkit.com",
      "position": "เจ้าหน้าที่จัดซื้อ",
      "is_primary": false
    }
  ]
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **13. GET /customers/{customer_uuid}/visits — Customer Visits**

```http
GET /crm/v1/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/visits?page=1&size=10
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `size` | integer | No | 10 | Items per page (max 50) |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลการเข้าเยี่ยมสำเร็จ",
  "data": {
    "items": [
      {
        "id": "visit-001",
        "title": "เข้าเยี่ยมลูกค้าที่โครงการ",
        "description": "พูดคุยความคืบหน้าโครงการบ้านกลางเมือง ตรวจสอบงานและนัดหมายครั้งต่อไป",
        "date": "2026-05-20T09:00:00Z",
        "visitor_name": "สมชาย ใจดี"
      }
    ],
    "total": 62,
    "page": 1,
    "size": 10,
    "has_more": true
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

## 📊 Analytics Endpoints

### **14. GET /customers/analytics — Dashboard Analytics**

```http
GET /crm/v1/customers/analytics?sleeping_threshold_days=365
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sleeping_threshold_days` | integer | No | 365 | Days without activity to consider a customer "sleeping" |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลวิเคราะห์สำเร็จ",
  "data": {
    "total_customers": 520,
    "active_customers": 380,
    "inactive_customers": 140,
    "new_customers_this_month": 12,
    "customers_by_province": [
      { "province": "กรุงเทพมหานคร", "count": 180 },
      { "province": "เชียงใหม่", "count": 65 },
      { "province": "นนทบุรี", "count": 48 },
      { "province": "สมุทรปราการ", "count": 42 },
      { "province": "ชลบุรี", "count": 38 }
    ],
    "customers_by_district": [
      { "district": "คลองเตย", "count": 45 },
      { "district": "บางกะปิ", "count": 38 },
      { "district": "เมืองเชียงใหม่", "count": 35 },
      { "district": "บางใหญ่", "count": 28 },
      { "district": "ศรีราชา", "count": 22 }
    ],
    "new_customers_over_time": [
      { "month": "2026-01", "count": 8 },
      { "month": "2026-02", "count": 12 },
      { "month": "2026-03", "count": 15 },
      { "month": "2026-04", "count": 10 },
      { "month": "2026-05", "count": 14 },
      { "month": "2026-06", "count": 6 }
    ],
    "top_customers_by_value": [
      {
        "customer": {
          "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "customer_code": "CUST-001",
          "customer_name": "หจก.ก่อสร้างเจริญกิจ",
          "phone": "081-234-5678",
          "email": "info@charoenkit.com",
          "province": "กรุงเทพมหานคร",
          "avatar_url": "https://cdn.example.com/avatars/a1b2c3d4.jpg",
          "last_interaction_date": "2026-05-20T14:30:00Z",
          "project_count": 8,
          "contact_count": 5
        },
        "total_value": 18500000.00
      }
    ],
    "customers_by_project_count": [
      { "range": "1-2 โครงการ", "count": 240 },
      { "range": "3-5 โครงการ", "count": 150 },
      { "range": "6-10 โครงการ", "count": 80 },
      { "range": "11+ โครงการ", "count": 50 }
    ],
    "acquisition_trend": [
      { "month": "2026-01", "cumulative": 420 },
      { "month": "2026-02", "cumulative": 432 },
      { "month": "2026-03", "cumulative": 447 },
      { "month": "2026-04", "cumulative": 457 },
      { "month": "2026-05", "cumulative": 471 },
      { "month": "2026-06", "cumulative": 477 }
    ]
  }
}
```

**Error Codes**: `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`

---

### **15. GET /customers/sleeping — Sleeping Customers**

```http
GET /crm/v1/customers/sleeping?threshold_days=365&page=1&size=20
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `threshold_days` | integer | No | 365 | Days without any interaction |
| `page` | integer | No | 1 | Page number |
| `size` | integer | No | 20 | Items per page (max 100) |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดข้อมูลลูกค้าที่ไม่ได้ติดต่อสำเร็จ",
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
    "total": 45,
    "page": 1,
    "size": 20,
    "has_more": true
  }
}
```

**Error Codes**: `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`

---

### **16. GET /customers/{customer_uuid}/purchase-trend — Purchase Trend**

```http
GET /crm/v2/customers/{customer_uuid}/purchase-trend?months=12
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `months` | integer | No | 12 | Number of months to return |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดแนวโน้มการซื้อสำเร็จ",
  "data": [
    { "month": "2025-07", "amount": 320000 },
    { "month": "2025-08", "amount": 450000 }
  ]
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **17. GET /customers/{customer_uuid}/top-products — Top Products**

```http
GET /crm/v2/customers/{customer_uuid}/top-products?limit=5
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 5 | Number of top products to return |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดสินค้าขายดีสำเร็จ",
  "data": [
    { "product_name": "ปูนซีเมนต์ปอร์ตแลนด์ ประเภท 1", "quantity": 2500, "total_amount": 4250000 }
  ]
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

### **18. GET /customers/{customer_uuid}/payment-behavior — Payment Behavior**

```http
GET /crm/v2/customers/{customer_uuid}/payment-behavior?months=12
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `months` | integer | No | 12 | Lookback period for invoice data |

**Response Success (200)**:
```json
{
  "status": true,
  "message": "โหลดพฤติกรรมการชำระเงินสำเร็จ",
  "data": {
    "on_time_payment_pct": 85,
    "avg_overdue_days": 8,
    "total_invoices": 48,
    "overdue_invoices": 7
  }
}
```

**Error Codes**: `CUSTOMER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`

---

## 📋 Data Models

### **APIResponse\<T\>**
```typescript
interface APIResponse<T = any> {
  status: boolean        // true = success, false = error
  message: string        // Human-readable Thai message
  data?: T               // Response payload (absent on error)
  error_code?: string    // Machine-readable error code
}
```

### **PaginatedResponse\<T\>**
```typescript
interface PaginatedResponse<T> {
  items: T[]             // Array of items for this page
  total: number          // Total number of items across all pages
  page: number           // Current page number (1-indexed)
  size: number           // Items per page
  has_more: boolean      // Whether more pages exist
}
```

### **Customer**
```typescript
interface Customer {
  uuid: string                    // Primary UUID v4
  customer_code: string           // Human-readable code (e.g., "CUST-001")
  customer_name: string           // Full customer name
  customer_type?: string          // Type (e.g., "contractor", "retail", "developer")
  tier?: 'A' | 'B' | 'C'         // Customer tier/level
  customer_status?: 'active' | 'dormant' | 'churned'  // Current status
  tags?: string[]                 // Tags (e.g., ["VIP", "ประจำ"])
  phone?: string
  email?: string
  tax_id?: string                 // Thai Tax ID (13 digits)
  address_line1?: string
  subdistrict?: string            // ตำบล
  district?: string               // อำเภอ
  province?: string               // จังหวัด
  postal_code?: string
  avatar_url?: string
  profile_image?: string
  birth_date?: string             // ISO 8601 date
  age?: number
  occupation?: string
  contact_person?: string         // Primary contact name (denormalized)
  contact_phone?: string          // Primary contact phone (denormalized)
  social_media?: {
    facebook?: string
    line?: string
    instagram?: string
    tiktok?: string
    website?: string
  }
  credit_term?: number            // เครดิตเทอม (วัน)
  credit_limit?: number           // วงเงินเครดิต
  health_score?: number           // 0–100 health score
  last_interacted?: string        // ISO 8601 datetime of last interaction across all types
  total_projects?: number         // Aggregated count
  total_quotations?: number       // Aggregated count
  total_sale_plans?: number       // Aggregated count
  total_orders?: number           // Aggregated count
  total_contacts?: number         // Aggregated count
  total_visits?: number           // Aggregated count
  active_status?: number          // 1 = active, 0 = inactive
  created_at?: string             // ISO 8601 datetime
  updated_at?: string             // ISO 8601 datetime
}
```

### **CustomerCreditInfo**
```typescript
interface CustomerCreditInfo {
  credit_limit: number            // วงเงินเครดิต
  credit_used: number             // เครดิตที่ใช้ไป
  credit_available: number        // เครดิตคงเหลือ
  credit_term: number             // เครดิตเทอม (วัน)
  payment_due_days: number        // วันที่เหลือก่อนกำหนดชำระ
  overdue_amount: number          // ยอดค้างชำระ
  last_payment_date?: string      // วันที่ชำระล่าสุด (ISO 8601 date)
  last_payment_amount?: number    // ยอดที่ชำระล่าสุด
}
```

### **CustomerNote**
```typescript
interface CustomerNote {
  id: number                      // Note ID
  customer_uuid: string           // Associated customer UUID
  content: string                 // Note content
  created_by: string              // Creator name
  created_at: string              // ISO 8601 datetime
}
```

### **HealthScoreWeights**
```typescript
interface HealthScoreWeights {
  recency: number                 // Weight for days since last interaction (default: 40)
  frequency: number               // Weight for interaction frequency (default: 30)
  monetary: number                // Weight for total value (default: 20)
  credit: number                  // Weight for credit health (default: 10)
}
```

### **CustomerShort (Search Result Item)**
```typescript
interface CustomerShort {
  uuid: string
  customer_code: string
  customer_name: string
  phone?: string
  email?: string
  province?: string
  avatar_url?: string
  last_interaction_date?: string  // ISO 8601 datetime
  project_count?: number
  contact_count?: number
}
```

### **CustomerOverview**
```typescript
interface CustomerOverview {
  total_contacts: number           // Total contact persons
  total_projects: number           // Total linked projects
  total_appointments: number       // Total appointments
  total_visits: number            // Total site visits
  total_quotation_value: number   // Sum of all quotation amounts
  total_sale_plan_value: number   // Sum of all sale plan amounts
  total_boq_value: number         // Sum of all BOQ/order amounts
  last_interaction_date?: string  // ISO 8601 datetime
}
```

### **TimelineEntry**
```typescript
interface TimelineEntry {
  id: string                      // Unique event ID
  event_type: 'appointment' | 'visit' | 'project_update' | 'quotation' | 'sale_plan' | 'contact' | 'note'
  title: string                   // Event title in Thai
  description?: string            // Optional detailed description
  timestamp: string               // ISO 8601 datetime
  actor_name?: string             // Person who performed/created the event
  reference_type?: string         // Entity type this event references
  reference_uuid?: string         // UUID of the referenced entity
  reference_url?: string           // Frontend URL path to the referenced entity
}
```

### **CustomerQuotation**
```typescript
interface CustomerQuotation {
  uuid: string
  quotation_no: string            // Document number (e.g., "QT-2026-001")
  quotation_date: string          // ISO 8601 date
  project_name?: string
  total_amount: number
  status_name?: string            // e.g., "เสนอราคา", "อนุมัติ", "ปิดกิจการ"
  sale_name?: string              // Salesperson name
}
```

### **CustomerSalePlan**
```typescript
interface CustomerSalePlan {
  id: number
  project_name: string
  period_month: string            // "YYYY-MM" format
  total_amount: number
  line_count: number              // Number of BOQ lines in this plan
  note?: string
}
```

### **CustomerOrder**
```typescript
interface CustomerOrder {
  id: number
  project_name: string
  boq_name?: string
  quantity: number
  unit_price: number
  total: number
  date: string                    // ISO 8601 date
  status?: string                 // e.g., "ดำเนินการ", "แล้วเสร็จ"
}
```

### **CustomerProject**
```typescript
interface CustomerProject {
  id: number
  name: string
  code: string                    // Project code (e.g., "PRJ-001")
  status?: string                 // e.g., "กำลังดำเนินการ", "แล้วเสร็จ"
}
```

### **CustomerContact**
```typescript
interface CustomerContact {
  id: number
  contact_name: string            // Full name
  phone?: string
  email?: string
  position?: string               // Job position / role
  is_primary?: boolean            // Whether this is the primary contact
}
```

### **CustomerVisit**
```typescript
interface CustomerVisit {
  id: string
  title: string
  description?: string
  date: string                    // ISO 8601 datetime
  visitor_name?: string           // Person who made the visit
}
```

### **CustomerAnalytics**
```typescript
interface CustomerAnalytics {
  total_customers: number
  active_customers: number
  inactive_customers: number
  new_customers_this_month: number
  customers_by_province: Array<{ province: string; count: number }>
  customers_by_district: Array<{ district: string; count: number }>
  new_customers_over_time: Array<{ month: string; count: number }>
  top_customers_by_value: Array<{
    customer: CustomerShort
    total_value: number
  }>
  customers_by_project_count: Array<{ range: string; count: number }>
  acquisition_trend: Array<{ month: string; cumulative: number }>
}
```

### **SleepingCustomer**
```typescript
interface SleepingCustomer {
  uuid: string
  customer_name: string
  customer_code: string
  phone?: string
  last_interaction_date: string   // ISO 8601 datetime
  days_since_last_interaction: number
  total_visits: number
  total_projects: number
}
```

### **CustomerPurchaseTrend**
```typescript
interface CustomerPurchaseTrend {
  month: string                    // "YYYY-MM" format
  amount: number                   // Total purchase amount for the month
}
```

### **CustomerTopProduct**
```typescript
interface CustomerTopProduct {
  product_name: string              // Product name in Thai
  quantity: number                  // Units purchased
  total_amount: number              // Total purchase amount
}
```

### **CustomerPaymentBehavior**
```typescript
interface CustomerPaymentBehavior {
  on_time_payment_pct: number      // Percentage 0–100
  avg_overdue_days: number         // Average days overdue
  total_invoices: number           // Total invoices in period
  overdue_invoices: number         // Number of overdue invoices
}
```

---

## ⚠️ Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CUSTOMER_NOT_FOUND` | 404 | Customer UUID does not exist |
| `VALIDATION_ERROR` | 422 | Request parameter validation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 🔄 Business Logic Notes

### Aggregated Fields (not stored — computed at query time)
- `total_projects` — COUNT of projects WHERE customer_uuid = ?
- `total_quotations` — COUNT of quotations WHERE customer_uuid = ?
- `total_sale_plans` — COUNT of sale plans WHERE customer_uuid = ?
- `total_orders` — COUNT of orders/BOQ items WHERE customer_uuid = ?
- `total_contacts` — COUNT of contacts WHERE customer_uuid = ?
- `total_visits` — COUNT of visits WHERE customer_uuid = ?
- `total_quotation_value` — SUM of quotation amounts
- `total_sale_plan_value` — SUM of sale plan amounts
- `total_boq_value` — SUM of order line totals

### Sleeping Customer Logic
- `days_since_last_interaction` = CURRENT_DATE - MAX(timeline.timestamp)
- Threshold default: 365 days (configurable via `sleeping_threshold_days` / `threshold_days`)
- A customer is "sleeping" if they have no interaction of any type (visit, quotation, sale plan, order, appointment) within the threshold

### Timeline Aggregation
Timeline is built by UNION of events from:
- appointments (nัดหมาย)
- visits (เข้าเยี่ยม)
- project updates
- quotations
- sale plans
- contacts (new contact added)
- notes

All sorted by `timestamp` descending.

---

## 🚀 Performance Considerations

### Caching Strategy
- Customer detail: Cache for 5 minutes (infrequently changed)
- Customer list/search: No cache (dynamic queries)
- Overview/analytics: Cache for 15 minutes (aggregated data)
- Timeline: No cache (frequently updated)
- Related entities: Cache for 5 minutes

### Pagination
- Default page size: 20 items
- Max page size: 100 items for lists, 50 for timeline
- Use `has_more` flag for infinite scroll / load-more UX

### Rate Limiting
- GET requests: 120 per minute
- Analytics endpoints: 30 per minute

---

**API Version**: v2
**Last Updated**: June 4, 2026
**Status**: Ready for Implementation
