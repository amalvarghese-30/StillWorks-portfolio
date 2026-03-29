from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from app import mongo, bcrypt
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify(error="Missing request body"), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify(error="Email and password required"), 400

    admin = mongo.db.admins.find_one({"email": email})
    if not admin or not bcrypt.check_password_hash(admin["password"], password):
        return jsonify(error="Invalid credentials"), 401

    access_token = create_access_token(
        identity=str(admin["_id"]),
        expires_delta=timedelta(hours=24)
    )
    refresh_token = create_refresh_token(
        identity=str(admin["_id"]),
        expires_delta=timedelta(days=30)
    )

    return jsonify(
        access_token=access_token,
        refresh_token=refresh_token,
        admin={"email": admin["email"], "role": admin["role"]}
    ), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(
        identity=identity, expires_delta=timedelta(hours=24)
    )
    return jsonify(access_token=access_token), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    from bson import ObjectId
    identity = get_jwt_identity()
    admin = mongo.db.admins.find_one({"_id": ObjectId(identity)})
    if not admin:
        return jsonify(error="Admin not found"), 404
    return jsonify(email=admin["email"], role=admin["role"]), 200
