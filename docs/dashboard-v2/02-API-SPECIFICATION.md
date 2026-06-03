# Dashboard v2 - API Specification

## 📡 API Endpoints Overview

**Base URL**: `/crm/v2/dashboard`  
**Module**: `crm`  
**Authentication**: Bearer token + X-Merchant-UID header

## 🔑 Core Endpoints

### **1. Get Dashboard Overview (KPI Summary)**
```http
GET /crm/v2/dashboard/overview
```

**Description**: Load summary KPI cards for Visits, Customers, and Revenue metrics

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `team_id` | int | No | All teams | Filter by specific team |
| `from` | string | No | Start of month | ISO date `YYYY-MM-DD` |
| `to` | string | No | Today | ISO date `YYYY-MM-DD` |

**Headers**:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Dashboard overview loaded successfully",
  "data": {
    "visits": {
      "total": 156,
      "completed": 124,
      "planned": 180,
      "completionRate": 68.89,
      "byType": {
        "call": 45,
        "onsite": 62,
        "other": 17
      },
      "avgDuration": 35
    },
    "customers": {
      "active": 89,
      "newAcquired": 12,
      "visitFrequency": 1.75,
      "retentionRate": 94.2
    },
    "revenue": {
      "total": 2850000.00,
      "target": 3500000.00,
      "achievement": 81.43,
      "perVisit": 18269.23,
      "trend": "up"
    },
    "period": {
      "from": "2026-06-01",
      "to": "2026-06-30"
    },
    "teamFilter": null
  }
}
```

**Response Error (400)**:
```json
{
  "status": false,
  "message": "Invalid date range",
  "error_code": "INVALID_DATE_RANGE"
}
```

---

### **2. Get Time-Series Data**
```http
GET /crm/v2/dashboard/timeseries
```

**Description**: Load time-series chart data for specified metric and interval

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `team_id` | int | No | All teams | Filter by team |
| `metric` | string | Yes | — | `visits`, `customers`, `revenue` |
| `interval` | string | No | `daily` | `daily`, `weekly`, `monthly` |
| `from` | string | No | 30 days ago | ISO date `YYYY-MM-DD` |
| `to` | string | No | Today | ISO date `YYYY-MM-DD` |
| `page` | int | No | 1 | Page number |
| `size` | int | No | 31 | Items per page (max 365) |

**Headers**:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Time-series data loaded successfully",
  "data": {
    "metric": "revenue",
    "interval": "daily",
    "datapoints": [
      {
        "date": "2026-06-01",
        "value": 95000.00,
        "label": "1 มิ.ย. 69"
      },
      {
        "date": "2026-06-02",
        "value": 120000.00,
        "label": "2 มิ.ย. 69"
      },
      {
        "date": "2026-06-03",
        "value": 85000.00,
        "label": "3 มิ.ย. 69"
      }
    ],
    "summary": {
      "total": 2850000.00,
      "average": 95000.00,
      "min": 45000.00,
      "max": 180000.00,
      "trend": "up",
      "changePercent": 12.5
    },
    "pagination": {
      "page": 1,
      "size": 31,
      "total": 90,
      "totalPages": 3
    }
  }
}
```

---

### **3. Get Active Projects** (Reference existing endpoint)
```http
GET /crm/v2/dashboard/active-projects
```

**Description**: Load active projects list with team filter (extends existing Postman collection endpoint)

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `team_id` | int | No | All teams | NEW: Filter by team |
| `top` | int | No | 10 | Number of items |
| `sort` | string | No | `created_at` | `created_at`, `updated_at`, `budget`, `last_visit_date` |
| `order` | string | No | `desc` | `asc`, `desc` |

