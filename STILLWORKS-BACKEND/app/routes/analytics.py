from flask import Blueprint, request, jsonify

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/performance", methods=["POST"])
def performance():
    """Accept web vitals from the frontend (fire-and-forget)."""
    data = request.get_json(silent=True) or {}
    return jsonify(received=True), 200
