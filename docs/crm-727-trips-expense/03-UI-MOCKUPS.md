---
layout: default
title: "CRM-727: Trips Expense — UI Mockup Spec"
---

# CRM-727: Trips Expense — UI Mockup Spec

**Feature:** `crm-727-trips-expense`
**Designer:** Claude Designer agent
**Date:** 18 กรกฎาคม 2569
**Primary viewport:** 390px (mobile-first — OSR ใช้มือถือทั้งหมด)
**Secondary:** 1280px (desktop manager/admin)
**Status:** READY FOR CODER HANDOFF

---

## 0. PO Decisions สรุป (ยืนยัน 18 ก.ค. 2569)

| ประเด็น | ตัดสิน | ผลกระทบ UI |
|---|---|---|
| เพิ่ม expense เมื่อไหร่ | ได้ตลอด ไม่สนสถานะ trip | ปุ่ม "+ ค่าใช้จ่าย" แสดงทั้งใน active และ completed |
| หมวด expense | 7 หมวด ครบ + "อื่นๆ" มี text note | chip grid 7 ตัว |
| ลบ expense | ลบได้ตลอด | trash icon แสดงทุก state (ไม่ซ่อนเมื่อ completed) |
| แนบรูป | 1 รูปต่อ expense + annotation pattern | single image picker คล้าย visit photo |
| Approval | ไม่มี phase นี้ | ไม่แสดง status badge ของ expense |
| Team-summary | expense section + expand รายละเอียด | เพิ่ม KPI tile + section ใน member detail |
| Ceiling | ไม่มี | warning toast เท่านั้น ที่ amount > 99,999 |
| เวลา | เลือกเองได้ | datetime picker (`<input type="datetime-local">`) |

---

## 1. ส่วนที่เปลี่ยนแปลงในหน้า my-day.vue

### 1A. ACTIVE TRIP CARD — เพิ่ม Expense Section (collapsible)

วางต่อจาก progress bar ภายใน `.rounded-xl.border.border-green-200.bg-green-50`

**Mobile 390px:**

```
┌──────────────────────────────────────────────────┐
│ 🟢 กำลังออกเยี่ยม · เริ่ม 08:12      [จบทริป] │
│──────────────────────────────────────────────────│
│ 2/5 จุด  ████░░░░░░ 40%                         │
│══════════════════════════════════════════════════│
│ [EXPENSE SECTION — collapsible]                  │
│──────────────────────────────────────────────────│
│  💰 ค่าใช้จ่าย (2 รายการ · ฿750)          [∨]  │  ← CollapsibleTrigger
│                                                  │
│  [เมื่อ open=true]                               │
│  ──────────────────────────────────────────────  │
│  ⛽  น้ำมัน              ฿450   [🖼]  [🗑]       │
│  🛣  ทางด่วน             ฿300         [🗑]       │
│  ──────────────────────────────────────────────  │
│              รวม: ฿750                           │
│       [+ เพิ่มค่าใช้จ่าย]                       │
└──────────────────────────────────────────────────┘
```

**Component mapping:**

```
Collapsible (shadcn-vue)
├── CollapsibleTrigger
│   └── div.flex.items-center.justify-between.px-3.py-2
│       ├── span: Wallet icon (Lucide) + "ค่าใช้จ่าย (N รายการ · ฿X,XXX)"
│       └── ChevronDown icon (rotate-180 when open)
└── CollapsibleContent
    └── div.border-t.border-green-100.bg-white.rounded-b-xl
        ├── [expense list rows]
        ├── Separator
        ├── total row: text-right "รวม: ฿X,XXX" (text-sm font-medium)
        └── Button "+ เพิ่มค่าใช้จ่าย" (variant="outline", w-full, h-9)
```

**Expense list row (per item):**

```
div.flex.items-center.gap-2.px-3.py-2.hover:bg-gray-50 (touchable → open edit drawer)
├── [type icon]  w-4 h-4 text-gray-500
├── span.flex-1.text-sm  "น้ำมัน"
├── span.text-sm.font-medium  "฿450"
├── [thumbnail — only if receipt_image_url]
│   img.w-7.h-7.rounded.object-cover.cursor-pointer (click → preview dialog)
└── Button variant="ghost" size="icon" class="w-7 h-7 text-red-400"
    └── Trash2 icon
```

