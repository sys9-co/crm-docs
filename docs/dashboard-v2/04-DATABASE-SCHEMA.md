# Dashboard v2 - Database Schema Recommendations

## 📋 Schema Overview

**Module**: `crm`  
**Database**: PostgreSQL (assumed)  
**Schema Version**: v2.0  

## 🗄️ Table Structures

### **Core Tables**

#### **1. visits** (Existing — Reference Only)
```sql
CREATE TABLE visits (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id          BIGINT REFERENCES projects(id),
    customer_id         BIGINT REFERENCES customers(id),
    team_id             BIGINT NOT NULL REFERENCES teams(id),
    user_id             BIGINT NOT NULL REFERENCES users(id),
    visit_type          VARCHAR(20) NOT NULL CHECK (visit_type IN ('call', 'onsite', 'other')),
    visit_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes    INTEGER,
    revenue             DECIMAL(15,2) DEFAULT 0.00,
    notes               TEXT,
    status              VARCHAR(20) DEFAULT 'completed',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard-specific index for aggregation queries
CREATE INDEX idx_visits_team_date 
    ON visits(team_id, visit_date);
CREATE INDEX idx_visits_user_date 
    ON visits(user_id, visit_date);
```

#### **2. appointments** (Existing — Reference Only)
```sql
CREATE TABLE appointments (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id          BIGINT REFERENCES projects(id),
    customer_id         BIGINT REFERENCES customers(id),
    team_id             BIGINT NOT NULL REFERENCES teams(id),
    user_id             BIGINT NOT NULL REFERENCES users(id),
    appointment_type    VARCHAR(20) NOT NULL CHECK (appointment_type IN ('call', 'onsite', 'other')),
    title               VARCHAR(500) NOT NULL,
    start_time          TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time            TIMESTAMP WITH TIME ZONE NOT NULL,
    status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    location            TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard-specific index for today's appointments
CREATE INDEX idx_appointments_team_date 
    ON appointments(team_id, start_time) 
    WHERE status = 'pending';
CREATE INDEX idx_appointments_today 
    ON appointments(start_time) 
    WHERE start_time::date = CURRENT_DATE;
```

#### **3. team_targets** (New — Dashboard Aggregation)
```sql
CREATE TABLE team_targets (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    team_id             BIGINT NOT NULL REFERENCES teams(id),
    target_month        DATE NOT NULL,  -- First day of target month
    visit_target        INTEGER NOT NULL DEFAULT 0,
    customer_target     INTEGER NOT NULL DEFAULT 0,
    revenue_target      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by          BIGINT REFERENCES users(id),
    
    CONSTRAINT uk_team_targets_month UNIQUE (team_id, target_month)
);

-- Index for period queries
CREATE INDEX idx_team_targets_month 
    ON team_targets(target_month);
```

### **Dashboard Aggregation Tables**

#### **4. dashboard_kpi_snapshot** (New — Materialized Data)
```sql
CREATE TABLE dashboard_kpi_snapshot (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    team_id             BIGINT REFERENCES teams(id),
    user_id             BIGINT REFERENCES users(id),  -- NULL for team-level
    snapshot_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    period_type         VARCHAR(10) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    
    -- Visits metrics
    total_visits        INTEGER NOT NULL DEFAULT 0,
    completed_visits    INTEGER NOT NULL DEFAULT 0,
    planned_visits      INTEGER NOT NULL DEFAULT 0,
    call_visits         INTEGER NOT NULL DEFAULT 0,
    onsite_visits       INTEGER NOT NULL DEFAULT 0,
    other_visits        INTEGER NOT NULL DEFAULT 0,
    avg_visit_duration  NUMERIC(6,2) DEFAULT 0,
    
    -- Customer metrics
    active_customers    INTEGER NOT NULL DEFAULT 0,
    new_customers       INTEGER NOT NULL DEFAULT 0,
    customer_visit_freq NUMERIC(6,2) DEFAULT 0,
    retention_rate      NUMERIC(5,2) DEFAULT 0,
    
    -- Revenue metrics
    total_revenue       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    revenue_target      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    revenue_per_visit   DECIMAL(15,2) DEFAULT 0.00,
    
    -- Metadata
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT uk_kpi_snapshot UNIQUE (team_id, user_id, snapshot_date, period_type)
);

-- Indexes for dashboard queries
CREATE INDEX idx_kpi_snapshot_lookup 
    ON dashboard_kpi_snapshot(team_id, period_type, snapshot_date);
CREATE INDEX idx_kpi_snapshot_user 
    ON dashboard_kpi_snapshot(user_id, period_type, snapshot_date);
```

