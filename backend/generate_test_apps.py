#!/usr/bin/env python3
"""
Generate test applications with full Optalis intake data.
Run: python generate_test_apps.py
"""

import requests
import random
from datetime import datetime, timedelta
import uuid

API_URL = "https://optalis-api-production.up.railway.app"

# Optalis Ohio locations
BUILDINGS = [
    "Dublin",
    "Westerville", 
    "Gahanna",
    "Reynoldsburg",
    "Grove City",
    "Hilliard",
    "Powell",
    "Pickerington",
    "Lancaster"
]

# Ohio hospitals that refer patients
HOSPITALS = [
    "Ohio State Wexner Medical Center",
    "Mount Carmel East",
    "Riverside Methodist Hospital",
    "Grant Medical Center",
    "OhioHealth Dublin Methodist",
    "Mount Carmel St. Ann's",
    "OhioHealth Grady Memorial",
    "Fairfield Medical Center",
    "Nationwide Children's Hospital"
]

# Referral sources
REFERRAL_SOURCES = [
    "Hospital Discharge",
    "Physician Referral", 
    "Family Request",
    "Home Health Agency",
    "Insurance Case Manager",
    "Rehab Hospital",
    "Emergency Room"
]

# Case managers
CASE_MANAGERS = [
    ("Sarah Mitchell", "614-555-0101"),
    ("Jennifer Adams", "614-555-0102"),
    ("Michael Brown", "614-555-0103"),
    ("Lisa Thompson", "614-555-0104"),
    ("David Wilson", "614-555-0105"),
    ("Amanda Garcia", "614-555-0106"),
    ("Robert Taylor", "614-555-0107"),
    ("Emily Davis", "614-555-0108"),
]

# Patient first names
FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", 
               "William", "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
               "Thomas", "Sarah", "Charles", "Karen", "Dorothy", "Helen", "George", "Betty"]

LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
              "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
              "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White"]

# Medical data
DIAGNOSES = [
    "Hip Fracture (S72.001A)",
    "Stroke - Left CVA (I63.9)",
    "COPD Exacerbation (J44.1)",
    "CHF - Congestive Heart Failure (I50.9)",
    "Total Knee Replacement (Z96.651)",
    "Total Hip Replacement (Z96.641)",
    "Pneumonia (J18.9)",
    "UTI - Urinary Tract Infection (N39.0)",
    "Diabetes Type 2 (E11.9)",
    "Parkinson's Disease (G20)",
    "Dementia (F03.90)",
    "Cellulitis (L03.90)",
    "Sepsis (A41.9)",
    "Acute Kidney Injury (N17.9)"
]

MEDICATIONS = [
    "Metoprolol 25mg BID",
    "Lisinopril 10mg daily",
    "Metformin 500mg BID",
    "Omeprazole 20mg daily",
    "Aspirin 81mg daily",
    "Atorvastatin 40mg daily",
    "Furosemide 40mg daily",
    "Potassium Chloride 20mEq daily",
    "Amlodipine 5mg daily",
    "Gabapentin 300mg TID",
    "Oxycodone 5mg Q4H PRN",
    "Tylenol 650mg Q6H PRN",
    "Insulin Glargine 20 units QHS",
    "Eliquis 5mg BID",
    "Seroquel 25mg QHS"
]

ALLERGIES = [
    "Penicillin",
    "Sulfa",
    "Codeine", 
    "Latex",
    "Iodine Contrast",
    "Morphine",
    "Aspirin",
    "NKDA (No Known Drug Allergies)"
]

INSURANCE_TYPES = [
    ("Medicare Part A", "1EG4-TE5-MK72"),
    ("Medicare Advantage - Humana", "H1234567890"),
    ("Medicare Advantage - Aetna", "A9876543210"),
    ("Medicaid Ohio", "OH123456789"),
    ("UnitedHealthcare", "UHC-888-123456"),
    ("Anthem Blue Cross", "ABC-XYZ-789012"),
    ("Cigna", "CIG-456-789012"),
    ("Private Pay", "N/A")
]

CARE_LEVELS = ["Skilled Nursing", "Long Term Care", "Respite", "Memory Care", "Rehabilitation"]

