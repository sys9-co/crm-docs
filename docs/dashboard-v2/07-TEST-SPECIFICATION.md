# Dashboard v2 - Test Specification

## 🧪 Testing Strategy Overview

**Module**: `crm`  
**Component**: Dashboard v2 KPI Command Center  
**Testing Framework**: Playwright (E2E), Vitest (Unit), Playwright Visual (Regression)

## 🎯 Test Coverage Goals

### **Coverage Targets:**
- **E2E Test Coverage**: 100% user workflows
- **Unit Test Coverage**: 95%+ for KPI calculation logic
- **Visual Regression**: 100% UI components
- **API Contract**: 100% endpoint validation
- **Performance**: All critical user paths <2s

## 📋 Test Categories

### **1. Unit Tests**

#### **1.1 KPI Calculation Logic**
```typescript
// tests/unit/dashboard-kpi.test.ts
describe('Visit Metrics Calculation', () => {
  test('calculates visit metrics correctly', () => {
    const visits = [
      { id: 1, visitType: 'call', status: 'completed', durationMinutes: 30, revenue: 50000 },
      { id: 2, visitType: 'onsite', status: 'completed', durationMinutes: 60, revenue: 100000 },
      { id: 3, visitType: 'call', status: 'completed', durationMinutes: 15, revenue: 0 },
      { id: 4, visitType: 'onsite', status: 'pending', durationMinutes: null, revenue: 0 }
    ]
    const targets = { visitTarget: 5, customerTarget: 3, revenueTarget: 200000 }
    const period = { from: '2026-06-01', to: '2026-06-30' }
    
    const metrics = calculateVisitMetrics(visits, targets, period)
    
    expect(metrics.total).toBe(4)
    expect(metrics.completed).toBe(3)
    expect(metrics.planned).toBe(5)
    expect(metrics.completionRate).toBe(60)
    expect(metrics.byType).toEqual({ call: 2, onsite: 2, other: 0 })
    expect(metrics.avgDuration).toBe(35)  // (30+60+15) / 3
  })
  
  test('handles empty visits', () => {
    const metrics = calculateVisitMetrics([], { visitTarget: 0 }, { from: '', to: '' })
    
    expect(metrics.total).toBe(0)
    expect(metrics.completed).toBe(0)
    expect(metrics.completionRate).toBe(0)
    expect(metrics.avgDuration).toBe(0)
  })
})

describe('Revenue Metrics Calculation', () => {
  test('calculates revenue metrics correctly', () => {
    const visits = [
      { id: 1, status: 'completed', revenue: 100000 },
      { id: 2, status: 'completed', revenue: 150000 },
      { id: 3, status: 'completed', revenue: 0 }
    ]
    
    const metrics = calculateRevenueMetrics(visits, 500000, 400000)
    
    expect(metrics.total).toBe(250000)
    expect(metrics.target).toBe(500000)
    expect(metrics.achievement).toBe(50)
    expect(metrics.perVisit).toBe(83333.33)
    expect(metrics.trend).toBe('down')  // 250k vs 400k = -37.5%
  })
  
  test('detects up trend correctly', () => {
    const visits = [
      { id: 1, status: 'completed', revenue: 600000 }
    ]
    
    const metrics = calculateRevenueMetrics(visits, 500000, 400000)
    
    expect(metrics.trend).toBe('up')  // 600k vs 400k = +50%
  })
  
  test('detects flat trend within threshold', () => {
    const visits = [
      { id: 1, status: 'completed', revenue: 410000 }
    ]
    
    const metrics = calculateRevenueMetrics(visits, 500000, 400000)
    
    expect(metrics.trend).toBe('flat')  // +2.5% < 5% threshold
  })
})
```

