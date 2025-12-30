from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = "sadiqabad_medical"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
specialties_collection = db["specialties"]
doctors_collection = db["doctors"]
schedules_collection = db["schedules"]
schedule_exceptions_collection = db["schedule_exceptions"]
appointments_collection = db["appointments"]
diagnostic_tests_collection = db["diagnostic_tests"]
diagnostic_bookings_collection = db["diagnostic_bookings"]
blog_posts_collection = db["blog_posts"]
contact_messages_collection = db["contact_messages"]
settings_collection = db["settings"]

async def init_db():
    """Initialize database with indexes"""
    # Create indexes
    await users_collection.create_index("username", unique=True)
    await doctors_collection.create_index("specialty_id")
    await schedules_collection.create_index("doctor_id")
    await appointments_collection.create_index([("doctor_id", 1), ("date_time", 1)])
    await appointments_collection.create_index("reference_number", unique=True)
    await diagnostic_bookings_collection.create_index("reference_number", unique=True)
    await blog_posts_collection.create_index("slug", unique=True)
    print("Database indexes created successfully")
