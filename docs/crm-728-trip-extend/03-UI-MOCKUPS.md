---
layout: default
title: "CRM-728: Trip Extend Options — UI Mockups"
---

# CRM-728: Trip Extend Options — UI Mockups

**Designer:** ทิพย์ (Claude Designer agent)
**Date:** 18 กรกฎาคม 2569
**Status:** READY FOR CODER HANDOFF
**Depends on:** `docs/crm-728-trip-extend/01-BA-SPEC.md`

---

## สรุปการออกแบบ

แทน `AlertDialog` เดิม 2 ตัว (Start + Stop trip) ด้วย `Dialog` ที่มี form fields เพิ่มเติม:
- **Start Trip Dialog**: vehicle selector + manual odometer input + ปุ่มถ่ายรูปหลักฐาน
- **Stop Trip Dialog**: vehicle read-only + start_odometer read-only + end odometer input + real-time km preview

Design decisions สำคัญ (PO น้อย อนุมัติ 18 ก.ค. 2569):
- vehicle_type: optional (ข้ามได้ กด confirm ได้เลย)
- หน่วย: กิโลเมตร (กม.)
- end < start: **block** ปุ่ม confirm + error message สีแดง
- Odometer: กรอก manual เท่านั้น (Phase I)
- Photo: ถ่ายรูปหลักฐานได้ upload แยก endpoint — ไม่มี auto-read OCR
- **OCR reserved for Phase II** — ไม่อยู่ใน scope นี้

---

## 1. Start Trip Dialog

### Component mapping

| ส่วน | shadcn-vue component | หมายเหตุ |
|---|---|---|
| Dialog wrapper | `Dialog` + `DialogContent` | แทน `AlertDialog` เดิม |
| Header | `DialogHeader` + `DialogTitle` + `DialogDescription` | |
| Vehicle cards | `Button` custom — grid 2×2 | card-style พร้อม icon; ไม่ใช้ Radio |
| "อื่นๆ" note | `Input` | expand ใต้ grid เมื่อเลือก "อื่นๆ" |
| Odometer input | `Input` type="number" inputmode="numeric" | suffix "กม." |
| Photo trigger | `Button` variant="outline" | เปิด camera / file picker |
| Photo thumbnail | `<img>` + overlay ปุ่ม X | แสดงเมื่อถ่าย/เลือกรูป |
| Footer | `DialogFooter` | ยกเลิก + ยืนยัน |

### Layout: 390px (mobile-first)

```
┌────────────────────────────────────────┐  ← Dialog max-w-sm rounded-2xl
│  เริ่มทริปวันนี้                         │  ← DialogTitle text-lg font-semibold
│  เลือกพาหนะและบันทึกไมล์ (ไม่บังคับ)    │  ← DialogDescription text-sm text-gray-500
├────────────────────────────────────────┤
│                                        │
│  พาหนะที่ใช้วันนี้                       │  ← label text-sm font-medium text-gray-700
│                                        │
│  ┌─────────────┐  ┌─────────────┐      │  ← grid grid-cols-2 gap-2
│  │  [Car]      │  │  [Building2]│      │
│  │ รถยนต์ส่วนตัว│  │  รถบริษัท   │      │
│  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  [Bike]     │  │[MoreHoriz.] │      │
│  │รถจักรยานยนต์│  │   อื่นๆ     │      │
│  └─────────────┘  └─────────────┘      │
│                                        │
│  [v-show: vehicle = 'other']           │  ← transition max-height 200ms
│  ระบุพาหนะ                             │
│  [________________________________]    │  ← Input placeholder="เช่น รถตู้ รถเช่า"
│                                        │
│  ────────────────────────────────      │  ← Separator
│                                        │
│  เลขไมล์มิเตอร์เริ่มต้น (ไม่บังคับ)     │  ← label
│  [___________________________] กม.     │  ← Input type=number + suffix
│  [error text ถ้ากรอก invalid]          │
│                                        │
│  [Camera] ถ่ายรูปหลักฐานไมล์           │  ← Button variant="outline" w-full h-11
│           (ไม่บังคับ)                   │     icon Camera + text
│                                        │
│  [v-if photo]                          │
│  ┌─────────────────┐                   │  ← thumbnail 80×80px rounded-lg relative
│  │   [รูปไมล์]     │  [X]             │     ปุ่ม X: absolute top-1 right-1
│  └─────────────────┘                   │
│                                        │
├────────────────────────────────────────┤
│  [      ยกเลิก      ] [  เริ่มทริป ▶ ]│  ← DialogFooter gap-2
└────────────────────────────────────────┘
```

