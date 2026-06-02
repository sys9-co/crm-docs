# Dashboard v2 - UI/UX Mockups & Specifications

## 🎨 Visual Interface Design

### **Member View (Desktop 1024px+)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 Dashboard                                    [ทีม: ปลีก(สนญ) ▼]  [📅 มิถุนายน 2569 ▼]  👤 สมชาย │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                                  │
│  │  📍 Visits       │  │  👥 Customers    │  │  💰 Revenue      │                                  │
│  │                  │  │                  │  │                  │                                  │
│  │    40 / 55      │  │      32          │  │   ฿850,000      │                                  │
│  │  เสร็จสิ้น 73%   │  │  ลูกค้าที่ใช้งาน   │  │  จากเป้า 1,000,000 │                                  │
│  │                  │  │                  │  │                  │                                  │
│  │  📞 15  🏢 20 📋 5│  │  +5 รายใหม่     │  │  📈 85%  (+12.5%)│                                  │
│  │  เฉลี่ย 35 นาที   │  │  ความถี่ 1.63   │  │  เฉลี่ย 21,250 ฿  │                                  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘                                  │
│                                                                                                     │
│  ┌─ 📅 ตารางนัดหมายวันนี้ (16 มิ.ย. 69) ─────────────────────────────────────────────────────────┐  │
│  │  ⏰ 09:00 ── 🏢 เยี่ยมสถานที่ ── ประชุมติดตามงาน โครงการ ABC  ── สมชาย ── ⏳ รอดำเนินการ │  │
│  │  ⏰ 13:00 ── 📞 โทรศัพท์ ── โทรติดตามยอดขาย ── ประสิทธิ์ ── ✅ เสร็จสิ้น      │  │
│  │  ⏰ 14:00 ── 📋 อื่นๆ ── ส่งเอกสารใบเสนอราคา ── วิภา ── ⏳ รอดำเนินการ      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌─ 📈 แนวโน้มการเข้าพบ ─────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                                │
│  │  รายได้ (บาท)                                   ↑ แนวโน้ม: +12.5%                             │
│  │  180,000 ┤              ▄▄                                                                    │
│  │  150,000 ┤        ▄▄   ██  ▄▄                                                                │
│  │  120,000 ┤   ▄▄  ██ ▄▄ ██  ██  ▄▄                                                           │
│  │   90,000 ┤   ██  ██ ██ ██  ██  ██  ▄▄                                                       │
│  │   60,000 ┤ ▄▄ ██  ██ ██ ██  ██  ██  ██                                                     │
│  │   30,000 ┤ ██ ██  ██ ██ ██  ██  ██  ██ ▄▄ ▄▄                                               │
│  │          └─────────────────────────────────────────                                          │
│  │            1   2   3   4   5   8   9  10  11  12  15  16                                      │
│  │                           มิถุนายน 2569                                                       │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌─ 🏗️ โครงการที่กำลังดำเนินการ ──────────────────────────────────────────────────────────────┐  │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ PJ2024-0018  WG-Server-098            🟢 65%  ฿2,500,000  เยี่ยมล่าสุด: 15 มิ.ย. 69  │ │  │
│  │  ├────────────────────────────────────────────────────────────────────────────────────────┤ │  │
│  │  │ PJ2024-0015  อาคารสำนักงานซีดี          🟡 45%  ฿5,000,000  เยี่ยมล่าสุด: 14 มิ.ย. 69  │ │  │
│  │  ├────────────────────────────────────────────────────────────────────────────────────────┤ │  │
│  │  │ PJ2024-0012  ติดตั้งระบบไฟฟ้า           🟢 80%  ฿1,200,000  เยี่ยมล่าสุด: 12 มิ.ย. 69  │ │  │
│  │  └────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                             │  │
│  │  [ดูทั้งหมด 12 โครงการ →]                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌─ 🔄 กิจกรรมล่าสุด ───────────────────────────────────────────────────────────────────────────┐  │
│  │  🔵 วันนี้ 10:30 น. — สมชาย เยี่ยมชมโครงการ WG-Server-098                                  │  │
│  │  🟢 วันนี้ 09:15 น. — วิภา สร้างนัดหมาย ประชุมลูกค้า                                        │  │
│  │  🟣 เมื่อวาน 16:45 น. — ประสิทธิ์ บันทึกรายได้ 150,000 ฿                                   │  │
│  │  🟠 16 มิ.ย. 69 — มานะ อัปเดตโครงการ ติดตั้งระบบไฟฟ้า                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### **Leader View (Desktop 1024px+)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 Dashboard                                    [ทีม: ปลีก(สนญ) ▼]  [📅 มิถุนายน 2569 ▼]  👤 หัวหน้า │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                                  │
│  │  📍 Visits       │  │  👥 Customers    │  │  💰 Revenue      │                                  │
│  │    40 / 55      │  │      32          │  │   ฿850,000      │                                  │
│  │  เสร็จสิ้น 73%   │  │  ลูกค้าที่ใช้งาน   │  │  จากเป้า 1,000,000 │                                  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘                                  │
│                                                                                                     │
│  ┌─ 📅 ตารางนัดหมายวันนี้ — ทีม ปลีก(สนญ) ────────────────────────────────────────────────────┐  │
│  │  ⏰ 09:00 ── 🏢 เยี่ยมสถานที่ ── ประชุมติดตามงาน ── สมชาย ── ⏳                          │  │
│  │  ⏰ 10:30 ── 📞 โทรศัพท์ ── โทรหาลูกค้าใหม่ ── วิภา ── ✅                                │  │
│  │  ⏰ 14:00 ── 📋 อื่นๆ ── ส่งเอกสาร ── ก้องเกียรติ ── ⏳                                  │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌─ 📈 แนวโน้มรายได้ (เปรียบเทียบทีม) ─────────────────────────────────────────────────────────┐  │
│  │                                                                                                │
│  │  รายได้ (พันบาท)                                                                            │  │
│  │  300 ┤                                                                                        │  │
│  │      ┤        ▄▄▄▄▄▄▄▄                                                                         │  │
│  │  200 ┤  ▄▄▄▄▄▄▄▄  ████████  ▄▄▄▄▄▄▄▄                                                          │  │
│  │      ┤  ████████  ████████  ████████  ▄▄▄▄▄▄▄▄                                                │  │
│  │  100 ┤  ████████  ████████  ████████  ████████  ▄▄▄▄▄▄▄▄                                      │  │
│  │      ┤  ████████  ████████  ████████  ████████  ████████                                      │  │
│  │    0 ┤──▀────────▀────────▀────────▀────────▀────────                                          │  │
│  │        สัปดาห์ 1  สัปดาห์ 2  สัปดาห์ 3  สัปดาห์ 4  สัปดาห์ 5                                  │  │
│  │        🔵 ปลีก(สนญ)    🟢 ปลีก(สันกำแพง)    🟣 โครงการ    🟠 ส่งร้านค้า                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌─ 📊 เปรียบเทียบผลงานทีม ───────────────────────────────────────────────────────────────────┐  │
│  │                                                                                                │
│  │  ┌──────────┬─────────┬──────────┬──────────┬──────────┬──────────┬─────────┐                │  │
│  │  │ ทีม      │ เยี่ยม   │ สำเร็จ   │ %       │ รายได้   │ เป้าหมาย │ แต้ม     │                │  │
│  │  ├──────────┼─────────┼──────────┼──────────┼──────────┼──────────┼─────────┤                │  │
│  │  │ 🟣 โครงการ│   42    │   36     │  80%    │ 950,000  │1,200,000 │  82.3 🥇│                │  │
│  │  │ 🔵 ปลีกฯ │   52    │   40     │  73%    │ 850,000  │1,000,000 │  78.5 🥈│                │  │
│  │  │ 🟢 สันกำแพง│  38    │   30     │  75%    │ 620,000  │ 800,000  │  72.1 🥉│                │  │
│  │  │ 🟠 ส่งร้านค้า│  24    │   18     │  60%    │ 430,000  │ 500,000  │  68.9   │                │  │
│  │  └──────────┴─────────┴──────────┴──────────┴──────────┴──────────┴─────────┘                │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌─ ⚠️ สมาชิกที่ต้องปรับปรุง — ปลีก(สนญ) ─────────────────────────────────────────────────────┐  │
│  │                                                                                                │
│  │  ┌──────────┬─────────┬──────────┬──────────┬──────────────┐                                  │  │
│  │  │ พนักงาน  │ เยี่ยม   │ รายได้   │ สำเร็จ % │ สถานะ        │                                  │  │
│  │  ├──────────┼─────────┼──────────┼──────────┼──────────────┤                                  │  │
│  │  │ ก้องเกียรติ│    8    │ 180,000 │   60%   │ 🔴 ต่ำกว่าเป้า│                                  │  │
│  │  │ มานะ     │    6    │ 120,000 │   55%   │ 🔴 ต่ำกว่าเป้า│                                  │  │
│  │  └──────────┴─────────┴──────────┴──────────┴──────────────┘                                  │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### **Manager View (Desktop 1024px+)**

