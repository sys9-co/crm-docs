# Phase 1: My Day Hub (`/appointment/my-day`) — UI Mockup Spec

**Phase:** 1 — My Day Hub (designer handoff)
**Plane:** CRM-381 > Phase 1 Task
**Primary viewport:** 390px (mobile-first, layout `action`)
**Secondary:** 768px, 1024px+

---

## 1. Layout Overview

### Page structure (mobile 390px — primary)

```
+------------------------------------------+
|  HEADER (sticky top, z-40)               |
|  [<] วันนี้ของฉัน           [avatar]     |
|  23 มิ.ย. 2569 (วันจันทร์)               |
+------------------------------------------+
|                                          |
|  ┌── TRIP CARD ──────────────────────┐   |
|  │  (state-dependent content)        │   |
|  └───────────────────────────────────┘   |
|                                          |
|  ┌── FILTER CHIPS ───────────────────┐   |
|  │ [ทั้งหมด] [รอเยี่ยม] [เสร็จแล้ว]    │   |
|  └───────────────────────────────────┘   |
|                                          |
|  แผนวันนี้ (5 จุด)       [ดูเส้นทาง >]  |
|                                          |
|  ┌── VISIT CARD #1 ─────────────────┐   |
|  │  09:00-10:00 · บจก.ABC           │   |
|  │  Soi Sukhumvit 21      [นำทาง]   │   |
|  │  status badge     [เช็คอิน >>>]   │   |
|  └───────────────────────────────────┘   |
|                                          |
|  ┌── VISIT CARD #2 ─────────────────┐   |
|  │  ...                              │   |
|  └───────────────────────────────────┘   |
|                                          |
|  [+ บันทึกการเยี่ยมนอกแผน (walk-in)]    |
|                                          |
|                                          |
+------------------------------------------+
|  STICKY BOTTOM BAR (z-30)                |
|  3/5 จุด · 28.5 กม.        [ดูสรุป >]   |
+------------------------------------------+
```

### Responsive behavior

| Breakpoint | Layout changes |
|---|---|
| **390px** (primary) | Single column, full-width cards, sticky header + sticky bottom bar, layout `action` (no sidebar) |
| **768px** (tablet) | Same single column but with wider padding (`px-6`), cards max-width 640px centered |
| **1024px+** (desktop) | Two-column: left = visit list (max 640px), right = embedded Google Map preview (reuse `export.vue` map). Trip card spans full width above columns. Header becomes standard breadcrumb layout matching `appointment/index.vue` |

### Background & page wrapper
- `bg-[#EFF2F4] dark:bg-black min-h-screen` (consistent with all appointment pages)
- `pb-24 sm:pb-8` to account for sticky bottom bar on mobile (pattern from `create-v2.vue:64`)

---

## 2. Component Spec — Section by Section

### 2A. Header (sticky top)

**Mobile (390px):**
```
┌─────────────────────────────────────────┐
│ [<]  วันนี้ของฉัน                [avatar] │
│      23 มิ.ย. 2569 (วันจันทร์)           │
└─────────────────────────────────────────┘
```

- Sticky `fixed top-0 left-0 right-0 z-40` with `border-bottom: 3px solid #FACC15` (yellow accent, same as `create-v2.vue:37`)
- Back button `[<]` → `navigateTo('/appointment')` or `/home`
- Date formatted via `$formatThaiDateFull(today, 'long')` — Buddhist era
- Avatar: user initials circle (reuse pattern from sidebar)

**Desktop (1024px+):**
- Replace sticky nav with standard breadcrumb: `Home > ปฏิทินการเยี่ยม > วันนี้ของฉัน`
- Reuse `Breadcrumb/BreadcrumbList/BreadcrumbItem` from `ui/components/ui/breadcrumb`

**Component mapping:**
| Element | Component | Source |
|---|---|---|
| Back button | `Button` variant=`outline` size=`icon-sm` | `ui/components/ui/button` |
| Back icon | `ChevronLeft` | `lucide-vue-next` |
| Avatar | `Avatar` or inline `div` with initials | existing pattern |
| Date text | `$formatThaiDateFull()` | `plugins/globals.client.ts` |

---

### 2B. Trip Card (hero section)

Position: immediately below header, `mx-4 mt-4` (mobile), `mx-auto max-w-[640px]` (tablet+)

**Three states:**

#### State 1: NO_TRIP (ยังไม่เริ่มทริป)

```
┌─────────────────────────────────────────┐
│  ☀  สวัสดีตอนเช้า, [ชื่อ]               │
│                                         │
│  วันนี้มีนัด 5 จุด                       │
│  พร้อมออกเยี่ยมลูกค้าแล้วหรือยัง?        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │    ▶  เริ่มทริป                  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

- Card: `bg-white rounded-2xl shadow-sm border border-gray-100 p-5`
- Greeting icon: `Sun` (lucide) for morning, `Sunset` for afternoon — or simply `MapPinned`
- **CTA "เริ่มทริป"**: `Button` class=`w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl`
  - Min touch target: **56px** (h-14 = 56px, exceeds 44px requirement)
  - Icon: `Play` (lucide) left of text
- On tap: trigger GPS `getCurrentLocation()` → `POST /trips` → transition to State 2

#### State 2: ACTIVE (กำลังออกเยี่ยม)

```
┌─────────────────────────────────────────┐
│  🟢 กำลังออกเยี่ยม                       │
│  เริ่ม 08:12 น. · 2 ชั่วโมง 15 นาทีแล้ว  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │    ■  จบทริป                    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

- Card: `bg-green-50 rounded-2xl border-2 border-green-200 p-5`
- Status dot: `div` `w-3 h-3 rounded-full bg-green-500` with CSS pulse animation (`animate-pulse`)
- Time display: `started_at` formatted `HH:mm น.` + relative time calculated client-side (ทุก 60 วินาที update)
- **CTA "จบทริป"**: `Button` class=`w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl`
  - Icon: `Square` (lucide) left of text
  - Min touch target: 56px
