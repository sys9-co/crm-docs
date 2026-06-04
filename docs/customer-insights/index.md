---
layout: default
title: Customer Insights Documentation
---

# Customer Insights (Customer 360° & Analytics)

📊 **Complete specification package for backend development — consolidate scattered CRM customer data into a unified 360° view with analytics dashboard.**

## 🚀 Critical for Backend Implementation

### **Priority 1 - Must Read:**
- **[📡 API Specification](02-API-SPECIFICATION.html)** — 12 endpoints covering customer data, timeline, related entities, and analytics
- **[🗄️ Database Schema](03-DATABASE-SCHEMA.html)** — Recommended table structures, indexes, and constraints
- **[🤝 Integration Guide](04-GETTING-STARTED.html)** — Step-by-step frontend-to-backend workflow

### **Priority 2 - Reference:**
- **[📊 Project Overview](01-PROJECT-OVERVIEW.html)** — Background, goals, and architecture

---

## 📊 Implementation Overview

### **Key Technical Details:**
- **Module**: `crm`
- **API Base**: `/crm/{api_version}/customers`
- **Authentication**: Bearer token + X-Merchant-UID header
- **Entity Key**: `customer_uuid` (UUID v4) as primary lookup key, `customer_code` for cross-service reference
- **Database**: PostgreSQL recommended

### **Status:**
- **Frontend**: ✅ Complete (working prototype with mock data fallback)
- **Backend**: ⏳ Ready for implementation
- **Documentation**: ✅ Complete specification

---

## 🎯 Quick Implementation Steps

### **Step 1: Database Setup**
```sql
-- See Database Schema for complete setup
CREATE TABLE customers (...);
-- Indexes for search performance
```

### **Step 2: Core Data Endpoints**
```
GET  /crm/v1/customers                        -- List & Search customers
GET  /crm/v1/customers/{customer_uuid}         -- Customer detail
GET  /crm/v1/customers/{customer_uuid}/overview -- Aggregated metrics
```

### **Step 3: Related Entity Endpoints**
```
GET  /crm/v1/customers/{customer_uuid}/timeline     -- Activity timeline
GET  /crm/v1/customers/{customer_uuid}/quotations   -- Quotations
GET  /crm/v1/customers/{customer_uuid}/sale-plans   -- Sale plans
GET  /crm/v1/customers/{customer_uuid}/orders       -- Orders
GET  /crm/v1/customers/{customer_uuid}/projects     -- Projects
GET  /crm/v1/customers/{customer_uuid}/contacts     -- Contacts
GET  /crm/v1/customers/{customer_uuid}/visits       -- Visits
```

### **Step 4: Analytics Endpoints**
```
GET  /crm/v1/customers/analytics        -- Dashboard analytics
GET  /crm/v1/customers/sleeping         -- Sleeping customer detection
```

---

## 🔗 Pages Served

| Frontend Route | API Backing | Description |
|---------------|-------------|-------------|
| `/customers` | `GET /customers` (paginated search) | Customer list with search & filters |
| `/customers/{uuid}` | 9 detail endpoints | Customer 360° detail page |
| `/customers/insights` | `GET /customers/analytics` | Analytics dashboard & charts |

---

## 🔑 Entity Relationships

```
customer (uuid PK)
  ├── contacts       (1:N — many contact persons per customer)
  ├── projects       (1:N — many projects referencing this customer)
  ├── quotations     (1:N — linked via customer_uuid / project)
  ├── sale_plans     (1:N — linked via customer_uuid / project)
  ├── orders / boq   (1:N — purchase orders)
  └── visits         (1:N — site visits & meetings)
        └── timeline (unified event stream from all above)
```

---

## 🛣️ Plane Reference

**Card**: CRM-XX — Customer Insights (Customer 360° & Analytics)

**Sub-tasks**:
- CRM-XX-01 — Database schema & migration
- CRM-XX-02 — Core customer CRUD/search endpoints
- CRM-XX-03 — Related entities endpoints (quotes, plans, orders, projects, contacts, visits)
- CRM-XX-04 — Timeline aggregation endpoint
- CRM-XX-05 — Analytics & sleeping customer endpoints
- CRM-XX-06 — Frontend integration & E2E tests

---

**🚀 Ready to implement! Start with the API Specification document.**

[← Back to Main Documentation](../)
