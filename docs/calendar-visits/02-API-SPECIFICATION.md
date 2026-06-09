# Calendar + Visits Integration — API Specification

## 📡 API Endpoints Overview

**Base URL**: `/crm/v2`  
**Authentication**: Bearer token (`Authorization: Bearer {accessToken}`) + `X-Merchant-UID` header  
**Content-Type**: `application/json`  
**Accept**: `application/json`

### Endpoint Map

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crm/v2/calendar-events?from=&to=&team_id=` | **Unified calendar feed** — returns both appointments + visits |
| GET | `/crm/v2/appointments?from=&to=&team_id=&search=&page=&size=` | Appointment list (paginated, filterable) |
| GET | `/crm/v2/appointments/:id` | Single appointment detail |
| POST | `/crm/v2/appointments` | Create appointment |
| PUT | `/crm/v2/appointments/:id` | Update appointment |
| DELETE | `/crm/v2/appointments/:id` | Delete appointment |
| GET | `/crm/v2/visits?from=&to=&team_id=&search=&page=&size=` | Visit list (paginated, filterable) |
| GET | `/crm/v2/visits/:id` | Single visit detail |
| POST | `/crm/v2/visits` | Create visit |
| PUT | `/crm/v2/visits/:id` | Update visit |
| DELETE | `/crm/v2/visits/:id` | Delete visit |
| GET | `/crm/v2/visits/:id/photos?page=&size=` | Visit photo gallery |

---

## 1. GET /crm/v2/calendar-events — Unified Calendar Feed

**The primary endpoint for the Calendar page.** Returns both appointments and visits in a single, unified response with an `event_type` discriminator.

### Request

```http
GET /crm/v2/calendar-events?from=2026-06-01&to=2026-06-30&team_id=5
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string (YYYY-MM-DD) | ✅ | Start date (inclusive) |
| `to` | string (YYYY-MM-DD) | ✅ | End date (inclusive) |
| `team_id` | integer | ❌ | Filter by team (optional for team calendar) |

### Response (200)

```json
{
  "status": true,
  "message": "success",
  "data": [
    {
      "id": 101,
      "event_type": "appointment",
      "appointment_id": 101,
      "visit_id": null,
      "title": "โทรติดตามโครงการ ABC",
      "starts_at": "2026-06-10T14:00:00Z",
      "ends_at": "2026-06-10T15:00:00Z",
      "appointment_type": "call",
      "visit_type": null,
      "status": "planned",
      "location": "สำนักงานใหญ่",
      "address_text": null,
      "description": "ติดตามความคืบหน้างานโครงสร้าง",
      "color": "#3B82F6",
      "geo_lat": null,
      "geo_lng": null,
      "contact_info": {
        "name": "คุณสมชาย ใจดี",
        "phone": "081-234-5678"
      },
      "contact_name": "คุณสมชาย ใจดี",
      "project_id": 123,
      "project_name": "โครงการ ABC",
      "team_id": 5,
      "team_name": "ทีมขายกรุงเทพ",
      "owner_user_id": 1,
      "owner_user_info": {
        "id": 1,
        "name": "สมศรี",
        "picture_url": "https://cdn.sys9.co/avatars/1.jpg"
      },
      "org_contact_id": 50,
      "org_contact_name": "บริษัท ไทยคอนสตรัคชั่น จำกัด"
    },
    {
      "id": 201,
      "event_type": "visit",
      "appointment_id": null,
      "visit_id": 201,
      "title": "เยี่ยมหน้างานโครงการ ABC",
      "starts_at": "2026-06-12T09:00:00Z",
      "ends_at": "2026-06-12T12:00:00Z",
      "appointment_type": null,
      "visit_type": "onsite",
      "status": "in_progress",
      "location": null,
      "address_text": "123 หมู่ 5 ถ.สุขาภิบาล ต.บางพลี อ.บางพลี จ.สมุทรปราการ",
      "description": "ตรวจความคืบหน้ารอบ 2",
      "color": "#F97316",
      "geo_lat": 13.6138,
      "geo_lng": 100.6561,
      "contact_info": null,
      "contact_name": "คุณสมศรี",
      "project_id": 123,
      "project_name": "โครงการ ABC",
      "team_id": 5,
      "team_name": "ทีมขายกรุงเทพ",
      "owner_user_id": 1,
      "owner_user_info": {
        "id": 1,
        "name": "สมศรี",
        "picture_url": "https://cdn.sys9.co/avatars/1.jpg"
      },
      "org_contact_id": 50,
      "org_contact_name": "บริษัท ไทยคอนสตรัคชั่น จำกัด"
    }
  ]
}
```