- On tap: `AlertDialog` confirmation → GPS → `PUT /trips/{id}/end` → transition to State 3

#### State 3: COMPLETED (จบทริปแล้ว)

```
┌─────────────────────────────────────────┐
│  ✓ จบทริปแล้ว                            │
│  08:12 - 17:30 น. · 9 ชม. 18 นาที       │
│  5 จุด · 42.7 กม.                        │
│                                         │
│  [ดูสรุปทริป →]                          │
└─────────────────────────────────────────┘
```

- Card: `bg-gray-50 rounded-2xl border border-gray-200 p-5`
- Check icon: `CircleCheckBig` (lucide) `text-green-600`
- Summary text: visit count, distance from `trip.summary`
- Link "ดูสรุปทริป": `Button` variant=`ghost` → `navigateTo('/appointment/export?date=today')` or future trip summary page
- time range: `started_at` - `ended_at` formatted `HH:mm น.`

**Component mapping:**
| Element | Component | Source |
|---|---|---|
| Card wrapper | `Card` + `CardContent` | `ui/components/ui/card` |
| CTA buttons | `Button` (custom size class) | `ui/components/ui/button` |
| Confirm dialog | `AlertDialog` + sub-components | `ui/components/ui/alert-dialog` |
| Icons | `Play`, `Square`, `CircleCheckBig`, `Sun`, `MapPinned` | `lucide-vue-next` |

---

### 2C. Quick Filter Chips

Position: below Trip Card, `mx-4 mt-4`

```
[ ทั้งหมด (5) ]  [ รอเยี่ยม (3) ]  [ เสร็จแล้ว (2) ]
```

- Horizontal scroll container: `flex gap-2 overflow-x-auto pb-2 scrollbar-hide`
- Each chip: `Button` variant=`outline` size=`sm` with conditional active state
  - Default (inactive): `border-gray-300 text-gray-600 bg-white`
  - Active: `border-yellow-500 bg-yellow-50 text-yellow-800 font-semibold`
- Count in parentheses, derived from visit list filtering
- Filter values: `all` | `pending` | `completed`
- Min touch target: Button size `sm` = h-8 (32px) → override to `h-10 px-4` for 40px+ touch target on mobile

**Mapping to per-stop status:**
| Chip | Filter condition |
|---|---|
| ทั้งหมด | no filter |
| รอเยี่ยม | `check_in_at === null` (ยังไม่เช็คอิน) + `check_out_at === null && check_in_at !== null` (เช็คอินแล้ว) |
| เสร็จแล้ว | `check_out_at !== null` (เช็คเอาท์แล้ว) |

---

### 2D. Visit List Section

#### Section header

```
แผนวันนี้ (5 จุด)                    [ดูเส้นทาง >]
```

- `mx-4 mt-4 flex justify-between items-center`
- Title: `text-base font-semibold text-gray-800`
- "ดูเส้นทาง": `Button` variant=`ghost` size=`sm` → `navigateTo('/appointment/export?date=today')`
  - Icon: `Route` (lucide) + text
  - Reuses export.vue as destination

#### Visit Card (per stop)

**Base:** Reuse `AppointmentCard.vue` structure (Collapsible + color bar + DropdownMenu) with the following additions:

```
┌─────────────────────────────────────────┐
│  #1                                     │
│  09:00-10:00                 [⋮] [▼]    │
│  ┃ บจก.เอบีซี เทรดดิ้ง                   │
│  ┃ ถ.สุขุมวิท 21                         │
│  ┃                                      │
│  ┃ [Badge: รอเยี่ยม]                     │
│  ┃                                      │
│  ├──────────────────────────────────────┤
│  │  (expanded content — same as         │
│  │   AppointmentCard CollapsibleContent) │
│  ├──────────────────────────────────────┤
│  │                                      │
│  │  [นำทาง]           [เช็คอิน >>>]     │
│  │                                      │
│  └──────────────────────────────────────┘
```

**Additions to existing AppointmentCard pattern:**

1. **Stop number**: `#1`, `#2` prefix — `text-xs text-gray-400 font-mono`

2. **Per-stop status badge**: Below title, inside Collapsible header area
   - See section 2E for badge spec

3. **Action buttons row**: New row at bottom of card (always visible, outside Collapsible)
   - **"นำทาง" button**: `Button` variant=`outline` size=`sm`
     - Icon: `Navigation` (lucide)
     - `@click` → Google Maps deeplink: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` (pattern from `export.vue:207`)
     - Min height: `h-11` (44px touch target)
   - **"เช็คอิน" button**: `Button` class=`bg-blue-600 hover:bg-blue-700 text-white font-semibold` size=`default`
     - Icon: `LogIn` (lucide)
     - Min height: `h-11` (44px touch target)
     - `flex-1` to fill remaining space
     - On tap: GPS `getCurrentLocation()` → `POST /visits/{id}/checkin`
   - Layout: `flex gap-3 px-4 pb-4`

4. **Existing features preserved:**
   - Collapsible expand/collapse
   - DropdownMenu (edit/delete) — unchanged
   - Color bar by appointment_type (call=blue, onsite=green, other=purple)
   - Thai date + time display via `$formatThaiDateFull`

**Component mapping:**
| Element | Component | Source |
|---|---|---|
| Card shell | Reuse `AppointmentCard.vue` (extend via props/slots) | `ui/components/AppointmentCard.vue` |
| Status badge | `Badge` | `ui/components/ui/badge` |
| Nav button | `Button` variant=`outline` | `ui/components/ui/button` |
| Check-in button | `Button` (custom class) | `ui/components/ui/button` |
| Icons | `Navigation`, `LogIn`, `LogOut`, `CircleCheck` | `lucide-vue-next` |

---

### 2E. Per-Stop Status Badge Spec

Three states based on visit `check_in_at` / `check_out_at` fields:

| State | Label (Thai) | Badge style | Icon | Action button |
|---|---|---|---|---|
| **PENDING** (ยังไม่เช็คอิน) | รอเยี่ยม | `bg-yellow-100 text-yellow-800 border-yellow-200` | `Clock` | "เช็คอิน" (blue, primary) |
| **CHECKED_IN** (เช็คอินแล้ว) | กำลังเยี่ยม | `bg-blue-100 text-blue-800 border-blue-200` + pulse dot | `MapPin` | "เช็คเอาท์" (orange) |
| **CHECKED_OUT** (เสร็จแล้ว) | เยี่ยมแล้ว | `bg-green-100 text-green-800 border-green-200` | `CircleCheck` | disabled/none, show check-out time |

**Badge implementation:**
- Use `Badge` component with `variant="outline"` + custom class override
- Example: `<Badge variant="outline" class="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock class="size-3" /> รอเยี่ยม</Badge>`

