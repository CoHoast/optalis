"""
Optalis API Server (PostgreSQL)
Serves applications to the dashboard using AWS RDS PostgreSQL.

Usage:
    python api_server_pg.py
    
Runs on PORT from environment (Railway) or 8080 locally.
"""

import os
import json
import base64
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List
import uuid

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

# Import vision extractor
from vision_extractor import extract_with_vision, flatten_extraction, CONFIDENCE_THRESHOLD

# ============================================================
# Configuration
# ============================================================

# Load .env file if exists (local development)
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://mcoadmin:McOadv2026!Secure@mco-advantage-db.caxy4ekouaq9.us-east-1.rds.amazonaws.com:5432/mco_advantage")
PORT = int(os.getenv("PORT", 8080))


def get_db_connection():
    """Get PostgreSQL database connection."""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn


def init_db():
    """Initialize database - tables should already exist in RDS."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'optalis_applications'
        )
    """)
    exists = cursor.fetchone()['exists']
    
    if not exists:
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE optalis_applications (
                id VARCHAR(50) PRIMARY KEY,
                status VARCHAR(50) DEFAULT 'pending',
                priority VARCHAR(50) DEFAULT 'normal',
                source VARCHAR(100),
                source_email VARCHAR(255),
                patient_name VARCHAR(255),
                dob VARCHAR(50),
                phone VARCHAR(50),
                address TEXT,
                insurance VARCHAR(255),
                policy_number VARCHAR(100),
                diagnosis JSONB DEFAULT '[]',
                medications JSONB DEFAULT '[]',
                allergies JSONB DEFAULT '[]',
                physician VARCHAR(255),
                facility VARCHAR(255),
                services JSONB DEFAULT '[]',
                ai_summary TEXT,
                confidence_score DECIMAL(5,2),
                raw_text TEXT,
                raw_email_subject VARCHAR(500),
                s3_key VARCHAR(500),
                notes TEXT,
                extra_data JSONB,
                precert_status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        conn.commit()
        print("✅ Created optalis_applications table")
    else:
        # Add precert_status column if it doesn't exist (migration for existing tables)
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'optalis_applications' AND column_name = 'precert_status'
            )
        """)
        has_precert = cursor.fetchone()['exists']
        if not has_precert:
            cursor.execute("ALTER TABLE optalis_applications ADD COLUMN precert_status VARCHAR(50) DEFAULT 'pending'")
            conn.commit()
            print("✅ Added precert_status column")
    
    cursor.close()
    conn.close()
    print("✅ Database initialized")


# Initialize DB on startup
init_db()


# ============================================================
# FastAPI App
# ============================================================

app = FastAPI(title="Optalis API", description="Healthcare admissions application management")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security headers middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)


# ============================================================
# Models
# ============================================================

class ApplicationCreate(BaseModel):
    id: Optional[str] = None
    status: str = "pending"
    priority: str = "normal"
    source: Optional[str] = None
    source_email: Optional[str] = None
    patient_name: Optional[str] = None
    dob: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    insurance: Optional[str] = None
    policy_number: Optional[str] = None
    diagnosis: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    physician: Optional[str] = None
    facility: Optional[str] = None
    services: Optional[List[str]] = []
    ai_summary: Optional[str] = None
    confidence_score: Optional[float] = None
    raw_text: Optional[str] = None
    raw_email_subject: Optional[str] = None
    s3_key: Optional[str] = None
    notes: Optional[str] = None
    extra_data: Optional[dict] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    # Optalis-specific fields
    referral_type: Optional[str] = None
    hospital: Optional[str] = None
    building: Optional[str] = None
    care_level: Optional[str] = None
    sex: Optional[str] = None
    ssn_last4: Optional[str] = None
    room_number: Optional[str] = None
    date_admitted: Optional[str] = None
    inpatient_date: Optional[str] = None
    anticipated_discharge: Optional[str] = None
    case_manager_name: Optional[str] = None
    case_manager_phone: Optional[str] = None
    fall_risk: Optional[bool] = None
    smoking_status: Optional[str] = None
    isolation: Optional[str] = None
    barrier_precautions: Optional[str] = None
    dme: Optional[str] = None
    diet: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    infection_prevention: Optional[str] = None
    iv_meds: Optional[str] = None
    expensive_meds: Optional[str] = None
    clinical_summary: Optional[str] = None
    therapy_prior_level: Optional[str] = None
    therapy_bed_mobility: Optional[str] = None
    therapy_transfers: Optional[str] = None
    therapy_gait: Optional[str] = None
    decision_status: Optional[str] = None
    decision_notes: Optional[str] = None
    last_updated_by: Optional[str] = None
    precert_status: Optional[str] = "pending"


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    patient_name: Optional[str] = None
    dob: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    insurance: Optional[str] = None
    policy_number: Optional[str] = None
    diagnosis: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    physician: Optional[str] = None
    facility: Optional[str] = None
    services: Optional[List[str]] = None
    notes: Optional[str] = None
    # Optalis-specific fields
    referral_type: Optional[str] = None
    hospital: Optional[str] = None
    building: Optional[str] = None
    care_level: Optional[str] = None
    sex: Optional[str] = None
    ssn_last4: Optional[str] = None
    room_number: Optional[str] = None
    date_admitted: Optional[str] = None
    inpatient_date: Optional[str] = None
    anticipated_discharge: Optional[str] = None
    case_manager_name: Optional[str] = None
    case_manager_phone: Optional[str] = None
    fall_risk: Optional[bool] = None
    smoking_status: Optional[str] = None
    isolation: Optional[str] = None
    barrier_precautions: Optional[str] = None
    dme: Optional[str] = None
    diet: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    infection_prevention: Optional[str] = None
    iv_meds: Optional[str] = None
    expensive_meds: Optional[str] = None
    clinical_summary: Optional[str] = None
    therapy_prior_level: Optional[str] = None
    therapy_bed_mobility: Optional[str] = None
    therapy_transfers: Optional[str] = None
    therapy_gait: Optional[str] = None
    decision_status: Optional[str] = None
    decision_notes: Optional[str] = None
    last_updated_by: Optional[str] = None
    precert_status: Optional[str] = None


# ============================================================
# Helper Functions
# ============================================================

def row_to_dict(row) -> dict:
    """Convert database row to dictionary."""
    if row is None:
        return None
    d = dict(row)
    # Handle JSONB fields that are already parsed
    for field in ["diagnosis", "medications", "allergies", "services", "extra_data"]:
        if field in d and d[field] is None:
            d[field] = []
    return d


# ============================================================
# Routes
# ============================================================

@app.get("/")
async def root():
    return {"service": "Optalis API", "status": "running", "database": "PostgreSQL (AWS RDS)"}


@app.get("/health")
async def health():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.get("/api/applications")
async def list_applications(
    status: Optional[str] = None, 
    facility_id: Optional[str] = None,
    limit: int = 100
):
    """List all applications, optionally filtered by status and/or facility."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Build dynamic query
    conditions = []
    params = []
    
    if status:
        conditions.append("status = %s")
        params.append(status)
    
    if facility_id:
        conditions.append("facility_id = %s")
        params.append(facility_id)
    
    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)
    
    params.append(limit)
    
    cursor.execute(
        f"SELECT * FROM optalis_applications {where_clause} ORDER BY created_at DESC LIMIT %s",
        params
    )
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return [row_to_dict(row) for row in rows]


