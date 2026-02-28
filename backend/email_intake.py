"""
Optalis Email Intake Service
Polls Yahoo inbox, extracts documents, runs AI pipeline, creates applications.

Usage:
    python email_intake.py              # Run once
    python email_intake.py --watch      # Poll continuously
    python email_intake.py --test       # Test with sample data
"""

import os
import sys

# Load .env file
from pathlib import Path
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())
import json
import imaplib
import email
from email.header import decode_header
import time
import base64
import tempfile
from datetime import datetime, timezone
from pathlib import Path
import sqlite3
import argparse
from typing import Optional, Dict, List, Any

import boto3
from openai import OpenAI

# Vision extractor for high-accuracy document processing
try:
    from vision_extractor import extract_document, flatten_extraction
    VISION_ENABLED = True
    print("✓ Vision extractor loaded")
except ImportError as e:
    VISION_ENABLED = False
    print(f"⚠ Vision extractor not available: {e}")

# ============================================================
# Configuration
# ============================================================

GMAIL_EMAIL = os.getenv("GMAIL_EMAIL", "rewindtriviagames@gmail.com")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")  # Generate at https://myaccount.google.com/apppasswords
IMAP_SERVER = "imap.gmail.com"
IMAP_PORT = 993

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET", "optalis-intake-documents")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o"

DB_PATH = Path(__file__).parent / "applications.db"
POLL_INTERVAL = 60  # seconds

# ============================================================
# Email Filtering (Spam/Non-Application Detection)
# ============================================================

# Keywords that indicate a legitimate healthcare application
HEALTHCARE_KEYWORDS = [
    "patient", "referral", "admission", "admit", "discharge",
    "dob", "date of birth", "birthdate", "birth date",
    "insurance", "medicare", "medicaid", "aetna", "bcbs", "blue cross",
    "diagnosis", "diagnoses", "dx", "icd",
    "physician", "doctor", "dr.", "md", "nurse", "rn",
    "medication", "medications", "meds", "rx", "prescription",
    "allergies", "allergy", "nkda",
    "facility", "hospital", "clinic", "nursing", "rehab", "rehabilitation",
    "skilled nursing", "snf", "ltc", "long term care",
    "therapy", "pt", "ot", "physical therapy", "occupational therapy",
    "referral form", "intake form", "application form",
    "cms", "authorization", "prior auth",
]

# Minimum keywords required to consider email as potential application
MIN_KEYWORD_MATCHES = 2

def is_healthcare_email(subject: str, body: str, attachments: list = None) -> tuple[bool, int]:
    """
    Check if email appears to be a healthcare application.
    Returns (is_healthcare, keyword_count)
    """
    # Combine all text for scanning
    text = f"{subject} {body}".lower()
    
    # Also check attachment filenames
    if attachments:
        for att in attachments:
            text += f" {att.get('filename', '').lower()}"
    
    # Count keyword matches
    matched_keywords = []
    for keyword in HEALTHCARE_KEYWORDS:
        if keyword.lower() in text:
            matched_keywords.append(keyword)
    
    keyword_count = len(matched_keywords)
    is_healthcare = keyword_count >= MIN_KEYWORD_MATCHES
    
    return is_healthcare, keyword_count


def has_required_fields(extracted: dict) -> tuple[bool, list]:
    """
    Check if extracted data has required fields.
    Required: patient_name AND dob
    Returns (has_required, missing_fields)
    """
    missing = []
    
    patient_name = extracted.get("patient_name", "").strip() if extracted.get("patient_name") else ""
    dob = extracted.get("dob", "").strip() if extracted.get("dob") else ""
    
    if not patient_name:
        missing.append("patient_name")
    if not dob:
        missing.append("dob")
    
    has_required = len(missing) == 0
    return has_required, missing


# ============================================================
# Database Setup
# ============================================================

