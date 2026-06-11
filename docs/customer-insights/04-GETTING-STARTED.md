# Customer Insights — Integration Guide

## 🤝 Frontend-Backend Coordination Guide

**Module**: `crm`  
**Integration Type**: Frontend-driven with backend API coordination  
**API Base**: `/crm/{api_version}`  

---

## 📋 Integration Overview

### **Team Responsibilities**

#### **Frontend Team (Current Repo — `sys9-co/crm`)**
- UI/UX implementation with shadcn-vue + Tailwind CSS 4
- API client integration via `useCustomer()` and `useCustomerAnalytics()` composables
- Mock data fallback pattern for independent development
- E2E testing with Playwright
- All UI text in Thai

#### **Backend Team (Separate Repo)**
- API specification implementation (25 routes — see 02-API-SPECIFICATION.md v1.1)
- Database schema creation (customers table + related entity tables)
- Aggregation query optimization
- Timeline UNION/aggregation logic
- Analytics queries

---

## 🔄 Integration Workflow

### **Phase 1: API Specification Agreement**

#### **Frontend Deliverables:**
```
✅ Complete API specification (02-API-SPECIFICATION.md)
✅ UI/UX implementation complete
✅ Database schema recommendations (03-DATABASE-SCHEMA.md)
✅ Mock data fallback for all endpoints
```

#### **Backend Review Process:**
```
📋 API specification review
📋 Database schema validation
📋 Aggregation query optimization
📋 Security considerations review
📋 API specification approval
```

### **Phase 2: Parallel Development**

The frontend is designed to work **independently** with mock data fallback. Every composable API call has a try/catch that falls back to mock data if the backend is unavailable.

### **Phase 3: Integration Testing**
- Switch from mock data to real API responses
- Verify all endpoints return correct `APIResponse<T>` / `PaginatedResponse<T>` shapes
- Test pagination, sorting, and filtering
- Validate Thai text in responses
- E2E tests with real backend

---

## 🔌 Frontend API Client Pattern

### **Composable: useCustomer()**

The main composable lives at `ui/composables/useCustomer.ts` and provides all customer-related data fetching with automatic mock fallback:

```typescript
import { useCustomer } from '@/composables/useCustomer'

const {
  customer,          // Ref<Customer | null>
  overview,          // Ref<CustomerOverview | null>
  timeline,          // Ref<CustomerTimelineEvent[]>
  quotations,        // Ref<CustomerQuotation[]>
  salePlans,         // Ref<CustomerSalePlan[]>
  orders,            // Ref<CustomerOrder[]>
  searchResults,     // Ref<PaginatedResponse<CustomerShort>>
  loading,           // Reactive loading flags
  error,             // Reactive error messages
  fetchCustomer,     // (uuid: string) => Promise
  fetchOverview,     // (uuid: string, months?: number) => Promise
  fetchTimeline,     // (uuid: string, months?: number, page?: number, size?: number) => Promise
  fetchQuotations,   // (uuid: string) => Promise
  fetchSalePlans,    // (uuid: string) => Promise
  fetchOrders,       // (uuid: string) => Promise
  searchCustomers,   // (params: CustomerSearchParams) => Promise
  fetchAllCustomerData, // (uuid: string, months?: number) => Promise
} = useCustomer()
```

### **Composable: useCustomerAnalytics()**

```typescript
import { useCustomerAnalytics } from '@/composables/useCustomerAnalytics'

const {
  analytics,           // Ref<CustomerAnalytics | null>
  sleepingCustomers,   // Ref<SleepingCustomer[]>
  topCustomers,        // Ref<{ customer: CustomerShort; total_value: number }[]>
  loading,             // Reactive loading flags
  error,               // Reactive error messages
  fetchAnalytics,      // () => Promise
  fetchSleepingCustomers, // (days?: number) => Promise
  fetchAll,            // (days?: number) => Promise
} = useCustomerAnalytics()
```

### **Mock Data Fallback Pattern**

Every API call in both composables follows this pattern — making the frontend fully functional without a backend:

```typescript
async function fetchCustomer(uuid: string) {
  loading.customer = true
  error.customer = ''
  try {
    const url = `/crm/${config.public.api_version}/customers/${uuid}`
    const res: APIResponse<Customer> = await $callGet(url)
    if (res?.status && res.data) {
      customer.value = res.data
    } else {
      customer.value = mockCustomer(uuid)  // Fallback to mock
    }
  } catch {
    error.customer = 'โหลดข้อมูลลูกค้าไม่สำเร็จ'
    customer.value = mockCustomer(uuid)    // Fallback on network error
  } finally {
    loading.customer = false
  }
}
```

> **Important**: When backend is ready, the mock fallback still works — so errors never break the UI. To validate real API data, check the `error` reactive state which will be non-empty if the API call failed.

### **Real API Call Pattern (without fallback)**

For integration testing, you can observe actual API errors:

```typescript
const url = `/crm/${config.public.api_version}/customers/${uuid}`
const res: APIResponse<Customer> = await $callGet(url)
if (res?.status && res.data) {
  customer.value = res.data
} else {
  // Backend returned status: false — show error.message
  toast.error(res?.message || 'โหลดข้อมูลไม่สำเร็จ')
}
```

---

## 🔐 Authentication

All API calls use the project's standard authentication via the global `$callGet` / `$callPost` / `$callPut` / `$callDel` plugins.

### **Headers (Auto-injected by plugin):**

