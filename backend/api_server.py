"""
Optalis API Server
Serves applications to the dashboard.

Usage:
    python api_server.py
    
Runs on PORT from environment (Railway) or 8080 locally.
"""

import os
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

DB_PATH = Path(__file__).parent / "applications.db"
PORT = int(os.getenv("PORT", 8080))


def init_db():
    """Initialize database with schema and seed data."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'normal',
            source TEXT,
            source_email TEXT,
            patient_name TEXT,
            dob TEXT,
            phone TEXT,
            address TEXT,
            insurance TEXT,
            policy_number TEXT,
            diagnosis TEXT,
            medications TEXT,
            allergies TEXT,
            physician TEXT,
            facility TEXT,
            services TEXT,
            ai_summary TEXT,
            confidence_score REAL,
            raw_text TEXT,
            raw_email_subject TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS processed_emails (
            message_id TEXT PRIMARY KEY,
            processed_at TEXT
        )
    """)
    
    # Seed with demo data if empty
    cursor.execute("SELECT COUNT(*) FROM applications")
    if cursor.fetchone()[0] == 0:
        seed_data = [
            ("APP-2026-001", "pending", "high", "Hospital Referral", "referrals@beaumont.org",
             "Margaret Thompson", "03/15/1942", "(248) 555-0123", "1234 Oak Street, Bloomfield Hills, MI 48301",
             "Medicare Part A & B", "1EG4-TE5-MK72",
             '["Dementia", "Hypertension", "Type 2 Diabetes"]',
             '["Metformin 500mg", "Lisinopril 10mg", "Donepezil 5mg"]',
             '["Penicillin", "Sulfa"]',
             "Dr. Robert Chen, MD", "Cranberry Park at West Bloomfield",
             '["Memory Care", "Medication Management", "Physical Therapy"]',
             "83-year-old female with progressive dementia, well-controlled hypertension, and Type 2 diabetes. Currently hospitalized at Beaumont, medically stable. Family seeking memory care placement with 24/7 supervision.",
             94, "", "Patient Referral - Margaret Thompson", "2026-02-24T10:30:00", "2026-02-24T10:30:00"),
            
            ("APP-2026-002", "review", "medium", "Website", "family@email.com",
             "Robert Williams", "07/22/1938", "(616) 555-0456", "567 Maple Ave, Grand Rapids, MI 49503",
             "Blue Cross Blue Shield", "XYZ123456789",
             '["COPD", "Congestive Heart Failure"]',
             '["Lasix 40mg", "Metoprolol 25mg", "Spiriva"]',
             '["None known"]',
             "Dr. Sarah Johnson, MD", "Optalis of Grand Rapids",
             '["Skilled Nursing", "Respiratory Therapy", "Cardiac Rehab"]',
             "87-year-old male with chronic COPD and compensated CHF. Requires supplemental oxygen and nebulizer treatments. Insurance pre-authorization pending.",
             87, "", "Application - Robert Williams", "2026-02-24T14:15:00", "2026-02-24T14:15:00"),
            
            ("APP-2026-003", "approved", "normal", "Email", "daughter@email.com",
             "Dorothy Martinez", "11/08/1945", "(248) 555-0789", "890 Pine Road, Milford, MI 48381",
             "Medicare Advantage - Humana", "H1234567890",
             '["Mild Cognitive Impairment", "Osteoarthritis"]',
             '["Celebrex 200mg", "Aricept 10mg", "Vitamin D 1000IU"]',
             '["Aspirin"]',
             "Dr. Michael Brown, DO", "Cranberry Park at Milford",
             '["Assisted Living", "Memory Support", "Occupational Therapy"]',
             "80-year-old female with mild cognitive impairment and moderate osteoarthritis. Independent with most ADLs but needs supervision for medication management. Move-in scheduled for 3/1.",
             96, "", "Application - Dorothy Martinez", "2026-02-24T09:00:00", "2026-02-25T11:00:00"),
        ]
        
        for row in seed_data:
            cursor.execute("""
                INSERT INTO applications (id, status, priority, source, source_email,
                    patient_name, dob, phone, address, insurance, policy_number,
                    diagnosis, medications, allergies, physician, facility, services,
                    ai_summary, confidence_score, raw_text, raw_email_subject, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, row)
        
        print("✓ Seeded database with demo applications")
    
    conn.commit()
    conn.close()


# Initialize database on import
init_db()

# ============================================================
# FastAPI App
# ============================================================

app = FastAPI(title="Optalis API", version="1.0.0")

# CORS for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to dashboard domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Models
# ============================================================

class ApplicationResponse(BaseModel):
    id: str
    status: str
    priority: str
    source: str
    source_email: Optional[str]
    patient_name: Optional[str]
    dob: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    insurance: Optional[str]
    policy_number: Optional[str]
    diagnosis: List[str]
    medications: List[str]
    allergies: List[str]
    physician: Optional[str]
    facility: Optional[str]
    services: List[str]
    ai_summary: Optional[str]
    confidence_score: Optional[float]
    created_at: str
    updated_at: str


class DecisionRequest(BaseModel):
    decision: str  # approved, denied, review
    notes: Optional[str] = ""


class ApplicationUpdate(BaseModel):
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


# ============================================================
# Helper Functions
# ============================================================

def row_to_dict(row, columns) -> dict:
    """Convert SQLite row to dictionary."""
    d = dict(zip(columns, row))
    # Parse JSON fields
    for field in ["diagnosis", "medications", "allergies", "services"]:
        if field in d and d[field]:
            try:
                d[field] = json.loads(d[field])
            except:
                d[field] = []
        else:
            d[field] = []
    return d


def get_db():
    """Get database connection."""
    if not DB_PATH.exists():
        raise HTTPException(status_code=500, detail="Database not initialized. Run email_intake.py first.")
    return sqlite3.connect(DB_PATH)


# ============================================================
# Endpoints
# ============================================================

@app.get("/")
async def root():
    return {"status": "ok", "service": "Optalis API", "version": "1.0.0"}


@app.get("/api/applications")
async def list_applications(
    status: Optional[str] = None,
    limit: int = 50
):
    """List all applications."""
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM applications ORDER BY created_at DESC LIMIT ?"
    params = [limit]
    
    if status:
        query = "SELECT * FROM applications WHERE status = ? ORDER BY created_at DESC LIMIT ?"
        params = [status, limit]
    
    cursor.execute(query, params)
    
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    conn.close()
    
    return [row_to_dict(row, columns) for row in rows]


@app.get("/api/applications/{app_id}")
async def get_application(app_id: str):
    """Get single application by ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    
    columns = [desc[0] for desc in cursor.description]
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return row_to_dict(row, columns)


@app.patch("/api/applications/{app_id}")
async def update_application(app_id: str, update: ApplicationUpdate):
    """Update application fields."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Build update query dynamically
    updates = []
    params = []
    
    for field, value in update.dict(exclude_none=True).items():
        if isinstance(value, list):
            value = json.dumps(value)
        updates.append(f"{field} = ?")
        params.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(datetime.now().isoformat())
    params.append(app_id)
    
    query = f"UPDATE applications SET {', '.join(updates)}, updated_at = ? WHERE id = ?"
    cursor.execute(query, params)
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    conn.close()
    return {"status": "updated", "id": app_id}


@app.post("/api/applications/{app_id}/decision")
async def make_decision(app_id: str, request: DecisionRequest):
    """Make a decision on an application."""
    if request.decision not in ["approved", "denied", "review"]:
        raise HTTPException(status_code=400, detail="Invalid decision")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "UPDATE applications SET status = ?, updated_at = ? WHERE id = ?",
        (request.decision, datetime.now().isoformat(), app_id)
    )
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    conn.close()
    
    # TODO: Sync to PointClickCare if approved
    
    return {
        "status": "success",
        "id": app_id,
        "decision": request.decision,
        "message": f"Application {request.decision}"
    }


@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics."""
    conn = get_db()
    cursor = conn.cursor()
    
    stats = {}
    
    for status in ["pending", "approved", "denied", "review"]:
        cursor.execute("SELECT COUNT(*) FROM applications WHERE status = ?", (status,))
        stats[status] = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM applications")
    stats["total"] = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(*) FROM applications 
        WHERE created_at >= date('now', '-7 days')
    """)
    stats["this_week"] = cursor.fetchone()[0]
    
    conn.close()
    
    return stats


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ============================================================
# Run Server
# ============================================================

if __name__ == "__main__":
    import uvicorn
    print(f"\n🚀 Starting Optalis API Server...")
    print(f"   http://0.0.0.0:{PORT}")
    print(f"   Docs: http://0.0.0.0:{PORT}/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
