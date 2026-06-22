import os
import re
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
import cloudinary
import cloudinary.uploader
import cloudinary.api

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text)

def save_upload(file, upload_folder: str = None) -> str:
    """Upload file to Cloudinary and return the secure URL."""
    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else "png"
    public_id = f"stillworks/{uuid.uuid4().hex[:12]}"

    result = cloudinary.uploader.upload(
        file,
        public_id=public_id,
        format=ext,
        folder="stillworks",
        resource_type="image",
        quality="auto:good",
        fetch_format="auto",
    )

    return result.get("secure_url", result.get("url", ""))

def get_cloudinary_public_id(url: str) -> str:
    """Extract Cloudinary public_id from a URL."""
    if not url or "cloudinary" not in url:
        return ""
    parts = url.split("/upload/")
    if len(parts) < 2:
        return ""
    path_parts = parts[1].split("/")
    # Remove version prefix if present (v1234567890)
    if path_parts[0].startswith("v"):
        path_parts = path_parts[1:]
    # Remove file extension
    filename = path_parts[-1]
    name_without_ext = ".".join(filename.split(".")[:-1]) if "." in filename else filename
    path_parts[-1] = name_without_ext
    return "/".join(path_parts)

def delete_from_cloudinary(public_id: str) -> bool:
    """Delete an image from Cloudinary by public_id. Returns True if successful."""
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="image")
        return result.get("result") == "ok"
    except Exception:
        return False

def serialize_doc(doc) -> dict:
    """Convert MongoDB document to JSON-safe dict."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    for key in ("created_at", "updated_at"):
        if key in doc and isinstance(doc[key], datetime):
            doc[key] = doc[key].isoformat()
    return doc
