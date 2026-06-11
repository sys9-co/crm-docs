# Customer Insights — Project Overview

## 🎯 Project Goal

Consolidate **scattered CRM customer data** across multiple modules (quotations, sale plans, orders, projects, contacts, visits) into a **unified 360° view** with an **analytics dashboard** for data-driven decision making.

## 📋 Module Information

- **Module**: `crm`
- **Feature**: Customer Insights (Customer 360° View + Analytics Dashboard)
- **Entity Key**: `customer_uuid` (UUID v4) — primary lookup key; `customer_code` — human-readable cross-service reference
- **Repository**: `sys9-co/crm` (Frontend)
- **Pages**: `/customers`, `/customers/{uuid}`, `/customers/insights`
- **Backend**: Separate repository coordination required

## 🔄 Current State vs Target State

### **Current State:**
- Customer data scattered across independent modules
- No unified view of customer activity
- Difficult to track total customer value (quotations + sale plans + orders)
- No analytics or trend analysis
- Manual customer outreach without data-driven triggers (e.g., sleeping customer detection)

### **Target State (Customer 360°):**
- **Unified customer profile** with all related data in one place
- **Activity timeline** combining all interaction types
- **Aggregated metrics** (project count, quotation value, sale plan value, visit count)
- **Analytics dashboard** with charts for province/distribution, trends, top customers
- **Sleeping customer detection** — automated identification of disengaged customers

## 🏗️ Technical Architecture

### **Key Concepts**

| Concept | Description |
|---------|-------------|
| `customer_uuid` | UUID v4 primary key for all customer lookups |
| `customer_code` | Human-readable code (e.g., `CUST-001`) for cross-service reference |
| Aggregated metrics | Fields like `total_projects`, `total_quotations`, `total_orders` computed from related tables at query time |
| Activity timeline | Unified event stream built from appointments, visits, quotations, sale plans, project updates, and contacts |

### **Pages Built**

#### 1. `/customers` — Customer List & Search
- Full-text search by name, code, phone, email
- Advanced filters: province, district, last visit date range
- Sortable columns: name, last interacted, project count, contact count
- Load-more pagination (cursor/page-based)

#### 2. `/customers/{uuid}` — Customer 360° Detail
- **Profile Card**: Name, code, contact info, social media, avatar
- **Metrics Overview**: KPI cards showing project count, quotation value, sale plan value, visit count, last interaction
- **Activity Timeline**: Chronological feed of all interactions
- **Quotations Table**: List of quotations linked to this customer
- **Sale Plans Table**: List of sale plans
- **Orders Table**: Purchase orders / BOQ items
- **Projects Card**: List of projects
- **Contacts Card**: List of contact persons
- **Visits Card**: List of site visits with load-more

#### 3. `/customers/insights` — Analytics Dashboard
- **KPI Cards**: Total customers, active, inactive, new this month
- **Province Distribution Chart**: Bar chart — top provinces
- **District Distribution Chart**: Bar chart — top districts
- **New Customers Over Time**: Line/bar chart — monthly acquisition
- **Top Customers by Value**: Ranked list — quotation + sale plan + order value
- **Customer Segmentation**: Project count ranges
- **Acquisition Trend**: Cumulative growth chart
- **Sleeping Customers Table**: Customers with no activity beyond threshold

### **Frontend Components**

```
ui/components/customer/
├── CustomerProfileCard.vue        — Profile display
├── CustomerMetrics.vue            — KPI metrics overview
├── CustomerTimeline.vue           — Activity timeline feed
├── CustomerQuotations.vue         — Quotations table
├── CustomerSalePlans.vue          — Sale plans table
├── CustomerOrders.vue             — Orders/BOQ table
├── CustomerProjects.vue           — Projects card
├── CustomerContacts.vue           — Contacts card
├── CustomerVisits.vue             — Visits card

ui/composables/
├── useCustomer.ts                 — All customer data fetching (with mock fallback)
├── useCustomerAnalytics.ts        — Analytics & sleeping customer data
```

### **API Integration**

```
API Base: /crm/{api_version}/customers

Core:
  GET /customers                           — Search & list (paginated, filters)
  GET /customers/{customer_uuid}           — Single customer detail
  PUT /customers/{customer_uuid}           — Update profile (partial)
  GET /customers/{customer_uuid}/overview  — Aggregated metrics

Related Entities:
  GET /customers/{customer_uuid}/timeline     — Activity timeline (paginated)
  GET /customers/{customer_uuid}/quotations   — Quotations (paginated)
  GET /customers/{customer_uuid}/sale-plans   — Sale plans (paginated)
  GET /customers/{customer_uuid}/orders       — Orders/BOQ (paginated)
  GET /customers/{customer_uuid}/projects     — Projects
  GET /customers/{customer_uuid}/contacts     — Contacts
  GET /customers/{customer_uuid}/visits       — Visits (paginated)

360° Extras:
  GET  /customers/{customer_uuid}/credit            — Credit info
  GET  /customers/{customer_uuid}/purchase-trend    — Monthly purchase trend
  GET  /customers/{customer_uuid}/top-products      — Top products
  GET  /customers/{customer_uuid}/payment-behavior  — Payment behavior
  POST /customers/{customer_uuid}/notes             — Add note
  GET/POST/DELETE /customers/{customer_uuid}/documents      — Documents
  GET/POST/PUT/DELETE /customers/{customer_uuid}/addresses  — Addresses

Analytics (route BEFORE /customers/{uuid}):
  GET /customers/analytics                    — Dashboard analytics
  GET /customers/sleeping                     — Sleeping customer list (paginated)
```

> Full request/response contracts: [02-API-SPECIFICATION.md](./02-API-SPECIFICATION.md) **v1.1** — reconciled with frontend code June 11, 2026.

## 📊 Business Requirements

### **Functional Requirements:**
- [ ] Full-text customer search by name, code, phone, email
- [ ] Advanced filtering by province, district, last visit date range
- [ ] Paginated customer list with sortable columns
- [ ] Customer 360° detail page with all related data
- [ ] Activity timeline combining all interaction types
- [ ] KPI metrics aggregation (counts, values)
- [ ] Analytics dashboard with charts and trends
- [ ] Sleeping customer detection with configurable threshold
- [ ] Responsive design (mobile + desktop)

### **Technical Requirements:**
- [ ] All endpoints follow `APIResponse<T>` response format
- [ ] Pagination follows `PaginatedResponse<T>` format
- [ ] Timestamps in ISO 8601 format
- [ ] customer_uuid as primary lookup key (string UUID)
- [ ] Aggregated metrics computed at query time (not stored)

## 🎯 Success Criteria

- Customer 360° page loads all sections within 3 seconds
- Search returns results within 1 second
- Timeline pagination supports infinite scroll
- Analytics dashboard renders charts within 2 seconds
- All frontend pages work with real API (no mock data dependency)

## 📋 Related Documentation

- [API Specification](./02-API-SPECIFICATION.md)
- [Database Schema](./03-DATABASE-SCHEMA.md)
- [Integration Guide](./04-GETTING-STARTED.md)

---

**Created**: June 4, 2026
**Last Updated**: June 11, 2026
**Version**: 1.1
**Status**: Spec frozen — Ready for Backend Implementation (frontend complete on mock data)
**Plane Card**: [FEATURE] Customer Insights — see Plane project sys9/CRM
