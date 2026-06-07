# ปฏิทินการเยี่ยมหน้างาน — Calendar + Visits Integration

## 🎯 ภาพรวม

ระบบ CRM มี 2 entity ที่เกี่ยวข้องกับการนัดหมายและเยี่ยมหน้างาน:
- **Appointment** (การนัดหมาย) — `planned` เสมอ, มี type `call/onsite/other`
- **Visit** (การเยี่ยมจริง) — มี status `draft/planned/in_progress/done/cancelled`

**ปัญหาปัจจุบัน:** หน้า `/appointment` แสดงเฉพาะ Appointment อย่างเดียว ทำให้ทีมขาย看不到ภาพรวมของ Visits ที่เกิดขึ้นจริง

**เป้าหมาย:** ปรับ Calendar Page ให้แสดงทั้ง Appointments และ Visits ในมุมมองเดียวกัน พร้อมแยกแยะด้วย visual indicators

## 🔗 ความสัมพันธ์ Appointment → Visit

```
Appointment (นัดหมาย)
├── type: call    → creates Call visit (draft)
├── type: onsite  → creates Onsite visit (draft)  
└── type: other   → creates other visit (draft)

Visit (การเยี่ยมจริง)
├── status: draft        → แบบร่าง
├── status: planned      → วางแผนแล้ว (scheduled)
├── status: in_progress  → กำลังดำเนินการ (check-in แล้ว)
├── status: done         → เสร็จสิ้น (check-out แล้ว)
└── status: cancelled    → ยกเลิก
```

## 📊 ข้อมูลที่เกี่ยวข้อง

### Calendar Event Data Model (Frontend)

```typescript
{
  id: number,
  source: 'appointment' | 'visit',        // ← KEY: ระบุที่มา
  title: string,
  date: string,                            // YYYY-MM-DD
  time: string,                            // "HH:mm - HH:mm"
  type: 'call' | 'onsite' | 'other',      // appointment type (ถ้า source=appointment)
  visit_status: 'draft' | 'planned' | 'in_progress' | 'done' | 'cancelled', // visit status (ถ้า source=visit)
  color: string,                           // hex color
  place: string,                           // location
  notes: string,                           // description
  data: object,                            // raw API response object
  appointment_id?: number,                 // ถ้า visit มี appointment_id
  team_name?: string,                      // ทีมที่ดูแล
  contact_name?: string,                   // ผู้ติดต่อ
  project_name?: string,                   // โครงการ
}
```

### Color Scheme

| Source | Condition | Color | Hex |
|--------|-----------|-------|-----|
| Appointment | type=call | Blue | `#3B82F6` |
| Appointment | type=onsite | Green | `#22C55E` |
| Appointment | type=other | Purple | `#A855F7` |
| Visit | status=draft | Gray | `#9CA3AF` |
| Visit | status=planned | Blue | `#2563EB` |
| Visit | status=in_progress | Orange | `#F97316` |
| Visit | status=done | Green | `#16A34A` |
| Visit | status=cancelled | Red | `#EF4444` |

## 📐 UI Layout

```
┌─────────────────────────────────────────────────────┐
│  ปฏิทินการเยี่ยมหน้างาน                              │
│                                                     │
│  [< มกราคม 2569 >]    [ทั้งหมด ▼] [นัดหมาย] [เยี่ยม] │
│                                                     │
│  จ. อ. พ. พฤ. ศ. ส. อาทิตย์                        │
│ ┌─────────────────────────────────────────────────┐ │
│ │  1    2    3    4    5    6    7                │ │
│ │                  ● นัด: โทรฯ 14:00             │ │
│ │                  ● เยี่ยม: ไซต์งาน 🟡 กำลังทำ  │ │
│ │  8    9   10   11   12   13   14               │ │
│ │  ● นัด: ประชุม 10:00                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│  Day View (คลิกวัน):                                │
│  ┌─────────────────────────────────────────────┐   │
│  │ 14:00 ● 📞 นัดหมาย: สายด่วนลูกค้า           │   │
│  │        🏷️ นัดหมาย · โทรศัพท์               │   │
│  ├─────────────────────────────────────────────┤   │
│  │ 15:30 ● 🟠 เยี่ยมหน้างาน: โครงการ ABC      │   │
│  │        🏷️ กำลังดำเนินการ · ไซต์งาน          │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 🔄 User Flow

1. User เปิด `/appointment`
2. Calendar โหลดทั้ง appointments + visits ในช่วงวันที่ที่เลือก
3. User สามารถกรองด้วย toggle:
   - `ทั้งหมด` — แสดงทั้ง appointment และ visit
   - `นัดหมาย` — เฉพาะ appointment
   - `เยี่ยมจริง` — เฉพาะ visit
4. คลิก event:
   - **Appointment** → เปิด `AppointmentForm` modal (เหมือนเดิม)
   - **Visit** → เปิด หรือ navigate ไป `/appointment/visit/{visit_id}`

## 📄 ไฟล์ที่ต้องแก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `ui/pages/appointment/index.vue` | เพิ่ม API call visits, merge events, filter toggle, visual differentiation |
| `ui/pages/appointment/index.vue` | ปรับ `AppointmentCard.vue` ให้รองรับ visit event |
| `ui/components/AppointmentCard.vue` | แสดง status badge + source badge |
| `ui/components/saller/SallerDetailView.vue` | เปิดคอมเมนต์ปฏิทินทีม เชื่อม API จริง |

## 📐 Backend Requirements

### 1. GET /crm/{v}/visits — รองรับ date range filter

```http
GET /crm/{v}/visits?from=2026-06-01&to=2026-06-30&team_id=5&page=1&size=1000
```

**Response:**
```json
{
  "status": true,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "เยี่ยมโครงการ ABC",
      "visit_type": "onsite",
      "status": "in_progress",
      "date": "2026-06-07",
      "starts_at": "2026-06-07T15:30:00Z",
      "ends_at": "2026-06-07T17:00:00Z",
      "description": "ตรวจความคืบหน้า",
      "appointment_id": 5,
      "project_id": 123,
      "project_name": "โครงการ ABC",
      "contact_name": "คุณสมชาย",
      "team_id": 5,
      "team_name": "ทีมขายกรุงเทพ",
      "address_text": "กรุงเทพฯ"
    }
  ]
}
```

### 2. GET /crm/{v}/appointments — รองรับ team_id filter (optional)

```http
GET /crm/{v}/appointments?from=2026-06-01&to=2026-06-30&team_id=5&page=1&size=1000
```

(Already exists — team_id filter may need adding)

### 3. GET /crm/{v}/visits?team_id={id}&from=&to= (สำหรับ Team Calendar)

Used by SallerDetailView team calendar section.

---

> **Note:** Frontend สามารถเริ่มได้ทันทีโดยใช้ API ที่มีอยู่แล้ว — `appointments` และ `visits` endpoints ปัจจุบันรองรับ date range filter อยู่แล้ว
