# Visit Photo Annotation — API Specification

**Feature:** visit-photo-annotation  
**Version:** 1.1  
**BA/SA Author:** ทิพย์ (Claude BA/SA agent)  
**Date:** 8 กรกฎาคม 2569  
**Status:** DRAFT

---

## 1. สรุป

| Phase | Scope | Backend งาน |
|-------|-------|-------------|
| **MVP (ปัจจุบัน)** | Frontend annotation + overlay | ไม่ต้องแก้ — ใช้ endpoint เดิม |
| **Phase 2 (search)** | ค้นหารูปด้วย caption / location | เพิ่ม `location_name` column + index + search endpoint |

**MVP:** feature เป็น pure frontend — annotate บน Canvas แล้ว upload ผ่าน endpoint เดิมที่มี `caption` + `taken_lat/lng` อยู่แล้ว

**Phase 2 (backend):** เพิ่ม `location_name` field ใน payload + DB column + search API เพื่อให้ค้นหาและ filter รูปได้ในอนาคต

---

## 2. Base URL & Auth

```
Base URL: /crm/{api_version}/...
Authorization: Bearer {accessToken}
X-Merchant-UID: {merchantUUID}
Content-Type: application/json
```

---

## 3. Endpoints ที่ Feature นี้ใช้

### 3.1 Upload Annotated Photo

```http
POST /crm/{api_version}/visits/{visitId}/photos
```

**Request Body:**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
  "caption": "#ออกเยี่ยม #Mr.Tom",
  "taken_at": "2026-07-08T10:30:00.000Z",
  "taken_lat": 18.816280,
  "taken_lng": 98.997536,
  "location_name": "อ.อำเภอเมืองเชียงใหม่"
}
```

| Field | Type | Required | Phase | คำอธิบาย |
|-------|------|----------|-------|-----------|
| `image_base64` | string | Yes | MVP | JPEG base64 ของ annotated image (data URI) |
| `caption` | string | No | MVP | Labels ทุก shape ต่อกัน (space-separated) เช่น `"#ออกเยี่ยม #Mr.Tom"` |
| `taken_at` | string (ISO 8601) | Yes | MVP | เวลา capture รูป (UTC) |
| `taken_lat` | number\|null | No | MVP | GPS latitude |
| `taken_lng` | number\|null | No | MVP | GPS longitude |
| `location_name` | string\|null | No | **Phase 2** | ชื่อสถานที่จาก reverse geocode เช่น `"อ.อำเภอเมืองเชียงใหม่"` — frontend ส่งมาจาก Nominatim result |

> **หมายเหตุ `location_name`:** frontend ได้ข้อมูลนี้อยู่แล้วจาก Nominatim (overlay checkbox) — เพียงแค่เพิ่มส่งใน payload backend ต้องเพิ่ม column รับและ index สำหรับ search

**Response Success (200):**
```json
{
  "status": true,
  "message": "อัปโหลดรูปภาพสำเร็จ",
  "data": {
    "id": 1234,
    "visit_id": 567,
    "image_url": "https://cdn.example.com/visits/567/photos/1234.jpg",
    "caption": "#ออกเยี่ยม #Mr.Tom",
    "taken_at": "2026-07-08T10:30:00.000Z",
    "taken_lat": 18.816280,
    "taken_lng": 98.997536,
    "location_name": "อ.อำเภอเมืองเชียงใหม่"
  }
}
```

**ใช้งานในไฟล์ปัจจุบัน:**
- `ui/pages/appointment/visit/create.vue` บรรทัด 1492
- `ui/pages/appointment/visit/create-v2.vue` บรรทัด 1185
- `ui/pages/appointment/visit/[id]/edit-v2.vue` — `uploadVisitPhotoBase64()` บรรทัด 829

---

### 3.2 Get Photo List

```http
GET /crm/{api_version}/visits/{visitId}/photos?page=1&size=100
```

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1234,
      "image_url": "https://...",
      "caption": "#ออกเยี่ยม #Mr.Tom",
      "taken_at": "2026-07-08T10:30:00.000Z",
      "taken_lat": 18.816280,
      "taken_lng": 98.997536,
      "location_name": "อ.อำเภอเมืองเชียงใหม่"
    }
  ]
}
```

---

### 3.3 Delete Photo

```http
DELETE /crm/{api_version}/visit-photos/{photoId}
```

---

## 4. Caption Convention

```
caption = [shape_label_1] [shape_label_2] ... [shape_label_n]
```

ตัวอย่าง:
- 1 shape มี caption: `"#ออกเยี่ยม"`
- 3 shapes มี caption: `"#ออกเยี่ยม #Mr.Tom #ฐานรากแตก"`
- ทุก shape ไม่มี caption: ใช้ default → `"visitTitle-0"` (behavior เดิม)
- ไม่มี shape เลย: ใช้ default เช่นเดิม