**State: empty (0 รายการ):**

```
div.px-3.py-3.text-center
├── WalletCards icon  w-6 h-6 text-gray-300 mx-auto mb-1
├── p.text-xs.text-gray-400  "ยังไม่มีค่าใช้จ่าย"
└── Button "+ เพิ่มค่าใช้จ่าย" variant="outline" size="sm" class="mt-2"
```

**Default state:** collapsed (open=false) — เปิดเองเมื่อ expense_count > 0

**Tailwind classes:**

- Wrapper: `border-t border-green-100`
- Trigger: `flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-green-100/50`
- Header label: `text-xs font-medium text-green-800`
- Amount: `text-xs text-green-700 font-semibold`
- Content wrapper: `bg-white border-t border-green-100`

---

### 1B. COMPLETED TRIP CARD — Expense Section (readonly)

**Mobile 390px:**

```
┌──────────────────────────────────────────────────┐
│ ✓ จบทริปแล้ว                                    │
│   4/5 จุด · 42.7 กม. · 9 ชม. 18 นาที           │
│──────────────────────────────────────────────────│
│ [EXPENSE SECTION — collapsible, readonly]        │
│  💰 ค่าใช้จ่าย (3 รายการ · ฿1,200)        [∨]  │
│                                                  │
│  [เมื่อ open]                                    │
│  ⛽  น้ำมัน              ฿450   [🖼]  [🗑]       │
│  🍱  อาหาร               ฿450         [🗑]       │
│  ☕  รับรองลูกค้า         ฿300         [🗑]       │
│  ──────────────────────────────────────────────  │
│              รวม: ฿1,200                         │
│       [+ เพิ่มค่าใช้จ่าย]                       │
└──────────────────────────────────────────────────┘
```

หมายเหตุ: ตาม PO decision — "ลบได้ตลอด" และ "เพิ่มได้ตลอด" ดังนั้น completed card ยังแสดงปุ่มเพิ่ม/ลบ

**Component:** เหมือน ACTIVE ทุกอย่าง แต่เปลี่ยน background wrapper เป็น `bg-blue-50 border-blue-200` ตาม completed card theme

---

### 1C. BOTTOM STICKY BAR — เพิ่ม expense_total

**ก่อน (ปัจจุบัน):**
```
3/5 จุด · 28.5 กม.              [ดูสรุป >]
```

**หลัง (ใหม่):**
```
3/5 จุด · 28.5 กม. · ฿750      [ดูสรุป >]
```

**Component changes ใน my-day.vue:**

```html
<div class="text-sm text-gray-600">
  <span class="font-medium text-gray-900">{{ completedVisitCount }}/{{ visits.length }}</span> จุด
  · <span class="font-medium text-gray-900">{{ trip?.summary?.distance_km || 0 }}</span> กม.
  <!-- NEW: expense_total -->
  <template v-if="(trip?.summary?.expense_total || 0) > 0">
    · <Wallet class="w-3.5 h-3.5 inline text-amber-500 -mt-0.5" />
    <span class="font-medium text-amber-600">฿{{ formatAmount(trip?.summary?.expense_total) }}</span>
  </template>
</div>
```

**Tailwind:** `text-amber-600 font-medium` สำหรับ expense amount ใน bottom bar (amber แทน gray เพื่อ visual contrast)

---

### 1D. END TRIP DIALOG — เพิ่ม Expense Summary Section

**Mobile 390px:**