**Action button per state:**

| State | Button text | Button class | Icon | Behavior |
|---|---|---|---|---|
| PENDING | เช็คอิน | `bg-blue-600 hover:bg-blue-700 text-white` | `LogIn` | GPS → POST /visits/{id}/checkin |
| CHECKED_IN | เช็คเอาท์ | `bg-orange-500 hover:bg-orange-600 text-white` | `LogOut` | GPS → POST /visits/{id}/checkout |
| CHECKED_OUT | เยี่ยมแล้ว 09:48 | `variant="ghost" text-green-600` disabled | `CircleCheck` | No action, display check_out time |

---

### 2F. Walk-in Button

Position: below visit list, `mx-4 mt-3 mb-4`

```
┌─────────────────────────────────────────┐
│  [+]  บันทึกการเยี่ยมนอกแผน (walk-in)    │
└─────────────────────────────────────────┘
```

- `Button` variant=`outline` class=`w-full h-12 border-dashed border-2 border-gray-300 text-gray-600 hover:border-yellow-500 hover:text-yellow-700 rounded-xl`
- Icon: `Plus` (lucide)
- Min touch target: 48px (h-12)
- `@click` → `navigateTo('/appointment/visit/create-v2')` (same as existing walk-in flow)
- Only visible when trip is `active` (State 2) — hidden in State 1 (no trip) and State 3 (completed)

---

### 2G. Sticky Bottom Summary Bar

Position: `fixed bottom-0 left-0 right-0 z-30` (mobile only, `sm:hidden`)
Pattern reused from `create-v2.vue:519-537`

```
┌─────────────────────────────────────────┐
│  3/5 จุด · 28.5 กม.        [ดูสรุป >]   │
└─────────────────────────────────────────┘
```

- Container: `bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between`
- Left side: summary text
  - `{completed}/{total} จุด` — `text-sm font-medium text-gray-800`
  - `· {distance} กม.` — `text-sm text-gray-500`
  - Distance: from `trip.summary.distance_km` or client-calculated (pending OQ-12)
- Right side: `Button` variant=`ghost` size=`sm` → trip summary / export page
  - Text: "ดูสรุป"
  - Icon: `ChevronRight` (lucide)

**Desktop (1024px+):** Bottom bar not shown. Summary info displayed inline above visit list or in Trip Card.

---

## 3. State Diagrams

### 3A. Trip Card State Machine (UI)

```
                    Page load
                       │
                       ▼
              GET /trips/today
                       │
            ┌──────────┼───────────┐
            ▼          ▼           ▼
        data=null   status=      status=
                    "active"    "completed"
            │          │           │
            ▼          ▼           ▼
       [NO_TRIP]   [ACTIVE]   [COMPLETED]
            │          │           │
     tap "เริ่มทริป"    │      tap "ดูสรุป"
            │          │           │
     GPS prompt   tap "จบทริป"     │
            │          │           ▼
     POST /trips  AlertDialog   export.vue
            │     → GPS prompt
            │          │
            ▼     PUT /trips/end
       [ACTIVE]        │
                       ▼
                  [COMPLETED]
```

### 3B. Per-Stop State Machine (UI)

```
     [PENDING]  ──tap "เช็คอิน"──▶  [CHECKED_IN]  ──tap "เช็คเอาท์"──▶  [CHECKED_OUT]
  (check_in_at     GPS prompt      (check_in_at       GPS prompt        (check_out_at
   = null)      POST /checkin        != null,        POST /checkout       != null)
                                   check_out_at
                                    = null)
```

**Conditions:**
- เช็คอินได้เฉพาะเมื่อ trip = `active` (BR-CI-2)
- ต้อง checkout visit ก่อนหน้าก่อน checkin visit ถัดไป (BR-CI-1) — UI disable ปุ่มเช็คอินถ้ามี visit อื่นยัง CHECKED_IN

---

## 4. Full Component Mapping

| UI Element | shadcn-vue Component | Import path | Props/variant |
|---|---|---|---|
| Page wrapper | — (plain `div`) | — | `bg-[#EFF2F4] min-h-screen` |
| Trip card | `Card`, `CardContent` | `@/components/ui/card` | — |
| Start/End trip buttons | `Button` | `@/components/ui/button` | custom class (green/red, h-14) |
| Trip confirm dialog | `AlertDialog` + children | `@/components/ui/alert-dialog` | — |
| Filter chips | `Button` | `@/components/ui/button` | `variant="outline"`, custom active class |
| Visit card (base) | Reuse `AppointmentCard.vue` | `@/components/AppointmentCard.vue` | extend with props: `mode="my-day"` |
| Visit status badge | `Badge` | `@/components/ui/badge` | `variant="outline"` + custom class |
| Visit action buttons | `Button` | `@/components/ui/button` | check-in: custom blue, nav: outline |
| Walk-in button | `Button` | `@/components/ui/button` | `variant="outline"`, dashed border |
| Sticky bottom bar | — (plain `div`) | — | `fixed bottom-0` pattern from create-v2 |
| Collapsible (visit) | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | `@/components/ui/collapsible` | (from AppointmentCard) |
| DropdownMenu (visit) | `DropdownMenu` + children | `@/components/ui/dropdown-menu` | (from AppointmentCard) |
| Loading overlay | `LoadOverlay` | `@/components/LoadOverlay.vue` | `v-model` |
| Breadcrumb (desktop) | `Breadcrumb` + children | `@/components/ui/breadcrumb` | (pattern from index.vue) |
| Skeleton loading | `Skeleton` | `@/components/ui/skeleton` | for loading state |
| Google Map (desktop) | `GoogleMap`, `AdvancedMarker` | `vue3-google-map` | (pattern from export.vue) |