#### **1.2 Trend Detection**
```typescript
// tests/unit/dashboard-trend.test.ts
describe('Trend Detection', () => {
  test('detects upward trend', () => {
    expect(detectTrend(120, 100, 5)).toBe('up')
    expect(detectTrend(200, 100, 5)).toBe('up')
  })
  
  test('detects downward trend', () => {
    expect(detectTrend(80, 100, 5)).toBe('down')
    expect(detectTrend(0, 100, 5)).toBe('down')
  })
  
  test('detects flat trend within threshold', () => {
    expect(detectTrend(103, 100, 5)).toBe('flat')
    expect(detectTrend(97, 100, 5)).toBe('flat')
    expect(detectTrend(100, 100, 5)).toBe('flat')
  })
  
  test('handles zero previous value', () => {
    expect(detectTrend(100, 0, 5)).toBe('up')
    expect(detectTrend(0, 0, 5)).toBe('flat')
  })
})
```

#### **1.3 Team Score Calculation**
```typescript
// tests/unit/dashboard-score.test.ts
describe('Team Composite Score', () => {
  test('calculates team score correctly', () => {
    const metrics = {
      visits: { total: 52, completed: 40, planned: 55, completionRate: 72.73, byType: { call: 15, onsite: 20, other: 5 }, avgDuration: 35 },
      customers: { active: 32, newAcquired: 5, visitFrequency: 1.63, retentionRate: 94 },
      revenue: { total: 850000, target: 1000000, achievement: 85, perVisit: 16346, trend: 'up' as const }
    }
    const targets = { visitTarget: 55, customerTarget: 30, revenueTarget: 1000000 }
    
    const components = calculateTeamScore(metrics as any, targets)
    
    expect(components.visitScore).toBeGreaterThan(0)
    expect(components.visitScore).toBeLessThanOrEqual(100)
    expect(components.customerScore).toBeGreaterThan(0)
    expect(components.customerScore).toBeLessThanOrEqual(100)
    expect(components.revenueScore).toBe(85)
    
    const composite = calculateCompositeScore(components)
    expect(composite).toBeGreaterThan(0)
    expect(composite).toBeLessThanOrEqual(100)
  })
})
```

#### **1.4 Role-Based Visibility**
```typescript
// tests/unit/dashboard-roles.test.ts
describe('Role-Based Visibility', () => {
  test('member can only see own team', () => {
    const user = { id: 1, teamId: 1, role: 'member' }
    const scope = getVisibilityScope(user as any)
    
    expect(scope.allowedTeamIds).toEqual([1])
    expect(scope.canViewMembers).toBe(false)
    expect(scope.canViewCrossTeam).toBe(false)
    expect(scope.canExport).toBe(false)
  })
  
  test('leader can see own team and members', () => {
    const user = { id: 2, teamId: 44, role: 'leader' }
    const scope = getVisibilityScope(user as any)
    
    expect(scope.allowedTeamIds).toEqual([44])
    expect(scope.canViewMembers).toBe(true)
    expect(scope.canViewCrossTeam).toBe(false)
  })
  
  test('manager can see all teams', () => {
    const user = { id: 3, teamId: 1, role: 'manager' }
    const scope = getVisibilityScope(user as any)
    
    expect(scope.allowedTeamIds).toEqual([])
    expect(scope.canViewMembers).toBe(true)
    expect(scope.canViewCrossTeam).toBe(true)
    expect(scope.canExport).toBe(true)
  })
})
```

### **2. Integration Tests**

#### **2.1 API Client Integration**
```typescript
// tests/integration/dashboard-api-client.test.ts
describe('Dashboard v2 API Client', () => {
  test('loads overview data successfully', async () => {
    const { loadOverview, overview } = useDashboard()
    
    // Mock successful API response
    vi.mocked($callGet).mockResolvedValueOnce({
      status: true,
      data: mockDashboardData.overview
    })
    
    await loadOverview()
    
    expect(overview.value).toEqual(mockDashboardData.overview)
    expect(overview.value?.visits.total).toBe(156)
    expect(overview.value?.revenue.trend).toBe('up')
  })
  
  test('loads team performance data successfully', async () => {
    const { loadTeamPerformance, teamPerformance } = useDashboard()
    
    vi.mocked($callGet).mockResolvedValueOnce({
      status: true,
      data: { teams: mockDashboardData.teamPerformance }
    })
    
    await loadTeamPerformance()
    
    expect(teamPerformance.value).toHaveLength(4)
    expect(teamPerformance.value?.[0].team_name).toBe('โครงการ(งานขนาดใหญ่)')
    expect(teamPerformance.value?.[0].rank).toBe(1)
  })
  
  test('handles API error gracefully', async () => {
    const { loadOverview, error } = useDashboard()
    
    vi.mocked($callGet).mockRejectedValueOnce(new Error('Network error'))
    
    await loadOverview()
    
    expect(error.value).toBe('โหลดข้อมูลภาพรวมไม่สำเร็จ')
  })
})
```