```
┌──────────────────────────────────────────────────┐
│  จบทริปวันนี้?                                  │
│                                                  │
│  ระบบจะบันทึกตำแหน่ง GPS และเวลาจบทริป          │
│  คุณจะไม่สามารถเช็คอิน/เช็คเอาท์ได้อีก         │
│                                                  │
│  ─────────────────────────────────────────────   │
│  💰 ค่าใช้จ่ายวันนี้                            │
│     2 รายการ · ฿750                             │
│                                                  │
│  [state: 0 รายการ]                              │
│  💰 ค่าใช้จ่าย — ยังไม่มีรายการ                │
│  ─────────────────────────────────────────────   │
│                                                  │
│            [ยกเลิก]    [ยืนยันจบทริป]          │
└──────────────────────────────────────────────────┘
```

**Component changes ใน AlertDialog:**

เพิ่ม section ระหว่าง `AlertDialogDescription` กับ `AlertDialogFooter`:

```html
<div class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
  <div class="flex items-center gap-2">
    <Wallet class="w-4 h-4 text-amber-600 flex-shrink-0" />
    <div class="flex-1 min-w-0">
      <template v-if="(trip?.summary?.expense_count || 0) > 0">
        <p class="text-sm font-medium text-amber-800">ค่าใช้จ่ายวันนี้</p>
        <p class="text-xs text-amber-600 mt-0.5">
          {{ trip?.summary?.expense_count }} รายการ · ฿{{ formatAmount(trip?.summary?.expense_total) }}
        </p>
      </template>
      <template v-else>
        <p class="text-sm text-amber-600">ค่าใช้จ่าย — ยังไม่มีรายการ</p>
      </template>
    </div>
  </div>
</div>
```

**States:**
- expense_count = 0 → amber-50 bg, text "ยังไม่มีรายการ" (ไม่ block การจบทริป)
- expense_count > 0 → แสดง count + total amount
- ไม่มีลิงก์ "ดูรายละเอียด" (ใน dialog ที่ต้องการ focus action — ไม่ต้องการให้ user ออกไปดูรายละเอียด)

---

## 2. Expense Form Drawer (Bottom Sheet)

**ชื่อ Component:** `ExpenseFormDrawer.vue`
**ตำแหน่ง:** `ui/components/expense/ExpenseFormDrawer.vue`
**Trigger:** ปุ่ม "+ เพิ่มค่าใช้จ่าย" ใน Expense Section

### 2A. Mobile 390px — Bottom Sheet Layout

```
┌──────────────────────────────────────────────────┐
│ [overlay backdrop]                               │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │  [drag handle — 4px bar centered]            │ │
│ │  ────────────────────────────────────────    │ │
│ │  เพิ่มค่าใช้จ่าย              [X close]     │ │
│ │                                              │ │
│ │  หมวดค่าใช้จ่าย *                           │ │
│ │  ┌────────────────────────────────────────┐ │ │
│ │  │ [⛽] [🛣] [🅿] [🍱] [☕] [🚌] [📋] │ │ │  ← chip grid
│ │  └────────────────────────────────────────┘ │ │
│ │  "กรุณาเลือกหมวดค่าใช้จ่าย" (error text)   │ │
│ │                                              │ │
│ │  จำนวนเงิน (บาท) *                          │ │
│ │  ┌────────────────────────────────────────┐ │ │
│ │  │ ฿  [    0.00                   ]       │ │ │
│ │  └────────────────────────────────────────┘ │ │
│ │  "กรุณากรอกจำนวนเงินที่มากกว่า 0"          │ │
│ │                                              │ │
│ │  วันและเวลา *                               │ │
│ │  ┌────────────────────────────────────────┐ │ │
│ │  │ 18/07/2569 10:30                       │ │ │
│ │  └────────────────────────────────────────┘ │ │
│ │                                              │ │
│ │  หมายเหตุ [required ถ้า "อื่นๆ"]           │ │
│ │  ┌────────────────────────────────────────┐ │ │
│ │  │ (placeholder: ระบุรายละเอียด...)       │ │ │
│ │  └────────────────────────────────────────┘ │ │
│ │                                              │ │
│ │  ใบเสร็จ (ไม่บังคับ)                       │ │
│ │  ┌──────────────────────────────────────┐   │ │
│ │  │                                      │   │ │
│ │  │   [📷 ถ่ายรูป]  [🖼 เลือกจาก Gallery]│   │ │
│ │  │                                      │   │ │
│ │  └──────────────────────────────────────┘   │ │
│ │  [thumbnail preview เมื่อเลือกแล้ว]         │ │
│ │                                              │ │
│ │  ┌─[ยกเลิก]──────────[บันทึก disabled]──┐  │ │
│ │  └────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 2B. Component Mapping

```
Drawer (shadcn-vue — vaul-vue underneath)
├── DrawerTrigger (external — ปุ่ม "+ เพิ่มค่าใช้จ่าย")
└── DrawerContent
    ├── DrawerHeader
    │   ├── DrawerTitle "เพิ่มค่าใช้จ่าย" / "แก้ไขค่าใช้จ่าย"
    │   └── Button variant="ghost" size="icon" @click="close"
    │       └── X icon
    └── form (vee-validate)
        ├── [1] EXPENSE TYPE CHIP GRID
        ├── [2] AMOUNT INPUT
        ├── [3] DATETIME INPUT
        ├── [4] NOTE TEXTAREA
        ├── [5] RECEIPT IMAGE PICKER
        └── DrawerFooter
            ├── Button variant="outline" @click="close" "ยกเลิก"
            └── Button :disabled="!isValid || saving" "บันทึก"