Manager view adds:
- Team selector shows "ทั้งหมด (4 ทีม)" option
- Date range picker with preset ranges (วันนี้, สัปดาห์นี้, เดือนนี้, 3 เดือน, ปรับแต่ง)
- Cross-team KPI comparison cards
- All 4 teams in performance table
- Export report button

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 Dashboard    [ทีม: ทั้งหมด (4 ทีม) ▼]  [📅 มิ.ย. 69 ▼]  👤 ผู้จัดการ  [📥 ส่งออกรายงาน]       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                                  │
│  │  📍 Visits       │  │  👥 Customers    │  │  💰 Revenue      │                                  │
│  │   156 / 180     │  │      89          │  │  ฿2,850,000     │                                  │
│  │  เสร็จสิ้น 87%   │  │  ลูกค้าที่ใช้งาน   │  │  จากเป้า 3,500,000 │                                  │
│  │  (+15% จากเดือนก่อน)│ │  +12 รายใหม่    │  │  📈 81%  (+12.5%)│                                  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘                                  │
│                                                                                                     │
│  [Team Performance Table — same as leader view but all 4 teams + export]                          │
│  [Member Bottom Performers — all teams]                                                            │
│  [Active Projects — all teams filtered]                                                             │
│  [Recent Activity — all teams combined]                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### **Mobile Card Layout (< 768px)**

