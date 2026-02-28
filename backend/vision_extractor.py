"""
Vision-Based Document Extraction Pipeline
==========================================
Primary: GPT-4 Vision (sees documents directly)
Fallback: GPT-4 Turbo (for low confidence re-processing)

This provides maximum accuracy for healthcare document extraction by:
1. Sending document images directly to GPT-4 Vision
2. Getting structured extraction with field-level confidence scores
3. Automatically re-processing with GPT-4 Turbo if overall confidence < threshold
4. Supporting PDF, images, and Word documents
"""

import os
import io
import json
import base64
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
from datetime import datetime

from openai import OpenAI

# PDF to image conversion
try:
    import pdf2image
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("⚠ pdf2image not installed - PDF vision processing unavailable")

try:
    from PIL import Image
    PIL_SUPPORT = True
except ImportError:
    PIL_SUPPORT = False
    print("⚠ Pillow not installed - image processing limited")

# ============================================================
# Configuration
# ============================================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Model configuration
VISION_MODEL = "gpt-4o"  # GPT-4 Vision (default, best accuracy)
TURBO_MODEL = "gpt-4-turbo"  # Fallback for low confidence
CONFIDENCE_THRESHOLD = 85  # Re-process with Turbo if below this

# Image processing settings
MAX_IMAGE_SIZE = (2048, 2048)  # Max dimensions for API
JPEG_QUALITY = 85  # Quality for compression


# ============================================================
# Core Extraction Prompts
# ============================================================

VISION_SYSTEM_PROMPT = """You are an expert healthcare admissions document analyzer with exceptional accuracy.
You can see and read documents including handwritten text, checkboxes, stamps, and poor quality scans.

Your task is to extract patient and referral information with maximum accuracy.
For each field, assess your confidence based on:
- Clarity of the source text/image
- Whether the value was explicitly stated vs inferred
- Consistency with other information in the document

Be conservative with confidence scores - only rate 95+ if the field is crystal clear."""