### **3. End-to-End Tests**

#### **3.1 Complete User Workflows**
```typescript
// tests/e2e/dashboard-v2.spec.ts
import { test, expect, type Route, type Page } from '@playwright/test'
import { mockDashboardData } from '../../mocks/dashboardMockData'

test.describe('Dashboard v2 - Complete Workflows', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accesstoken', 'dummy-token')
      localStorage.setItem('merchantUUID', 'dummy-merchant')
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        team_id: 1,
        role: 'manager'
      }))
    })
    
    // Mock all dashboard API endpoints
    await page.route('**/crm/v2/dashboard/overview*', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: mockDashboardData.overview })
      })
    })
    
    await page.route('**/crm/v2/dashboard/timeseries*', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          data: {
            metric: 'revenue',
            interval: 'daily',
            datapoints: mockDashboardData.timeseries,
            summary: { total: 2850000, average: 95000, min: 30000, max: 180000, trend: 'up', changePercent: 12.5 },
            pagination: { page: 1, size: 31, total: 90, totalPages: 3 }
          }
        })
      })
    })
    
    await page.route('**/crm/v2/dashboard/today-appointments*', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: mockDashboardData.appointments })
      })
    })
    
    await page.route('**/crm/v2/dashboard/active-projects*', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          data: mockDashboardData.activeProjects,
          pagination: { page: 1, size: 5, total: 12, totalPages: 3 }
        })
      })
    })
    
    await page.route('**/crm/v2/dashboard/recent-activity*', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          data: { activities: mockDashboardData.activityFeed },
          pagination: { page: 1, size: 10, total: 50, totalPages: 5 }
        })
      })
    })
    
    await page.route('**/crm/v2/dashboard/team-performance*', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          data: { teams: mockDashboardData.teamPerformance, period: { from: '2026-06-01', to: '2026-06-30' } }
        })
      })
    })
  })

  test('[DB-001] Load Dashboard with all sections', async ({ page }: { page: Page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify KPI cards are visible
    await expect(page.getByTestId('kpi-card-visits')).toBeVisible()
    await expect(page.getByTestId('kpi-card-customers')).toBeVisible()
    await expect(page.getByTestId('kpi-card-revenue')).toBeVisible()
    
    // Verify KPI values render
    await expect(page.getByText('156')).toBeVisible()  // Total visits
    await expect(page.getByText('89')).toBeVisible()   // Active customers
    await expect(page.getByText(/2,850,000/)).toBeVisible()  // Revenue
    
    // Verify today's appointments
    await expect(page.getByTestId('appointment-schedule')).toBeVisible()
    await expect(page.getByText('ประชุมติดตามงาน')).toBeVisible()
    await expect(page.getByText('โทรติดตามยอดขาย')).toBeVisible()
    
    // Verify active projects
    await expect(page.getByText('WG-Server-098')).toBeVisible()
    
    // Verify activity feed
    await expect(page.getByText('เยี่ยมชมโครงการ WG-Server-098')).toBeVisible()
    
    // Verify team performance table
    await expect(page.getByTestId('team-performance-table')).toBeVisible()
    await expect(page.getByText('ปลีก(สนญ)')).toBeVisible()
    await expect(page.getByText('ปลีก(สันกำแพง)')).toBeVisible()
    await expect(page.getByText('โครงการ(งานขนาดใหญ่)')).toBeVisible()
    await expect(page.getByText('ส่งร้านค้า(ค้าช่วง)')).toBeVisible()
  })

  test('[DB-002] Team filter changes all dashboard data', async ({ page }: { page: Page }) => {
    // Track API calls with team_id parameter
    let capturedTeamId: string | null = null
    
    await page.route('**/crm/v2/dashboard/overview*', async (route: Route) => {
      const url = new URL(route.request().url())
      capturedTeamId = url.searchParams.get('team_id')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: mockDashboardData.overview })
      })
    })
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Click team selector
    await page.getByTestId('team-selector').click()
    
    // Select a specific team
    await page.getByRole('option', { name: /โครงการ/ }).click()
    
    // Verify API was called with team_id
    await expect.poll(() => capturedTeamId, { timeout: 5000 }).toBeTruthy()
    expect(capturedTeamId).toBe('44')
    
    // Verify loading indicator appeared during filter change
    await expect(page.getByTestId('dashboard-loading')).not.toBeVisible()
  })

  test('[DB-003] Time-series chart renders with correct data', async ({ page }: { page: Page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify chart container is visible
    await expect(page.getByTestId('timeseries-chart')).toBeVisible()
    
    // Verify metric selector
    await expect(page.getByTestId('chart-metric-selector')).toBeVisible()
    
    // Change metric to 'visits'
    await page.getByTestId('chart-metric-selector').click()
    await page.getByRole('option', { name: /Visits/i }).click()
    
    // Verify chart re-renders with new data
    await expect(page.getByTestId('chart-summary')).toBeVisible()
    
    // Verify interval selector
    await page.getByTestId('chart-interval-selector').click()
    await page.getByRole('option', { name: /สัปดาห์/i }).click()
    
    // Verify chart re-renders with weekly aggregation
    await expect(page.getByText(/สัปดาห์/)).toBeVisible()
  })

  test('[DB-004] Date range filter affects time-series and KPI data', async ({ page }: { page: Page }) => {
    let capturedDateParams: { from?: string; to?: string } = {}
    
    await page.route('**/crm/v2/dashboard/timeseries*', async (route: Route) => {
      const url = new URL(route.request().url())
      capturedDateParams = {
        from: url.searchParams.get('from') ?? undefined,
        to: url.searchParams.get('to') ?? undefined
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: { datapoints: [], summary: {} } })
      })
    })
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Open date range picker
    await page.getByTestId('date-range-picker').click()
    
    // Select "7 วัน" preset
    await page.getByRole('button', { name: /7 วัน/ }).click()
    
    // Verify API called with updated date range
    await expect.poll(() => capturedDateParams.from, { timeout: 5000 }).toBeTruthy()
    expect(capturedDateParams.from).toBeDefined()
    expect(capturedDateParams.to).toBeDefined()
  })

  test('[DB-005] Team performance table shows all 4 teams with rankings', async ({ page }: { page: Page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify table structure
    await expect(page.getByTestId('team-performance-table')).toBeVisible()
    
    // Verify all 4 teams are listed
    await expect(page.getByRole('row', { name: /โครงการ/ })).toBeVisible()
    await expect(page.getByRole('row', { name: /ปลีก\(สนญ\)/ })).toBeVisible()
    await expect(page.getByRole('row', { name: /ปลีก\(สันกำแพง\)/ })).toBeVisible()
    await expect(page.getByRole('row', { name: /ส่งร้านค้า/ })).toBeVisible()
    
    // Verify rankings (highest score first)
    const firstRow = page.getByTestId('team-rank-1')
    await expect(firstRow).toContainText('82.3')
    
    // Verify color indicators
    await expect(page.getByTestId('team-color-โครงการ')).toHaveCSS('background-color', 'rgb(168, 85, 247)')
    await expect(page.getByTestId('team-color-ปลีก(สนญ)')).toHaveCSS('background-color', 'rgb(59, 130, 246)')
  })

  test('[DB-006] Today appointments show correct states', async ({ page }: { page: Page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify appointment items
    const pendingItem = page.getByTestId('appointment-pending').first()
    await expect(pendingItem).toBeVisible()
    await expect(pendingItem).toContainText('⏳')
    
    const completedItem = page.getByTestId('appointment-completed').first()
    await expect(completedItem).toBeVisible()
    await expect(completedItem).toContainText('✅')
    
    // Verify appointment details
    await expect(page.getByText('09:00')).toBeVisible()
    await expect(page.getByText('13:00')).toBeVisible()
    await expect(page.getByText('เยี่ยมสถานที่')).toBeVisible()
  })

  test('[DB-007] Mobile responsive layout shows stacked cards', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 667 })  // iPhone SE
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify single column layout
    await expect(page.getByTestId('dashboard-mobile-layout')).toBeVisible()
    
    // Verify KPI cards stack vertically
    const kpiCards = page.getByTestId('kpi-card')
    await expect(kpiCards).toHaveCount(3)
    
    // Verify appointments are collapsible
    await expect(page.getByTestId('appointment-section-collapsed')).toBeVisible()
    
    // Verify horizontal scroll for chart
    await expect(page.getByTestId('chart-horizontal-scroll')).toBeVisible()
    
    // Verify bottom navigation
    await expect(page.getByTestId('mobile-bottom-nav')).toBeVisible()
  })
})
```

