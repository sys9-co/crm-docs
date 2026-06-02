# Dashboard v2 - Business Logic & Validation Rules

## 🎯 Business Requirements

**Module**: `crm`  
**Component**: Dashboard v2 KPI Command Center  

## 📊 Core Business Logic

### **1. KPI Calculation Formulas**

#### **1.1 Visit Metrics**

```typescript
interface VisitMetrics {
  total: number
  completed: number
  planned: number
  completionRate: number
  byType: { call: number; onsite: number; other: number }
  avgDuration: number
}

function calculateVisitMetrics(
  visits: Visit[],
  targets: TeamTargets,
  period: DateRange
): VisitMetrics {
  const total = visits.length
  const completed = visits.filter(v => v.status === 'completed').length
  const planned = targets.visitTarget ?? total  // Use target if available, else actual total
  
  return {
    total,
    completed,
    planned,
    completionRate: planned > 0 ? (completed / planned) * 100 : 0,
    byType: {
      call: visits.filter(v => v.visitType === 'call').length,
      onsite: visits.filter(v => v.visitType === 'onsite').length,
      other: visits.filter(v => v.visitType === 'other').length
    },
    avgDuration: completed > 0 
      ? visits.filter(v => v.durationMinutes).reduce((sum, v) => sum + (v.durationMinutes || 0), 0) / completed
      : 0
  }
}
```

#### **1.2 Customer Metrics**

```typescript
interface CustomerMetrics {
  active: number
  newAcquired: number
  visitFrequency: number
  retentionRate: number
}

function calculateCustomerMetrics(
  customers: Customer[],
  visits: Visit[],
  previousPeriodCustomers: number,
  period: DateRange
): CustomerMetrics {
  const active = customers.filter(c => c.status === 'active').length
  const newAcquired = customers.filter(c => 
    c.createdAt >= period.from && c.createdAt <= period.to
  ).length
  
  // Visit frequency = Total visits / Active customers
  const visitFrequency = active > 0 ? visits.length / active : 0
  
  // Retention rate = Customers still active from previous period
  const retained = customers.filter(c => 
    c.createdAt < period.from && c.status === 'active'
  ).length
  const retentionRate = previousPeriodCustomers > 0 
    ? (retained / previousPeriodCustomers) * 100 
    : 100
  
  return {
    active,
    newAcquired,
    visitFrequency: Math.round(visitFrequency * 100) / 100,
    retentionRate: Math.round(retentionRate * 100) / 100
  }
}
```

#### **1.3 Revenue Metrics**

```typescript
interface RevenueMetrics {
  total: number
  target: number
  achievement: number
  perVisit: number
  trend: 'up' | 'down' | 'flat'
}

function calculateRevenueMetrics(
  visits: Visit[],
  revenueTarget: number,
  previousPeriodRevenue: number
): RevenueMetrics {
  const total = visits.reduce((sum, v) => sum + (v.revenue || 0), 0)
  const completedVisits = visits.filter(v => v.status === 'completed').length
  
  return {
    total,
    target: revenueTarget,
    achievement: revenueTarget > 0 ? (total / revenueTarget) * 100 : 0,
    perVisit: completedVisits > 0 ? total / completedVisits : 0,
    trend: detectTrend(total, previousPeriodRevenue)
  }
}
```

### **2. Trend Detection Algorithm**

```typescript
type TrendDirection = 'up' | 'down' | 'flat'

function detectTrend(
  currentValue: number,
  previousValue: number,
  threshold: number = 5  // 5% change threshold
): TrendDirection {
  if (previousValue === 0) return currentValue > 0 ? 'up' : 'flat'
  
  const changePercent = ((currentValue - previousValue) / previousValue) * 100
  
  if (changePercent > threshold) return 'up'
  if (changePercent < -threshold) return 'down'
  return 'flat'
}

function calculateChangePercent(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0
  return Math.round(((currentValue - previousValue) / previousValue) * 100 * 100) / 100
}
```