```

### 2C. Expense Type Chip Grid — รายละเอียด

chip grid 2 แถว × 4 คอลัมน์ (รวม 7 chips + 1 empty)

```
┌──────────┬──────────┬──────────┬──────────┐
│  ⛽       │  Route   │  P       │ 🍱       │
│  น้ำมัน   │ ทางด่วน  │ จอดรถ   │ อาหาร   │
├──────────┼──────────┼──────────┼──────────┤
│  Coffee  │  Bus     │  ...     │          │
│ รับรองฯ  │ ค่าเดินฯ │ อื่นๆ   │          │
└──────────┴──────────┴──────────┴──────────┘
```

**Chip style (unselected):**
```
div.flex-col.items-center.justify-center.gap-1
  .rounded-xl.border.border-gray-200.bg-white
  .p-2.5.cursor-pointer
  .text-xs.text-gray-600
  min-h-[64px]
  hover:bg-gray-50
```

**Chip style (selected):**
```
.rounded-xl.border-2.border-blue-500.bg-blue-50
.text-blue-700.font-medium
```

**Icon size:** `w-5 h-5` — lucide-vue-next icons: `Fuel`, `Route`, `ParkingSquare`, `UtensilsCrossed`, `Coffee`, `Bus`, `MoreHorizontal`

**Interaction:** single-select, click to toggle — ถ้ากด chip เดิมซ้ำ = deselect

### 2D. Amount Input

```html
<!-- InputGroup pattern จาก ui/components/ui/input-group/ -->
<InputGroup>
  <InputGroupText>฿</InputGroupText>
  <InputGroupInput
    type="number"
    inputmode="decimal"
    min="0"
    step="1"
    placeholder="0"
    class="text-right text-lg font-medium"
  />
</InputGroup>
```

Warning alert (amount > 99,999) — แสดงใต้ input, ไม่ block:
```html
<Alert variant="warning" v-if="amount > 99999">
  <AlertCircle class="w-4 h-4" />
  <AlertDescription>ค่าใช้จ่ายสูงกว่าปกติ — กรุณายืนยัน</AlertDescription>
</Alert>
```

### 2E. DateTime Input

```html
<input
  type="datetime-local"
  v-model="spentAtLocal"
  class="w-full h-10 rounded-md border border-input px-3 py-2 text-sm
         bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
/>
```

**Default value:** `new Date()` แปลงเป็น `datetime-local` string (YYYY-MM-DDTHH:mm)
**Display:** แสดงใน format ไทย แต่ input native ยังเป็น Gregorian (datetime-local limitation)

**Note for coder:** helper function `toDatetimeLocalString(date: Date): string` และ `fromDatetimeLocalString(str: string): string` (ISO8601 +07:00)

### 2F. Receipt Image Picker

**State 1 — ไม่มีรูป:**

```
div.rounded-xl.border-2.border-dashed.border-gray-200.bg-gray-50
  .flex.gap-3.p-4.justify-center