```
┌─────────────────────────────────────────────┐
│  📊 Dashboard              👤 สมชาย         │
│  [ทีม: ปลีก(สนญ) ▼]     [📅 ▼]             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ 📍 Visits ──────────────────────────┐  │
│  │  40 / 55  เสร็จสิ้น 73%              │  │
│  │  📞 15  🏢 20  📋 5  ⏱ 35 นาที     │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─ 👥 Customers ───────────────────────┐  │
│  │  32 ลูกค้าที่ใช้งาน  +5 รายใหม่       │  │
│  │  ความถี่ 1.63  ครั้ง/ลูกค้า          │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─ 💰 Revenue ─────────────────────────┐  │
│  │  ฿850,000 / ฿1,000,000              │  │
│  │  85%  📈 +12.5%                     │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─ 📅 วันนี้ (16 มิ.ย.) ───────────────┐  │
│  │  ⏰ 09:00 🏢 ประชุมติดตามงาน         │  │
│  │     สมชาย • ⏳ รอดำเนินการ           │  │
│  │  ─────────────────────────────────  │  │
│  │  ⏰ 13:00 📞 โทรติดตามยอดขาย         │  │
│  │     ประสิทธิ์ • ✅ เสร็จสิ้น          │  │
│  │  ─────────────────────────────────  │  │
│  │  ⏰ 14:00 📋 ส่งเอกสารใบเสนอราคา     │  │
│  │     วิภา • ⏳ รอดำเนินการ            │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─ 📈 แนวโน้มรายได้ (7 วัน) ──────────┐  │
│  │  ▄▄▄▄▆▆███▆▆▄▄▆▆██▄▄              │  │
│  │  ↑ +12.5%                           │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─ 🏗️ โครงการ (3) ────────────────────┐  │
│  │  WG-Server-098 🟢 65%               │  │
│  │  อาคารสำนักงานซีดี 🟡 45%           │  │
│  │  ติดตั้งระบบไฟฟ้า 🟢 80%             │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  [ดูเพิ่มเติม ▼]                             │
└─────────────────────────────────────────────┘
```

