# Stillworks Backend — Flask + MongoDB Atlas

## Architecture

```
Frontend (Lovable/React)
    ↓ REST API calls
Flask API (this repo)
    ↓ pymongo driver
MongoDB Atlas (cloud database)
```

## Quick Start

```bash
# 1. Clone and enter
cd stillworks-backend

# 2. Create virtual env
python3 -m venv venv && source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and secrets

# 5. Run
python run.py
```

Server starts at `http://localhost:5000`

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/refresh` | Refresh token | Get new access token |
| GET | `/api/auth/me` | JWT | Current admin info |

### Projects (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | No | List visible projects |
| GET | `/api/projects?category=Branding` | No | Filter by category |
| GET | `/api/projects?featured=true` | No | Featured only |
| GET | `/api/projects/:id` | No | Single project |

### Projects (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/projects` | JWT | Create project (multipart form) |
| PUT | `/api/projects/:id` | JWT | Update project |
| DELETE | `/api/projects/:id` | JWT | Delete project |
| PATCH | `/api/projects/:id/toggle-featured` | JWT | Toggle featured |
| PATCH | `/api/projects/:id/toggle-visibility` | JWT | Toggle visibility |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | No | List all categories |
| POST | `/api/categories` | JWT | Create category |
| PUT | `/api/categories/:id` | JWT | Update category |
| DELETE | `/api/categories/:id` | JWT | Delete category |

### Admin Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | JWT | Dashboard statistics |
| GET | `/api/admin/projects` | JWT | All projects (incl. hidden) |

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist your IP (or `0.0.0.0/0` for dev)
5. Copy connection string → paste in `.env` as `MONGO_URI`

## Deploy

### Render.com (recommended)
1. Push to GitHub
2. Connect repo on Render
3. Set environment variables
4. Deploy as Web Service

### Railway / Fly.io
Similar — just set env vars and point to `run.py`

## Folder Structure

```
stillworks-backend/
├── app/
│   ├── __init__.py          # App factory, extensions
│   ├── models/
│   │   └── schemas.py       # MongoDB schema docs
│   ├── routes/
│   │   ├── auth.py          # Login/JWT endpoints
│   │   ├── projects.py      # CRUD + toggles
│   │   ├── categories.py    # Category management
│   │   └── admin.py         # Dashboard stats
│   └── utils/
│       └── helpers.py        # Slugify, upload, serialize
├── uploads/                  # Uploaded images
├── .env.example
├── requirements.txt
├── run.py                    # Entry point
├── Procfile                  # For deployment
└── README.md
```
