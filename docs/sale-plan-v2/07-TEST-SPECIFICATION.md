# Sale Plan v2 - Test Specification

## 🧪 Testing Strategy Overview

**Module**: `crm`  
**Component**: Sale Plan v2 Excel-style Table  
**Testing Framework**: Playwright (E2E), Vitest (Unit), Playwright Visual (Regression)

## 🎯 Test Coverage Goals

### **Coverage Targets:**
- **E2E Test Coverage**: 100% user workflows
- **Unit Test Coverage**: 95%+ for business logic  
- **Visual Regression**: 100% UI components
- **API Contract**: 100% endpoint validation
- **Performance**: All critical user paths <2s

## 📋 Test Categories

### **1. Unit Tests**

#### **1.1 Timeline Generation Logic**
```typescript
// tests/unit/timeline.test.ts
describe('Timeline Generation', () => {
  test('generates correct months from project dates', () => {
    const timeline = generateProjectTimeline('2026-06-01', '2026-10-31')
    
    expect(timeline).toHaveLength(5)
    expect(timeline[0]).toEqual({
      value: '2026-06',
      name: 'มิถุนายน 2569',
      displayShort: 'มิ.ย. 69',
      isInProject: true
    })
  })
  
  test('handles cross-year projects', () => {
    const timeline = generateProjectTimeline('2026-11-01', '2027-02-28')
    
    expect(timeline).toHaveLength(4)
    expect(timeline.map(t => t.value)).toEqual([
      '2026-11', '2026-12', '2027-01', '2027-02'
    ])
  })
  
  test('marks months outside project range', () => {
    const timeline = generateProjectTimeline('2026-06-15', '2026-08-15')
    
    // All months should be marked as in project (whole month coverage)
    expect(timeline.every(t => t.isInProject)).toBe(true)
  })
})
```

#### **1.2 Validation Rules**
```typescript
// tests/unit/validation.test.ts
describe('Amount Validation', () => {
  test('accepts valid amounts', () => {
    expect(validateAmount(150000)).toEqual({ valid: true, message: null })
    expect(validateAmount('250000.50')).toEqual({ valid: true, message: null })
    expect(validateAmount(0)).toEqual({ valid: true, message: null })
  })
  
  test('rejects invalid amounts', () => {
    expect(validateAmount(-1000)).toEqual({ 
      valid: false, 
      message: 'จำนวนเงินไม่สามารถติดลบได้' 
    })
    expect(validateAmount('not-a-number')).toEqual({
      valid: false,
      message: 'กรุณากรอกตัวเลขที่ถูกต้อง'
    })
    expect(validateAmount(1000000000000)).toEqual({
      valid: false,
      message: 'จำนวนเงินเกินขีดจำกัด'
    })
  })
})

describe('BOQ Overflow Validation', () => {
  test('detects BOQ overflow correctly', () => {
    const planMatrix = { 1: { '2026-06': 600000, '2026-07': 700000 } }
    const validation = validateBOQAllocation(1, planMatrix, 1000000)
    
    expect(validation).toEqual({
      boqId: 1,
      boqAmount: 1000000,
      totalPlanned: 1300000,
      overflowAmount: 300000,
      overflowPercentage: 30,
      status: 'over',
      warningLevel: 'error'
    })
  })
})
```

#### **1.3 Calculation Logic**
```typescript
// tests/unit/calculations.test.ts
describe('Summary Calculations', () => {
  test('calculates row totals correctly', () => {
    const matrix = {
      1: { '2026-06': 300000, '2026-07': 400000 },
      2: { '2026-06': 100000, '2026-08': 200000 }
    }
    
    const rowTotals = calculateRowTotals(matrix)
    
    expect(rowTotals).toEqual({
      1: 700000,
      2: 300000
    })
  })
  
  test('calculates column totals correctly', () => {
    const matrix = {
      1: { '2026-06': 300000, '2026-07': 400000 },
      2: { '2026-06': 100000, '2026-08': 200000 }
    }
    const timeline = [
      { value: '2026-06', name: '', displayShort: '', isInProject: true },
      { value: '2026-07', name: '', displayShort: '', isInProject: true },
      { value: '2026-08', name: '', displayShort: '', isInProject: true }
    ]
    
    const colTotals = calculateColumnTotals(matrix, timeline)
    
    expect(colTotals).toEqual({
      '2026-06': 400000,
      '2026-07': 400000,
      '2026-08': 200000
    })
  })
})
```

### **2. Integration Tests**

