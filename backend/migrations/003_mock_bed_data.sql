-- Mock Bed Data for Optalis V2
-- Date: 2026-03-10

-- ===========================================
-- INSERT MOCK FACILITIES
-- ===========================================

INSERT INTO facilities (id, name, address, city, state, zip, phone, total_beds, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sunrise Skilled Nursing', '1200 Healthcare Dr', 'Cleveland', 'OH', '44101', '(216) 555-0100', 48, true),
  ('22222222-2222-2222-2222-222222222222', 'Lakewood Care Center', '3400 Lakewood Blvd', 'Lakewood', 'OH', '44107', '(216) 555-0200', 32, true),
  ('33333333-3333-3333-3333-333333333333', 'Westside Rehab & Long Term Care', '5678 West Blvd', 'Parma', 'OH', '44129', '(440) 555-0300', 64, true)
ON CONFLICT DO NOTHING;

-- ===========================================
-- SUNRISE SKILLED NURSING (48 beds)
-- Mix of occupied, available, coming available
-- ===========================================

-- Available NOW (8 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', '101', 'A', 'standard', 'available', 'Private room, recently cleaned'),
  ('11111111-1111-1111-1111-111111111111', '104', 'A', 'standard', 'available', 'Semi-private, window view'),
  ('11111111-1111-1111-1111-111111111111', '108', 'B', 'standard', 'available', NULL),
  ('11111111-1111-1111-1111-111111111111', '112', 'A', 'bariatric', 'available', 'Bariatric bed available'),
  ('11111111-1111-1111-1111-111111111111', '115', 'A', 'standard', 'available', NULL),
  ('11111111-1111-1111-1111-111111111111', '118', 'B', 'standard', 'available', 'Near nurses station'),
  ('11111111-1111-1111-1111-111111111111', '120', 'A', 'standard', 'available', NULL),
  ('11111111-1111-1111-1111-111111111111', '122', 'A', 'isolation', 'available', 'Negative pressure room')
ON CONFLICT DO NOTHING;

-- Occupied - Discharge TODAY (3 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, available_time, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', '102', 'A', 'standard', 'occupied', 'Margaret Wilson', '2026-03-10', '14:00', 'Discharge papers signed, family picking up 2pm'),
  ('11111111-1111-1111-1111-111111111111', '106', 'A', 'standard', 'occupied', 'Robert Chen', '2026-03-10', '16:00', 'Discharge this afternoon'),
  ('11111111-1111-1111-1111-111111111111', '110', 'B', 'standard', 'occupied', 'Dorothy Martinez', '2026-03-10', '11:00', 'Morning discharge, bed ready after cleaning')
ON CONFLICT DO NOTHING;

-- Occupied - Discharge TOMORROW (5 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, available_time, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', '103', 'A', 'standard', 'occupied', 'James Thompson', '2026-03-11', '10:00', 'Pending final PT clearance'),
  ('11111111-1111-1111-1111-111111111111', '105', 'B', 'standard', 'occupied', 'Eleanor Davis', '2026-03-11', '14:00', NULL),
  ('11111111-1111-1111-1111-111111111111', '107', 'A', 'standard', 'occupied', 'William Anderson', '2026-03-11', '09:00', 'Family confirmed pickup'),
  ('11111111-1111-1111-1111-111111111111', '109', 'A', 'bariatric', 'occupied', 'Patricia Brown', '2026-03-11', '12:00', 'Bariatric bed'),
  ('11111111-1111-1111-1111-111111111111', '111', 'A', 'standard', 'occupied', 'Richard Garcia', '2026-03-11', '15:00', NULL)
ON CONFLICT DO NOTHING;

-- Occupied - Discharge within 7 days (8 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', '113', 'A', 'standard', 'occupied', 'Barbara Johnson', '2026-03-12', 'Rehab goals met'),
  ('11111111-1111-1111-1111-111111111111', '114', 'B', 'standard', 'occupied', 'Charles Lee', '2026-03-13', NULL),
  ('11111111-1111-1111-1111-111111111111', '116', 'A', 'standard', 'occupied', 'Susan Miller', '2026-03-14', NULL),
  ('11111111-1111-1111-1111-111111111111', '117', 'A', 'standard', 'occupied', 'Joseph White', '2026-03-15', 'Medicare coverage ending'),
  ('11111111-1111-1111-1111-111111111111', '119', 'B', 'standard', 'occupied', 'Nancy Taylor', '2026-03-16', NULL),
  ('11111111-1111-1111-1111-111111111111', '121', 'A', 'standard', 'occupied', 'Thomas Moore', '2026-03-16', NULL),
  ('11111111-1111-1111-1111-111111111111', '123', 'A', 'standard', 'occupied', 'Karen Jackson', '2026-03-17', 'Awaiting home care setup'),
  ('11111111-1111-1111-1111-111111111111', '124', 'B', 'standard', 'occupied', 'Daniel Harris', '2026-03-17', NULL)
ON CONFLICT DO NOTHING;

-- Long-term occupied (20 beds - no planned discharge)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', '201', 'A', 'standard', 'occupied', 'Helen Clark', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '201', 'B', 'standard', 'occupied', 'Frank Lewis', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '202', 'A', 'standard', 'occupied', 'Ruth Robinson', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '202', 'B', 'standard', 'occupied', 'Edward Walker', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '203', 'A', 'standard', 'occupied', 'Marie Hall', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '203', 'B', 'standard', 'occupied', 'George Allen', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '204', 'A', 'standard', 'occupied', 'Betty Young', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '204', 'B', 'standard', 'occupied', 'Donald King', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '205', 'A', 'standard', 'occupied', 'Virginia Wright', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '205', 'B', 'standard', 'occupied', 'Paul Scott', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '206', 'A', 'standard', 'occupied', 'Frances Green', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '206', 'B', 'standard', 'occupied', 'Kenneth Adams', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '207', 'A', 'standard', 'occupied', 'Evelyn Nelson', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '207', 'B', 'standard', 'occupied', 'Steven Hill', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '208', 'A', 'standard', 'occupied', 'Jean Campbell', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '208', 'B', 'standard', 'occupied', 'Ronald Mitchell', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '209', 'A', 'standard', 'occupied', 'Alice Roberts', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '209', 'B', 'standard', 'occupied', 'Jerry Carter', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '210', 'A', 'standard', 'occupied', 'Shirley Phillips', 'Long-term care'),
  ('11111111-1111-1111-1111-111111111111', '210', 'B', 'standard', 'occupied', 'Harold Evans', 'Long-term care')
ON CONFLICT DO NOTHING;

-- Maintenance/Cleaning (4 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, available_date, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', '125', 'A', 'standard', 'cleaning', '2026-03-10', 'Deep cleaning after discharge'),
  ('11111111-1111-1111-1111-111111111111', '126', 'A', 'standard', 'cleaning', '2026-03-10', 'Cleaning in progress'),
  ('11111111-1111-1111-1111-111111111111', '127', 'A', 'standard', 'maintenance', '2026-03-12', 'Bed frame repair'),
  ('11111111-1111-1111-1111-111111111111', '128', 'A', 'standard', 'maintenance', '2026-03-14', 'HVAC repair in room')
ON CONFLICT DO NOTHING;

-- ===========================================
-- LAKEWOOD CARE CENTER (32 beds)
-- ===========================================

-- Available NOW (4 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, notes) VALUES
  ('22222222-2222-2222-2222-222222222222', '10', 'A', 'standard', 'available', 'Ready for admission'),
  ('22222222-2222-2222-2222-222222222222', '12', 'B', 'standard', 'available', NULL),
  ('22222222-2222-2222-2222-222222222222', '15', 'A', 'bariatric', 'available', 'Bariatric bed'),
  ('22222222-2222-2222-2222-222222222222', '18', 'A', 'standard', 'available', 'Corner room, quiet')
ON CONFLICT DO NOTHING;

-- Occupied - Discharge TODAY (2 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, available_time, notes) VALUES
  ('22222222-2222-2222-2222-222222222222', '11', 'A', 'standard', 'occupied', 'Michael Brown', '2026-03-10', '13:00', 'Ready for pickup'),
  ('22222222-2222-2222-2222-222222222222', '14', 'A', 'standard', 'occupied', 'Linda Williams', '2026-03-10', '15:30', 'Ambulance transport scheduled')
ON CONFLICT DO NOTHING;

-- Occupied - Discharge within 24 hours (3 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, available_time, notes) VALUES
  ('22222222-2222-2222-2222-222222222222', '13', 'A', 'standard', 'occupied', 'David Jones', '2026-03-11', '10:00', NULL),
  ('22222222-2222-2222-2222-222222222222', '16', 'A', 'standard', 'occupied', 'Jennifer Smith', '2026-03-11', '14:00', NULL),
  ('22222222-2222-2222-2222-222222222222', '17', 'B', 'standard', 'occupied', 'Christopher Davis', '2026-03-11', '09:00', NULL)
ON CONFLICT DO NOTHING;

-- Occupied - Discharge within 7 days (6 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, notes) VALUES
  ('22222222-2222-2222-2222-222222222222', '19', 'A', 'standard', 'occupied', 'Amanda Wilson', '2026-03-13', NULL),
  ('22222222-2222-2222-2222-222222222222', '20', 'A', 'standard', 'occupied', 'Matthew Taylor', '2026-03-14', NULL),
  ('22222222-2222-2222-2222-222222222222', '21', 'B', 'standard', 'occupied', 'Ashley Anderson', '2026-03-15', NULL),
  ('22222222-2222-2222-2222-222222222222', '22', 'A', 'standard', 'occupied', 'Joshua Thomas', '2026-03-16', NULL),
  ('22222222-2222-2222-2222-222222222222', '23', 'A', 'standard', 'occupied', 'Sarah Jackson', '2026-03-17', NULL),
  ('22222222-2222-2222-2222-222222222222', '24', 'B', 'standard', 'occupied', 'Andrew White', '2026-03-17', NULL)
ON CONFLICT DO NOTHING;

-- Long-term occupied (15 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, notes) VALUES
  ('22222222-2222-2222-2222-222222222222', '30', 'A', 'standard', 'occupied', 'Elizabeth Martin', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '30', 'B', 'standard', 'occupied', 'James Thompson', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '31', 'A', 'standard', 'occupied', 'Mary Garcia', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '31', 'B', 'standard', 'occupied', 'Robert Martinez', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '32', 'A', 'standard', 'occupied', 'Patricia Robinson', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '32', 'B', 'standard', 'occupied', 'John Clark', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '33', 'A', 'standard', 'occupied', 'Barbara Rodriguez', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '33', 'B', 'standard', 'occupied', 'William Lewis', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '34', 'A', 'standard', 'occupied', 'Susan Lee', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '34', 'B', 'standard', 'occupied', 'Richard Walker', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '35', 'A', 'standard', 'occupied', 'Jessica Hall', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '35', 'B', 'standard', 'occupied', 'Thomas Allen', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '36', 'A', 'standard', 'occupied', 'Karen Young', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '36', 'B', 'standard', 'occupied', 'Charles Hernandez', 'Long-term care'),
  ('22222222-2222-2222-2222-222222222222', '37', 'A', 'standard', 'occupied', 'Nancy King', 'Long-term care')
ON CONFLICT DO NOTHING;

-- Maintenance/Cleaning (2 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, available_date, notes) VALUES
  ('22222222-2222-2222-2222-222222222222', '25', 'A', 'standard', 'cleaning', '2026-03-10', 'Deep clean'),
  ('22222222-2222-2222-2222-222222222222', '26', 'A', 'standard', 'maintenance', '2026-03-13', 'Replacing mattress')
ON CONFLICT DO NOTHING;

-- ===========================================
-- WESTSIDE REHAB & LONG TERM CARE (64 beds)
-- ===========================================

-- Available NOW (10 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, notes) VALUES
  ('33333333-3333-3333-3333-333333333333', 'A101', 'A', 'standard', 'available', 'Private room'),
  ('33333333-3333-3333-3333-333333333333', 'A104', 'B', 'standard', 'available', NULL),
  ('33333333-3333-3333-3333-333333333333', 'A108', 'A', 'standard', 'available', NULL),
  ('33333333-3333-3333-3333-333333333333', 'A112', 'A', 'bariatric', 'available', 'Bariatric suite'),
  ('33333333-3333-3333-3333-333333333333', 'A116', 'B', 'standard', 'available', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B102', 'A', 'standard', 'available', 'Rehab wing'),
  ('33333333-3333-3333-3333-333333333333', 'B106', 'A', 'standard', 'available', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B110', 'B', 'standard', 'available', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B114', 'A', 'isolation', 'available', 'Isolation room'),
  ('33333333-3333-3333-3333-333333333333', 'B118', 'A', 'standard', 'available', NULL)
ON CONFLICT DO NOTHING;

-- Occupied - Discharge TODAY (4 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, available_time, notes) VALUES
  ('33333333-3333-3333-3333-333333333333', 'A102', 'A', 'standard', 'occupied', 'Robert Johnson', '2026-03-10', '11:00', 'Morning discharge'),
  ('33333333-3333-3333-3333-333333333333', 'A105', 'A', 'standard', 'occupied', 'Mary Williams', '2026-03-10', '14:00', 'Afternoon pickup'),
  ('33333333-3333-3333-3333-333333333333', 'B103', 'A', 'standard', 'occupied', 'David Brown', '2026-03-10', '16:00', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B107', 'B', 'standard', 'occupied', 'Linda Davis', '2026-03-10', '12:30', NULL)
ON CONFLICT DO NOTHING;

-- Occupied - Discharge within 24 hours (6 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, available_time, notes) VALUES
  ('33333333-3333-3333-3333-333333333333', 'A103', 'A', 'standard', 'occupied', 'James Miller', '2026-03-11', '09:00', NULL),
  ('33333333-3333-3333-3333-333333333333', 'A106', 'B', 'standard', 'occupied', 'Patricia Wilson', '2026-03-11', '10:00', NULL),
  ('33333333-3333-3333-3333-333333333333', 'A109', 'A', 'standard', 'occupied', 'Michael Moore', '2026-03-11', '14:00', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B104', 'A', 'standard', 'occupied', 'Jennifer Taylor', '2026-03-11', '11:00', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B108', 'A', 'standard', 'occupied', 'William Anderson', '2026-03-11', '15:00', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B111', 'B', 'standard', 'occupied', 'Elizabeth Thomas', '2026-03-11', '13:00', NULL)
ON CONFLICT DO NOTHING;

-- Occupied - Discharge within 7 days (12 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, available_date, notes) VALUES
  ('33333333-3333-3333-3333-333333333333', 'A107', 'A', 'standard', 'occupied', 'Christopher Jackson', '2026-03-12', NULL),
  ('33333333-3333-3333-3333-333333333333', 'A110', 'A', 'standard', 'occupied', 'Jessica White', '2026-03-12', NULL),
  ('33333333-3333-3333-3333-333333333333', 'A113', 'A', 'standard', 'occupied', 'Matthew Harris', '2026-03-13', NULL),
  ('33333333-3333-3333-3333-333333333333', 'A114', 'B', 'standard', 'occupied', 'Sarah Martin', '2026-03-13', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B105', 'A', 'standard', 'occupied', 'Daniel Thompson', '2026-03-14', 'Rehab completion'),
  ('33333333-3333-3333-3333-333333333333', 'B109', 'A', 'standard', 'occupied', 'Ashley Garcia', '2026-03-14', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B112', 'A', 'standard', 'occupied', 'Joshua Martinez', '2026-03-15', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B113', 'B', 'standard', 'occupied', 'Amanda Robinson', '2026-03-15', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B115', 'A', 'standard', 'occupied', 'Andrew Clark', '2026-03-16', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B116', 'A', 'standard', 'occupied', 'Nicole Rodriguez', '2026-03-16', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B117', 'B', 'standard', 'occupied', 'Ryan Lewis', '2026-03-17', NULL),
  ('33333333-3333-3333-3333-333333333333', 'B119', 'A', 'standard', 'occupied', 'Stephanie Lee', '2026-03-17', NULL)
ON CONFLICT DO NOTHING;

-- Long-term occupied (28 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, current_patient_name, notes) VALUES
  ('33333333-3333-3333-3333-333333333333', 'C101', 'A', 'standard', 'occupied', 'Dorothy Walker', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C101', 'B', 'standard', 'occupied', 'Harold Hall', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C102', 'A', 'standard', 'occupied', 'Betty Allen', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C102', 'B', 'standard', 'occupied', 'Henry Young', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C103', 'A', 'standard', 'occupied', 'Margaret Hernandez', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C103', 'B', 'standard', 'occupied', 'Arthur King', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C104', 'A', 'standard', 'occupied', 'Virginia Wright', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C104', 'B', 'standard', 'occupied', 'Eugene Lopez', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C105', 'A', 'standard', 'occupied', 'Frances Hill', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C105', 'B', 'standard', 'occupied', 'Raymond Scott', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C106', 'A', 'standard', 'occupied', 'Evelyn Green', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C106', 'B', 'standard', 'occupied', 'Russell Adams', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C107', 'A', 'standard', 'occupied', 'Rose Baker', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C107', 'B', 'standard', 'occupied', 'Lawrence Gonzalez', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C108', 'A', 'standard', 'occupied', 'Marie Nelson', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C108', 'B', 'standard', 'occupied', 'Albert Carter', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C109', 'A', 'standard', 'occupied', 'Lillian Mitchell', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C109', 'B', 'standard', 'occupied', 'Gerald Perez', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C110', 'A', 'standard', 'occupied', 'Irene Roberts', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C110', 'B', 'standard', 'occupied', 'Carl Turner', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C111', 'A', 'standard', 'occupied', 'Catherine Phillips', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C111', 'B', 'standard', 'occupied', 'Walter Campbell', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C112', 'A', 'standard', 'occupied', 'Josephine Parker', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C112', 'B', 'standard', 'occupied', 'Roy Evans', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C113', 'A', 'standard', 'occupied', 'Annie Edwards', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C113', 'B', 'standard', 'occupied', 'Jack Collins', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C114', 'A', 'standard', 'occupied', 'Hazel Stewart', 'Long-term care'),
  ('33333333-3333-3333-3333-333333333333', 'C114', 'B', 'standard', 'occupied', 'Stanley Sanchez', 'Long-term care')
ON CONFLICT DO NOTHING;

-- Maintenance/Cleaning (4 beds)
INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, available_date, notes) VALUES
  ('33333333-3333-3333-3333-333333333333', 'A115', 'A', 'standard', 'cleaning', '2026-03-10', 'Post-discharge cleaning'),
  ('33333333-3333-3333-3333-333333333333', 'A115', 'B', 'standard', 'cleaning', '2026-03-10', 'Post-discharge cleaning'),
  ('33333333-3333-3333-3333-333333333333', 'B120', 'A', 'standard', 'maintenance', '2026-03-11', 'Plumbing repair'),
  ('33333333-3333-3333-3333-333333333333', 'B120', 'B', 'standard', 'maintenance', '2026-03-12', 'Waiting for parts')
ON CONFLICT DO NOTHING;

-- ===========================================
-- SUMMARY
-- ===========================================
-- Sunrise:   48 beds (8 available, 3 today, 5 tomorrow, 8 week, 20 long-term, 4 maint)
-- Lakewood:  32 beds (4 available, 2 today, 3 tomorrow, 6 week, 15 long-term, 2 maint)
-- Westside:  64 beds (10 available, 4 today, 6 tomorrow, 12 week, 28 long-term, 4 maint)
-- TOTAL:    144 beds (22 available, 9 today, 14 tomorrow, 26 week, 63 long-term, 10 maint)
