from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import mongo
from app.utils.helpers import slugify, serialize_doc
from datetime import datetime, timezone
from bson import ObjectId

categories_bp = Blueprint("categories", __name__)


@categories_bp.route("", methods=["GET"])
def list_categories():
    """Public: list all categories sorted by order."""
    cats = mongo.db.categories.find().sort("order", 1)
    return jsonify([serialize_doc(c) for c in cats]), 200


@categories_bp.route("", methods=["POST"])
@jwt_required()
def create_category():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify(error="Category name required"), 400

    slug = slugify(name)
    if mongo.db.categories.find_one({"slug": slug}):
        return jsonify(error="Category already exists"), 409

    max_order = mongo.db.categories.find_one(sort=[("order", -1)])
    order = (max_order["order"] + 1) if max_order else 0

    doc = {
        "name": name,
        "slug": slug,
        "order": order,
        "created_at": datetime.now(timezone.utc),
    }
    result = mongo.db.categories.insert_one(doc)
    doc["_id"] = result.inserted_id
    return jsonify(serialize_doc(doc)), 201


@categories_bp.route("/<cat_id>", methods=["PUT"])
@jwt_required()
def update_category(cat_id):
    data = request.get_json()
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify(error="Category name required"), 400

    slug = slugify(name)
    update = {"name": name, "slug": slug}
    if "order" in data:
        update["order"] = int(data["order"])

    result = mongo.db.categories.find_one_and_update(
        {"_id": ObjectId(cat_id)},
        {"$set": update},
        return_document=True,
    )
    if not result:
        return jsonify(error="Category not found"), 404

    # Update denormalized category name on projects
    mongo.db.projects.update_many(
        {"category_id": cat_id},
        {"$set": {"category": name}}
    )

    return jsonify(serialize_doc(result)), 200


@categories_bp.route("/<cat_id>", methods=["DELETE"])
@jwt_required()
def delete_category(cat_id):
    result = mongo.db.categories.delete_one({"_id": ObjectId(cat_id)})
    if result.deleted_count == 0:
        return jsonify(error="Category not found"), 404
    return jsonify(message="Deleted"), 200


@categories_bp.route("/reorder", methods=["POST"])
@jwt_required()
def reorder_categories():
    """Admin: reorder categories for drag-and-drop."""
    data = request.get_json()
    if not data:
        return jsonify(error="Invalid request"), 400
    
    for item in data:
        if "id" not in item or "order" not in item:
            continue
        mongo.db.categories.update_one(
            {"_id": ObjectId(item["id"])},
            {"$set": {"order": int(item["order"])}}
        )
    
    return jsonify(message="Categories reordered"), 200