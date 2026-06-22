import html
import re
import os
from flask import Blueprint, request, jsonify
import resend

contact_bp = Blueprint("contact", __name__)

resend.api_key = os.getenv("RESEND_API_KEY")
CONTACT_RECEIVER_EMAIL = os.getenv("CONTACT_RECEIVER_EMAIL", "info@stillworks.in")

EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


@contact_bp.route("", methods=["POST"])
def send_contact_email():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Missing request body"), 400

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify(error="Name, email, and message are required"), 400

    if len(name) > 100 or len(email) > 254 or len(message) > 5000:
        return jsonify(error="Input exceeds maximum length"), 400

    if not EMAIL_RE.match(email):
        return jsonify(error="Invalid email address"), 400

    try:
        resend.Emails.send({
            "from": "Stillworks <info@stillworks.in>",
            "to": [CONTACT_RECEIVER_EMAIL],
            "reply_to": email,
            "subject": f"New message from {html.escape(name)}",
            "html": f"""
                <strong>Name:</strong> {html.escape(name)}<br/>
                <strong>Email:</strong> {html.escape(email)}<br/><br/>
                <strong>Message:</strong><br/>
                {html.escape(message)}
            """
        })
        return jsonify(success=True)
    except Exception:
        return jsonify(error="Failed to send message. Please try again later."), 500
