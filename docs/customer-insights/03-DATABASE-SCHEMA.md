# Customer Insights — Database Schema Recommendations

## 📋 Schema Overview

**Module**: `crm`  
**Database**: PostgreSQL (assumed)  
**Schema Version**: v1.0  
**Entity Key**: `customer_uuid` (UUID v4)

## 🗄️ Table Structure

### **1. customers — Core Customer Table**

```sql
CREATE TABLE customers (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid                UUID NOT NULL DEFAULT gen_random_uuid(),
    merchant_id         BIGINT NOT NULL,
    customer_code       VARCHAR(50) NOT NULL,
    customer_name       VARCHAR(255) NOT NULL,
    customer_type       VARCHAR(50),
    
    -- Contact Information
    phone               VARCHAR(50),
    email               VARCHAR(255),
    tax_id              VARCHAR(13),
    
    -- Address
    address_line1       VARCHAR(500),
    subdistrict         VARCHAR(100),    -- ตำบล
    district            VARCHAR(100),    -- อำเภอ
    province            VARCHAR(100),    -- จังหวัด
    postal_code         VARCHAR(10),
    
    -- Profile Media
    avatar_url          TEXT,
    profile_image       TEXT,
    
    -- Personal Info
    birth_date          DATE,
    age                 INTEGER,
    occupation          VARCHAR(255),
    contact_person      VARCHAR(255),    -- Denormalized primary contact name
    contact_phone       VARCHAR(50),     -- Denormalized primary contact phone
    
    -- Extended Data
    social_media        JSONB DEFAULT '{}'::jsonb,
    -- Structure:
    -- {
    --   "facebook": "facebook.com/...",
    --   "line": "@username",
    --   "instagram": "@username",
    --   "tiktok": "@username",
    --   "website": "https://..."
    -- }
    
    -- Status & Audit
    active_status       INTEGER DEFAULT 1,  -- 1 = active, 0 = inactive
    last_interacted     TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by          BIGINT,
    updated_by          BIGINT,
    
    -- Constraints
    CONSTRAINT uk_customers_uuid UNIQUE (uuid),
    CONSTRAINT uk_customers_merchant_code UNIQUE (merchant_id, customer_code),
    CONSTRAINT fk_customers_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_customers_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT chk_customers_active_status CHECK (active_status IN (0, 1))
);

COMMENT ON TABLE customers IS 'Core customer table — every customer has a UUID primary lookup key and a human-readable customer_code for cross-service reference';
COMMENT ON COLUMN customers.uuid IS 'UUID v4 — primary lookup key exposed via API, never changes';
COMMENT ON COLUMN customers.customer_code IS 'Human-readable code (e.g., CUST-001) for cross-service reference';
COMMENT ON COLUMN customers.social_media IS 'JSONB field for flexible social media links';
COMMENT ON COLUMN customers.last_interacted IS 'Denormalized — updated by trigger when any related entity is created/updated';
```

---

## 📊 Related Tables (Existing — Reference Only)

The Customer Insights feature **does not create** these tables — it reads from existing tables that should already exist in the CRM database:

### **Related Entities for Customer 360°**

| Table | Relation | Key Field | Used In |
|-------|----------|-----------|---------|
| `contacts` | 1:N | `customer_uuid` | Contacts card |
| `projects` | 1:N | `customer_uuid` | Projects card |
| `quotations` | 1:N | `customer_uuid` | Quotations table |
| `sale_plan_headers` | 1:N | `customer_uuid` | Sale plans table |
| `order_items` | 1:N | `customer_uuid` | Orders/BOQ table |
| `visits` | 1:N | `customer_uuid` | Visits card |
| `appointments` | 1:N | `customer_uuid` | Timeline |

These tables should have a `customer_uuid` column (UUID) referencing `customers.uuid` for cross-table joins.

> **Note**: If any of these tables use `customer_id` (BIGINT) instead of `customer_uuid` (UUID), create a mapping view or add the UUID column. The API uses UUID for all customer lookups.

---

