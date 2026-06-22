# STILLWORKS-BACKEND/fix_testimonials.py
from app import create_app, mongo

app = create_app()

with app.app_context():
    # Update all existing testimonials to have approved=true and visible=true
    result = mongo.db.testimonials.update_many(
        {},  # All testimonials
        {"$set": {"approved": True, "visible": True}}
    )
    print(f"✅ Updated {result.modified_count} testimonials")
    
    # List all testimonials
    testimonials = list(mongo.db.testimonials.find())
    print(f"\n📋 Total testimonials in DB: {len(testimonials)}")
    for t in testimonials:
        print(f"  - {t.get('client_name')}: approved={t.get('approved')}, visible={t.get('visible')}")