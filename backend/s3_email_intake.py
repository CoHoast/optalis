"""
Optalis S3 Email Intake Service
Polls S3 bucket for incoming emails, extracts documents, runs AI pipeline.

Usage:
    python s3_email_intake.py              # Run once
    python s3_email_intake.py --watch      # Poll continuously
    python s3_email_intake.py --test       # Test with sample data
"""

import os
import sys
import json
import email
from email import policy
from email.parser import BytesParser
import time
import base64
import tempfile
from datetime import datetime, timezone
from pathlib import Path
import argparse
from typing import Optional, Dict, List, Any

import boto3
from botocore.exceptions import ClientError

# Load .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

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

# S3 Configuration (new email intake bucket)
S3_EMAIL_BUCKET = os.getenv("S3_EMAIL_BUCKET", "dokit-email-intake")
S3_EMAIL_PREFIX = os.getenv("S3_EMAIL_PREFIX", "optalis/incoming/")
S3_PROCESSED_PREFIX = os.getenv("S3_PROCESSED_PREFIX", "optalis/processed/")
S3_FAILED_PREFIX = os.getenv("S3_FAILED_PREFIX", "optalis/failed/")

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("S3_EMAIL_ACCESS_KEY_ID", os.getenv("AWS_ACCESS_KEY_ID"))
AWS_SECRET_ACCESS_KEY = os.getenv("S3_EMAIL_SECRET_ACCESS_KEY", os.getenv("AWS_SECRET_ACCESS_KEY"))

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o"

# API Configuration
API_URL = os.getenv("API_URL", "https://optalis-api-production.up.railway.app/api/applications")

POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))

# ============================================================
# Email Filtering
# ============================================================

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
]

MIN_KEYWORD_MATCHES = 2


def is_healthcare_email(subject: str, body: str, attachments: list = None) -> tuple:
    """Check if email appears to be a healthcare application."""
    text = f"{subject} {body}".lower()
    
    if attachments:
        for att in attachments:
            text += f" {att.get('filename', '').lower()}"
    
    matched_keywords = [kw for kw in HEALTHCARE_KEYWORDS if kw.lower() in text]
    keyword_count = len(matched_keywords)
    is_healthcare = keyword_count >= MIN_KEYWORD_MATCHES
    
    return is_healthcare, keyword_count


def has_required_fields(extracted: dict) -> tuple:
    """Check if extracted data has required fields (patient_name AND dob)."""
    missing = []
    
    patient_name = extracted.get("patient_name", "").strip() if extracted.get("patient_name") else ""
    dob = extracted.get("dob", "").strip() if extracted.get("dob") else ""
    
    if not patient_name:
        missing.append("patient_name")
    if not dob:
        missing.append("dob")
    
    return len(missing) == 0, missing


# ============================================================
# S3 Operations
# ============================================================

def get_s3_client():
    """Get S3 client with email intake credentials."""
    return boto3.client(
        's3',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )


def list_incoming_emails() -> List[str]:
    """List all emails in the incoming folder."""
    s3 = get_s3_client()
    
    try:
        response = s3.list_objects_v2(
            Bucket=S3_EMAIL_BUCKET,
            Prefix=S3_EMAIL_PREFIX
        )
        
        emails = []
        for obj in response.get('Contents', []):
            key = obj['Key']
            # Skip .keep files and folder markers
            if key.endswith('.keep') or key == S3_EMAIL_PREFIX:
                continue
            # Skip SES setup notifications
            if 'AMAZON_SES_SETUP_NOTIFICATION' in key:
                continue
            emails.append(key)
        
        return emails
    except ClientError as e:
        print(f"❌ Error listing S3 objects: {e}")
        return []


def download_email(s3_key: str) -> bytes:
    """Download email content from S3."""
    s3 = get_s3_client()
    
    response = s3.get_object(Bucket=S3_EMAIL_BUCKET, Key=s3_key)
    return response['Body'].read()


