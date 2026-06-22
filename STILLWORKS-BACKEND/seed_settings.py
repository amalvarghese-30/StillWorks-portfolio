# STILLWORKS-BACKEND/seed_settings.py
from app import create_app, mongo
from datetime import datetime, timezone

app = create_app()

with app.app_context():
    # Create settings collection if not exists
    if mongo.db.settings.count_documents({"_id": "testimonials_section"}) == 0:
        mongo.db.settings.insert_one({
            "_id": "testimonials_section",
            "visible": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        print("✓ Created testimonials section settings")
    else:
        print("Testimonials section settings already exist")