@app.get("/api/applications/{app_id}")
async def get_application(app_id: str):
    """Get a single application by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM optalis_applications WHERE id = %s", (app_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return row_to_dict(row)


@app.post("/api/applications")
async def create_application(request: ApplicationCreate):
    """Create a new application."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # DUPLICATE PREVENTION: Check if same patient_name was created in last 5 minutes
    if request.patient_name:
        cursor.execute("""
            SELECT id FROM optalis_applications 
            WHERE patient_name = %s 
            AND created_at > NOW() - INTERVAL '5 minutes'
            LIMIT 1
        """, (request.patient_name,))
        existing = cursor.fetchone()
        if existing:
            cursor.close()
            conn.close()
            print(f"⚠️ Duplicate prevented: {request.patient_name} (existing: {existing['id']})")
            raise HTTPException(
                status_code=409, 
                detail=f"Duplicate application: An application for {request.patient_name} was created in the last 5 minutes"
            )
    
    # Generate ID if not provided
    app_id = request.id or f"APP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc).isoformat()
    
    cursor.execute("""
        INSERT INTO optalis_applications (
            id, status, priority, source, source_email,
            patient_name, dob, phone, address,
            insurance, policy_number,
            diagnosis, medications, allergies,
            physician, facility, services,
            ai_summary, confidence_score,
            raw_text, raw_email_subject, s3_key, notes, extra_data,
            created_at, updated_at,
            -- Optalis-specific fields
            referral_type, hospital, building, care_level,
            sex, ssn_last4, room_number,
            date_admitted, inpatient_date, anticipated_discharge,
            case_manager_name, case_manager_phone,
            fall_risk, smoking_status, isolation, barrier_precautions,
            dme, diet, height, weight, infection_prevention,
            iv_meds, expensive_meds, clinical_summary,
            therapy_prior_level, therapy_bed_mobility, therapy_transfers, therapy_gait,
            decision_status, decision_notes, last_updated_by
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s,
            -- Optalis-specific values
            %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s
        )
        RETURNING *
    """, (
        app_id,
        request.status,
        request.priority,
        request.source,
        request.source_email,
        request.patient_name,
        request.dob,
        request.phone,
        request.address,
        request.insurance,
        request.policy_number,
        json.dumps(request.diagnosis or []),
        json.dumps(request.medications or []),
        json.dumps(request.allergies or []),
        request.physician,
        request.facility,
        json.dumps(request.services or []),
        request.ai_summary,
        request.confidence_score,
        request.raw_text,
        request.raw_email_subject,
        request.s3_key,
        request.notes,
        json.dumps(request.extra_data) if request.extra_data else None,
        request.created_at or now,
        request.updated_at or now,
        # Optalis-specific fields
        request.referral_type,
        request.hospital,
        request.building,
        request.care_level,
        request.sex,
        request.ssn_last4,
        request.room_number,
        request.date_admitted,
        request.inpatient_date,
        request.anticipated_discharge,
        request.case_manager_name,
        request.case_manager_phone,
        request.fall_risk,
        request.smoking_status,
        request.isolation,
        request.barrier_precautions,
        request.dme,
        request.diet,
        request.height,
        request.weight,
        request.infection_prevention,
        request.iv_meds,
        request.expensive_meds,
        request.clinical_summary,
        request.therapy_prior_level,
        request.therapy_bed_mobility,
        request.therapy_transfers,
        request.therapy_gait,
        request.decision_status,
        request.decision_notes,
        request.last_updated_by
    ))
    
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    result = row_to_dict(row)
    
    # Auto-analyze the new application
    try:
        await analyze_application(app_id)
    except Exception as e:
        print(f"Auto-analysis failed for {app_id}: {e}")
    
    return result


@app.patch("/api/applications/{app_id}")
async def update_application(app_id: str, update: ApplicationUpdate):
    """Update an application."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if application exists
    cursor.execute("SELECT id FROM optalis_applications WHERE id = %s", (app_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Build update query dynamically
    updates = []
    values = []
    
    update_dict = update.dict(exclude_none=True)
    for field, value in update_dict.items():
        if field in ["diagnosis", "medications", "allergies", "services"]:
            value = json.dumps(value)
        updates.append(f"{field} = %s")
        values.append(value)
    
    if not updates:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Add updated_at
    updates.append("updated_at = %s")
    values.append(datetime.now(timezone.utc).isoformat())
    values.append(app_id)
    
    query = f"UPDATE optalis_applications SET {', '.join(updates)} WHERE id = %s"
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    
    return {"status": "updated", "id": app_id}


@app.delete("/api/applications/{app_id}")
async def delete_application(app_id: str):
    """Delete an application."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM optalis_applications WHERE id = %s RETURNING id", (app_id,))
    deleted = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"status": "deleted", "id": app_id}


@app.get("/api/applications/{app_id}/documents")
async def get_application_documents(app_id: str):
    """Get documents/raw data for an application."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, raw_text, raw_email_subject, source_email, s3_key, 
               ai_summary, confidence_score, created_at
        FROM optalis_applications 
        WHERE id = %s
    """, (app_id,))
    
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = dict(row)
    
    # Return document data in expected format
    return {
        "original": {
            "type": "email",
            "subject": app_data.get('raw_email_subject', ''),
            "from": app_data.get('source_email', ''),
            "body": app_data.get('raw_text', ''),
            "s3_key": app_data.get('s3_key', ''),
            "received_at": app_data.get('created_at', '')
        },
        "extracted": {
            "ai_summary": app_data.get('ai_summary', ''),
            "confidence_score": app_data.get('confidence_score', 0),
            "application_id": app_data.get('id', '')
        }
    }