### ⚠️ Backend Gaps — Appointment Events

เมื่อส่ง appointment events ใน `/calendar-events` response **ต้องเพิ่ม field ต่อไปนี้** ซึ่งปัจจุบันมีใน appointment DB แต่ยังไม่ถูกส่งออกมา:

| # | Field | Type | Source in Appointment DB | Severity |
|---|-------|------|--------------------------|----------|
| 1 | `appointment_type` | `"call" | "onsite" | "other"` | `appointments.appointment_type` | 🔴 |
| 2 | `location` | string | `appointments.location` | 🔴 |
| 3 | `color` | string (hex) | `appointments.color` (default `#3B82F6`) | 🟡 |
| 4 | `geo_lat` | number | `appointments.geo_lat` | 🟡 |
| 5 | `geo_lng` | number | `appointments.geo_lng` | 🟡 |
| 6 | `contact_info` | object `{ name, phone }` | Join from `contacts` table | 🟢 |

**Without these fields, the frontend cannot:**
- Display appointment type icon (🔴 `appointment_type` — critical)
- Show location text (🔴 `location` — critical)
- Render correct color bar (🟡 `color` — medium)
- Show map pin for onsite appointments (🟡 `geo_lat`/`geo_lng` — medium)
- Display contact card (🟢 `contact_info` — low)

---

## 2. GET /crm/v2/appointments — Appointment Endpoints

### 2.1 List Appointments

```http
GET /crm/v2/appointments?from=2026-06-01&to=2026-06-30&team_id=5&search=โครงการ&page=1&size=50
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string (YYYY-MM-DD) | ❌ | Start date |
| `to` | string (YYYY-MM-DD) | ❌ | End date |
| `team_id` | integer | ❌ | Filter by team |
| `search` | string | ❌ | Search by title / contact |
| `page` | integer | ❌ | Page number (default 1) |
| `size` | integer | ❌ | Page size (default 50, max 1000) |

**Response (200):**
```json
{
  "status": true,
  "message": "success",
  "data": [
    {
      "id": 101,
      "title": "โทรติดตามโครงการ ABC",
      "appointment_type": "call",
      "status": "planned",
      "starts_at": "2026-06-10T14:00:00Z",
      "ends_at": "2026-06-10T15:00:00Z",
      "location": "สำนักงานใหญ่",
      "address_text": null,
      "description": "ติดตามความคืบหน้างานโครงสร้าง",
      "color": "#3B82F6",
      "geo_lat": null,
      "geo_lng": null,
      "team_name": "ทีมขายกรุงเทพ",
      "owner_user_id": 1,
      "owner_user_name": "สมศรี",
      "owner_user_info": {
        "id": 1,
        "name": "สมศรี",
        "picture_url": "https://cdn.sys9.co/avatars/1.jpg"
      },
      "project_id": 123,
      "project_name": "โครงการ ABC",
      "org_contact_id": 50,
      "contact_id": 10,
      "team_id": 5,
      "contact_name": "คุณสมชาย",
      "visit_id": null
    }
  ]
}
```

### 2.2 Get Single Appointment

```http
GET /crm/v2/appointments/101
```

**Response (200):**
```json
{
  "status": true,
  "message": "success",
  "data": {
    "id": 101,
    "title": "โทรติดตามโครงการ ABC",
    "appointment_type": "call",
    "status": "planned",
    "starts_at": "2026-06-10T14:00:00Z",
    "ends_at": "2026-06-10T15:00:00Z",
    "location": "สำนักงานใหญ่",
    "address_text": null,
    "description": "ติดตามความคืบหน้างานโครงสร้าง",
    "color": "#3B82F6",
    "geo_lat": null,
    "geo_lng": null,
    "org_contact_id": 50,
    "contact_id": 10,
    "team_id": 5,
    "owner_user_id": 1,
    "contact_name": "คุณสมชาย",
    "project_id": 123,
    "visit_id": 201
  }
}
```

### 2.3 Create Appointment

```http
POST /crm/v2/appointments
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "โทรติดตามโครงการ ABC",
  "description": "ติดตามความคืบหน้างานโครงสร้าง",
  "appointment_type": "call",
  "status": "planned",
  "starts_at": "2026-06-10T14:00:00Z",
  "ends_at": "2026-06-10T15:00:00Z",
  "org_contact_id": 50,
  "contact_id": 10,
  "team_id": 5,
  "owner_user_id": 1,
  "location": "สำนักงานใหญ่",
  "address_text": "",
  "geo_lat": 0,
  "geo_lng": 0,
  "color": "#3B82F6",
  "route_date": "2026-06-10T00:00:00Z"
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `title` | Required, max 255 chars |
| `appointment_type` | Required, must be `call`, `onsite`, or `other` |
| `starts_at` | Required, ISO 8601 |
| `ends_at` | Required, must be after `starts_at` |
| `location` | Required if `appointment_type=onsite`, max 500 chars |
| `color` | Optional, hex format default `#3B82F6` |