EXTRACTION_PROMPT = """Analyze this healthcare document image and extract ALL available information for a skilled nursing/post-acute care referral.

Return a JSON object with these fields (extract as many as you can find):

{
  "patient_name": {"value": string or null, "confidence": 0-100},
  "dob": {"value": string (MM/DD/YYYY) or null, "confidence": 0-100},
  "sex": {"value": "Male"|"Female"|"Other" or null, "confidence": 0-100},
  "ssn_last4": {"value": string (last 4 digits only) or null, "confidence": 0-100},
  "phone": {"value": string or null, "confidence": 0-100},
  "address": {"value": string or null, "confidence": 0-100},
  
  "referral_type": {"value": "New Referral"|"Return to Hospital" or null, "confidence": 0-100},
  "hospital": {"value": string (hospital patient is currently at) or null, "confidence": 0-100},
  "building": {"value": string (building/facility referral is for) or null, "confidence": 0-100},
  "room_number": {"value": string or null, "confidence": 0-100},
  "case_manager_name": {"value": string or null, "confidence": 0-100},
  "case_manager_phone": {"value": string or null, "confidence": 0-100},
  
  "insurance": {"value": string (provider name) or null, "confidence": 0-100},
  "policy_number": {"value": string or null, "confidence": 0-100},
  "care_level": {"value": "SNF"|"LTC"|"AL"|"Hospice" or null, "confidence": 0-100},
  
  "date_admitted": {"value": string (MM/DD/YYYY) or null, "confidence": 0-100},
  "inpatient_date": {"value": string (MM/DD/YYYY) or null, "confidence": 0-100},
  "anticipated_discharge": {"value": string (MM/DD/YYYY) or null, "confidence": 0-100},
  
  "diagnosis": {"value": [array of diagnosis strings] or [], "confidence": 0-100},
  "medications": {"value": [array of medication strings with dosages] or [], "confidence": 0-100},
  "allergies": {"value": [array of allergy strings] or [], "confidence": 0-100},
  "fall_risk": {"value": true|false or null, "confidence": 0-100},
  "smoking_status": {"value": "Never"|"Former"|"Current" or null, "confidence": 0-100},
  "isolation": {"value": string (isolation requirements) or null, "confidence": 0-100},
  "barrier_precautions": {"value": string (enhanced barrier precautions) or null, "confidence": 0-100},
  
  "dme": {"value": string (durable medical equipment needed) or null, "confidence": 0-100},
  "diet": {"value": string (dietary requirements) or null, "confidence": 0-100},
  "height": {"value": string or null, "confidence": 0-100},
  "weight": {"value": string or null, "confidence": 0-100},
  "iv_meds": {"value": string (IV medications if any) or null, "confidence": 0-100},
  "expensive_meds": {"value": string (expensive/carve-out/chemo meds) or null, "confidence": 0-100},
  "infection_prevention": {"value": string or null, "confidence": 0-100},
  
  "physician": {"value": string (referring physician) or null, "confidence": 0-100},
  "facility": {"value": string or "Optalis Healthcare", "confidence": 0-100},
  "services": {"value": [array like "Skilled Nursing", "Physical Therapy", "Occupational Therapy"] or [], "confidence": 0-100},
  
  "therapy_prior_level": {"value": string (prior level of function - living situation, stairs, assistance needed) or null, "confidence": 0-100},
  "therapy_bed_mobility": {"value": string (current bed mobility status) or null, "confidence": 0-100},
  "therapy_transfers": {"value": string (current transfer status) or null, "confidence": 0-100},
  "therapy_gait": {"value": string (current gait/ambulation status) or null, "confidence": 0-100},
  
  "clinical_summary": {"value": string (detailed clinical summary of current condition and history) or null, "confidence": 0-100},
  "priority": {"value": "high"|"medium"|"normal", "confidence": 0-100},
  "ai_summary": string (2-3 sentence summary for quick admissions review),
  "overall_confidence": number (0-100, weighted average of field confidences),
  "extraction_notes": string (any issues, unclear areas, or fields needing human review)
}

Important Instructions:
- Look carefully at checkboxes - checked vs unchecked
- Read handwritten text carefully, even if messy
- Note any stamps, signatures, or dates
- For Fall Risk, look for checkboxes or yes/no indicators
- If a field is illegible, set confidence to 0-50 and note in extraction_notes
- Extract EVERYTHING you can find - this is for post-acute care admissions
- Return ONLY valid JSON, no markdown formatting or code blocks"""


TURBO_VERIFICATION_PROMPT = """You are verifying a healthcare document extraction that had low confidence.
The original extraction is provided below. Please re-analyze the raw text and either:
1. Confirm the extracted values (improve confidence if text is clear)
2. Correct any errors you find
3. Fill in any fields that were missed

Original extraction:
{original_extraction}

Document text:
{document_text}

Return an updated JSON object in the same format with corrected values and updated confidence scores.
Set confidence higher only if you are certain. Add notes about any corrections made.

Return ONLY valid JSON, no markdown formatting."""


# ============================================================
# Image Processing Utilities
# ============================================================

def convert_pdf_to_images(pdf_data: bytes) -> List[bytes]:
    """Convert PDF pages to images for Vision API."""
    if not PDF_SUPPORT:
        raise ImportError("pdf2image required for PDF processing. Install with: pip install pdf2image")
    
    images = pdf2image.convert_from_bytes(pdf_data, dpi=150)
    image_bytes_list = []
    
    for img in images:
        # Resize if too large
        if img.size[0] > MAX_IMAGE_SIZE[0] or img.size[1] > MAX_IMAGE_SIZE[1]:
            img.thumbnail(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
        
        # Convert to JPEG bytes
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY)
        image_bytes_list.append(buffer.getvalue())
    
    return image_bytes_list


def prepare_image(image_data: bytes, filename: str = "") -> bytes:
    """Prepare image for Vision API (resize, compress if needed)."""
    if not PIL_SUPPORT:
        return image_data  # Return as-is without processing
    
    try:
        img = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary (handles PNG with alpha, etc.)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Resize if too large
        if img.size[0] > MAX_IMAGE_SIZE[0] or img.size[1] > MAX_IMAGE_SIZE[1]:
            img.thumbnail(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
        
        # Convert to JPEG
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY)
        return buffer.getvalue()
    
    except Exception as e:
        print(f"  ⚠ Image processing error: {e}")
        return image_data


