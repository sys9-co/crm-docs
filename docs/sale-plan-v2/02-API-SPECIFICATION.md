# Sale Plan v2 - API Specification

## 📡 API Endpoints Overview

**Base URL**: `/crm/v2/projects/{projectId}/saleplan-v2`  
**Module**: `crm`  
**Authentication**: Bearer token + X-Merchant-UID header

## 🔑 Core Endpoints

### **1. Load Sale Plan Matrix**
```http
GET /crm/v2/projects/{projectId}/saleplan-v2
```

**Description**: Load complete planning matrix with timeline and BOQ data

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
  "message": "Load Sale Plan v2 successfully",
  "data": {
    "planMatrix": {
      "1": {
        "2026-06": 300000,
        "2026-07": 400000,
        "2026-08": 300000
      },
      "2": {
        "2026-06": 100000,
        "2026-07": 200000
      }
    },
    "timeline": [
      {
        "value": "2026-06",
        "name": "มิถุนายน 2569", 
        "displayShort": "มิ.ย. 69",
        "isInProject": true
      },
      {
        "value": "2026-07",
        "name": "กรกฎาคม 2569",
        "displayShort": "ก.ค. 69", 
        "isInProject": true
      }
    ],
    "boqItems": [
      {
        "id": 1,
        "name": "งานโครงสร้าง",
        "amount": 1500000,
        "planned": 1000000,
        "remaining": 500000,
        "percentage": 66.67
      },
      {
        "id": 2,
        "name": "งานตกแต่งภายใน", 
        "amount": 800000,
        "planned": 300000,
        "remaining": 500000,
        "percentage": 37.5
      }
    ],
    "projectInfo": {
      "id": 123,
      "name": "โครงการ ABC",
      "start_date": "2026-06-01",
      "end_date": "2026-10-31"
    }
  }
}
```

**Response Error (400)**:
```json
{
  "status": false,
  "message": "Project not found",
  "error_code": "PROJECT_NOT_FOUND"
}
```

---

### **2. Save Planning Matrix (Batch)**
```http
POST /crm/v2/projects/{projectId}/saleplan-v2
```

**Description**: Create or update entire planning matrix in batch operation

**Request Body**:
```json
{
  "planMatrix": {
    "1": {
      "2026-06": 350000,
      "2026-07": 450000,
      "2026-08": 250000
    },
    "2": {
      "2026-06": 120000,
      "2026-07": 180000,
      "2026-08": 300000
    }
  },
  "notes": "Updated Q3 projection based on latest requirements"
}
```

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Sale Plan v2 saved successfully", 
  "data": {
    "saved_entries": 6,
    "updated_entries": 4,
    "created_entries": 2,
    "validation_warnings": [
      {
        "boq_id": 2,
        "message": "เกิน BOQ 100,000 ฿ (12.5%)",
        "type": "over_allocation",
        "amount": 100000,
        "percentage": 12.5
      }
    ]
  }
}
```

**Response Error (422)**:
```json
{
  "status": false,
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "data": {
    "errors": {
      "planMatrix.1.2026-06": "Amount cannot be negative",
      "planMatrix.2.2026-13": "Invalid month format"
    }
  }
}
```

---

### **3. Update Planning Matrix**
```http
PUT /crm/v2/projects/{projectId}/saleplan-v2
```

**Description**: Update existing planning matrix (same as POST but requires existing record)

**Request/Response**: Same as POST endpoint above

---

### **4. Clear Month Data**
```http
DELETE /crm/v2/projects/{projectId}/saleplan-v2/{monthValue}
```

**Description**: Clear all planning data for specific month

