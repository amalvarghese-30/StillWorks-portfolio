# STILLWORKS-BACKEND/app/__init__.py
from flask import Flask, send_from_directory, g, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
import time
import logging
import platform
import sys
from flask_compress import Compress
import cloudinary

load_dotenv()

logger = logging.getLogger(__name__)

mongo = PyMongo()
jwt = JWTManager()
bcrypt = Bcrypt()
compress = Compress()


def create_app():
    app = Flask(__name__)

    # Config
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    if not app.config["JWT_SECRET_KEY"] or not app.config["SECRET_KEY"]:
        raise RuntimeError(
            "JWT_SECRET_KEY and SECRET_KEY must be set in environment variables"
        )

    app.config["MAX_CONTENT_LENGTH"] = int(
        os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)
    )
    app.config["UPLOAD_FOLDER"] = os.path.abspath(
        os.path.join(os.getcwd(), "uploads")
    )

    # Cloudinary config
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )

    # Compression settings
    app.config["COMPRESS_MIMETYPES"] = [
        "text/html",
        "text/css",
        "text/xml",
        "application/json",
        "application/javascript",
        "text/plain",
        "image/svg+xml",
        "font/woff2",
    ]
    app.config["COMPRESS_LEVEL"] = 6
    app.config["COMPRESS_MIN_SIZE"] = 500

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        uploads_path = app.config["UPLOAD_FOLDER"]
        response = send_from_directory(uploads_path, filename)
        if filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")):
            response.cache_control.max_age = 31536000
            response.cache_control.public = True
            response.cache_control.immutable = True
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response

    # Enable CORS
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://localhost:8080",
                    "https://stillworks.in",
                    "https://www.stillworks.in",
                    "https://still-works-portfolio-6lqq2yxuj.vercel.app",
                ]
            }
        },
        supports_credentials=True,
        vary=True,
    )

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    compress.init_app(app)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Import blueprints AFTER extensions are initialized
    from app.routes.auth import auth_bp
    from app.routes.projects import projects_bp
    from app.routes.categories import categories_bp
    from app.routes.admin import admin_bp
    from app.routes.media import media_bp
    from app.routes.settings import settings_bp
    from app.routes.testimonials import testimonials_bp
    from app.routes.contact import contact_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(media_bp, url_prefix="/api/admin/media")
    app.register_blueprint(settings_bp, url_prefix="/api/admin/settings")
    app.register_blueprint(testimonials_bp, url_prefix="/api/testimonials")
    app.register_blueprint(contact_bp, url_prefix="/api/contact")

    # Global error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify(error="Bad request"), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify(error="Unauthorized"), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify(error="Forbidden"), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(error="Not found"), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.exception("Internal server error")
        return jsonify(error="Internal server error"), 500

    # Performance monitoring middleware
    @app.before_request
    def before_request():
        g.start_time = time.time()

    @app.after_request
    def after_request(response):
        if hasattr(g, "start_time"):
            elapsed = (time.time() - g.start_time) * 1000
            response.headers["X-Response-Time"] = f"{elapsed:.2f}ms"

        # Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        )
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )

        # Cache headers — skip admin routes
        if request.path.startswith("/api/") and not request.path.startswith("/api/admin"):
            if request.method == "GET" and response.status_code == 200:
                response.cache_control.max_age = 300
                response.cache_control.public = True
                response.headers["Cache-Control"] = "public, max-age=300"
            else:
                response.cache_control.no_cache = True
                response.cache_control.no_store = True
                response.cache_control.must_revalidate = True
                response.headers["Cache-Control"] = (
                    "no-store, no-cache, must-revalidate, max-age=0"
                )

        if "Accept-Encoding" in request.headers:
            response.vary.add("Accept-Encoding")

        return response

    # Health check
    @app.route("/health")
    def health_check():
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "python_version": sys.version,
            "platform": platform.platform(),
            "mongodb_connected": mongo.db is not None,
        }, 200

    with app.app_context():
        _seed_admin()
        _create_indexes()

    return app


def _seed_admin():
    if mongo.db is None:
        logger.warning("MongoDB not connected — skipping admin seed")
        return

    admins = mongo.db.admins
    is_prod = os.getenv("FLASK_ENV") == "production" or os.getenv("ENVIRONMENT") == "production"

    if is_prod and os.getenv("FORCE_SEED", "false").lower() == "false":
        return

    if admins.count_documents({}) == 0:
        email = os.getenv("ADMIN_EMAIL", "admin@stillworks.com")
        password = os.getenv("ADMIN_PASSWORD", "admin123")

        if password == "admin123" and is_prod:
            logger.warning("Using default admin credentials in production!")

        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        admins.insert_one({"email": email, "password": hashed, "role": "admin"})
        logger.info("Admin account created: %s", email)


def _create_indexes():
    if mongo.db is None:
        logger.warning("MongoDB not connected — skipping index creation")
        return
    try:
        mongo.db.projects.create_index("slug", unique=True)
        mongo.db.projects.create_index("category")
        mongo.db.projects.create_index("category_id")
        mongo.db.projects.create_index("featured")
        mongo.db.projects.create_index("visible")
        mongo.db.projects.create_index("order")
        mongo.db.projects.create_index([("visible", 1), ("order", 1)])
        mongo.db.projects.create_index([("category", 1), ("visible", 1), ("order", 1)])

        mongo.db.categories.create_index("slug", unique=True)
        mongo.db.categories.create_index("order")

        mongo.db.testimonials.create_index("order")
        mongo.db.testimonials.create_index("approved")
        mongo.db.testimonials.create_index("visible")
        mongo.db.testimonials.create_index([("approved", 1), ("visible", 1), ("order", 1)])

        mongo.db.media_uploads.create_index("public_id", unique=True)
        mongo.db.media_uploads.create_index("created_at")

        mongo.db.admins.create_index("email", unique=True)

        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error("Failed to create indexes: %s", e)
