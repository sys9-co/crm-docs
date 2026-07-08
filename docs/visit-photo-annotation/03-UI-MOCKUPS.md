# Visit Photo Annotation — UI Mockups

**Feature:** visit-photo-annotation  
**Version:** 1.1 (MVP)  
**Designer:** Designer agent (Step 2/6)  
**Date:** 8 กรกฎาคม 2569  
**Status:** Ready for handoff to Coder

---

## 1. OQ-06: Modal vs Full-screen — การตัดสินใจ

**คำตอบ: Full-screen overlay**

**เหตุผล:**

1. **Canvas ต้องการพื้นที่วาดสูงสุด** — OSR ต้องสามารถ drag วาด circle/rectangle บนรูปได้อย่างแม่นยำ Modal มาตรฐาน (max-w-lg) บนมือถือให้พื้นที่ canvas เพียง ~280px × ~250px ซึ่งแคบเกินไปสำหรับการวาด shape
2. **Mobile-first primary target** — OSR ใช้งานบนมือถือขณะอยู่หน้างาน พื้นที่ UI ทุก px มีค่า Full-screen ให้ canvas ได้รับพื้นที่ ~80-85% ของความสูงหน้าจอ
3. **Pattern ที่มีอยู่แล้วในโค้ด** — `create-v2.vue` ใช้ `fixed inset-0 z-[60]` สำหรับ camera overlay แล้ว — pattern เดียวกัน (z-[70]) consistent กับโค้ดปัจจุบัน
4. **Touch interaction** — Full-screen ป้องกัน scroll-bleed ออก modal และ focus trap ทำงานได้ดีกว่าบน iOS Safari

**Implementation choice:** ใช้ Reka UI `DialogRoot` + custom `DialogContent` ที่มี class `fixed inset-0 z-[70] flex flex-col bg-black` (no max-width, no rounded, no margin) — ได้ทั้ง focus trap, Escape key close, และ aria role dialog

---

## 2. Annotation Editor — Mobile Layout (375px primary)

### 2.1 ASCII Layout

```
┌─────────────────────────────────────────┐  ← fixed top bar (h-12, bg-gray-900)
│  [✕]    ระบุตำแหน่งในรูป               │    text-white, pl-2 pr-4
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐  ← tool selector bar (h-11, bg-gray-800)
│  [ ⭕ วงกลม ]   [ ⬜ สี่เหลี่ยม ]      │    horizontal pill tabs, gap-2, px-3
└─────────────────────────────────────────┘    active: bg-white text-gray-900
                                               inactive: bg-gray-700 text-gray-300

┌─────────────────────────────────────────┐
│                                         │
│                                         │
│           CANVAS AREA                   │  ← flex-1 (ขยายเต็มพื้นที่ระหว่าง bars)
│         (รูปภาพ + shapes)               │    bg-black, touch-action: none
│                                         │    canvas element เต็ม container
│                                         │
│  ┌──────────────────────┐              │
│  │ 08/07/2569 10:30     │              │  ← timestamp overlay (bottom-left 12px)
│  │ ต.ช้างเผือก อ.เมือง  │              │    bg-black/60, text-white text-[13px]
│  └──────────────────────┘              │    px-2 py-1, rounded-sm
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐  ← bottom panel (bg-gray-900, pb-safe)
│  ☐ วันที่/เวลา   ☐ ตำบล/อำเภอ          │    Row 1: checkboxes (text-white text-sm)
│─────────────────────────────────────────│    divider line (border-gray-700)
│   [↩ เลิกทำ]          [ยืนยัน →]       │    Row 2: buttons (gap-3, px-4 py-3)
└─────────────────────────────────────────┘
```

### 2.2 Sizing (Mobile 375px)

| Zone | ความสูง | หมายเหตุ |
|------|---------|----------|
| Top bar | 48px (h-12) | title + cancel |
| Tool selector | 44px (h-11) | pill tabs |
| Canvas area | flex-1 (~auto) | ขยายเต็มพื้นที่ที่เหลือ |
| Bottom panel | ~96px (h-24) | checkboxes + buttons + pb-safe |
| **Canvas effective height** | ~75-80% viewport | ผ่าน constraint: toolbar ไม่เกิน 20% ของหน้าจอ |

บน iPhone 14 Pro (852px height): Canvas = 852 - 48 - 44 - 96 = **664px** = 78% viewport

### 2.3 Top Bar

```
┌─────────────────────────────────────────────────┐
│  [X]   ระบุตำแหน่งในรูป                         │
│  └─ Button icon-sm, variant="ghost"              │
│        text-white, hover:bg-gray-700             │
│     └─ X icon (lucide, size-5)                   │
│                                                  │
│  Title: text-white font-semibold text-base       │
│  Layout: flex items-center gap-3 px-3 h-12       │
│  Background: bg-gray-900                         │
└─────────────────────────────────────────────────┘
```

**Note:** ไม่มีปุ่ม "ยืนยัน" ที่ top bar บน mobile — อยู่ที่ bottom panel เท่านั้น เพื่อป้องกัน accidental tap

### 2.4 Tool Selector Bar

```
┌──────────────────────────────────────────┐
│  [ ⭕ วงกลม ]    [ ⬜ สี่เหลี่ยม ]       │
└──────────────────────────────────────────┘
```