├── button.flex-col.items-center.gap-1.text-xs.text-gray-500
│   .hover:text-blue-600.p-3.rounded-lg.hover:bg-blue-50
│   ├── Camera icon w-6 h-6
│   └── "ถ่ายรูป"
└── button.flex-col.items-center.gap-1.text-xs.text-gray-500
    .hover:text-blue-600.p-3.rounded-lg.hover:bg-blue-50
    ├── ImageIcon icon w-6 h-6
    └── "Gallery"

<!-- hidden inputs -->
<input ref="cameraInputRef" type="file" accept="image/*" capture="environment" class="hidden" />
<input ref="fileInputRef" type="file" accept="image/*" class="hidden" />
```

**State 2 — มีรูปแล้ว (thumbnail):**

```
div.relative.w-full.rounded-xl.overflow-hidden.border.border-gray-200
├── img.w-full.object-cover.max-h-48.rounded-xl  (receipt thumbnail)
├── button.absolute.top-2.right-2.bg-black/50.rounded-full.p-1
│   └── X icon w-4 h-4 text-white  (click = ลบรูป)
└── button.absolute.bottom-2.right-2.bg-white/90.rounded-full.p-1.5.shadow
    └── Pencil icon w-3.5 h-3.5 text-gray-600  (click = เปิด AnnotationEditor)
```

**Pattern เหมือน edit-v2.vue:**
- compress ภาพก่อน upload (reuse `processUpload` logic)
- max 5 MB (ต่างจาก CustomerDocuments.vue ที่ 20 MB)
- เปิด `VisitPhotoAnnotationEditor` component ถ้า user ต้องการ annotate
- เก็บเป็น `receipt_image_base64` ในฟอร์ม (data URI)

### 2G. Footer Buttons

```
DrawerFooter class="flex gap-2 pt-2"
├── Button variant="outline" class="flex-1" @click="closeDrawer"
│   "ยกเลิก"
└── Button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
    :disabled="!canSubmit || saving"
    @click="handleSubmit"
    ├── [loading] div.animate-spin + "กำลังบันทึก..."
    └── [normal] CheckCircle icon + "บันทึก"
```

`canSubmit = expense_type !== null && amount > 0 && (expense_type !== 'other' || note.trim() !== '')`

### 2H. Validation Errors Display

```
<!-- ใต้ chip grid -->
<p v-if="errors.expense_type" class="text-xs text-red-500 mt-1">
  กรุณาเลือกหมวดค่าใช้จ่าย
</p>

<!-- ใต้ amount input -->
<p v-if="errors.amount" class="text-xs text-red-500 mt-1">
  กรุณากรอกจำนวนเงินที่มากกว่า 0
</p>

<!-- ใต้ note textarea (visible เมื่อ expense_type = 'other') -->
<p v-if="errors.note && expenseType === 'other'" class="text-xs text-red-500 mt-1">
  กรุณาระบุรายละเอียด
</p>
```

### 2I. Edit Mode

เมื่อ user กดที่ row ใน expense list (ไม่ใช่ trash):
- เปิด Drawer เดิม พร้อม pre-fill ทุก field
- DrawerTitle เปลี่ยนเป็น "แก้ไขค่าใช้จ่าย"
- Button "บันทึก" → PUT /trips/{tripId}/expenses/{expenseId}
- เพิ่ม prop `editExpense: TripExpense | null` — ถ้าไม่ null = edit mode

### 2J. Delete Confirm Dialog

```
AlertDialog (ไม่ใช่ Drawer)
├── AlertDialogHeader
│   ├── AlertDialogTitle "ลบค่าใช้จ่าย?"
│   └── AlertDialogDescription
│       "น้ำมัน ฿450 จะถูกลบออกจากทริปนี้"
└── AlertDialogFooter
    ├── AlertDialogCancel "ยกเลิก"
    └── AlertDialogAction class="bg-red-600 hover:bg-red-700" "ลบ"