## 🔍 Computed / Aggregated Fields

The following fields on `Customer` and `CustomerOverview` are **not stored** — they are computed at query time using SQL aggregations:

### **Count Fields (on Customer detail response)**
```sql
-- total_projects
SELECT COUNT(*) FROM projects WHERE customer_uuid = :uuid AND deleted_at IS NULL;

-- total_quotations
SELECT COUNT(*) FROM quotations WHERE customer_uuid = :uuid AND deleted_at IS NULL;

-- total_sale_plans
SELECT COUNT(*) FROM sale_plan_headers WHERE customer_uuid = :uuid AND deleted_at IS NULL;

-- total_orders
SELECT COUNT(*) FROM order_items WHERE customer_uuid = :uuid AND deleted_at IS NULL;

-- total_contacts
SELECT COUNT(*) FROM contacts WHERE customer_uuid = :uuid AND deleted_at IS NULL;

-- total_visits
SELECT COUNT(*) FROM visits WHERE customer_uuid = :uuid AND deleted_at IS NULL;

-- last_interacted (also stored + trigger-updated for performance)
SELECT MAX(COALESCE(
    (SELECT MAX(created_at) FROM visits WHERE customer_uuid = :uuid),
    (SELECT MAX(created_at) FROM quotations WHERE customer_uuid = :uuid),
    (SELECT MAX(created_at) FROM appointments WHERE customer_uuid = :uuid)
)) AS last_interacted;
```

### **Overview Endpoint Aggregations**
```sql
-- total_quotation_value
SELECT COALESCE(SUM(total_amount), 0) FROM quotations WHERE customer_uuid = :uuid;

-- total_sale_plan_value
SELECT COALESCE(SUM(total_amount), 0) FROM sale_plan_headers WHERE customer_uuid = :uuid;

-- total_boq_value
SELECT COALESCE(SUM(total), 0) FROM order_items WHERE customer_uuid = :uuid;

-- total_appointments
SELECT COUNT(*) FROM appointments WHERE customer_uuid = :uuid;
```

---

## 📈 Indexes for Performance

### **Primary Indexes**
```sql
-- Customer search (core)
CREATE INDEX idx_customers_merchant_id ON customers(merchant_id);
CREATE UNIQUE INDEX idx_customers_uuid ON customers(uuid);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_customers_customer_name ON customers(customer_name);
CREATE INDEX idx_customers_province ON customers(province);
CREATE INDEX idx_customers_district ON customers(district);
CREATE INDEX idx_customers_active_status ON customers(active_status);
CREATE INDEX idx_customers_last_interacted ON customers(last_interacted DESC);

-- Full-text search index (for search by name, code, phone)
CREATE INDEX idx_customers_search ON customers
    USING gin(to_tsvector('simple',
        coalesce(customer_name, '') || ' ' ||
        coalesce(customer_code, '') || ' ' ||
        coalesce(phone, '') || ' ' ||
        coalesce(email, '')
    ));

-- Partial index for active customers only
CREATE INDEX idx_customers_active ON customers(uuid, customer_name, province)
    WHERE active_status = 1;

-- Composite index for common search queries
CREATE INDEX idx_customers_search_province ON customers(province, customer_name);
CREATE INDEX idx_customers_search_district ON customers(district, customer_name);
```

### **Related Entity Indexes (for performance)**
```sql
-- These should already exist, but verify they include customer_uuid
CREATE INDEX IF NOT EXISTS idx_projects_customer_uuid ON projects(customer_uuid);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_uuid ON quotations(customer_uuid);
CREATE INDEX IF NOT EXISTS idx_sale_plan_headers_customer_uuid ON sale_plan_headers(customer_uuid);
CREATE INDEX IF NOT EXISTS idx_order_items_customer_uuid ON order_items(customer_uuid);
CREATE INDEX IF NOT EXISTS idx_contacts_customer_uuid ON contacts(customer_uuid);
CREATE INDEX IF NOT EXISTS idx_visits_customer_uuid ON visits(customer_uuid);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_uuid ON appointments(customer_uuid);
```