#### **2.1 API Client Integration**
```typescript
// tests/integration/api-client.test.ts
describe('Sale Plan v2 API Client', () => {
  test('loads planning data successfully', async () => {
    const { loadPlan, planMatrix, timeline, boqItems } = useSalePlanV2(123)
    
    // Mock successful API response
    vi.mocked($callGet).mockResolvedValueOnce({
      status: true,
      data: mockSalePlanV2Data
    })
    
    await loadPlan()
    
    expect(planMatrix.value).toEqual(mockSalePlanV2Data.planMatrix)
    expect(timeline.value).toEqual(mockSalePlanV2Data.timeline)
    expect(boqItems.value).toEqual(mockSalePlanV2Data.boqItems)
  })
  
  test('handles API errors gracefully', async () => {
    const { loadPlan } = useSalePlanV2(123)
    
    vi.mocked($callGet).mockRejectedValueOnce(new Error('Network error'))
    
    await loadPlan()
    
    expect(toast.error).toHaveBeenCalledWith('โหลดข้อมูลแผนการขายไม่สำเร็จ')
  })
})
```

#### **2.2 Component Integration**  
```typescript
// tests/integration/component-integration.test.ts
describe('Sale Plan v2 Component Integration', () => {
  test('cell updates propagate to summaries', async () => {
    const wrapper = mount(SalePlanV2Table, {
      props: { projectId: 123, planData: mockData }
    })
    
    // Update a cell value
    const cell = wrapper.findComponent(SalePlanV2Cell)
    await cell.vm.updateValue(350000)
    
    // Check row total updates
    const rowTotal = wrapper.find('[data-testid="row-total-1"]')
    expect(rowTotal.text()).toContain('750,000') // Updated total
    
    // Check column total updates
    const colTotal = wrapper.find('[data-testid="col-total-2026-06"]')
    expect(colTotal.text()).toContain('450,000') // Updated total
  })
})
```

### **3. End-to-End Tests**

#### **3.1 Complete User Workflows**
```typescript
// tests/e2e/sale-plan-v2.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Sale Plan v2 - Complete Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accesstoken', 'dummy-token')
      localStorage.setItem('merchantUUID', 'dummy-merchant')
      localStorage.setItem('user', JSON.stringify({ id: 1 }))
    })
    
    // Mock API endpoints
    await page.route('**/crm/v2/projects/*/saleplan-v2', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: mockSalePlanV2Data })
      })
    })
  })

  test('[SP-001] Load Sale Plan v2 interface', async ({ page }) => {
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    // Verify table structure
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByText('งานโครงสร้าง')).toBeVisible()
    await expect(page.getByText('มิ.ย. 69')).toBeVisible()
    
    // Verify BOQ amounts display
    await expect(page.getByText('1,500,000 ฿')).toBeVisible()
    
    // Verify timeline columns
    await expect(page.getByRole('columnheader', { name: /มิ\.ย\. 69/ })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /ก\.ค\. 69/ })).toBeVisible()
  })

  test('[SP-002] Edit planning amounts with validation', async ({ page }) => {
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    // Click on first editable cell
    const cell = page.getByRole('cell').filter({ hasText: '2026-06' }).first()
    await cell.click()
    
    // Enter amount
    await page.keyboard.type('350000')
    await page.keyboard.press('Enter')
    
    // Verify real-time calculation updates
    await expect(page.getByTestId('row-total-1')).toContainText('750,000')
    await expect(page.getByTestId('col-total-2026-06')).toContainText('450,000')
    
    // Verify dirty state indicator
    await expect(page.getByRole('button', { name: /บันทึกแผน.*1.*รายการ/ })).toBeVisible()
  })

  test('[SP-003] BOQ overflow warning system', async ({ page }) => {
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    // Enter amount that exceeds BOQ
    const cell = page.getByRole('cell').filter({ hasText: '2026-06' }).first()
    await cell.fill('2000000') // Exceeds 1,500,000 BOQ
    
    // Verify warning appears
    await expect(page.getByText(/เกิน BOQ/)).toBeVisible()
    await expect(cell).toHaveClass(/border-red-500/)
    
    // Verify summary warning
    await expect(page.getByText(/วางแผนเกินเป้าหมาย/)).toBeVisible()
  })

  test('[SP-004] Batch save operation', async ({ page }) => {
    let saveRequestBody: any = null
    
    await page.route('**/crm/v2/projects/*/saleplan-v2', async route => {
      if (route.request().method() === 'POST') {
        saveRequestBody = route.request().postDataJSON()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            status: true, 
            message: 'บันทึกสำเร็จ',
            data: { saved_entries: 3 }
          })
        })
      }
    })
    
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    // Edit multiple cells
    await page.getByRole('cell').filter({ hasText: '2026-06' }).first().fill('300000')
    await page.getByRole('cell').filter({ hasText: '2026-07' }).first().fill('400000')
    await page.getByRole('cell').filter({ hasText: '2026-06' }).nth(1).fill('100000')
    
    // Save changes
    await page.getByRole('button', { name: /บันทึกแผน/ }).click()
    
    // Verify API call
    await expect.poll(() => saveRequestBody, { timeout: 5000 }).toBeTruthy()
    expect(saveRequestBody.planMatrix).toEqual({
      1: { '2026-06': 300000, '2026-07': 400000 },
      2: { '2026-06': 100000 }
    })
    
    // Verify success message
    await expect(page.getByText('บันทึกสำเร็จ')).toBeVisible()
    
    // Verify dirty state cleared
    await expect(page.getByRole('button', { name: /บันทึกแผน/ })).not.toHaveClass(/bg-blue/)
  })

  test('[SP-005] Mobile responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    // Verify mobile card layout
    await expect(page.getByTestId('mobile-boq-card')).toBeVisible()
    
    // Verify horizontal scroll for months
    await expect(page.getByTestId('mobile-month-scroll')).toBeVisible()
    
    // Test swipe navigation
    await page.getByTestId('mobile-month-scroll').swipe({ direction: 'left' })
    await expect(page.getByText('ก.ค. 69')).toBeVisible()
  })
})
```