```

---

## 3. Receipt Image Preview Dialog

**Pattern เดียวกับ CustomerDocuments.vue:**

```
Dialog v-model:open="showReceiptPreview"
└── DialogContent class="sm:max-w-2xl max-h-[90vh]"
    ├── DialogHeader
    │   ├── DialogTitle "ใบเสร็จ — {{ expense.label }}"
    │   └── DialogDescription "฿{{ expense.amount }} · {{ formatThaiDateTime(expense.spent_at) }}"
    └── div.flex.items-center.justify-center.min-h-48.bg-muted/30.rounded-lg.p-2
        └── img.max-w-full.max-h-[70vh].object-contain.rounded
```

**Trigger:** กด thumbnail รูปใน expense list row

---

## 4. Expense Section ใน team-summary.vue

### 4A. KPI Bar — เพิ่ม tile ค่าใช้จ่ายรวม

ปัจจุบัน grid-cols-4: ลูกทีม / ออกเยี่ยม / จุดเยี่ยม / สำเร็จ

เพิ่ม tile ที่ 5 (ใน row ใหม่ หรือปรับ grid เป็น 5 cols บน lg):

**Mobile — row ที่ 2 แยก:**

```
┌─────────────────────────────────────────────────┐
│   4       │   2       │   7/10    │   70%        │
│ ลูกทีม   │ ออกเยี่ยม │ จุดเยี่ยม │ สำเร็จ      │
├─────────────────────────────────────────────────┤
│  ฿3,250 รวมค่าใช้จ่ายทีม (5 รายการ)            │
└─────────────────────────────────────────────────┘
```

**Component:**

```html
<!-- ต่อจาก KPI grid-cols-4 เดิม -->
<div class="bg-white dark:bg-zinc-900 rounded-lg p-3 flex items-center gap-2">
  <Wallet class="w-4 h-4 text-amber-500 flex-shrink-0" />
  <div>
    <p class="text-lg font-semibold text-amber-600">
      ฿{{ formatAmount(teamExpenseTotal) }}
    </p>
    <p class="text-xs text-gray-500 mt-0.5">
      ค่าใช้จ่ายรวม ({{ teamExpenseCount }} รายการ)
    </p>
  </div>
</div>
```

`teamExpenseTotal = sum(member.expense_total for member in sortedMembers)`
`teamExpenseCount = sum(member.expense_count for member in sortedMembers)`

### 4B. Member Card — แสดง expense summary ใน row

เพิ่มต่อจาก progress bar ใน member row (ไม่ต้อง expand):

```
div.flex.items-center.gap-1.mt-1 (visible เมื่อ member.expense_count > 0)
├── Wallet icon w-3.5 h-3.5 text-amber-400
└── span.text-xs.text-amber-600
    "฿{{ formatAmount(member.expense_total) }} ({{ member.expense_count }} รายการ)"
```

### 4C. Member Detail Panel — Expense Section (expanded)

เมื่อ user expand member card (click แล้ว `expandedMember === member.user_id`):

```
┌──────────────────────────────────────────────────────────┐
│ [ส่วน visit timeline เดิม]                              │
│                                                          │
│ ═══════════════════════════════════════════════════════   │
│  💰 ค่าใช้จ่าย (2 รายการ · ฿750)              [∨/∧]   │
│ ───────────────────────────────────────────────────────  │
│  ⛽  น้ำมัน         10:15 น.         ฿450              │
│  🛣  ทางด่วน        11:30 น.         ฿300              │
│ ───────────────────────────────────────────────────────  │
│                              รวม: ฿750                   │
└──────────────────────────────────────────────────────────┘
```

**หมายเหตุ:** ใน team-summary เป็น read-only — ไม่มีปุ่มเพิ่ม/ลบ/แก้ไข

**Component:**

```
Collapsible (default open=false)
├── CollapsibleTrigger
│   div.flex.items-center.justify-between.px-3.py-2.mt-2.border-t.border-gray-100
│   ├── div.flex.items-center.gap-2
│   │   ├── Wallet icon w-4 h-4 text-amber-500
│   │   └── span.text-sm.font-medium "ค่าใช้จ่าย (N รายการ · ฿X,XXX)"
│   └── ChevronDown icon (rotate-180 when open)
└── CollapsibleContent
    └── div.px-3.pb-3
        ├── [expense rows — per item]
        │   div.flex.items-center.gap-2.py-1.5
        │   ├── [type icon] w-4 h-4 text-gray-400
        │   ├── span.flex-1.text-sm "น้ำมัน"
        │   ├── span.text-xs.text-gray-400 "10:15 น."
        │   └── span.text-sm.font-medium.text-right "฿450"
        ├── Separator
        └── div.flex.justify-end.text-sm.font-medium.pt-1
            "รวม: ฿750"
