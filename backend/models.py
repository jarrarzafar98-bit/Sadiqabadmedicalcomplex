from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum
import uuid

def generate_uuid():
    return str(uuid.uuid4())

# Enums
class AppointmentStatus(str, Enum):
    NEW = "new"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class UserRole(str, Enum):
    ADMIN = "admin"
    RECEPTION = "reception"

# User Models
class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.RECEPTION
    name: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    username: str
    password_hash: str
    role: UserRole
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Specialty Model
class SpecialtyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class Specialty(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Doctor Models
class DoctorCreate(BaseModel):
    name: str
    specialty_id: str
    qualifications: str
    bio: Optional[str] = None
    photo: Optional[str] = None
    fee: Optional[str] = "Call for price"
    tags: List[str] = []
    gender: Optional[Gender] = None
    languages: List[str] = ["Urdu", "English"]
    experience_years: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class Doctor(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    name: str
    specialty_id: str
    qualifications: str
    bio: Optional[str] = None
    photo: Optional[str] = None
    fee: str = "Call for price"
    tags: List[str] = []
    gender: Optional[Gender] = None
    languages: List[str] = ["Urdu", "English"]
    experience_years: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Doctor Schedule Models
class DoctorScheduleCreate(BaseModel):
    doctor_id: str
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: str  # "09:00"
    end_time: str    # "17:00"
    slot_minutes: int = 15
    active: bool = True

class DoctorSchedule(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    doctor_id: str
    day_of_week: int
    start_time: str
    end_time: str
    slot_minutes: int = 15
    active: bool = True

# Schedule Exceptions (leave days, special hours)
class ScheduleExceptionCreate(BaseModel):
    doctor_id: str
    date: str  # "2025-01-15"
    is_available: bool = False
    notes: Optional[str] = None
    custom_start_time: Optional[str] = None
    custom_end_time: Optional[str] = None

class ScheduleException(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    doctor_id: str
    date: str
    is_available: bool = False
    notes: Optional[str] = None
    custom_start_time: Optional[str] = None
    custom_end_time: Optional[str] = None

# Appointment Models
class AppointmentCreate(BaseModel):
    doctor_id: str
    date_time: str  # ISO format
    patient_name: str
    patient_phone: str
    patient_email: Optional[str] = None
    patient_gender: Optional[Gender] = None
    patient_dob: Optional[str] = None
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    reference_number: str = Field(default_factory=lambda: f"APT-{uuid.uuid4().hex[:8].upper()}")
    doctor_id: str
    date_time: str
    patient_name: str
    patient_phone: str
    patient_email: Optional[str] = None
    patient_gender: Optional[Gender] = None
    patient_dob: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.NEW
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Diagnostic Test Models
class DiagnosticCategory(str, Enum):
    LAB_TESTS = "lab_tests"
    IMAGING = "imaging"
    CARDIOLOGY = "cardiology"
    OTHER = "other"

class DiagnosticTestCreate(BaseModel):
    name: str
    category: DiagnosticCategory
    description: Optional[str] = None
    preparation: Optional[str] = None
    price: str = "Call for price"
    report_time: Optional[str] = None
    duration_minutes: Optional[int] = None

class DiagnosticTest(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    name: str
    category: DiagnosticCategory
    description: Optional[str] = None
    preparation: Optional[str] = None
    price: str = "Call for price"
    report_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Diagnostic Booking Models
class DiagnosticBookingCreate(BaseModel):
    test_id: str
    date_time: str
    patient_name: str
    patient_phone: str
    patient_email: Optional[str] = None
    patient_gender: Optional[Gender] = None
    patient_dob: Optional[str] = None
    notes: Optional[str] = None

class DiagnosticBooking(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    reference_number: str = Field(default_factory=lambda: f"DGN-{uuid.uuid4().hex[:8].upper()}")
    test_id: str
    date_time: str
    patient_name: str
    patient_phone: str
    patient_email: Optional[str] = None
    patient_gender: Optional[Gender] = None
    patient_dob: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.NEW
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Blog Models
class BlogPostCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    category: str
    tags: List[str] = []
    author: str = "Admin"
    featured_image: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    published: bool = True

class BlogPost(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    category: str
    tags: List[str] = []
    author: str = "Admin"
    featured_image: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    published: bool = True
    views: int = 0
    published_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Contact Form
class ContactMessage(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Site Settings
class SiteSettings(BaseModel):
    id: str = "site_settings"
    hospital_name: str = "Sadiqabad Medical Complex"
    tagline: str = "Your Health, Our Priority"
    phone: str = "+92-300-1234567"
    whatsapp: str = "+92-300-1234567"
    email: str = "info@sadiqabadmedical.com"
    address: str = "Main Hospital Road, Sadiqabad, Punjab, Pakistan"
    working_hours: str = "Mon-Sat: 8:00 AM - 10:00 PM, Sun: 9:00 AM - 5:00 PM"
    emergency_hours: str = "24/7 Emergency Services"
    google_maps_embed: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    instagram_url: Optional[str] = None
    about_text: Optional[str] = None
    mission_text: Optional[str] = None
    adsense_enabled: bool = False
    adsense_client_id: Optional[str] = None