### Layout: 1280px (desktop)

Dialog ขนาดเดิม max-w-sm — trip action เป็น mobile-first; desktop dialog ไม่ต้องใหญ่ขึ้น center กลางหน้าจอปกติ

### Vehicle Card Styles

**Unselected:**
```
border border-gray-200 bg-white text-gray-700
hover:bg-gray-50 hover:border-gray-300
```

**Selected:**
```
border-2 border-blue-600 bg-blue-50 text-blue-700
ring-1 ring-blue-600/30
```

**ทุก card:**
```
min-h-[72px] flex flex-col items-center justify-center
gap-1.5 rounded-xl p-2 transition-all cursor-pointer text-sm font-medium
```

### Vehicle Icon + Label mapping

| value | icon (lucide-vue-next) | label |
|---|---|---|
| `private_car` | `<Car class="w-5 h-5" />` | รถยนต์ส่วนตัว |
| `company_car` | `<Building2 class="w-5 h-5" />` | รถบริษัท |
| `motorcycle` | `<Bike class="w-5 h-5" />` | รถจักรยานยนต์ |
| `other` | `<MoreHorizontal class="w-5 h-5" />` | อื่นๆ |

หมายเหตุ: BA spec ระบุ `Building` แต่ codebase ใช้ `Building2` จาก lucide-vue-next — Coder ใช้ `Building2`

### "อื่นๆ" Expand Interaction

- เลือก "อื่นๆ": note input ขยายลงมาด้วย `v-show` + `transition: max-height 200ms ease`
- Input placeholder: "ระบุพาหนะ (เช่น รถตู้ รถเช่า)"
- maxlength: 100 ตัวอักษร
- เปลี่ยน vehicle ออกจาก "อื่นๆ": clear note + ซ่อน input

### Photo Trigger (ถ่ายรูปหลักฐาน)

```
กด [ถ่ายรูปหลักฐานไมล์]
  ├─ navigator.mediaDevices.getUserMedia → in-page camera overlay (pattern: create-v2.vue)
  │   └─ กดชัตเตอร์ → capturePhoto() → Blob → objectURL สำหรับ preview
  └─ fallback: <input type="file" accept="image/*" capture="environment" class="hidden" />

หลังได้รูป:
  → แสดง thumbnail ทันที
  → เก็บ blob สำหรับ upload แยก endpoint หลัง trip สร้างสำเร็จ
  → ไม่มี OCR — รูปเป็นแค่หลักฐาน
```

### Odometer Input

- `type="number"` `inputmode="numeric"` `min="0"` `step="1"`
- placeholder: "เช่น 12000"
- suffix "กม." absolute positioned ขวาใน input wrapper
- font-size ≥ 16px บน iOS (ป้องกัน auto-zoom)
- error state: `border-red-500 focus:ring-red-300` + text error "กรุณากรอกเลขที่ถูกต้อง" เมื่อค่าเป็น negative หรือ non-numeric

### States (Start Trip Dialog)

| State | UI |
|---|---|
| **Default** | vehicle cards unselected; odometer ว่าง |
| **Vehicle selected** | card highlight blue |
| **"อื่นๆ" selected** | card highlight + note input expand |
| **Camera overlay** | fullscreen z-[60] (pattern create-v2.vue) |
| **Photo added** | thumbnail 80px + ปุ่ม X |
| **Invalid odometer** | input border-red + error text + ปุ่มยืนยัน disabled |
| **Submitting** | ปุ่ม "เริ่มทริป" spinner "กำลังเริ่ม..." + form disabled |

### Confirm Button Rules (Start Trip)