```http
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

- `accessToken` — stored in `localStorage` key `accesstoken`
- `merchantUUID` — stored in `localStorage` key `merchantUUID`
- Headers are auto-injected by `plugins/globals.client.ts`
- No manual header handling in component code

### **Bypass Mode (Local Development)**

When `bypass_auth=true` in `.env`, the app auto-populates `accesstoken` and `merchantUUID` in localStorage. This allows frontend development without a real backend login flow.

---

## 📊 API Endpoint URL Map (target — spec v1.1)

| Frontend Composable Method | API Endpoint | Method |
|---|---|---|
| `searchCustomers(params)` | `/customers?search=...&page=...&size=...&sort_by=...&sort_order=...&customer_status=...&province=...&district=...&min_projects=...&last_visit_from=...&last_visit_to=...` | GET |
| `fetchCustomer(uuid)` | `/customers/{customer_uuid}` | GET |
| `fetchOverview(uuid, months)` | `/customers/{customer_uuid}/overview` | GET |
| `fetchTimeline(uuid, months, page, size)` | `/customers/{customer_uuid}/timeline?page=...&size=...` | GET |
| `fetchQuotations(uuid)` | `/customers/{customer_uuid}/quotations` | GET |
| `fetchSalePlans(uuid)` | `/customers/{customer_uuid}/sale-plans` | GET |
| `fetchOrders(uuid)` | `/customers/{customer_uuid}/orders` | GET |
| (CustomerProjects.vue) | `/customers/{customer_uuid}/projects` | GET |
| (CustomerContacts.vue) | `/customers/{customer_uuid}/contacts` | GET |
| (CustomerVisits.vue) | `/customers/{customer_uuid}/visits?page=...&size=...` | GET |
| `fetchAnalytics()` | `/customers/analytics?sleeping_threshold_days=...` | GET |
| `fetchSleepingCustomers(days)` | `/customers/sleeping?threshold_days=...&page=...&size=...` | GET |

## ⚠️ Known Frontend Deviations (fix in Phase 5 — backend must NOT implement these)

The frontend currently deviates from spec v1.1 in these places. Backend implements **the spec**; the frontend will be aligned in Phase 5:

| # | Current frontend behavior | Spec v1.1 target | File |
|---|---|---|---|
| 1 | `searchCustomers()` sends only `search`, `page`, `size` — filters/sort collected by the UI are dropped | Send all §14 params | `ui/composables/useCustomer.ts` (`searchCustomers`) |
| 2 | Orders fetched from `/customers/{uuid}/boq` | `/customers/{uuid}/orders` | `ui/composables/useCustomer.ts` (`fetchOrders`) |
| 3 | Analytics from `/dashboard/customer-insights`, sleeping from `/dashboard/sleeping-customers?days=` | `/customers/analytics?sleeping_threshold_days=`, `/customers/sleeping?threshold_days=` | `ui/composables/useCustomerAnalytics.ts` |
| 4 | Quick filter "หลับ" filters client-side on the current page only | Server-side `customer_status=sleeping` | `ui/pages/customers/index.vue` (`doSearch`) |
| 5 | Timeline/quotations/sale-plans/orders typed as bare arrays | `PaginatedResponse<T>` envelope | `ui/composables/useCustomer.ts` types + consumers |

---

## 🧪 Testing Strategy

### **Frontend Tests (Playwright E2E)**

```typescript
// Mock all customer API endpoints
await page.route('**/crm/**/customers/**', async (route: Route) => {
  const url = new URL(route.request().url())
  const path = url.pathname

  if (path.includes('/overview')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: true, data: mockOverview() })
    })
  } else if (path.includes('/timeline')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        data: { items: mockTimeline(3), total: 20, page: 1, size: 20, has_more: true }
      })
    })
  }
  // ... handle other endpoints
})
```

### **Contract Testing Checklist**

- [ ] Response matches `APIResponse<T>` shape (`status`, `message`, `data`)
- [ ] Every endpoint with `page`/`size` returns `PaginatedResponse<T>` (`items`, `total`, `page`, `size`, `has_more`) — no bare arrays
- [ ] All timestamps in ISO 8601 format
- [ ] Error responses include `error_code`
- [ ] Missing customer returns 404 with `CUSTOMER_NOT_FOUND`
- [ ] `/customers/analytics` and `/customers/sleeping` are routable (registered before `/customers/{uuid}`)
- [ ] `customer_status=sleeping` filter computed server-side with `threshold_days` default 365
- [ ] Sleep detection threshold parameter works correctly
- [ ] Sorting by all `sort_by` values works (name, last_interacted, project_count, contact_count, updated_at)
- [ ] Thai text round-trips correctly (UTF-8) in all create/update endpoints

---

## 🚀 Deployment Notes

### **Deployment Sequence:**
1. **Database migration** — Create `customers` table, apply indexes
2. **Backend API** — Implement spec v1.1 (25 routes; core read endpoints first: list, profile, overview, timeline)
3. **API integration test** — Verify responses match spec
4. **Frontend Phase 5** — Fix the 5 known deviations, then switch from mock data to real API (composables already handle both)
5. **E2E tests** — Run full suite against real backend

### **What NOT to change in frontend after backend is ready:**
- The composable patterns (useCustomer, useCustomerAnalytics) already handle both mock and real data
- Simply ensure the API returns valid `APIResponse<T>` and the frontend will use it
- If an endpoint returns `status: false`, the frontend shows the `message` in a Thai toast

---

**Integration Guide Version**: 1.1
**Last Updated**: June 11, 2026
**Status**: Spec frozen — Ready for Backend Implementation
