from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from datetime import datetime, timezone
from bson import ObjectId
from app import mongo
from app.utils.helpers import serialize_doc, mongo_required

testimonials_bp = Blueprint("testimonials", __name__)


@testimonials_bp.route("", methods=["GET"])
@mongo_required
def list_testimonials():
    """Public: list only approved and visible testimonials."""
    testimonials = mongo.db.testimonials.find({
        "approved": True,
        "visible": True
    }).sort("order", 1)
    return jsonify([serialize_doc(t) for t in testimonials]), 200


@testimonials_bp.route("/admin", methods=["GET"])
@jwt_required()
def admin_list_testimonials():
    """Admin: list all testimonials (including hidden)."""
    testimonials = mongo.db.testimonials.find().sort("order", 1)
    return jsonify([serialize_doc(t) for t in testimonials]), 200


@testimonials_bp.route("", methods=["POST"])
@jwt_required()
def create_testimonial():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Missing request body"), 400

    required = ["client_name", "content"]
    for field in required:
        if not data.get(field):
            return jsonify(error=f"Missing {field}"), 400

    testimonial = {
        "client_name": data["client_name"].strip(),
        "client_role": data.get("client_role", "").strip(),
        "company": data.get("company", "").strip(),
        "content": data["content"].strip(),
        "image": data.get("image", "").strip(),
        "video_url": data.get("video_url", "").strip(),
        "video_type": data.get("video_type", "youtube"),
        "rating": int(data.get("rating", 5)),
        "featured": data.get("featured", False),
        "approved": data.get("approved", True),
        "visible": data.get("visible", True),
        "order": int(data.get("order", 0)),
        "metric": data.get("metric", ""),
        "project_name": data.get("project_name", ""),
        "project_link": data.get("project_link", ""),
        "created_at": datetime.now(timezone.utc),
    }

    result = mongo.db.testimonials.insert_one(testimonial)
    testimonial["_id"] = result.inserted_id
    return jsonify(serialize_doc(testimonial)), 201


@testimonials_bp.route("/<testimonial_id>", methods=["PUT"])
@jwt_required()
def update_testimonial(testimonial_id):
    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Missing request body"), 400

    update = {}

    text_fields = ["client_name", "client_role", "company", "content", "image",
                   "metric", "video_url", "video_type", "project_name", "project_link"]
    for field in text_fields:
        if field in data:
            update[field] = data[field].strip() if isinstance(data[field], str) else data[field]

    int_fields = ["rating", "order"]
    for field in int_fields:
        if field in data:
            try:
                update[field] = int(data[field])
            except (ValueError, TypeError):
                pass

    bool_fields = ["featured", "approved", "visible"]
    for field in bool_fields:
        if field in data:
            update[field] = bool(data[field])

    if not update:
        return jsonify(error="No fields to update"), 400

    result = mongo.db.testimonials.find_one_and_update(
        {"_id": ObjectId(testimonial_id)},
        {"$set": update},
        return_document=True,
    )

    if not result:
        return jsonify(error="Testimonial not found"), 404

    return jsonify(serialize_doc(result)), 200


@testimonials_bp.route("/<testimonial_id>", methods=["DELETE"])
@jwt_required()
def delete_testimonial(testimonial_id):
    result = mongo.db.testimonials.delete_one({"_id": ObjectId(testimonial_id)})
    if result.deleted_count == 0:
        return jsonify(error="Testimonial not found"), 404
    return jsonify(message="Deleted"), 200


@testimonials_bp.route("/reorder", methods=["POST"])
@jwt_required()
def reorder_testimonials():
    data = request.get_json(silent=True)
    if not data or not isinstance(data, list):
        return jsonify(error="Expected array of order objects"), 400

    for item in data:
        if "id" not in item or "order" not in item:
            continue
        try:
            order_val = int(item["order"])
        except (ValueError, TypeError):
            continue
        mongo.db.testimonials.update_one(
            {"_id": ObjectId(item["id"])},
            {"$set": {"order": order_val}}
        )

    return jsonify(message="Testimonials reordered"), 200


@testimonials_bp.route("/toggle-visibility/<testimonial_id>", methods=["PATCH"])
@jwt_required()
def toggle_visibility(testimonial_id):
    doc = mongo.db.testimonials.find_one({"_id": ObjectId(testimonial_id)})
    if not doc:
        return jsonify(error="Testimonial not found"), 404

    new_val = not doc.get("visible", True)
    mongo.db.testimonials.update_one(
        {"_id": ObjectId(testimonial_id)},
        {"$set": {"visible": new_val}}
    )
    return jsonify(visible=new_val), 200


@testimonials_bp.route("/section-visibility", methods=["GET"])
@mongo_required
def get_section_visibility():
    settings = mongo.db.settings.find_one({"_id": "testimonials_section"})
    if not settings:
        return jsonify(visible=True), 200
    return jsonify(visible=settings.get("visible", True)), 200


@testimonials_bp.route("/section-visibility", methods=["POST"])
@jwt_required()
def set_section_visibility():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Missing request body"), 400
    visible = data.get("visible", True)

    mongo.db.settings.update_one(
        {"_id": "testimonials_section"},
        {"$set": {"visible": visible, "updated_at": datetime.now(timezone.utc)}},
        upsert=True
    )
    return jsonify(visible=visible), 200
