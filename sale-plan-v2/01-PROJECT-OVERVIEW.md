# Sale Plan v2 - Project Overview

## 🎯 Project Goal
Transform Sale Plan from **individual entry mode** → **Excel-style table interface** with comprehensive planning capabilities

## 📋 Module Information
- **Module**: `crm`
- **Component**: Sale Plan v2 (Excel-style Table)
- **Integration**: Project Management System
- **Repository**: sys9-co/crm (Frontend)
- **Backend**: Separate repository coordination required

## 🔄 Current State vs Target State

### **Current (Sale Plan v1):**
- Individual entry creation per period/month
- Multiple forms and modals
- Complex BOQ referencing workflow
- Limited overview visibility
- Mobile-unfriendly interface

### **Target (Sale Plan v2):**
- Excel-style table with project timeline columns
- Batch editing with real-time validation
- Comprehensive overview in single view
- BOQ overflow warnings and calculations
- Mobile-responsive design

## 📊 Business Requirements

### **Core Features:**
1. **📅 Dynamic Timeline**: Columns generated from project start/end dates
2. **📋 BOQ Integration**: Rows represent BOQ items with amounts
3. **💾 Batch Editing**: Edit multiple cells → save all at once
4. **⚠️ Smart Validation**: 
   - Real-time warnings while typing
   - BOQ overflow detection
   - Summary validation at bottom
5. **📱 Responsive Design**: Desktop table + mobile cards
6. **📊 Auto-calculations**:
   - Row totals (BOQ summaries)
   - Column totals (monthly summaries)
   - Progress percentages
   - Remaining allocations

### **Data Structure:**
```typescript
interface PlanMatrix {
  [boqId: number]: {
    [monthValue: string]: number  // "2026-06" => 150000
  }
}
```

### **UI/UX Requirements:**
- Excel-like table interface
- Horizontal scrollable columns
- Color-coded warnings (🟢 under, 🟡 exact, 🔴 over)
- Summary row and column
- Inline editing with validation
- Save/cancel batch operations

## 🎯 Success Criteria

### **Functional Requirements:**
- [ ] Excel-style table with project timeline columns
- [ ] Batch edit multiple cells with single save operation
- [ ] Real-time validation with visual warnings
- [ ] BOQ overflow detection and warnings
- [ ] Row/column summary calculations
- [ ] Mobile responsive design
- [ ] Tab integration in project edit page

### **Technical Requirements:**
- [ ] 100% TypeScript coverage
- [ ] Comprehensive E2E test suite
- [ ] Performance: <2s load time
- [ ] Accessibility: WCAG 2.1 AA compliance
- [ ] Cross-browser compatibility

### **Business Requirements:**
- [ ] Preserve all existing Sale Plan v1 functionality
- [ ] Seamless user migration path
- [ ] Zero data loss during implementation
- [ ] Backend API coordination completed

## 🏗️ Technical Architecture

### **Frontend Components:**
```
ui/components/project/saleplan-v2/
├── SalePlanV2Tab.vue               // Main container tab
├── SalePlanV2Table.vue             // Excel-style table wrapper  
├── SalePlanV2Cell.vue              // Editable input cell
├── SalePlanV2Summary.vue           // Row/column summaries
├── SalePlanV2Warnings.vue          // Real-time + summary warnings
├── SalePlanV2Timeline.vue          // Dynamic month columns
└── SalePlanV2BatchSave.vue         // Save/cancel controls
```

### **API Integration:**
```
GET    /crm/v2/projects/{id}/saleplan-v2        // Load matrix data
POST   /crm/v2/projects/{id}/saleplan-v2        // Create new plan  
PUT    /crm/v2/projects/{id}/saleplan-v2        // Update matrix
DELETE /crm/v2/projects/{id}/saleplan-v2/{month} // Clear month
```

### **Database Schema:**
```sql
saleplan_v2_headers (project linkage)
saleplan_v2_entries (matrix data: [boq][month] = amount)
```

## 📅 Implementation Timeline

### **Phase 1: Documentation & Planning** (Current)
- [ ] Complete API specification
- [ ] UI/UX mockup documentation  
- [ ] Database schema design
- [ ] Plane project cards setup

### **Phase 2: Backend Development** (Coordination Required)
- [ ] Database schema implementation
- [ ] API endpoints development
- [ ] Business logic validation
- [ ] Data migration scripts

### **Phase 3: Frontend Implementation**
- [ ] Timeline generation logic
- [ ] Excel-style table component
- [ ] Batch edit system
- [ ] Real-time validation

### **Phase 4: Integration & Testing**
- [ ] Frontend-backend integration
- [ ] E2E test suite
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

### **Project Management:**
- Plane cards tracking
- Progress reporting
- Timeline coordination
- Quality assurance

## 📋 Related Documentation

- [API Specification](./02-API-SPECIFICATION.md)
- [UI Mockups](./03-UI-MOCKUPS.md)
- [Database Schema](./04-DATABASE-SCHEMA.md)
- [Business Logic](./05-BUSINESS-LOGIC.md)
- [Integration Guide](./06-INTEGRATION-GUIDE.md)
- [Test Specification](./07-TEST-SPECIFICATION.md)

---

**Created**: June 1, 2026  
**Last Updated**: June 1, 2026  
**Version**: 1.0  
**Status**: Planning Phase