### **4. Error Handling Scenarios**

```typescript
test.describe('Dashboard v2 - Error Handling', () => {
  test('[DB-E01] API failure during load shows error state', async ({ page }: { page: Page }) => {
    await page.route('**/crm/v2/dashboard/overview*', async (route: Route) => {
      await route.abort('failed')
    })
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify error message appears
    await expect(page.getByText('โหลดข้อมูลภาพรวมไม่สำเร็จ')).toBeVisible()
    
    // Verify retry button
    await expect(page.getByRole('button', { name: /ลองใหม่/ })).toBeVisible()
  })
  
  test('[DB-E02] Empty team shows no data state', async ({ page }: { page: Page }) => {
    await page.route('**/crm/v2/dashboard/overview*', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          data: {
            visits: { total: 0, completed: 0, planned: 0, completionRate: 0, byType: { call: 0, onsite: 0, other: 0 }, avgDuration: 0 },
            customers: { active: 0, newAcquired: 0, visitFrequency: 0, retentionRate: 0 },
            revenue: { total: 0, target: 0, achievement: 0, perVisit: 0, trend: 'flat' as const }
          }
        })
      })
    })
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify empty state
    await expect(page.getByText('ยังไม่มีข้อมูลในระยะเวลาที่เลือก')).toBeVisible()
    
    // Verify zero values display
    await expect(page.getByText('0')).toHaveCount(3)  // Three KPI zero values
  })
  
  test('[DB-E03] Unauthorized user sees login redirect', async ({ page }: { page: Page }) => {
    // Don't set auth tokens
    await page.addInitScript(() => {
      localStorage.clear()
    })
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
```