#### **5. activity_feed** (New — Cross-Project Activity)
```sql
CREATE TABLE activity_feed (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    activity_type       VARCHAR(30) NOT NULL CHECK (activity_type IN (
                            'visit_completed', 'appointment_created', 'revenue_recorded',
                            'customer_created', 'project_updated', 'visit_planned'
                        )),
    title               VARCHAR(500) NOT NULL,
    description         TEXT,
    project_id          BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    team_id             BIGINT NOT NULL REFERENCES teams(id),
    user_id             BIGINT NOT NULL REFERENCES users(id),
    metadata            JSONB,  -- Flexible extra data
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Auto-expire after 90 days
    expires_at          TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Indexes for activity feed queries
CREATE INDEX idx_activity_feed_team 
    ON activity_feed(team_id, created_at DESC);
CREATE INDEX idx_activity_feed_user 
    ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_project 
    ON activity_feed(project_id, created_at DESC);
CREATE INDEX idx_activity_feed_type 
    ON activity_feed(activity_type, created_at DESC);

-- Partition by month for performance
CREATE TABLE activity_feed_2026_06 
    PARTITION OF activity_feed
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
```

#### **6. dashboard_team_scores** (New — Performance Ranking)
```sql
CREATE TABLE dashboard_team_scores (
    id                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    team_id             BIGINT NOT NULL REFERENCES teams(id),
    score_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    period_type         VARCHAR(10) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    
    -- Component scores (0-100)
    visit_score         NUMERIC(5,2) NOT NULL DEFAULT 0,
    customer_score      NUMERIC(5,2) NOT NULL DEFAULT 0,
    revenue_score       NUMERIC(5,2) NOT NULL DEFAULT 0,
    
    -- Composite score
    composite_score     NUMERIC(5,2) NOT NULL DEFAULT 0,
    
    -- Ranking
    rank                INTEGER NOT NULL,
    
    -- Metadata
    calculated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT uk_team_scores UNIQUE (team_id, score_date, period_type)
);

CREATE INDEX idx_team_scores_date 
    ON dashboard_team_scores(score_date DESC);
CREATE INDEX idx_team_scores_rank 
    ON dashboard_team_scores(score_date, rank);
```

## 📊 Indexes for Performance

### **Dashboard Query Indexes**
```sql
-- KPI Overview Query
CREATE INDEX idx_kpi_snapshot_period 
    ON dashboard_kpi_snapshot(team_id, snapshot_date, period_type) 
    INCLUDE (total_visits, completed_visits, total_revenue, active_customers);

-- Time-series Query
CREATE INDEX idx_kpi_snapshot_timeseries 
    ON dashboard_kpi_snapshot(team_id, period_type, snapshot_date, total_revenue) 
    WHERE period_type = 'daily';

-- Today's Appointments Query
CREATE INDEX idx_appointments_today_team 
    ON appointments(team_id, start_time) 
    WHERE start_time::date = CURRENT_DATE AND status = 'pending';

-- Active Projects Query
CREATE INDEX idx_projects_active_team 
    ON projects(team_id, status, created_at DESC) 
    WHERE status = 'active';

-- Activity Feed Query
CREATE INDEX idx_activity_feed_timeline 
    ON activity_feed(team_id, created_at DESC) 
    INCLUDE (activity_type, title, user_id);
```

## 🔄 Data Migration Strategy

### **Phase 1: Create New Tables**
```sql
-- Run migration in order
-- 1. team_targets (standalone)
-- 2. dashboard_kpi_snapshot (references teams, users)
-- 3. activity_feed (references projects, teams, users)
-- 4. dashboard_team_scores (references teams)
```

### **Phase 2: Backfill Historical Data**
```sql
-- Backfill KPI snapshot from existing visit data
INSERT INTO dashboard_kpi_snapshot (
    team_id, user_id, snapshot_date, period_type,
    total_visits, completed_visits, planned_visits,
    call_visits, onsite_visits, other_visits,
    avg_visit_duration, active_customers, total_revenue
)
SELECT 
    v.team_id,
    v.user_id,
    v.visit_date::date as snapshot_date,
    'daily' as period_type,
    COUNT(*) as total_visits,
    COUNT(*) FILTER (WHERE v.status = 'completed') as completed_visits,
    0 as planned_visits,
    COUNT(*) FILTER (WHERE v.visit_type = 'call') as call_visits,
    COUNT(*) FILTER (WHERE v.visit_type = 'onsite') as onsite_visits,
    COUNT(*) FILTER (WHERE v.visit_type = 'other') as other_visits,
    AVG(v.duration_minutes) as avg_visit_duration,
    COUNT(DISTINCT v.customer_id) as active_customers,
    SUM(COALESCE(v.revenue, 0)) as total_revenue
FROM visits v
WHERE v.visit_date >= '2026-01-01'
GROUP BY v.team_id, v.user_id, v.visit_date::date;
```