---

## 5. Color & Icon Spec

### Status colors

| Status | Background | Text | Border | Icon (lucide) |
|---|---|---|---|---|
| Trip: no-trip | `bg-white` | `text-gray-800` | `border-gray-100` | `Sun` / `MapPinned` |
| Trip: active | `bg-green-50` | `text-green-800` | `border-green-200` | pulse dot (`bg-green-500 animate-pulse`) |
| Trip: completed | `bg-gray-50` | `text-gray-600` | `border-gray-200` | `CircleCheckBig` (`text-green-600`) |
| Visit: pending | `bg-yellow-100` | `text-yellow-800` | `border-yellow-200` | `Clock` |
| Visit: checked-in | `bg-blue-100` | `text-blue-800` | `border-blue-200` | `MapPin` |
| Visit: checked-out | `bg-green-100` | `text-green-800` | `border-green-200` | `CircleCheck` |

### Appointment type colors (existing — from AppointmentCard)

| Type | Bar color | Icon |
|---|---|---|
| `onsite` | `bg-green-500` | `MapPin` (green) |
| `call` | `bg-blue-500` | `Phone` (blue) |
| other | `bg-purple-500` | `Users` (purple) |

### CTA button colors

| Action | Background | Hover | Text |
|---|---|---|---|
| เริ่มทริป | `bg-green-600` | `bg-green-700` | white |
| จบทริป | `bg-red-600` | `bg-red-700` | white |
| เช็คอิน | `bg-blue-600` | `bg-blue-700` | white |
| เช็คเอาท์ | `bg-orange-500` | `bg-orange-600` | white |
| นำทาง | `variant=outline` | default hover | foreground |
| Walk-in | `variant=outline` dashed | `border-yellow-500` | `text-gray-600` → `text-yellow-700` |

### Icons used (all from `lucide-vue-next`)

| Icon name | Usage |
|---|---|
| `ChevronLeft` | Back button |
| `ChevronRight` | "ดูสรุป" |
| `ChevronDown` / `ChevronUp` | Collapsible toggle (existing) |
| `Play` | เริ่มทริป button |
| `Square` | จบทริป button |
| `Sun` / `Sunset` | Greeting (time-of-day) |
| `MapPinned` | Trip card fallback icon |
| `MapPin` | Visit location / checked-in status |
| `Clock` | Pending visit badge |
| `CircleCheck` | Completed visit badge |
| `CircleCheckBig` | Completed trip icon |
| `LogIn` | เช็คอิน button |
| `LogOut` | เช็คเอาท์ button |
| `Navigation` | นำทาง button |
| `Route` | ดูเส้นทาง link |
| `Plus` | Walk-in button |
| `MoreVertical` | DropdownMenu trigger (existing) |
| `Pencil` | Edit menu item (existing) |
| `Trash2` | Delete menu item (existing) |
| `Phone` / `Users` | Appointment type icons (existing) |

---

## 6. Mobile-first Wireframe (390px)

### Full page — State 2 (ACTIVE trip, mixed visit states)

```
┌──────────────────────────────────┐  ← 390px
│ [<]  วันนี้ของฉัน          [SN]  │  ← sticky header h-14
│      23 มิ.ย. 2569 (วันจันทร์)   │     yellow bottom border
├──────────────────────────────────┤
│                                  │
│ ┌──────────────────────────────┐ │  ← Trip card (ACTIVE)
│ │ 🟢 กำลังออกเยี่ยม            │ │
│ │ เริ่ม 08:12 น. · 2 ชม. แล้ว  │ │
│ │                              │ │
│ │ ┌──────────────────────────┐ │ │
│ │ │    ■  จบทริป              │ │ │  ← h-14 red button
│ │ └──────────────────────────┘ │ │
│ └──────────────────────────────┘ │
│                                  │
│ [ทั้งหมด(5)] [รอเยี่ยม(3)] [เสร็จ(2)]│ ← filter chips
│                                  │
│ แผนวันนี้ (5 จุด)   [ดูเส้นทาง>]│
│                                  │
│ ┌──────────────────────────────┐ │  ← Visit #1 (CHECKED_OUT)
│ │ #1  09:00-10:00      [⋮] [▼]│ │
│ │ ┃ บจก.เอบีซี เทรดดิ้ง        │ │
│ │ ┃ ถ.สุขุมวิท 21              │ │
│ │ ┃ [🟢 เยี่ยมแล้ว 09:48]      │ │
│ │ ─────────────────────────── │ │
│ │ [นำทาง]  [✓ เยี่ยมแล้ว 09:48]│ │  ← disabled green
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │  ← Visit #2 (CHECKED_IN)
│ │ #2  10:30-11:30      [⋮] [▼]│ │
│ │ ┃ ร้านสมชาย               │ │
│ │ ┃ ซ.ลาดพร้าว 71             │ │
│ │ ┃ [🔵 กำลังเยี่ยม]          │ │
│ │ ─────────────────────────── │ │
│ │ [นำทาง]    [เช็คเอาท์ >>]   │ │  ← orange button
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │  ← Visit #3 (PENDING)
│ │ #3  13:00-14:00      [⋮] [▼]│ │
│ │ ┃ หจก.ดีดี ซัพพลาย          │ │
│ │ ┃ ถ.พระราม 9                │ │
│ │ ┃ [🟡 รอเยี่ยม]             │ │
│ │ ─────────────────────────── │ │
│ │ [นำทาง]      [เช็คอิน >>]   │ │  ← blue button (disabled
│ └──────────────────────────────┘ │     if #2 still checked-in)
│                                  │
│ ┌──────────────────────────────┐ │
│ │ #4  14:30-15:30      [⋮] [▼]│ │  ← Visit #4 (PENDING)
│ │ ┃ ...                        │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │  ← Walk-in button
│ │ [+] บันทึกการเยี่ยมนอกแผน   │ │     dashed border
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│                                  │
│          (spacer pb-24)          │
├──────────────────────────────────┤
│ 2/5 จุด · 28.5 กม.  [ดูสรุป >] │  ← sticky bottom bar
└──────────────────────────────────┘
```

