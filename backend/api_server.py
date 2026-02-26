"""
Optalis API Server
Serves applications to the dashboard.

Usage:
    python api_server.py
    
Runs on http://localhost:8080
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

DB_PATH = Path(__file__).parent / "applications.db"

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
    print("\n🚀 Starting Optalis API Server...")
    print("   http://localhost:8080")
    print("   Docs: http://localhost:8080/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8080)