### **Phase 3: Create Activity Feed from Existing Data**
```sql
-- Backfill activity feed from recent visits (last 30 days)
INSERT INTO activity_feed (
    activity_type, title, description,
    project_id, team_id, user_id, metadata, created_at
)
SELECT 
    'visit_completed' as activity_type,
    'เยี่ยมชม ' || COALESCE(p.name, 'ลูกค้า') as title,
    'พนักงาน ' || u.first_name || ' ' || u.last_name || ' เยี่ยมชม ' || COALESCE(p.name, 'ลูกค้า'),
    v.project_id,
    v.team_id,
    v.user_id,
    jsonb_build_object(
        'visit_type', v.visit_type,
        'revenue', v.revenue
    ) as metadata,
    v.updated_at as created_at
FROM visits v
LEFT JOIN projects p ON p.id = v.project_id
LEFT JOIN users u ON u.id = v.user_id
WHERE v.updated_at >= NOW() - INTERVAL '30 days';
```

## 📈 Views for Common Queries

### **1. Dashboard Overview View**
```sql
CREATE OR REPLACE VIEW vw_dashboard_overview AS
SELECT 
    ks.team_id,
    t.name as team_name,
    ks.snapshot_date,
    ks.total_visits,
    ks.completed_visits,
    CASE 
        WHEN ks.planned_visits > 0 
        THEN ROUND((ks.completed_visits::numeric / ks.planned_visits * 100), 2)
        ELSE 0 
    END as completion_rate,
    ks.call_visits,
    ks.onsite_visits,
    ks.other_visits,
    ks.avg_visit_duration,
    ks.active_customers,
    ks.new_customers,
    ks.total_revenue,
    ks.revenue_target,
    CASE 
        WHEN ks.revenue_target > 0 
        THEN ROUND((ks.total_revenue / ks.revenue_target * 100), 2)
        ELSE 0 
    END as revenue_achievement
FROM dashboard_kpi_snapshot ks
JOIN teams t ON t.id = ks.team_id
WHERE ks.user_id IS NULL  -- Team-level only
  AND ks.period_type = 'daily';
```

### **2. Team Performance Comparison View**
```sql
CREATE OR REPLACE VIEW vw_team_performance_ranking AS
SELECT 
    ds.team_id,
    t.name as team_name,
    ds.score_date,
    ds.visit_score,
    ds.customer_score,
    ds.revenue_score,
    ds.composite_score,
    ds.rank,
    ds.calculated_at
FROM dashboard_team_scores ds
JOIN teams t ON t.id = ds.team_id
WHERE ds.period_type = 'monthly'
ORDER BY ds.score_date DESC, ds.rank ASC;
```

### **3. Member Performance View**
```sql
CREATE OR REPLACE VIEW vw_member_performance AS
SELECT 
    ks.team_id,
    ks.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    ks.snapshot_date,
    ks.total_visits,
    ks.completed_visits,
    ks.total_revenue,
    CASE 
        WHEN ks.revenue_target > 0 
        THEN ROUND((ks.total_revenue / ks.revenue_target * 100), 2)
        ELSE 0 
    END as achievement_pct
FROM dashboard_kpi_snapshot ks
JOIN users u ON u.id = ks.user_id
WHERE ks.user_id IS NOT NULL
  AND ks.period_type = 'monthly'
ORDER BY ks.team_id, achievement_pct ASC;
```

## 🔒 Security & Permissions

### **Row Level Security (RLS)**
```sql
-- Enable RLS on dashboard tables
ALTER TABLE dashboard_kpi_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_team_scores ENABLE ROW LEVEL SECURITY;

-- Team members: can only see own team's data
CREATE POLICY dashboard_team_member_access 
ON dashboard_kpi_snapshot FOR SELECT
USING (
    team_id IN (
        SELECT team_id FROM users 
        WHERE id = current_setting('app.current_user_id')::bigint
    )
    AND (
        user_id IS NULL  -- Team aggregates visible to all
        OR user_id = current_setting('app.current_user_id')::bigint  -- Own data
    )
);

-- Managers: can see all teams
CREATE POLICY dashboard_manager_access 
ON dashboard_kpi_snapshot FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = current_setting('app.current_user_id')::bigint
        AND role_name IN ('merchant.crm.admin', 'merchant.crm.manage')
    )
);
```

