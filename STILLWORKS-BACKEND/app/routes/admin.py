from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import mongo

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def dashboard_stats():
    """Return overview stats for admin dashboard."""
    total_projects = mongo.db.projects.count_documents({})
    visible_projects = mongo.db.projects.count_documents({"visible": True})
    featured_projects = mongo.db.projects.count_documents({"featured": True})
    total_categories = mongo.db.categories.count_documents({})

    return jsonify(
        total_projects=total_projects,
        visible_projects=visible_projects,
        featured_projects=featured_projects,
        total_categories=total_categories,
    ), 200


@admin_bp.route("/projects", methods=["GET"])
@jwt_required()
def admin_list_projects():
    """Admin: list ALL projects (including hidden)."""
    from app.utils.helpers import serialize_doc
    projects = mongo.db.projects.find().sort("order", 1)
    return jsonify([serialize_doc(p) for p in projects]), 200
