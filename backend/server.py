from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

from database import (
    db, init_db, users_collection, specialties_collection, doctors_collection,
    schedules_collection, schedule_exceptions_collection, appointments_collection,
    diagnostic_tests_collection, diagnostic_bookings_collection, blog_posts_collection,
    contact_messages_collection, settings_collection
)
from models import (
    UserCreate, UserLogin, User, Specialty, SpecialtyCreate,
    Doctor, DoctorCreate, DoctorSchedule, DoctorScheduleCreate,
    ScheduleException, ScheduleExceptionCreate, Appointment, AppointmentCreate,
    DiagnosticTest, DiagnosticTestCreate, DiagnosticBooking, DiagnosticBookingCreate,
    BlogPost, BlogPostCreate, ContactMessage, SiteSettings, AppointmentStatus, UserRole
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_admin
)
from email_service import send_booking_confirmation_email, get_whatsapp_message

app = FastAPI(
    title="Sadiqabad Medical Complex API",
    description="Hospital Management System API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Startup Events ====================
@app.on_event("startup")
async def startup_event():
    await init_db()
    await seed_initial_data()

async def seed_initial_data():
    """Seed database with initial data if empty"""
    # Check if data exists
    existing_specialties = await specialties_collection.count_documents({})
    if existing_specialties > 0:
        return
    
    print("Seeding initial data...")
    
    # Seed specialties
    specialties_data = [
        {"id": str(uuid.uuid4()), "name": "Neurology", "description": "Brain and nervous system disorders", "icon": "🧠", "active": True},
        {"id": str(uuid.uuid4()), "name": "Cardiology", "description": "Heart and cardiovascular system", "icon": "❤️", "active": True},
        {"id": str(uuid.uuid4()), "name": "Eye Specialist", "description": "Eye care and vision problems", "icon": "👁️", "active": True},
        {"id": str(uuid.uuid4()), "name": "Chest Specialist", "description": "Respiratory and chest diseases", "icon": "🫁", "active": True},
        {"id": str(uuid.uuid4()), "name": "General Medicine", "description": "General health and primary care", "icon": "🩺", "active": True},
    ]
    await specialties_collection.insert_many(specialties_data)
    
    # Get specialty IDs for doctors
    specialties = await specialties_collection.find().to_list(100)
    specialty_map = {s["name"]: s["id"] for s in specialties}
    
    # Seed doctors
    doctors_data = [
        {
            "id": str(uuid.uuid4()), "name": "Dr. Ahmed Khan", "specialty_id": specialty_map["Cardiology"],
            "qualifications": "MBBS, FCPS (Cardiology)", "bio": "Senior Cardiologist with 15 years of experience in treating heart conditions.",
            "photo": None, "fee": "Call for price", "tags": ["heart", "cardiac"], "gender": "male",
            "languages": ["Urdu", "English", "Punjabi"], "experience_years": 15, "active": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Dr. Fatima Zahra", "specialty_id": specialty_map["Neurology"],
            "qualifications": "MBBS, MRCP (Neurology)", "bio": "Expert in neurological disorders including epilepsy and stroke management.",
            "photo": None, "fee": "Call for price", "tags": ["brain", "nerves"], "gender": "female",
            "languages": ["Urdu", "English"], "experience_years": 12, "active": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Dr. Muhammad Arif", "specialty_id": specialty_map["Eye Specialist"],
            "qualifications": "MBBS, FCPS (Ophthalmology)", "bio": "Specialized in cataract surgery and retinal diseases.",
            "photo": None, "fee": "Call for price", "tags": ["vision", "cataract"], "gender": "male",
            "languages": ["Urdu", "English", "Sindhi"], "experience_years": 18, "active": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Dr. Ayesha Malik", "specialty_id": specialty_map["Chest Specialist"],
            "qualifications": "MBBS, DTCD, FCPS (Pulmonology)", "bio": "Expert in asthma, COPD, and respiratory infections.",
            "photo": None, "fee": "Call for price", "tags": ["lungs", "respiratory"], "gender": "female",
            "languages": ["Urdu", "English"], "experience_years": 10, "active": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Dr. Hassan Ali", "specialty_id": specialty_map["Cardiology"],
            "qualifications": "MBBS, MD (Cardiology)", "bio": "Interventional cardiologist specializing in angioplasty.",
            "photo": None, "fee": "Call for price", "tags": ["heart", "angioplasty"], "gender": "male",
            "languages": ["Urdu", "English", "Punjabi"], "experience_years": 8, "active": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Dr. Sana Tariq", "specialty_id": specialty_map["Neurology"],
            "qualifications": "MBBS, FCPS (Neurology)", "bio": "Pediatric neurologist with expertise in childhood epilepsy.",
            "photo": None, "fee": "Call for price", "tags": ["pediatric", "epilepsy"], "gender": "female",
            "languages": ["Urdu", "English"], "experience_years": 7, "active": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Dr. Imran Sheikh", "specialty_id": specialty_map["Eye Specialist"],
            "qualifications": "MBBS, DOMS, FCPS", "bio": "Glaucoma specialist with experience in laser eye surgery.",
            "photo": None, "fee": "Call for price", "tags": ["glaucoma", "laser"], "gender": "male",
            "languages": ["Urdu", "English"], "experience_years": 14, "active": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Dr. Zainab Hussain", "specialty_id": specialty_map["General Medicine"],
            "qualifications": "MBBS, FCPS (Medicine)", "bio": "General physician with expertise in diabetes and hypertension management.",
            "photo": None, "fee": "Call for price", "tags": ["diabetes", "general"], "gender": "female",
            "languages": ["Urdu", "English", "Punjabi"], "experience_years": 11, "active": True
        },
    ]
    await doctors_collection.insert_many(doctors_data)
    
    # Seed doctor schedules
    doctors = await doctors_collection.find().to_list(100)
    schedules_data = []
    for doctor in doctors:
        # Each doctor works Mon-Sat
        for day in range(6):  # 0-5 (Mon-Sat)
            schedules_data.append({
                "id": str(uuid.uuid4()),
                "doctor_id": doctor["id"],
                "day_of_week": day,
                "start_time": "09:00" if day < 3 else "14:00",
                "end_time": "14:00" if day < 3 else "20:00",
                "slot_minutes": 15,
                "active": True
            })
    await schedules_collection.insert_many(schedules_data)
    
    # Seed diagnostic tests
    diagnostic_tests_data = [
        # Lab Tests
        {"id": str(uuid.uuid4()), "name": "Complete Blood Count (CBC)", "category": "lab_tests", "description": "Comprehensive blood analysis", "preparation": "Fasting for 8-12 hours recommended", "price": "Call for price", "report_time": "Same day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Blood Sugar (Fasting)", "category": "lab_tests", "description": "Glucose level measurement", "preparation": "12 hours fasting required", "price": "Call for price", "report_time": "Same day", "duration_minutes": 10, "active": True},
        {"id": str(uuid.uuid4()), "name": "Blood Sugar (Random)", "category": "lab_tests", "description": "Random glucose level check", "preparation": "No special preparation", "price": "Call for price", "report_time": "Same day", "duration_minutes": 10, "active": True},
        {"id": str(uuid.uuid4()), "name": "HbA1c", "category": "lab_tests", "description": "3-month average blood sugar", "preparation": "No fasting required", "price": "Call for price", "report_time": "Same day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Lipid Profile", "category": "lab_tests", "description": "Cholesterol and triglycerides", "preparation": "12 hours fasting required", "price": "Call for price", "report_time": "Same day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Liver Function Test (LFT)", "category": "lab_tests", "description": "Liver enzyme analysis", "preparation": "Fasting recommended", "price": "Call for price", "report_time": "Same day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Kidney Function Test (KFT)", "category": "lab_tests", "description": "Kidney health assessment", "preparation": "No special preparation", "price": "Call for price", "report_time": "Same day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Thyroid Profile (T3, T4, TSH)", "category": "lab_tests", "description": "Thyroid function assessment", "preparation": "No fasting required", "price": "Call for price", "report_time": "Next day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Urine Complete Examination", "category": "lab_tests", "description": "Complete urine analysis", "preparation": "Mid-stream clean catch sample", "price": "Call for price", "report_time": "Same day", "duration_minutes": 10, "active": True},
        {"id": str(uuid.uuid4()), "name": "Uric Acid", "category": "lab_tests", "description": "Uric acid level test", "preparation": "Fasting recommended", "price": "Call for price", "report_time": "Same day", "duration_minutes": 10, "active": True},
        {"id": str(uuid.uuid4()), "name": "Vitamin D Test", "category": "lab_tests", "description": "Vitamin D level measurement", "preparation": "No special preparation", "price": "Call for price", "report_time": "Next day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Vitamin B12 Test", "category": "lab_tests", "description": "Vitamin B12 level check", "preparation": "Fasting for 6-8 hours", "price": "Call for price", "report_time": "Next day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Iron Studies", "category": "lab_tests", "description": "Iron and ferritin levels", "preparation": "Morning sample preferred", "price": "Call for price", "report_time": "Next day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "ESR (Erythrocyte Sedimentation Rate)", "category": "lab_tests", "description": "Inflammation marker", "preparation": "No special preparation", "price": "Call for price", "report_time": "Same day", "duration_minutes": 60, "active": True},
        {"id": str(uuid.uuid4()), "name": "CRP (C-Reactive Protein)", "category": "lab_tests", "description": "Inflammation and infection marker", "preparation": "No special preparation", "price": "Call for price", "report_time": "Same day", "duration_minutes": 15, "active": True},
        # Imaging
        {"id": str(uuid.uuid4()), "name": "Chest X-Ray", "category": "imaging", "description": "X-ray imaging of chest", "preparation": "Remove metal objects", "price": "Call for price", "report_time": "Same day", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "X-Ray (Any Part)", "category": "imaging", "description": "X-ray imaging of specified body part", "preparation": "Remove metal objects from area", "price": "Call for price", "report_time": "Same day", "duration_minutes": 20, "active": True},
        {"id": str(uuid.uuid4()), "name": "Ultrasound Abdomen", "category": "imaging", "description": "Abdominal ultrasound scan", "preparation": "Fasting for 6 hours, full bladder", "price": "Call for price", "report_time": "Same day", "duration_minutes": 30, "active": True},
        {"id": str(uuid.uuid4()), "name": "Ultrasound Pelvis", "category": "imaging", "description": "Pelvic ultrasound examination", "preparation": "Full bladder required", "price": "Call for price", "report_time": "Same day", "duration_minutes": 30, "active": True},
        {"id": str(uuid.uuid4()), "name": "Ultrasound KUB", "category": "imaging", "description": "Kidney, ureter, bladder ultrasound", "preparation": "Full bladder required", "price": "Call for price", "report_time": "Same day", "duration_minutes": 30, "active": True},
        {"id": str(uuid.uuid4()), "name": "Echocardiogram (Echo)", "category": "imaging", "description": "Heart ultrasound", "preparation": "No special preparation", "price": "Call for price", "report_time": "Same day", "duration_minutes": 45, "active": True},
        # Cardiology Tests
        {"id": str(uuid.uuid4()), "name": "ECG (Electrocardiogram)", "category": "cardiology", "description": "Heart rhythm recording", "preparation": "Relax before test", "price": "Call for price", "report_time": "Immediate", "duration_minutes": 15, "active": True},
        {"id": str(uuid.uuid4()), "name": "Treadmill Test (TMT/ETT)", "category": "cardiology", "description": "Exercise stress test", "preparation": "Light meal 2 hours before, wear comfortable clothes", "price": "Call for price", "report_time": "Same day", "duration_minutes": 60, "active": True},
        {"id": str(uuid.uuid4()), "name": "Holter Monitoring (24-hour ECG)", "category": "cardiology", "description": "24-hour heart rhythm monitoring", "preparation": "Wear loose clothing", "price": "Call for price", "report_time": "Next day", "duration_minutes": 30, "active": True},
        {"id": str(uuid.uuid4()), "name": "Cardiac Risk Profile", "category": "cardiology", "description": "Comprehensive heart health assessment", "preparation": "12 hours fasting", "price": "Call for price", "report_time": "Next day", "duration_minutes": 20, "active": True},
    ]
    await diagnostic_tests_collection.insert_many(diagnostic_tests_data)
    
    # Seed blog posts
    blog_posts_data = [
        {
            "id": str(uuid.uuid4()), "title": "Understanding Heart Health: Tips for a Healthy Heart",
            "slug": "understanding-heart-health-tips",
            "content": """<p>Heart disease remains one of the leading causes of death worldwide. However, many risk factors are within our control. Here are some essential tips for maintaining a healthy heart:</p>
<h2>1. Eat a Heart-Healthy Diet</h2>
<p>Focus on fruits, vegetables, whole grains, and lean proteins. Limit saturated fats, trans fats, and sodium intake.</p>
<h2>2. Exercise Regularly</h2>
<p>Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly.</p>
<h2>3. Maintain a Healthy Weight</h2>
<p>Being overweight increases the risk of heart disease. Work with your doctor to achieve and maintain a healthy weight.</p>
<h2>4. Don't Smoke</h2>
<p>Smoking is one of the top risk factors for heart disease. Seek help to quit if you smoke.</p>
<h2>5. Get Regular Check-ups</h2>
<p>Regular health screenings can help detect problems early when they're most treatable.</p>""",
            "excerpt": "Learn essential tips for maintaining a healthy heart and reducing your risk of heart disease.",
            "category": "Heart Health", "tags": ["cardiology", "prevention", "lifestyle"],
            "author": "Dr. Ahmed Khan", "published": True, "views": 156
        },
        {
            "id": str(uuid.uuid4()), "title": "Common Eye Problems and When to See a Specialist",
            "slug": "common-eye-problems-when-see-specialist",
            "content": """<p>Your eyes are precious, and recognizing when to seek professional help is crucial. Here are common eye problems that warrant a visit to an eye specialist:</p>
<h2>1. Blurred Vision</h2>
<p>Sudden or gradual blurring can indicate various conditions from simple refractive errors to more serious problems.</p>
<h2>2. Eye Pain</h2>
<p>Persistent pain should never be ignored as it could indicate infection, glaucoma, or other conditions.</p>
<h2>3. Floaters and Flashes</h2>
<p>While occasional floaters are normal, a sudden increase could indicate retinal detachment.</p>
<h2>4. Red Eyes</h2>
<p>Redness can be caused by allergies, infections, or more serious conditions.</p>
<h2>5. Double Vision</h2>
<p>This can indicate serious underlying conditions and requires immediate attention.</p>""",
            "excerpt": "Know when to visit an eye specialist for common eye problems and protect your vision.",
            "category": "Eye Care", "tags": ["ophthalmology", "vision", "eye health"],
            "author": "Dr. Muhammad Arif", "published": True, "views": 89
        },
        {
            "id": str(uuid.uuid4()), "title": "Neurological Warning Signs You Shouldn't Ignore",
            "slug": "neurological-warning-signs",
            "content": """<p>The nervous system controls everything we do. Recognizing warning signs early can make a significant difference. Here are signs that need attention:</p>
<h2>1. Persistent Headaches</h2>
<p>Headaches that are severe, sudden, or different from usual should be evaluated.</p>
<h2>2. Numbness or Tingling</h2>
<p>Persistent numbness, especially on one side of the body, needs immediate evaluation.</p>
<h2>3. Memory Problems</h2>
<p>Significant changes in memory or confusion could indicate various neurological conditions.</p>
<h2>4. Balance Issues</h2>
<p>Difficulty walking or maintaining balance requires neurological assessment.</p>
<h2>5. Vision Changes</h2>
<p>Sudden vision loss or double vision can be neurological in origin.</p>""",
            "excerpt": "Learn about neurological warning signs that require medical attention.",
            "category": "Neurology", "tags": ["neurology", "brain health", "warning signs"],
            "author": "Dr. Fatima Zahra", "published": True, "views": 124
        },
        {
            "id": str(uuid.uuid4()), "title": "Managing Asthma: A Complete Guide",
            "slug": "managing-asthma-complete-guide",
            "content": """<p>Asthma affects millions worldwide. With proper management, most people with asthma can lead active, healthy lives.</p>
<h2>Understanding Asthma</h2>
<p>Asthma is a chronic condition affecting the airways. It causes inflammation and narrowing of the bronchial tubes.</p>
<h2>Common Triggers</h2>
<ul><li>Allergens (dust, pollen, pet dander)</li><li>Air pollution</li><li>Respiratory infections</li><li>Exercise</li><li>Cold air</li></ul>
<h2>Management Strategies</h2>
<p><strong>1. Know Your Triggers:</strong> Identify and avoid your specific triggers.</p>
<p><strong>2. Use Medications Correctly:</strong> Follow your doctor's prescription for controller and rescue medications.</p>
<p><strong>3. Have an Action Plan:</strong> Work with your doctor to create an asthma action plan.</p>
<p><strong>4. Regular Check-ups:</strong> Monitor your condition with regular visits to your chest specialist.</p>""",
            "excerpt": "A comprehensive guide to understanding and managing asthma effectively.",
            "category": "Respiratory Health", "tags": ["asthma", "chest", "breathing"],
            "author": "Dr. Ayesha Malik", "published": True, "views": 203
        },
        {
            "id": str(uuid.uuid4()), "title": "The Importance of Regular Health Check-ups",
            "slug": "importance-regular-health-checkups",
            "content": """<p>Prevention is better than cure. Regular health check-ups can detect problems before they become serious.</p>
<h2>What to Expect</h2>
<p>A comprehensive health check-up typically includes physical examination, blood tests, and screenings appropriate for your age and risk factors.</p>
<h2>Recommended Screenings by Age</h2>
<h3>Adults (18-39)</h3>
<ul><li>Blood pressure check annually</li><li>Cholesterol screening every 5 years</li><li>Diabetes screening if at risk</li></ul>
<h3>Adults (40-64)</h3>
<ul><li>All above plus</li><li>Cancer screenings as recommended</li><li>Eye exams</li><li>Heart health assessment</li></ul>
<h3>Seniors (65+)</h3>
<ul><li>All above plus</li><li>Bone density test</li><li>Cognitive screening</li></ul>
<h2>Benefits of Regular Check-ups</h2>
<ul><li>Early detection of diseases</li><li>Reduced healthcare costs</li><li>Better management of chronic conditions</li><li>Peace of mind</li></ul>""",
            "excerpt": "Understand why regular health check-ups are essential for maintaining good health.",
            "category": "General Health", "tags": ["prevention", "checkup", "wellness"],
            "author": "Dr. Zainab Hussain", "published": True, "views": 178
        },
    ]
    await blog_posts_collection.insert_many(blog_posts_data)
    
    # Seed admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "password_hash": get_password_hash("admin123"),
        "role": "admin",
        "name": "Administrator",
        "created_at": datetime.utcnow()
    }
    await users_collection.insert_one(admin_user)
    
    # Seed site settings
    site_settings = {
        "id": "site_settings",
        "hospital_name": "Sadiqabad Medical Complex",
        "tagline": "Your Health, Our Priority",
        "phone": "+92-300-1234567",
        "whatsapp": "+92-300-1234567",
        "email": "info@sadiqabadmedical.com",
        "address": "Main Hospital Road, Sadiqabad, Punjab, Pakistan",
        "working_hours": "Mon-Sat: 8:00 AM - 10:00 PM, Sun: 9:00 AM - 5:00 PM",
        "emergency_hours": "24/7 Emergency Services",
        "google_maps_embed": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3467.0!2d70.1!3d28.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSadiqabad!5e0!3m2!1sen!2s!4v1234567890",
        "about_text": "Sadiqabad Medical Complex is a leading healthcare facility providing comprehensive medical services to the community. Our state-of-the-art facility combines modern medical technology with compassionate care.",
        "mission_text": "To provide accessible, high-quality healthcare services to our community with compassion, integrity, and excellence.",
        "adsense_enabled": False
    }
    await settings_collection.insert_one(site_settings)
    
    print("Initial data seeded successfully!")

# ==================== Health Check ====================
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Sadiqabad Medical Complex API"}

# ==================== Authentication ====================
@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    user = await users_collection.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({
        "sub": user["id"],
        "username": user["username"],
        "role": user["role"],
        "name": user["name"]
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "name": user["name"]
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post("/api/auth/register")
async def register_user(user_data: UserCreate, current_user: dict = Depends(require_admin)):
    existing = await users_collection.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = {
        "id": str(uuid.uuid4()),
        "username": user_data.username,
        "password_hash": get_password_hash(user_data.password),
        "role": user_data.role,
        "name": user_data.name,
        "created_at": datetime.utcnow()
    }
    await users_collection.insert_one(user)
    return {"message": "User created successfully", "id": user["id"]}

# ==================== Site Settings ====================
@app.get("/api/settings")
async def get_settings():
    settings = await settings_collection.find_one({"id": "site_settings"})
    if settings:
        settings.pop("_id", None)
    return settings or {}

@app.put("/api/settings")
async def update_settings(settings: dict, current_user: dict = Depends(require_admin)):
    settings["id"] = "site_settings"
    await settings_collection.replace_one(
        {"id": "site_settings"},
        settings,
        upsert=True
    )
    return {"message": "Settings updated successfully"}

# ==================== Specialties ====================
@app.get("/api/specialties")
async def get_specialties(active_only: bool = True):
    query = {"active": True} if active_only else {}
    specialties = await specialties_collection.find(query).to_list(100)
    for s in specialties:
        s.pop("_id", None)
    return specialties

@app.get("/api/specialties/{specialty_id}")
async def get_specialty(specialty_id: str):
    specialty = await specialties_collection.find_one({"id": specialty_id})
    if not specialty:
        raise HTTPException(status_code=404, detail="Specialty not found")
    specialty.pop("_id", None)
    return specialty

@app.post("/api/specialties")
async def create_specialty(specialty: SpecialtyCreate, current_user: dict = Depends(require_admin)):
    data = {
        "id": str(uuid.uuid4()),
        "name": specialty.name,
        "description": specialty.description,
        "icon": specialty.icon,
        "active": True,
        "created_at": datetime.utcnow()
    }
    await specialties_collection.insert_one(data)
    return {"message": "Specialty created", "id": data["id"]}

@app.put("/api/specialties/{specialty_id}")
async def update_specialty(specialty_id: str, specialty: SpecialtyCreate, current_user: dict = Depends(require_admin)):
    result = await specialties_collection.update_one(
        {"id": specialty_id},
        {"$set": {"name": specialty.name, "description": specialty.description, "icon": specialty.icon}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return {"message": "Specialty updated"}

@app.delete("/api/specialties/{specialty_id}")
async def delete_specialty(specialty_id: str, current_user: dict = Depends(require_admin)):
    result = await specialties_collection.update_one(
        {"id": specialty_id},
        {"$set": {"active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return {"message": "Specialty deactivated"}

# ==================== Doctors ====================
@app.get("/api/doctors")
async def get_doctors(
    specialty_id: Optional[str] = None,
    active_only: bool = True,
    search: Optional[str] = None
):
    query = {}
    if active_only:
        query["active"] = True
    if specialty_id:
        query["specialty_id"] = specialty_id
    
    doctors = await doctors_collection.find(query).to_list(100)
    
    # Get specialties for mapping
    specialties = await specialties_collection.find().to_list(100)
    specialty_map = {s["id"]: s for s in specialties}
    
    result = []
    for doc in doctors:
        doc.pop("_id", None)
        doc["specialty"] = specialty_map.get(doc.get("specialty_id"), {})
        if search:
            search_lower = search.lower()
            if search_lower in doc["name"].lower() or search_lower in doc.get("specialty", {}).get("name", "").lower():
                result.append(doc)
        else:
            result.append(doc)
    
    return result

@app.get("/api/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    doctor = await doctors_collection.find_one({"id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.pop("_id", None)
    
    # Get specialty
    specialty = await specialties_collection.find_one({"id": doctor.get("specialty_id")})
    if specialty:
        specialty.pop("_id", None)
        doctor["specialty"] = specialty
    
    # Get schedules
    schedules = await schedules_collection.find({"doctor_id": doctor_id, "active": True}).to_list(100)
    for s in schedules:
        s.pop("_id", None)
    doctor["schedules"] = schedules
    
    return doctor

@app.post("/api/doctors")
async def create_doctor(doctor: DoctorCreate, current_user: dict = Depends(require_admin)):
    data = doctor.dict()
    data["id"] = str(uuid.uuid4())
    data["active"] = True
    data["created_at"] = datetime.utcnow()
    await doctors_collection.insert_one(data)
    return {"message": "Doctor created", "id": data["id"]}

@app.put("/api/doctors/{doctor_id}")
async def update_doctor(doctor_id: str, doctor: DoctorCreate, current_user: dict = Depends(require_admin)):
    data = doctor.dict()
    result = await doctors_collection.update_one(
        {"id": doctor_id},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": "Doctor updated"}

@app.delete("/api/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str, current_user: dict = Depends(require_admin)):
    result = await doctors_collection.update_one(
        {"id": doctor_id},
        {"$set": {"active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": "Doctor deactivated"}

# ==================== Doctor Schedules ====================
@app.get("/api/schedules")
async def get_schedules(doctor_id: Optional[str] = None):
    query = {"active": True}
    if doctor_id:
        query["doctor_id"] = doctor_id
    schedules = await schedules_collection.find(query).to_list(500)
    for s in schedules:
        s.pop("_id", None)
    return schedules

@app.post("/api/schedules")
async def create_schedule(schedule: DoctorScheduleCreate, current_user: dict = Depends(require_admin)):
    data = schedule.dict()
    data["id"] = str(uuid.uuid4())
    await schedules_collection.insert_one(data)
    return {"message": "Schedule created", "id": data["id"]}

@app.put("/api/schedules/{schedule_id}")
async def update_schedule(schedule_id: str, schedule: DoctorScheduleCreate, current_user: dict = Depends(require_admin)):
    result = await schedules_collection.update_one(
        {"id": schedule_id},
        {"$set": schedule.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule updated"}

@app.delete("/api/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str, current_user: dict = Depends(require_admin)):
    result = await schedules_collection.delete_one({"id": schedule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule deleted"}

# ==================== Schedule Exceptions ====================
@app.get("/api/schedule-exceptions")
async def get_schedule_exceptions(doctor_id: Optional[str] = None):
    query = {}
    if doctor_id:
        query["doctor_id"] = doctor_id
    exceptions = await schedule_exceptions_collection.find(query).to_list(500)
    for e in exceptions:
        e.pop("_id", None)
    return exceptions

@app.post("/api/schedule-exceptions")
async def create_schedule_exception(exception: ScheduleExceptionCreate, current_user: dict = Depends(require_admin)):
    data = exception.dict()
    data["id"] = str(uuid.uuid4())
    await schedule_exceptions_collection.insert_one(data)
    return {"message": "Exception created", "id": data["id"]}

@app.delete("/api/schedule-exceptions/{exception_id}")
async def delete_schedule_exception(exception_id: str, current_user: dict = Depends(require_admin)):
    result = await schedule_exceptions_collection.delete_one({"id": exception_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exception not found")
    return {"message": "Exception deleted"}

# ==================== Available Slots ====================
@app.get("/api/available-slots/{doctor_id}")
async def get_available_slots(doctor_id: str, date: str):
    """Get available slots for a doctor on a specific date"""
    # Parse the date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    day_of_week = target_date.weekday()
    
    # Check for exceptions
    exception = await schedule_exceptions_collection.find_one({
        "doctor_id": doctor_id,
        "date": date
    })
    
    if exception and not exception.get("is_available", False):
        return {"slots": [], "message": "Doctor not available on this date"}
    
    # Get schedule for this day
    schedule = await schedules_collection.find_one({
        "doctor_id": doctor_id,
        "day_of_week": day_of_week,
        "active": True
    })
    
    if not schedule:
        return {"slots": [], "message": "No schedule for this day"}
    
    # Use custom times if exception has them
    start_time = exception.get("custom_start_time") if exception else None
    end_time = exception.get("custom_end_time") if exception else None
    start_time = start_time or schedule["start_time"]
    end_time = end_time or schedule["end_time"]
    slot_minutes = schedule.get("slot_minutes", 15)
    
    # Generate slots
    slots = []
    start = datetime.strptime(f"{date} {start_time}", "%Y-%m-%d %H:%M")
    end = datetime.strptime(f"{date} {end_time}", "%Y-%m-%d %H:%M")
    
    current = start
    while current < end:
        slot_time = current.strftime("%Y-%m-%d %H:%M")
        slots.append({
            "time": current.strftime("%H:%M"),
            "datetime": slot_time
        })
        current += timedelta(minutes=slot_minutes)
    
    # Get existing appointments
    existing = await appointments_collection.find({
        "doctor_id": doctor_id,
        "date_time": {"$regex": f"^{date}"},
        "status": {"$in": ["new", "confirmed"]}
    }).to_list(100)
    
    booked_times = {apt["date_time"] for apt in existing}
    
    # Filter out booked slots
    available_slots = [s for s in slots if s["datetime"] not in booked_times]
    
    return {"slots": available_slots, "date": date}

# ==================== Appointments ====================
@app.get("/api/appointments")
async def get_appointments(
    doctor_id: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if doctor_id:
        query["doctor_id"] = doctor_id
    if status:
        query["status"] = status
    if date:
        query["date_time"] = {"$regex": f"^{date}"}
    
    appointments = await appointments_collection.find(query).sort("date_time", -1).to_list(500)
    
    # Get doctors for mapping
    doctors = await doctors_collection.find().to_list(100)
    doctor_map = {d["id"]: d for d in doctors}
    
    for apt in appointments:
        apt.pop("_id", None)
        apt["doctor"] = doctor_map.get(apt.get("doctor_id"), {})
    
    return appointments

@app.get("/api/appointments/{appointment_id}")
async def get_appointment(appointment_id: str):
    apt = await appointments_collection.find_one({"id": appointment_id})
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    apt.pop("_id", None)
    
    doctor = await doctors_collection.find_one({"id": apt.get("doctor_id")})
    if doctor:
        doctor.pop("_id", None)
        apt["doctor"] = doctor
    
    return apt

@app.post("/api/appointments")
async def create_appointment(appointment: AppointmentCreate):
    # Check if slot is available
    existing = await appointments_collection.find_one({
        "doctor_id": appointment.doctor_id,
        "date_time": appointment.date_time,
        "status": {"$in": ["new", "confirmed"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="This slot is already booked")
    
    data = appointment.dict()
    data["id"] = str(uuid.uuid4())
    data["reference_number"] = f"APT-{uuid.uuid4().hex[:8].upper()}"
    data["status"] = "new"
    data["created_at"] = datetime.utcnow()
    
    await appointments_collection.insert_one(data)
    
    # Get doctor info for confirmation
    doctor = await doctors_collection.find_one({"id": appointment.doctor_id})
    doctor_name = doctor["name"] if doctor else "Doctor"
    
    # Send email if provided
    if appointment.patient_email:
        await send_booking_confirmation_email(
            to_email=appointment.patient_email,
            patient_name=appointment.patient_name,
            booking_type="appointment",
            reference_number=data["reference_number"],
            date_time=appointment.date_time,
            service_name=doctor_name
        )
    
    # Generate WhatsApp message
    whatsapp_message = get_whatsapp_message(
        patient_name=appointment.patient_name,
        booking_type="appointment",
        reference_number=data["reference_number"],
        date_time=appointment.date_time,
        service_name=doctor_name
    )
    
    return {
        "message": "Appointment booked successfully",
        "id": data["id"],
        "reference_number": data["reference_number"],
        "whatsapp_template": whatsapp_message
    }

@app.put("/api/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    allowed_fields = ["status", "notes", "date_time"]
    update = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    result = await appointments_collection.update_one(
        {"id": appointment_id},
        {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment updated"}

@app.delete("/api/appointments/{appointment_id}")
async def cancel_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    result = await appointments_collection.update_one(
        {"id": appointment_id},
        {"$set": {"status": "cancelled"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment cancelled"}

# ==================== Diagnostic Tests ====================
@app.get("/api/diagnostic-tests")
async def get_diagnostic_tests(
    category: Optional[str] = None,
    search: Optional[str] = None,
    active_only: bool = True
):
    query = {}
    if active_only:
        query["active"] = True
    if category:
        query["category"] = category
    
    tests = await diagnostic_tests_collection.find(query).to_list(500)
    
    result = []
    for test in tests:
        test.pop("_id", None)
        if search:
            if search.lower() in test["name"].lower():
                result.append(test)
        else:
            result.append(test)
    
    return result

@app.get("/api/diagnostic-tests/{test_id}")
async def get_diagnostic_test(test_id: str):
    test = await diagnostic_tests_collection.find_one({"id": test_id})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    test.pop("_id", None)
    return test

@app.post("/api/diagnostic-tests")
async def create_diagnostic_test(test: DiagnosticTestCreate, current_user: dict = Depends(require_admin)):
    data = test.dict()
    data["id"] = str(uuid.uuid4())
    data["active"] = True
    data["created_at"] = datetime.utcnow()
    await diagnostic_tests_collection.insert_one(data)
    return {"message": "Test created", "id": data["id"]}

@app.put("/api/diagnostic-tests/{test_id}")
async def update_diagnostic_test(test_id: str, test: DiagnosticTestCreate, current_user: dict = Depends(require_admin)):
    result = await diagnostic_tests_collection.update_one(
        {"id": test_id},
        {"$set": test.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test updated"}

@app.delete("/api/diagnostic-tests/{test_id}")
async def delete_diagnostic_test(test_id: str, current_user: dict = Depends(require_admin)):
    result = await diagnostic_tests_collection.update_one(
        {"id": test_id},
        {"$set": {"active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test deactivated"}

# ==================== Diagnostic Bookings ====================
@app.get("/api/diagnostic-bookings")
async def get_diagnostic_bookings(
    test_id: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if test_id:
        query["test_id"] = test_id
    if status:
        query["status"] = status
    if date:
        query["date_time"] = {"$regex": f"^{date}"}
    
    bookings = await diagnostic_bookings_collection.find(query).sort("date_time", -1).to_list(500)
    
    # Get tests for mapping
    tests = await diagnostic_tests_collection.find().to_list(500)
    test_map = {t["id"]: t for t in tests}
    
    for booking in bookings:
        booking.pop("_id", None)
        booking["test"] = test_map.get(booking.get("test_id"), {})
    
    return bookings

@app.post("/api/diagnostic-bookings")
async def create_diagnostic_booking(booking: DiagnosticBookingCreate):
    data = booking.dict()
    data["id"] = str(uuid.uuid4())
    data["reference_number"] = f"DGN-{uuid.uuid4().hex[:8].upper()}"
    data["status"] = "new"
    data["created_at"] = datetime.utcnow()
    
    await diagnostic_bookings_collection.insert_one(data)
    
    # Get test info
    test = await diagnostic_tests_collection.find_one({"id": booking.test_id})
    test_name = test["name"] if test else "Test"
    
    # Prepare additional info
    additional = ""
    if test and test.get("preparation"):
        additional = f"\nPreparation: {test['preparation']}"
    
    # Send email if provided
    if booking.patient_email:
        await send_booking_confirmation_email(
            to_email=booking.patient_email,
            patient_name=booking.patient_name,
            booking_type="diagnostic",
            reference_number=data["reference_number"],
            date_time=booking.date_time,
            service_name=test_name,
            additional_info=additional
        )
    
    # Generate WhatsApp message
    whatsapp_message = get_whatsapp_message(
        patient_name=booking.patient_name,
        booking_type="diagnostic",
        reference_number=data["reference_number"],
        date_time=booking.date_time,
        service_name=test_name
    )
    
    return {
        "message": "Test booking successful",
        "id": data["id"],
        "reference_number": data["reference_number"],
        "whatsapp_template": whatsapp_message,
        "preparation": test.get("preparation") if test else None
    }

@app.put("/api/diagnostic-bookings/{booking_id}")
async def update_diagnostic_booking(booking_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    allowed_fields = ["status", "notes", "date_time"]
    update = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    result = await diagnostic_bookings_collection.update_one(
        {"id": booking_id},
        {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking updated"}

# ==================== Blog Posts ====================
@app.get("/api/blog")
async def get_blog_posts(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    published_only: bool = True,
    limit: int = 10
):
    query = {}
    if published_only:
        query["published"] = True
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    
    posts = await blog_posts_collection.find(query).sort("published_at", -1).limit(limit).to_list(limit)
    for post in posts:
        post.pop("_id", None)
    return posts

@app.get("/api/blog/categories")
async def get_blog_categories():
    posts = await blog_posts_collection.find({"published": True}).to_list(500)
    categories = list(set(p.get("category") for p in posts if p.get("category")))
    return categories

@app.get("/api/blog/{slug}")
async def get_blog_post(slug: str):
    post = await blog_posts_collection.find_one({"slug": slug})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment views
    await blog_posts_collection.update_one(
        {"slug": slug},
        {"$inc": {"views": 1}}
    )
    
    post.pop("_id", None)
    return post

@app.post("/api/blog")
async def create_blog_post(post: BlogPostCreate, current_user: dict = Depends(require_admin)):
    # Check slug uniqueness
    existing = await blog_posts_collection.find_one({"slug": post.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    data = post.dict()
    data["id"] = str(uuid.uuid4())
    data["views"] = 0
    data["published_at"] = datetime.utcnow()
    data["created_at"] = datetime.utcnow()
    
    await blog_posts_collection.insert_one(data)
    return {"message": "Post created", "id": data["id"]}

@app.put("/api/blog/{post_id}")
async def update_blog_post(post_id: str, post: BlogPostCreate, current_user: dict = Depends(require_admin)):
    result = await blog_posts_collection.update_one(
        {"id": post_id},
        {"$set": post.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post updated"}

@app.delete("/api/blog/{post_id}")
async def delete_blog_post(post_id: str, current_user: dict = Depends(require_admin)):
    result = await blog_posts_collection.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted"}

# ==================== Contact Messages ====================
@app.get("/api/contact-messages")
async def get_contact_messages(current_user: dict = Depends(get_current_user)):
    messages = await contact_messages_collection.find().sort("created_at", -1).to_list(500)
    for msg in messages:
        msg.pop("_id", None)
    return messages

@app.post("/api/contact")
async def submit_contact(name: str, email: str, subject: str, message: str, phone: Optional[str] = None):
    data = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "phone": phone,
        "subject": subject,
        "message": message,
        "read": False,
        "created_at": datetime.utcnow()
    }
    await contact_messages_collection.insert_one(data)
    return {"message": "Message sent successfully"}

@app.put("/api/contact-messages/{message_id}/read")
async def mark_message_read(message_id: str, current_user: dict = Depends(get_current_user)):
    result = await contact_messages_collection.update_one(
        {"id": message_id},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Marked as read"}

# ==================== Analytics ====================
@app.get("/api/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Counts
    total_doctors = await doctors_collection.count_documents({"active": True})
    total_tests = await diagnostic_tests_collection.count_documents({"active": True})
    
    # Today's appointments
    today_appointments = await appointments_collection.count_documents({
        "date_time": {"$regex": f"^{today}"}
    })
    
    # Today's diagnostic bookings
    today_diagnostics = await diagnostic_bookings_collection.count_documents({
        "date_time": {"$regex": f"^{today}"}
    })
    
    # Appointment status breakdown
    appointment_stats = {}
    for status in ["new", "confirmed", "completed", "cancelled", "no_show"]:
        appointment_stats[status] = await appointments_collection.count_documents({"status": status})
    
    # Recent appointments
    recent_appointments = await appointments_collection.find().sort("created_at", -1).limit(5).to_list(5)
    for apt in recent_appointments:
        apt.pop("_id", None)
    
    # Unread messages
    unread_messages = await contact_messages_collection.count_documents({"read": False})
    
    return {
        "total_doctors": total_doctors,
        "total_tests": total_tests,
        "today_appointments": today_appointments,
        "today_diagnostics": today_diagnostics,
        "appointment_stats": appointment_stats,
        "recent_appointments": recent_appointments,
        "unread_messages": unread_messages
    }

@app.get("/api/analytics/bookings")
async def get_bookings_analytics(
    days: int = 7,
    current_user: dict = Depends(get_current_user)
):
    """Get booking trends for the past N days"""
    result = []
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        apt_count = await appointments_collection.count_documents({
            "date_time": {"$regex": f"^{date}"}
        })
        dgn_count = await diagnostic_bookings_collection.count_documents({
            "date_time": {"$regex": f"^{date}"}
        })
        result.append({
            "date": date,
            "appointments": apt_count,
            "diagnostics": dgn_count
        })
    
    return result[::-1]  # Reverse to get chronological order

# ==================== Export ====================
@app.get("/api/export/appointments")
async def export_appointments(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Export appointments as CSV-ready data"""
    query = {}
    if start_date:
        query["date_time"] = {"$gte": start_date}
    if end_date:
        if "date_time" in query:
            query["date_time"]["$lte"] = end_date + "T23:59:59"
        else:
            query["date_time"] = {"$lte": end_date + "T23:59:59"}
    
    appointments = await appointments_collection.find(query).sort("date_time", -1).to_list(5000)
    
    # Get doctors
    doctors = await doctors_collection.find().to_list(100)
    doctor_map = {d["id"]: d["name"] for d in doctors}
    
    export_data = []
    for apt in appointments:
        export_data.append({
            "Reference": apt.get("reference_number"),
            "Doctor": doctor_map.get(apt.get("doctor_id"), "Unknown"),
            "Patient Name": apt.get("patient_name"),
            "Phone": apt.get("patient_phone"),
            "Email": apt.get("patient_email", ""),
            "Date/Time": apt.get("date_time"),
            "Status": apt.get("status"),
            "Notes": apt.get("notes", "")
        })
    
    return export_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