### **3. Composite Team Score Calculation**

```typescript
interface TeamScoreComponents {
  visitScore: number    // 0-100
  customerScore: number // 0-100
  revenueScore: number  // 0-100
}

function calculateTeamScore(metrics: TeamPerformance, targets: TeamTargets): TeamScoreComponents {
  // Visit score: based on completion rate (50%) and total volume vs target (50%)
  const completionScore = targets.visitTarget > 0
    ? (metrics.visits.completed / targets.visitTarget) * 100
    : 0
  const volumeScore = targets.visitTarget > 0
    ? (metrics.visits.total / targets.visitTarget) * 100
    : 0
  const visitScore = Math.min(100, (completionScore * 0.5 + volumeScore * 0.5))

  // Customer score: based on active count (40%) and new acquisition (30%) and retention (30%)
  const activeScore = targets.customerTarget > 0
    ? (metrics.customers.active / targets.customerTarget) * 100
    : 0
  const acquisitionScore = metrics.customers.newAcquired * 10  // 10 pts per new customer
  const retentionScore = metrics.customers.retentionRate
  const customerScore = Math.min(100, activeScore * 0.4 + acquisitionScore * 0.3 + retentionScore * 0.3)

  // Revenue score: based on achievement %
  const revenueScore = Math.min(100, metrics.revenue.achievement)

  return {
    visitScore: Math.round(visitScore * 100) / 100,
    customerScore: Math.round(customerScore * 100) / 100,
    revenueScore: Math.round(revenueScore * 100) / 100
  }
}

function calculateCompositeScore(components: TeamScoreComponents): number {
  // Weighted: Visits 30%, Customers 30%, Revenue 40%
  return Math.round(
    (components.visitScore * 0.3 + 
     components.customerScore * 0.3 + 
     components.revenueScore * 0.4) * 100
  ) / 100
}
```

## 👥 Role-Based Visibility Rules

### **Permission Matrix**

| Data Scope | Team Member | Team Leader | Manager |
|------------|-------------|-------------|---------|
| Own KPIs | ✅ Full | ✅ Full | ✅ Full |
| Team Aggregate KPIs | ✅ View | ✅ View | ✅ View |
| Team Member List | ❌ | ✅ View | ✅ View |
| Individual Member KPIs | ❌ | ✅ View | ✅ View |
| Cross-Team Comparison | ❌ | ❌ | ✅ View |
| All Teams' Members | ❌ | ❌ | ✅ View |
| Export Reports | ❌ | ❌ | ✅ |
| Bottom Performers | ❌ | ✅ Own team | ✅ All teams |

```typescript
type UserRole = 'member' | 'leader' | 'manager'

interface VisibilityScope {
  allowedTeamIds: number[]        // Which teams can this user see?
  canViewMembers: boolean         // Can see individual member data?
  canViewCrossTeam: boolean       // Can see cross-team comparison?
  canExport: boolean              // Can export reports?
}

function getVisibilityScope(user: User): VisibilityScope {
  switch (user.role) {
    case 'manager':
      return {
        allowedTeamIds: [],       // Empty = all teams
        canViewMembers: true,
        canViewCrossTeam: true,
        canExport: true
      }
    
    case 'leader':
      return {
        allowedTeamIds: [user.teamId],
        canViewMembers: true,
        canViewCrossTeam: false,
        canExport: false
      }
    
    case 'member':
    default:
      return {
        allowedTeamIds: [user.teamId],
        canViewMembers: false,
        canViewCrossTeam: false,
        canExport: false
      }
  }
}

function filterDashboardData<T extends { teamId: number }>(
  data: T[],
  user: User
): T[] {
  const scope = getVisibilityScope(user)
  
  if (scope.allowedTeamIds.length === 0) {
    return data  // Manager: see all
  }
  
  return data.filter(item => scope.allowedTeamIds.includes(item.teamId))
}
```

## 🔄 Team Filter Logic

### **Filter Propagation**

