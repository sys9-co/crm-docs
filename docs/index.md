---
layout: default
title: SYS9 CRM Documentation
---

# SYS9 CRM Documentation

📋 **Official documentation for backend implementation**

## 🎯 Sale Plan v2 - Excel-style Table

Complete specification package ready for development:

### **📡 Critical for Backend:**
- **[API Specification](sale-plan-v2/02-API-SPECIFICATION.html)** - 5 endpoints implementation
- **[Database Schema](sale-plan-v2/04-DATABASE-SCHEMA.html)** - Tables and indexes  
- **[Business Logic](sale-plan-v2/05-BUSINESS-LOGIC.html)** - Validation rules

### **🤝 Coordination:**
- **[Integration Guide](sale-plan-v2/06-INTEGRATION-GUIDE.html)** - Step-by-step workflow
- **[Project Overview](sale-plan-v2/01-PROJECT-OVERVIEW.html)** - Background context

### **📋 Reference:**
- **[UI Mockups](sale-plan-v2/03-UI-MOCKUPS.html)** - Frontend design
- **[Test Specification](sale-plan-v2/07-TEST-SPECIFICATION.html)** - Testing strategy

---

## 🎯 Dashboard v2 - KPI Command Center

Complete specification package for development:

### **📡 Critical for Backend:**
- **[API Specification](dashboard-v2/02-API-SPECIFICATION.html)** - 6 endpoints implementation
- **[Database Schema](dashboard-v2/04-DATABASE-SCHEMA.html)** - Tables and indexes
- **[Business Logic](dashboard-v2/05-BUSINESS-LOGIC.html)** - KPI calculations and trend detection

### **🤝 Coordination:**
- **[Integration Guide](dashboard-v2/06-INTEGRATION-GUIDE.html)** - Step-by-step workflow
- **[Project Overview](dashboard-v2/01-PROJECT-OVERVIEW.html)** - Background context

### **📋 Reference:**
- **[UI Mockups](dashboard-v2/03-UI-MOCKUPS.html)** - Frontend design
- **[Test Specification](dashboard-v2/07-TEST-SPECIFICATION.html)** - Testing strategy

---

## 🔄 Plane Project Management

Automated QA-to-Plane issue tracking system:

- **[SDLC QA + Plane Integration](plane-integration/SDLC-QA-PLANE.html)** - Full integration spec with state transitions, dedup, and workflow
- **[Session Handoff](plane-integration/SESSION-HANDOFF.html)** - QA system setup and configuration
- **[Plane Overview](plane-integration/README.html)** - Quick reference, card list, and scripts

---

## 🚀 Quick Implementation Guide

### **Step 1: Database Setup**
```sql
-- Implement tables from Database Schema
CREATE TABLE saleplan_v2_headers (...);
CREATE TABLE saleplan_v2_entries (...);
```

### **Step 2: API Development**
```
GET  /crm/v2/projects/{id}/saleplan-v2     -- Load matrix
POST /crm/v2/projects/{id}/saleplan-v2     -- Save matrix
...
```

### **Step 3: Business Logic**
```
Matrix validation, Thai date formatting, calculation rules
```

---

## 📊 Current Status

- **Frontend**: ✅ Complete prototype
- **Backend**: ⏳ Ready for implementation  
- **Live Demo**: [localhost:3031](http://localhost:3031/projects/123/edit?tab=plan-v2)

**🎯 Ready to code!**