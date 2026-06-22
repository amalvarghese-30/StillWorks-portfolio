from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
import os
from datetime import datetime, timezone

settings_bp = Blueprint("settings", __name__)

@settings_bp.route("", methods=["GET"])
@jwt_required()
def get_settings():
    """Get admin settings and system info."""
    return jsonify(
        api_status="connected",
        version="1.0.0",
        project="Stillworks CMS",
        server_time=datetime.now(timezone.utc).isoformat(),
        storage_backend="cloudinary",
        upload_folder=os.getenv("UPLOAD_FOLDER", "uploads"),
        max_upload_size=os.getenv("MAX_CONTENT_LENGTH", "16MB")
    ), 200