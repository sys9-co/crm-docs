/**
 * Sale Plan v2 - Plane Cards Creation Script
 * 
 * This script creates the complete Plane project structure for Sale Plan v2
 * including main feature card and all sub-tasks with proper module assignment
 */

import { PlaneConfig } from '../../../ui/scripts/qa-plane.config'

// Plane API configuration
const PLANE_CONFIG = {
  baseUrl: 'https://plane.sys9.co',
  workspace: 'sys9',
  projectId: '42274dc1-be6c-474d-9883-a7fe72feef44',
  assigneeId: '93b18c70-1537-41be-b9b7-81f22e0f1c9c', // satit(Noi)
  cycleId: 'c0e7c9d3-43f4-42cc-92dd-78ae30f1eb33', // มิ.ย.69
  
  // State IDs
  states: {
    todo: '103c64f2-ce49-46e3-a5c4-5bea3fd9679f',
    inProgress: '5064a47f-84c8-4a15-aa30-8219c331571b',
    qa: '90159e0f-89c2-4b75-a4ab-6b5cea144f47',
    done: '350c93e8-f23c-4da2-99e8-88bce77899de'
  },
  
  // Label IDs  
  labels: {
    feature: '5a03879e-6fb4-4b76-be8a-49e56974a48d', // BUG label (reused as FEATURE)
    frontend: 'frontend-label-id', // TBD
    backend: 'backend-label-id',   // TBD
    testing: 'testing-label-id',   // TBD
    design: 'design-label-id'      // TBD
  }
}

// Main Feature Card
const MAIN_FEATURE_CARD = {
  name: '[FEATURE] Sale Plan v2 - Excel-style Table Implementation',
  description: `
## 🎯 Module: crm

## 📊 Goal
Transform Sale Plan from **individual entry mode** → **Excel-style table interface** with comprehensive planning capabilities

## 📋 Requirements  
- ✅ **Timeline**: Dynamic project start → end dates (ตามระยะเวลาโครงการ)
- ✅ **Edit**: Batch edit multiple cells → save ทีเดียวทั้งหมด
- ✅ **Summary**: Row totals + Column totals + Progress % + Grand total  
- ✅ **Warnings**: Real-time while typing + Summary warnings ด้านล่าง

## 🎨 UI/UX Design
- Excel-style table with scrollable horizontal columns
- Color-coded warnings (🟢 under, 🟡 exact, 🔴 over)
- Mobile responsive cards for smaller screens
- Batch save with dirty state tracking

## 🏗️ Technical Architecture
### Frontend Components:
\`\`\`
ui/components/project/saleplan-v2/
├── SalePlanV2Tab.vue               // Main container tab
├── SalePlanV2Table.vue             // Excel-style table wrapper  
├── SalePlanV2Cell.vue              // Editable input cell
├── SalePlanV2Summary.vue           // Row/column summaries
├── SalePlanV2Warnings.vue          // Real-time + summary warnings
├── SalePlanV2Timeline.vue          // Dynamic month columns
└── SalePlanV2BatchSave.vue         // Save/cancel controls
\`\`\`

### API Endpoints:
\`\`\`
GET    /crm/v2/projects/{id}/saleplan-v2        // Load matrix data
POST   /crm/v2/projects/{id}/saleplan-v2        // Create new plan  
PUT    /crm/v2/projects/{id}/saleplan-v2        // Update matrix
DELETE /crm/v2/projects/{id}/saleplan-v2/{month} // Clear month
\`\`\`

## 📅 Implementation Phases
1. **Documentation & Planning** ✅ (Current)
2. **Backend Development** (Coordination Required)
3. **Frontend Implementation** 
4. **Integration & Testing**

## 🎯 Success Criteria
- [ ] Excel-style table with project timeline columns
- [ ] Batch edit with real-time validation
- [ ] BOQ overflow warnings and calculations
- [ ] Mobile responsive design
- [ ] 100% E2E test coverage
- [ ] Tab integration in project edit page

## 🔗 Related Documentation
- API Specification: [docs/sale-plan-v2/02-API-SPECIFICATION.md]
- UI Mockups: [docs/sale-plan-v2/03-UI-MOCKUPS.md]  
- Technical Docs: [docs/sale-plan-v2/]

## 📈 Progress Tracking
<!-- All implementation updates go here -->
<!-- Format: [Date] [Update] @assignee -->

### 📋 Sub-tasks Created:
- [ ] Frontend Implementation
- [ ] Backend API Development
- [ ] UI/UX Integration  
- [ ] Test Specification & E2E Testing

---
**Module**: crm  
**Priority**: High  
**Estimate**: 3-4 weeks  
**Dependencies**: Backend team coordination
  `,
  
  // Plane API fields
  state: PLANE_CONFIG.states.todo,
  assignee: PLANE_CONFIG.assigneeId,
  priority: 'high',
  module: 'crm',
  labels: [PLANE_CONFIG.labels.feature],
  cycle: PLANE_CONFIG.cycleId
}

