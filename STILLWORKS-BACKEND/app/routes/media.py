from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required
import os

media_bp = Blueprint("media", __name__)

@media_bp.route("", methods=["GET"])
@jwt_required()
def list_media():
    """List all uploaded media files."""
    folder = current_app.config["UPLOAD_FOLDER"]
    if not os.path.exists(folder):
        return jsonify([]), 200
    
    files = []
    for filename in os.listdir(folder):
        filepath = os.path.join(folder, filename)
        if os.path.isfile(filepath):
            files.append({
                "name": filename,
                "size": os.path.getsize(filepath),
                "url": f"/uploads/{filename}"
            })
    return jsonify(files), 200


@media_bp.route("/<filename>", methods=["DELETE"])
@jwt_required()
def delete_media(filename):
    """Delete a media file."""
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)

    if os.path.exists(path) and os.path.isfile(path):
        os.remove(path)
        return jsonify(message="Deleted"), 200

    return jsonify(error="File not found"), 404