```

**Empty state (expense_count = 0):**
```
p.text-xs.text-gray-400.px-3.py-2 "ไม่มีค่าใช้จ่าย"
```

---

## 5. Desktop Layout (1280px)

### 5A. my-day — ACTIVE TRIP CARD

Expense Section แสดงเต็มในการ์ด — ไม่ต้อง collapsible บน desktop เพราะมีพื้นที่เพียงพอ

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🟢 กำลังออกเยี่ยม · เริ่ม 08:12        [จบทริป]                    │
│ 2/5 จุด  ████░░░ 40%                                                 │
│──────────────────────────────────────────────────────────────────────│
│ ค่าใช้จ่าย (2 รายการ · ฿750)    [+ เพิ่มค่าใช้จ่าย]               │
│                                                                      │
│ ⛽ น้ำมัน      10:30 น.    ฿450    [🖼]  [ลบ]                       │
│ 🛣 ทางด่วน    11:45 น.    ฿300          [ลบ]                        │
│                                          รวม: ฿750                   │
└──────────────────────────────────────────────────────────────────────┘
```

บน desktop: Collapsible ยังคงทำงาน แต่ default `open=true`

### 5B. Expense Form Drawer บน Desktop

ใช้ Sheet (side drawer จากขวา) แทน bottom drawer:

```
Sheet side="right" (เปิดจากขวา, width 480px)
└── SheetContent class="w-[480px] overflow-y-auto"
    ├── SheetHeader
    │   └── SheetTitle "เพิ่มค่าใช้จ่าย"
    └── form (เหมือน mobile ทุกอย่าง)
```

**Pattern detect:** ใช้ `const isMobile = useMediaQuery('(max-width: 768px)')`
- mobile → `<Drawer>` (bottom sheet)
- desktop → `<Sheet side="right">`

หรือ: สร้าง single component ที่ใช้ Drawer บน mobile / Sheet บน desktop ผ่าน dynamic component

### 5C. team-summary Desktop

ใน two-column layout ของ team-summary:
- LEFT panel: member list + KPI bar (รวม expense tile ใหม่)
- RIGHT panel: เมื่อ expand member = แสดง trip detail รวม expense section

---

## 6. States สรุป

| Component | State | UI |
|---|---|---|
| Expense Section | loading (fetch trip) | skeleton: 2 rows h-4 animate-pulse |
| Expense Section | empty | WalletCards icon + "ยังไม่มีค่าใช้จ่าย" + ปุ่มเพิ่ม |
| Expense Section | 1+ items | list + total + ปุ่มเพิ่ม |
| Expense Form | idle | form ว่าง |
| Expense Form | saving | button disabled + spinner "กำลังบันทึก..." |
| Expense Form | error | toast.error (ไม่ปิด drawer) |
| Expense Form | success | drawer ปิด + list refresh |
| Delete confirm | confirming | button "กำลังลบ..." disabled |
| Receipt image | none | dashed picker |
| Receipt image | processing | "กำลังประมวลผล..." text |
| Receipt image | ready | thumbnail + X + Pencil |
| Bottom bar | no expense | ซ่อน expense portion |
| Bottom bar | has expense | แสดง "· ฿X,XXX" |

---

## 7. Icon Reference

