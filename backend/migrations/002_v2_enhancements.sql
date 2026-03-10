-- Optalis V2 Enhancements Migration
-- Date: 2026-03-10

-- ===========================================
-- FACILITIES TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  total_beds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- BEDS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  bed_identifier TEXT DEFAULT 'A', -- 'A', 'B', etc for shared rooms
  bed_type TEXT DEFAULT 'standard', -- 'standard', 'bariatric', 'isolation', etc
  status TEXT DEFAULT 'available', -- 'available', 'occupied', 'reserved', 'maintenance', 'cleaning'
  current_patient_id TEXT, -- References application ID
  current_patient_name TEXT,
  available_date DATE,
  available_time TIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_beds_facility ON beds(facility_id);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_beds_available_date ON beds(available_date);

-- ===========================================
-- FLAGGED CONDITIONS (Configurable List)
-- ===========================================

CREATE TABLE IF NOT EXISTS flagged_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE, -- NULL = applies to all
  condition_name TEXT NOT NULL,
  condition_type TEXT DEFAULT 'flag', -- 'flag', 'auto_deny', 'auto_approve', 'needs_review'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- DECISION RULES (Configurable Rules)
-- ===========================================

CREATE TABLE IF NOT EXISTS decision_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE, -- NULL = applies to all
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'auto_approve', 'auto_deny', 'needs_review'
  field_to_check TEXT NOT NULL, -- e.g., 'diagnosis', 'weight', 'insurance'
  operator TEXT NOT NULL, -- 'contains', 'equals', 'greater_than', 'less_than'
  value TEXT NOT NULL, -- The value to compare against
  reason_template TEXT, -- e.g., "Patient requires {value} which is not available"
  priority INTEGER DEFAULT 0, -- Higher priority rules evaluated first
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- ADD NEW COLUMNS TO APPLICATIONS
-- ===========================================

-- Facility association
ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);

-- Sex offender registry check
ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS sex_offender_check BOOLEAN DEFAULT false;

ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS sex_offender_checked_at TIMESTAMP;

ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS sex_offender_checked_by TEXT;

-- AI Decision suggestion
ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS suggested_decision TEXT; -- 'approve', 'deny', 'review'

ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS suggested_decision_reason TEXT;

-- Flagged items found during extraction
ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS flagged_items JSONB DEFAULT '[]';

-- Enhanced AI summary fields
ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS ai_overview TEXT;

ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS ai_highlights JSONB DEFAULT '[]';

-- ===========================================
-- USERS TABLE (for role-based access)
-- ===========================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'reviewer', -- 'admin', 'manager', 'reviewer'
  facility_id UUID REFERENCES facilities(id), -- NULL for admins (access all)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- INSERT DEFAULT FLAGGED CONDITIONS
-- ===========================================

INSERT INTO flagged_conditions (condition_name, condition_type, description) VALUES
  ('Ventilator Dependent', 'auto_deny', 'Patient requires ventilator support'),
  ('Bariatric (>400 lbs)', 'needs_review', 'Patient exceeds standard bed weight limit'),
  ('IV Medications Required', 'flag', 'Patient requires IV medication administration'),
  ('Isolation Required', 'flag', 'Patient requires isolation precautions'),
  ('Wound Care - Complex', 'flag', 'Patient has complex wound care needs'),
  ('Dialysis Required', 'needs_review', 'Patient requires dialysis treatments'),
  ('Tracheostomy', 'needs_review', 'Patient has tracheostomy'),
  ('Feeding Tube', 'flag', 'Patient requires tube feeding'),
  ('Behavioral Issues', 'needs_review', 'Patient has documented behavioral concerns'),
  ('Flight Risk', 'flag', 'Patient is a potential flight risk')
ON CONFLICT DO NOTHING;

-- ===========================================
-- INSERT DEFAULT DECISION RULES
-- ===========================================

INSERT INTO decision_rules (rule_name, rule_type, field_to_check, operator, value, reason_template, priority) VALUES
  ('Sex Offender Registry', 'auto_deny', 'sex_offender_check', 'equals', 'true', 'Patient is on the sex offender registry', 100),
  ('Ventilator Required', 'auto_deny', 'diagnosis', 'contains', 'ventilator', 'Facility cannot support ventilator-dependent patients', 90),
  ('Medicare SNF', 'auto_approve', 'insurance', 'contains', 'Medicare', 'Standard Medicare SNF admission', 10),
  ('Medicaid Approved', 'auto_approve', 'insurance', 'contains', 'Medicaid', 'Medicaid coverage verified', 10)
ON CONFLICT DO NOTHING;