- Container: `flex gap-2 px-3 items-center h-11 bg-gray-800 border-b border-gray-700`
- Each pill: `Button` component, `variant="ghost"`, height 32px, `rounded-full`, `text-sm`
- **Active state:** `bg-white text-gray-900 font-medium shadow-sm`
- **Inactive state:** `bg-gray-700/50 text-gray-300 hover:bg-gray-700`
- Circle icon: lucide `Circle` (stroke red-500 เมื่อ active)
- Rectangle icon: lucide `Square` (stroke blue-500 เมื่อ active)
- Touch target: min 44×44px (ใช้ px-4 py-2 ขยาย hit area)

### 2.5 Canvas Area

- Element: `<canvas>` ใน `<div class="flex-1 relative overflow-hidden bg-black">`
- Canvas จะ scale รูปให้พอดีกับ container โดยรักษา aspect ratio (object-fit: contain)
- `touch-action: none` บน canvas element (ป้องกัน scroll ขณะวาด)
- Canvas size = ขนาดรูป compressed จริง (BL-06) — แต่ display scale ผ่าน CSS transform

### 2.6 Bottom Panel

```
┌───────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────┐  │
│  │  [☐] วันที่/เวลา    [☐] ตำบล/อำเภอ     │  │  ← Row 1: checkboxes
│  └─────────────────────────────────────────┘  │    flex gap-6 px-4 py-2
│  ─────────────────────────────────────────    │    text-white text-sm
│  ┌─────────────────────────────────────────┐  │
│  │  [↩ เลิกทำ]            [ยืนยัน →]      │  │  ← Row 2: action buttons
│  └─────────────────────────────────────────┘  │    flex justify-between px-4 py-3
└───────────────────────────────────────────────┘
     ↑ pb-safe (env safe-area-inset-bottom iOS)
```

**Checkbox row:**
- Component: `Checkbox` (shadcn-vue) + `Label`
- Label: `text-white text-sm`, cursor-pointer ที่ทั้งแถว
- Spacing: `flex items-center gap-6` (ห่างพอสำหรับ touch target)
- Checkbox สีขาว/ขอบขาวบน dark background

**Action buttons row:**
- Undo: `Button variant="outline"` ขนาด default, icon `RotateCcw` (lucide) + text "เลิกทำ"
  - Disabled เมื่อ annotations array ว่าง
  - Class: `text-white border-gray-600 hover:bg-gray-700 hover:text-white`
- Confirm: `Button` สีเขียว, icon `ArrowRight` (lucide) ด้านขวา + text "ยืนยัน"
  - Class: `bg-green-600 hover:bg-green-700 text-white`
  - Touch target: ≥ 44px height, min-w-[120px]

---

## 3. Annotation Editor — Desktop Layout (1280px)