- vehicle_type optional → ปุ่ม **enabled เสมอ** (ข้ามได้)
- "อื่นๆ" + ไม่กรอก note → ยังกด confirm ได้ (note optional ตาม PO)
- odometer กรอก negative/invalid → ปุ่ม **disabled** + inline error

---

## 2. Stop Trip Dialog

### Layout: 390px (mobile-first)

```
┌────────────────────────────────────────┐  ← Dialog max-w-sm
│  จบทริปวันนี้                           │  ← DialogTitle
│  บันทึกไมล์สิ้นสุด (ไม่บังคับ)          │  ← DialogDescription
├────────────────────────────────────────┤
│                                        │
│  ─── ข้อมูลทริป ──────────────────────  │  ← text-xs text-gray-500 uppercase tracking-wide
│                                        │
│  [v-if trip.vehicle_type]              │
│  [Car icon]  รถยนต์ส่วนตัว             │  ← flex items-center gap-2 text-sm text-gray-700
│  [v-else]                              │
│  — ไม่ได้บันทึกพาหนะ                   │  ← text-sm text-gray-400 italic
│                                        │
│  [v-if trip.vehicle_type_note]         │
│           (รถตู้บริษัท)                 │  ← text-xs text-gray-500 ml-7
│                                        │
│  [v-if trip.start_odometer]            │
│  ไมล์เริ่มต้น      12,000 กม.          │  ← label + value same row; text-sm
│                                        │
│  ─────────────────────────────────     │  ← Separator
│                                        │
│  เลขไมล์มิเตอร์สิ้นสุด (ไม่บังคับ)     │  ← label
│  [___________________________] กม.     │  ← Input type=number + suffix
│                                        │
│  [v-if endOdometer > startOdometer]    │
│  ┌──────────────────────────────────┐  │  ← preview card bg-blue-50 rounded-xl p-3
│  │  ระยะทางจากมิเตอร์               │  │     text-xs text-blue-600
│  │  150 กม.                         │  │     text-2xl font-bold text-blue-700
│  └──────────────────────────────────┘  │     transition-all duration-200
│                                        │
│  [v-if isEndOdometerError]             │
│  ┌──────────────────────────────────┐  │  ← error card bg-red-50 border border-red-200
│  │ [AlertCircle] เลขไมล์สิ้นสุด    │  │     rounded-xl p-3
│  │ ต้องมากกว่าเลขไมล์เริ่มต้น       │  │     text-sm text-red-700
│  │ (12,000 กม.)                     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [v-if !trip.start_odometer && endOdometer]
│  ┌──────────────────────────────────┐  │  ← info card bg-amber-50 rounded-xl p-3
│  │ ไม่มีไมล์เริ่มต้น —              │  │     text-xs text-amber-700
│  │ ระบบจะบันทึกไมล์สิ้นสุดเท่านั้น  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [Camera] ถ่ายรูปหลักฐานไมล์           │  ← Button variant="outline" w-full h-11
│                                        │
│  [v-if endPhoto]                       │
│  ┌─────────────────┐                   │
│  │   [รูปไมล์]     │  [X]             │
│  └─────────────────┘                   │
│                                        │
├────────────────────────────────────────┤
│  [      ยกเลิก      ] [ยืนยันจบทริป ■]│  ← DialogFooter
└────────────────────────────────────────┘
```

### Real-time km Preview Logic

```typescript
// Computed สำหรับ coder
const odometerPreview = computed<number | null>(() => {
  if (!endTripOdometer.value || !trip.value?.start_odometer) return null
  const diff = endTripOdometer.value - trip.value.start_odometer
  if (diff <= 0) return null
  return diff
})

const isEndOdometerError = computed<boolean>(() => {
  if (!endTripOdometer.value || !trip.value?.start_odometer) return false
  return endTripOdometer.value < trip.value.start_odometer
})
```

### States (Stop Trip Dialog)