def init_db():
    """Initialize SQLite database."""
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
            
            diagnosis TEXT,  -- JSON array
            medications TEXT,  -- JSON array
            allergies TEXT,  -- JSON array
            
            physician TEXT,
            facility TEXT,
            services TEXT,  -- JSON array
            
            ai_summary TEXT,
            confidence_score REAL,
            
            raw_text TEXT,
            raw_email_subject TEXT,
            
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id TEXT,
            filename TEXT,
            file_type TEXT,
            s3_key TEXT,
            textract_text TEXT,
            created_at TEXT,
            FOREIGN KEY (application_id) REFERENCES applications(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS processed_emails (
            message_id TEXT PRIMARY KEY,
            processed_at TEXT
        )
    """)
    
    conn.commit()
    conn.close()
    print(f"✓ Database initialized: {DB_PATH}")


# ============================================================
# Email Fetching
# ============================================================

def connect_imap():
    """Connect to Gmail IMAP."""
    if not GMAIL_APP_PASSWORD:
        raise ValueError("GMAIL_APP_PASSWORD not set. Generate one at https://myaccount.google.com/apppasswords")
    
    mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
    mail.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
    return mail


def fetch_unprocessed_emails(mail) -> List[Dict]:
    """Fetch emails that haven't been processed yet."""
    mail.select("INBOX")
    
    # Search for all emails (could filter by date, sender, etc.)
    status, messages = mail.search(None, "ALL")
    if status != "OK":
        return []
    
    email_ids = messages[0].split()
    
    # Get already processed message IDs
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT message_id FROM processed_emails")
    processed = set(row[0] for row in cursor.fetchall())
    conn.close()
    
    emails = []
    
    for email_id in email_ids[-20:]:  # Check last 20 emails
        status, msg_data = mail.fetch(email_id, "(RFC822)")
        if status != "OK":
            continue
            
        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)
        
        # Get message ID
        message_id = msg.get("Message-ID", str(email_id))
        
        if message_id in processed:
            continue
        
        # Decode subject
        subject, encoding = decode_header(msg["Subject"])[0]
        if isinstance(subject, bytes):
            subject = subject.decode(encoding or "utf-8")
        
        # Get sender
        from_addr = msg.get("From", "")
        
        # Get date
        date_str = msg.get("Date", "")
        
        # Extract body and attachments
        body = ""
        attachments = []
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                
                if "attachment" in content_disposition:
                    filename = part.get_filename()
                    if filename:
                        attachments.append({
                            "filename": filename,
                            "content_type": content_type,
                            "data": part.get_payload(decode=True)
                        })
                elif content_type == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        body += payload.decode("utf-8", errors="ignore")
        else:
            body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
        
        emails.append({
            "message_id": message_id,
            "subject": subject,
            "from": from_addr,
            "date": date_str,
            "body": body,
            "attachments": attachments
        })
    
    return emails


def mark_email_processed(message_id: str):
    """Mark an email as processed."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO processed_emails (message_id, processed_at) VALUES (?, ?)",
        (message_id, datetime.now(timezone.utc).isoformat())
    )
    conn.commit()
    conn.close()


# ============================================================
# Document Processing (Textract)
# ============================================================

def extract_text_from_document(file_data: bytes, filename: str) -> str:
    """Extract text from document using AWS Textract or python-docx."""
    ext = filename.lower().split(".")[-1]
    
    # Handle Word documents
    if ext in ["docx", "doc"]:
        try:
            from docx import Document
            import io
            doc = Document(io.BytesIO(file_data))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text
        except Exception as e:
            print(f"  ⚠ Word doc error for {filename}: {e}")
            return ""
    
    # Handle PDF and images with Textract
    try:
        textract = boto3.client("textract", region_name=AWS_REGION)
        
        # Textract accepts PNG, JPEG, TIFF, PDF
        response = textract.detect_document_text(
            Document={"Bytes": file_data}
        )
        
        # Extract all text blocks
        text_blocks = []
        for block in response.get("Blocks", []):
            if block["BlockType"] == "LINE":
                text_blocks.append(block.get("Text", ""))
        
        return "\n".join(text_blocks)
    
    except Exception as e:
        print(f"  ⚠ Textract error for {filename}: {e}")
        return ""


# ============================================================
# AI Extraction (GPT-4)
# ============================================================

def extract_application_data(raw_text: str, subject: str = "") -> Dict[str, Any]:
    """Use GPT-4 to extract structured application data."""
    if not OPENAI_API_KEY:
        print("  ⚠ OpenAI API key not set, using mock data")
        return generate_mock_extraction()
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    prompt = f"""You are an expert healthcare admissions data extractor. 
Extract patient and referral information from the following document text.

