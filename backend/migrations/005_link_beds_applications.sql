-- Link Beds to Applications
-- Phase 1: Create the relationship between beds and applications
-- Date: 2026-03-11

-- Add bed assignment to applications
ALTER TABLE optalis_applications 
ADD COLUMN IF NOT EXISTS assigned_bed_id UUID REFERENCES beds(id),
ADD COLUMN IF NOT EXISTS bed_assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bed_assigned_by VARCHAR(255);

-- Add current patient tracking to beds
ALTER TABLE beds
ADD COLUMN IF NOT EXISTS current_application_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS patient_admitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expected_discharge TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admission_notes TEXT;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_applications_bed_id ON optalis_applications(assigned_bed_id);
CREATE INDEX IF NOT EXISTS idx_beds_application_id ON beds(current_application_id);

-- View for bed availability with patient info
CREATE OR REPLACE VIEW bed_availability_view AS
SELECT 
    b.id as bed_id,
    b.facility_id,
    f.name as facility_name,
    b.room_number,
    b.bed_identifier,
    b.bed_type,
    b.status,
    b.current_patient_name,
    b.current_application_id,
    b.available_date,
    b.available_time,
    b.expected_discharge,
    b.notes,
    a.id as application_id,
    a.patient_name,
    a.insurance,
    a.care_level,
    a.diagnosis,
    a.status as application_status
FROM beds b
LEFT JOIN facilities f ON b.facility_id = f.id
LEFT JOIN optalis_applications a ON b.current_application_id = a.id
WHERE f.is_active = true;