### **Timeline Query Optimization Indexes**
```sql
-- Composite indexes for timeline aggregation queries
CREATE INDEX idx_visits_customer_date ON visits(customer_uuid, created_at DESC);
CREATE INDEX idx_quotations_customer_date ON quotations(customer_uuid, created_at DESC);
CREATE INDEX idx_appointments_customer_date ON appointments(customer_uuid, created_at DESC);
```

---

## 🔄 Trigger: Auto-update `last_interacted`

To keep `customers.last_interacted` up-to-date without expensive queries on every read:

```sql
CREATE OR REPLACE FUNCTION update_customer_last_interacted()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET last_interacted = NOW(),
        updated_at = NOW()
    WHERE uuid = NEW.customer_uuid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each related table
CREATE TRIGGER trg_visits_update_last_interacted
    AFTER INSERT ON visits
    FOR EACH ROW EXECUTE FUNCTION update_customer_last_interacted();

CREATE TRIGGER trg_quotations_update_last_interacted
    AFTER INSERT ON quotations
    FOR EACH ROW EXECUTE FUNCTION update_customer_last_interacted();

CREATE TRIGGER trg_appointments_update_last_interacted
    AFTER INSERT ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_customer_last_interacted();

CREATE TRIGGER trg_sale_plans_update_last_interacted
    AFTER INSERT ON sale_plan_headers
    FOR EACH ROW EXECUTE FUNCTION update_customer_last_interacted();
```

---

## 📊 Analytics Queries

### **Customers by Province**
```sql
SELECT province, COUNT(*) AS count
FROM customers
WHERE merchant_id = :merchant_id
  AND active_status = 1
  AND province IS NOT NULL
GROUP BY province
ORDER BY count DESC
LIMIT 10;
```

### **Customers by District**
```sql
SELECT district, COUNT(*) AS count
FROM customers
WHERE merchant_id = :merchant_id
  AND active_status = 1
  AND district IS NOT NULL
GROUP BY district
ORDER BY count DESC
LIMIT 10;
```

### **New Customers Over Time**
```sql
SELECT
    TO_CHAR(created_at, 'YYYY-MM') AS month,
    COUNT(*) AS count
FROM customers
WHERE merchant_id = :merchant_id
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month;
```

### **Top Customers by Total Value**
```sql
SELECT
    c.uuid,
    c.customer_code,
    c.customer_name,
    c.phone,
    c.email,
    c.province,
    c.avatar_url,
    COALESCE(qt.total_quotation_value, 0) +
    COALESCE(sp.total_sale_plan_value, 0) +
    COALESCE(oi.total_order_value, 0) AS total_value
FROM customers c
LEFT JOIN (
    SELECT customer_uuid, SUM(total_amount) AS total_quotation_value
    FROM quotations WHERE deleted_at IS NULL GROUP BY customer_uuid
) qt ON qt.customer_uuid = c.uuid
LEFT JOIN (
    SELECT customer_uuid, SUM(total_amount) AS total_sale_plan_value
    FROM sale_plan_headers WHERE deleted_at IS NULL GROUP BY customer_uuid
) sp ON sp.customer_uuid = c.uuid
LEFT JOIN (
    SELECT customer_uuid, SUM(total) AS total_order_value
    FROM order_items WHERE deleted_at IS NULL GROUP BY customer_uuid
) oi ON oi.customer_uuid = c.uuid
WHERE c.merchant_id = :merchant_id AND c.active_status = 1
ORDER BY total_value DESC
LIMIT 10;
```

