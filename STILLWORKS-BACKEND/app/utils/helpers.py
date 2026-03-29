import os
import re
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}
MAX_IMAGE_SIZE = (1920, 1920)


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text)


def save_upload(file, upload_folder: str) -> str:
    """Save uploaded file with unique name. Returns filename."""
    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else "png"
    unique_name = f"{uuid.uuid4().hex[:12]}.{ext}"
    filepath = os.path.join(upload_folder, unique_name)
    file.save(filepath)

    # Optimize raster images
    if ext in {"png", "jpg", "jpeg", "webp"}:
        try:
            img = Image.open(filepath)
            img.thumbnail(MAX_IMAGE_SIZE, Image.LANCZOS)
            img.save(filepath, quality=85, optimize=True)
        except Exception:
            pass

    return unique_name


def serialize_doc(doc) -> dict:
    """Convert MongoDB document to JSON-safe dict."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    for key in ("created_at", "updated_at"):
        if key in doc and isinstance(doc[key], datetime):
            doc[key] = doc[key].isoformat()
    return doc