// Sub-task Cards
const SUB_TASKS = [
  {
    name: '[TASK] Frontend Implementation',
    description: `
## 🎯 Frontend Components Development

### Scope:
- Timeline generation from project dates
- Excel-style table component with horizontal scrolling
- Batch edit system with dirty state tracking  
- Real-time validation with visual warnings
- Responsive mobile card layout
- Loading states and error handling

### Components to Create:
\`\`\`
ui/components/project/saleplan-v2/
├── SalePlanV2Tab.vue               // Main container tab
├── SalePlanV2Table.vue             // Excel-style table wrapper  
├── SalePlanV2Cell.vue              // Editable input cell
├── SalePlanV2Summary.vue           // Row/column summaries  
├── SalePlanV2Warnings.vue          // Real-time + summary warnings
├── SalePlanV2Timeline.vue          // Dynamic month columns
└── SalePlanV2BatchSave.vue         // Save/cancel controls
\`\`\`

### Key Features:
- Dynamic timeline from project start/end dates  
- Matrix data structure: \`[boqId][monthValue] = amount\`
- Real-time BOQ overflow validation
- Horizontal scrollable table with sticky columns
- Mobile-responsive card layout
- Thai month formatting with Buddhist year

### Technical Requirements:
- TypeScript with strict mode
- Vue 3 Composition API + script setup
- Tailwind CSS + shadcn-vue components
- vee-validate + zod for form validation
- E2E tests with Playwright

### Deliverables:
- [ ] Timeline generation logic
- [ ] Excel-style table component
- [ ] Cell editing with validation
- [ ] Batch save functionality
- [ ] Mobile responsive design
- [ ] Integration with project edit page
    `,
    state: PLANE_CONFIG.states.todo,
    assignee: PLANE_CONFIG.assigneeId,
    priority: 'high',
    module: 'crm',
    labels: ['frontend']
  },
  
  {
    name: '[TASK] Backend API Development',  
    description: `
## 🗄️ Backend API & Database Implementation

### Scope:
- Database schema design for planning matrix
- REST API endpoints for CRUD operations
- Business logic validation (BOQ overflow, etc.)
- Data migration from existing Sale Plan v1
- Performance optimization for matrix operations

### API Endpoints to Implement:
\`\`\`
GET    /crm/v2/projects/{id}/saleplan-v2        // Load complete matrix
POST   /crm/v2/projects/{id}/saleplan-v2        // Create/update matrix
PUT    /crm/v2/projects/{id}/saleplan-v2        // Update existing plan  
DELETE /crm/v2/projects/{id}/saleplan-v2/{month} // Clear month data
GET    /crm/v2/projects/{id}/saleplan-v2/stats  // Statistics & analytics
\`\`\`

### Database Schema:
\`\`\`sql
saleplan_v2_headers (
  id, project_id, created_at, updated_at
)

saleplan_v2_entries (
  id, header_id, boq_item_id, month_period, 
  planned_amount, created_at, updated_at
  UNIQUE(header_id, boq_item_id, month_period)
)
\`\`\`

### Business Logic:
- BOQ overflow validation (warning, not blocking)
- Timeline validation against project dates
- Batch update operations with transactions
- Audit trail for planning changes
- Performance caching for large datasets

### Deliverables:
- [ ] Database schema + migrations
- [ ] API endpoints with full CRUD
- [ ] Business logic validation
- [ ] API documentation + Postman collection
- [ ] Unit tests + integration tests
- [ ] Performance benchmarks
    `,
    state: PLANE_CONFIG.states.todo,
    assignee: null, // Backend team to assign
    priority: 'high', 
    module: 'crm',
    labels: ['backend']
  },
  
  {
    name: '[TASK] UI/UX Integration',
    description: `
## 🎨 User Interface & Experience Implementation  

### Scope:
- Tab integration in project edit page
- Responsive design implementation (desktop/tablet/mobile)
- Loading states and error handling UX
- User interaction flows and animations
- Accessibility compliance (WCAG 2.1 AA)

### Integration Points:
- Add "Sale Plan v2" tab to \`/projects/[id]/edit\`
- Seamless navigation between Sale Plan v1 and v2
- Consistent styling with existing project pages
- Mobile-first responsive breakpoints

### Visual Design:
- Excel-style table for desktop (1024px+)
- Card-based layout for mobile (<768px)
- Color-coded status indicators:
  - 🟢 Under allocation (< 100% of BOQ)
  - ⚪ Exact allocation (= 100% of BOQ)  
  - 🟡 Slight over (100-110% of BOQ)
  - 🔴 Over allocation (> 110% of BOQ)

### User Experience:
- Inline editing with real-time feedback
- Batch save with unsaved changes indicator
- Contextual warnings and help tooltips
- Smooth transitions and loading states
- Keyboard navigation support

### Deliverables:
- [ ] Project edit page tab integration
- [ ] Responsive breakpoint implementation
- [ ] Loading states and error handling
- [ ] Accessibility audit and fixes  
- [ ] User interaction flow testing
- [ ] Cross-browser compatibility testing
    `,
    state: PLANE_CONFIG.states.todo,
    assignee: PLANE_CONFIG.assigneeId,
    priority: 'medium',
    module: 'crm', 
    labels: ['design', 'frontend']
  },
  
  {
    name: '[TASK] Test Specification & E2E Testing',
    description: `
## 🧪 Testing Strategy & Implementation

### Scope:
- Comprehensive test plan creation
- E2E test implementation with Playwright
- Visual regression testing for table layouts
- Performance testing for large datasets
- Cross-browser and device testing

### Test Categories:
1. **Unit Tests**:
   - Timeline generation logic
   - Validation rules testing
   - Calculation accuracy
   - Data transformation utilities

2. **Integration Tests**:
   - API endpoint testing with mocked data
   - Frontend-backend data flow
   - Error handling scenarios
   - Authentication and authorization

3. **E2E Tests**:
   - Complete user workflows (create, edit, save)
   - Cross-device responsive testing
   - Real-time validation behavior
   - Batch save operations
   - Warning system functionality

4. **Visual Tests**:
   - Excel table layout consistency
   - Mobile card responsive design
   - Warning message displays
   - Loading state animations

### Test Scenarios:
- Empty table state → data entry → save workflow
- BOQ overflow warnings and user resolution
- Timeline generation from various project date ranges
- Batch editing multiple cells across months
- Mobile responsive behavior on different devices
- Error handling for API failures

### Performance Benchmarks:
- Table load time: <2 seconds for 50 BOQs × 12 months
- Cell edit response: <100ms real-time validation
- Batch save operation: <5 seconds for full matrix
- Mobile scrolling performance: 60fps smooth scrolling

### Deliverables:
- [ ] Test plan documentation  
- [ ] E2E test suite (Playwright)
- [ ] Visual regression test setup
- [ ] Performance benchmark tests
- [ ] Cross-browser test automation
- [ ] Test coverage reporting
- [ ] QA sign-off checklist
    `,
    state: PLANE_CONFIG.states.todo,
    assignee: PLANE_CONFIG.assigneeId,
    priority: 'medium',
    module: 'crm',
    labels: ['testing']
  }
]