### **Customers by Project Count Range**
```sql
SELECT
    CASE
        WHEN p_count.project_count BETWEEN 1 AND 2 THEN '1-2 โครงการ'
        WHEN p_count.project_count BETWEEN 3 AND 5 THEN '3-5 โครงการ'
        WHEN p_count.project_count BETWEEN 6 AND 10 THEN '6-10 โครงการ'
        WHEN p_count.project_count >= 11 THEN '11+ โครงการ'
        ELSE 'ไม่มีโครงการ'
    END AS range,
    COUNT(*) AS count
FROM (
    SELECT c.uuid, COUNT(p.id) AS project_count
    FROM customers c
    LEFT JOIN projects p ON p.customer_uuid = c.uuid AND p.deleted_at IS NULL
    WHERE c.merchant_id = :merchant_id AND c.active_status = 1
    GROUP BY c.uuid
) p_count
GROUP BY range
ORDER BY range;
```

### **Acquisition Trend (Cumulative)**
```sql
WITH monthly AS (
    SELECT
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*) AS count
    FROM customers
    WHERE merchant_id = :merchant_id
    GROUP BY month
)
SELECT
    month,
    SUM(count) OVER (ORDER BY month) AS cumulative
FROM monthly
ORDER BY month;
```

### **Sleeping Customers**
```sql
SELECT
    c.uuid,
    c.customer_name,
    c.customer_code,
    c.phone,
    c.last_interacted AS last_interaction_date,
    EXTRACT(DAY FROM NOW() - c.last_interacted)::INTEGER AS days_since_last_interaction,
    (SELECT COUNT(*) FROM visits WHERE customer_uuid = c.uuid) AS total_visits,
    (SELECT COUNT(*) FROM projects WHERE customer_uuid = c.uuid) AS total_projects
FROM customers c
WHERE c.merchant_id = :merchant_id
  AND c.last_interacted < NOW() - (:threshold_days || ' days')::INTERVAL
  AND c.active_status = 1
ORDER BY c.last_interacted ASC;
```

---

## 🔒 Security & Permissions

### **Row Level Security (RLS)**

```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_merchant_access
ON customers FOR ALL
USING (
    merchant_id = current_setting('app.current_merchant_id')::bigint
);
```

### **Access Control**

```sql
GRANT SELECT, INSERT, UPDATE ON customers TO app_user;
GRANT USAGE ON customers_id_seq TO app_user;
```

---

## 🧪 Sample Data

```sql
INSERT INTO customers (
    uuid, merchant_id, customer_code, customer_name, customer_type,
    phone, email, tax_id,
    address_line1, subdistrict, district, province, postal_code,
    birth_date, occupation,
    contact_person, contact_phone,
    social_media,
    active_status, created_by
) VALUES
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    1,
    'CUST-001',
    'หจก.ก่อสร้างเจริญกิจ',
    'contractor',
    '081-234-5678',
    'info@charoenkit.com',
    '1234567890123',
    '123 ถ.สุขุมวิท',
    'คลองเตย',
    'คลองเตย',
    'กรุงเทพมหานคร',
    '10110',
    '1989-03-15',
    'รับเหมาก่อสร้าง',
    'นายสมชาย ใจดี',
    '089-876-5432',
    '{"facebook": "facebook.com/charoenkit", "line": "@charoenkit_off", "instagram": "@charoenkit_construction"}'::jsonb,
    1,
    1
),
(
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    1,
    'CUST-002',
    'บริษัท ตั้งตรงมั่น จำกัด',
    'developer',
    '082-345-6789',
    'contact@tangtrongman.com',
    '9876543210123',
    '456 ถ.ช้างเผือก',
    'ศรีภูมิ',
    'เมืองเชียงใหม่',
    'เชียงใหม่',
    '50200',
    NULL,
    'อสังหาริมทรัพย์',
    'นางวิไล รักดี',
    '088-765-4321',
    '{"website": "https://tangtrongman.com"}'::jsonb,
    1,
    1
);
```

---

## 📋 Maintenance Tasks

```sql
-- Re-index periodically for search performance
REINDEX INDEX CONCURRENTLY idx_customers_search;

-- Update table statistics
ANALYZE customers;

-- Clean up soft-deleted customer references (if soft delete is used)
-- No automatic cleanup — related entities maintain referential integrity
```

---

**Database Schema Version**: v1.0
**Last Updated**: June 4, 2026
**Status**: Ready for Implementation