CRITICAL: DO NOT FABRICATE OR INVENT DATA. If a field is not explicitly present in the document, 
you MUST return null for that field. Never make up phone numbers, addresses, or any other information.
This is for healthcare/HIPAA compliance - fabricated data is dangerous.

Return a JSON object with these fields (use null if information is NOT explicitly in the document):
- patient_name: string or null
- dob: string (format: MM/DD/YYYY) or null
- phone: string or null — ONLY if explicitly stated in the document
- address: string or null — ONLY if explicitly stated in the document  
- insurance: string (insurance provider name) or null
- policy_number: string or null
- diagnosis: array of strings (medical diagnoses) — empty array [] if none mentioned
- medications: array of strings (current medications with dosages) — empty array [] if none mentioned
- allergies: array of strings — empty array [] if none mentioned
- physician: string (referring physician name) or null
- facility: string (requested facility, default to "Optalis Healthcare" if not specified)
- services: array of strings (requested services like "Skilled Nursing", "Physical Therapy", etc.) — empty array [] if none mentioned
- priority: string (one of: "high", "medium", "normal" - based on urgency indicators)
- ai_summary: string (2-3 sentence clinical summary suitable for admissions review)
- confidence_score: number (0-100, your confidence in the extraction accuracy)
- extra_data: object — Any additional relevant data found in the document that doesn't fit the fields above. 
  Use descriptive keys like "emergency_contact", "mobility_status", "diet_restrictions", "admission_date", "discharge_date", "room_preference", etc.
  Return empty object {{}} if no additional relevant data found. Only include clearly stated information, never fabricate.

REMEMBER: Return null for any field not explicitly found. DO NOT invent placeholder data.

Email Subject: {subject}

Document Text:
{raw_text[:8000]}

Return only valid JSON, no markdown formatting."""

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You extract healthcare admissions data into structured JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Clean up potential markdown formatting
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        
        return json.loads(result_text)
    
    except Exception as e:
        print(f"  ⚠ GPT-4 extraction error: {e}")
        return generate_mock_extraction()


def generate_mock_extraction() -> Dict[str, Any]:
    """Generate mock extraction for testing."""
    return {
        "patient_name": "Test Patient",
        "dob": "01/01/1940",
        "phone": "(248) 555-0100",
        "address": "123 Test St, Detroit, MI 48201",
        "insurance": "Medicare",
        "policy_number": "TEST123456",
        "diagnosis": ["Diagnosis pending extraction"],
        "medications": ["Pending extraction"],
        "allergies": ["Unknown"],
        "physician": "Dr. Test",
        "facility": "Optalis Healthcare",
        "services": ["Skilled Nursing"],
        "priority": "normal",
        "ai_summary": "Patient referral received. Details pending full AI extraction.",
        "confidence_score": 50
    }


# ============================================================
# Application Creation
# ============================================================

def generate_application_id() -> str:
    """Generate unique application ID."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    import random
    suffix = random.randint(100, 999)
    return f"APP-{timestamp}-{suffix}"


