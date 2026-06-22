from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from app import mongo, bcrypt
from datetime import timedelta
from bson import ObjectId

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

    # Convert ObjectId to string for JWT identity
    identity = str(admin["_id"])
    
    access_token = create_access_token(
        identity=identity,
        expires_delta=timedelta(minutes=15)
    )
    refresh_token = create_refresh_token(
        identity=identity,
        expires_delta=timedelta(days=7)
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
        identity=identity, expires_delta=timedelta(minutes=15)
    )
    return jsonify(access_token=access_token), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()
    admin = mongo.db.admins.find_one({"_id": ObjectId(identity)})
    if not admin:
        return jsonify(error="Invalid token"), 401
    return jsonify(email=admin["email"], role=admin["role"]), 200