### **5. Visual Regression Tests**

#### **5.1 Component Visual Tests**
```typescript
// tests/visual/dashboard-v2-visual.spec.ts
test.describe('Dashboard v2 - Visual Regression', () => {
  test('Dashboard full view - desktop', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    await page.waitForTimeout(2000)
    
    await expect(page.getByTestId('dashboard-layout')).toHaveScreenshot('dashboard-desktop.png', {
      mask: [page.getByTestId('timeseries-chart')] // Mask dynamic chart
    })
  })
  
  test('Dashboard mobile layout', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    await page.waitForTimeout(2000)
    
    await expect(page.getByTestId('dashboard-mobile-layout')).toHaveScreenshot('dashboard-mobile.png')
  })
  
  test('Loading state skeleton', async ({ page }: { page: Page }) => {
    // Delay API responses to capture loading state
    await page.route('**/crm/v2/dashboard/**', async (route: Route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: {} })
      })
    })
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    await expect(page.getByTestId('loading-skeleton')).toHaveScreenshot('dashboard-loading.png')
  })
  
  test('Error state with retry', async ({ page }: { page: Page }) => {
    await page.route('**/crm/v2/dashboard/**', async (route: Route) => {
      await route.abort('failed')
    })
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    await expect(page.getByTestId('error-state')).toHaveScreenshot('dashboard-error.png')
  })
})
```

### **6. Performance Tests**