**Response (201):**
```json
{
  "status": true,
  "message": "สร้างการนัดหมายสำเร็จ",
  "data": {
    "id": 101
  }
}
```

### 2.4 Update Appointment

```http
PUT /crm/v2/appointments/101
```

**Request Body:** Same shape as POST (partial update supported)

### 2.5 Delete Appointment

```http
DELETE /crm/v2/appointments/101
```

**Response (200):**
```json
{
  "status": true,
  "message": "ลบการนัดหมายสำเร็จ"
}
```

---

## 3. GET /crm/v2/visits — Visit Endpoints

### 3.1 List Visits

```http
GET /crm/v2/visits?from=2026-06-01&to=2026-06-30&team_id=5&search=โครงการ&page=1&size=50
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string (YYYY-MM-DD) | ❌ | Start date |
| `to` | string (YYYY-MM-DD) | ❌ | End date |
| `team_id` | integer | ❌ | Filter by team |
| `search` | string | ❌ | Search by project / contact |
| `page` | integer | ❌ | Page number (default 1) |
| `size` | integer | ❌ | Page size (default 50, max 1000) |

**Response (200):**
```json
{
  "status": true,
  "message": "success",
  "data": [
    {
      "id": 201,
      "title": "เยี่ยมหน้างานโครงการ ABC",
      "visit_type": "onsite",
      "status": "in_progress",
      "progress_percent": 65,
      "project_name": "โครงการ ABC",
      "project_id": 123,
      "org_contact_name": "บริษัท ไทยคอนสตรัคชั่น จำกัด",
      "contact_name": "คุณสมศรี",
      "address_text": "123 หมู่ 5 ถ.สุขาภิบาล ต.บางพลี อ.บางพลี จ.สมุทรปราการ",
      "date": "2026-06-12",
      "starts_at": "2026-06-12T09:00:00Z",
      "ends_at": "2026-06-12T12:00:00Z",
      "team_name": "ทีมขายกรุงเทพ"
    }
  ]
}
```

### 3.2 Get Single Visit

```http
GET /crm/v2/visits/201
```

**Response (200):**
```json
{
  "status": true,
  "message": "success",
  "data": {
    "id": 201,
    "merchant_uid": "merchant-uuid",
    "title": "เยี่ยมหน้างานโครงการ ABC",
    "description": "ตรวจความคืบหน้ารอบ 2",
    "problem": "งานโครงสร้างล่าช้ากว่าแผน 2 สัปดาห์",
    "solution": "เร่งเพิ่มแรงงานอีก 5 คน",
    "boq_phase": "งานโครงสร้าง",
    "visit_type": "onsite",
    "status": "in_progress",
    "progress_percent": 65,
    "next_visit_date": "2026-06-26",
    "date": "2026-06-12",
    "starts_at": "2026-06-12T09:00:00Z",
    "ends_at": "2026-06-12T12:00:00Z",
    "org_contact_id": 50,
    "org_contact_name": "บริษัท ไทยคอนสตรัคชั่น จำกัด",
    "contact_id": 10,
    "contact_name": "คุณสมศรี",
    "project_id": 123,
    "project_name": "โครงการ ABC",
    "team_id": 5,
    "team_name": "ทีมขายกรุงเทพ",
    "owner_user_id": 1,
    "owner_user_info": {
      "id": 1,
      "name": "สมศรี",
      "picture_url": "https://cdn.sys9.co/avatars/1.jpg"
    },
    "address_text": "123 หมู่ 5 ถ.สุขาภิบาล ต.บางพลี อ.บางพลี จ.สมุทรปราการ",
    "province": "สมุทรปราการ",
    "geo_lat": 13.6138,
    "geo_lng": 100.6561,
    "check_in_at": "2026-06-12T09:05:00Z",
    "check_in_lat": 13.6139,
    "check_in_lng": 100.6562,
    "check_out_at": null,
    "check_out_lat": null,
    "check_out_lng": null
  }
}
```

### 3.3 Create Visit

```http
POST /crm/v2/visits
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "เยี่ยมหน้างานโครงการ ABC",
  "description": "",
  "problem": "",
  "solution": "",
  "boq_phase": "",
  "visit_type": "onsite",
  "status": "draft",
  "progress_percent": 0,
  "starts_at": "2026-06-12T09:00:00Z",
  "ends_at": "2026-06-12T12:00:00Z",
  "org_contact_id": 50,
  "contact_id": 10,
  "project_id": 123,
  "team_id": 5,
  "owner_user_id": 1,
  "address_text": "",
  "geo_lat": 0,
  "geo_lng": 0,
  "appointment_id": 101
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `visit_type` | Required, `call` or `onsite` |
| `status` | Required, one of `draft`, `planned`, `in_progress`, `done`, `cancelled` |
| `project_id` | Required |
| `starts_at` | Required |
| `ends_at` | Required, must be after `starts_at` |
| `appointment_id` | Optional — links visit back to source appointment |