### Full page — State 1 (NO_TRIP)

```
┌──────────────────────────────────┐
│ [<]  วันนี้ของฉัน          [SN]  │
│      23 มิ.ย. 2569 (วันจันทร์)   │
├──────────────────────────────────┤
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ☀ สวัสดีตอนเช้า, สมชาย       │ │
│ │                              │ │
│ │ วันนี้มีนัด 5 จุด             │ │
│ │ พร้อมออกเยี่ยมลูกค้าแล้วหรือยัง? │ │
│ │                              │ │
│ │ ┌──────────────────────────┐ │ │
│ │ │   ▶  เริ่มทริป            │ │ │
│ │ └──────────────────────────┘ │ │
│ └──────────────────────────────┘ │
│                                  │
│ แผนวันนี้ (5 จุด)   [ดูเส้นทาง>]│
│                                  │
│ ┌──────────────────────────────┐ │
│ │ #1  09:00-10:00      [⋮] [▼]│ │
│ │ ┃ บจก.เอบีซี เทรดดิ้ง        │ │
│ │ ┃ [🟡 รอเยี่ยม]             │ │
│ │ ─────────────────────────── │ │
│ │ [นำทาง]  [เช็คอิน (disabled)]│ │  ← disabled: ยังไม่เริ่มทริป
│ └──────────────────────────────┘ │
│ ...                              │
│                                  │
│ (no walk-in button — trip ยังไม่เริ่ม) │
│                                  │
├──────────────────────────────────┤
│ 0/5 จุด              [ดูสรุป >] │
└──────────────────────────────────┘
```

---

## 7. Interaction Notes

### 7A. GPS Permission Flow (เริ่มทริป / เช็คอิน / เช็คเอาท์)

```
User taps action → getCurrentLocation({ timeout: 15000, maximumAge: 30000, enableHighAccuracy: true })
                                        ↑ (ปรับจาก spec §8b)
    ├── Success → proceed with API call (send lat/lng/accuracy)
    │
    └── Error (denied/timeout/unavailable)
        └── AlertDialog:
            Title: "ต้องเปิด GPS"
            Body: "ระบบต้องใช้ตำแหน่งเพื่อบันทึกการเยี่ยม กรุณาเปิด GPS แล้วลองใหม่"
            Actions: [ปิด]
            (OQ-24: PM decision pending — block or allow with warning)
```

- Reuse GPS pattern from `create-v2.vue` `getCurrentPosition`
- Show loading spinner on button during GPS acquisition
- GPS options: `{ timeout: 15000, maximumAge: 30000, enableHighAccuracy: true }` (per spec §8b recommendation)

### 7B. Trip Confirmation Flows

**เริ่มทริป:**
- No confirmation dialog needed (single tap to start, low-risk action)
- Show toast success: `"เริ่มทริปแล้ว"` (vue3-toastify)

**จบทริป:**
- `AlertDialog` confirmation required
  - Title: "จบทริปวันนี้?"
  - Body: "คุณเยี่ยมแล้ว {x}/{y} จุด ต้องการจบทริปหรือไม่?"
  - Actions: [ยกเลิก] [ยืนยันจบทริป (destructive red)]
- If visit still CHECKED_IN: warn "คุณยังไม่ได้เช็คเอาท์จุด {name} ระบบจะเช็คเอาท์อัตโนมัติ"

### 7C. Concurrent Check-in Prevention (BR-CI-1)

- If any visit is in CHECKED_IN state, disable "เช็คอิน" buttons on all other PENDING visits
- Disabled button shows tooltip/subtitle: "เช็คเอาท์จุดก่อนหน้าก่อน"
- Visual: button opacity-50 + `cursor-not-allowed`

### 7D. Tap Targets

All interactive elements must meet minimum **44px** touch target:

| Element | Actual size | Meets requirement? |
|---|---|---|
| เริ่มทริป / จบทริป button | h-14 (56px) | Yes |
| เช็คอิน / เช็คเอาท์ button | h-11 (44px) | Yes |
| นำทาง button | h-11 (44px) | Yes |
| Filter chips | h-10 (40px) | Borderline — add `min-h-[44px]` |
| Walk-in button | h-12 (48px) | Yes |
| DropdownMenu trigger | p-1 + icon = ~28px | Use `p-2` → 36px (existing, acceptable with gap) |
| Collapsible trigger | full card width, h-auto | Yes |

### 7E. Transitions & Animation

- Trip card state change: `transition-all duration-300` on card background/border
- Pulse animation on active trip dot: `animate-pulse` (Tailwind built-in)
- Visit card check-in/out: brief `scale-95 → scale-100` feedback on button press (`active:scale-95`)
- Filter chip switch: no animation needed (instant re-filter)
- List reorder after status change: none (maintain original time-based order)

### 7F. Page Load / Data Flow

