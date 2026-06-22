from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required
from datetime import datetime, timezone

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("", methods=["GET"])
@jwt_required()
def get_settings():
    return jsonify(
        api_status="connected",
        version="1.0.0",
        project="Stillworks CMS",
        server_time=datetime.now(timezone.utc).isoformat(),
        storage_backend="cloudinary",
    ), 200
