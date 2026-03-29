# STILLWORKS-BACKEND/app/__init__.py
from flask import Flask, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

mongo = PyMongo()
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)

    # Config
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-this-in-production")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-this-in-production")
    app.config["MAX_CONTENT_LENGTH"] = int(
        os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)
    )
    app.config["UPLOAD_FOLDER"] = os.path.abspath(
        os.path.join(os.getcwd(), "uploads")
    )

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        uploads_path = app.config["UPLOAD_FOLDER"]
        return send_from_directory(uploads_path, filename)

    # Enable CORS with stricter settings for production
    CORS(
        app,
        resources={r"/api/*": {"origins": [
            "http://localhost:5173",
            "http://localhost:8080",
            "https://stillworks.in",
            "https://www.stillworks.in",
            "still-works-portfolio-6lqq2yxuj.vercel.app"
        ]}},
        supports_credentials=True
    )

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Ensure uploads directory exists
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

    # Register all blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(media_bp, url_prefix="/api/admin/media")
    app.register_blueprint(settings_bp, url_prefix="/api/admin/settings")
    app.register_blueprint(testimonials_bp, url_prefix="/api/testimonials")
    app.register_blueprint(contact_bp, url_prefix="/api/contact")

    # Seed admin account
    with app.app_context():
        _seed_admin()

    return app


def _seed_admin():
    """Create default admin only if none exists."""
    admins = mongo.db.admins

    # Don't auto-seed in production if FORCE_SEED is false
    if os.getenv("FLASK_ENV") == "production" and os.getenv("FORCE_SEED", "false").lower() == "false":
        return

    if admins.count_documents({}) == 0:
        email = os.getenv("ADMIN_EMAIL", "admin@stillworks.com")
        password = os.getenv("ADMIN_PASSWORD", "admin123")

        # Warn if using default credentials
        if password == "admin123" and os.getenv("FLASK_ENV") == "production":
            print("[WARNING] Using default admin credentials in production!")

        hashed = bcrypt.generate_password_hash(password).decode("utf-8")

        admins.insert_one({
            "email": email,
            "password": hashed,
            "role": "admin"
        })

        print(f"[SEED] Admin created: {email}")