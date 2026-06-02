# Sale Plan v2 - Database Schema Recommendations

## 📋 Schema Overview

**Module**: `crm`  
**Database**: PostgreSQL (assumed)  
**Schema Version**: v2.0  

## 🗄️ Table Structures

### **Primary Tables**

#### **1. saleplan_v2_headers**
```sql
CREATE TABLE saleplan_v2_headers (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id          BIGINT NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by          BIGINT,
    updated_by          BIGINT,
    notes               TEXT,
    version             INTEGER DEFAULT 1,
    
    -- Constraints
    CONSTRAINT fk_saleplan_v2_headers_project 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_saleplan_v2_headers_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_saleplan_v2_headers_updated_by 
        FOREIGN KEY (updated_by) REFERENCES users(id),
        
    -- Unique constraint: one active plan per project
    CONSTRAINT uk_saleplan_v2_headers_project UNIQUE (project_id)
);
```

#### **2. saleplan_v2_entries**  
```sql
CREATE TABLE saleplan_v2_entries (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    header_id           BIGINT NOT NULL,
    boq_item_id         BIGINT NOT NULL,
    month_period        VARCHAR(7) NOT NULL,  -- Format: "YYYY-MM"
    planned_amount      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by          BIGINT,
    updated_by          BIGINT,
    notes               TEXT,
    
    -- Constraints
    CONSTRAINT fk_saleplan_v2_entries_header 
        FOREIGN KEY (header_id) REFERENCES saleplan_v2_headers(id) ON DELETE CASCADE,
    CONSTRAINT fk_saleplan_v2_entries_boq 
        FOREIGN KEY (boq_item_id) REFERENCES boq_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_saleplan_v2_entries_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_saleplan_v2_entries_updated_by 
        FOREIGN KEY (updated_by) REFERENCES users(id),
        
    -- Business constraints
    CONSTRAINT chk_saleplan_v2_entries_amount_positive 
        CHECK (planned_amount >= 0),
    CONSTRAINT chk_saleplan_v2_entries_month_format 
        CHECK (month_period ~ '^[0-9]{4}-[0-9]{2}$'),
        
    -- Unique constraint: one entry per BOQ per month per plan
    CONSTRAINT uk_saleplan_v2_entries_unique 
        UNIQUE (header_id, boq_item_id, month_period)
);
```

### **Supporting Tables (if needed)**

#### **3. saleplan_v2_audit_log** (Optional)
```sql
CREATE TABLE saleplan_v2_audit_log (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    header_id           BIGINT NOT NULL,
    action_type         VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    entry_id            BIGINT,
    boq_item_id         BIGINT,
    month_period        VARCHAR(7),
    old_amount          DECIMAL(15,2),
    new_amount          DECIMAL(15,2),
    changed_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by          BIGINT,
    ip_address          INET,
    user_agent          TEXT,
    
    -- Constraints
    CONSTRAINT fk_saleplan_v2_audit_header 
        FOREIGN KEY (header_id) REFERENCES saleplan_v2_headers(id) ON DELETE CASCADE,
    CONSTRAINT fk_saleplan_v2_audit_entry 
        FOREIGN KEY (entry_id) REFERENCES saleplan_v2_entries(id) ON DELETE SET NULL,
    CONSTRAINT fk_saleplan_v2_audit_user 
        FOREIGN KEY (changed_by) REFERENCES users(id),
    CONSTRAINT chk_saleplan_v2_audit_action 
        CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'BULK_UPDATE'))
);
```

## 📊 Indexes for Performance

### **Primary Indexes**
```sql
-- Headers table indexes
CREATE INDEX idx_saleplan_v2_headers_project_id 
    ON saleplan_v2_headers(project_id);
CREATE INDEX idx_saleplan_v2_headers_created_at 
    ON saleplan_v2_headers(created_at);

-- Entries table indexes  
CREATE INDEX idx_saleplan_v2_entries_header_id 
    ON saleplan_v2_entries(header_id);
CREATE INDEX idx_saleplan_v2_entries_boq_item_id 
    ON saleplan_v2_entries(boq_item_id);
CREATE INDEX idx_saleplan_v2_entries_month_period 
    ON saleplan_v2_entries(month_period);
CREATE INDEX idx_saleplan_v2_entries_header_month 
    ON saleplan_v2_entries(header_id, month_period);

-- Composite index for common queries
CREATE INDEX idx_saleplan_v2_entries_lookup 
    ON saleplan_v2_entries(header_id, boq_item_id, month_period);

-- Performance index for aggregations
CREATE INDEX idx_saleplan_v2_entries_amount_calc 
    ON saleplan_v2_entries(header_id, planned_amount) 
    WHERE planned_amount > 0;
```

