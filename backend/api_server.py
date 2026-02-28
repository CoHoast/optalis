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
from datetime import datetime, timezone
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
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        conn.commit()
        print("✅ Created optalis_applications table")
    
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
async def list_applications(status: Optional[str] = None, limit: int = 100):
    """List all applications, optionally filtered by status."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status:
        cursor.execute(
            "SELECT * FROM optalis_applications WHERE status = %s ORDER BY created_at DESC LIMIT %s",
            (status, limit)
        )
    else:
        cursor.execute(
            "SELECT * FROM optalis_applications ORDER BY created_at DESC LIMIT %s",
            (limit,)
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
            created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s
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
        request.updated_at or now
    ))
    
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    return row_to_dict(row)


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
        
        # Extract using vision
        result = extract_with_vision(
            file_data=content,
            filename=upload_file.filename,
            subject="Mobile Document Scan",
            email_body="Document scanned via mobile app",
            raw_text=""
        )
        
        # Flatten for response
        extracted = flatten_extraction(result)
        
        # Generate application ID
        app_id = f"APP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        now = datetime.now(timezone.utc).isoformat()
        
        # Create application
        conn = get_db_connection()
        cursor = conn.cursor()
        
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
        
        # Return format expected by mobile app
        return {
            "success": True,
            "applicationId": app_data['id'],
            "patientName": app_data.get('patient_name'),
            "confidence": app_data.get('confidence_score'),
            "application": app_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Optalis API on port {PORT}")
    print(f"📊 Database: PostgreSQL (AWS RDS)")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