**Headers**:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Active projects loaded successfully",
  "data": [
    {
      "id": 3150,
      "merchant_uid": "11de4be2-cee5-41b3-9385-45189e8038ca",
      "code": "PJ2024-0018",
      "name": "WG-Server-098",
      "description": "โครงการติดตั้งเซิร์ฟเวอร์และระบบเครือข่าย",
      "org_contact_id": 1285,
      "org_contact_name": "พจก.ร้อยรี. 999",
      "team_id": 44,
      "team_name": "โครงการ(งานขนาดใหญ่)",
      "status": "active",
      "budget": 2500000.00,
      "progress": 65,
      "last_visit_date": "2026-06-15",
      "created_at": "2026-04-16T07:00:00.000+0700",
      "updated_at": "2026-06-15T14:30:00.000+0700"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### **4. Get Recent Activity Feed**
```http
GET /crm/v2/dashboard/recent-activity
```

**Description**: Load cross-project activity timeline

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `team_id` | int | No | All teams | Filter by team |
| `page` | int | No | 1 | Page number |
| `size` | int | No | 20 | Items per page (max 50) |

**Headers**:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Recent activity loaded successfully",
  "data": {
    "activities": [
      {
        "id": 5001,
        "type": "visit_completed",
        "title": "เยี่ยมชมโครงการ WG-Server-098",
        "description": "พนักงานสมชาย เยี่ยมชมโครงการ ติดตั้งเซิร์ฟเวอร์",
        "project_id": 3150,
        "project_name": "WG-Server-098",
        "team_name": "โครงการ(งานขนาดใหญ่)",
        "user_name": "สมชาย ใจดี",
        "timestamp": "2026-06-16T10:30:00.000+0700",
        "timestamp_display": "วันนี้ 10:30 น."
      },
      {
        "id": 5000,
        "type": "appointment_created",
        "title": "นัดหมายใหม่: ประชุมลูกค้า",
        "description": "นัดหมายกับ บริษัท ABC วันที่ 17 มิ.ย. 69",
        "project_id": null,
        "project_name": null,
        "team_name": "ปลีก(สนญ)",
        "user_name": "วิภา มั่นคง",
        "timestamp": "2026-06-16T09:15:00.000+0700",
        "timestamp_display": "วันนี้ 09:15 น."
      },
      {
        "id": 4998,
        "type": "revenue_recorded",
        "title": "บันทึกรายได้: 150,000 ฿",
        "description": "บันทึกรายได้จากลูกค้า ห้างทองแจ๊คพ็อต",
        "project_id": 3148,
        "project_name": "ห้างทองแจ๊คพ็อต สาขา 2",
        "team_name": "ส่งร้านค้า(ค้าช่วง)",
        "user_name": "ประสิทธิ์ รวยเร็ว",
        "timestamp": "2026-06-15T16:45:00.000+0700",
        "timestamp_display": "เมื่อวาน 16:45 น."
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

### **5. Get Today's Appointments**
```http
GET /crm/v2/dashboard/today-appointments
```

**Description**: Load today's visit schedule

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `team_id` | int | No | All teams | Filter by team |

**Headers**:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Today's appointments loaded successfully",
  "data": [
    {
      "id": 801,
      "type": "onsite",
      "type_display": "เยี่ยมสถานที่",
      "title": "ประชุมติดตามงาน โครงการ ABC",
      "customer_name": "บริษัท ABC จำกัด",
      "customer_phone": "02-123-4567",
      "project_id": 3150,
      "project_name": "WG-Server-098",
      "team_name": "โครงการ(งานขนาดใหญ่)",
      "assigned_to": "สมชาย ใจดี",
      "start_time": "09:00",
      "end_time": "11:00",
      "status": "pending",
      "location": "ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ"
    },
    {
      "id": 802,
      "type": "call",
      "type_display": "โทรศัพท์",
      "title": "โทรติดตามยอดขาย",
      "customer_name": "ห้างทองแจ๊คพ็อต",
      "customer_phone": "08-1983-8838",
      "project_id": null,
      "project_name": null,
      "team_name": "ส่งร้านค้า(ค้าช่วง)",
      "assigned_to": "ประสิทธิ์ รวยเร็ว",
      "start_time": "13:00",
      "end_time": "13:30",
      "status": "completed"
    },
    {
      "id": 803,
      "type": "other",
      "type_display": "อื่นๆ",
      "title": "ส่งเอกสารใบเสนอราคา",
      "customer_name": "ร้านเจ๊กี่ การค้า",
      "customer_phone": null,
      "project_id": null,
      "project_name": null,
      "team_name": "ปลีก(สนญ)",
      "assigned_to": "วิภา มั่นคง",
      "start_time": "14:00",
      "end_time": "15:00",
      "status": "pending"
    }
  ]
}
```

---

### **6. Get Team Performance Comparison**
```http
GET /crm/v2/dashboard/team-performance
```

**Description**: Load 4-team performance comparison data

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | string | No | Start of month | ISO date `YYYY-MM-DD` |
| `to` | string | No | Today | ISO date `YYYY-MM-DD` |

**Headers**:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Team performance loaded successfully",
  "data": {
    "period": {
      "from": "2026-06-01",
      "to": "2026-06-30"
    },
    "teams": [
      {
        "team_id": 1,
        "team_name": "ปลีก(สนญ)",
        "team_color": "#3B82F6",
        "metrics": {
          "visits": {
            "total": 52,
            "completed": 40,
            "planned": 55,
            "completionRate": 72.73
          },
          "customers": {
            "active": 32,
            "newAcquired": 5,
            "visitFrequency": 1.63
          },
          "revenue": {
            "total": 850000.00,
            "target": 1000000.00,
            "achievement": 85.00,
            "trend": "up"
          }
        },
        "members": [
          {
            "user_id": 101,
            "name": "สมชาย ใจดี",
            "visitCount": 15,
            "revenue": 320000.00,
            "achievement": 91.4
          },
          {
            "user_id": 102,
            "name": "วิภา มั่นคง",
            "visitCount": 12,
            "revenue": 280000.00,
            "achievement": 80.0
          }
        ],
        "rank": 2,
        "score": 78.5
      },
      {
        "team_id": 2,
        "team_name": "ปลีก(สันกำแพง)",
        "team_color": "#22C55E",
        "metrics": {
          "visits": {
            "total": 38,
            "completed": 30,
            "planned": 40,
            "completionRate": 75.00
          },
          "customers": {
            "active": 22,
            "newAcquired": 3,
            "visitFrequency": 1.73
          },
          "revenue": {
            "total": 620000.00,
            "target": 800000.00,
            "achievement": 77.50,
            "trend": "flat"
          }
        },
        "members": [
          {
            "user_id": 201,
            "name": "ก้องเกียรติ มีทรัพย์",
            "visitCount": 10,
            "revenue": 210000.00,
            "achievement": 70.0
          }
        ],
        "rank": 3,
        "score": 72.1
      },
      {
        "team_id": 44,
        "team_name": "โครงการ(งานขนาดใหญ่)",
        "team_color": "#A855F7",
        "metrics": {
          "visits": {
            "total": 42,
            "completed": 36,
            "planned": 45,
            "completionRate": 80.00
          },
          "customers": {
            "active": 18,
            "newAcquired": 2,
            "visitFrequency": 2.33
          },
          "revenue": {
            "total": 950000.00,
            "target": 1200000.00,
            "achievement": 79.17,
            "trend": "up"
          }
        },
        "members": [
          {
            "user_id": 301,
            "name": "ประสิทธิ์ รวยเร็ว",
            "visitCount": 14,
            "revenue": 480000.00,
            "achievement": 95.0
          }
        ],
        "rank": 1,
        "score": 82.3
      },
      {
        "team_id": 4,
        "team_name": "ส่งร้านค้า(ค้าช่วง)",
        "team_color": "#F97316",
        "metrics": {
          "visits": {
            "total": 24,
            "completed": 18,
            "planned": 30,
            "completionRate": 60.00
          },
          "customers": {
            "active": 17,
            "newAcquired": 2,
            "visitFrequency": 1.41
          },
          "revenue": {
            "total": 430000.00,
            "target": 500000.00,
            "achievement": 86.00,
            "trend": "down"
          }
        },
        "members": [
          {
            "user_id": 401,
            "name": "มานะ ขยันดี",
            "visitCount": 8,
            "revenue": 180000.00,
            "achievement": 72.0
          }
        ],
        "rank": 4,
        "score": 68.9
      }
    ]
  }
}
```

---

### **7. Get Budget Proportion**
```http
GET /crm/v2/dashboard/budget-proportion
```

**Description**: Load proportion comparison of Project Amount, BOQ Amount, and Sale Plan Amount

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `team_id` | int | No | All teams | Filter by specific team |

**Headers**:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Budget proportion loaded successfully",
  "data": {
    "total_project_amount": 21000000.00,
    "total_boq_amount": 14200000.00,
    "total_saleplan_amount": 10550000.00,
    "by_team": [
      {
        "team_id": 1,
        "team_name": "ปลีก(สนญ)",
        "project_amount": 5000000.00,
        "boq_amount": 3200000.00,
        "saleplan_amount": 2200000.00
      },
      {
        "team_id": 2,
        "team_name": "ปลีก(สันกำแพง)",
        "project_amount": 3500000.00,
        "boq_amount": 2100000.00,
        "saleplan_amount": 1400000.00
      },
      {
        "team_id": 3,
        "team_name": "โครงการ(งานขนาดใหญ่)",
        "project_amount": 8000000.00,
        "boq_amount": 6400000.00,
        "saleplan_amount": 5600000.00
      },
      {
        "team_id": 4,
        "team_name": "ส่งร้านค้า(ค้าช่วง)",
        "project_amount": 4500000.00,
        "boq_amount": 2500000.00,
        "saleplan_amount": 1350000.00
      }
    ]
  }
}
```

**Response Error (400)**:
```json
{
  "status": false,
  "message": "Team not found",
  "error_code": "TEAM_NOT_FOUND"
}
```

---

## 📋 Data Models

### **KPIMetrics Type**
```typescript
interface KPIMetrics {
  visits: {
    total: number
    completed: number
    planned: number
    completionRate: number
    byType: {
      call: number
      onsite: number
      other: number
    }
    avgDuration: number
  }
  customers: {
    active: number
    newAcquired: number
    visitFrequency: number
    retentionRate: number
  }
  revenue: {
    total: number
    target: number
    achievement: number
    perVisit: number
    trend: 'up' | 'down' | 'flat'
  }
}
```

### **TimeSeriesDatapoint Type**
```typescript
interface TimeSeriesDatapoint {
  date: string           // "2026-06-01"
  value: number          // Metric value
  label: string          // "1 มิ.ย. 69" (Thai formatted)
}
```

### **TimeSeriesSummary Type**
```typescript
interface TimeSeriesSummary {
  total: number
  average: number
  min: number
  max: number
  trend: 'up' | 'down' | 'flat'
  changePercent: number   // Percentage change vs previous period
}
```

### **ActiveProject Type**
```typescript
interface ActiveProject {
  id: number
  merchant_uid: string
  code: string
  name: string
  description?: string
  org_contact_id: number
  org_contact_name: string
  team_id: number
  team_name: string
  status: string
  budget?: number
  progress?: number       // 0-100 percentage
  last_visit_date?: string
  created_at: string
  updated_at: string
}
```

### **ActivityItem Type**
```typescript
type ActivityType = 'visit_completed' | 'appointment_created' | 'revenue_recorded' | 'customer_created' | 'project_updated' | 'visit_planned'

interface ActivityItem {
  id: number
  type: ActivityType
  title: string
  description: string
  project_id: number | null
  project_name: string | null
  team_name: string
  user_name: string
  timestamp: string
  timestamp_display: string
}
```

### **AppointmentItem Type**
```typescript
type AppointmentType = 'call' | 'onsite' | 'other'

interface AppointmentItem {
  id: number
  type: AppointmentType
  type_display: string       // "เยี่ยมสถานที่", "โทรศัพท์", "อื่นๆ"
  title: string
  customer_name: string
  customer_phone: string | null
  project_id: number | null
  project_name: string | null
  team_name: string
  assigned_to: string
  start_time: string         // "09:00"
  end_time: string           // "11:00"
  status: 'pending' | 'completed' | 'cancelled'
  location?: string          // Only for 'onsite' type
}
```

### **BudgetProportion Type**
```typescript
interface BudgetProportion {
  total_project_amount: number     // Total project budget across all/filtered teams
  total_boq_amount: number         // Total BOQ amount across all/filtered teams
  total_saleplan_amount: number    // Total Sale Plan amount across all/filtered teams
  by_team: TeamBudgetProportion[]  // Breakdown per team
}

interface TeamBudgetProportion {
  team_id: number
  team_name: string
  project_amount: number           // This team's total project budget
  boq_amount: number               // This team's total BOQ amount
  saleplan_amount: number          // This team's total Sale Plan amount
}
```

### **TeamPerformance Type**
```typescript
interface TeamPerformance {
  team_id: number
  team_name: string
  team_color: string
  metrics: KPIMetrics
  members: MemberPerformance[]
  rank: number
  score: number              // Composite performance score 0-100
}

interface MemberPerformance {
  user_id: number
  name: string
  visitCount: number
  revenue: number
  achievement: number        // Revenue achievement %
}
```

## ⚠️ Error Handling

### **Error Codes**:
- `INVALID_DATE_RANGE`: From date is after to date
- `INVALID_METRIC`: Unrecognized metric name
- `INVALID_INTERVAL`: Unrecognized interval value
- `TEAM_NOT_FOUND`: Team ID doesn't exist
- `UNAUTHORIZED`: Invalid authentication
- `FORBIDDEN`: Insufficient permissions (e.g., member accessing other teams)
- `INTERNAL_ERROR`: Server error

### **Validation Rules**:

1. **Date Format**: Must be ISO `YYYY-MM-DD`
2. **Date Range**: `from` must be before `to`, max 365 day range
3. **Team Access**: Members can only view own team, leaders can view own team + members, managers can view all
4. **Metric Values**: Only `visits`, `customers`, `revenue`
5. **Interval Values**: Only `daily`, `weekly`, `monthly`
6. **Pagination**: Page minimum 1, size max 365 for timeseries, max 50 for activity

## 🔄 Request/Response Patterns

### **Standard Headers**:
```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
Accept: application/json
```

### **Success Response Pattern**:
```json
{
  "status": true,
  "message": "Human-readable success message",
  "data": {
    // Actual response data
  }
}
```

### **Error Response Pattern**:
```json
{
  "status": false,
  "message": "Human-readable error message",
  "error_code": "MACHINE_READABLE_CODE",
  "data": {
    // Error details (optional)
  }
}
```

## 🚀 Performance Considerations

### **Caching Strategy**:
- Overview KPI: Cache for 5 minutes (frequently updated)
- Time-series: Cache for 15 minutes (historical data)
- Active projects: Cache for 5 minutes
- Recent activity: Cache for 1 minute (real-time feed)
- Today appointments: Cache for 30 seconds (near real-time)
- Team performance: Cache for 5 minutes
- Budget proportion: Cache for 15 minutes (stable financial data)

### **Pagination**:
- Activity feed: 20 items default, max 50
- Time-series: 31 items default, max 365
- Active projects: 10 items default, max 50

### **Rate Limiting**:
- GET requests: 120 per minute
- All endpoints are read-only (GET)

### **Payload Limits**:
- Max query parameter length: 2048 characters
- Time-series date range: max 365 days
- Response timeout: 10 seconds

## 🧪 Testing

### **Test Data Requirements**:
- 4 teams with varying performance data
- Mix of visit types (call, onsite, other)
- Date range spanning multiple months
- Edge cases: empty teams, zero values
- Error scenarios: invalid team, out-of-range dates

### **Mock Responses Available**:
All endpoints have corresponding mock responses for frontend development.

---

**API Version**: v2  
**Last Updated**: June 2, 2026  
**Contact**: Frontend team for coordination with backend team