### **Audit Log Indexes** (if implemented)
```sql
CREATE INDEX idx_saleplan_v2_audit_header_id 
    ON saleplan_v2_audit_log(header_id);
CREATE INDEX idx_saleplan_v2_audit_changed_at 
    ON saleplan_v2_audit_log(changed_at);
CREATE INDEX idx_saleplan_v2_audit_changed_by 
    ON saleplan_v2_audit_log(changed_by);
```

## 🔄 Data Migration Strategy

### **Migration from Sale Plan v1**

```sql
-- Migration script to convert existing Sale Plan v1 data
INSERT INTO saleplan_v2_headers (
    project_id, 
    created_at, 
    updated_at,
    created_by,
    notes
)
SELECT DISTINCT
    sp.project_id,
    MIN(sp.created_at) as created_at,
    MAX(sp.updated_at) as updated_at,
    MIN(sp.created_by) as created_by,
    'Migrated from Sale Plan v1' as notes
FROM saleplan_headers sp
GROUP BY sp.project_id;

-- Migrate individual entries
INSERT INTO saleplan_v2_entries (
    header_id,
    boq_item_id, 
    month_period,
    planned_amount,
    created_at,
    updated_at,
    created_by
)
SELECT 
    h2.id as header_id,
    sl.boq_item_id,
    sl.year_month as month_period,
    sl.amount as planned_amount,
    sl.created_at,
    sl.updated_at,
    sl.created_by
FROM saleplan_headers sp1
JOIN saleplan_v2_headers h2 ON h2.project_id = sp1.project_id
JOIN saleplan_lines sl ON sl.saleplan_header_id = sp1.id
WHERE sl.boq_item_id IS NOT NULL  -- Only BOQ-linked entries
  AND sl.amount > 0;
```

## 📈 Views for Common Queries

### **1. Sale Plan Matrix View**
```sql
CREATE OR REPLACE VIEW vw_saleplan_v2_matrix AS
SELECT 
    h.project_id,
    h.id as header_id,
    e.boq_item_id,
    b.name as boq_name,
    b.total as boq_total_amount,
    e.month_period,
    e.planned_amount,
    h.updated_at
FROM saleplan_v2_headers h
JOIN saleplan_v2_entries e ON e.header_id = h.id
JOIN boq_items b ON b.id = e.boq_item_id
WHERE e.planned_amount > 0;
```

### **2. BOQ Summary View**
```sql
CREATE OR REPLACE VIEW vw_saleplan_v2_boq_summary AS
SELECT 
    h.project_id,
    e.boq_item_id,
    b.name as boq_name,
    b.total as boq_total_amount,
    SUM(e.planned_amount) as total_planned,
    (b.total - SUM(e.planned_amount)) as remaining_amount,
    ROUND((SUM(e.planned_amount) / b.total * 100), 2) as percentage_planned,
    CASE 
        WHEN SUM(e.planned_amount) = 0 THEN 'empty'
        WHEN SUM(e.planned_amount) < b.total THEN 'under'
        WHEN SUM(e.planned_amount) = b.total THEN 'exact'  
        WHEN SUM(e.planned_amount) > b.total THEN 'over'
    END as status
FROM saleplan_v2_headers h
JOIN saleplan_v2_entries e ON e.header_id = h.id
JOIN boq_items b ON b.id = e.boq_item_id
GROUP BY h.project_id, e.boq_item_id, b.name, b.total;
```

### **3. Monthly Summary View**
```sql
CREATE OR REPLACE VIEW vw_saleplan_v2_monthly_summary AS
SELECT 
    h.project_id,
    e.month_period,
    COUNT(DISTINCT e.boq_item_id) as boq_count,
    SUM(e.planned_amount) as total_planned,
    AVG(e.planned_amount) as avg_planned,
    MIN(e.planned_amount) as min_planned,
    MAX(e.planned_amount) as max_planned
FROM saleplan_v2_headers h
JOIN saleplan_v2_entries e ON e.header_id = h.id
WHERE e.planned_amount > 0
GROUP BY h.project_id, e.month_period
ORDER BY h.project_id, e.month_period;
```