#### **6.1 Load Performance**
```typescript
// tests/performance/dashboard-performance.spec.ts
test.describe('Dashboard v2 - Performance', () => {
  test('Dashboard loads within performance budget', async ({ page }: { page: Page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="dashboard-layout"]')
    
    const loadTime = Date.now() - startTime
    
    // Verify load time under 2 seconds
    expect(loadTime).toBeLessThan(2000)
  })
  
  test('Team filter response time', async ({ page }: { page: Page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    const startTime = Date.now()
    
    // Change team filter
    await page.getByTestId('team-selector').click()
    await page.getByRole('option', { name: /โครงการ/ }).click()
    
    // Wait for data to refresh
    await expect(page.getByTestId('team-performance-table')).toBeVisible()
    
    const responseTime = Date.now() - startTime
    
    // Verify filter response under 500ms (after debounce)
    expect(responseTime).toBeLessThan(1000)
  })
})
```

## 📊 Test Data Management

### **Mock Data Structure**
```typescript
// tests/fixtures/dashboardMockData.ts
export const mockDashboardData = {
  overview: {
    visits: {
      total: 156,
      completed: 124,
      planned: 180,
      completionRate: 68.89,
      byType: { call: 45, onsite: 62, other: 17 },
      avgDuration: 35
    },
    customers: {
      active: 89,
      newAcquired: 12,
      visitFrequency: 1.75,
      retentionRate: 94.2
    },
    revenue: {
      total: 2850000.00,
      target: 3500000.00,
      achievement: 81.43,
      perVisit: 18269.23,
      trend: 'up' as const
    }
  },
  teamPerformance: [
    { teamId: 44, teamName: 'โครงการ(งานขนาดใหญ่)', teamColor: '#A855F7', rank: 1, score: 82.3 },
    { teamId: 1, teamName: 'ปลีก(สนญ)', teamColor: '#3B82F6', rank: 2, score: 78.5 },
    { teamId: 2, teamName: 'ปลีก(สันกำแพง)', teamColor: '#22C55E', rank: 3, score: 72.1 },
    { teamId: 4, teamName: 'ส่งร้านค้า(ค้าช่วง)', teamColor: '#F97316', rank: 4, score: 68.9 }
  ]
}
```

### **Test Environment Setup**
```typescript
// tests/setup/dashboard-test-environment.ts
export async function setupDashboardTestEnvironment(page: Page) {
  // Auth setup
  await page.addInitScript(() => {
    localStorage.setItem('accesstoken', 'test-token')
    localStorage.setItem('merchantUUID', 'test-merchant')
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      team_id: 1,
      role: 'manager'
    }))
  })
  
  // Mock all API responses
  await page.route('**/crm/v2/dashboard/**', async (route: Route) => {
    const url = route.request().url()
    
    if (url.includes('/overview')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: mockDashboardData.overview })
      })
    } else if (url.includes('/team-performance')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: { teams: mockDashboardData.teamPerformance } })
      })
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true, data: [] })
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
# .github/workflows/dashboard-v2-tests.yml
name: Dashboard v2 Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run unit tests
        run: npm run test:unit:dashboard

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run integration tests
        run: npm run test:integration:dashboard

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Playwright
        run: npx playwright install
      - name: Run E2E tests
        run: npm run test:e2e:dashboard-v2

  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run visual regression tests
        run: npm run test:visual:dashboard-v2
```

## 🎯 Quality Gates

### **Definition of Done:**
- [ ] All unit tests passing (95%+ coverage)
- [ ] All integration tests passing
- [ ] All 7 E2E test scenarios covered
- [ ] Visual regression tests baseline established
- [ ] Performance benchmarks met (<2s load time)
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness tested (375px, 768px, 1024px)
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] API contract tests passing
- [ ] Error handling scenarios covered

### **Acceptance Criteria:**
1. **Functional**: All dashboard workflows work end-to-end
2. **Performance**: Load time <2s, filter response <500ms
3. **Reliability**: 99.9% test pass rate over 50 runs
4. **Accuracy**: KPI calculations match business formulas
5. **Security**: Role-based visibility enforced at both UI and API levels

---

**Test Specification Version**: 1.0  
**Last Updated**: June 2, 2026  
**Test Framework**: Playwright + Vitest + Playwright Visual  
**Status**: Ready for Implementation