def create_application(email_data: Dict, extracted: Dict) -> str:
    """Create application record via Railway API."""
    import requests
    
    app_id = generate_application_id()
    now = datetime.now(timezone.utc).isoformat()
    
    # Post to Railway API
    api_url = "https://optalis-api-production.up.railway.app/api/applications"
    
    payload = {
        "id": app_id,
        "status": "pending",
        "priority": extracted.get("priority", "normal"),
        "source": "Email (AI Intake)",
        "source_email": email_data.get("from", ""),
        "patient_name": extracted.get("patient_name"),
        "dob": extracted.get("dob"),
        "phone": extracted.get("phone"),
        "address": extracted.get("address"),
        "insurance": extracted.get("insurance"),
        "policy_number": extracted.get("policy_number"),
        "diagnosis": extracted.get("diagnosis", []),
        "medications": extracted.get("medications", []),
        "allergies": extracted.get("allergies", []),
        "physician": extracted.get("physician"),
        "facility": extracted.get("facility"),
        "services": extracted.get("services", []),
        "ai_summary": extracted.get("ai_summary"),
        "confidence_score": extracted.get("confidence_score", 0),
        "raw_text": email_data.get("body", "")[:5000],
        "raw_email_subject": email_data.get("subject", ""),
        "extra_data": extracted.get("extra_data"),
        "created_at": now,
        "updated_at": now
    }
    
    try:
        response = requests.post(api_url, json=payload, timeout=30)
        if response.status_code in [200, 201]:
            print(f"   ✓ Posted to Railway API")
        else:
            print(f"   ⚠ API returned {response.status_code}: {response.text[:100]}")
            # Fall back to local DB
            _save_to_local_db(app_id, email_data, extracted, now)
    except Exception as e:
        print(f"   ⚠ API error: {e}, saving locally")
        _save_to_local_db(app_id, email_data, extracted, now)
    
    return app_id


