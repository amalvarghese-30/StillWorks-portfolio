# STILLWORKS-BACKEND/app/routes/contact.py
from flask import Blueprint, request, jsonify
import resend
import os

contact_bp = Blueprint("contact", __name__)

resend.api_key = os.getenv("RESEND_API_KEY")
CONTACT_RECEIVER_EMAIL = os.getenv("CONTACT_RECEIVER_EMAIL", "info@stillworks.in")


@contact_bp.route("", methods=["POST"])
def send_contact_email():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify(error="Missing fields"), 400

    try:
        resend.Emails.send({
            "from": "Stillworks <info@stillworks.in>",
            "to": [CONTACT_RECEIVER_EMAIL],
            "reply_to": email,
            "subject": f"New message from {name}",
            "html": f"""
                <strong>Name:</strong> {name}<br/>
                <strong>Email:</strong> {email}<br/><br/>
                <strong>Message:</strong><br/>
                {message}
            """
        })

        return jsonify(success=True)

    except Exception as e:
        return jsonify(error=str(e)), 500