def move_email(s3_key: str, destination_prefix: str):
    """Move email to processed or failed folder."""
    s3 = get_s3_client()
    
    filename = s3_key.split('/')[-1]
    new_key = f"{destination_prefix}{filename}"
    
    # Copy to new location
    s3.copy_object(
        Bucket=S3_EMAIL_BUCKET,
        CopySource={'Bucket': S3_EMAIL_BUCKET, 'Key': s3_key},
        Key=new_key
    )
    
    # Delete from original location
    s3.delete_object(Bucket=S3_EMAIL_BUCKET, Key=s3_key)
    
    return new_key


def parse_email(raw_email: bytes) -> Dict:
    """Parse raw email into structured data."""
    msg = BytesParser(policy=policy.default).parsebytes(raw_email)
    
    # Extract headers
    subject = msg.get('Subject', '')
    from_addr = msg.get('From', '')
    to_addr = msg.get('To', '')
    date = msg.get('Date', '')
    message_id = msg.get('Message-ID', '')
    
    # Parse from address
    from_name = ''
    from_email = from_addr
    if '<' in from_addr:
        parts = from_addr.split('<')
        from_name = parts[0].strip().strip('"')
        from_email = parts[1].strip('>')
    
    # Extract body and attachments
    body = ''
    attachments = []
    
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get('Content-Disposition', ''))
            
            if 'attachment' in content_disposition:
                filename = part.get_filename()
                if filename:
                    attachments.append({
                        'filename': filename,
                        'content_type': content_type,
                        'data': part.get_payload(decode=True)
                    })
            elif content_type == 'text/plain':
                payload = part.get_payload(decode=True)
                if payload:
                    body += payload.decode('utf-8', errors='ignore')
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode('utf-8', errors='ignore')
    
    return {
        'message_id': message_id,
        'subject': subject,
        'from_name': from_name,
        'from_email': from_email,
        'to': to_addr,
        'date': date,
        'body': body,
        'attachments': attachments
    }


# ============================================================
# Document Processing (Textract)
# ============================================================

def get_textract_client():
    """Get Textract client."""
    return boto3.client(
        'textract',
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )


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
        textract = get_textract_client()
        
        response = textract.detect_document_text(
            Document={"Bytes": file_data}
        )
        
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
return null for that field. Never make up information.

Return a JSON object with these fields (use null if not found):
- patient_name: string or null
- dob: string (format: MM/DD/YYYY) or null
- phone: string or null
- address: string or null
- insurance: string (insurance provider name) or null
- policy_number: string or null
- diagnosis: array of strings — empty array [] if none
- medications: array of strings — empty array [] if none
- allergies: array of strings — empty array [] if none
- physician: string (referring physician name) or null
- facility: string (requested facility, default "Optalis Healthcare" if not specified)
- services: array of strings — empty array [] if none
- priority: string (one of: "high", "medium", "normal")
- ai_summary: string (2-3 sentence clinical summary)
- confidence_score: number (0-100, your confidence in extraction accuracy)

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
        "phone": None,
        "address": None,
        "insurance": "Medicare",
        "policy_number": None,
        "diagnosis": ["Pending extraction"],
        "medications": [],
        "allergies": [],
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


def create_application(email_data: Dict, extracted: Dict, s3_key: str) -> str:
    """Create application record via API."""
    import requests
    from email.utils import parsedate_to_datetime
    
    app_id = generate_application_id()
    now = datetime.now(timezone.utc).isoformat()
    
    # Use email date if available, otherwise use current time
    email_date = email_data.get("date", "")
    created_at = now
    if email_date:
        try:
            parsed_date = parsedate_to_datetime(email_date)
            created_at = parsed_date.isoformat()
            print(f"   📅 Using email date: {created_at}")
        except Exception:
            print(f"   📅 Could not parse email date, using current time")
    
    payload = {
        "id": app_id,
        "status": "pending",
        "priority": extracted.get("priority", "normal"),
        "source": "Email (S3 Intake)",
        "source_email": email_data.get("from_email", ""),
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
        "s3_key": s3_key,
        "created_at": created_at,
        "updated_at": now
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=30)
        if response.status_code in [200, 201]:
            print(f"   ✓ Posted to API")
        else:
            print(f"   ⚠ API returned {response.status_code}: {response.text[:100]}")
    except Exception as e:
        print(f"   ⚠ API error: {e}")
    
    return app_id