### 3.4 Update Visit

```http
PUT /crm/v2/visits/201
```

**Request Body:** Same shape as POST (partial update supported)

### 3.5 Delete Visit

```http
DELETE /crm/v2/visits/201
```

**Response (200):**
```json
{
  "status": true,
  "message": "ลบการเข้าเยี่ยมสำเร็จ"
}
```

### 3.6 Get Visit Photos

```http
GET /crm/v2/visits/201/photos?page=1&size=100
```

**Response (200):**
```json
{
  "status": true,
  "message": "success",
  "data": [
    {
      "id": 1,
      "image_url": "https://cdn.sys9.co/visits/201/photo-1.jpg",
      "created_at": "2026-06-12T09:30:00Z"
    }
  ]
}
```

---

## 4. Data Models (TypeScript)

### CalendarEvent (Unified)

```typescript
interface CalendarEvent {
  /** Auto-generated ID */
  id: number
  /** Discriminator: tells frontend which entity this came from */
  event_type: 'appointment' | 'visit'
  /** FK to appointments table (null if visit) */
  appointment_id: number | null
  /** FK to visits table (null if appointment) */
  visit_id: number | null

  // Core fields
  title: string
  starts_at: string    // ISO 8601
  ends_at: string      // ISO 8601

  // Type differentiation
  appointment_type: 'call' | 'onsite' | 'other' | null   // null for visits
  visit_type: 'call' | 'onsite' | 'other' | null         // null for appointments
  status: string
  // appointment: "planned"
  // visit: "draft" | "planned" | "in_progress" | "done" | "cancelled"

  // Location
  location: string | null       // appointment place name (e.g., "สำนักงานใหญ่")
  address_text: string | null   // visit full address
  geo_lat: number | null
  geo_lng: number | null

  // Metadata
  description: string | null
  color: string | null          // hex color, frontend may override
  contact_info: {
    name: string
    phone: string
  } | null

  // Relations
  project_id: number | null
  project_name: string | null
  team_id: number | null
  team_name: string | null
  owner_user_id: number
  owner_user_info: {
    id: number
    name: string
    picture_url?: string
  }
  contact_name: string | null
  org_contact_id: number | null
  org_contact_name: string | null
}
```