**Path Parameters**:
- `monthValue`: Month in format "YYYY-MM" (e.g., "2026-06")

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Cleared data for มิถุนายน 2569",
  "data": {
    "cleared_entries": 5,
    "month": "2026-06"
  }
}
```

---

### **5. Get Planning Statistics**
```http
GET /crm/v2/projects/{projectId}/saleplan-v2/stats
```

**Description**: Get planning statistics and analytics

**Response Success (200)**:
```json
{
  "status": true,
  "message": "Statistics loaded successfully",
  "data": {
    "totalBOQAmount": 2300000,
    "totalPlannedAmount": 1800000,
    "remainingAmount": 500000,
    "overAllocatedBOQs": [
      {
        "boq_id": 2,
        "boq_name": "งานตกแต่งภายใน",
        "over_amount": 100000,
        "percentage": 112.5
      }
    ],
    "monthlyTotals": {
      "2026-06": 470000,
      "2026-07": 630000,
      "2026-08": 550000
    },
    "boqProgress": [
      {
        "boq_id": 1,
        "progress_percentage": 66.67,
        "status": "under"
      },
      {
        "boq_id": 2, 
        "progress_percentage": 112.5,
        "status": "over"
      }
    ]
  }
}
```

## 📋 Data Models

### **PlanMatrix Type**
```typescript
interface PlanMatrix {
  [boqId: number]: {
    [monthValue: string]: number  // Amount for BOQ in specific month
  }
}
```

### **TimelineMonth Type**
```typescript
interface TimelineMonth {
  value: string          // "2026-06"
  name: string           // "มิถุนายน 2569" 
  displayShort: string   // "มิ.ย. 69"
  isInProject: boolean   // Within project start-end dates
}
```

### **BOQItem Type**
```typescript
interface BOQItemV2 {
  id: number
  name: string
  amount: number           // Total BOQ amount
  planned: number          // Sum of planned amounts across months
  remaining: number        // amount - planned
  percentage: number       // planned / amount * 100
  status: 'under' | 'exact' | 'over' | 'empty'
}
```

### **ValidationWarning Type**
```typescript
interface ValidationWarning {
  boq_id?: number
  message: string
  type: 'over_allocation' | 'negative_amount' | 'invalid_month' | 'missing_boq'
  amount?: number
  percentage?: number
}
```

## ⚠️ Error Handling

### **Error Codes**:
- `PROJECT_NOT_FOUND`: Project ID doesn't exist
- `VALIDATION_ERROR`: Request data validation failed
- `BOQ_NOT_FOUND`: Referenced BOQ item doesn't exist  
- `INVALID_MONTH_FORMAT`: Month format not "YYYY-MM"
- `UNAUTHORIZED`: Invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

### **Validation Rules**:

1. **Month Format**: Must be "YYYY-MM" format
2. **Amount Values**: Cannot be negative, max 15 digits
3. **BOQ References**: All BOQ IDs must exist in project
4. **Date Range**: Months should be within reasonable project timeline
5. **Decimal Precision**: Max 2 decimal places for amounts

### **Business Logic Validation**:

1. **BOQ Overflow**: Warning when planned > BOQ amount (not blocking)
2. **Timeline Validation**: Month must be valid calendar month
3. **Project Access**: User must have access to project
4. **Merchant Scope**: Project must belong to merchant

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
- BOQ items: Cache for 1 hour
- Project info: Cache for 30 minutes  
- Planning matrix: No cache (frequently updated)

### **Pagination**: 
- Not applicable (single project scope)
- Timeline limited to project duration

### **Rate Limiting**:
- GET requests: 60 per minute
- POST/PUT requests: 30 per minute  
- DELETE requests: 10 per minute

### **Payload Limits**:
- Max matrix size: 50 BOQs × 36 months
- Max request size: 1MB
- Timeout: 30 seconds

## 🧪 Testing

### **Test Data Requirements**:
- Project with 3-5 BOQ items
- 6-month timeline for testing
- Various amount scenarios (under/over/exact)
- Invalid data for error testing

### **Mock Responses Available**:
All endpoints have corresponding mock responses for frontend development.

---

**API Version**: v2  
**Last Updated**: June 1, 2026  
**Contact**: Frontend team for coordination with backend team