@app.get("/api/applications/{app_id}/document/original")
async def get_original_document(app_id: str):
    """Get original document/email content for an application."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT raw_text, raw_email_subject, source_email, s3_key, created_at
        FROM optalis_applications 
        WHERE id = %s
    """, (app_id,))
    
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    
    data = dict(row)
    
    return {
        "type": "email",
        "subject": data.get('raw_email_subject', ''),
        "from": data.get('source_email', ''),
        "body": data.get('raw_text', ''),
        "s3_key": data.get('s3_key', ''),
        "received_at": data.get('created_at', '')
    }


@app.get("/api/applications/{app_id}/document/extracted")
async def get_extracted_document(app_id: str):
    """Get AI-extracted data for an application."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Select all fields that AI extraction populates
    cursor.execute("""
        SELECT id, patient_name, dob, phone, address, insurance, policy_number,
               diagnosis, medications, allergies, physician, facility, services,
               ai_summary, confidence_score,
               referral_type, hospital, building, care_level, sex, ssn_last4,
               room_number, date_admitted, inpatient_date, anticipated_discharge,
               case_manager_name, case_manager_phone, fall_risk, smoking_status,
               isolation, barrier_precautions, dme, diet, height, weight,
               clinical_summary, therapy_prior_level, therapy_bed_mobility,
               therapy_transfers, therapy_gait
        FROM optalis_applications 
        WHERE id = %s
    """, (app_id,))
    
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    
    data = dict(row)
    
    return {
        "application_id": data.get('id', ''),
        # Patient Info
        "patient_name": data.get('patient_name', ''),
        "dob": data.get('dob', ''),
        "sex": data.get('sex', ''),
        "phone": data.get('phone', ''),
        "address": data.get('address', ''),
        "ssn_last4": data.get('ssn_last4', ''),
        "height": data.get('height', ''),
        "weight": data.get('weight', ''),
        # Referral Info
        "referral_type": data.get('referral_type', ''),
        "hospital": data.get('hospital', ''),
        "building": data.get('building', ''),
        "room_number": data.get('room_number', ''),
        "case_manager_name": data.get('case_manager_name', ''),
        "case_manager_phone": data.get('case_manager_phone', ''),
        # Insurance & Dates
        "insurance": data.get('insurance', ''),
        "policy_number": data.get('policy_number', ''),
        "care_level": data.get('care_level', ''),
        "date_admitted": data.get('date_admitted', ''),
        "inpatient_date": data.get('inpatient_date', ''),
        "anticipated_discharge": data.get('anticipated_discharge', ''),
        # Medical Info
        "physician": data.get('physician', ''),
        "facility": data.get('facility', ''),
        "diagnosis": data.get('diagnosis', []),
        "medications": data.get('medications', []),
        "allergies": data.get('allergies', []),
        "services": data.get('services', []),
        # Clinical
        "fall_risk": data.get('fall_risk', False),
        "smoking_status": data.get('smoking_status', ''),
        "isolation": data.get('isolation', ''),
        "barrier_precautions": data.get('barrier_precautions', ''),
        "dme": data.get('dme', ''),
        "diet": data.get('diet', ''),
        "clinical_summary": data.get('clinical_summary', ''),
        # Therapy
        "therapy_prior_level": data.get('therapy_prior_level', ''),
        "therapy_bed_mobility": data.get('therapy_bed_mobility', ''),
        "therapy_transfers": data.get('therapy_transfers', ''),
        "therapy_gait": data.get('therapy_gait', ''),
        # AI Analysis
        "ai_summary": data.get('ai_summary', ''),
        "confidence_score": data.get('confidence_score', 0)
    }


@app.get("/api/stats")
async def get_stats():
    """Get application statistics."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'review') as review,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'denied') as denied
        FROM optalis_applications
    """)
    
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return dict(row)


@app.get("/api/locations")
async def get_locations():
    """Get list of unique facility locations."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DISTINCT facility as name
        FROM optalis_applications
        WHERE facility IS NOT NULL AND facility != ''
        ORDER BY facility
    """)
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return [dict(row) for row in rows]


@app.post("/api/scan")
async def scan_document(file: UploadFile = File(None), images: UploadFile = File(None)):
    """Scan a document and extract patient information using AI Vision."""
    try:
        # Support both 'file' and 'images' parameter names
        upload_file = file or images
        if not upload_file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Read file content
        content = await upload_file.read()
        
        # Extract using vision - pass as list of image bytes
        result = extract_with_vision(
            image_data_list=[content],
            subject="Mobile Document Scan",
            email_body="Document scanned via mobile app"
        )
        
        # Flatten for response
        extracted = flatten_extraction(result)
        
        # DUPLICATE PREVENTION: Check if same patient_name was created in last 5 minutes
        patient_name = extracted.get('patient_name')
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if patient_name:
            cursor.execute("""
                SELECT id FROM optalis_applications 
                WHERE patient_name = %s 
                AND created_at > NOW() - INTERVAL '5 minutes'
                LIMIT 1
            """, (patient_name,))
            existing = cursor.fetchone()
            if existing:
                cursor.close()
                conn.close()
                print(f"⚠️ Scan duplicate prevented: {patient_name} (existing: {existing['id']})")
                return {
                    "success": False,
                    "duplicate": True,
                    "existing_id": existing['id'],
                    "message": f"An application for {patient_name} was already created recently"
                }
        
        # Generate application ID
        app_id = f"APP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute("""
            INSERT INTO optalis_applications (
                id, status, priority, source, source_email,
                patient_name, dob, phone, address,
                insurance, policy_number,
                diagnosis, medications, allergies,
                physician, facility, services,
                ai_summary, confidence_score,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s,
                %s, %s
            )
            RETURNING *
        """, (
            app_id,
            'pending',
            extracted.get('priority', 'normal'),
            'Mobile Scan',
            None,
            extracted.get('patient_name'),
            extracted.get('dob'),
            extracted.get('phone'),
            extracted.get('address'),
            extracted.get('insurance'),
            extracted.get('policy_number'),
            json.dumps(extracted.get('diagnosis', [])),
            json.dumps(extracted.get('medications', [])),
            json.dumps(extracted.get('allergies', [])),
            extracted.get('physician'),
            extracted.get('facility', 'Optalis Healthcare'),
            json.dumps(extracted.get('services', [])),
            extracted.get('ai_summary'),
            extracted.get('confidence_score'),
            now,
            now
        ))
        
        row = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        app_data = row_to_dict(row)
        
        # Auto-analyze the new application
        try:
            await analyze_application(app_data['id'])
            # Re-fetch to get analysis results
            conn2 = get_db_connection()
            cursor2 = conn2.cursor()
            cursor2.execute("SELECT * FROM optalis_applications WHERE id = %s", (app_data['id'],))
            app_data = row_to_dict(cursor2.fetchone())
            cursor2.close()
            conn2.close()
        except Exception as e:
            print(f"Auto-analysis failed for scan: {e}")
        
        # Return format expected by mobile app
        return {
            "success": True,
            "applicationId": app_data['id'],
            "patientName": app_data.get('patient_name'),
            "confidence": app_data.get('confidence_score'),
            "suggestedDecision": app_data.get('suggested_decision'),
            "flaggedItems": app_data.get('flagged_items', []),
            "application": app_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


# ============================================================
# Analytics Endpoints
# ============================================================

def get_date_range(period: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Calculate date range based on period or custom dates."""
    now = datetime.now(timezone.utc)
    
    if start_date and end_date:
        return start_date, end_date
    
    if period == "week":
        start = (now - timedelta(days=7)).isoformat()
    elif period == "month":
        start = (now - timedelta(days=30)).isoformat()
    elif period == "quarter":
        start = (now - timedelta(days=90)).isoformat()
    else:
        start = (now - timedelta(days=30)).isoformat()  # Default to month
    
    return start, now.isoformat()


