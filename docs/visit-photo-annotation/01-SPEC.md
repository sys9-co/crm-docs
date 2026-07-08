# Visit Photo Annotation — Project Spec

**Feature:** visit-photo-annotation  
**Version:** 1.1 (MVP — updated)  
**BA/SA Author:** ทิพย์ (Claude BA/SA agent)  
**Date:** 8 กรกฎาคม 2569  
**Status:** DRAFT — รอ PM อนุมัติ

---

## 1. ภาพรวม Feature

ปัจจุบัน OSR (Outdoor Sales Rep) สามารถถ่ายรูปแนบใน visit record ได้แล้ว แต่รูปเป็นภาพดิบจากกล้อง ไม่มีการ annotate

Feature นี้เพิ่ม **Photo Annotation Editor** เป็น step ระหว่าง "เลือก/ถ่ายรูป" กับ "upload" ให้ OSR สามารถ:
1. วาด **วงกลม (circle)** และ **สี่เหลี่ยม (rectangle)** บนรูป พร้อมใส่ caption เช่น `#ออกเยี่ยม`, `#Mr.Tom`
2. แปะ **Timestamp overlay** อัตโนมัติ (toggle checkbox)
3. แปะ **Location overlay** (ตำบล/อำเภอ จาก GPS) (toggle checkbox)
4. รองรับทั้งรูปจาก **กล้อง (capture)** และ **album/gallery**
5. Export เป็น annotated image (JPEG base64) แล้ว upload ผ่าน endpoint เดิม

**Architecture:** Pure frontend — HTML5 Canvas overlay บนรูปต้นฉบับ → render overlays → export JPEG → POST ผ่าน existing API ที่รองรับ `caption` + `image_base64` อยู่แล้ว ไม่ต้องเพิ่ม backend endpoint ใหม่

---

## 2. User Stories

### US-01: วาด shape บนรูปก่อน upload

**As** OSR ที่ถ่ายรูปหน้างาน  
**I want** วาด circle หรือ rectangle บนรูปพร้อมใส่ caption  
**So that** ทีมและหัวหน้าเห็นจุดสำคัญในรูปได้ทันที โดยไม่ต้องดูในบริบทอื่น

**Acceptance Criteria:**

**AC-01.1 — เปิด Annotation Editor**
```
Given: OSR อยู่ใน visit create หรือ edit page (section "รูปภาพหน้างาน")
  And: OSR เลือกรูปจาก gallery หรือถ่ายจากกล้อง
When: รูปผ่าน compress แล้ว
Then: ระบบแสดง Annotation Editor overlay/modal โดยอัตโนมัติ
  And: รูปถูก render บน Canvas ขนาด full-width (max 800px)
  And: มีปุ่ม toolbar: [Circle] [Rectangle] [Undo] [ยืนยัน] [ยกเลิก]
  And: มี overlay option panel (checkboxes):
       ☐ แสดงวันที่/เวลา (timestamp)
       ☐ แสดงตำบล/อำเภอ (location)
  And: ถ้า overlay ใดถูก check → render ทันทีบน canvas preview ที่มุมล่างซ้าย
```

**AC-01.2 — วาด Circle**
```
Given: OSR อยู่ใน Annotation Editor และเลือก tool "Circle"
When: OSR drag บน canvas (pointerdown → pointermove → pointerup)
Then: วาด ellipse outline สีแดง (#EF4444) stroke-width 3px บน canvas
  And: แสดง text input popup ให้กรอก caption (placeholder: "#label...")
  And: กด Enter หรือ blur → caption แสดงอยู่เหนือ shape (font 14px white, shadow สีดำ)
  And: shape+caption ถูก save ไว้ใน annotation state (array ของ AnnotationShape)
```