```
onMounted:
  1. GET /trips/today → trip state (null / active / completed)
  2. Concurrent: GET visits for today (from trip.visits[] or appointments API)
  3. Set tripState → render Trip Card
  4. Set visits[] → render Visit List
  5. Compute summary (count, distance)
```

**Loading state:**
- Trip card: `Skeleton` (rounded-2xl, h-32)
- Visit list: 3x `Skeleton` cards (h-24 each)
- Use `Skeleton` from `ui/components/ui/skeleton`

**Empty state (no visits scheduled):**
- Reuse empty state pattern from `export.vue:214-232` (SVG illustration + "ไม่มีนัดหมายวันนี้")
- Show walk-in button below

**Error state:**
- Toast error via `vue3-toastify`
- Retry button in Trip card area

---

## 8. Responsive Notes

### 390px (mobile — primary)

- Single column, full bleed cards (`mx-4`)
- Sticky header (fixed top, z-40) + sticky bottom summary bar (fixed bottom, z-30)
- Layout: `action` (no sidebar, no desktop nav)
- Body padding: `pb-24` to clear bottom bar
- All text: max 2 lines with `line-clamp-2` for titles/addresses
- Visit cards: full width, vertical action buttons if needed at very narrow widths

### 768px (tablet)

- Same single column
- Wider padding: `px-6`
- Cards: `max-w-[640px] mx-auto`
- Sticky bottom bar still visible
- Trip card and visit cards: same layout, more breathing room

### 1024px+ (desktop)

- Switch to two-column layout:
  - Left column (flex-1, max-w-[640px]): Trip card + filter chips + visit list
  - Right column (w-[400px]): Google Map preview with pins (reuse `GoogleMap` + `AdvancedMarker` from export.vue)
- No sticky bottom bar — summary info moves to Trip card or inline above list
- Breadcrumb header replaces sticky mobile header
- Standard desktop nav/sidebar visible (layout default, not `action`)

### Entry point

- **Mobile:** Home page → "ออกเยี่ยม" icon/link → `/appointment/my-day`
- **Desktop:** Sidebar nav → "วันนี้ของฉัน" menu item under "ออกเยี่ยม"
- file to modify: `home.vue` entry point (add link/icon to My Day)

---

## 9. Visit Card — แสดง Project + ลูกค้า (My Day mode)

### ข้อมูลที่แสดงในการ์ด (บนลงล่าง)

```
+----------------------------------------------+
│▐ #1    09:00–10:00                    ⋮  ∨  │  ← stop number + time + menu + collapse
│▐ 📁 โครงการติดตั้งระบบ POS              │  ← project_name (สีฟ้า)
│▐ 🏢 บจก.เอบีซี เทรดดิ้ง                │  ← org_contact_name (สีดำ bold)
│▐ 📍 ถ.สุขุมวิท 21 คลองเตย กทม.        │  ← address_text (สีเทา)
│▐ 🟡 รอเยี่ยม                           │  ← status badge
│─────────────────────────────────────────│
│  [นำทาง]              [เช็คอิน >>>]    │  ← action buttons
+----------------------------------------------+
```

### Data fields
| แสดง | Source field | สี/style |
|------|------------|----------|
| Stop number | ลำดับจาก list | `text-xs text-muted mono` |
| เวลา | `starts_at` / `ends_at` | `text-xs text-gray-500` |
| ชื่อ project | `project_name` | `text-sm font-medium text-blue-600` + folder icon |
| ชื่อลูกค้า | `org_contact_name` | `text-sm font-semibold text-gray-900` + building icon |
| ที่อยู่ | `address_text` | `text-xs text-gray-400` + map-pin icon |
| Status badge | คำนวณจาก `check_in_at` / `check_out_at` | 3 states (ดู §4) |
| Walk-in badge | `visit_type === 'walkin'` (OQ-17) | `bg-orange-50 text-orange-700 border-orange-200` |

### ต่างจาก AppointmentCard เดิม
- **เดิม**: แสดง `title` (รวมข้อมูลทุกอย่างบรรทัดเดียว) + `location`
- **ใหม่ (My Day mode)**: แยกชัด — project (สีฟ้า) + ลูกค้า (ดำหนา) + ที่อยู่ (เทา) + status badge + action buttons
- ใช้ `mode="my-day"` prop บน AppointmentCard — เมื่อ mode ไม่ใช่ my-day จะแสดงแบบเดิม

### Walk-in card
- ขอบ `border-orange-500` (1.5px) + bar สีส้ม
- Badge "walk-in" ข้าง `org_contact_name` (`ti-walk` icon)
- เวลาแสดง "walk-in" แทน time slot

---

## 10. Trip Summary — Timeline Drilldown

### Timeline view (หน้าสรุปทริป)

แต่ละจุดใน timeline **กดได้** — เปิด drilldown แสดงรูปถ่ายหน้างาน + visit detail

```
📍 เริ่มทริป 08:12                       ← ไม่ drilldown
  │
  ├─ #1 บจก.เอบีซี เทรดดิ้ง              ← กดได้ → drilldown
  │    📁 โครงการติดตั้ง POS
  │    09:05–09:48 (43 นาที)
  │    [🖼][🖼][🖼] +2                    ← photo thumbnails
  │
  ├─ #2 ร้านสมชาย มินิมาร์ท              ← กดได้ → drilldown
  │    📁 ขยาย POS สาขา 3
  │    10:35–11:22 (47 นาที)
  │    [🖼][🖼]
  │
  ├─ #3 หจก.ดีดี ซัพพลาย                 ← กดได้ → drilldown
  │    📁 ติดตาม stock สินค้า
  │    13:10–14:05 (55 นาที)
  │    [🖼]
  │
📍 จบทริป 17:30                          ← ไม่ drilldown
```

