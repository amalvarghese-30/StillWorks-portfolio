from flask import Blueprint, request, jsonify

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/performance", methods=["POST"])
def performance():
    """Accept web vitals from the frontend (fire-and-forget)."""
    return jsonify(received=True), 200


@analytics_bp.route("/error", methods=["POST"])
def error_report():
    """Accept client-side error reports (fire-and-forget)."""
    return jsonify(received=True), 200