@app.get("/api/analytics/overview")
async def analytics_overview(
    period: str = "month",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get analytics overview KPIs."""
    start, end = get_date_range(period, start_date, end_date)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get current period stats
    cursor.execute("""
        SELECT 
            COUNT(*) as total_applications,
            COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
            COUNT(*) FILTER (WHERE status = 'denied') as denied_count,
            COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
            COUNT(*) FILTER (WHERE status = 'review') as review_count,
            AVG(
                CASE 
                    WHEN status IN ('approved', 'denied') AND updated_at IS NOT NULL AND created_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (updated_at::timestamp - created_at::timestamp)) / 3600
                    ELSE NULL 
                END
            ) as avg_time_to_decision
        FROM optalis_applications
        WHERE created_at >= %s AND created_at <= %s
    """, (start, end))
    
    current = dict(cursor.fetchone())
    
    # Calculate conversion rate
    total = current['total_applications'] or 0
    approved = current['approved_count'] or 0
    current['conversion_rate'] = round((approved / total * 100), 1) if total > 0 else 0
    current['avg_time_to_decision'] = round(current['avg_time_to_decision'] or 0, 1)
    
    # Get previous period stats for comparison
    period_days = {"week": 7, "month": 30, "quarter": 90}.get(period, 30)
    prev_start = (datetime.fromisoformat(start.replace('Z', '+00:00')) - timedelta(days=period_days)).isoformat()
    prev_end = start
    
    cursor.execute("""
        SELECT 
            COUNT(*) as total_applications,
            COUNT(*) FILTER (WHERE status = 'approved') as approved_count
        FROM optalis_applications
        WHERE created_at >= %s AND created_at < %s
    """, (prev_start, prev_end))
    
    previous = dict(cursor.fetchone())
    prev_total = previous['total_applications'] or 0
    prev_approved = previous['approved_count'] or 0
    prev_conversion = round((prev_approved / prev_total * 100), 1) if prev_total > 0 else 0
    
    # Calculate changes
    current['total_change'] = round(((total - prev_total) / prev_total * 100), 1) if prev_total > 0 else 0
    current['conversion_change'] = round(current['conversion_rate'] - prev_conversion, 1)
    
    cursor.close()
    conn.close()
    
    return current


@app.get("/api/analytics/volume")
async def analytics_volume(
    period: str = "month",
    granularity: str = "day"
):
    """Get application volume over time for charting."""
    start, end = get_date_range(period)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if granularity == "week":
        date_trunc = "week"
    else:
        date_trunc = "day"
    
    cursor.execute(f"""
        SELECT 
            DATE_TRUNC('{date_trunc}', created_at::timestamp) as date,
            COUNT(*) as count,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'denied') as denied,
            COUNT(*) FILTER (WHERE status = 'pending') as pending
        FROM optalis_applications
        WHERE created_at >= %s AND created_at <= %s
        GROUP BY DATE_TRUNC('{date_trunc}', created_at::timestamp)
        ORDER BY date ASC
    """, (start, end))
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    result = []
    for row in rows:
        r = dict(row)
        r['date'] = r['date'].isoformat() if r['date'] else None
        result.append(r)
    
    return result


@app.get("/api/analytics/referrals")
async def analytics_referrals(
    period: str = "month",
    limit: int = 20
):
    """Get referral source breakdown."""
    start, end = get_date_range(period)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COALESCE(source, 'Unknown') as source,
            COALESCE(hospital, facility, 'Unknown') as hospital,
            COUNT(*) as count,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'denied') as denied
        FROM optalis_applications
        WHERE created_at >= %s AND created_at <= %s
        GROUP BY COALESCE(source, 'Unknown'), COALESCE(hospital, facility, 'Unknown')
        ORDER BY count DESC
        LIMIT %s
    """, (start, end, limit))
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    result = []
    for row in rows:
        r = dict(row)
        total = r['count'] or 0
        approved = r['approved'] or 0
        r['conversion_rate'] = round((approved / total * 100), 1) if total > 0 else 0
        result.append(r)
    
    return result