#### **3.2 Error Handling Scenarios**
```typescript
test.describe('Sale Plan v2 - Error Handling', () => {
  test('[SP-E01] API failure during load', async ({ page }) => {
    await page.route('**/crm/v2/projects/*/saleplan-v2', async route => {
      await route.abort('failed')
    })
    
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    // Verify error message appears
    await expect(page.getByText('โหลดข้อมูลแผนการขายไม่สำเร็จ')).toBeVisible()
    
    // Verify retry option
    await expect(page.getByRole('button', { name: 'ลองใหม่' })).toBeVisible()
  })
  
  test('[SP-E02] API failure during save', async ({ page }) => {
    // Load successfully first
    await page.route('**/crm/v2/projects/*/saleplan-v2', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: true, data: mockSalePlanV2Data })
        })
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ status: false, message: 'Server error' })
        })
      }
    })
    
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    // Make changes
    await page.getByRole('cell').filter({ hasText: '2026-06' }).first().fill('300000')
    
    // Attempt save
    await page.getByRole('button', { name: /บันทึกแผน/ }).click()
    
    // Verify error handling
    await expect(page.getByText('บันทึกไม่สำเร็จ')).toBeVisible()
    
    // Verify dirty state preserved
    await expect(page.getByRole('button', { name: /รายการแก้ไข/ })).toBeVisible()
  })
})
```

### **4. Visual Regression Tests**

#### **4.1 Component Visual Tests**
```typescript
// tests/visual/sale-plan-v2-visual.spec.ts
test.describe('Sale Plan v2 - Visual Regression', () => {
  test('Excel table layout - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    await page.waitForTimeout(2000) // Let data load
    
    await expect(page.getByTestId('sale-plan-v2-table')).toHaveScreenshot('desktop-table.png')
  })
  
  test('Mobile card layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    await page.waitForTimeout(2000)
    
    await expect(page.getByTestId('sale-plan-v2-mobile')).toHaveScreenshot('mobile-cards.png')
  })
  
  test('Warning states', async ({ page }) => {
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    // Create warning state
    await page.getByRole('cell').filter({ hasText: '2026-06' }).first().fill('2000000')
    await page.keyboard.press('Tab') // Trigger validation
    
    await expect(page.getByTestId('validation-warnings')).toHaveScreenshot('warnings-panel.png')
  })
  
  test('Loading states', async ({ page }) => {
    // Delay API response to capture loading state
    await page.route('**/crm/v2/projects/*/saleplan-v2', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: mockSalePlanV2Data })
      })
    })
    
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    await expect(page.getByTestId('loading-overlay')).toHaveScreenshot('loading-state.png')
  })
})
```

### **5. Performance Tests**

