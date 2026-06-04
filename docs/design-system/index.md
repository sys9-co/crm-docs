---
layout: default
title: SYS9 CRM — UI Design System
---

# SYS9 CRM — UI Design System

> **Version:** Based on current codebase (มิ.ย. 2569)  
> **Plane Card:** [CRM-191](https://plane.sys9.co/sys9/projects/42274dc1-be6c-474d-9883-a7fe72feef44/issues/191)  
> **Stack:** Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS 4 + shadcn-vue (Reka UI)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Tokens](#design-tokens)
3. [Component Library](#component-library)
4. [Page Patterns](#page-patterns)
5. [Form Patterns](#form-patterns)
6. [Navigation Patterns](#navigation-patterns)
7. [Data Display Patterns](#data-display-patterns)
8. [Responsive Patterns](#responsive-patterns)
9. [API Data Flow](#api-data-flow)
10. [Icon Usage](#icon-usage)
11. [Thai Language Conventions](#thai-language-conventions)
12. [Checklist for New Pages](#checklist-for-new-pages)

---

## Architecture Overview

```
Stack: Nuxt 4 (SSR: false) + Vue 3 + TypeScript + Tailwind CSS 4 + shadcn-vue (Reka UI)
Modules: shadcn-nuxt, nuxt-lucide-icons, @vite-pwa/nuxt, vue3-toastify, vue3-apexcharts
Icons: lucide-vue-next (auto-imported via nuxt-lucide-icons, prefix Icon)
```

### App Flow

```
Splash (/) → Home (/home) → Feature pages via Sidebar
```

### Layouts

| Layout | Structure | Used For |
|--------|-----------|----------|
| **default** | SidebarProvider + HeaderView + AppSidebar + SidebarInset → NuxtPage | All feature pages |
| **popup** | min-h-screen bg-[#EFF2F4] + NuxtPage only | Modal-like pages |
| **action** | Bare NuxtPage only | Splash (/), Sign-in (/sign) |

---

## Design Tokens

### Colors — Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#EFF2F4` | Page background |
| `--foreground` | `#212121` | Body text |
| `--card` | White | Card/surface |
| `--card-foreground` | Dark navy | Card text |
| `--primary` | Dark navy `oklch(0.21 0.034 264.665)` | Primary text |
| `--secondary` / `--muted` | Light gray `oklch(0.967 0.003 264.542)` | Backgrounds |
| `--muted-foreground` | Gray `oklch(0.551 0.027 264.364)` | Muted text |
| `--destructive` | Red `oklch(0.577 0.245 27.325)` | Delete/danger |
| `--border` | Light gray `oklch(0.928 0.006 264.531)` | Borders |
| `--radius` | `0.625rem` (10px) | Base border radius |

### Action Colors (Hardcoded)

| Context | Style | Example |
|---------|-------|---------|
| Create/Action button | `bg-yellow-400 hover:bg-yellow-500 text-black font-medium` | "สร้างพนักงาน", "สร้างโครงการ" |
| Save/Confirm | `bg-green-500` | บันทึก |
| Header accent | `3px solid #FACC15` (yellow) | Top nav bar |
| Active sidebar item | `bg-yellow-100 text-yellow-900` | Current page |
| Gradient | `#F4D444 → #EE821A → #F34A62` | Progress bars, home icons |

### Status Badges (Inline)

| Status | Classes |
|--------|---------|
| Active (ใช้งาน) | `bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs` |
| Inactive (ระงับ) | `bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs` |
| Admin role | `bg-green-100 text-green-700 border border-green-200` |
| Manage role | `bg-blue-100 text-blue-700 border border-blue-200` |
| Reader role | `bg-gray-100 text-gray-600 border border-gray-200` |

### Dark Mode

Inverts all tokens. Key changes:
- Background: dark navy → `rgb(17,17,17)`
- Foreground: `#FFFFFF`
- Border: `rgba(255,255,255,0.1)`
- Sidebar: dark background

### Spacing & Layout

- Page padding: `p-4 md:p-6`
- Card gap: `gap-4`, `space-y-3`
- Full-width responsive (no max-width constraint)

---

## Component Library

### shadcn-vue Components (38 groups)

| Component | Usage Pattern |
|-----------|---------------|
| **Button** | variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` |
| **Card** | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction |
| **Dialog** | Modal dialogs with overlay |
| **AlertDialog** | Confirm/cancel (two-step: action → confirm) |
| **Sheet** | Slide-over panels (user menu, app switcher) |
| **Table** | Data tables, custom thead `bg-[#CBD5E1]` |
| **Select** | Dropdown: Trigger + Content + Item pattern |
| **Input / InputGroup** | Text inputs, search bars with icon addons |
| **Breadcrumb** | Page nav — always on data pages |
| **Avatar** | User/member images with fallback initials |
| **Badge** | Inline status labels |
| **DropdownMenu** | Action menus (edit, delete, settings) |
| **Tabs** | Tabbed interfaces (settings, project detail) |
| **Popover** | Floating panels (app switcher) |
| **Collapsible** | Sidebar groups, accordion filters |
| **Tooltip** | Hover tooltips |
| **Switch / Checkbox / RadioGroup** | Form controls |
| **Calendar** | Date picker |
| **ScrollArea / Skeleton** | Scrollable containers, loading placeholders |
| **Spinner** | Loading spinner (custom addition) |

### Custom Shared Components

| Component | Purpose |
|-----------|---------|
| **LoadOverlay** | Teleported full-screen overlay (z-8000, bg-black/40, yellow spinner) |
| **HeaderView** | Fixed top bar (z-40, yellow bottom border, logo, app switcher, user menu) |
| **AppSidebar** | Collapsible sidebar (white bg, user profile + dynamic menu) |
| **MenusView** | RBAC-gated dynamic sidebar menu items |
| **WeeklyCalendar** | Weekly calendar for appointments |
| **ThaiAddressSearch** | Province/amphure/tambon cascading select |
| **MoneyInput / MoneyDecimalInput** | Currency-formatted inputs |
| **SelectCustomer / SelectContactPerson / SelectMembers / SelectProject** | Search/select dialogs for entities |
| **AppointmentCard** | Appointment display card |

### Feature Components

| Feature | Component Count | Directory |
|---------|----------------|-----------|
| Customer | 9 | `CustomerProfileCard`, `CustomerMetrics`, `CustomerTimeline`, `CustomerContacts`, `CustomerProjects`, `CustomerQuotations`, `CustomerSalePlans`, `CustomerOrders`, `CustomerVisits` |
| Project | 16 | `OverviewView`, `GeneraleFormView`, `BOQ*`, `PlanSale*`, `TimelineView`, `DocumentView`, `VisitView`, `saleplan-v2/*` |
| Saller | 8 | `StructureFormView`, `RoleView`, `SallerDetailView`, `SallerAllView`, `EmployeeAllView`, `TeamSallerFormView`, dialogs |
| Contact | 5 | `DetailView`, `EditView`, `GeneralFormView`, `RelationshipFormView`, `QuickAddContactForm` |
| Member | 2 | `MemberFormView`, `SelectUser` |
| Setting | 6 | `GeneralFormView`, `NotificationView`, `RoleManagementView`, `PermissionMenuView`, `UsersView`, `SaleTeamView` |

---

## Page Patterns

### Standard List Page Structure

```
Bg: #EFF2F4
├── Breadcrumb strip (white bg)
├── Title + Search + Action row
│   ├── h2 (page title)
│   ├── InputGroup (search)
│   └── Button bg-yellow-400 (create action)
├── Filters (collapsible)
└── Content
    ├── Desktop: Card > Table
    └── Mobile: inline Card list
```

### Customer List Page (`/customers`)

```
├── Breadcrumb: Home → ลูกค้า
├── Search Card
│   ├── Search input: placeholder "ค้นหาด้วยชื่อ, รหัส, โทรศัพท์, อีเมล..."
│   ├── "ตัวกรองขั้นสูง" toggle → filters: จังหวัด, อำเภอ, วันที่ติดต่อ
│   └── Sort controls + "แสดง X จาก Y รายการ"
├── Desktop: Table (ชื่อ, รหัส, โทรศัพท์, จังหวัด, จำนวนโครงการ, ติดต่อล่าสุด)
├── Mobile: Cards (name, code, phone, province, date)
├── Empty: SearchX icon + "ไม่พบข้อมูลลูกค้า"
└── Load More button (pagination)
```

### Customer Detail Page (`/customers/:uuid`)

```
├── Breadcrumb: Home → ลูกค้า → [name]
├── CustomerProfileCard (avatar, name, contact info, social)
├── CustomerMetrics (KPIs)
└── Tabs: Overview, รายชื่อติดต่อ, โครงการ, ใบเสนอราคา, แผนการขาย, รายการสั่งซื้อ, ประวัติการเยี่ยม
```

### Standard Page Template

```
<template>
  <div class="min-h-screen w-full overflow-x-hidden bg-[#EFF2F4] dark:bg-black">
    <LoadOverlay v-model="is_load_overlay" />
    <!-- Breadcrumb -->
    <div class="w-full p-4 bg-card text-card-foreground">
      <Breadcrumb>...</Breadcrumb>
    </div>
    <!-- Title + Action -->
    <div class="w-full p-4 pt-0 bg-card text-card-foreground">
      <h2>ชื่อหน้า</h2>
      <Button bg-yellow-400 @click="navigateTo('/path/create')">
        <Plus />สร้างรายการ
      </Button>
    </div>
    <!-- Desktop table / Mobile cards -->
    <div class="hidden md:block">...</div>
    <div class="md:hidden">...</div>
  </div>
</template>
```

---

## Form Patterns

### Form Validation (vee-validate + zod)

```typescript
const schema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().regex(/^[\d\-+() ]{9,}$/, 'เบอร์โทรไม่ถูกต้อง'),
})
const { handleSubmit, errors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: { name: '', email: '', phone: '' },
})
```

### Key Rules
- Always include ALL fields in `initialValues`
- Use `superRefine` not `refine` in Zod
- Call `checkFormValid()` after `setFieldValue`
- All validation messages in Thai

### Confirmation Dialog (Two-Step)

```html
<Button @click="openDialog">บันทึก</Button>
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>ยืนยันการบันทึก</AlertDialogTitle>
      <AlertDialogDescription>ข้อความยืนยัน</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
      <AlertDialogAction>ยืนยัน</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Navigation Patterns

### Sidebar Menu

```
ภาพรวม
├── หน้าหลัก (/home)
└── แดชบอร์ด (/dashboard)
รายชื่อติดต่อ (/contacts)
ปฏิทินการเยี่ยมหน้างาน (/appointment)
ออกเยี่ยม (/appointment/visit)
โครงการ (/projects)
ใบเสนอราคา (/quotations)
การตั้งค่า
├── พนักงาน (/members)
├── ทีมขาย (/saller)
└── ตั้งค่าทั่วไป (/settings)
```

### RBAC Permission Gating

Each menu item gated via `v-if="menuPerms.xxx"`:
- Roles: `merchant.crm.admin` > `merchant.crm.manage` > `merchant.crm.reader`
- Active highlight: `bg-yellow-100 text-yellow-900`
- Collapsible groups for ภาพรวม and การตั้งค่า

### Header Navigation

- Fixed top (z-40), yellow bottom border
- Logo + "SYS9 CRM" + merchant name
- App switcher (Grid3X3 icon)
- User menu (avatar → Sheet with profile, settings, logout)

---

## Data Display Patterns

### Table Styling

Tables use shadcn-vue Table with custom header `bg-[#CBD5E1]`:

```
TableHeader > TableRow.bg-[#CBD5E1] > TableHead
TableBody > TableRow.cursor-pointer.hover:bg-gray-50 > TableCell
```

### Loading States

| State | Component | Class |
|-------|-----------|-------|
| Full load | LoadOverlay | `v-model="is_load_overlay"` |
| Inline loading | Spinner / Loader2 | `size-8 animate-spin text-yellow-500` |
| Form saving | Button spinner | Disabled + inline spinner |

### Empty State

```
SearchX.icon + "ไม่พบข้อมูล"
```

### Pagination

- Desktop: Infinite scroll via scroll event
- Mobile: "โหลดเพิ่ม" button

---

## Responsive Patterns

| Breakpoint | Desktop (`md:`) | Mobile (default) |
|------------|----------------|------------------|
| List display | Table | Cards |
| Search | Inline with title | Full-width below title |
| Sidebar | Visible, collapsible | Hidden, hamburger toggle |
| Forms | Multi-column grid | Single column |
| Table scroll | Normal | Horizontal scroll (`overflow-auto`) |

### Responsive Markup Pattern

```html
<!-- Desktop only -->
<div class="hidden md:block">
  <Card><Table>...</Table></Card>
</div>

<!-- Mobile only -->
<div class="md:hidden space-y-3">
  <Card v-for="item in items">...</Card>
</div>
```

---

## API Data Flow

### Composable Pattern

```typescript
export function useCustomer() {
  const customer = ref<Customer | null>(null)
  const loading = reactive({ detail: false, search: false })
  const error = ref<string | null>(null)

  async function fetchCustomer(uuid: string) {
    loading.detail = true
    try {
      const res = await $callGet(`/crm/${config.public.api_version}/customers/${uuid}`)
      if (res?.status) customer.value = res.data
    } catch (e) {
      console.error(e)
      error.value = 'โหลดข้อมูลไม่สำเร็จ'
    } finally { loading.detail = false }
  }
  return { customer, loading, error, fetchCustomer }
}
```

### API Call Pattern

```typescript
const { $callGet, $callPost, $callPut, $callDel } = useNuxtApp()
const config = useRuntimeConfig()
const url = `/crm/${config.public.api_version}/resource/${id}`
const res: APIResponse<T> = await $callGet(url)
```

### Error Handling

```typescript
try {
  const res = await $callGet(url)
  if (res?.status) { items.value = res.data }
  else { toast.error(res?.message || 'เกิดข้อผิดพลาด') }
} catch (e) {
  console.error(e)
  toast.error('โหลดข้อมูลไม่สำเร็จ')
} finally { is_load.value = false }
```

---

## Icon Usage

### Source: lucide-vue-next

All icons from `lucide-vue-next`, auto-imported via `nuxt-lucide-icons` with `Icon` prefix, or direct import.

### Common Icon Mapping

| Context | Icon |
|---------|------|
| Search | `Search` |
| Clear | `X` |
| Create | `Plus` |
| Loading | `Loader2` / `Spinner` |
| Empty | `SearchX` |
| Sort | `ArrowUpDown` |
| Expand | `ChevronDown` / `ChevronRight` |
| Action menu | `EllipsisVertical` |
| App switcher | `Grid3X3` |
| Upload/Import | `Upload` |
| Edit | `SquarePen` |

### Sidebar Navigation Icons

All sidebar icons use inline SVG (Heroicons style), NOT lucide icons.

---

## Thai Language Conventions

### UI Text Mapping

| English | Thai |
|---------|------|
| Save | บันทึก |
| Create | สร้าง |
| Cancel | ยกเลิก |
| Confirm | ยืนยัน |
| Delete | ลบ |
| Search | ค้นหา |
| Customer | ลูกค้า |
| Employee | พนักงาน |
| Project | โครงการ |
| Contact | รายชื่อติดต่อ |
| Settings | การตั้งค่า |
| Dashboard | แดชบอร์ด |
| No data | ไม่พบข้อมูล |
| Loading... | กำลังโหลด... |
| Success | สำเร็จ |
| Error | เกิดข้อผิดพลาด |

### Date Formatting

```typescript
$formatThaiDate(dateString)       // → "4 มิ.ย. 2569" (+543 Buddhist year)
$formatThaiDateFull(dateString)   // → "4 มิถุนายน 2569"
```

### Number Formatting

```typescript
new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
```

---

## Checklist for New Pages

1. Page layout follows standard structure (breadcrumb → title → content)
2. Desktop table + mobile cards responsive pattern
3. Loading state (Spinner with `text-yellow-500`)
4. Empty state (SearchX + "ไม่พบข้อมูล")
5. Error handling (toast.error in Thai)
6. Thai text throughout
7. `$formatThaiDate()` for dates
8. lucide-vue-next icons
9. API via `$callGet/$callPost` + composable pattern
10. RBAC permission gating
11. Confirm dialog for destructive actions
12. `superRefine` not `refine` in Zod
13. All fields in `initialValues`
14. `process.client` guard before localStorage access
15. `checkFormValid()` after `setFieldValue`

---

*Last updated: 4 มิถุนายน 2569*