**AC-01.3 — วาด Rectangle**
```
Given: OSR อยู่ใน Annotation Editor และเลือก tool "Rectangle"
When: OSR drag บน canvas
Then: วาด rectangle outline สีน้ำเงิน (#3B82F6) stroke-width 3px
  And: แสดง text input popup สำหรับ caption เหมือน AC-01.2
  And: shape+caption ถูก save ไว้ใน annotation state
```

**AC-01.4 — Undo**
```
Given: OSR วาด shape ไปแล้วอย่างน้อย 1 shape
When: OSR กดปุ่ม [Undo]
Then: shape ล่าสุดถูกลบออกจาก annotation state
  And: Canvas re-render ใหม่โดยไม่มี shape นั้น
  And: ถ้า shape = 0 → ปุ่ม Undo disabled
```

**AC-01.5 — ยืนยัน (Confirm)**
```
Given: OSR วาด shape เสร็จ (มี 0 หรือมากกว่า shape ก็ได้)
When: OSR กดปุ่ม [ยืนยัน]
Then: Canvas export เป็น JPEG base64 (quality 0.85)
  And: annotated dataUrl แทนที่ original dataUrl ใน previewImages array
  And: Editor ปิด และแสดง thumbnail ของรูป annotated ใน preview grid
  And: caption รวมของทุก shape (join ด้วย space) ถูก save เป็น annotationCaption
  And: เมื่อ submit visit → POST payload ใช้ annotated image_base64 + annotationCaption เป็น caption field
```

**AC-01.6 — ยกเลิก (Cancel)**
```
Given: OSR อยู่ใน Annotation Editor
When: OSR กดปุ่ม [ยกเลิก]
Then: Editor ปิด
  And: รูปต้นฉบับ (compressed) ถูก discard ไม่เข้า previewImages
  And: ไม่มี shape หรือ annotation ใดถูกบันทึก
```

---

### US-04: แปะ Timestamp Overlay บนรูป

**As** OSR ที่ถ่ายรูปหน้างาน  
**I want** แปะวันที่และเวลาลงบนรูปอัตโนมัติ  
**So that** รูปมีหลักฐานเวลาถ่ายชัดเจน ไม่ต้องเขียนเอง

**Acceptance Criteria:**

**AC-04.1 — Toggle timestamp overlay**
```
Given: OSR อยู่ใน Annotation Editor
When: OSR check ☑ "แสดงวันที่/เวลา"
Then: Canvas re-render ทันที โดยมี timestamp overlay ที่มุมล่างซ้าย
  Format: "DD/MM/YYYY HH:mm" (เช่น "08/07/2569 10:30")
  Style: พื้นหลังดำ opacity 60%, ตัวอักษรสีขาว, font 13px, padding 4px 8px
  And: เมื่อ uncheck → overlay หายไปจาก canvas (re-render)
```

**AC-04.2 — Timestamp source**
```
Given: OSR เลือกรูปจากกล้อง (capture)
Then: timestamp = เวลาที่ถ่าย (new Date() ณ ตอน capturePhoto())

Given: OSR เลือกรูปจาก album/gallery
Then: timestamp = file.lastModified (วันที่ไฟล์รูป) ถ้ามี
  If file.lastModified = 0 หรือไม่น่าเชื่อถือ → ใช้ new Date() แทน
```

**AC-04.3 — Export พร้อม timestamp**
```
Given: OSR check ☑ timestamp แล้วกด [ยืนยัน]
Then: JPEG ที่ export มี timestamp baked เข้าไปในรูป (ไม่ใช่ metadata)
```

---

### US-05: แปะ Location Overlay (ตำบล/อำเภอ) บนรูป

**As** OSR ที่ถ่ายรูปหน้างาน  
**I want** แปะ ตำบล/อำเภอ จาก GPS บนรูปอัตโนมัติ  
**So that** รูปมีหลักฐานสถานที่ชัดเจน

**Acceptance Criteria:**