# ============================================================
# Main Processing Loop
# ============================================================

def process_email(s3_key: str) -> Optional[str]:
    """Process a single email from S3."""
    print(f"\n📧 Processing: {s3_key}")
    
    try:
        # Download and parse email
        raw_email = download_email(s3_key)
        email_data = parse_email(raw_email)
        
        subject = email_data.get('subject', '')
        from_email = email_data.get('from_email', '')
        body = email_data.get('body', '')
        attachments = email_data.get('attachments', [])
        
        print(f"   Subject: {subject}")
        print(f"   From: {from_email}")
        
        # Healthcare keyword check
        is_healthcare, keyword_count = is_healthcare_email(subject, body, attachments)
        
        if not is_healthcare:
            print(f"   ⏭️  Skipping: Not a healthcare application ({keyword_count} keywords)")
            move_email(s3_key, S3_FAILED_PREFIX)
            return None
        
        print(f"   ✓ Healthcare keywords: {keyword_count} matches")
        
        # Extract text from attachments
        all_text = body
        for attachment in attachments:
            filename = attachment['filename']
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
        
        # AI extraction
        print("   🤖 Running GPT-4 extraction...")
        extracted = extract_application_data(all_text, subject)
        
        # Required fields check
        has_required, missing_fields = has_required_fields(extracted)
        
        if not has_required:
            print(f"   ⏭️  Skipping: Missing required fields: {', '.join(missing_fields)}")
            move_email(s3_key, S3_FAILED_PREFIX)
            return None
        
        print(f"   ✓ Patient: {extracted['patient_name']}")
        print(f"   ✓ DOB: {extracted.get('dob', 'N/A')}")
        print(f"   ✓ Confidence: {extracted.get('confidence_score', 0)}%")
        
        # Create application
        app_id = create_application(email_data, extracted, s3_key)
        print(f"   ✅ Created application: {app_id}")
        
        # Move to processed
        new_key = move_email(s3_key, S3_PROCESSED_PREFIX)
        print(f"   📁 Moved to: {new_key}")
        
        return app_id
        
    except Exception as e:
        print(f"   ❌ Error processing email: {e}")
        try:
            move_email(s3_key, S3_FAILED_PREFIX)
        except:
            pass
        return None


def run_intake(watch: bool = False, interval: int = 60):
    """Main intake loop."""
    print("\n" + "="*60)
    print("🏥 Optalis S3 Email Intake Service")
    print(f"📧 Monitoring: s3://{S3_EMAIL_BUCKET}/{S3_EMAIL_PREFIX}")
    if watch:
        print(f"⏱️  Poll interval: {interval}s")
    print("="*60)
    
    while True:
        try:
            print(f"\n🔍 Checking for new emails... ({datetime.now().strftime('%H:%M:%S')})")
            
            emails = list_incoming_emails()
            
            if emails:
                print(f"   Found {len(emails)} new email(s)")
                for s3_key in emails:
                    process_email(s3_key)
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
    print("\n🧪 Running test...")
    
    emails = list_incoming_emails()
    print(f"Found {len(emails)} emails in S3")
    
    for s3_key in emails[:1]:  # Process first email only
        process_email(s3_key)


# ============================================================
# CLI Entry Point
# ============================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Optalis S3 Email Intake Service")
    parser.add_argument("--watch", action="store_true", help="Poll continuously")
    parser.add_argument("--interval", type=int, default=60, help="Poll interval in seconds")
    parser.add_argument("--test", action="store_true", help="Run test mode")
    args = parser.parse_args()
    
    if args.test:
        run_test()
    else:
        run_intake(watch=args.watch, interval=args.interval)