def encode_image_base64(image_data: bytes) -> str:
    """Encode image to base64 for API."""
    return base64.b64encode(image_data).decode('utf-8')


# ============================================================
# Vision Extraction (Primary)
# ============================================================

def extract_with_vision(
    image_data_list: List[bytes],
    subject: str = "",
    email_body: str = ""
) -> Dict[str, Any]:
    """
    Primary extraction using GPT-4 Vision.
    Sends document images directly to the model.
    """
    if not OPENAI_API_KEY:
        print("  ⚠ OpenAI API key not set")
        return _empty_extraction("No API key configured")
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    # Build message content with images
    content = []
    
    # Add context text if available
    context_text = f"Email Subject: {subject}\n" if subject else ""
    if email_body:
        context_text += f"Email Body Preview: {email_body[:500]}\n"
    
    if context_text:
        content.append({"type": "text", "text": context_text})
    
    content.append({"type": "text", "text": EXTRACTION_PROMPT})
    
    # Add images
    for i, img_data in enumerate(image_data_list[:10]):  # Limit to 10 pages
        prepared_img = prepare_image(img_data)
        b64_image = encode_image_base64(prepared_img)
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{b64_image}",
                "detail": "high"  # High detail for document analysis
            }
        })
    
    try:
        print(f"  📸 Sending {len(image_data_list)} image(s) to GPT-4 Vision...")
        
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {"role": "system", "content": VISION_SYSTEM_PROMPT},
                {"role": "user", "content": content}
            ],
            temperature=0.1,
            max_tokens=3000
        )
        
        result_text = response.choices[0].message.content.strip()
        result = _parse_json_response(result_text)
        
        # Add metadata
        result["_extraction_method"] = "gpt4_vision"
        result["_model"] = VISION_MODEL
        result["_timestamp"] = datetime.now().isoformat()
        result["_images_processed"] = len(image_data_list)
        
        # Calculate token usage for cost tracking
        if hasattr(response, 'usage'):
            result["_tokens"] = {
                "input": response.usage.prompt_tokens,
                "output": response.usage.completion_tokens,
                "total": response.usage.total_tokens
            }
        
        return result
    
    except Exception as e:
        print(f"  ⚠ GPT-4 Vision extraction error: {e}")
        return _empty_extraction(str(e))


# ============================================================
# Turbo Verification (Fallback)
# ============================================================