## 🎯 Interactive Element States

### **1. KPI Card States**

**Normal State:**
```
┌──────────────────┐
│  📍 Visits       │
│    40 / 55      │
│  เสร็จสิ้น 73%   │
│  📞 15 🏢 20 📋 5│
└──────────────────┘
```

**Trend Up:**
```
┌──────────────────┐
│  💰 Revenue      │
│  ฿850,000       │
│  📈 +12.5%      │  ← Green arrow, green text
│  เฉลี่ย 21,250 ฿ │
└──────────────────┘
```

**Trend Down:**
```
┌──────────────────┐
│  💰 Revenue      │
│  ฿430,000       │
│  📉 -8.3%       │  ← Red arrow, red text
│  เฉลี่ย 17,917 ฿ │
└──────────────────┘
```

**Loading State (Skeleton):**
```
┌──────────────────┐
│  ████████        │  ← Gray shimmer animation
│    ██████        │
│  ████████████    │
│  ████ ████ ███   │
└──────────────────┘
```

**Empty State:**
```
┌──────────────────┐
│  📍 Visits       │
│    0 / 0        │
│  ไม่มีข้อมูล     │
│  — — —          │
└──────────────────┘
```

### **2. Appointment Item States**

**Pending:**
```
│  ⏰ 09:00 ── 🏢 เยี่ยมสถานที่ ── ประชุมติดตามงาน ── สมชาย ── ⏳ รอดำเนินการ │
```

**Completed:**
```
│  ⏰ 13:00 ── 📞 โทรศัพท์ ── โทรติดตามยอดขาย ── ประสิทธิ์ ── ✅ เสร็จสิ้น │
```

**Cancelled:**
```
│  ⏰ 15:00 ── 📋 อื่นๆ ── ประชุมเลื่อน ── วิภา ── ❌ ยกเลิก │
```

### **3. Error State**

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ⚠️ เกิดข้อผิดพลาดในการโหลดข้อมูล                │
│                                                  │
│  กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ       │
│                                                  │
│  [🔄 ลองใหม่]                                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### **4. Empty State (No Data)**

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  📭 ยังไม่มีข้อมูลในระยะเวลาที่เลือก              │
│                                                  │
│  ลองปรับช่วงวันที่ หรือเลือกทีมอื่น              │
│                                                  │
└──────────────────────────────────────────────────┘
```

## 🔄 User Interaction Flows

### **Flow 1: Team Filter Change**
```
1. User clicks team selector dropdown
   ↓
2. Dropdown shows team list with member count
   ↓
3. User selects a different team
   ↓
4. Loading skeleton appears on all cards
   ↓
5. API calls re-fetch with new team_id
   ↓
6. All dashboard sections update with team data
   ↓
7. Team color indicator changes in performance table
```

### **Flow 2: Date Range Change**
```
1. User clicks date range picker
   ↓
2. Picker shows preset options + custom range
   ↓
3. User selects preset (e.g., "สัปดาห์นี้")
   ↓
4. Time-series chart re-renders with new range
   ↓
5. KPI cards re-calculate for new period
   ↓
6. Summary stats update with period comparison
```

### **Flow 3: Drill into Member Performance (Leader)**
```
1. Leader sees bottom performers in team view
   ↓
2. Leader clicks on member name
   ↓
3. Dashboard filters to show that member's data
   ↓
4. KPI cards show member-level metrics
   ↓
5. Appointment schedule filters to member's visits
   ↓