### Timeline item แสดงอะไร
| แสดง | Source |
|------|--------|
| เวลาเช็คอิน–เช็คเอาท์ | `check_in_at` – `check_out_at` |
| ระยะเวลา | คำนวณจาก check_in/out diff |
| ชื่อ project | `project_name` (สีฟ้า) |
| ชื่อลูกค้า | `org_contact_name` (สีดำ bold) |
| Photo thumbnails | `GET /visits/{id}/photos` → แสดง 3 รูปแรก + "+N" ถ้ามีเกิน |
| Chevron `>` | indicate drilldown (กดได้) |

### Drilldown panel

กดจุดใน timeline → เปิด drilldown panel:

```
+------------------------------------------+
|  [←]  #1 บจก.เอบีซี เทรดดิ้ง   🟢เยี่ยมแล้ว |
+------------------------------------------+
|  ┌─────────────────────────────────────┐ |
|  │     📸 HERO PHOTO                   │ |
|  │     (รูปถ่ายหน้างาน)                 │ |
|  │                          5 รูป      │ |
|  └─────────────────────────────────────┘ |
|  [thumb1] [thumb2] [thumb3] [thumb4] [5] |
|                                          |
|  โครงการ      📁 โครงการติดตั้ง POS       |
|  เช็คอิน      09:05 น.                   |
|  เช็คเอาท์    09:48 น.                   |
|  ระยะเวลา     43 นาที                    |
|  เฟส BOQ      สำรวจพื้นที่                |
|  ที่อยู่      ถ.สุขุมวิท 21 คลองเตย      |
|                                          |
|  ┌── MINI MAP ──────────────────────┐   |
|  │       📍                          │   |
|  │    13.7401, 100.5298              │   |
|  └───────────────────────────────────┘   |
|                                          |
|  [นำทาง]           [เปิด Visit Detail]   |
+------------------------------------------+
```

### Drilldown interaction spec

| Interaction | Behavior |
|------------|----------|
| กด thumbnail | เปลี่ยน hero image (active border สีฟ้า) |
| กด hero image | เปิด `vue-easy-lightbox` (reuse จาก `visit/[id]/index.vue:388`) |
| กด "เปิด Visit Detail" | `navigateTo('/appointment/visit/' + visit_id)` → หน้า visit detail เต็ม |
| กด ← (back) | กลับ timeline view |
| ไม่มีรูป | แสดง placeholder icon (reuse `visit/[id]/index.vue:365-373`) |

### Drilldown data source
- **Visit detail**: `GET /visits/{id}` → `project_name`, `org_contact_name`, `address_text`, `check_in_at`, `check_out_at`, `boq_phase`, `geo_lat`, `geo_lng`
- **Photos**: `GET /visits/{id}/photos?page=1&size=100` → `image_list[].image_url` (endpoint มีอยู่แล้ว)
- **Map**: reuse `GoogleMap` + `AdvancedMarker` component — center ที่ `geo_lat/geo_lng`

### Responsive behavior
| Viewport | Drilldown behavior |
|----------|-------------------|
| Mobile (390px) | Full-screen overlay, slide from right (`transition: transform`) |
| Tablet (768px) | Full-screen overlay เหมือน mobile |
| Desktop (1024px+) | Split panel — ซ้าย: timeline, ขวา: drilldown (replace map column) |

---

## 11. Team Summary — หัวหน้าทีม (Phase 4)

### Access control
| Role | เห็นอะไร |
|------|---------|
| `admin` | เห็นทุกทีม — team selector dropdown |
| `manage` | เห็นเฉพาะทีมตัวเอง (team_id จาก user session) |
| `reader` | **ไม่เห็นเมนูนี้** (ซ่อน per usePermissions) |

### Page: `/appointment/team-summary`

#### KPI bar (4 ช่อง)
| KPI | คำนวณจาก | สี |
|-----|---------|-----|
| ลูกทีม | จำนวน members ในทีม | blue |
| ออกเยี่ยม | members ที่ trip.status = active หรือ completed วันนี้ | green |
| จุดเยี่ยม | visit ที่ check_out_at != null / total visits วันนี้ | default |
| % สำเร็จ | (completed visits / total visits) × 100 | orange |

#### Member card (list item)

```
+------------------------------------------------------+
│ [🟢 สช]  สมชาย ใจดี                    4   1       >│
│  (ring)   🟢 กำลังเยี่ยม · เริ่ม 08:15  เสร็จ เหลือ   │
│           ████████░░ 4/5 จุด · 42 กม.               │
+------------------------------------------------------+
```

| Element | Source |
|---------|--------|
| Avatar | initials จาก `first_name` + `last_name` |
| Ring color | active=เขียว solid, done=ฟ้า solid, not_started=เหลือง dashed, no_trip=เทา dashed |
| Status badge | คำนวณจาก trip.status ของ member วันนี้ |
| Progress bar | visited_count / total_planned_count |
| กม. | trip.total_distance_km |
| เสร็จ/เหลือ | visited_count / remaining_count |

#### สถานะ 4 แบบ + เรียงลำดับ

| ลำดับ | สถานะ | เงื่อนไข | Badge สี |
|-------|--------|---------|----------|
| 1 | กำลังเยี่ยม | trip.status = active | `bg-green-50 text-green-700` |
| 2 | ยังไม่เริ่ม | มีนัดวันนี้ แต่ trip ยังไม่สร้าง | `bg-yellow-50 text-yellow-700` |
| 3 | จบทริปแล้ว | trip.status = completed | `bg-blue-50 text-blue-700` |
| 4 | ไม่มีนัดวันนี้ | ไม่มี visit วันนี้ | `bg-gray-100 text-gray-500` |

#### Member drilldown (กดชื่อ → slide panel)