@app.get("/api/analytics/payer-mix")
async def analytics_payer_mix(period: str = "month"):
    """Get insurance/payer breakdown."""
    try:
        start, end = get_date_range(period)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT 
                COALESCE(
                    CASE 
                        WHEN LOWER(insurance) LIKE '%%medicare%%' THEN 'Medicare'
                        WHEN LOWER(insurance) LIKE '%%medicaid%%' THEN 'Medicaid'
                        WHEN LOWER(insurance) LIKE '%%private%%' OR LOWER(insurance) LIKE '%%self%%' THEN 'Private Pay'
                        WHEN insurance IS NULL OR insurance = '' THEN 'Unknown'
                        ELSE 'Commercial'
                    END,
                    'Unknown'
                ) as payer,
                COUNT(*) as count
            FROM optalis_applications
            WHERE created_at >= %s AND created_at <= %s
            GROUP BY 1
            ORDER BY 2 DESC
        """, (start, end))
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not rows:
            return []
        
        total = sum(r['count'] for r in rows)
        result = []
        for row in rows:
            r = dict(row)
            r['percentage'] = round((r['count'] / total * 100), 1) if total > 0 else 0
            result.append(r)
        
        return result
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"payer-mix error: {str(e)} | {traceback.format_exc()}")


@app.get("/api/analytics/response-time")
async def analytics_response_time(period: str = "month"):
    """Get time-to-decision distribution."""
    try:
        start, end = get_date_range(period)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Simpler query - calculate buckets in Python for reliability
        cursor.execute("""
            SELECT 
                EXTRACT(EPOCH FROM (updated_at::timestamp - created_at::timestamp)) / 3600 as hours
            FROM optalis_applications
            WHERE status IN ('approved', 'denied')
            AND created_at >= %s AND created_at <= %s
            AND updated_at IS NOT NULL
        """, (start, end))
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Count into buckets
        bucket_counts = {'<2hr': 0, '2-4hr': 0, '4-8hr': 0, '8-24hr': 0, '1-2d': 0, '>2d': 0}
        for row in rows:
            hours = row['hours'] or 0
            if hours < 2:
                bucket_counts['<2hr'] += 1
            elif hours < 4:
                bucket_counts['2-4hr'] += 1
            elif hours < 8:
                bucket_counts['4-8hr'] += 1
            elif hours < 24:
                bucket_counts['8-24hr'] += 1
            elif hours < 48:
                bucket_counts['1-2d'] += 1
            else:
                bucket_counts['>2d'] += 1
        
        buckets = ['<2hr', '2-4hr', '4-8hr', '8-24hr', '1-2d', '>2d']
        return [{'bucket': b, 'count': bucket_counts[b]} for b in buckets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"response-time error: {str(e)}")


@app.get("/api/analytics/locations")
async def analytics_locations(period: str = "month"):
    """Get per-facility/location statistics."""
    start, end = get_date_range(period)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COALESCE(facility, 'Unknown') as location,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'denied') as denied,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            AVG(
                CASE 
                    WHEN status IN ('approved', 'denied') AND updated_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (updated_at::timestamp - created_at::timestamp)) / 3600
                    ELSE NULL 
                END
            ) as avg_response_time
        FROM optalis_applications
        WHERE created_at >= %s AND created_at <= %s
        GROUP BY COALESCE(facility, 'Unknown')
        ORDER BY total DESC
    """, (start, end))
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    result = []
    for row in rows:
        r = dict(row)
        total = r['total'] or 0
        approved = r['approved'] or 0
        r['conversion_rate'] = round((approved / total * 100), 1) if total > 0 else 0
        r['avg_response_time'] = round(r['avg_response_time'] or 0, 1)
        result.append(r)
    
    return result


@app.get("/api/analytics/denial-reasons")
async def analytics_denial_reasons(period: str = "month"):
    """Get denial reason breakdown from decision_notes."""
    try:
        start, end = get_date_range(period)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Categorize denial reasons based on keywords in decision_notes
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN LOWER(COALESCE(decision_notes, '')) LIKE '%%capacity%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%bed%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%full%%' THEN 'Capacity/No Beds'
                    WHEN LOWER(COALESCE(decision_notes, '')) LIKE '%%insurance%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%coverage%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%payer%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%authorization%%' THEN 'Insurance/Coverage'
                    WHEN LOWER(COALESCE(decision_notes, '')) LIKE '%%clinical%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%acuity%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%medical%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%condition%%' THEN 'Clinical/Acuity'
                    WHEN LOWER(COALESCE(decision_notes, '')) LIKE '%%behavior%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%psych%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%mental%%' THEN 'Behavioral/Psych'
                    WHEN LOWER(COALESCE(decision_notes, '')) LIKE '%%document%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%incomplete%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%missing%%' THEN 'Incomplete Documentation'
                    WHEN LOWER(COALESCE(decision_notes, '')) LIKE '%%service%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%level%%' OR LOWER(COALESCE(decision_notes, '')) LIKE '%%care%%' THEN 'Service Level Mismatch'
                    WHEN decision_notes IS NULL OR decision_notes = '' THEN 'Not Specified'
                    ELSE 'Other'
                END as reason,
                COUNT(*) as count
            FROM optalis_applications
            WHERE status = 'denied'
            AND created_at >= %s AND created_at <= %s
            GROUP BY 1
            ORDER BY 2 DESC
        """, (start, end))
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not rows:
            return []
        
        total = sum(r['count'] for r in rows)
        result = []
        for row in rows:
            r = dict(row)
            r['percentage'] = round((r['count'] / total * 100), 1) if total > 0 else 0
            result.append(r)
        
        return result
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"denial-reasons error: {str(e)} | {traceback.format_exc()}")


@app.get("/api/analytics/reviewers")
async def analytics_reviewers(period: str = "month"):
    """Get reviewer/case manager performance stats."""
    start, end = get_date_range(period)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COALESCE(last_updated_by, 'Unknown') as reviewer,
            COUNT(*) as total_reviews,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'denied') as denied,
            AVG(
                CASE 
                    WHEN updated_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (updated_at::timestamp - created_at::timestamp)) / 3600
                    ELSE NULL 
                END
            ) as avg_time_hours
        FROM optalis_applications
        WHERE status IN ('approved', 'denied')
        AND created_at >= %s AND created_at <= %s
        GROUP BY COALESCE(last_updated_by, 'Unknown')
        ORDER BY total_reviews DESC
    """, (start, end))
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    result = []
    for row in rows:
        r = dict(row)
        total = r['total_reviews'] or 0
        approved = r['approved'] or 0
        r['approval_rate'] = round((approved / total * 100), 1) if total > 0 else 0
        r['avg_time_hours'] = round(r['avg_time_hours'] or 0, 1)
        result.append(r)
    
    return result


# ============================================================
# Migrations
# ============================================================

@app.post("/api/migrate/fix-confidence-scores")
async def migrate_fix_confidence_scores(secret: str = ""):
    """One-time migration to fix confidence scores from decimals (0.95) to percentages (95)."""
    # Simple protection
    if secret != "optalis2026":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Count before
    cursor.execute("SELECT COUNT(*) as cnt FROM optalis_applications WHERE confidence_score IS NOT NULL AND confidence_score < 1")
    before = cursor.fetchone()['cnt']
    
    # Update
    cursor.execute("""
        UPDATE optalis_applications 
        SET confidence_score = confidence_score * 100 
        WHERE confidence_score IS NOT NULL AND confidence_score < 1
    """)
    updated = cursor.rowcount
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {
        "success": True,
        "message": f"Fixed {updated} applications (found {before} with decimal confidence scores)"
    }


# ============================================================
# FACILITIES
# ============================================================

@app.get("/api/facilities")
async def list_facilities():
    """List all facilities."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM facilities WHERE is_active = true ORDER BY name")
    facilities = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(f) for f in facilities]

@app.post("/api/facilities")
async def create_facility(request: Request):
    """Create a new facility."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO facilities (name, address, city, state, zip, phone, total_beds)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """, (data.get('name'), data.get('address'), data.get('city'), 
          data.get('state'), data.get('zip'), data.get('phone'), 
          data.get('total_beds', 0)))
    
    facility = dict(cursor.fetchone())
    conn.commit()
    cursor.close()
    conn.close()
    return facility

