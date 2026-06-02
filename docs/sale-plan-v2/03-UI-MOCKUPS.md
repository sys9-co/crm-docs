# Sale Plan v2 - UI/UX Mockups & Specifications

## 🎨 Visual Interface Design

### **Excel-style Table Layout (Desktop 1024px+)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            🏗️ Sale Plan v2 - โครงการ ABC                                                               │
├─────────────────────────────┬───────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│          BOQ Item           │   BOQ Amount  │   มิ.ย. 69  │   ก.ค. 69   │   ส.ค. 69   │   ก.ย. 69   │   ต.ค. 69   │   พ.ย. 69   │   รวม       │
├─────────────────────────────┼───────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 🏗️ งานโครงสร้าง              │ 1,500,000 ฿   │  [300,000]  │  [400,000]  │  [300,000]  │  [200,000]  │  [100,000]  │     [_]     │ 1,300,000   │
│ 🟡 86.7% | เหลือ 200,000     │               │             │             │             │             │             │             │ 🟡 -13.3%   │
├─────────────────────────────┼───────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 🎨 งานตกแต่งภายใน            │   800,000 ฿   │  [100,000]  │  [200,000]  │  [300,000]  │  [250,000]  │     [_]     │     [_]     │   850,000   │
│ ⚠️ 106.3% | เกิน 50,000      │               │             │             │             │             │             │             │ 🔴 +6.3%    │
├─────────────────────────────┼───────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ ⚡ งานไฟฟ้าประปา             │   300,000 ฿   │     [_]     │  [150,000]  │  [100,000]  │     [_]     │     [_]     │     [_]     │   250,000   │
│ ✅ 83.3% | เหลือ 50,000      │               │             │             │             │             │             │             │ 🟢 -16.7%   │
├─────────────────────────────┼───────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 🪟 งานกระจกอลูมิเนียม        │   400,000 ฿   │     [_]     │     [_]     │  [200,000]  │  [200,000]  │     [_]     │     [_]     │   400,000   │
│ ✅ 100% | พอดี 0             │               │             │             │             │             │             │             │ ⚪ 100%     │
├─────────────────────────────┼───────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│          รวมต่อเดือน          │               │   400,000   │   750,000   │   900,000   │   650,000   │   100,000   │      0      │ 2,800,000   │
└─────────────────────────────┴───────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘

📊 สรุปโครงการ: 3,000,000 ฿ (เป้าหมาย) | 2,800,000 ฿ (วางแผน) | เหลือ 200,000 ฿ (6.7%)

⚠️ การแจ้งเตือน:
🔴 งานตกแต่งภายใน: เกินจาก BOQ 50,000 ฿ (6.3%)  
🟡 ยังไม่ได้วางแผนครบ 200,000 ฿ จากเป้าหมายรวม

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│    💾 บันทึกแผน      │  │    🔄 รีเซ็ต         │  │    📤 ส่งออก         │  
│   (6 รายการแก้ไข)    │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### **Mobile Card Layout (< 768px)**

```
┌─────────────────────────────────────────────┐
│              🏗️ Sale Plan v2                 │
│            โครงการ ABC                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🏗️ งานโครงสร้าง                1,500,000 ฿ │
│ 🟡 86.7% | เหลือ 200,000 ฿                  │
├─────────────────────────────────────────────┤
│ มิ.ย. 69  │ ก.ค. 69  │ ส.ค. 69  │ รวม      │
├───────────┼──────────┼──────────┼──────────┤
│ 300,000   │ 400,000  │ 300,000  │1,300,000 │
│ [_____]   │ [_____]  │ [_____]  │ 🟡 -13% │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐  
│ 🎨 งานตกแต่งภายใน             800,000 ฿  │
│ ⚠️ 106.3% | เกิน 50,000 ฿                  │
├─────────────────────────────────────────────┤
│ มิ.ย. 69  │ ก.ค. 69  │ ส.ค. 69  │ รวม      │
├───────────┼──────────┼──────────┼──────────┤
│ 100,000   │ 200,000  │ 300,000  │ 850,000  │
│ [_____]   │ [_____]  │ [_____]  │ 🔴 +6%  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│               📊 สรุปรวม                    │
│ เป้าหมาย: 3,000,000 ฿                      │
│ วางแผน: 2,800,000 ฿                        │
│ เหลือ: 200,000 ฿ (6.7%)                    │
└─────────────────────────────────────────────┘

⚠️ การแจ้งเตือน:
🔴 งานตกแต่งภายใน เกิน 50,000 ฿ (6.3%)

┌─────────────────────┐
│    💾 บันทึกแผน      │
│   (6 รายการแก้ไข)    │  
└─────────────────────┘
```

## 🎯 Interactive Elements

### **Editable Cell States:**

**1. Empty Cell (Ready for Input):**
```
┌─────────────┐
│     [_]     │  ← Placeholder with light gray border
└─────────────┘
```

**2. Active Editing:**
```
┌─────────────┐
│ 150,000|    │  ← Blue border, cursor visible, real-time validation
└─────────────┘
```

**3. With Warning:**
```
┌─────────────┐
│  200,000    │  ← Red border, warning icon
│ ⚠️ เกิน 20%  │
└─────────────┘
```

**4. Validated (No Issues):**
```  
┌─────────────┐
│  150,000    │  ← Green border briefly, then normal
└─────────────┘
```

### **Row Status Indicators:**

```
🟢 Under allocation (< 100% of BOQ)
⚪ Exact allocation (= 100% of BOQ)  
🟡 Slight over (100-110% of BOQ)
🔴 Over allocation (> 110% of BOQ)
⚫ Empty/No data
```

