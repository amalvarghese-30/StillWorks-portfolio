from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from datetime import datetime, timezone
from bson import ObjectId
from app.utils.helpers import serialize_doc

testimonials_bp = Blueprint("testimonials", __name__)


def get_mongo():
    """Get mongo instance from current app context."""
    from app import mongo
    return mongo


@testimonials_bp.route("", methods=["GET"])
def list_testimonials():
    """Public: list all approved testimonials."""
    mongo = get_mongo()
    testimonials = mongo.db.testimonials.find({"approved": True}).sort("order", 1)
    return jsonify([serialize_doc(t) for t in testimonials]), 200


@testimonials_bp.route("/admin", methods=["GET"])
@jwt_required()
def admin_list_testimonials():
    """Admin: list all testimonials."""
    mongo = get_mongo()
    testimonials = mongo.db.testimonials.find().sort("created_at", -1)
    return jsonify([serialize_doc(t) for t in testimonials]), 200


@testimonials_bp.route("", methods=["POST"])
@jwt_required()
def create_testimonial():
    data = request.get_json()
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
        "rating": int(data.get("rating", 5)),
        "featured": data.get("featured", False),
        "approved": data.get("approved", True),
        "order": int(data.get("order", 0)),
        "metric": data.get("metric", ""),
        "created_at": datetime.now(timezone.utc),
    }

    mongo = get_mongo()
    result = mongo.db.testimonials.insert_one(testimonial)
    testimonial["_id"] = result.inserted_id
    return jsonify(serialize_doc(testimonial)), 201


@testimonials_bp.route("/<testimonial_id>", methods=["PUT"])
@jwt_required()
def update_testimonial(testimonial_id):
    data = request.get_json()
    update = {}

    for field in ["client_name", "client_role", "company", "content", "image", "metric"]:
        if field in data:
            update[field] = data[field].strip() if isinstance(data[field], str) else data[field]

    for field in ["rating", "order"]:
        if field in data:
            update[field] = int(data[field])

    for field in ["featured", "approved"]:
        if field in data:
            update[field] = bool(data[field])

    if not update:
        return jsonify(error="No fields to update"), 400

    mongo = get_mongo()
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
    mongo = get_mongo()
    result = mongo.db.testimonials.delete_one({"_id": ObjectId(testimonial_id)})
    if result.deleted_count == 0:
        return jsonify(error="Testimonial not found"), 404
    return jsonify(message="Deleted"), 200


@testimonials_bp.route("/reorder", methods=["POST"])
@jwt_required()
def reorder_testimonials():
    data = request.get_json()
    if not data:
        return jsonify(error="Invalid request"), 400

    mongo = get_mongo()
    for item in data:
        if "id" not in item or "order" not in item:
            continue
        mongo.db.testimonials.update_one(
            {"_id": ObjectId(item["id"])},
            {"$set": {"order": int(item["order"])}}
        )

    return jsonify(message="Testimonials reordered"), 200