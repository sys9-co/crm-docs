# Dashboard v2 - Project Overview

## 🎯 Project Goal
Transform the CRM Dashboard from **static information display** → **dynamic KPI-driven command center** with real-time team performance visibility across all 4 sales teams

## 📋 Module Information
- **Module**: `crm`
- **Component**: Dashboard v2 (KPI Command Center)
- **Integration**: Project Management System, Appointment System, Customer Management
- **Repository**: sys9-co/crm (Frontend)
- **Backend**: Separate repository coordination required

## 🔄 Current State vs Target State

### **Current (Dashboard v1):**
- Static list of recent projects
- No KPI metrics or summaries
- No team-level performance view
- No time-series charts or trends
- No role-based visibility (same view for all users)
- No mobile optimization

### **Target (Dashboard v2):**
- Rich KPI cards with real-time metrics (Visits, Customers, Revenue)
- Interactive time-series charts with trend indicators
- Team performance comparison across 4 sales teams
- Role-based views: Team Member → Team Leader → Manager
- Today's appointment schedule at a glance
- Active project pipeline with key statuses
- Mobile-responsive design
- Real-time activity feed across teams

## 👥 Business Context

### **The 4 Sales Teams:**

| Team | Thai Name | Focus Area | Typical Members |
|------|-----------|------------|-----------------|
| `ปลีก(สนญ)` | ปลีก สำนักงานใหญ่ | Retail - HQ | 8-12 members |
| `ปลีก(สันกำแพง)` | ปลีก สันกำแพง | Retail - Sankampang | 5-8 members |
| `โครงการ(งานขนาดใหญ่)` | โครงการ งานขนาดใหญ่ | Large Project Sales | 6-10 members |
| `ส่งร้านค้า(ค้าช่วง)` | ส่งร้านค้า ค้าช่วง | Wholesale Distribution | 4-6 members |

### **User Personas:**

#### **1. Team Member (พนักงาน)**
- Can view own KPIs (Visits, Customers, Revenue)
- Sees today's appointment schedule
- Views personal performance charts
- Cannot see other team members' data

#### **2. Team Leader (หัวหน้าทีม)**
- Can view own KPIs plus team aggregate metrics
- Sees all team members' appointment schedules
- Views team performance comparison charts
- Can drill into individual member performance
- Sees bottom performers list

#### **3. Manager (ผู้จัดการ)**
- Cross-team visibility across all 4 teams
- Full KPI comparison and ranking
- Sees all appointment schedules
- Views organizational performance trends
- Can filter by any team or time period
- Access to export/download reports

## 📊 The 3 KPI Pillars

### **1. Visits (Visits)**
- Total visits completed (วันนี้ / สัปดาห์นี้ / เดือนนี้)
- Visit completion rate (actual vs planned)
- Visit distribution by type (call / onsite / other)
- Average visit duration

### **2. Customers (ลูกค้า)**
- Active customer count
- New customers acquired (period)
- Customer visit frequency
- Customer retention rate

### **3. Revenue (ยอดขาย)**
- Total revenue (period)
- Revenue vs target (% achieved)
- Average revenue per visit
- Revenue trend (up/down/flat)

### **KPI Data Model:**
```typescript
interface KPIMetrics {
  visits: {
    total: number
    completed: number
    planned: number
    completionRate: number  // percentage
    byType: {
      call: number
      onsite: number
      other: number
    }
    avgDuration: number  // minutes
  }
  customers: {
    active: number
    newAcquired: number
    visitFrequency: number  // avg visits per customer
    retentionRate: number   // percentage
  }
  revenue: {
    total: number
    target: number
    achievement: number     // percentage
    perVisit: number       // avg revenue per visit
    trend: 'up' | 'down' | 'flat'
  }
}
```

## 🏗️ Technical Architecture

### **Frontend Components:**
```
ui/components/dashboard-v2/
├── DashboardLayout.vue                    // Main layout wrapper
├── DashboardHeader.vue                    // Top bar with team selector + date range
├── KPICard.vue                            // Single KPI metric card
├── KPICardGrid.vue                        // Grid of 3 KPI cards (Visits, Customers, Revenue)
├── AppointmentSchedule.vue                // Today's visit schedule list
├── AppointmentScheduleItem.vue            // Single appointment row
├── TimeSeriesChart.vue                    // Chart with trend line
├── TeamPerformanceTable.vue               // 4-team comparison table
├── TeamPerformanceRow.vue                 // Single team row in comparison
├── MemberPerformanceList.vue              // Bottom performers list
├── ActiveProjectCard.vue                  // Active project summary card
├── RecentActivityFeed.vue                 // Cross-project activity timeline
├── EmptyState.vue                         // No data placeholder
├── ErrorState.vue                         // Error/retry state
└── LoadingSkeleton.vue                    // Skeleton loading state
```