**AC-05.1 — Toggle location overlay**
```
Given: OSR อยู่ใน Annotation Editor
When: OSR check ☑ "แสดงตำบล/อำเภอ"
Then: ระบบเรียก navigator.geolocation.getCurrentPosition() (ถ้ายังไม่มี coords)
  And: เมื่อได้ coords → reverse geocode → แสดง "ตำบล X อำเภอ Y" บน canvas
  And: overlay position: มุมล่างซ้าย (ใต้ timestamp ถ้า check ทั้งคู่)
  Style: เดียวกับ timestamp overlay (พื้นดำ opacity 60%, ขาว, 13px)
```

**AC-05.2 — Reverse Geocode**
```
Given: มี GPS coordinates (lat, lng)
Then: เรียก OpenStreetMap Nominatim API:
  GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json&accept-language=th
  Extract: address.suburb หรือ address.village (ตำบล) + address.city_district หรือ address.county (อำเภอ)
  Display: "ต.{suburb} อ.{county}" เช่น "ต.ช้างเผือก อ.เมืองเชียงใหม่"
```

**AC-05.3 — ไม่มี GPS permission**
```
Given: OSR deny GPS permission หรือ geolocation unavailable
Then: แสดง text "ไม่พบตำแหน่ง" บน overlay แทน
  And: overlay ยังคงแสดงอยู่บน canvas (ไม่ uncheck อัตโนมัติ)
```

**AC-05.4 — Album photo**
```
Given: OSR เลือกรูปจาก album และ check ☑ location
Then: ใช้ GPS ปัจจุบันของอุปกรณ์ (getCurrentPosition()) ไม่ใช่ EXIF ของรูป
  หมายเหตุ: ตำแหน่งที่แสดงคือตำแหน่ง ณ ตอนเปิด editor ไม่ใช่ตอนถ่ายรูป
```

**AC-05.5 — Loading state**
```
Given: OSR check ☑ location แต่ reverse geocode ยังไม่สำเร็จ
Then: แสดง "กำลังค้นหาตำแหน่ง..." บน overlay ระหว่างรอ
  And: เมื่อได้ข้อมูล → update canvas
```

---

### US-02: Upload annotated image เข้า visit

**As** OSR ที่ annotate รูปเสร็จแล้ว  
**I want** บันทึก annotated image เข้า visit record  
**So that** ทีมที่ดู visit detail เห็นรูปพร้อม annotation ได้ทันที

**Acceptance Criteria:**

**AC-02.1 — Upload สำเร็จ**
```
Given: OSR กด [ยืนยัน] ใน Annotation Editor แล้ว มี annotated image ใน previewImages
When: OSR บันทึก visit
Then: ระบบ POST annotated image_base64 ไปที่
      POST /crm/{api_version}/visits/{visitId}/photos
      body: { image_base64: <annotated JPEG base64>, caption: <annotationCaption>, taken_at, taken_lat, taken_lng }
  And: แสดง toast "อัปโหลดรูปสำเร็จ" แต่ละรูป
  And: เมื่อ navigate ไป visit detail → รูป annotated แสดงใน photo grid
```

**AC-02.2 — ข้าม Annotation (ไม่วาด shape)**
```
Given: OSR เลือกรูปแต่กด [ยืนยัน] ทันทีโดยไม่วาด shape ใด
When: ยืนยัน
Then: รูปต้นฉบับ (compressed, no annotation) ถูก upload เหมือน behavior ปัจจุบัน
  And: caption = visit title + index (behavior เดิม)
```

---

### US-03: Re-annotate ก่อน submit (create flow)

**As** OSR ที่ยังไม่ได้ submit visit  
**I want** เปิด editor ซ้ำเพื่อแก้ไข annotation บน thumbnail ที่เห็นใน preview grid  
**So that** แก้ไข annotation ก่อน upload จริง

**Acceptance Criteria:**