@app.patch("/api/facilities/{facility_id}")
async def update_facility(facility_id: str, request: Request):
    """Update a facility."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    values = []
    for key in ['name', 'address', 'city', 'state', 'zip', 'phone', 'total_beds', 'is_active']:
        if key in data:
            updates.append(f"{key} = %s")
            values.append(data[key])
    
    if updates:
        values.append(facility_id)
        cursor.execute(f"UPDATE facilities SET {', '.join(updates)}, updated_at = NOW() WHERE id = %s RETURNING *", values)
        facility = cursor.fetchone()
        conn.commit()
    
    cursor.close()
    conn.close()
    return dict(facility) if facility else {"error": "Not found"}

@app.delete("/api/facilities/{facility_id}")
async def delete_facility(facility_id: str):
    """Delete a facility."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE facilities SET is_active = false WHERE id = %s", (facility_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "deleted"}


# ============================================================
# BEDS
# ============================================================

@app.get("/api/facilities/{facility_id}/beds")
async def list_beds(facility_id: str, status: str = None):
    """List all beds for a facility."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status:
        cursor.execute("SELECT * FROM beds WHERE facility_id = %s AND status = %s ORDER BY room_number, bed_identifier", (facility_id, status))
    else:
        cursor.execute("SELECT * FROM beds WHERE facility_id = %s ORDER BY room_number, bed_identifier", (facility_id,))
    
    beds = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(b) for b in beds]

@app.get("/api/facilities/{facility_id}/beds/summary")
async def beds_summary(facility_id: str):
    """Get bed availability summary for a facility."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Available now
    cursor.execute("SELECT COUNT(*) as count FROM beds WHERE facility_id = %s AND status = 'available'", (facility_id,))
    available_now = cursor.fetchone()['count']
    
    # Coming available in 24 hours
    cursor.execute("""
        SELECT COUNT(*) as count FROM beds 
        WHERE facility_id = %s 
        AND status IN ('occupied', 'reserved')
        AND available_date IS NOT NULL
        AND (available_date < CURRENT_DATE + INTERVAL '1 day' 
             OR (available_date = CURRENT_DATE AND available_time IS NOT NULL))
    """, (facility_id,))
    next_24h = cursor.fetchone()['count']
    
    # Coming available in 7 days
    cursor.execute("""
        SELECT COUNT(*) as count FROM beds 
        WHERE facility_id = %s 
        AND status IN ('occupied', 'reserved')
        AND available_date IS NOT NULL
        AND available_date <= CURRENT_DATE + INTERVAL '7 days'
    """, (facility_id,))
    next_7d = cursor.fetchone()['count']
    
    # Total beds
    cursor.execute("SELECT COUNT(*) as count FROM beds WHERE facility_id = %s", (facility_id,))
    total = cursor.fetchone()['count']
    
    # Occupied
    cursor.execute("SELECT COUNT(*) as count FROM beds WHERE facility_id = %s AND status = 'occupied'", (facility_id,))
    occupied = cursor.fetchone()['count']
    
    cursor.close()
    conn.close()
    
    return {
        "available_now": available_now,
        "next_24_hours": next_24h,
        "next_7_days": next_7d,
        "total_beds": total,
        "occupied": occupied
    }

@app.get("/api/facilities/{facility_id}/beds/upcoming")
async def beds_upcoming(facility_id: str, days: int = 7):
    """Get beds becoming available in the next X days."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM beds 
        WHERE facility_id = %s 
        AND status IN ('occupied', 'reserved')
        AND available_date IS NOT NULL
        AND available_date <= CURRENT_DATE + INTERVAL '%s days'
        ORDER BY available_date, available_time
    """, (facility_id, days))
    
    beds = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(b) for b in beds]

@app.post("/api/facilities/{facility_id}/beds")
async def create_bed(facility_id: str, request: Request):
    """Create a new bed."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO beds (facility_id, room_number, bed_identifier, bed_type, status, notes)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING *
    """, (facility_id, data.get('room_number'), data.get('bed_identifier', 'A'),
          data.get('bed_type', 'standard'), data.get('status', 'available'), data.get('notes')))
    
    bed = dict(cursor.fetchone())
    conn.commit()
    cursor.close()
    conn.close()
    return bed

@app.patch("/api/beds/{bed_id}")
async def update_bed(bed_id: str, request: Request):
    """Update a bed's status and availability."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    values = []
    for key in ['room_number', 'bed_identifier', 'bed_type', 'status', 
                'current_patient_id', 'current_patient_name', 
                'available_date', 'available_time', 'notes']:
        if key in data:
            updates.append(f"{key} = %s")
            values.append(data[key])
    
    if updates:
        values.append(bed_id)
        cursor.execute(f"UPDATE beds SET {', '.join(updates)}, updated_at = NOW() WHERE id = %s RETURNING *", values)
        bed = cursor.fetchone()
        conn.commit()
    
    cursor.close()
    conn.close()
    return dict(bed) if bed else {"error": "Not found"}

@app.delete("/api/beds/{bed_id}")
async def delete_bed(bed_id: str):
    """Delete a bed."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM beds WHERE id = %s", (bed_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "deleted"}


# ============================================================
# FLAGGED CONDITIONS
# ============================================================

@app.get("/api/flagged-conditions")
async def list_flagged_conditions(facility_id: str = None):
    """List all flagged conditions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if facility_id:
        cursor.execute("""
            SELECT * FROM flagged_conditions 
            WHERE (facility_id = %s OR facility_id IS NULL) AND is_active = true
            ORDER BY condition_type, condition_name
        """, (facility_id,))
    else:
        cursor.execute("SELECT * FROM flagged_conditions WHERE is_active = true ORDER BY condition_type, condition_name")
    
    conditions = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(c) for c in conditions]

@app.post("/api/flagged-conditions")
async def create_flagged_condition(request: Request):
    """Create a new flagged condition."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO flagged_conditions (facility_id, condition_name, condition_type, description)
        VALUES (%s, %s, %s, %s)
        RETURNING *
    """, (data.get('facility_id'), data.get('condition_name'), 
          data.get('condition_type', 'flag'), data.get('description')))
    
    condition = dict(cursor.fetchone())
    conn.commit()
    cursor.close()
    conn.close()
    return condition

@app.patch("/api/flagged-conditions/{condition_id}")
async def update_flagged_condition(condition_id: str, request: Request):
    """Update a flagged condition."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    values = []
    for key in ['condition_name', 'condition_type', 'description', 'is_active']:
        if key in data:
            updates.append(f"{key} = %s")
            values.append(data[key])
    
    if updates:
        values.append(condition_id)
        cursor.execute(f"UPDATE flagged_conditions SET {', '.join(updates)} WHERE id = %s RETURNING *", values)
        condition = cursor.fetchone()
        conn.commit()
    
    cursor.close()
    conn.close()
    return dict(condition) if condition else {"error": "Not found"}