#### **5.1 Load Performance**
```typescript
// tests/performance/load-performance.spec.ts
test.describe('Sale Plan v2 - Performance', () => {
  test('table loads within performance budget', async ({ page }) => {
    // Monitor network and performance
    const startTime = Date.now()
    
    await page.goto('/projects/123/edit?tab=plan-v2')
    await page.waitForSelector('[data-testid="sale-plan-v2-table"]')
    
    const loadTime = Date.now() - startTime
    
    // Verify load time under 2 seconds
    expect(loadTime).toBeLessThan(2000)
  })
  
  test('cell editing response time', async ({ page }) => {
    await page.goto('/projects/123/edit?tab=plan-v2')
    
    const cell = page.getByRole('cell').filter({ hasText: '2026-06' }).first()
    
    const startTime = Date.now()
    await cell.fill('350000')
    await expect(page.getByTestId('row-total-1')).toContainText('750,000')
    const responseTime = Date.now() - startTime
    
    // Verify real-time update under 100ms
    expect(responseTime).toBeLessThan(100)
  })
})
```

## 📊 Test Data Management

### **Mock Data Structure**
```typescript
// tests/fixtures/mockData.ts
export const mockSalePlanV2Data = {
  planMatrix: {
    1: { "2026-06": 300000, "2026-07": 400000, "2026-08": 300000 },
    2: { "2026-06": 100000, "2026-07": 200000, "2026-08": 300000 },
    3: { "2026-07": 150000, "2026-08": 100000 }
  },
  timeline: [
    { value: "2026-06", name: "มิถุนายน 2569", displayShort: "มิ.ย. 69", isInProject: true },
    { value: "2026-07", name: "กรกฎาคม 2569", displayShort: "ก.ค. 69", isInProject: true },
    { value: "2026-08", name: "สิงหาคม 2569", displayShort: "ส.ค. 69", isInProject: true }
  ],
  boqItems: [
    { id: 1, name: "งานโครงสร้าง", amount: 1500000, planned: 1000000, remaining: 500000, percentage: 66.67 },
    { id: 2, name: "งานตกแต่งภายใน", amount: 800000, planned: 600000, remaining: 200000, percentage: 75.0 },
    { id: 3, name: "งานไฟฟ้าประปา", amount: 300000, planned: 250000, remaining: 50000, percentage: 83.33 }
  ],
  projectInfo: {
    id: 123,
    name: "โครงการทดสอบ",
    start_date: "2026-06-01",
    end_date: "2026-08-31"
  }
}
```

### **Test Environment Setup**
```typescript
// tests/setup/test-environment.ts
export async function setupTestEnvironment(page: Page) {
  // Auth setup
  await page.addInitScript(() => {
    localStorage.setItem('accesstoken', 'test-token')
    localStorage.setItem('merchantUUID', 'test-merchant')
    localStorage.setItem('user', JSON.stringify({ 
      id: 1, 
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    }))
  })
  
  // Mock API responses
  await page.route('**/crm/v2/projects/*/saleplan-v2', async route => {
    const method = route.request().method()
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: mockSalePlanV2Data })
      })
    } else if (method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: true, 
          message: 'บันทึกสำเร็จ',
          data: { saved_entries: 5 }
        })
      })
    }
  })
}
```

## 📋 Test Execution Strategy

### **Test Pyramid:**
```
                     /\
                    /  \
                   /    \
                  / E2E  \ (20%)
                 /________\
                /          \
               /            \
              / Integration  \ (30%)  
             /________________\
            /                  \
           /                    \
          /        Unit         \ (50%)
         /______________________\
```

### **Test Execution Pipeline:**
```yaml
# .github/workflows/sale-plan-v2-tests.yml
name: Sale Plan v2 Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run unit tests
        run: npm run test:unit
        
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run integration tests
        run: npm run test:integration
        
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Playwright
        run: npx playwright install
      - name: Run E2E tests
        run: npm run test:e2e:sale-plan-v2
        
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run visual regression tests
        run: npm run test:visual:sale-plan-v2
```

## 🎯 Quality Gates

### **Definition of Done:**
- [ ] All unit tests passing (95%+ coverage)
- [ ] All integration tests passing
- [ ] All E2E test scenarios covered
- [ ] Visual regression tests baseline established
- [ ] Performance benchmarks met
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness tested
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] API contract tests passing
- [ ] Load testing completed

### **Acceptance Criteria:**
1. **Functional**: All user workflows work end-to-end
2. **Performance**: Load time <2s, interaction <100ms
3. **Reliability**: 99.9% test pass rate over 50 runs
4. **Security**: No sensitive data exposure in tests
5. **Maintainability**: Test code follows project standards

---

**Test Specification Version**: 1.0  
**Last Updated**: June 1, 2026  
**Test Framework**: Playwright + Vitest + Playwright Visual  
**Status**: Ready for Implementation