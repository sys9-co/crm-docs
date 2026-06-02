---
layout: default
title: Dashboard v2 - KPI Command Center Documentation
---

# Dashboard v2 - KPI Command Center

📋 **Complete specification package for backend development**

## 🚀 Critical for Backend Implementation

### **Priority 1 - Must Read:**
- **[📡 API Specification](02-API-SPECIFICATION.html)** - 6 endpoints with request/response schemas
- **[🗄️ Database Schema](04-DATABASE-SCHEMA.html)** - Tables, indexes, and performance optimization
- **[💡 Business Logic](05-BUSINESS-LOGIC.html)** - KPI calculations and trend detection

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
- **API Base**: `/crm/v2/dashboard`
- **Authentication**: Bearer token + X-Merchant-UID header
- **Endpoints**: 6 read-only GET endpoints
- **Database**: PostgreSQL recommended

### **Status:**
- **Frontend**: ⏳ Ready for implementation
- **Backend**: ⏳ Ready for implementation
- **Documentation**: ✅ Complete specification

---

## 🎯 Quick Implementation Steps

### **Step 1: Database Setup**
```sql
-- See Database Schema for complete setup
CREATE TABLE dashboard_kpi_snapshot (...);
CREATE TABLE activity_feed (...);
CREATE TABLE dashboard_team_scores (...);
```

### **Step 2: API Development**
```
GET  /crm/v2/dashboard/overview              -- Summary KPI cards
GET  /crm/v2/dashboard/timeseries            -- Chart data
GET  /crm/v2/dashboard/active-projects       -- Active projects list
GET  /crm/v2/dashboard/recent-activity       -- Activity feed
GET  /crm/v2/dashboard/today-appointments    -- Today's schedule
GET  /crm/v2/dashboard/team-performance      -- 4-team comparison
```

### **Step 3: Business Logic**
```
KPI calculation formulas, trend detection, composite team scores
```

---

## 🎯 Key Features

### **Dashboard Sections:**
- **KPI Cards**: Real-time metrics (Visits, Customers, Revenue)
- **Time-Series Charts**: Interactive trend visualization
- **Appointment Schedule**: Today's visit schedule
- **Active Projects**: Top N projects with key info
- **Activity Feed**: Cross-project timeline
- **Team Performance**: 4-team comparison table

### **User Roles:**
- **Team Member** 👤 - Own KPIs and schedule
- **Team Leader** 👥 - Team aggregate + member details
- **Manager** 👑 - Cross-team visibility + export

### **The 4 Sales Teams:**
| Team | Thai Name | Color |
|------|-----------|-------|
| ปลีก(สนญ) | ปลีก สำนักงานใหญ่ | 🔵 Blue |
| ปลีก(สันกำแพง) | ปลีก สันกำแพง | 🟢 Green |
| โครงการ(งานขนาดใหญ่) | โครงการ งานขนาดใหญ่ | 🟣 Purple |
| ส่งร้านค้า(ค้าช่วง) | ส่งร้านค้า ค้าช่วง | 🟠 Orange |

---

## 🔗 Related Documentation

- **[API Specification](02-API-SPECIFICATION.html)** - Full API contract
- **[UI Mockups](03-UI-MOCKUPS.html)** - Visual design reference
- **[Database Schema](04-DATABASE-SCHEMA.html)** - Table definitions
- **[Business Logic](05-BUSINESS-LOGIC.html)** - Calculation rules
- **[Integration Guide](06-INTEGRATION-GUIDE.html)** - Frontend-backend coordination
- **[Test Specification](07-TEST-SPECIFICATION.html)** - Testing strategy

---

**🚀 Ready to implement! Start with the API Specification document.**

[← Back to Main Documentation](../)