### Color Assignment (Frontend Logic)

```typescript
function computeEventColor(event: CalendarEvent): string {
  if (event.event_type === 'appointment') {
    // Prefer API color, fallback to type-based
    return event.color ?? {
      'call': '#3B82F6',    // Blue
      'onsite': '#22C55E',  // Green
      'other': '#A855F7',   // Purple
    }[event.appointment_type ?? 'other']
  } else {
    // Visit — status-based colors
    return {
      'draft': '#9CA3AF',       // Gray
      'planned': '#2563EB',     // Blue
      'in_progress': '#F97316', // Orange
      'done': '#16A34A',        // Green
      'cancelled': '#EF4444',   // Red
    }[event.status] ?? '#9CA3AF'
  }
}
```

### Status Icons (Frontend Mapping)

```typescript
const APPOINTMENT_TYPE_ICONS = {
  call: Phone,     // lucide-vue-next
  onsite: MapPin,
  other: Users,
} as const

const VISIT_STATUS_ICONS = {
  draft: FileText,
  planned: Clock,
  in_progress: Clock2,
  done: CheckCircle2,
  cancelled: XCircle,
} as const
```

---

## 5. Request/Response Patterns

### Standard Headers

```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
Accept: application/json
```

### Standard Success Response

```json
{
  "status": true,
  "message": "Human-readable Thai message",
  "data": {
    // Response payload
  }
}
```

### Standard Error Response

```json
{
  "status": false,
  "message": "Human-readable Thai error message",
  "error_code": "MACHINE_READABLE_CODE",
  "data": {
    // Error details (optional)
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 6. Business Logic & Validation

### Appointment Status Flow

```
CREATE → planned (always)
```

Appointments are always `planned` — they represent scheduled future events.
When a visit is created from an appointment, `appointments.visit_id` links them.

### Visit Status Flow

```
CREATE → draft
         ↓
      planned → in_progress → done
         ↓                        ↑
      cancelled                   ↑
         ↑                        ↑
         └────────────────────────┘
          (can skip "planned" via check-in)
```

| Status transition | Trigger |
|-------------------|---------|
| draft → planned | User schedules visit date/time |
| planned → in_progress | Check-in (geo-verified) |
| in_progress → done | Check-out (geo-verified) |
| draft → cancelled | User cancels |
| planned → cancelled | User cancels |
| in_progress → cancelled | Admin force-cancel |
| done → (final) | Terminal state |

### Appointment → Visit Lifecycle

```
Appointment (planned)
  ├── type=call    → Visit (draft, visit_type=call)
  ├── type=onsite  → Visit (draft, visit_type=onsite)
  └── type=other   → Visit (draft, visit_type=other)

Visit (in_progress/done) ← check-in/out updates appointment status
```

### Team Calendar Logic

เมื่อใช้ทีมฟิลเตอร์ (`team_id=5`):
- `/calendar-events` จะกรองทั้ง appointment และ visit ที่มี `team_id=5`
- หน้า `SallerDetailView` ใช้สำหรับดูปฏิทินของทั้งทีม

---

## 7. Performance Considerations

### Caching Strategy
- Calendar events: No cache (real-time data)
- Appointment detail: Cache 30 seconds
- Visit detail: Cache 30 seconds
- Visit photos: Cache 5 minutes

### Pagination
- List endpoints: `page` + `size` (default 50, max 1000)
- Calendar events: No pagination (date-bounded, max 31 days)

### Rate Limiting
- GET: 120 requests/minute
- POST/PUT: 60 requests/minute
- DELETE: 30 requests/minute

---

**API Version**: v2  
**Last Updated**: June 10, 2026  
**Contact**: Frontend team → Backend team for coordination on filling API gaps
