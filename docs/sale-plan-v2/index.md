---
layout: default
title: Sale Plan v2 Documentation
---

# Sale Plan v2 - Excel-style Table Implementation

📋 **Complete specification package for backend development**

## 🚀 Critical for Backend Implementation

### **Priority 1 - Must Read:**
- **[📡 API Specification](02-API-SPECIFICATION.html)** - 5 endpoints with request/response schemas
- **[🗄️ Database Schema](04-DATABASE-SCHEMA.html)** - Tables, indexes, and constraints  
- **[💡 Business Logic](05-BUSINESS-LOGIC.html)** - Validation rules and calculations

### **Priority 2 - Coordination:**
- **[🤝 Integration Guide](06-INTEGRATION-GUIDE.html)** - Step-by-step workflow
- **[📊 Project Overview](01-PROJECT-OVERVIEW.html)** - Background and goals

### **Priority 3 - Reference:**
- **[🎨 UI Mockups](03-UI-MOCKUPS.html)** - Frontend design specifications
- **[🧪 Test Specification](07-TEST-SPECIFICATION.html)** - Testing strategy

---

## 📊 Implementation Overview

### **Key Technical Details:**
- **Module**: `crm`
- **API Base**: `/crm/v2/projects/{projectId}/saleplan-v2`
- **Authentication**: Bearer token + X-Merchant-UID header
- **Data Structure**: Matrix format `planMatrix[boqId][monthValue] = amount`
- **Database**: PostgreSQL recommended

### **Status:**
- **Frontend**: ✅ Complete (working prototype)
- **Backend**: ⏳ Ready for implementation
- **Documentation**: ✅ Complete specification

---

## 🎯 Quick Implementation Steps

### **Step 1: Database Setup**
```sql
-- See Database Schema for complete setup
CREATE TABLE saleplan_v2_headers (...);
CREATE TABLE saleplan_v2_entries (...);
```

### **Step 2: API Development**
```
GET  /crm/v2/projects/{id}/saleplan-v2     -- Load planning matrix
POST /crm/v2/projects/{id}/saleplan-v2     -- Save planning data
```

### **Step 3: Business Logic**
```
Matrix validation, Thai date formatting, calculation rules
```

---

## 🔗 Live Demo

- **Frontend Prototype**: http://localhost:3031/projects/123/edit?tab=plan-v2
- **Features**: Excel-style table, mobile responsive, real-time validation
- **Status**: Working with mock data, ready for API integration

---

**🚀 Ready to implement! Start with the API Specification document.**

[← Back to Main Documentation](../)