// API Helper Functions
async function createPlaneIssue(issueData: any, parentId?: string) {
  const apiKey = process.env.PLANE_API_KEY
  if (!apiKey) {
    console.log('🔶 PLANE_API_KEY not set - skipping actual card creation')
    console.log('📄 Would create issue:', issueData.name)
    return null
  }

  const url = `${PLANE_CONFIG.baseUrl}/api/v1/workspaces/${PLANE_CONFIG.workspace}/projects/${PLANE_CONFIG.projectId}/issues/`
  
  const payload = {
    name: issueData.name,
    description: issueData.description,
    state_id: issueData.state,
    assignee_ids: issueData.assignee ? [issueData.assignee] : [],
    label_ids: issueData.labels || [],
    priority: issueData.priority,
    cycle_id: issueData.cycle,
    parent_id: parentId,
    module_ids: issueData.module ? [issueData.module] : []
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Created Plane issue:', issueData.name)
    console.log(`🔗 URL: ${PLANE_CONFIG.baseUrl}/${PLANE_CONFIG.workspace}/projects/${PLANE_CONFIG.projectId}/issues/${result.id}`)
    
    return result
  } catch (error) {
    console.error('❌ Failed to create Plane issue:', error)
    return null
  }
}

// Main execution function
export async function createSalePlanV2PlaneCards() {
  console.log('🚀 Creating Sale Plan v2 Plane Cards Structure...')
  console.log(`📋 Module: crm`)
  console.log(`🎯 Project: ${PLANE_CONFIG.projectId}`)
  console.log('') 

  try {
    // 1. Create main feature card
    console.log('📊 Creating main feature card...')
    const mainCard = await createPlaneIssue(MAIN_FEATURE_CARD)
    
    if (!mainCard) {
      console.log('⚠️ Skipping sub-tasks creation due to missing main card')
      return
    }

    const mainCardId = mainCard.id
    console.log(`✅ Main card created with ID: ${mainCardId}`)
    console.log('')

    // 2. Create sub-task cards
    console.log('📋 Creating sub-task cards...')
    for (const subTask of SUB_TASKS) {
      console.log(`  Creating: ${subTask.name}`)
      await createPlaneIssue(subTask, mainCardId)
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('')
    console.log('🎉 Sale Plan v2 Plane Cards Structure Created Successfully!')
    console.log(`🔗 Main Card URL: ${PLANE_CONFIG.baseUrl}/${PLANE_CONFIG.workspace}/projects/${PLANE_CONFIG.projectId}/issues/${mainCardId}`)
    console.log('')
    console.log('📋 Next Steps:')
    console.log('  1. Review and assign sub-tasks to team members')
    console.log('  2. Coordinate with backend team for API development')
    console.log('  3. Begin frontend implementation phase')
    console.log('  4. Set up regular progress updates on main card')

  } catch (error) {
    console.error('❌ Failed to create Plane cards structure:', error)
  }
}

// Execute if run directly
if (import.meta.url === new URL(import.meta.resolve('.')).href) {
  createSalePlanV2PlaneCards()
}