def _save_to_local_db(app_id: str, email_data: Dict, extracted: Dict, now: str):
    """Fallback: save to local SQLite."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO applications (
            id, status, priority, source, source_email,
            patient_name, dob, phone, address,
            insurance, policy_number,
            diagnosis, medications, allergies,
            physician, facility, services,
            ai_summary, confidence_score,
            raw_text, raw_email_subject,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        app_id,
        "pending",
        extracted.get("priority", "normal"),
        "Email (AI Intake)",
        email_data.get("from", ""),
        extracted.get("patient_name"),
        extracted.get("dob"),
        extracted.get("phone"),
        extracted.get("address"),
        extracted.get("insurance"),
        extracted.get("policy_number"),
        json.dumps(extracted.get("diagnosis", [])),
        json.dumps(extracted.get("medications", [])),
        json.dumps(extracted.get("allergies", [])),
        extracted.get("physician"),
        extracted.get("facility"),
        json.dumps(extracted.get("services", [])),
        extracted.get("ai_summary"),
        extracted.get("confidence_score", 0),
        email_data.get("body", "")[:5000],
        email_data.get("subject", ""),
        now,
        now
    ))
    
    conn.commit()
    conn.close()
    
    return app_id


# ============================================================
# Main Processing Loop
# ============================================================

def process_email(email_data: Dict) -> Optional[str]:
    """Process a single email and create application."""
    subject = email_data.get('subject', '')
    sender = email_data.get('from', '')
    body = email_data.get('body', '')
    attachments = email_data.get('attachments', [])
    
    print(f"\n📧 Processing: {subject}")
    print(f"   From: {sender}")
    
    # ========================================
    # FILTER 1: Healthcare Keyword Check
    # ========================================
    is_healthcare, keyword_count = is_healthcare_email(subject, body, attachments)
    
    if not is_healthcare:
        print(f"   ⏭️  Skipping: Not a healthcare application (only {keyword_count} keyword matches)")
        # Mark as processed so we don't keep retrying spam
        mark_email_processed(email_data["message_id"])
        return None
    
    print(f"   ✓ Healthcare keywords found: {keyword_count} matches")
    
    extracted = None
    all_text = body
    
    # Check for attachments that can use Vision extraction
    vision_attachments = []
    text_attachments = []
    
    for attachment in email_data.get("attachments", []):
        filename = attachment["filename"]
        ext = filename.lower().split(".")[-1]
        
        if ext in ["pdf", "png", "jpg", "jpeg", "tiff", "gif", "webp", "bmp"]:
            vision_attachments.append(attachment)
        elif ext in ["docx", "doc"]:
            text_attachments.append(attachment)
    
    # ========================================
    # Strategy 1: Use Vision Extractor (Best Accuracy)
    # ========================================
    if VISION_ENABLED and vision_attachments:
        print(f"   📸 Using Vision extraction for {len(vision_attachments)} attachment(s)")
        
        # Process the first image/PDF attachment with Vision
        attachment = vision_attachments[0]
        filename = attachment["filename"]
        print(f"   📎 Processing: {filename}")
        
        # Also get text for Turbo fallback
        fallback_text = all_text
        for att in vision_attachments + text_attachments:
            try:
                txt = extract_text_from_document(att["data"], att["filename"])
                if txt:
                    fallback_text += f"\n\n{txt}"
            except:
                pass
        
        try:
            # Use Vision extractor
            vision_result = extract_document(
                file_data=attachment["data"],
                filename=filename,
                subject=email_data.get("subject", ""),
                email_body=email_data.get("body", ""),
                raw_text=fallback_text,
                confidence_threshold=85
            )
            
            # Flatten for database storage
            extracted = flatten_extraction(vision_result)
            
            method = vision_result.get("_extraction_method", "unknown")
            print(f"      ✓ Vision extraction complete (method: {method})")
            
        except Exception as e:
            print(f"      ⚠ Vision extraction failed: {e}")
            print(f"      → Falling back to text extraction")
    
    # ========================================
    # Strategy 2: Text-based extraction (Fallback)
    # ========================================
    if extracted is None:
        print("   📝 Using text-based extraction")
        
        # Process all attachments for text
        for attachment in email_data.get("attachments", []):
            filename = attachment["filename"]
            print(f"   📎 Attachment: {filename}")
            
            ext = filename.lower().split(".")[-1]
            if ext in ["pdf", "png", "jpg", "jpeg", "tiff", "docx", "doc"]:
                extracted_text = extract_text_from_document(
                    attachment["data"], 
                    filename
                )
                if extracted_text:
                    all_text += f"\n\n--- Content from {filename} ---\n{extracted_text}"
                    print(f"      ✓ Extracted {len(extracted_text)} chars")
        
        if not all_text.strip():
            print("   ⚠ No text content found, skipping")
            return None
        
        # Extract structured data with GPT-4
        print("   🤖 Running GPT-4 text extraction...")
        extracted = extract_application_data(all_text, email_data.get("subject", ""))
    
    # ========================================
    # Create Application
    # ========================================
    # ========================================
    # FILTER 2: Required Fields Check
    # ========================================
    has_required, missing_fields = has_required_fields(extracted or {})
    
    if not has_required:
        print(f"   ⏭️  Skipping: Missing required fields: {', '.join(missing_fields)}")
        # Still mark as processed so we don't keep retrying
        mark_email_processed(email_data["message_id"])
        return None
    
    print(f"   ✓ Patient: {extracted['patient_name']}")
    print(f"   ✓ DOB: {extracted.get('dob', 'N/A')}")
    print(f"   ✓ Confidence: {extracted.get('confidence_score', 0)}%")
    
    # Check if reprocessed by Turbo
    if extracted.get("_reprocessed"):
        print(f"   ℹ Auto-reprocessed by GPT-4 Turbo (low initial confidence)")
    
    # Create application
    app_id = create_application(email_data, extracted or {})
    print(f"   ✅ Created application: {app_id}")
    
    # Mark email as processed
    mark_email_processed(email_data["message_id"])
    
    return app_id


def run_intake(watch: bool = False, interval: int = 300):
    """Main intake loop."""
    init_db()
    
    print("\n" + "="*60)
    print("🏥 Optalis Email Intake Service")
    print(f"📧 Monitoring: {GMAIL_EMAIL}")
    if watch:
        print(f"⏱️  Poll interval: {interval}s")
    print("="*60)
    
    while True:
        try:
            print(f"\n🔍 Checking for new emails... ({datetime.now().strftime('%H:%M:%S')})")
            
            mail = connect_imap()
            emails = fetch_unprocessed_emails(mail)
            mail.logout()
            
            if emails:
                print(f"   Found {len(emails)} new email(s)")
                for email_data in emails:
                    process_email(email_data)
            else:
                print("   No new emails")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        if not watch:
            break
            
        print(f"\n💤 Sleeping {interval}s...")
        time.sleep(interval)


def run_test():
    """Run with test data."""
    init_db()
    
    print("\n🧪 Running test with sample data...")
    
    test_email = {
        "message_id": f"test-{datetime.now().timestamp()}",
        "subject": "Patient Referral - Eleanor Mitchell",
        "from": "dr.wilson@beaumonthealth.com",
        "date": datetime.now(timezone.utc).isoformat(),
        "body": """