DIETS = ["Regular", "Cardiac/Low Sodium", "Diabetic", "Mechanical Soft", "Pureed", "Thickened Liquids", "NPO"]

DME_ITEMS = ["Wheelchair", "Walker", "Hospital Bed", "Hoyer Lift", "CPAP", "Oxygen 2L NC", "Commode", "None"]

ISOLATION_TYPES = ["None", "Contact", "Droplet", "Airborne", "Contact + Droplet"]

THERAPY_LEVELS = ["Independent", "Supervision", "Minimal Assist", "Moderate Assist", "Maximum Assist", "Total Assist", "Not Applicable"]


def random_date(start_days_ago=30, end_days_ago=0):
    """Generate a random date between start and end days ago."""
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).strftime("%Y-%m-%d")


def random_phone():
    return f"614-{random.randint(200,999)}-{random.randint(1000,9999)}"


def generate_application():
    """Generate a single realistic application."""
    
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    patient_name = f"{first} {last}"
    
    # Random dates
    created_date = random_date(14, 0)  # Within last 2 weeks
    dob_year = random.randint(1935, 1960)
    dob = f"{dob_year}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
    
    # Hospital admission dates
    date_admitted = random_date(21, 3)
    inpatient_date = random_date(21, 3)
    anticipated_discharge = random_date(0, -7)  # Future date
    
    # Select random data
    hospital = random.choice(HOSPITALS)
    building = random.choice(BUILDINGS)
    source = random.choice(REFERRAL_SOURCES)
    case_manager = random.choice(CASE_MANAGERS)
    insurance = random.choice(INSURANCE_TYPES)
    
    # Randomly select 1-3 diagnoses
    num_diagnoses = random.randint(1, 3)
    diagnoses = random.sample(DIAGNOSES, num_diagnoses)
    
    # Randomly select 3-8 medications
    num_meds = random.randint(3, 8)
    medications = random.sample(MEDICATIONS, num_meds)
    
    # Allergies
    if random.random() < 0.3:
        allergies = ["NKDA (No Known Drug Allergies)"]
    else:
        allergies = random.sample([a for a in ALLERGIES if a != "NKDA (No Known Drug Allergies)"], random.randint(1, 3))
    
    # Status distribution: 60% pending, 20% review, 10% approved, 10% denied
    status_roll = random.random()
    if status_roll < 0.60:
        status = "pending"
        decision_notes = None
    elif status_roll < 0.80:
        status = "review"
        decision_notes = "Additional clinical documentation requested"
    elif status_roll < 0.90:
        status = "approved"
        decision_notes = "Meets all admission criteria. Bed assigned."
    else:
        status = "denied"
        denial_reasons = [
            "Insufficient insurance coverage for required level of care",
            "Clinical acuity exceeds facility capabilities",
            "No available beds at this time - capacity full",
            "Missing required documentation from referring hospital",
            "Patient requires services not offered at this location"
        ]
        decision_notes = random.choice(denial_reasons)
    
    # Priority: 20% high
    priority = "high" if random.random() < 0.2 else "normal"
    
    # Clinical data
    fall_risk = random.random() < 0.4  # 40% fall risk
    smoking = random.choice(["Never", "Former", "Current"])
    
    # Therapy levels
    therapy_prior = random.choice(THERAPY_LEVELS)
    therapy_bed = random.choice(THERAPY_LEVELS)
    therapy_transfers = random.choice(THERAPY_LEVELS)
    therapy_gait = random.choice(THERAPY_LEVELS)
    
    # AI summary
    ai_summary = f"Patient {patient_name} is a {2024 - dob_year} year old presenting from {hospital} with primary diagnosis of {diagnoses[0].split(' (')[0]}. "
    ai_summary += f"Referral type: {source}. Insurance: {insurance[0]}. "
    ai_summary += f"Current functional status indicates {therapy_prior.lower()} prior level with {therapy_gait.lower()} gait assistance needed. "
    if fall_risk:
        ai_summary += "Patient is identified as a fall risk. "
    ai_summary += f"Recommended placement: {building} facility for {random.choice(CARE_LEVELS).lower()} level care."
    
    app = {
        "status": status,
        "priority": priority,
        "source": source,
        "source_email": f"referrals@{hospital.lower().replace(' ', '').replace('-', '')[:15]}.org",
        
        # Patient info
        "patient_name": patient_name,
        "dob": dob,
        "sex": random.choice(["Male", "Female"]),
        "phone": random_phone(),
        "address": f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Maple', 'High', 'Broad', 'State'])} {random.choice(['St', 'Ave', 'Rd', 'Blvd'])}, {random.choice(['Columbus', 'Dublin', 'Westerville', 'Gahanna'])}, OH {random.randint(43001, 43299)}",
        "ssn_last4": f"{random.randint(1000, 9999)}",
        
        # Insurance
        "insurance": insurance[0],
        "policy_number": insurance[1],
        
        # Referral info
        "referral_type": source,
        "hospital": hospital,
        "building": building,
        "facility": f"Optalis Healthcare - {building}",
        "room_number": f"{random.randint(1,4)}{random.randint(10,50)}{'A' if random.random() < 0.5 else 'B'}",
        "care_level": random.choice(CARE_LEVELS),
        
        # Case manager
        "case_manager_name": case_manager[0],
        "case_manager_phone": case_manager[1],
        
        # Dates
        "date_admitted": date_admitted,
        "inpatient_date": inpatient_date,
        "anticipated_discharge": anticipated_discharge,
        
        # Clinical
        "diagnosis": diagnoses,
        "medications": medications,
        "allergies": allergies,
        "physician": f"Dr. {random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'])}",
        "fall_risk": fall_risk,
        "smoking_status": smoking,
        "isolation": random.choice(ISOLATION_TYPES),
        "barrier_precautions": "Standard Precautions" if random.random() < 0.7 else "Contact Precautions",
        
        # Medical
        "dme": ", ".join(random.sample(DME_ITEMS, random.randint(1, 3))),
        "diet": random.choice(DIETS),
        "height": f"{random.randint(5,6)}'{random.randint(0,11)}\"",
        "weight": f"{random.randint(120, 220)} lbs",
        "iv_meds": "Yes - IV Antibiotics" if random.random() < 0.3 else "No",
        "expensive_meds": "Yes" if random.random() < 0.2 else "No",
        
        # Therapy
        "therapy_prior_level": therapy_prior,
        "therapy_bed_mobility": therapy_bed,
        "therapy_transfers": therapy_transfers,
        "therapy_gait": therapy_gait,
        
        # Summary
        "clinical_summary": ai_summary,
        "ai_summary": ai_summary,
        "confidence_score": round(random.uniform(0.85, 0.98), 2),
        
        # Decision
        "decision_status": status,
        "decision_notes": decision_notes,
        "last_updated_by": random.choice(["Sarah Admin", "John Reviewer", "Emily Manager"]) if status != "pending" else None,
        
        # Metadata
        "services": random.sample(["Skilled Nursing", "Physical Therapy", "Occupational Therapy", "Speech Therapy", "Wound Care", "IV Therapy"], random.randint(2, 4)),
        "created_at": f"{created_date}T{random.randint(8,17):02d}:{random.randint(0,59):02d}:00Z",
    }
    
    return app


def main():
    print("🏥 Generating test applications for Optalis...")
    print(f"📡 API: {API_URL}")
    print("-" * 50)
    
    num_apps = 18
    success = 0
    failed = 0
    
    for i in range(num_apps):
        app = generate_application()
        
        try:
            response = requests.post(f"{API_URL}/api/applications", json=app, timeout=10)
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✅ {i+1}/{num_apps}: {app['patient_name']} - {app['building']} - {app['status']}")
                success += 1
            else:
                print(f"❌ {i+1}/{num_apps}: Failed - {response.status_code}: {response.text[:100]}")
                failed += 1
        except Exception as e:
            print(f"❌ {i+1}/{num_apps}: Error - {str(e)}")
            failed += 1
    
    print("-" * 50)
    print(f"✅ Success: {success}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total: {num_apps}")


if __name__ == "__main__":
    main()
