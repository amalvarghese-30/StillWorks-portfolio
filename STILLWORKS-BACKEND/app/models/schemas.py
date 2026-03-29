"""
MongoDB Schema Definitions (for reference — MongoDB is schemaless,
but these document the expected structure).

Collections:
  admins        — admin user accounts
  projects      — portfolio projects
  categories    — project categories

---

admins:
{
  "_id": ObjectId,
  "email": str,
  "password": str (bcrypt hash),
  "role": "admin"
}

projects:
{
  "_id": ObjectId,
  "title": str,
  "slug": str (unique, URL-safe),
  "category_id": str (references categories._id),
  "category": str (denormalized name for fast reads),
  "description": str,
  "client": str,
  "year": str,
  "image": str (filename or URL),
  "images": [str] (gallery),
  "video_url": str | null,
  "featured": bool,
  "visible": bool,
  "order": int,
  "created_at": datetime,
  "updated_at": datetime
}

categories:
{
  "_id": ObjectId,
  "name": str,
  "slug": str (unique),
  "order": int,
  "created_at": datetime
}
"""