@app.delete("/api/flagged-conditions/{condition_id}")
async def delete_flagged_condition(condition_id: str):
    """Delete a flagged condition."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE flagged_conditions SET is_active = false WHERE id = %s", (condition_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "deleted"}


# ============================================================
# DECISION RULES
# ============================================================

@app.get("/api/decision-rules")
async def list_decision_rules(facility_id: str = None):
    """List all decision rules."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if facility_id:
        cursor.execute("""
            SELECT * FROM decision_rules 
            WHERE (facility_id = %s OR facility_id IS NULL) AND is_active = true
            ORDER BY priority DESC, rule_name
        """, (facility_id,))
    else:
        cursor.execute("SELECT * FROM decision_rules WHERE is_active = true ORDER BY priority DESC, rule_name")
    
    rules = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(r) for r in rules]

@app.post("/api/decision-rules")
async def create_decision_rule(request: Request):
    """Create a new decision rule."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO decision_rules (facility_id, rule_name, rule_type, field_to_check, operator, value, reason_template, priority)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """, (data.get('facility_id'), data.get('rule_name'), data.get('rule_type'),
          data.get('field_to_check'), data.get('operator'), data.get('value'),
          data.get('reason_template'), data.get('priority', 0)))
    
    rule = dict(cursor.fetchone())
    conn.commit()
    cursor.close()
    conn.close()
    return rule

@app.patch("/api/decision-rules/{rule_id}")
async def update_decision_rule(rule_id: str, request: Request):
    """Update a decision rule."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    values = []
    for key in ['rule_name', 'rule_type', 'field_to_check', 'operator', 'value', 'reason_template', 'priority', 'is_active']:
        if key in data:
            updates.append(f"{key} = %s")
            values.append(data[key])
    
    if updates:
        values.append(rule_id)
        cursor.execute(f"UPDATE decision_rules SET {', '.join(updates)} WHERE id = %s RETURNING *", values)
        rule = cursor.fetchone()
        conn.commit()
    
    cursor.close()
    conn.close()
    return dict(rule) if rule else {"error": "Not found"}

@app.delete("/api/decision-rules/{rule_id}")
async def delete_decision_rule(rule_id: str):
    """Delete a decision rule."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE decision_rules SET is_active = false WHERE id = %s", (rule_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "deleted"}


# ============================================================
# SEX OFFENDER CHECK
# ============================================================

@app.patch("/api/applications/{app_id}/sex-offender-check")
async def update_sex_offender_check(app_id: str, request: Request):
    """Update the sex offender registry check for an application."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE optalis_applications 
        SET sex_offender_check = %s,
            sex_offender_checked_at = NOW(),
            sex_offender_checked_by = %s,
            updated_at = NOW()
        WHERE id = %s
        RETURNING id, sex_offender_check, sex_offender_checked_at, sex_offender_checked_by
    """, (data.get('is_offender', False), data.get('checked_by', 'Manual Check'), app_id))
    
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    return dict(result) if result else {"error": "Not found"}


# ============================================================
# AI ANALYSIS - Apply rules and flag conditions
# ============================================================

@app.post("/api/applications/{app_id}/analyze")
async def analyze_application(app_id: str):
    """
    Analyze an application against configured rules and conditions.
    Populates: flagged_items, suggested_decision, suggested_decision_reason, ai_overview
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get the application
    cursor.execute("SELECT * FROM optalis_applications WHERE id = %s", (app_id,))
    app = cursor.fetchone()
    if not app:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    app = dict(app)
    
    # Get active flagged conditions
    cursor.execute("SELECT * FROM flagged_conditions WHERE is_active = true")
    conditions = [dict(c) for c in cursor.fetchall()]
    
    # Get active decision rules (ordered by priority)
    cursor.execute("SELECT * FROM decision_rules WHERE is_active = true ORDER BY priority DESC")
    rules = [dict(r) for r in cursor.fetchall()]
    
    # Fields to search for conditions
    searchable_text = ' '.join([
        str(app.get('diagnosis') or ''),
        str(app.get('medications') or ''),
        str(app.get('services') or ''),
        str(app.get('dme') or ''),
        str(app.get('clinical_summary') or ''),
        str(app.get('ai_summary') or ''),
        str(app.get('notes') or ''),
    ]).lower()
    
    # Find flagged items
    flagged_items = []
    flagged_types = {}  # Track types: auto_deny, auto_approve, needs_review, flag
    
    for condition in conditions:
        condition_name = condition['condition_name'].lower()
        if condition_name in searchable_text:
            flagged_items.append(condition['condition_name'])
            condition_type = condition['condition_type']
            if condition_type not in flagged_types:
                flagged_types[condition_type] = []
            flagged_types[condition_type].append(condition['condition_name'])
    
    # Apply decision rules
    suggested_decision = 'review'  # Default
    suggested_reason = 'Standard review required'
    
    # Check sex offender first (highest priority)
    if app.get('sex_offender_check') == True:
        suggested_decision = 'deny'
        suggested_reason = 'Patient is on the sex offender registry'
    else:
        # Apply rules in priority order
        for rule in rules:
            field = rule['field_to_check']
            operator = rule['operator']
            value = str(rule['value']).lower()
            field_value = str(app.get(field) or '').lower()
            
            match = False
            if operator == 'contains':
                match = value in field_value or value in searchable_text
            elif operator == 'equals':
                match = field_value == value
            elif operator == 'greater_than':
                try:
                    match = float(field_value) > float(value)
                except:
                    pass
            elif operator == 'less_than':
                try:
                    match = float(field_value) < float(value)
                except:
                    pass
            
            if match:
                if rule['rule_type'] == 'auto_deny':
                    suggested_decision = 'deny'
                    suggested_reason = rule['reason_template']
                    break  # Deny takes precedence
                elif rule['rule_type'] == 'auto_approve' and suggested_decision != 'deny':
                    suggested_decision = 'approve'
                    suggested_reason = rule['reason_template']
                elif rule['rule_type'] == 'needs_review' and suggested_decision not in ['deny', 'approve']:
                    suggested_decision = 'review'
                    suggested_reason = rule['reason_template']
    
    # If we found auto_deny conditions, override decision
    if 'auto_deny' in flagged_types:
        suggested_decision = 'deny'
        suggested_reason = f"Flagged conditions: {', '.join(flagged_types['auto_deny'])}"
    elif 'needs_review' in flagged_types and suggested_decision == 'approve':
        suggested_decision = 'review'
        suggested_reason = f"Review needed for: {', '.join(flagged_types['needs_review'])}"
    
    # Generate AI overview
    diagnosis = app.get('diagnosis')
    if isinstance(diagnosis, list):
        diagnosis = ', '.join(diagnosis)
    
    overview_parts = []
    if app.get('patient_name'):
        overview_parts.append(f"Patient: {app['patient_name']}")
    if diagnosis:
        overview_parts.append(f"Primary conditions: {diagnosis}")
    if app.get('insurance'):
        overview_parts.append(f"Insurance: {app['insurance']}")
    if app.get('care_level'):
        overview_parts.append(f"Care level: {app['care_level']}")
    if flagged_items:
        overview_parts.append(f"⚠️ Flagged: {', '.join(flagged_items)}")
    
    ai_overview = '. '.join(overview_parts) if overview_parts else app.get('ai_summary', 'No summary available')
    
    # Update the application with analysis results
    cursor.execute("""
        UPDATE optalis_applications 
        SET flagged_items = %s,
            suggested_decision = %s,
            suggested_decision_reason = %s,
            ai_overview = %s,
            updated_at = NOW()
        WHERE id = %s
        RETURNING id, flagged_items, suggested_decision, suggested_decision_reason, ai_overview
    """, (
        json.dumps(flagged_items),
        suggested_decision,
        suggested_reason,
        ai_overview,
        app_id
    ))
    
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        "success": True,
        "application_id": app_id,
        "analysis": {
            "flagged_items": flagged_items,
            "suggested_decision": suggested_decision,
            "suggested_decision_reason": suggested_reason,
            "ai_overview": ai_overview,
            "conditions_checked": len(conditions),
            "rules_applied": len(rules)
        }
    }


@app.post("/api/applications/analyze-all")
async def analyze_all_applications():
    """Analyze all pending applications that haven't been analyzed yet."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get applications without analysis
    cursor.execute("""
        SELECT id FROM optalis_applications 
        WHERE suggested_decision IS NULL 
        AND status IN ('pending', 'review')
        LIMIT 50
    """)
    apps = cursor.fetchall()
    cursor.close()
    conn.close()
    
    results = []
    for app in apps:
        try:
            result = await analyze_application(app['id'])
            results.append({"id": app['id'], "success": True})
        except Exception as e:
            results.append({"id": app['id'], "success": False, "error": str(e)})
    
    return {
        "analyzed": len([r for r in results if r['success']]),
        "failed": len([r for r in results if not r['success']]),
        "results": results
    }


