from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app import mongo
from app.utils.helpers import save_upload, allowed_file, get_cloudinary_public_id, delete_from_cloudinary
from datetime import datetime, timezone

media_bp = Blueprint("media", __name__)

@media_bp.route("", methods=["GET"])
@jwt_required()
def list_media():
    """List all uploaded media files from MongoDB tracking collection."""
    uploads = mongo.db.media_uploads.find().sort("created_at", -1)
    return jsonify([
        {
            "name": u["name"],
            "public_id": u["public_id"],
            "size": u["size"],
            "url": u["url"],
        }
        for u in uploads
    ]), 200


@media_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_media():
    """Upload a new media file to Cloudinary."""
    if "file" not in request.files:
        return jsonify(error="No file provided"), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify(error="No file selected"), 400

    if not allowed_file(file.filename):
        return jsonify(error="File type not allowed"), 400

    url = save_upload(file)
    if not url:
        return jsonify(error="Upload failed"), 500

    public_id = get_cloudinary_public_id(url)

    mongo.db.media_uploads.insert_one({
        "name": file.filename,
        "public_id": public_id,
        "url": url,
        "size": request.content_length or 0,
        "created_at": datetime.now(timezone.utc),
    })

    return jsonify({
        "success": True,
        "public_id": public_id,
        "url": url,
    }), 201


@media_bp.route("/<path:public_id>", methods=["DELETE"])
@jwt_required()
def delete_media(public_id):
    """Delete a media file from Cloudinary and tracking collection."""
    # Delete from Cloudinary
    deleted = delete_from_cloudinary(public_id)

    # Remove tracking doc
    mongo.db.media_uploads.delete_one({"public_id": public_id})

    if deleted:
        return jsonify(message="Deleted"), 200

    # If Cloudinary delete failed, the doc might not exist — still OK
    return jsonify(message="Deleted from database"), 200