### **Component Tree (Mermaid):**
```mermaid
graph TD
    A[DashboardLayout] --> B[DashboardHeader]
    A --> C[KPICardGrid]
    A --> D[AppointmentSchedule]
    A --> E[TimeSeriesChart]
    A --> F[TeamPerformanceTable]
    A --> G[ActiveProjectCard]
    A --> H[RecentActivityFeed]
    
    B --> B1[TeamSelector]
    B --> B2[DateRangePicker]
    
    C --> C1[KPICard - Visits]
    C --> C2[KPICard - Customers]
    C --> C3[KPICard - Revenue]
    
    D --> D1[AppointmentScheduleItem]
    D --> D2[AppointmentScheduleItem]
    D --> D3[...AppointmentScheduleItem]
    
    F --> F1[TeamPerformanceRow - ปลีก(สนญ)]
    F --> F2[TeamPerformanceRow - ปลีก(สันกำแพง)]
    F --> F3[TeamPerformanceRow - โครงการ(งานขนาดใหญ่)]
    F --> F4[TeamPerformanceRow - ส่งร้านค้า(ค้าช่วง)]
    
    H --> H1[ActivityItem]
    H --> H2[ActivityItem]
    H --> H3[...ActivityItem]
```

### **API Integration:**
```
GET    /crm/v2/dashboard/overview?team_id&from&to        // Summary KPI cards
GET    /crm/v2/dashboard/timeseries?team_id&metric&interval&from&to&page&size  // Chart data
GET    /crm/v2/dashboard/active-projects?top&sort&order&team_id  // Active projects list
GET    /crm/v2/dashboard/recent-activity?team_id&page&size       // Activity feed
GET    /crm/v2/dashboard/today-appointments?team_id              // Today's schedule
GET    /crm/v2/dashboard/team-performance?from&to                // 4-team comparison
```

## 🎯 Success Criteria

### **Functional Requirements:**
- [ ] KPI cards display real-time metrics for Visits, Customers, Revenue
- [ ] Team selector filters all dashboard data by selected team
- [ ] Date range picker filters time-series charts
- [ ] Today's appointment schedule shows upcoming visits
- [ ] Active projects list shows top N projects with key info
- [ ] Recent activity feed shows cross-project timeline
- [ ] Team performance table compares all 4 teams
- [ ] Mobile-responsive layout (<768px) with stacked cards
- [ ] Role-based visibility (member vs leader vs manager)

### **Technical Requirements:**
- [ ] 100% TypeScript coverage
- [ ] Comprehensive E2E test suite (7+ scenarios)
- [ ] Performance: <2s initial load time
- [ ] Chart rendering: <500ms for time-series
- [ ] API pagination for activity feed (page/size)
- [ ] Debounced team/date filter changes
- [ ] Loading skeleton for all async sections

### **Business Requirements:**
- [ ] All 4 teams (ปลีก(สนญ), ปลีก(สันกำแพง), โครงการ, ส่งร้านค้า) represented
- [ ] Thai date formatting (พุทธศักราช +543)
- [ ] Currency in Thai Baht (฿) with comma formatting
- [ ] Zero data disruption to existing dashboard v1
- [ ] Seamless user migration (feature flag)

## 🎨 Color Scheme Per Team

| Team | Color | Hex Code |
|------|-------|----------|
| ปลีก(สนญ) | Blue | `#3B82F6` |
| ปลีก(สันกำแพง) | Green | `#22C55E` |
| โครงการ(งานขนาดใหญ่) | Purple | `#A855F7` |
| ส่งร้านค้า(ค้าช่วง) | Orange | `#F97316` |

## 📅 Implementation Timeline

### **Phase 1: Documentation & Planning** (Current)
- [ ] Complete API specification
- [ ] UI/UX mockup documentation
- [ ] Database schema design
- [ ] Plane project cards setup

### **Phase 2: Backend Development** (Coordination Required)
- [ ] Database schema implementation
- [ ] API endpoints development
- [ ] KPI calculation business logic
- [ ] Data aggregation queries

### **Phase 3: Frontend Implementation**
- [ ] Dashboard layout responsive structure
- [ ] KPI card components with loading states
- [ ] Time-series chart integration
- [ ] Team performance comparison table
- [ ] Appointment schedule widget

### **Phase 4: Integration & Testing**
- [ ] Frontend-backend integration
- [ ] E2E test suite (7 scenarios)
- [ ] Performance optimization
- [ ] User acceptance testing

## 🤝 Stakeholder Coordination

### **Frontend Team (Current Repo):**
- UI/UX implementation
- Component development
- E2E testing
- Documentation

### **Backend Team (Separate Repo):**
- API specification review
- Database design coordination
- Backend implementation
- Integration testing

### **Business Stakeholders:**
- Sales team leaders (requirements validation)
- Management (dashboard priorities)
- Operations (data accuracy)

## 📋 Related Documentation

- [API Specification](./02-API-SPECIFICATION.html)
- [UI Mockups](./03-UI-MOCKUPS.html)
- [Database Schema](./04-DATABASE-SCHEMA.html)
- [Business Logic](./05-BUSINESS-LOGIC.html)
- [Integration Guide](./06-INTEGRATION-GUIDE.html)
- [Test Specification](./07-TEST-SPECIFICATION.html)

---

**Created**: June 2, 2026  
**Last Updated**: June 2, 2026  
**Version**: 1.0  
**Status**: Planning Phase
