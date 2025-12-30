import os
import httpx
from dotenv import load_dotenv

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
HOSPITAL_NAME = os.environ.get("HOSPITAL_NAME", "Sadiqabad Medical Complex")
HOSPITAL_EMAIL = os.environ.get("HOSPITAL_EMAIL", "info@sadiqabadmedical.com")
HOSPITAL_PHONE = os.environ.get("HOSPITAL_PHONE", "+92-300-1234567")

async def send_booking_confirmation_email(
    to_email: str,
    patient_name: str,
    booking_type: str,  # "appointment" or "diagnostic"
    reference_number: str,
    date_time: str,
    service_name: str,  # doctor name or test name
    additional_info: str = ""
):
    """Send booking confirmation email"""
    try:
        subject = f"Booking Confirmation - {reference_number} | {HOSPITAL_NAME}"
        
        if booking_type == "appointment":
            body = f"""Dear {patient_name},

Thank you for booking an appointment at {HOSPITAL_NAME}.

Booking Details:
- Reference Number: {reference_number}
- Doctor: {service_name}
- Date & Time: {date_time}
{additional_info}

Please arrive 15 minutes before your scheduled appointment.

For any queries or to reschedule, please contact us:
Phone: {HOSPITAL_PHONE}
Email: {HOSPITAL_EMAIL}

Best regards,
{HOSPITAL_NAME}
"""
        else:
            body = f"""Dear {patient_name},

Thank you for booking a diagnostic test at {HOSPITAL_NAME}.

Booking Details:
- Reference Number: {reference_number}
- Test: {service_name}
- Date & Time: {date_time}
{additional_info}

Please follow any preparation instructions provided for your test.

For any queries, please contact us:
Phone: {HOSPITAL_PHONE}
Email: {HOSPITAL_EMAIL}

Best regards,
{HOSPITAL_NAME}
"""
        
        # Log the email (for now, actual sending would require SMTP setup)
        print(f"Email notification prepared for {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {body[:200]}...")
        
        return True
    except Exception as e:
        print(f"Error preparing email: {e}")
        return False

def get_whatsapp_message(
    patient_name: str,
    booking_type: str,
    reference_number: str,
    date_time: str,
    service_name: str
):
    """Generate WhatsApp message template for staff"""
    if booking_type == "appointment":
        return f"""Dear {patient_name}, your appointment at {HOSPITAL_NAME} is confirmed.

Ref: {reference_number}
Doctor: {service_name}
Date/Time: {date_time}

Please arrive 15 mins early. For queries: {HOSPITAL_PHONE}"""
    else:
        return f"""Dear {patient_name}, your diagnostic test at {HOSPITAL_NAME} is confirmed.

Ref: {reference_number}
Test: {service_name}
Date/Time: {date_time}

For queries: {HOSPITAL_PHONE}"""