```
+------------------------------------------+
|  [←]  สมชาย ใจดี          🟢 กำลังเยี่ยม  |
+------------------------------------------+
|  🚗 ทริปวันนี้                             |
|  เริ่มทริป    08:15 น. · ถ.พหลโยธิน       |
|  จุดเยี่ยม     4/5 จุด (80%)              |
|  ระยะทาง      42.3 กม.                   |
|  เวลาเยี่ยมรวม 3 ชม. 10 นาที              |
|  ค่าใช้จ่าย    ฿850                       |
+------------------------------------------+
|  📋 จุดเยี่ยม                              |
|  #1 📁โครงการติดตั้ง POS                   |
|     🏢บจก.เอบีซี เทรดดิ้ง                  |
|     09:05–09:48 (43 นาที)  [🖼🖼🖼] ✅     |
|  #2 📁ขยาย POS สาขา 3                    |
|     🏢ร้านสมชาย มินิมาร์ท                  |
|     10:35–11:22 (47 นาที)  [🖼🖼] ✅       |
|  #3 📁ติดตาม stock                        |
|     🏢หจก.ดีดี ซัพพลาย                     |
|     13:10–14:05 (55 นาที)  [🖼] ✅         |
|  #4 📁เสนอขาย POS ใหม่                    |
|     🏢บจก.เจริญทรัพย์                      |
|     14:30– (กำลังเยี่ยม)      🔵           |
|  #5 📁ขยาย POS สาขา 5                    |
|     🏢ร้านมิตรภาพ                          |
|     นัด 15:30               🟡            |
+------------------------------------------+
|  [ดูเส้นทาง]        [ส่งข้อความ]          |
+------------------------------------------+
```

#### Drilldown data per member

| แสดง | Source |
|------|--------|
| Trip summary | `GET /trips?from=today&to=today&owner_user_id={member_user_id}` |
| Visit list | trip response → `visits[]` (nested) |
| Per-visit photos | `GET /visits/{id}/photos` — แสดง thumbnails (3 รูปแรก) |
| Per-visit project + customer | `project_name`, `org_contact_name` จาก visit object |

#### Action buttons

| ปุ่ม | Action |
|------|--------|
| ดูเส้นทาง | `navigateTo('/appointment/export?trip_id=' + trip.id)` → export.vue แสดง route ของลูกทีม |
| ส่งข้อความ | reserved — LINE deeplink หรือ in-app chat (Phase 4+) |

#### Responsive

| Viewport | Layout |
|----------|--------|
| Mobile (390px) | member list full-width, drilldown = full-screen overlay (slide right) |
| Tablet (768px) | เหมือน mobile |
| Desktop (1024px+) | split panel — ซ้าย: team list + KPIs, ขวา: member drilldown + Google Map |

#### Auto-refresh
- Poll `GET /trips?...&team_id=` ทุก 60 วินาที (fallback ถ้าไม่มี WebSocket)
- Badge + progress bar update ทันทีเมื่อได้ data ใหม่
- Optimistic: ไม่ re-render ถ้า data ไม่เปลี่ยน (compare by trip.updated_at)

### Data source requirements (backend — เพิ่มใน API spec §2)

```
GET /crm/{v}/trips?from=2026-06-23&to=2026-06-23&team_id=5
```

Response ต้องการ fields เพิ่ม per trip:
- `owner_user_id`, `owner_first_name`, `owner_last_name`, `owner_avatar_url`
- `visit_completed_count`, `visit_total_count`
- `total_distance_km`
- `expense_total`
- `visits[]` (nested visit objects with `project_name`, `org_contact_name`, `check_in_at`, `check_out_at`)

**OQ-28**: ทีม trip list endpoint — backend ยืนยัน shape ของ response ที่ nested visits + owner info

---

## 12. Coder Handoff Notes

### Files to create
- `ui/pages/appointment/my-day.vue` — main page (layout `action` for mobile)
  - Visit list with project + customer fields (§9)
  - Trip summary timeline with drilldown (§10)
- `ui/pages/appointment/team-summary.vue` — team manager view (§11)
  - KPI bar + member list + drilldown panel
  - Role-gated: `admin` + `manage` only

### Files to modify (minimal changes)
- `AppointmentCard.vue` — add optional `mode` prop (`"calendar" | "my-day"`); when `mode="my-day"`:
  - Show `project_name` (blue) + `org_contact_name` (bold) + `address_text` instead of just `title` + `location`
  - Show action buttons row (nav + check-in/out)
  - Show stop number
  - Show per-stop status badge
  - Show walk-in badge when `visit_type === 'walkin'`
  - Change bottom button text to Thai ("เข้าดูนัดหมาย" / "สร้างบันทึกเยี่ยม" instead of English)
- `home.vue` — add entry point link to `/appointment/my-day`

### Timeline drilldown components (inside my-day.vue or extracted)
- `TripTimeline.vue` (optional extract) — timeline with photo thumbnails per visit
- Drilldown panel — hero photo + photo strip + visit info + mini map + action buttons
- Reuse: `vue-easy-lightbox` (already installed), `GoogleMap` + `AdvancedMarker` (from export.vue)
- Data: `GET /visits/{id}` for detail, `GET /visits/{id}/photos` for images

### Files NOT to modify
- `appointment/index.vue` (calendar page)
- `appointment/visit/create-v2.vue` (visit creation — except return path in Phase 2)
- `appointment/[id]/edit-v2.vue`
- `appointment/visit/[id]/edit-v2.vue`
- `appointment/visit/[id]/index.vue`

### Mock data (per ADR-002, spec §9)
- Coder should use mock data matching `GET /trips/today` response shape from 01-API-SPEC.md
- Trip object with status `active`, 5 visits with mixed check-in states
- Toggle mock/real via environment flag or composable

### Dependencies on backend (Phase 0)
- `GET /trips/today` — trip for current user today
- `POST /visits/{id}/checkin` — per-stop check-in (OQ-16)
- `POST /visits/{id}/checkout` — per-stop check-out (OQ-16)
- Until endpoints exist: mock fallback (ADR-002)