| State | UI |
|---|---|
| **Default** | vehicle read-only + start_odometer read-only (ถ้ามี) + end input ว่าง |
| **No vehicle at start** | "— ไม่ได้บันทึกพาหนะ" italic gray |
| **No start_odometer** | ซ่อน start row; amber info card ปรากฏถ้ากรอก end |
| **Typing end (valid)** | preview card สีน้ำเงิน "X กม." fade-in |
| **end < start** | error card แดง + ปุ่ม "ยืนยัน" disabled |
| **end = start** | ไม่แสดง preview (diff = 0 ไม่สมเหตุสมผล) |
| **Camera overlay** | fullscreen z-[60] |
| **Photo added** | thumbnail + ปุ่ม X |
| **Submitting** | ปุ่ม loading + form disabled |

### Confirm Button Rules (Stop Trip)

ปุ่ม "ยืนยันจบทริป" **enabled เสมอ ยกเว้น:**
- กำลัง submitting
- `isEndOdometerError === true` (end < start) → **disabled + error card**

---

## 3. Trip Summary Row (Completed Trip Strip)

### ก่อน (ปัจจุบัน) — my-day.vue ~line 121

```
[✓] จบทริปแล้ว   2/2 จุด · 28.5 กม. · 9 ชั่วโมง 18 นาที   [ดูสรุป]
```

### หลัง (Phase I)

```
[✓] จบทริปแล้ว
    2/2 จุด · GPS: 28.5 กม. · 9 ชั่วโมง 18 นาที
    [Car] รถยนต์ส่วนตัว · มิเตอร์: 150 กม.          ← v-if odometer_distance_km
```

Layout:
- **390px**: stack 2 text rows ใน `flex-col gap-0.5`
- **1280px**: เรียงแถวเดียวคั่นด้วย `·`

### Conditional render

```
v-if="trip.odometer_distance_km" → แสดง vehicle row
v-if="trip.vehicle_type && !trip.odometer_distance_km" → แสดง vehicle เฉยๆ ไม่มีเลขมิเตอร์
v-if="!trip.vehicle_type" → ไม่แสดง vehicle row เลย (backward compat)
```

Helper functions (Coder เพิ่มใน my-day.vue หรือ useTrip.ts):

```typescript
const VEHICLE_LABELS: Record<string, string> = {
  private_car: 'รถยนต์ส่วนตัว',
  company_car: 'รถบริษัท',
  motorcycle: 'รถจักรยานยนต์',
  other: 'อื่นๆ',
}

function vehicleLabel(type: string | null): string {
  return type ? (VEHICLE_LABELS[type] ?? type) : '—'
}
```

---

## 4. Team Summary Column (Vehicle + Odometer per Employee)

### Desktop Table — เพิ่ม 2 columns

| พนักงาน | จุดที่เยี่ยม | GPS (กม.) | พาหนะ | มิเตอร์ (กม.) |
|---|---|---|---|---|
| สมชาย ใจดี | 4/5 | 28.5 | [Car] รถส่วนตัว | 150 |
| วิชัย ดีใจ | 3/3 | 15.2 | [Bike] มอเตอร์ไซค์ | 98 |
| **รวม** | **7/8** | **43.7** | — | **248** |

- column "พาหนะ": icon + label `text-sm`; ถ้าไม่มี vehicle_type → "—" `text-gray-400`
- column "มิเตอร์ (กม.)": `text-right`; ถ้าไม่มี → "—" `text-gray-400`
- แถวสุดท้าย "รวม": `font-semibold bg-gray-50` — sum GPS แยก + sum odometer แยก

### Mobile Card — เพิ่ม vehicle line

```
┌────────────────────────────────────────┐
│  [Avatar] สมชาย ใจดี                   │
│           4/5 จุด · GPS 28.5 กม.      │
│           [Car] ส่วนตัว · มิเตอร์ 150 กม.│  ← v-if vehicle_type; text-xs text-gray-600
│           9 ชั่วโมง 18 นาที            │
└────────────────────────────────────────┘
```

---

## 5. Component Structure สรุป (สำหรับ Coder)

### ไฟล์ที่ต้องแก้

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `ui/pages/appointment/my-day.vue` | แทน 2 AlertDialog (line 334–368) ด้วย 2 Dialog; เพิ่ม vehicle+odometer ใน completed strip (line ~117–126) |
| `ui/composables/useTrip.ts` | เพิ่ม `VehicleType` type + 7 fields ใน `Trip` interface; อัปเดต `startTrip`/`endTrip` signature |
| `ui/pages/appointment/team-summary.vue` | เพิ่ม vehicle + odometer columns (Coder ยืนยัน route ก่อน) |