### **Access Control**
```sql
-- Grant permissions
GRANT SELECT ON dashboard_kpi_snapshot TO app_user;
GRANT SELECT ON activity_feed TO app_user;
GRANT SELECT ON dashboard_team_scores TO app_user;
GRANT SELECT ON team_targets TO app_user;

-- View permissions
GRANT SELECT ON vw_dashboard_overview TO app_user;
GRANT SELECT ON vw_team_performance_ranking TO app_user;
GRANT SELECT ON vw_member_performance TO app_user;

-- Insert activity feed (triggered by application)
GRANT INSERT ON activity_feed TO app_user;
```

## 🧪 Test Data Setup

### **Sample Data Creation**
```sql
-- Assuming teams exist with IDs: 1 (ปลีกสนญ), 2 (ปลีกสันกำแพง), 44 (โครงการ), 4 (ส่งร้านค้า)

-- Set team targets for June 2026
INSERT INTO team_targets (team_id, target_month, visit_target, customer_target, revenue_target) VALUES
(1, '2026-06-01', 55, 30, 1000000.00),
(2, '2026-06-01', 40, 20, 800000.00),
(44, '2026-06-01', 45, 18, 1200000.00),
(4, '2026-06-01', 30, 15, 500000.00);

-- Insert KPI snapshot for all teams (team-level, no user)
INSERT INTO dashboard_kpi_snapshot (
    team_id, user_id, snapshot_date, period_type,
    total_visits, completed_visits, planned_visits,
    call_visits, onsite_visits, other_visits,
    avg_visit_duration, active_customers, new_customers,
    total_revenue, revenue_target
) VALUES
(1, NULL, '2026-06-16', 'monthly', 52, 40, 55, 15, 20, 5, 35.0, 32, 5, 850000.00, 1000000.00),
(2, NULL, '2026-06-16', 'monthly', 38, 30, 40, 10, 15, 5, 32.0, 22, 3, 620000.00, 800000.00),
(44, NULL, '2026-06-16', 'monthly', 42, 36, 45, 8, 25, 3, 45.0, 18, 2, 950000.00, 1200000.00),
(4, NULL, '2026-06-16', 'monthly', 24, 18, 30, 8, 6, 4, 28.0, 17, 2, 430000.00, 500000.00);

-- Insert team scores
INSERT INTO dashboard_team_scores (team_id, score_date, period_type, visit_score, customer_score, revenue_score, composite_score, rank) VALUES
(1, '2026-06-16', 'monthly', 72.73, 68.00, 85.00, 78.5, 2),
(2, '2026-06-16', 'monthly', 75.00, 65.00, 77.50, 72.1, 3),
(44, '2026-06-16', 'monthly', 80.00, 72.00, 79.17, 82.3, 1),
(4, '2026-06-16', 'monthly', 60.00, 58.00, 86.00, 68.9, 4);

-- Insert sample activity feed
INSERT INTO activity_feed (activity_type, title, description, project_id, team_id, user_id, created_at) VALUES
('visit_completed', 'เยี่ยมชมโครงการ WG-Server-098', 'พนักงานสมชาย เยี่ยมชมโครงการ ติดตั้งเซิร์ฟเวอร์', 3150, 44, 101, '2026-06-16T10:30:00+07:00'),
('appointment_created', 'นัดหมายใหม่: ประชุมลูกค้า', 'นัดหมายกับ บริษัท ABC วันที่ 17 มิ.ย. 69', NULL, 1, 102, '2026-06-16T09:15:00+07:00'),
('revenue_recorded', 'บันทึกรายได้: 150,000 ฿', 'บันทึกรายได้จากลูกค้า ห้างทองแจ๊คพ็อต', 3148, 4, 301, '2026-06-15T16:45:00+07:00');
```

### **Budget Proportion Query**

The budget proportion is a live aggregation query — no separate table needed:

```sql
-- Budget proportion for all teams (or filtered by team_id)
SELECT
  SUM(p.budget) AS total_project_amount,
  COALESCE(SUM(b.total_amount), 0) AS total_boq_amount,
  COALESCE(SUM(sp.total_amount), 0) AS total_saleplan_amount
FROM projects p
LEFT JOIN (
  SELECT project_id, SUM(total_amount) AS total_amount
  FROM boq
  WHERE deleted_at IS NULL
  GROUP BY project_id
) b ON b.project_id = p.id
LEFT JOIN (
  SELECT project_id, SUM(total_amount) AS total_amount
  FROM sale_plans
  WHERE deleted_at IS NULL
  GROUP BY project_id
) sp ON sp.project_id = p.id
WHERE p.deleted_at IS NULL
  AND p.status IN ('active', 'in_progress')
  -- optional: AND p.team_id = :team_id
```

**Per-team breakdown**:
```sql
SELECT
  t.id AS team_id,
  t.name AS team_name,
  COALESCE(SUM(p.budget), 0) AS project_amount,
  COALESCE(SUM(b.total_amount), 0) AS boq_amount,
  COALESCE(SUM(sp.total_amount), 0) AS saleplan_amount
FROM teams t
LEFT JOIN projects p ON p.team_id = t.id AND p.deleted_at IS NULL AND p.status IN ('active', 'in_progress')
LEFT JOIN (
  SELECT project_id, SUM(total_amount) AS total_amount
  FROM boq
  WHERE deleted_at IS NULL
  GROUP BY project_id
) b ON b.project_id = p.id
LEFT JOIN (
  SELECT project_id, SUM(total_amount) AS total_amount
  FROM sale_plans
  WHERE deleted_at IS NULL
  GROUP BY project_id
) sp ON sp.project_id = p.id
WHERE t.deleted_at IS NULL
  AND t.is_active = true
  -- optional: AND t.id = :team_id
GROUP BY t.id, t.name
ORDER BY t.name
```

**Index Recommendations**:
```sql
CREATE INDEX idx_projects_budget_lookup ON projects(team_id, status, budget) WHERE deleted_at IS NULL;
CREATE INDEX idx_boq_project_sum ON boq(project_id, total_amount) WHERE deleted_at IS NULL;
CREATE INDEX idx_saleplan_project_sum ON sale_plans(project_id, total_amount) WHERE deleted_at IS NULL;
```

## 🚀 Performance Considerations

### **Optimization Strategies:**

1. **Materialized Views for Dashboard Aggregations:**
```sql
CREATE MATERIALIZED VIEW mv_dashboard_monthly_kpi AS
SELECT 
    team_id,
    date_trunc('month', snapshot_date) as month,
    SUM(total_visits) as total_visits,
    SUM(completed_visits) as completed_visits,
    SUM(total_revenue) as total_revenue,
    AVG(active_customers) as avg_active_customers
FROM dashboard_kpi_snapshot
WHERE period_type = 'daily'
GROUP BY team_id, date_trunc('month', snapshot_date);

-- Refresh every hour
CREATE OR REPLACE FUNCTION refresh_dashboard_kpi()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_monthly_kpi;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

2. **Partitioning Strategy for Large Tables:**
```sql
-- Partition activity_feed by month
CREATE TABLE activity_feed_y2026m06 PARTITION OF activity_feed
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE activity_feed_y2026m07 PARTITION OF activity_feed
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
```

3. **Data Retention & Cleanup:**
```sql
-- Auto-delete old activity feed
DELETE FROM activity_feed WHERE expires_at < NOW();

-- Archive KPI snapshots older than 1 year
DELETE FROM dashboard_kpi_snapshot 
WHERE snapshot_date < NOW() - INTERVAL '1 year';
```

4. **Connection Pooling**: Use pgbouncer or similar for high-concurrency scenarios

## 📋 Maintenance Tasks

### **Regular Maintenance:**
```sql
-- Daily: Refresh team scores
SELECT calculate_team_scores(CURRENT_DATE);

-- Hourly: Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_monthly_kpi;

-- Weekly: Cleanup expired activity feed
DELETE FROM activity_feed WHERE expires_at < NOW();

-- Monthly: Reindex for performance
REINDEX INDEX CONCURRENTLY idx_kpi_snapshot_lookup;
REINDEX INDEX CONCURRENTLY idx_activity_feed_timeline;

-- Update statistics
ANALYZE dashboard_kpi_snapshot;
ANALYZE activity_feed;
ANALYZE dashboard_team_scores;
```

---

**Database Schema Version**: v2.0  
**Last Updated**: June 2, 2026  
**Reviewed By**: Backend Development Team  
**Status**: Ready for Implementation