6. Leader can click "กลับสู่ภาพรวมทีม" to reset
```

## 📱 Responsive Breakpoints

### **Desktop (1024px+)**:
- Full 3-column KPI card grid
- Side-by-side charts and tables
- Horizontal appointment schedule list
- Sticky header with team/date filters
- All 4 teams visible in performance table

### **Tablet (768-1023px)**:
- 2-column KPI card grid (3rd card wraps)
- Compact chart with scroll
- Stacked layout below charts
- Collapsible sections
- Horizontal scroll for performance table

### **Mobile (<768px)**:
- Single column stacked layout
- Vertical KPI cards
- Horizontal scroll for charts (swipeable)
- Collapsible appointment items
- Bottom navigation for sections
- Reduced data density

## 🎨 Visual Design System

### **Color Palette:**
```css
/* Team Colors */
--team-plieng-sn: #3B82F6;      /* Blue - ปลีก(สนญ) */
--team-plieng-sk: #22C55E;      /* Green - ปลีก(สันกำแพง) */
--team-project: #A855F7;        /* Purple - โครงการ(งานขนาดใหญ่) */
--team-wholesale: #F97316;      /* Orange - ส่งร้านค้า(ค้าช่วง) */

/* Status Colors */
--trend-up: #22C55E;            /* Green - Up trend */
--trend-down: #EF4444;          /* Red - Down trend */
--trend-flat: #6B7280;          /* Gray - Flat trend */

/* Appointment Status */
--appointment-pending: #F59E0B; /* Yellow */
--appointment-completed: #22C55E; /* Green */
--appointment-cancelled: #EF4444; /* Red */
```

### **Typography:**
```css
/* KPI Cards */
.kpi-value { font-size: 32px; font-weight: 700; }
.kpi-label { font-size: 14px; font-weight: 500; color: #6B7280; }
.kpi-trend { font-size: 13px; font-weight: 600; }

/* Appointments */
.appointment-time { font-size: 14px; font-weight: 600; font-family: monospace; }
.appointment-title { font-size: 14px; font-weight: 500; }
.appointment-person { font-size: 13px; color: #6B7280; }

/* Chart Labels */
.chart-axis-label { font-size: 11px; fill: #9CA3AF; }
.chart-legend { font-size: 12px; font-weight: 500; }
```

### **Spacing & Layout:**
```css
.card-gap: 16px;
.kpi-card-padding: 20px;
.section-margin: 24px;
.appointment-item-height: 48px;
.team-table-row-height: 44px;
.mobile-card-padding: 16px;
```

## 🧪 Visual Testing Scenarios

### **Test Cases for Screenshots:**

1. **Dashboard Loaded**: All sections rendered with data
2. **Loading State**: Skeleton shimmer on all cards
3. **Empty State**: No data for selected period
4. **Error State**: API failure with retry button
5. **Team Filtered**: Dashboard showing single team data
6. **Mobile Layout**: Stacked cards on 375px viewport
7. **Leader View**: Team performance + bottom performers visible
8. **Manager View**: All 4 teams + cross-team comparison
9. **Trend Indicators**: Up/down/flat arrows on KPI cards
10. **Appointment States**: Pending, completed, cancelled items

### **Validation Visual States:**
```
📈 Green trend — value increased from previous period
📉 Red trend — value decreased from previous period
➡️ Gray trend — value unchanged from previous period
✅ Green — appointment completed
⏳ Yellow — appointment pending
❌ Red — appointment cancelled
```

## 🔧 Component States Documentation

### **DashboardLayout States:**
- `loading`: Skeleton layout for all sections
- `ready`: All sections rendered with data
- `filtering`: Loading overlay during team/date change
- `error`: Error state with retry option

### **KPICard States:**
- `loading`: Shimmer animation
- `display`: Normal data display
- `trend_up`: Green trend indicator
- `trend_down`: Red trend indicator
- `empty`: Zero/no data state
- `error`: Failed to load metric

### **AppointmentSchedule States:**
- `loading`: Skeleton list items
- `loaded`: List of appointments
- `empty`: "ไม่มีการนัดหมายวันนี้" message
- `error`: Failed to load schedule

### **TimeSeriesChart States:**
- `loading`: Chart skeleton placeholder
- `rendered`: Interactive chart with data
- `empty`: "ไม่มีข้อมูลในช่วงเวลานี้"
- `error`: Failed to load chart data

### **TeamPerformanceTable States:**
- `loading`: Skeleton table rows
- `loaded`: 4 team rows with rankings
- `empty`: No team data available

---

**UI Specification Version**: 1.0  
**Last Updated**: June 2, 2026  
**Designer**: Frontend Development Team  
**Review Status**: Ready for Implementation