### Reactive state ใหม่ใน my-day.vue

```typescript
// ── Start Trip form state ──
const startTripVehicleType = ref<VehicleType | null>(null)
const startTripVehicleNote = ref<string>('')
const startTripOdometer = ref<number | null>(null)
const startTripPhotoBlob = ref<Blob | null>(null)       // upload หลัง trip create
const startTripPhotoUrl = ref<string | null>(null)      // objectURL สำหรับ preview

// ── End Trip form state ──
const endTripOdometer = ref<number | null>(null)
const endTripPhotoBlob = ref<Blob | null>(null)
const endTripPhotoUrl = ref<string | null>(null)

// ── Computed ──
const odometerPreview = computed<number | null>(() => {
  if (!endTripOdometer.value || !trip.value?.start_odometer) return null
  const diff = endTripOdometer.value - trip.value.start_odometer
  return diff > 0 ? diff : null
})

const isEndOdometerError = computed<boolean>(() => {
  if (!endTripOdometer.value || !trip.value?.start_odometer) return false
  return endTripOdometer.value < trip.value.start_odometer
})

// ── Odometer validation ──
const isStartOdometerValid = computed<boolean>(() => {
  if (startTripOdometer.value === null) return true  // optional
  return startTripOdometer.value >= 0
})
```

### Import เพิ่มใน my-day.vue

```typescript
// แทน AlertDialog imports:
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

// Icons เพิ่ม:
import {
  Car, Building2, Bike, MoreHorizontal,
  Camera, AlertCircle, X,
} from 'lucide-vue-next'
```

### useTrip.ts — เพิ่ม types + interface

```typescript
export type VehicleType = 'private_car' | 'company_car' | 'motorcycle' | 'other'

// เพิ่มใน Trip interface:
vehicle_type: VehicleType | null
vehicle_type_note: string | null
start_odometer: number | null
end_odometer: number | null
odometer_distance_km: number | null
start_odometer_photo_url: string | null
end_odometer_photo_url: string | null

// startTrip signature ใหม่:
async function startTrip(
  lat: number, lng: number, accuracy: number,
  extra?: {
    vehicle_type?: VehicleType | null
    vehicle_type_note?: string | null
    start_odometer?: number | null
  }
): Promise<Trip | null>

// endTrip signature ใหม่:
async function endTrip(
  tripId: number, lat: number, lng: number, accuracy: number,
  distanceKm?: number,
  extra?: {
    end_odometer?: number | null
  }
): Promise<Trip | null>
```

### Photo Upload Flow (แยก endpoint — PO confirmed)

```
Start Trip:
  1. POST /crm/{v}/trips { vehicle_type, vehicle_type_note, start_odometer, ... }
     → ได้ trip.id
  2. IF startTripPhotoBlob:
       POST /crm/{v}/trips/{id}/odometer-photo
       FormData: { photo: blob, type: 'start' }
  3. upload fail → toast warning (ไม่ block — trip สร้างสำเร็จแล้ว)

End Trip:
  1. PUT /crm/{v}/trips/{id}/end { end_odometer, ... }
  2. IF endTripPhotoBlob:
       POST /crm/{v}/trips/{id}/odometer-photo
       FormData: { photo: blob, type: 'end' }
  3. upload fail → toast warning
```

### Reset form state

Dialog close (ยกเลิก หรือ confirm สำเร็จ) → reset ทุก ref:
```typescript
function resetStartTripForm() {
  startTripVehicleType.value = null
  startTripVehicleNote.value = ''
  startTripOdometer.value = null
  if (startTripPhotoUrl.value) URL.revokeObjectURL(startTripPhotoUrl.value)
  startTripPhotoBlob.value = null
  startTripPhotoUrl.value = null
}
// เช่นเดียวกันสำหรับ resetEndTripForm()
```

---

## 6. Touch Target & Accessibility