| context | icon | lucide name |
|---|---|---|
| Expense section header | กระเป๋าสตางค์ | `Wallet` |
| fuel | น้ำมัน | `Fuel` |
| toll | ทางด่วน | `Route` |
| parking | จอดรถ | `ParkingSquare` |
| meal | อาหาร | `UtensilsCrossed` |
| customer_hospitality | รับรอง | `Coffee` |
| transport | เดินทาง | `Bus` |
| other | อื่นๆ | `MoreHorizontal` |
| receipt camera | ถ่ายรูป | `Camera` |
| receipt gallery | เลือกรูป | `ImageIcon` |
| annotate | วาด annotation | `Pencil` |
| delete | ลบ | `Trash2` |
| edit | แก้ไข | (tap anywhere on row except trash) |
| warning | amount สูง | `AlertCircle` |

---

## 8. Accessibility & Touch Targets

- Expense chip button: `min-h-[64px]` — เกิน 44px iOS requirement
- Trash icon button: `w-8 h-8` — touch target ≥ 44×44px ด้วย padding (`p-0.5`)
- Drawer handle: `w-10 h-1.5 rounded-full bg-gray-300 mx-auto mt-3 mb-2` (touch target area h-8)
- Amount input: `h-12 text-lg` บน mobile — ง่ายต่อการพิมพ์ตัวเลข
- ปุ่มหลักทุกปุ่ม: `h-10` หรือ `h-11` บน mobile

---

## 9. Component File List สำหรับ Coder

| ไฟล์ | งาน |
|---|---|
| `ui/components/expense/ExpenseFormDrawer.vue` | Expense Form (Drawer + Sheet) |
| `ui/components/expense/ExpenseSection.vue` | Collapsible section + list (reuse ใน my-day + team-summary) |
| `ui/components/expense/ExpenseTypeChipGrid.vue` | Chip grid 7 หมวด |
| `ui/composables/useExpense.ts` | API calls: POST, PUT, DELETE; optimistic update |
| `ui/pages/appointment/my-day.vue` | เพิ่ม ExpenseSection + อัปเดต sticky bar + End Trip Dialog |
| `ui/pages/appointment/team-summary.vue` | เพิ่ม KPI tile + ExpenseSection ใน member detail |

**Reuse ที่ต้องใช้:**
- `VisitPhotoAnnotationEditor.vue` — annotation สำหรับใบเสร็จ
- `ui/components/ui/collapsible/` — Collapsible, CollapsibleContent, CollapsibleTrigger
- `ui/components/ui/drawer/` — Drawer, DrawerContent, DrawerHeader, DrawerFooter
- `ui/components/ui/sheet/` — Sheet, SheetContent (desktop)
- `ui/components/ui/alert-dialog/` — Delete confirm
- `ui/components/ui/input-group/` — Amount input with ฿ prefix
- `ui/components/ui/dialog/` — Receipt preview

---

## 10. Open UI Questions

| # | คำถาม | ผลกระทบ | Priority |
|---|---|---|---|
| OQ-UI-1 | Annotation บนใบเสร็จ — จำเป็นจริงๆ หรือ phase 2? `VisitPhotoAnnotationEditor` ซับซ้อนพอสมควร | ลด scope ถ้าไม่จำเป็น | Medium |
| OQ-UI-2 | ปุ่ม "+ ค่าใช้จ่าย" ควรอยู่ที่ bottom sticky bar ด้วยหรือไม่? (shortcut ไม่ต้อง expand) | UX convenience | Low |
| OQ-UI-3 | team-summary — expense section ของ member ที่ยังออกเยี่ยมอยู่ (active) แสดง realtime หรือ snapshot เมื่อ expand? | polling/SSE scope | Medium |
| OQ-UI-4 | Desktop Sheet width — 480px พอหรือควรเป็น 520px สำหรับ chip grid 4 คอลัมน์? | minor layout | Low |
| OQ-UI-5 | Format จำนวนเงิน — "฿1,200.00" หรือ "฿1,200"? spec บอก amount เป็น DECIMAL(10,2) แต่ค่าส่วนใหญ่เป็นจำนวนเต็ม | `formatAmount()` helper | Low |