## 🔒 Security & Permissions

### **Row Level Security (RLS)**
```sql
-- Enable RLS on sensitive tables
ALTER TABLE saleplan_v2_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saleplan_v2_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their merchant's projects
CREATE POLICY saleplan_v2_headers_merchant_access 
ON saleplan_v2_headers FOR ALL 
USING (
    project_id IN (
        SELECT id FROM projects 
        WHERE merchant_id = current_setting('app.current_merchant_id')::bigint
    )
);

CREATE POLICY saleplan_v2_entries_merchant_access 
ON saleplan_v2_entries FOR ALL 
USING (
    header_id IN (
        SELECT h.id FROM saleplan_v2_headers h 
        JOIN projects p ON p.id = h.project_id
        WHERE p.merchant_id = current_setting('app.current_merchant_id')::bigint
    )
);
```

### **Access Control**
```sql
-- Grant appropriate permissions to application roles
GRANT SELECT, INSERT, UPDATE, DELETE ON saleplan_v2_headers TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON saleplan_v2_entries TO app_user;
GRANT SELECT ON vw_saleplan_v2_matrix TO app_user;
GRANT SELECT ON vw_saleplan_v2_boq_summary TO app_user;
GRANT SELECT ON vw_saleplan_v2_monthly_summary TO app_user;

-- Audit log access (read-only for most users)
GRANT SELECT ON saleplan_v2_audit_log TO app_user;
GRANT INSERT ON saleplan_v2_audit_log TO app_user;
```

## 🧪 Test Data Setup

### **Sample Data Creation**
```sql
-- Sample project and BOQ items (assuming they exist)
-- Project ID: 123, BOQ items: 1, 2, 3

-- Create header
INSERT INTO saleplan_v2_headers (project_id, created_by, notes)
VALUES (123, 1, 'Initial sale plan for project ABC');

-- Sample entries
INSERT INTO saleplan_v2_entries (
    header_id, boq_item_id, month_period, planned_amount, created_by
) VALUES 
(1, 1, '2026-06', 300000.00, 1),
(1, 1, '2026-07', 400000.00, 1),
(1, 1, '2026-08', 300000.00, 1),
(1, 2, '2026-06', 100000.00, 1),
(1, 2, '2026-07', 200000.00, 1),
(1, 2, '2026-08', 300000.00, 1),
(1, 3, '2026-07', 150000.00, 1),
(1, 3, '2026-08', 100000.00, 1);
```

## 🚀 Performance Considerations

### **Optimization Strategies:**

1. **Partitioning** (for large datasets):
```sql
-- Partition by month_period for time-series data
CREATE TABLE saleplan_v2_entries_partitioned (
    LIKE saleplan_v2_entries INCLUDING ALL
) PARTITION BY RANGE (month_period);

-- Create monthly partitions
CREATE TABLE saleplan_v2_entries_2026_06 
    PARTITION OF saleplan_v2_entries_partitioned 
    FOR VALUES FROM ('2026-06') TO ('2026-07');
```

2. **Materialized Views** (for complex aggregations):
```sql
CREATE MATERIALIZED VIEW mv_saleplan_v2_project_stats AS
SELECT 
    project_id,
    COUNT(DISTINCT month_period) as months_count,
    COUNT(DISTINCT boq_item_id) as boq_count,
    SUM(planned_amount) as total_planned,
    MAX(updated_at) as last_updated
FROM vw_saleplan_v2_matrix
GROUP BY project_id;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_saleplan_v2_stats()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_saleplan_v2_project_stats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

3. **Connection Pooling**: Use pgbouncer or similar for high-concurrency scenarios

4. **Query Optimization**: Use EXPLAIN ANALYZE for query tuning

## 📋 Maintenance Tasks

### **Regular Maintenance:**
```sql
-- Monthly cleanup of old audit logs (if implemented)
DELETE FROM saleplan_v2_audit_log 
WHERE changed_at < NOW() - INTERVAL '1 year';

-- Re-index for performance
REINDEX INDEX CONCURRENTLY idx_saleplan_v2_entries_lookup;

-- Update table statistics  
ANALYZE saleplan_v2_headers;
ANALYZE saleplan_v2_entries;
```

---

**Database Schema Version**: v2.0  
**Last Updated**: June 1, 2026  
**Reviewed By**: Backend Development Team  
**Status**: Ready for Implementation