From: Dr. Sarah Wilson
Beaumont Health System
Date: February 25, 2026

RE: Patient Referral for Skilled Nursing Facility Placement

Patient Information:
Name: Eleanor Mitchell  
DOB: 08/14/1938 (Age 87)
Phone: (248) 555-0142
Address: 789 Maple Drive, Troy, MI 48098

Medical Information:
Primary Diagnosis: Hip fracture s/p ORIF, Type 2 Diabetes, Hypertension
Current Medications: 
- Metformin 500mg BID
- Lisinopril 20mg daily
- Aspirin 81mg daily
- Calcium + Vitamin D
Allergies: Sulfa drugs, Latex

Insurance: Medicare Part A & B
Member ID: 3KT9-WQ2-JL58

Referring Physician: Dr. Sarah Wilson, MD
Contact: (248) 555-7700

Requested Services: Skilled Nursing, Physical Therapy, Occupational Therapy
Preferred Facility: Optalis of Troy or Cranberry Park

Clinical Summary:
87-year-old female admitted following fall at home resulting in left hip fracture.
ORIF performed 2/22/26 without complications. Patient is weight-bearing as tolerated.
Requires SNF placement for PT/OT rehabilitation. Diabetes well-controlled, A1c 7.1%.
Family involved and supportive. Estimated rehab duration 3-4 weeks.

URGENT - Family requesting placement by 2/28/26.

Please contact the family directly:
Daughter: Susan Mitchell (248) 555-0199

Thank you,
Dr. Sarah Wilson
        """,
        "attachments": []
    }
    
    app_id = process_email(test_email)
    
    if app_id:
        # Show the created application
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            print("\n" + "="*60)
            print("📋 APPLICATION CREATED")
            print("="*60)
            columns = ["id", "status", "priority", "source", "source_email",
                      "patient_name", "dob", "phone", "address",
                      "insurance", "policy_number", "diagnosis", "medications", 
                      "allergies", "physician", "facility", "services",
                      "ai_summary", "confidence_score"]
            for i, col in enumerate(columns):
                if i < len(row):
                    print(f"{col}: {row[i]}")


# ============================================================
# CLI Entry Point  
# ============================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Optalis Email Intake Service")
    parser.add_argument("--watch", action="store_true", help="Poll continuously")
    parser.add_argument("--interval", type=int, default=300, help="Poll interval in seconds (default: 300)")
    parser.add_argument("--test", action="store_true", help="Run with test data")
    args = parser.parse_args()
    
    if args.test:
        run_test()
    else:
        run_intake(watch=args.watch, interval=args.interval)