### **Summary Section Interactions:**

```
┌─────────────────────────────────────────────┐
│               📊 สรุปโครงการ                │
├─────────────────────────────────────────────┤
│ 🎯 เป้าหมาย BOQ: 3,000,000 ฿               │
│ 📊 วางแผนแล้ว: 2,800,000 ฿ (93.3%)         │
│ ⚡ เหลือวางแผน: 200,000 ฿ (6.7%)           │
│ ⚠️ เกินแผน: 50,000 ฿ (1.7%)               │
├─────────────────────────────────────────────┤
│ 📈 ความคืบหน้าโดยรวม: ████████░░ 93%       │
└─────────────────────────────────────────────┘
```

## 🔄 User Interaction Flows

### **Flow 1: Cell Editing**
```
1. User clicks empty cell [_]
   ↓
2. Cell becomes input field with focus
   ↓  
3. User types amount (real-time formatting)
   ↓
4. Real-time validation shows warnings
   ↓
5. User presses Enter or clicks outside
   ↓
6. Cell saves locally (dirty state)
   ↓
7. Row/column summaries update
   ↓
8. Save button shows "(X รายการแก้ไข)"
```

### **Flow 2: Batch Save Operation**
```
1. User edits multiple cells (dirty state)
   ↓
2. Save button shows count "(6 รายการแก้ไข)"
   ↓
3. User clicks "💾 บันทึกแผน"
   ↓
4. Loading overlay appears  
   ↓
5. API call with complete matrix
   ↓
6. Success: Green toast + clean state
   Error: Red toast + retain dirty state
```

### **Flow 3: Warning Resolution**
```
1. User enters amount causing BOQ overflow
   ↓
2. Cell shows red border + warning icon
   ↓ 
3. Summary shows warning message
   ↓
4. User can:
   - Adjust amount to resolve warning
   - Save anyway (warnings don't block)
   - View detailed warning tooltip
```

## 📱 Responsive Breakpoints

### **Desktop (1024px+)**:
- Full Excel-style table
- All columns visible
- Horizontal scroll if many months
- Sticky first column (BOQ names)
- Fixed summary sections

### **Tablet (768-1023px)**:
- Compact table layout
- Horizontal scroll enabled
- Sticky BOQ column
- Collapsible summary panel

### **Mobile (<768px)**:
- Card-based layout per BOQ
- Expandable month grid per card
- Swipeable month navigation
- Bottom-fixed save button
- Collapsible warnings panel

## 🎨 Visual Design System

### **Color Palette:**
```css
/* Status Colors */
--success-color: #22c55e;   /* Green - Under allocation */
--warning-color: #f59e0b;   /* Yellow - Slight over */
--error-color: #ef4444;     /* Red - Over allocation */
--neutral-color: #6b7280;   /* Gray - Exact/Empty */

/* Interactive Colors */
--primary-blue: #3b82f6;    /* Edit focus */
--border-light: #e5e7eb;    /* Default borders */
--bg-light: #f9fafb;        /* Table headers */
--text-primary: #111827;    /* Main text */
--text-secondary: #6b7280;  /* Secondary text */
```

### **Typography:**
```css
/* Headers */
.table-header { font-size: 14px; font-weight: 600; }
.boq-name { font-size: 16px; font-weight: 500; }
.amount-large { font-size: 18px; font-weight: 600; }

/* Data */
.cell-input { font-size: 14px; font-family: monospace; }
.percentage { font-size: 12px; font-weight: 500; }
.warning-text { font-size: 12px; color: var(--error-color); }
```

### **Spacing & Layout:**
```css
.cell-padding: 8px 12px;
.row-height: 64px;
.header-height: 48px;
.mobile-card-gap: 16px;
.button-height: 40px;
```

## 🧪 Visual Testing Scenarios

### **Test Cases for Screenshots:**

1. **Empty Table State**: No data, all cells empty
2. **Partially Filled**: Mix of empty and filled cells
3. **All Valid Data**: All green, no warnings
4. **With Warnings**: Red/yellow status indicators
5. **Editing State**: Focus on input field
6. **Save State**: Dirty indicator showing
7. **Loading State**: Overlay during save
8. **Mobile Layout**: Card view on small screen
9. **Warning Panel**: Expanded warnings section
10. **Summary Stats**: Complete calculations view

### **Validation Visual States:**
```
✅ Valid amount (green border briefly)
⚠️ BOQ overflow warning (red border + icon)
❌ Invalid input (red border + error text)
💾 Dirty/unsaved (blue left border)
🔄 Saving (gray overlay + spinner)
```

## 🔧 Component States Documentation

### **SalePlanV2Table States:**
- `loading`: Show skeleton loaders
- `editing`: At least one cell in edit mode
- `dirty`: Unsaved changes exist
- `saving`: API call in progress
- `error`: Failed to load/save

### **SalePlanV2Cell States:**
- `empty`: No value, ready for input
- `view`: Display value, click to edit
- `edit`: Input mode, focused
- `warning`: Has validation warning
- `error`: Invalid input
- `saving`: Part of save operation

### **SalePlanV2Summary States:**
- `calculating`: Updates in progress
- `complete`: All calculations done
- `warning`: Has warnings to show
- `expanded`: Detailed view visible

---

**UI Specification Version**: 1.0  
**Last Updated**: June 1, 2026  
**Designer**: Frontend Development Team  
**Review Status**: Ready for Implementation