- Vehicle cards: min-height 72px (touch target ≥ 44px)
- ปุ่ม "ถ่ายรูป": h-11 (44px) w-full
- Odometer input: h-11 font-size ≥ 16px (ป้องกัน iOS auto-zoom)
- ปุ่ม X บน thumbnail: 32×32px min (secondary action)
- Error text: red-700 on red-50 — contrast ratio ≥ 4.5:1 (WCAG AA)
- DialogContent: `role="dialog"` `aria-labelledby` — shadcn-vue จัดการให้อัตโนมัติ
- Camera overlay: `<video aria-label="viewfinder" />` สำหรับ screen reader

---

## 7. Empty / Loading / Error States สรุป

| State | หน้าจอ | จัดการ |
|---|---|---|
| Dialog เปิด + กำลัง submitting | ปุ่มยืนยัน spinner; form fields disabled | disabled prop ทุก input/button |
| ไม่กรอก odometer | submit ปกติ (null field) | ไม่ block |
| trip ไม่มี vehicle_type (old trip) | Stop dialog: "— ไม่ได้บันทึกพาหนะ" | v-if fallback text |
| trip ไม่มี start_odometer | Stop dialog: ซ่อน start row + amber card ถ้ากรอก end | v-if + computed |
| trip completed ไม่มี odometer_distance_km | summary strip: ซ่อน vehicle+odometer row | v-if |
| Photo upload ล้มเหลว | toast warning "ไม่สามารถบันทึกรูปหลักฐานได้" ไม่ block trip | try/catch แยก |
| GPS unavailable | toast error (จัดการใน handler เดิม — ไม่เปลี่ยนแปลง) | ไม่เปลี่ยน |

---

## 8. Open UI Questions (สำหรับ Coder + Backend)

| # | คำถาม | ผลกระทบ | แนะนำ |
|---|---|---|---|
| **UIQ-1** | Photo upload endpoint path คืออะไร? `POST /trips/{id}/odometer-photo` หรือชื่ออื่น? | Coder ต้องรู้ก่อน implement upload | Backend ยืนยัน path |
| **UIQ-2** | Photo upload body format: FormData หรือ JSON base64? | ถ้า base64: max 5MB ตาม BR-728-6; ถ้า FormData: multipart | แนะนำ FormData (pattern เดียวกับ visit photos) |
| **UIQ-3** | Team-summary route ปัจจุบัน? (`/appointment/team-summary`?) | ต้องรู้ก่อนแก้ไข columns | Coder ตรวจสอบ route จริง |
| **UIQ-4** | vehicle_type_note ใน Stop dialog — แสดงใต้ vehicle label หรือไม่? | "อื่นๆ (รถตู้)" vs "อื่นๆ" เฉยๆ | แนะนำ: แสดง note ด้วย |

---

## 9. OCR — Phase II

OCR (auto-read เลขไมล์จากรูปถ่าย) **ไม่อยู่ใน scope Phase I นี้**

Phase I = ถ่ายรูปเก็บหลักฐานเท่านั้น; ผู้ใช้กรอกเลขไมล์เอง

Phase II (future) จะเพิ่ม:
- Backend endpoint `/crm/{v}/trips/ocr-odometer` รับ image → คืน `{ number, confidence }`
- UI: spinner overlay thumbnail + prefill input + badge "OCR" / "อ่านไม่ได้"
- Confidence threshold ต้องกำหนด (แนะนำ 70%)

---

## 10. ไฟล์อ้างอิง (Coder)

- Spec: `docs/crm-728-trip-extend/01-BA-SPEC.md`
- Dialog component: `ui/components/ui/dialog/`
- Separator component: `ui/components/ui/separator/`
- Camera pattern: `ui/pages/appointment/visit/create-v2.vue` (lines ~1147–1224)
- Trip composable: `ui/composables/useTrip.ts`
- Start/Stop handlers: `ui/pages/appointment/my-day.vue` (lines 640–688)
- Existing AlertDialogs (แทนด้วย Dialog): `ui/pages/appointment/my-day.vue` (lines 334–368)
- Completed trip strip (เพิ่ม vehicle row): `ui/pages/appointment/my-day.vue` (lines 117–126)