# ============================================================
# GLOBAL BED SUMMARY (All Facilities)
# ============================================================

@app.get("/api/beds/summary")
async def global_beds_summary():
    """Get bed availability summary across all facilities."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            f.id as facility_id,
            f.name as facility_name,
            COUNT(b.id) as total_beds,
            COUNT(CASE WHEN b.status = 'available' THEN 1 END) as available_now,
            COUNT(CASE WHEN b.status IN ('occupied', 'reserved') 
                       AND b.available_date <= CURRENT_DATE + INTERVAL '1 day' THEN 1 END) as next_24h,
            COUNT(CASE WHEN b.status IN ('occupied', 'reserved') 
                       AND b.available_date <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as next_7d,
            COUNT(CASE WHEN b.status = 'occupied' THEN 1 END) as occupied
        FROM facilities f
        LEFT JOIN beds b ON f.id = b.facility_id
        WHERE f.is_active = true
        GROUP BY f.id, f.name
        ORDER BY f.name
    """)
    
    summaries = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return [dict(s) for s in summaries]


# ============================================================
# User Management Endpoints
# ============================================================

@app.get("/api/users")
async def list_users():
    """List all users with their facility assignments."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.*, f.name as facility_name 
        FROM users u
        LEFT JOIN facilities f ON u.facility_id = f.id
        WHERE u.is_active = true
        ORDER BY u.name
    """)
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(u) for u in users]


@app.post("/api/users")
async def create_user(request: Request):
    """Create a new user with role and facility assignment."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (data.get('email'),))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Email already exists")
    
    cursor.execute("""
        INSERT INTO users (email, name, role, facility_id, is_active)
        VALUES (%s, %s, %s, %s, true)
        RETURNING *
    """, (
        data.get('email'),
        data.get('name'),
        data.get('role', 'reviewer'),
        data.get('facility_id')  # NULL for admins (access all facilities)
    ))
    user = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return dict(user)


@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    """Get a single user by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.*, f.name as facility_name 
        FROM users u
        LEFT JOIN facilities f ON u.facility_id = f.id
        WHERE u.id = %s
    """, (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user)


@app.patch("/api/users/{user_id}")
async def update_user(user_id: str, request: Request):
    """Update a user's role, facility, or status."""
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    values = []
    
    if 'name' in data:
        updates.append("name = %s")
        values.append(data['name'])
    if 'role' in data:
        updates.append("role = %s")
        values.append(data['role'])
    if 'facility_id' in data:
        updates.append("facility_id = %s")
        values.append(data['facility_id'] if data['facility_id'] else None)
    if 'is_active' in data:
        updates.append("is_active = %s")
        values.append(data['is_active'])
    
    if not updates:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(user_id)
    cursor.execute(f"""
        UPDATE users SET {', '.join(updates)}, updated_at = NOW()
        WHERE id = %s RETURNING *
    """, values)
    user = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user)


@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str):
    """Soft-delete a user (set is_active = false)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users SET is_active = false, updated_at = NOW()
        WHERE id = %s RETURNING id
    """, (user_id,))
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deactivated", "id": user_id}


@app.post("/api/users/login")
async def login_user(request: Request):
    """
    Demo login - in production this would validate credentials.
    Returns user info including facility assignment.
    """
    data = await request.json()
    email = data.get('email', '').lower()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.*, f.name as facility_name 
        FROM users u
        LEFT JOIN facilities f ON u.facility_id = f.id
        WHERE LOWER(u.email) = %s AND u.is_active = true
    """, (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        # For demo: create user on first login or return demo admin
        return {
            "id": "demo-admin",
            "email": email,
            "name": email.split('@')[0].replace('.', ' ').title(),
            "role": "admin",
            "facility_id": None,
            "facility_name": None,
            "is_demo": True
        }
    
    return dict(user)


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Optalis API on port {PORT}")
    print(f"📊 Database: PostgreSQL (AWS RDS)")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