def verify_with_turbo(
    original_extraction: Dict[str, Any],
    raw_text: str,
    subject: str = ""
) -> Dict[str, Any]:
    """
    Fallback verification using GPT-4 Turbo.
    Used when Vision extraction has low confidence.
    """
    if not OPENAI_API_KEY:
        return original_extraction
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    # Format original extraction for the prompt
    original_json = json.dumps(original_extraction, indent=2, default=str)
    
    prompt = TURBO_VERIFICATION_PROMPT.format(
        original_extraction=original_json,
        document_text=raw_text[:12000]  # More text context for Turbo
    )
    
    if subject:
        prompt = f"Email Subject: {subject}\n\n{prompt}"
    
    try:
        print(f"  🔄 Re-processing with GPT-4 Turbo (confidence was {original_extraction.get('overall_confidence', 0)}%)...")
        
        response = client.chat.completions.create(
            model=TURBO_MODEL,
            messages=[
                {"role": "system", "content": VISION_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=3000
        )
        
        result_text = response.choices[0].message.content.strip()
        result = _parse_json_response(result_text)
        
        # Add metadata
        result["_extraction_method"] = "gpt4_turbo_verification"
        result["_model"] = TURBO_MODEL
        result["_timestamp"] = datetime.now().isoformat()
        result["_original_confidence"] = original_extraction.get("overall_confidence", 0)
        result["_reprocessed"] = True
        
        # Track token usage
        if hasattr(response, 'usage'):
            result["_tokens"] = {
                "input": response.usage.prompt_tokens,
                "output": response.usage.completion_tokens,
                "total": response.usage.total_tokens
            }
        
        return result
    
    except Exception as e:
        print(f"  ⚠ GPT-4 Turbo verification error: {e}")
        # Return original if verification fails
        original_extraction["_turbo_error"] = str(e)
        return original_extraction


# ============================================================
# Main Extraction Pipeline
# ============================================================

def extract_document(
    file_data: bytes,
    filename: str,
    subject: str = "",
    email_body: str = "",
    raw_text: str = "",
    confidence_threshold: int = CONFIDENCE_THRESHOLD
) -> Dict[str, Any]:
    """
    Main extraction pipeline with automatic fallback.
    
    1. Convert document to images (if PDF)
    2. Extract with GPT-4 Vision
    3. If confidence < threshold, re-process with GPT-4 Turbo
    4. Return best result
    
    Args:
        file_data: Raw file bytes
        filename: Original filename (for type detection)
        subject: Email subject (optional context)
        email_body: Email body text (optional context)
        raw_text: Pre-extracted text (for Turbo fallback)
        confidence_threshold: Re-process if below this (default 85)
    
    Returns:
        Extraction result with field values, confidences, and metadata
    """
    ext = filename.lower().split(".")[-1] if filename else ""
    print(f"  📄 Processing {filename} ({ext})...")
    
    # Step 1: Convert to images
    image_list = []
    
    if ext == "pdf":
        if PDF_SUPPORT:
            try:
                image_list = convert_pdf_to_images(file_data)
                print(f"  📑 Converted PDF to {len(image_list)} page(s)")
            except Exception as e:
                print(f"  ⚠ PDF conversion error: {e}")
        else:
            print("  ⚠ PDF support not available, falling back to text extraction")
    
    elif ext in ["jpg", "jpeg", "png", "tiff", "tif", "gif", "webp", "bmp"]:
        image_list = [file_data]
    
    elif ext in ["docx", "doc"]:
        # Word docs - extract text and optionally convert to image
        print("  📝 Word document - using text extraction + Vision on embedded images")
        # For now, we'll rely on text extraction for Word docs
        # Could add Word-to-PDF conversion for full Vision support
    
    # Step 2: Vision extraction (if we have images)
    if image_list:
        result = extract_with_vision(image_list, subject, email_body)
    else:
        # No images - use text-based extraction
        result = _text_based_extraction(raw_text, subject)
    
    # Step 3: Check confidence and potentially re-process
    overall_confidence = result.get("overall_confidence", 0)
    
    if overall_confidence < confidence_threshold and raw_text:
        print(f"  ⚠ Low confidence ({overall_confidence}%), triggering Turbo verification...")
        verified_result = verify_with_turbo(result, raw_text, subject)
        
        # Use verified result if it's better
        new_confidence = verified_result.get("overall_confidence", 0)
        if new_confidence > overall_confidence:
            print(f"  ✅ Turbo improved confidence: {overall_confidence}% → {new_confidence}%")
            return verified_result
        else:
            print(f"  ℹ Turbo confidence similar ({new_confidence}%), keeping Vision result")
            result["_turbo_attempted"] = True
    
    return result


def _text_based_extraction(raw_text: str, subject: str = "") -> Dict[str, Any]:
    """Fallback text-based extraction when images unavailable."""
    if not OPENAI_API_KEY:
        return _empty_extraction("No API key configured")
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    prompt = f"""Analyze this healthcare document text and extract information.

Email Subject: {subject}

Document Text:
{raw_text[:10000]}

{EXTRACTION_PROMPT}"""
    
    try:
        response = client.chat.completions.create(
            model=TURBO_MODEL,  # Use Turbo for text-only
            messages=[
                {"role": "system", "content": VISION_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=3000
        )
        
        result_text = response.choices[0].message.content.strip()
        result = _parse_json_response(result_text)
        result["_extraction_method"] = "gpt4_turbo_text"
        result["_model"] = TURBO_MODEL
        return result
    
    except Exception as e:
        return _empty_extraction(str(e))


# ============================================================
# Utility Functions
# ============================================================

def _parse_json_response(text: str) -> Dict[str, Any]:
    """Parse JSON from model response, handling markdown formatting."""
    # Clean up markdown code blocks
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first and last lines (```json and ```)
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    
    # Remove any "json" prefix
    if text.startswith("json"):
        text = text[4:].strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"  ⚠ JSON parse error: {e}")
        return _empty_extraction(f"JSON parse error: {e}")


def _empty_extraction(error: str = "") -> Dict[str, Any]:
    """Return empty extraction structure."""
    return {
        # Patient Info
        "patient_name": {"value": None, "confidence": 0},
        "dob": {"value": None, "confidence": 0},
        "sex": {"value": None, "confidence": 0},
        "ssn_last4": {"value": None, "confidence": 0},
        "phone": {"value": None, "confidence": 0},
        "address": {"value": None, "confidence": 0},
        # Referral Info
        "referral_type": {"value": None, "confidence": 0},
        "hospital": {"value": None, "confidence": 0},
        "building": {"value": None, "confidence": 0},
        "room_number": {"value": None, "confidence": 0},
        "case_manager_name": {"value": None, "confidence": 0},
        "case_manager_phone": {"value": None, "confidence": 0},
        # Insurance & Dates
        "insurance": {"value": None, "confidence": 0},
        "policy_number": {"value": None, "confidence": 0},
        "care_level": {"value": None, "confidence": 0},
        "date_admitted": {"value": None, "confidence": 0},
        "inpatient_date": {"value": None, "confidence": 0},
        "anticipated_discharge": {"value": None, "confidence": 0},
        # Clinical Info
        "diagnosis": {"value": [], "confidence": 0},
        "medications": {"value": [], "confidence": 0},
        "allergies": {"value": [], "confidence": 0},
        "fall_risk": {"value": None, "confidence": 0},
        "smoking_status": {"value": None, "confidence": 0},
        "isolation": {"value": None, "confidence": 0},
        "barrier_precautions": {"value": None, "confidence": 0},
        # Medical Details
        "dme": {"value": None, "confidence": 0},
        "diet": {"value": None, "confidence": 0},
        "height": {"value": None, "confidence": 0},
        "weight": {"value": None, "confidence": 0},
        "iv_meds": {"value": None, "confidence": 0},
        "expensive_meds": {"value": None, "confidence": 0},
        "infection_prevention": {"value": None, "confidence": 0},
        # Therapy
        "therapy_prior_level": {"value": None, "confidence": 0},
        "therapy_bed_mobility": {"value": None, "confidence": 0},
        "therapy_transfers": {"value": None, "confidence": 0},
        "therapy_gait": {"value": None, "confidence": 0},
        "services": {"value": [], "confidence": 0},
        # Summary
        "physician": {"value": None, "confidence": 0},
        "facility": {"value": "Optalis Healthcare", "confidence": 50},
        "clinical_summary": {"value": None, "confidence": 0},
        "priority": {"value": "normal", "confidence": 50},
        "ai_summary": "Unable to extract document information.",
        "overall_confidence": 0,
        "extraction_notes": f"Extraction failed: {error}" if error else "No data extracted",
        "_extraction_method": "failed",
        "_error": error
    }


def flatten_extraction(result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Flatten extraction result for database storage.
    Converts {field: {value, confidence}} to flat structure.
    """
    flattened = {}
    
    # Fields with value/confidence structure
    value_fields = [
        # Patient Info
        "patient_name", "dob", "sex", "ssn_last4", "phone", "address",
        # Referral Info
        "referral_type", "hospital", "building", "room_number", 
        "case_manager_name", "case_manager_phone",
        # Insurance & Dates
        "insurance", "policy_number", "care_level",
        "date_admitted", "inpatient_date", "anticipated_discharge",
        # Clinical Info
        "diagnosis", "medications", "allergies", "fall_risk", "smoking_status",
        "isolation", "barrier_precautions",
        # Medical Details
        "dme", "diet", "height", "weight", "iv_meds", "expensive_meds", "infection_prevention",
        # Therapy
        "therapy_prior_level", "therapy_bed_mobility", "therapy_transfers", "therapy_gait",
        "services",
        # Summary
        "physician", "facility", "clinical_summary", "priority"
    ]
    
    for field in value_fields:
        if field in result:
            if isinstance(result[field], dict):
                flattened[field] = result[field].get("value")
                flattened[f"{field}_confidence"] = result[field].get("confidence", 0)
            else:
                flattened[field] = result[field]
    
    # Direct fields
    flattened["ai_summary"] = result.get("ai_summary", "")
    flattened["confidence_score"] = result.get("overall_confidence", 0)
    flattened["extraction_notes"] = result.get("extraction_notes", "")
    
    # Extra data (additional extracted information)
    extra_data = result.get("extra_data", {})
    if extra_data:
        # Filter out empty/null values
        filtered_extra = {k: v for k, v in extra_data.items() if v and v != [] and v != {}}
        flattened["extra_data"] = filtered_extra if filtered_extra else None
    else:
        flattened["extra_data"] = None
    
    # Ensure list fields are actual lists (not JSON strings)
    for field in ["diagnosis", "medications", "allergies", "services"]:
        if field in flattened:
            val = flattened[field]
            # If it's a string that looks like JSON, parse it
            if isinstance(val, str):
                try:
                    parsed = json.loads(val)
                    if isinstance(parsed, list):
                        flattened[field] = parsed
                except:
                    # If not valid JSON, wrap in a list
                    flattened[field] = [val] if val else []
            elif not isinstance(val, list):
                flattened[field] = [val] if val else []
    
    # Ensure priority is a string
    if "priority" in flattened:
        if isinstance(flattened["priority"], dict):
            flattened["priority"] = flattened["priority"].get("value", "normal")
        if not isinstance(flattened["priority"], str):
            flattened["priority"] = str(flattened["priority"]) if flattened["priority"] else "normal"
    
    # Metadata
    flattened["_extraction_method"] = result.get("_extraction_method", "unknown")
    flattened["_reprocessed"] = result.get("_reprocessed", False)
    
    return flattened


# ============================================================
# Cost Estimation
# ============================================================

def estimate_cost(num_documents: int, avg_pages: int = 4) -> Dict[str, float]:
    """
    Estimate processing costs for a batch of documents.
    
    Based on GPT-4o pricing:
    - Input: $2.50 / 1M tokens
    - Output: $10.00 / 1M tokens
    - Images: ~765 tokens per 512x512 tile (high detail uses more)
    """
    # Estimates per document
    tokens_per_page = 2500  # Image tokens (high detail)
    output_tokens = 1000  # JSON response
    
    total_input_tokens = num_documents * avg_pages * tokens_per_page
    total_output_tokens = num_documents * output_tokens
    
    # GPT-4o pricing
    input_cost = (total_input_tokens / 1_000_000) * 2.50
    output_cost = (total_output_tokens / 1_000_000) * 10.00
    
    # Estimate 10% need Turbo reprocessing
    turbo_docs = int(num_documents * 0.10)
    turbo_input = turbo_docs * 8000  # Text tokens
    turbo_output = turbo_docs * 1000
    turbo_cost = ((turbo_input / 1_000_000) * 10.00) + ((turbo_output / 1_000_000) * 30.00)
    
    total = input_cost + output_cost + turbo_cost
    
    return {
        "documents": num_documents,
        "avg_pages": avg_pages,
        "vision_input_tokens": total_input_tokens,
        "vision_output_tokens": total_output_tokens,
        "vision_cost": round(input_cost + output_cost, 2),
        "turbo_fallback_docs": turbo_docs,
        "turbo_cost": round(turbo_cost, 2),
        "total_cost": round(total, 2),
        "cost_per_document": round(total / num_documents, 4) if num_documents > 0 else 0
    }


if __name__ == "__main__":
    # Test cost estimation
    print("\n📊 Cost Estimation for 1,200 documents/month:")
    costs = estimate_cost(1200, avg_pages=4)
    for key, value in costs.items():
        print(f"  {key}: {value}")