**AC-03.1 — Re-annotate**
```
Given: มี annotated thumbnail ใน preview grid ของ create page
When: OSR click thumbnail
Then: เปิด Annotation Editor ด้วยรูปต้นฉบับ (compressed ก่อน annotate) พร้อม annotation state เดิม
  And: OSR สามารถเพิ่ม/Undo shape ได้
  And: กด [ยืนยัน] → overwrite annotated image ใน previewImages
```

---

## 3. Scope

### MVP (sprint นี้)
- Tool: Circle และ Rectangle เท่านั้น
- Caption: text input (free text, max 50 chars ต่อ shape)
- Color: Circle = สีแดง (#EF4444), Rectangle = สีน้ำเงิน (#3B82F6) — fixed
- Stroke: 3px — fixed
- Undo: undo ทีละ shape (ไม่มี redo)
- **Timestamp overlay:** checkbox toggle, format DD/MM/YYYY HH:mm, มุมล่างซ้าย
- **Location overlay:** checkbox toggle, reverse geocode via Nominatim (ภาษาไทย), มุมล่างซ้ายใต้ timestamp
- **Album/Gallery:** editor เปิดได้ทั้ง `<input type="file">` (gallery) และ `getUserMedia` (camera)
- Platform: Desktop + Mobile browser (pointer events API)
- Integration: `edit-v2.vue` + `create.vue` + `create-v2.vue`
- Output: JPEG base64 (quality 0.85) ส่ง API เดิม ไม่เพิ่ม endpoint ใหม่
- Reverse geocode: Nominatim OpenStreetMap (free, ไม่ต้อง API key)

### Out of Scope (MVP)
- AI/ML auto-tagging
- Color picker / stroke width selector
- Free-hand drawing (pencil tool)
- Arrow / line tool
- Multiple fonts / font size selector
- Redo
- Annotation metadata แยก field ใน backend
- Edit annotation หลัง upload (ต้องลบรูปแล้ว re-upload)
- Collaborative annotation

---

## 4. API Touchpoints (Existing)

| Action | Method | Endpoint | ไฟล์ที่ใช้ |
|--------|--------|----------|-----------|
| Upload photo | `POST` | `/crm/{v}/visits/{id}/photos` | create.vue:1492, edit-v2.vue:829 |
| List photos | `GET` | `/crm/{v}/visits/{id}/photos?page=1&size=100` | index.vue:709, edit-v2.vue:1087 |
| Delete photo | `DELETE` | `/crm/{v}/visit-photos/{photoId}` | index.vue:650, edit-v2.vue:974 |

**Upload Payload:**
```json
{
  "image_base64": "data:image/jpeg;base64,...",
  "caption": "#ออกเยี่ยม #Mr.Tom",
  "taken_at": "2026-07-08T10:30:00.000Z",
  "taken_lat": 18.816280,
  "taken_lng": 98.997536
}
```

---

## 5. Data Model (Frontend TypeScript)

```typescript
interface AnnotationShape {
  type: 'circle' | 'rectangle'
  x: number        // canvas coordinate (px)
  y: number
  w: number        // width (rect) หรือ radiusX (circle)
  h: number        // height (rect) หรือ radiusY (circle)
  caption: string  // max 50 chars
  color: string    // '#EF4444' | '#3B82F6'
}

interface OverlayOptions {
  showTimestamp: boolean   // checkbox: แสดงวันที่/เวลา
  showLocation: boolean    // checkbox: แสดงตำบล/อำเภอ
  timestamp: string        // "08/07/2569 10:30" — set เมื่อเปิด editor
  locationText: string     // "ต.ช้างเผือก อ.เมืองเชียงใหม่" — set หลัง reverse geocode
  locationLoading: boolean // true ระหว่าง geocoding
  lat: number | null
  lng: number | null
}

interface AnnotatedPreviewImage {
  file: File | null
  preview: string           // annotated dataUrl (thumbnail)
  dataUrl: string           // annotated dataUrl (ส่ง API)
  originalDataUrl: string   // compressed original (สำหรับ re-annotate)
  annotationCaption: string // caption รวม จาก shapes
  annotations: AnnotationShape[]
  overlayOptions: OverlayOptions  // state ของ overlay checkboxes
}
```

### Component ใหม่ที่ต้องสร้าง

| Component | Path |
|-----------|------|
| `VisitPhotoAnnotationEditor.vue` | `ui/components/VisitPhotoAnnotationEditor.vue` |

### Pages ที่ต้อง integrate

| Page | Integration Point |
|------|-------------------|
| `create.vue` | `onSelectImages()` — หลัง compress เปิด AnnotationEditor |
| `create-v2.vue` | `onSelectImages()` + `capturePhoto()` — หลัง compress |
| `edit-v2.vue` | `onSelectImages()` + `capturePhoto()` — `uploadVisitPhotoBase64()` ส่ง annotated dataUrl |

---

## 6. Edge Cases

| Case | พฤติกรรม |
|------|----------|
| รูปขนาดใหญ่ | compress ก่อน (maxDimension=1200, quality=0.6) แล้วค่อยเปิด editor |
| drag น้อยกว่า 10px | discard shape (minimum size: 10px) |
| Caption ว่าง | shape วาดได้ ไม่แสดง text บน canvas |
| Caption เกิน 50 chars | truncate + แสดง char count |
| Mobile touch | pointer events รองรับ mouse + touch |
| Offline / network error | toast error แต่ annotated dataUrl ยังอยู่ใน previewImages |
| Canvas context unavailable | toast warning + skip editor, upload compressed original |
| Re-annotate หลัง confirm | เปิด editor พร้อม originalDataUrl + restore annotations state + overlay options |
| **Album photo timestamp** | ใช้ `file.lastModified`; ถ้าเป็น 0 หรือ invalid → `new Date()` |
| **GPS permission denied** | location overlay แสดง "ไม่พบตำแหน่ง" — ไม่ uncheck อัตโนมัติ |
| **Nominatim timeout/error** | แสดง "ไม่พบตำแหน่ง" — ไม่ retry อัตโนมัติ |
| **Nominatim rate limit** | 1 request/sec — debounce 1 วินาทีหากเปิด editor หลายครั้งรัวๆ |
| **ทั้ง timestamp + location check** | วาง location ใต้ timestamp (stacked มุมล่างซ้าย) |
| **Re-annotate + overlay** | restore overlay state เดิม (showTimestamp, showLocation) พร้อม timestamp/locationText ที่บันทึกไว้ |

---

## 7. Business Logic Rules

- **BL-01:** Annotation เป็น optional — ยืนยันโดยไม่วาด shape ได้
- **BL-02:** Annotated image = flat JPEG — ทั้ง shape, timestamp, location bake เข้ารูป
- **BL-03:** caption = labels ทุก shape (space-separated); ถ้าไม่มี label → ใช้ default caption เดิม (timestamp/location ไม่เพิ่มเข้า caption field)
- **BL-04:** รูปต้นฉบับไม่ถูก upload — upload เฉพาะ annotated version
- **BL-05:** ลบรูปใน detail view → DELETE เดิม (ลบทั้งรูป ไม่มี "ลบแค่ annotation")
- **BL-06:** Canvas size = ขนาดรูป compressed จริง (ไม่ scale down เพิ่ม)
- **BL-07:** Timestamp format ใช้ พ.ศ. (Buddhist Era) เช่น 2569, ไม่ใช่ ค.ศ.
- **BL-08:** Overlay render ลำดับ: รูป → shapes → timestamp → location (location อยู่ล่างสุด)
- **BL-09:** Nominatim API ต้องส่ง User-Agent header ที่ระบุ app name (policy ของ OSM)
- **BL-10:** Album photo: editor trigger ได้เช่นเดียวกับ camera — ไม่มี flow แยก

---

## 8. Test Specification

### E2E Tests (Playwright)

| Test ID | Scenario | Route |
|---------|----------|-------|
| E2E-ANN-01 | เลือกรูป (camera) → editor เปิด → วาด circle + caption → ยืนยัน → thumbnail annotated | `/appointment/visit/create` |
| E2E-ANN-02 | วาด rectangle + caption → submit visit → detail แสดงรูป annotated | `/appointment/visit/create` |
| E2E-ANN-03 | Undo shape → shape หายจาก canvas | `/appointment/visit/create` |
| E2E-ANN-04 | Cancel → ไม่มีรูปใน previewImages | `/appointment/visit/create` |
| E2E-ANN-05 | ยืนยันโดยไม่วาด shape → upload compressed ปกติ | `/appointment/visit/create` |
| E2E-ANN-06 | Edit visit → เพิ่มรูป annotated → photo grid มีรูปใหม่ | `/appointment/visit/{id}/edit-v2` |
| E2E-ANN-07 | Mobile touch drag บน canvas viewport 375px | `/appointment/visit/create-v2` |
| E2E-ANN-08 | **เลือกรูปจาก album** → editor เปิด → ยืนยัน → upload สำเร็จ | `/appointment/visit/create` |
| E2E-ANN-09 | **Check ☑ timestamp** → canvas แสดง overlay วันที่/เวลามุมล่างซ้าย → ยืนยัน → thumbnail มี timestamp | `/appointment/visit/create` |
| E2E-ANN-10 | **Uncheck timestamp** → overlay หายจาก canvas | `/appointment/visit/create` |
| E2E-ANN-11 | **Check ☑ location** → canvas แสดง "ต.X อ.Y" (หรือ "กำลังค้นหา...") → ยืนยัน → thumbnail มี location | `/appointment/visit/create` |
| E2E-ANN-12 | **Check ทั้งสอง** → timestamp + location stacked มุมล่างซ้าย | `/appointment/visit/create` |
| E2E-ANN-13 | **Re-annotate**: click thumbnail → editor เปิดพร้อม overlay state เดิม | `/appointment/visit/create` |

---

## 9. Open Questions

| OQ | คำถาม | Impact |
|----|--------|--------|
| OQ-01 | Backend response ของ `POST /visits/{id}/photos` คืน object schema อะไร? | Medium |
| OQ-02 | `caption` field มี max length ไหม? | Low |
| OQ-03 | Detail page ต้องการแสดง caption ของ annotation อย่างไร? (overlay text บนรูป หรือ alt text?) | Medium |
| OQ-04 | Re-annotate หลัง upload: delete + re-upload หรือต้องการ PUT endpoint? | High |
| OQ-05 | OSR ต้องการเลือก color ของ shape ได้ไหม? | Low |
| OQ-06 | Annotation Editor: Modal overlay หรือ Full-screen page? | High (กระทบ Designer) |
| OQ-07 | Timestamp format: ใช้ พ.ศ. (2569) หรือ ค.ศ. (2026)? | Low |
| OQ-08 | Location: ถ้า Nominatim return ภาษาอังกฤษ (ไม่มีชื่อไทย) → แสดงภาษาอังกฤษหรือ fallback เป็น lat/lng? | Medium |
| OQ-09 | Album photo timestamp: ใช้ `file.lastModified` หรือ `new Date()` เสมอ? | Low |

---

## 10. Proposed Plane Cards

- 1 FEATURE card: `[FEATURE] Visit Photo Annotation`
- TASK: `[TASK] Design: VisitPhotoAnnotationEditor UI mockup`
- TASK: `[TASK] Coder: Component VisitPhotoAnnotationEditor.vue`
- TASK: `[TASK] Coder: Integrate editor ใน create.vue, create-v2.vue, edit-v2.vue`
- TASK: `[TASK] Coder: Unit tests AnnotationShape + caption logic`
- TASK: `[TASK] QA: E2E tests E2E-ANN-01 ถึง E2E-ANN-07`