**Per-shape caption:** max 50 characters (frontend validation)  
**Total caption:** ไม่มี explicit limit ใน MVP — รอยืนยัน backend (OQ-02)

---

## 5. Frontend Data Flow

```
[User selects/captures image]
        ↓
compressImageToDataUrl(file)          ← Canvas API (existing code)
        ↓ compressed dataUrl
        ↓
[VisitPhotoAnnotationEditor opens]    ← NEW component
  user draws shapes + captions
  user clicks [ยืนยัน]
        ↓
canvas.toDataURL('image/jpeg', 0.85)  ← annotated JPEG base64
        ↓
previewImages.push({
  dataUrl: annotatedDataUrl,
  originalDataUrl: compressedDataUrl,
  annotationCaption: "#ออกเยี่ยม #Mr.Tom",
  annotations: [...]
})
        ↓
[User saves visit]
        ↓
POST /crm/{v}/visits/{id}/photos
body: {
  image_base64: annotatedDataUrl,
  caption: annotationCaption,
  taken_at, taken_lat, taken_lng,
  location_name: overlay.locationText || null   ← เพิ่มตั้งแต่ MVP
}
```

---

## 6. Endpoint Summary

### MVP (ใช้ของเดิม ไม่ต้องเพิ่ม)

| Action | Endpoint | Status |
|--------|----------|--------|
| Upload annotated photo | `POST /visits/{id}/photos` | ✅ Existing |
| List photos | `GET /visits/{id}/photos` | ✅ Existing |
| Delete photo | `DELETE /visit-photos/{id}` | ✅ Existing |

### Phase 2 — Backend งานที่ต้องเพิ่ม

#### 6.1 DB Schema เพิ่ม (backend task)

```sql
ALTER TABLE visit_photos
  ADD COLUMN location_name VARCHAR(255) NULL,
  ADD INDEX idx_caption (caption(100)),
  ADD INDEX idx_location_name (location_name(100)),
  ADD INDEX idx_geo (taken_lat, taken_lng);
```

#### 6.2 Search Visit Photos (endpoint ใหม่)

```http
GET /crm/{api_version}/visit-photos/search
```

**Query Parameters:**

| Param | Type | ตัวอย่าง | คำอธิบาย |
|-------|------|---------|-----------|
| `caption` | string | `#ออกเยี่ยม` | ค้นหาใน caption field (LIKE) |
| `location` | string | `เชียงใหม่` | ค้นหาใน location_name field |
| `lat` + `lng` + `radius_km` | number | `18.8,98.9,5` | ค้นหารูปในรัศมี N กม. |
| `date_from` / `date_to` | ISO8601 | `2026-07-01` | filter ตาม taken_at |
| `visit_id` | number | `567` | filter เฉพาะ visit |
| `page` / `size` | number | `1` / `20` | pagination |

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1234,
      "visit_id": 567,
      "image_url": "https://...",
      "caption": "#ออกเยี่ยม #Mr.Tom",
      "location_name": "อ.อำเภอเมืองเชียงใหม่",
      "taken_at": "2026-07-08T10:30:00.000Z",
      "taken_lat": 18.816280,
      "taken_lng": 98.997536
    }
  ],
  "total": 45,
  "page": 1,
  "size": 20
}
```

#### 6.3 Frontend payload เพิ่ม `location_name` (ส่งมาจาก Nominatim overlay)

Frontend มีข้อมูลนี้อยู่แล้วจาก reverse geocode — เพียงเพิ่มส่งใน POST body:

```typescript
// ใน uploadVisitPhotoBase64() / upload loop
await $callPost(`/crm/${version}/visits/${visitId}/photos`, {
  image_base64: annotatedDataUrl,
  caption: annotationCaption,
  taken_at: new Date().toISOString(),
  taken_lat: currentLat,
  taken_lng: currentLng,
  location_name: overlay.locationText || null,   // ← เพิ่มแค่บรรทัดนี้
})
```

> **ไม่ต้องรอ Phase 2** — frontend ส่ง `location_name` ไปได้เลยตั้งแต่ MVP backend แค่ ignore field ที่ไม่รู้จัก, เมื่อ backend พร้อม เพิ่ม column รับได้ทันที

---

## 7. Error Handling

| Scenario | Frontend Action |
|----------|-----------------|
| POST network error | toast.error + annotated dataUrl ยังอยู่ใน previewImages |
| POST 4xx | toast.warning(res.message) + ข้ามรูปนั้น (behavior เดิม) |
| POST 401/403 | globals.client.ts จัดการ (behavior เดิม) |
| Canvas context unavailable | toast.warning + skip editor, upload compressed original |
