from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app import mongo
from app.utils.helpers import slugify, serialize_doc, save_upload, allowed_file
from datetime import datetime, timezone
from bson import ObjectId
import json

projects_bp = Blueprint("projects", __name__)


# ─── PUBLIC ───────────────────────────────────────────

@projects_bp.route("", methods=["GET"])
def list_projects():
    """Public: list visible projects with optional category filter."""
    query = {"visible": True}

    category = request.args.get("category")
    if category and category != "All":
        query["category"] = category

    featured_only = request.args.get("featured")
    if featured_only == "true":
        query["featured"] = True

    projects = mongo.db.projects.find(query).sort("order", 1)
    return jsonify([serialize_doc(p) for p in projects]), 200


@projects_bp.route("/<identifier>", methods=["GET"])
def get_project(identifier):
    """Public: single project by ID or slug."""
    from bson import ObjectId
    
    try:
        # Try as ObjectId first
        doc = mongo.db.projects.find_one({"_id": ObjectId(identifier)})
    except Exception:
        # If not a valid ObjectId, try as slug
        doc = mongo.db.projects.find_one({"slug": identifier})
    
    if not doc:
        return jsonify(error="Project not found"), 404
    return jsonify(serialize_doc(doc)), 200


# ─── ADMIN ────────────────────────────────────────────

@projects_bp.route("", methods=["POST"])
@jwt_required()
def create_project():
    form = request.form

    title = form.get("title", "").strip()
    description = form.get("description", "").strip()
    client = form.get("client", "").strip()
    year = form.get("year", "").strip()
    video_url = form.get("video_url", "").strip()
    category_id = form.get("category_id", "").strip()

    slug = slugify(title)

    # Resolve category safely
    category_name = "Uncategorized"

    if category_id:
        try:
            cat = mongo.db.categories.find_one({"_id": ObjectId(category_id)})
            if cat:
                category_name = cat["name"]
        except:
            pass

    # Handle cover image (file or URL)
    cover_image = ""

    if "cover_image_url" in form and form["cover_image_url"].strip():
        cover_image = form["cover_image_url"].strip()

    if "cover_image" in request.files:
        file = request.files["cover_image"]
        if file and allowed_file(file.filename):
            cover_image = save_upload(
                file,
                current_app.config["UPLOAD_FOLDER"]
            )

    # Parse sections if provided
    sections = []

    if "sections" in form:
        try:
            sections = json.loads(form["sections"])
        except:
            sections = []

    # Auto-sync description → hero.subtitle
    if sections and description:
        for section in sections:
            if section.get("type") == "hero":
                data = section.get("data", {})
                data["subtitle"] = description
                section["data"] = data

    project = {
        "title": title,
        "slug": slug,
        "category_id": category_id,
        "category": category_name,
        "description": description,
        "client": client,
        "year": year,
        "cover_image": cover_image,
        "sections": sections,
        "video_url": video_url,
        "featured": form.get("featured", "false").lower() == "true",
        "visible": form.get("visible", "true").lower() == "true",
        "order": int(form.get("order", 0)),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = mongo.db.projects.insert_one(project)

    project["_id"] = result.inserted_id

    return jsonify(serialize_doc(project)), 201
@projects_bp.route("/<project_id>", methods=["PUT"])
@jwt_required()
def update_project(project_id):
    update = {}
    form = request.form

    # Fetch existing project first
    existing_project = mongo.db.projects.find_one({"_id": ObjectId(project_id)})
    if not existing_project:
        return jsonify(error="Project not found"), 404

    # Basic editable fields
    for field in ("title", "description", "client", "year", "video_url", "category_id"):
        if field in form:
            update[field] = form[field].strip()

    # Regenerate slug if title changed
    if "title" in update:
        update["slug"] = slugify(update["title"])

    # Update category name if category_id provided
    if "category_id" in update:
        cat = mongo.db.categories.find_one({"_id": ObjectId(update["category_id"])})
        update["category"] = cat["name"] if cat else form.get("category", "Uncategorized")

    # Boolean flags
    for flag in ("featured", "visible"):
        if flag in form:
            update[flag] = form[flag].lower() == "true"

    # Order field
    if "order" in form:
        update["order"] = int(form["order"])

    # Cover image (URL OR uploaded file)
    if "cover_image_url" in form and form["cover_image_url"].strip():
        update["cover_image"] = form["cover_image_url"].strip()

    if "cover_image" in request.files:
        file = request.files["cover_image"]
        if file and allowed_file(file.filename):
            update["cover_image"] = save_upload(
                file,
                current_app.config["UPLOAD_FOLDER"]
            )

    # Sections handling
    sections = existing_project.get("sections", [])

    # If frontend sends sections, parse them
    if "sections" in form:
        try:
            sections = json.loads(form["sections"])
        except json.JSONDecodeError:
            pass

    # Always sync description → hero.subtitle
    description = form.get("description", existing_project.get("description", "")).strip()

    if sections and description:
        for section in sections:
            if section.get("type") == "hero":
                data = section.get("data", {})
                data["subtitle"] = description
                section["data"] = data

        update["sections"] = sections

    # Update timestamp
    update["updated_at"] = datetime.now(timezone.utc)

    # Save update
    result = mongo.db.projects.find_one_and_update(
        {"_id": ObjectId(project_id)},
        {"$set": update},
        return_document=True,
    )

    return jsonify(serialize_doc(result)), 200
@projects_bp.route("/<project_id>", methods=["DELETE"])
@jwt_required()
def delete_project(project_id):
    result = mongo.db.projects.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        return jsonify(error="Project not found"), 404
    return jsonify(message="Deleted"), 200


@projects_bp.route("/<project_id>/toggle-featured", methods=["PATCH"])
@jwt_required()
def toggle_featured(project_id):
    doc = mongo.db.projects.find_one({"_id": ObjectId(project_id)})
    if not doc:
        return jsonify(error="Project not found"), 404

    new_val = not doc.get("featured", False)
    mongo.db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"featured": new_val, "updated_at": datetime.now(timezone.utc)}}
    )
    return jsonify(featured=new_val), 200


@projects_bp.route("/<project_id>/toggle-visibility", methods=["PATCH"])
@jwt_required()
def toggle_visibility(project_id):
    doc = mongo.db.projects.find_one({"_id": ObjectId(project_id)})
    if not doc:
        return jsonify(error="Project not found"), 404

    new_val = not doc.get("visible", True)
    mongo.db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"visible": new_val, "updated_at": datetime.now(timezone.utc)}}
    )
    return jsonify(visible=new_val), 200


@projects_bp.route("/reorder", methods=["POST"])
@jwt_required()
def reorder_projects():
    """Admin: reorder projects for drag-and-drop."""
    data = request.get_json()
    if not data:
        return jsonify(error="Invalid request"), 400
    
    for item in data:
        if "id" not in item or "order" not in item:
            continue
        mongo.db.projects.update_one(
            {"_id": ObjectId(item["id"])},
            {"$set": {"order": int(item["order"])}}
        )
    
    return jsonify(message="Projects reordered"), 200