### 3.1 ASCII Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dialog: max-w-[780px] w-full, rounded-xl, bg-gray-900, no default padding    │
├──────────────────────────────────────────────────────────┬───────────────────┤
│                                                          │                   │
│                   CANVAS AREA                            │  TOOLBAR (right)  │
│              (รูปภาพ + shapes)                           │  w-[200px]        │
│              flex-1, bg-black                            │  bg-gray-800      │
│                                                          │                   │
│  ┌─────────────────────┐                                │  Drawing Tools    │
│  │ 08/07/2569 10:30    │                                │  ──────────────   │
│  │ ต.ช้างเผือก อ.เมือง │                                │  [⭕ วงกลม]       │
│  └─────────────────────┘                                │  [⬜ สี่เหลี่ยม]  │
│                                                          │                   │
│                                                          │  Overlays         │
│                                                          │  ──────────────   │
│                                                          │  ☐ วันที่/เวลา   │
│                                                          │  ☐ ตำบล/อำเภอ    │
│                                                          │                   │
│                                                          │  ──────────────   │
│                                                          │  [↩ เลิกทำ]      │
│                                                          │  [ยกเลิก]         │
│                                                          │  [ยืนยัน →]       │
│                                                          │                   │
└──────────────────────────────────────────────────────────┴───────────────────┘
```

### 3.2 Dialog Container

- Component: `Dialog` (Reka UI `DialogRoot` + custom `DialogContent`)
- Size: `max-w-[780px] w-full max-h-[90vh] overflow-hidden`
- Layout: `flex flex-row` (canvas left, toolbar right)
- Rounded: `rounded-xl` (desktop เท่านั้น)
- No default Dialog padding (`p-0`)
- Canvas area: `flex-1 min-h-0 relative bg-black overflow-hidden`
- Toolbar: `w-[200px] flex-shrink-0 bg-gray-800 flex flex-col gap-0`

### 3.3 Desktop Toolbar (แนวตั้ง)

```
┌──────────────────────────────┐
│  Drawing Tools               │  ← section label (text-xs text-gray-400 uppercase px-4 pt-4 pb-2)
│  ──────────────────────────  │
│  [⭕ วงกลม     ]             │  ← Button full-width, variant="ghost"
│  [⬜ สี่เหลี่ยม ]             │    active: bg-gray-700 text-white font-medium
│                              │    inactive: text-gray-400 hover:bg-gray-700
│  Overlays                    │  ← section label
│  ──────────────────────────  │
│  [☐] วันที่/เวลา             │  ← Checkbox + Label, text-white text-sm, px-4 py-1.5
│  [☐] ตำบล/อำเภอ             │
│                              │
│  ── (flex-1 spacer) ─────── │
│                              │
│  [↩ เลิกทำ]                  │  ← Button variant="ghost" full-width, disabled เมื่อ empty
│  [✕ ยกเลิก]                  │  ← Button variant="ghost" text-gray-400 full-width
│  [✓ ยืนยัน]                  │  ← Button bg-green-600 text-white full-width, mb-4
└──────────────────────────────┘
```

- Tool buttons ใน desktop มี `Tooltip` (shadcn-vue) แสดง shortcut key: Circle = `C`, Rectangle = `R`
- Toolbar header: dialog title "ระบุตำแหน่งในรูป" อยู่บน canvas เป็น overlay ด้านบน `absolute top-3 left-3 text-white/80 text-sm`

---

## 4. Caption Input Popup

### 4.1 พฤติกรรม
ปรากฏทันทีหลัง OSR ปล่อยนิ้ว (pointerup) เมื่อวาด shape เสร็จ ตำแหน่ง relative กับ shape ที่เพิ่งวาด

### 4.2 ASCII Layout

```
        ┌───────────────────────────────┐
        │  [ #label...          ] [✓] [✕]│
        │    └─ input text-sm       └─ X │
        │    20/50                        │
        └───────────────────────────────┘
        ↑ (position: absolute บน canvas overlay div)
        ↑ (top = shape.y - 44px, left = shape.x, clamp to canvas bounds)
```

### 4.3 Component/Style

- Container: `absolute bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-10`
- Min-width: 220px, max-width: 280px
- **Position logic (coder note):**
  - ค่า default: บน shape (shape.y - 48px)
  - ถ้า shape.y < 60px: แสดงใต้ shape (shape.y + shape.h + 8px)
  - clamp left: max(8px, min(shape.x, canvasWidth - popupWidth - 8px))
- Input: `Input` component (shadcn-vue), placeholder `#label...`, maxlength=50, auto-focus=true
- Char counter: `text-xs text-gray-400` ด้านล่างขวา, แสดง `xx/50`
  - เปลี่ยนเป็น `text-red-500` เมื่อ >= 45 chars
- Confirm button: `Button size="icon-sm" variant="ghost"` icon `Check` (lucide, size-4, text-green-600)
- Dismiss button: `Button size="icon-sm" variant="ghost"` icon `X` (lucide, size-4, text-gray-400)
- Enter key: confirm (keydown.enter.prevent)
- Click outside popup: dismiss (skip caption, shape ยังคงอยู่)
- Escape key: dismiss

### 4.4 States

| State | UI |
|-------|----|
| Empty caption + confirm | shape วาดโดยไม่มี text overlay (BL-03) |
| Caption = 50 chars | counter แดง, input ไม่รับ char เพิ่ม (maxlength) |
| Caption มี text | แสดง text เหนือ shape (font 14px white + drop-shadow) |

---

## 5. Overlay Preview บน Canvas

### 5.1 Timestamp Overlay

```
มุมล่างซ้าย canvas:

  ┌─────────────────────────┐
  │ 08/07/2569 10:30        │  ← bg: rgba(0,0,0,0.6), text: #FFFFFF
  └─────────────────────────┘     font: 13px sans-serif, padding: 4px 8px
                                  bottom: 12px, left: 12px (canvas pixel coords)
```

- Rendered ใน `canvas.getContext('2d')` เป็น filled rectangle + fillText
- พ.ศ. format: ปี ค.ศ. + 543 (BL-07) เช่น 2026 → 2569

### 5.2 Location Overlay

```
มุมล่างซ้าย (ใต้ timestamp ถ้าทั้งคู่ active):

  ┌─────────────────────────┐
  │ 08/07/2569 10:30        │  ← timestamp (บนสุด)
  ├─────────────────────────┤
  │ ต.ช้างเผือก อ.เมืองฯ   │  ← location (ถัดลงมา)
  └─────────────────────────┘

ถ้า location อย่างเดียว (ไม่มี timestamp):
  ┌─────────────────────────┐
  │ ต.ช้างเผือก อ.เมืองฯ   │  ← bottom: 12px, left: 12px
  └─────────────────────────┘
```

- Style เหมือน timestamp overlay (bg rgba(0,0,0,0.6), white 13px)
- Stack order: timestamp ก่อน, location ใต้ (BL-08)
- แต่ละ box render แยกกัน โดยคำนวณ y position จากล่างขึ้นบน

### 5.3 Loading State ของ Location

```
  ┌──────────────────────────────────┐
  │ ⟳ กำลังค้นหาตำแหน่ง...          │
  └──────────────────────────────────┘
```

- Render text "กำลังค้นหาตำแหน่ง..." บน canvas (same style)
- เมื่อ `overlayOptions.locationLoading = true`
- spinner บน canvas: วาด arc animation ด้วย `requestAnimationFrame` หรือใช้ Unicode ⟳
- เมื่อ geocode สำเร็จ: แทนที่ด้วยข้อความจริง + re-render canvas

### 5.4 Error State ของ Location

```
  ┌──────────────────────────┐
  │ ไม่พบตำแหน่ง             │
  └──────────────────────────┘
```

- แสดงเมื่อ: GPS denied, Nominatim timeout/error
- Checkbox ไม่ uncheck อัตโนมัติ (AC-05.3)

---

## 6. Thumbnail Badge บน Preview Grid

### 6.1 ตำแหน่ง

```
  ┌──────────────────────┐
  │                 [✏️] │  ← badge มุมขวาบน
  │                      │    absolute top-1 right-6 (เว้นจากปุ่ม X)
  │     รูป annotated    │
  │                      │
  └──────────────────────┘
  [X]  ← ปุ่มลบ (top-1 right-1 เดิม)
```

### 6.2 Badge Style

```html
<!-- เพิ่มใน div ของ thumbnail ที่ img.annotations?.length > 0 หรือ img.annotationCaption -->
<div class="absolute top-1 right-6 bg-black/60 rounded-full w-5 h-5
            flex items-center justify-center">
  <Pencil class="w-2.5 h-2.5 text-white" />
</div>
```

- Icon: lucide `Pencil` size-[10px] (หรือ `Edit2`)
- Background: `bg-black/60 rounded-full`
- Size: 20×20px (w-5 h-5)
- Position: `absolute top-1 right-6` (เว้นพื้นที่ให้ปุ่ม X ที่ right-1)
- แสดงเมื่อ: `img.annotations?.length > 0` หรือ `img.annotationCaption !== ''`

### 6.3 Re-annotate Interaction

- OSR click บน thumbnail (ที่มี badge ✏️) → เปิด AnnotationEditor พร้อม:
  - `originalDataUrl` เป็น image source
  - restore `annotations` state เดิม
  - restore `overlayOptions` เดิม (showTimestamp, showLocation, locationText)
- click X (ลบ) ยังคงทำงานเหมือนเดิม (stopPropagation จาก click ของ X)

---

## 7. Component Hierarchy (Full)

```
VisitPhotoAnnotationEditor.vue
│
├── [Mobile: fixed inset-0 z-[70] flex flex-col bg-gray-900]
│   │
│   ├── TopBar (h-12 bg-gray-900 flex items-center px-3)
│   │   ├── Button (icon-sm, ghost, X icon) → emit('cancel')
│   │   └── span "ระบุตำแหน่งในรูป" (text-white font-semibold)
│   │
│   ├── ToolBar (h-11 bg-gray-800 flex gap-2 px-3 items-center border-b border-gray-700)
│   │   ├── Button pill [⭕ วงกลม] :active="tool==='circle'" @click="tool='circle'"
│   │   └── Button pill [⬜ สี่เหลี่ยม] :active="tool==='rectangle'" @click="tool='rectangle'"
│   │
│   ├── CanvasWrapper (flex-1 relative overflow-hidden bg-black)
│   │   ├── <canvas ref="canvas" class="w-full h-full object-contain" />
│   │   └── CaptionPopup (absolute, v-if="showCaptionPopup")
│   │       ├── Input (auto-focus, maxlength=50, @keydown.enter="confirmCaption")
│   │       ├── span "xx/50" (char counter)
│   │       ├── Button (Check icon) → confirmCaption()
│   │       └── Button (X icon) → dismissCaption()
│   │
│   └── BottomPanel (bg-gray-900 border-t border-gray-700 pb-safe)
│       ├── CheckboxRow (flex gap-6 px-4 py-2)
│       │   ├── Checkbox + Label "วันที่/เวลา" v-model="overlayOptions.showTimestamp"
│       │   └── Checkbox + Label "ตำบล/อำเภอ" v-model="overlayOptions.showLocation"
│       └── ActionRow (flex justify-between px-4 py-3 gap-3)
│           ├── Button [↩ เลิกทำ] :disabled="annotations.length===0" @click="undo()"
│           └── Button [ยืนยัน →] @click="confirm()"
│
└── [Desktop: Dialog max-w-[780px] flex flex-row h-[85vh]]
    ├── CanvasWrapper (flex-1 relative bg-black)
    │   ├── <canvas />
    │   └── CaptionPopup (same as mobile)
    └── DesktopToolbar (w-[200px] bg-gray-800 flex flex-col)
        ├── SectionLabel "Drawing Tools"
        ├── Button (Circle) with Tooltip "C"
        ├── Button (Rectangle) with Tooltip "R"
        ├── Separator
        ├── SectionLabel "Overlays"
        ├── Checkbox + Label "วันที่/เวลา"
        ├── Checkbox + Label "ตำบล/อำเภอ"
        ├── div flex-1 (spacer)
        ├── Button [↩ เลิกทำ] (ghost, disabled เมื่อ empty)
        ├── Button [✕ ยกเลิก] (ghost)
        └── Button [✓ ยืนยัน] (bg-green-600)
```

---

## 8. shadcn-vue / Reka UI Components ที่ใช้

| Component | Path ใน ui/components/ui/ | การใช้งาน |
|-----------|--------------------------|-----------|
| `Button` | `button/Button.vue` | ทุก action, tool selector pills, icon buttons |
| `Checkbox` | `checkbox/Checkbox.vue` (ต้องตรวจสอบมี) | overlay options (timestamp, location) |
| `Input` | `input/Input.vue` | caption text input popup |
| `Tooltip` | (ต้องตรวจสอบมี) | tool button shortcuts บน desktop |
| `Separator` | `separator/Separator.vue` | แบ่ง section ใน desktop toolbar |
| `Spinner` | `spinner/Spinner.vue` | loading state ระหว่าง reverse geocode |
| `Dialog` | Reka UI `DialogRoot` + custom content | desktop wrapper (full-screen override) |

**หมายเหตุสำหรับ Coder:**
- Mobile: ใช้ `v-if` conditional render ด้วย `fixed inset-0` div (pattern เหมือน camera overlay ใน create-v2.vue) ไม่ใช้ Dialog component เพื่อหลีกเลี่ยง animation conflict กับ camera
- Desktop: ใช้ `Dialog` จาก Reka UI + override content class เป็น `max-w-[780px] p-0`
- Breakpoint: `sm:` (640px) เป็น boundary ระหว่าง mobile และ desktop layout
- Checkbox ถ้าไม่มีใน ui/components/ui/ → ใช้ `<input type="checkbox">` + Tailwind custom style

---

## 9. States ที่ต้อง implement ทุก state

### 9.1 Empty State (เพิ่งเปิด editor)
- Canvas แสดงรูปต้นฉบับ ไม่มี shape
- Tool selector: circle active by default (UX decision — เริ่มพร้อมใช้งาน)
- Undo button: disabled (gray, cursor-not-allowed)
- Overlays: unchecked (default)

### 9.2 Drawing State (ขณะ drag)
- แสดง shape preview ตาม pointer position real-time (dashed outline ระหว่าง drag)
- Circle: dashed ellipse สีแดง (#EF4444)
- Rectangle: dashed rect สีน้ำเงิน (#3B82F6)
- ห้าม render caption popup ระหว่าง drag

### 9.3 Post-draw State (หลัง pointerup)
- Shape commit เป็น solid (stroke-width 3)
- Caption popup ปรากฏ
- Tool ยังคง active (สามารถวาดต่อ)

### 9.4 With Overlays State
- Timestamp overlay: render ทันทีเมื่อ check (ค่า timestamp fix ณ เวลาเปิด editor)
- Location overlay loading: "กำลังค้นหาตำแหน่ง..." + ⟳ animation
- Location overlay success: "ต.X อ.Y"
- Location overlay error: "ไม่พบตำแหน่ง"

### 9.5 Re-annotate State (เปิด editor ซ้ำ)
- Canvas restore จาก originalDataUrl
- Re-draw shapes ทั้งหมดจาก annotations array
- Restore overlay options + overlay text ที่บันทึกไว้
- Caption popup ไม่แสดง (เปิด editor ใหม่)

### 9.6 Canvas Error State
- `canvas.getContext('2d')` คืน null → toast warning ภาษาไทย + ปิด editor + upload compressed original
- ไม่แสดง editor UI (emit cancel ทันที)

---

## 10. Interaction Notes สำหรับ Coder

### Canvas Coordinate System
- Canvas element size = `canvas.width` × `canvas.height` = ขนาดรูป compressed (BL-06)
- CSS display size อาจต่างจาก pixel size (object-contain scaling)
- ต้องแปลง pointer position ผ่าน `getBoundingClientRect()` + scale factor:
  ```
  scaleX = canvas.width / rect.width
  scaleY = canvas.height / rect.height
  x = (event.clientX - rect.left) * scaleX
  y = (event.clientY - rect.top) * scaleY
  ```

### Touch Events
- ใช้ `pointer events API` (pointerdown, pointermove, pointerup) รองรับทั้ง mouse และ touch
- `canvas.setPointerCapture(event.pointerId)` เมื่อ pointerdown เพื่อให้ drag ทำงานนอก canvas

### Minimum Shape Size
- ถ้า |endX - startX| < 10 หรือ |endY - startY| < 10 → discard shape (edge case BL)
- ไม่แสดง caption popup เมื่อ discard

### Canvas Re-render Flow
```
state change (add shape / undo / toggle overlay)
  → clearRect(0, 0, width, height)
  → drawImage(originalImage, 0, 0)
  → shapes.forEach(drawShape)
  → if showTimestamp: drawTimestampOverlay()
  → if showLocation: drawLocationOverlay()
```

### Caption Text on Canvas
- `ctx.font = '14px sans-serif'`
- `ctx.fillStyle = 'white'`
- `ctx.shadowColor = 'black'`, `ctx.shadowBlur = 4`
- Position: เหนือ shape (shape.y - 6px สำหรับ rect, shape.y - radiusY - 6px สำหรับ circle)

### Keyboard Support (Desktop)
- `C` key: เลือก Circle tool
- `R` key: เลือก Rectangle tool
- `Ctrl+Z`: Undo
- `Escape`: ปิด caption popup ก่อน, ถ้าไม่มี popup → ยกเลิก editor (confirm dialog ก่อน)

---

## 11. Pages ที่ต้อง Integrate

### create-v2.vue (หลัก)
- **Integration point:** `capturePhoto()` (line ~1100) และ `onSelectImages()` (line ~1110)
- หลัง `previewImages.value.push(...)` → emit event เพื่อเปิด AnnotationEditor พร้อม image data
- เมื่อ editor confirm → update `previewImages[index]` ด้วย `AnnotatedPreviewImage` structure
- Thumbnail grid: เพิ่ม click handler บน thumbnail ที่มี annotation badge

### create.vue
- Integration point เดียวกับ create-v2.vue แต่ดู line reference ใน 02-API.md

### edit-v2.vue (id)/
- Integration point: `uploadVisitPhotoBase64()` (line ~829)
- Flow เหมือนกัน แต่ visit ID มีอยู่แล้ว → upload ทันทีหลัง confirm

---

## 12. Color Reference

| ชื่อ | Hex | ใช้ที่ |
|-----|-----|--------|
| Circle stroke | `#EF4444` | Canvas shape |
| Rectangle stroke | `#3B82F6` | Canvas shape |
| Overlay background | `rgba(0,0,0,0.6)` | Timestamp/Location box |
| Overlay text | `#FFFFFF` | Timestamp/Location text |
| Confirm button | `bg-green-600` → `#16A34A` | Bottom panel + desktop |
| Dark UI background | `bg-gray-900` → `#111827` | Editor chrome |
| Dark toolbar | `bg-gray-800` → `#1F2937` | Tool selector, desktop sidebar |

---

## 13. Accessibility

- `role="dialog"`, `aria-label="Annotation Editor"`, `aria-modal="true"`
- Focus trap ใน editor (ผ่าน Reka UI DialogRoot)
- `aria-pressed` บน tool selector buttons (active state)
- `aria-label="วาดวงกลม"`, `aria-label="วาดสี่เหลี่ยม"` บน tool buttons
- Caption input: `aria-label="กรอก caption สำหรับ shape"`, `aria-describedby="charCount"`
- ปุ่ม Undo: `aria-disabled="true"` เมื่อ disabled

---

## 14. Handoff Checklist สำหรับ Coder

- [ ] `VisitPhotoAnnotationEditor.vue` ใน `ui/components/`
- [ ] Props: `modelValue: boolean`, `imageDataUrl: string`, `imageTimestamp: Date`, `existingAnnotations?: AnnotationShape[]`, `existingOverlayOptions?: OverlayOptions`
- [ ] Emits: `update:modelValue`, `confirm(annotatedDataUrl: string, annotations: AnnotationShape[], caption: string, overlayOptions: OverlayOptions)`, `cancel`
- [ ] Mobile layout: `fixed inset-0 z-[70]` (ไม่ใช้ Dialog เพื่อป้องกัน z-index conflict กับ camera)
- [ ] Desktop layout: Dialog `max-w-[780px]` breakpoint `sm:` ขึ้นไป
- [ ] Canvas pointer events: `pointerdown`, `pointermove`, `pointerup` + `setPointerCapture`
- [ ] `touch-action: none` บน canvas
- [ ] Caption popup: absolute positioning + clamp to canvas bounds
- [ ] Overlay render order: image → shapes → timestamp → location (BL-08)
- [ ] Timestamp format: DD/MM/YYYY (พ.ศ.) HH:mm
- [ ] Location: reverse geocode Nominatim + User-Agent header (BL-09)
- [ ] Minimum shape size: 10px (discard ถ้าน้อยกว่า)
- [ ] Undo: ลบ shape ล่าสุดจาก array + re-render
- [ ] Export: `canvas.toDataURL('image/jpeg', 0.85)`
- [ ] Thumbnail badge: `Pencil` icon บน thumbnail ที่มี annotation
- [ ] Re-annotate: restore originalDataUrl + annotations + overlayOptions
- [ ] Integrate ใน: create-v2.vue, create.vue, edit-v2.vue
- [ ] Keyboard: C/R/Ctrl+Z/Escape (desktop)
- [ ] Test: E2E-ANN-01 ถึง E2E-ANN-13 ตาม spec

---
---

## 15. Demo Page — `/settings?tab=photo-annotation`

### 15.1 การตัดสินใจ Route

**เลือก: Tab ใน `/settings` แทน standalone page `/settings/photo-annotation`**

**เหตุผล:**
- `ui/pages/settings.vue` ใช้ Tab navigation ที่ driven ด้วย `?tab=` query param อยู่แล้ว
- เพิ่ม tab ใหม่ reuse navigation chrome ทั้งหมด (Breadcrumb, Card, TabsList)
- หลีกเลี่ยง Nuxt route conflict ระหว่าง `pages/settings.vue` (flat file) กับ `pages/settings/photo-annotation.vue` (nested)
- Route: `/settings?tab=photo-annotation`

### 15.2 Mobile Layout (375px)

```
┌───────────────────────────────────────────┐
│  Home > ตั้งค่าระบบ            [บันทึก]  │  <- existing nav (ไม่เปลี่ยน)
├───────────────────────────────────────────┤
│  ทั่วไป | การแจ้งเตือน | ... | Photo Ann.│  <- TabsList (เพิ่ม tab ใหม่ขวาสุด)
│  ─────────────────────────────────────────│    active: underline yellow
├───────────────────────────────────────────┤
│                                           │
│  ทดสอบ Annotation Editor                 │  <- h2 text-base font-semibold px-4 pt-4
│  ทดลองใช้งานก่อน upload จริง            │  <- p text-sm text-gray-500 px-4 pb-3
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │  [ถ่ายรูป]    [เลือกจาก Gallery]    │ │  <- 2 buttons, gap-3, w-full
│  └──────────────────────────────────────┘ │    px-4
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │                                      │ │
│  │    ลากรูปมาวางที่นี่ (desktop only) │ │  <- Drop zone / placeholder
│  │    หรือเลือกจากปุ่มด้านบน           │ │    border-2 border-dashed rounded-xl
│  │                                      │ │    py-12 text-center text-gray-400
│  └──────────────────────────────────────┘ │    (hidden บน mobile, visible sm:)
│                                           │
│  ─── ผลลัพธ์ (v-if="result") ─────────── │
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │  [thumbnail 80x80] [pencil badge]    │ │  <- รูป annotated + badge
│  │                                      │ │    rounded-lg overflow-hidden
│  │  Caption: #ออกเยี่ยม #Mr.Tom        │ │  <- text-sm font-mono mt-2
│  │  Overlays: [v วันที่/เวลา] [v ตำบล] │ │  <- Badge chips (green/gray)
│  │  ขนาด: 245 KB -> 312 KB             │ │  <- text-xs text-gray-500
│  └──────────────────────────────────────┘ │
│                                           │
│  [ทดสอบรูปใหม่]                          │  <- Button variant="outline" full-width
│                                           │    (แสดงเมื่อมี result)
└───────────────────────────────────────────┘
```

### 15.3 Desktop Layout (1280px)

```
┌──────────────────────────────────────────────────────────────────┐
│  Tab content: max-w-2xl mx-auto py-6 px-4                        │
│                                                                  │
│  ทดสอบ Annotation Editor                                        │
│  ทดลองใช้งานก่อน upload จริง                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │    Drop zone: ลากรูปมาวางที่นี่                         │   │
│  │    หรือกดปุ่มด้านล่าง (icon Camera ขนาด 48px)           │   │
│  │                                                          │   │
│  │    [ถ่ายรูป]    [เลือกจาก Gallery]                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ─── ผลลัพธ์ ──────────────────────────────────────────────── │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────────────────────────┐    │
│  │              │  │  Caption: #ออกเยี่ยม #Mr.Tom          │    │
│  │  [thumbnail  │  │  Overlays: [v วันที่/เวลา] [v ตำบล] │    │
│  │   160x160]   │  │  ขนาดก่อน: 245 KB                    │    │
│  │              │  │  ขนาดหลัง: 312 KB (+27%)             │    │
│  └──────────────┘  │  Shapes: 2 shapes (1 circle, 1 rect) │    │
│                    └──────────────────────────────────────┘    │
│                                                                  │
│  [ทดสอบรูปใหม่]                                                │
└──────────────────────────────────────────────────────────────────┘
```

### 15.4 Component List สำหรับ Demo Page

| Component/Element | Path/Source | หมายเหตุ |
|-------------------|-------------|---------|
| `PhotoAnnotationView.vue` | `ui/components/setting/PhotoAnnotationView.vue` | Tab content component (ใหม่) |
| `VisitPhotoAnnotationEditor` | `ui/components/VisitPhotoAnnotationEditor.vue` | reuse จาก feature หลัก |
| `Button` | `ui/components/ui/button/Button.vue` | ปุ่มถ่ายรูป/เลือกรูป/ทดสอบใหม่ |
| `Badge` | `ui/components/ui/badge/Badge.vue` | overlay status chips |
| `Separator` | `ui/components/ui/separator/Separator.vue` | แบ่ง input กับ result |
| `Camera` (lucide) | via nuxt-lucide-icons | icon ถ่ายรูป |
| `ImageIcon` (lucide) | via nuxt-lucide-icons | icon gallery |

### 15.5 States ของ Demo Page

| State | UI |
|-------|----|
| Initial (ยังไม่เลือกรูป) | แสดงแค่ drop zone + buttons; ไม่มี result section |
| Editor open | AnnotationEditor overlay เปิดทับหน้า settings (z-[70]) |
| Editor cancelled | กลับ initial state |
| Result ready | แสดง result section (thumbnail + metadata) |
| Testing new image | reset result -> กลับ initial state |

### 15.6 Result Section — Metadata Display

**File size calculation (coder note):**
- ก่อน: `originalDataUrl.length * 0.75 / 1024` KB (base64 approximation)
- หลัง: `annotatedDataUrl.length * 0.75 / 1024` KB
- % change: แสดงสีแดงอ่อนถ้าขนาดขยาย, สีเขียวอ่อนถ้าลดลง

**Overlay status chips:**
- Active: `Badge variant="default"` (green background)
- Inactive: `Badge variant="outline"` (gray)
- ตัวอย่าง: `[v วันที่/เวลา]` = active, `[- ตำบล/อำเภอ]` = inactive

---

## 16. Settings Menu Integration

### 16.1 ไฟล์ที่ต้องแก้ไข

**`ui/pages/settings.vue`** — เพิ่ม 3 จุด:

**จุดที่ 1 — import component ใหม่ (บรรทัดหลัง import สุดท้าย ~line 107):**
```js
import PhotoAnnotationView from "@/components/setting/PhotoAnnotationView.vue"
```

**จุดที่ 2 — เพิ่มใน `views` map (~line 109):**
```js
const views = {
  general: GeneraleFormView,
  notification: NotificationView,
  roles: RoleManagementView,
  permissions: PermissionMenuView,
  'photo-annotation': PhotoAnnotationView,  // เพิ่มบรรทัดนี้
}
```

**จุดที่ 3 — เพิ่มใน `tabs` array (~line 122, ท้ายสุด):**
```js
const tabs = [
  { label: "ทั่วไป", value: "general" },
  { label: "การแจ้งเตือน", value: "notification" },
  { label: "จัดการสิทธิ์", value: "roles" },
  { label: "จัดการเมนู", value: "permissions" },
  { label: "Photo Annotation", value: "photo-annotation" },  // เพิ่มบรรทัดนี้
]
```

**หมายเหตุ Tab label:** ใช้ "Photo Annotation" (English) เพื่อสื่อว่าเป็น technical/dev sandbox — ถ้า PM ต้องการภาษาไทยให้ใช้ "ทดสอบระบุรูป"

### 16.2 ไฟล์ใหม่ที่ต้องสร้าง

| ไฟล์ | หมายเหตุ |
|------|---------|
| `ui/components/setting/PhotoAnnotationView.vue` | Tab content — demo/sandbox page |

### 16.3 Tab Overflow บน Mobile

บน mobile (375px) TabsList อาจ overflow ถ้า tabs เกิน 4 รายการ:

```
ทั่วไป | การแจ้งเตือน | จัดการสิทธิ์ | จัดการเมนู | Photo Ann.
<---------- overflow-x-auto scroll ---------->
```

**Coder note:** ตรวจสอบ TabsList ว่ามี `overflow-x-auto flex-nowrap` อยู่แล้วหรือไม่ ถ้าไม่มีให้เพิ่ม

### 16.4 "บันทึกการตั้งค่า" Button Guard

ปุ่ม "บันทึกการตั้งค่า" ไม่ควรทำงานใน photo-annotation tab (demo page ไม่มีอะไร save):

```js
// ใน saveSetting() function เพิ่ม guard:
function saveSetting() {
  if (active.value === 'photo-annotation') return
  // ... existing logic
}
```

หรือซ่อนปุ่ม `v-if="active !== 'photo-annotation'"` ในชั้น template

---

## 17. Handoff Checklist สำหรับ Coder (ฉบับสมบูรณ์)

### A. VisitPhotoAnnotationEditor Component
- [ ] `ui/components/VisitPhotoAnnotationEditor.vue` สร้างใหม่
- [ ] Props: `modelValue: boolean`, `imageDataUrl: string`, `imageTimestamp: Date`, `existingAnnotations?: AnnotationShape[]`, `existingOverlayOptions?: OverlayOptions`
- [ ] Emits: `update:modelValue`, `confirm(annotatedDataUrl: string, annotations: AnnotationShape[], caption: string, overlayOptions: OverlayOptions)`, `cancel`
- [ ] Mobile layout: `fixed inset-0 z-[70]` (ไม่ใช้ Dialog เพื่อป้องกัน z-index conflict กับ camera)
- [ ] Desktop layout: Dialog `max-w-[780px]` ที่ sm: breakpoint
- [ ] Canvas pointer events + `setPointerCapture` + `touch-action: none`
- [ ] Caption popup: absolute positioning + clamp to canvas bounds
- [ ] Overlay render order: image -> shapes -> timestamp -> location (BL-08)
- [ ] Timestamp format: DD/MM/YYYY (พ.ศ.) HH:mm (BL-07)
- [ ] Location: Nominatim reverse geocode + User-Agent header (BL-09, AC-05.2)
- [ ] Minimum shape size: 10px discard
- [ ] Undo: ลบ shape ล่าสุด + re-render canvas
- [ ] Export: `canvas.toDataURL('image/jpeg', 0.85)`
- [ ] Keyboard shortcuts (desktop): C/R/Ctrl+Z/Escape
- [ ] Accessibility: role=dialog, aria-pressed, aria-label, focus trap

### B. Thumbnail Badge + Re-annotate
- [ ] `Pencil` icon badge (`absolute top-1 right-6 bg-black/60 rounded-full w-5 h-5`)
- [ ] แสดงเมื่อ `img.annotations?.length > 0`
- [ ] Click thumbnail (ที่มี badge) -> เปิด editor ซ้ำพร้อม restore state
- [ ] `stopPropagation` บนปุ่ม X เพื่อไม่ trigger re-annotate

### C. Visit Page Integration
- [ ] `create-v2.vue`: integrate ใน `capturePhoto()` (~line 1100) + `onSelectImages()` (~line 1110)
- [ ] `create.vue`: integrate ใน `onSelectImages()`
- [ ] `edit-v2.vue`: integrate ใน `uploadVisitPhotoBase64()` (~line 829)
- [ ] POST payload ใช้ `annotatedDataUrl` แทน original + `annotationCaption` เป็น caption

### D. Demo/Sandbox Page (Settings)
- [ ] `ui/components/setting/PhotoAnnotationView.vue` สร้างใหม่
- [ ] `ui/pages/settings.vue`: เพิ่ม import + views entry + tabs entry (3 จุด ตาม Section 16.1)
- [ ] Drop zone (desktop): รองรับ `dragover` + `drop` events
- [ ] Result section: thumbnail + caption + overlay badge chips + file size comparison
- [ ] Guard "บันทึก" button หรือ `saveSetting()` เมื่อ active = photo-annotation
- [ ] TabsList overflow-x-auto บน mobile (ถ้ายังไม่มี)

### E. Tests (QA scope)
- [ ] E2E-ANN-01 ถึง E2E-ANN-13 ตาม 01-SPEC.md Section 8

---

*หมายเหตุ: ไฟล์นี้เป็น text mockup spec สำหรับ coder — ไม่มี Vue component ใดถูกสร้างในขั้นตอนนี้*