When a team is selected, all dashboard sections must filter accordingly:

```typescript
interface DashboardFilter {
  teamId: number | null   // null = all teams
  dateFrom: string        // ISO date
  dateTo: string          // ISO date
}

function applyDashboardFilter(
  filter: DashboardFilter,
  dashboardData: DashboardData
): FilteredDashboardData {
  const { teamId, dateFrom, dateTo } = filter
  
  return {
    overview: filterOverview(dashboardData.overview, teamId),
    timeseries: filterTimeseriesByDate(dashboardData.timeseries, dateFrom, dateTo),
    appointments: filterByTeam(dashboardData.appointments, teamId),
    projects: filterByTeam(dashboardData.projects, teamId),
    activity: filterByTeam(dashboardData.activity, teamId),
    teamPerformance: teamId 
      ? dashboardData.teamPerformance.filter(t => t.teamId === teamId)
      : dashboardData.teamPerformance
  }
}

// Debounce filter changes to avoid rapid API calls
function useDashboardFilter() {
  const filter = ref<DashboardFilter>({
    teamId: null,
    dateFrom: getStartOfMonth(),
    dateTo: getToday()
  })
  
  const debouncedFilter = refDebounced(filter, 300)  // 300ms debounce
  
  watch(debouncedFilter, async (newFilter) => {
    isRefreshing.value = true
    await refreshDashboard(newFilter)
    isRefreshing.value = false
  })
  
  return { filter, debouncedFilter }
}
```

### **Team Data Isolation Rules**

1. **Member selects own team** → Only their team's data
2. **Member selects "All"** → Not allowed (redirect to own team)
3. **Leader selects own team** → Team aggregate + member details
4. **Leader tries to select other team** → Not allowed
5. **Manager selects any team** → That team's data with member details
6. **Manager selects "All"** → Cross-team comparison view

## 💡 Real-Time Update Strategy

### **Polling Strategy**

```typescript
// Dashboard data refresh intervals based on data volatility
const REFRESH_INTERVALS = {
  overview: 300000,           // 5 minutes
  timeseries: 300000,         // 5 minutes
  activeProjects: 300000,     // 5 minutes
  todayAppointments: 30000,   // 30 seconds
  recentActivity: 60000,      // 1 minute
  teamPerformance: 300000     // 5 minutes
} as const

function useDashboardAutoRefresh() {
  const refreshTimers: Record<string, ReturnType<typeof setInterval>> = {}
  
  function startAutoRefresh(section: string, callback: () => Promise<void>) {
    const interval = REFRESH_INTERVALS[section as keyof typeof REFRESH_INTERVALS]
    if (!interval) return
    
    refreshTimers[section] = setInterval(callback, interval)
  }
  
  function stopAllRefresh() {
    Object.values(refreshTimers).forEach(clearInterval)
  }
  
  // Cleanup on unmount
  onUnmounted(stopAllRefresh)
  
  return { startAutoRefresh, stopAllRefresh }
}
```

### **Optimistic Updates**

For near real-time feel, use optimistic UI updates when user performs actions that affect dashboard data:

```typescript
function useOptimisticDashboardUpdate() {
  const dashboardData = ref<DashboardData>(initialData)
  
  // When user completes a visit
  function optimisticallyAddVisit(visit: Visit) {
    // Immediately update local state
    dashboardData.value.overview.visits.completed++
    dashboardData.value.overview.visits.completionRate = 
      calculateCompletionRate(dashboardData.value.overview.visits)
    
    // Then sync with server
    syncWithServer()
  }
  
  // When a new appointment is created
  function optimisticallyAddAppointment(appointment: Appointment) {
    dashboardData.value.todayAppointments.push(appointment)
    dashboardData.value.todayAppointments.sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    )
    
    // Then sync with server
    syncWithServer()
  }
}
```

## 📊 Time-Series Aggregation Logic

### **Interval-Based Aggregation**

```typescript
type AggregateInterval = 'daily' | 'weekly' | 'monthly'

function aggregateTimeSeries(
  rawData: Datapoint[],
  interval: AggregateInterval
): Datapoint[] {
  switch (interval) {
    case 'daily':
      return aggregateDaily(rawData)
    case 'weekly':
      return aggregateWeekly(rawData)
    case 'monthly':
      return aggregateMonthly(rawData)
  }
}

function aggregateDaily(rawData: Datapoint[]): Datapoint[] {
  return rawData.map(d => ({
    date: d.date,
    value: d.value,
    label: formatThaiDate(new Date(d.date), 'short')  // "1 มิ.ย. 69"
  }))
}

function aggregateWeekly(rawData: Datapoint[]): Datapoint[] {
  const weeklyMap = new Map<string, number[]>()
  
  rawData.forEach(d => {
    const weekKey = getISOWeekKey(d.date)  // "2026-W23"
    if (!weeklyMap.has(weekKey)) weeklyMap.set(weekKey, [])
    weeklyMap.get(weekKey)!.push(d.value)
  })
  
  return Array.from(weeklyMap.entries()).map(([week, values]) => ({
    date: week,
    value: values.reduce((sum, v) => sum + v, 0),
    label: `สัปดาห์ที่ ${getWeekNumber(week)}`
  }))
}

function aggregateMonthly(rawData: Datapoint[]): Datapoint[] {
  const monthlyMap = new Map<string, number[]>()
  
  rawData.forEach(d => {
    const monthKey = d.date.substring(0, 7)  // "2026-06"
    if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, [])
    monthlyMap.get(monthKey)!.push(d.value)
  })
  
  return Array.from(monthlyMap.entries()).map(([month, values]) => ({
    date: month,
    value: values.reduce((sum, v) => sum + v, 0),
    label: formatThaiMonth(month, 'short')  // "มิ.ย. 69"
  }))
}
```

## 🎯 Business Rules Summary

### **Core Rules:**

1. **KPI Calculation Period**: Always based on selected date range (default: current month-to-date)
2. **Trend Comparison**: Current period vs previous period of same length
3. **Completion Rate**: completed / planned * 100 (planned comes from team_targets)
4. **Team Filter**: Propagates to ALL dashboard sections simultaneously
5. **Role Enforcement**: Checked on both frontend (UI visibility) and backend (API authorization)
6. **Score Calculation**: Weighted composite (Visits 30%, Customers 30%, Revenue 40%)
7. **Trend Threshold**: ±5% change required to register as up/down (otherwise flat)

### **Validation Hierarchy:**

1. **Date Range Validation** (blocking)
   - `from` must be before `to`
   - Max 365 day range
   - Valid ISO date format
2. **Team Access Validation** (blocking)
   - Member: own team only
   - Leader: own team + members
   - Manager: all teams
3. **Metric Validation** (blocking)
   - Must be one of: `visits`, `customers`, `revenue`
4. **Data Quality Rules** (non-blocking warnings)
   - Zero values are valid (no data yet)
   - Missing targets default to zero achievement

### **Edge Cases:**

1. **Empty Team**: Show "ไม่มีข้อมูล" with zero values, no trend
2. **First Day of Month**: Compare to previous month's first day
3. **New Team (No History)**: No trend data, show "--" for change
4. **Holiday/Weekend**: Zero visits expected, don't show negative trend
5. **Cross-Year Ranges**: Proper Thai year (พ.ศ.) formatting for Dec/Jan boundary

### **Real-time Updates:**

1. **Manual Refresh**: Pull-to-refresh gesture on mobile, refresh button on desktop
2. **Auto-Refresh**: Appointments every 30s, activity every 1min, KPIs every 5min
3. **Filter Changes**: Debounced 300ms before API call
4. **Optimistic Updates**: Local state update before server confirmation

---

**Business Logic Version**: 1.0  
**Last Updated**: June 2, 2026  
**Validation Rules**: Complete  
**Status**: Ready for Implementation
