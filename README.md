# UCLA Syllabi Archive

A full-stack web app for UCLA students to discover, upload, and organize course syllabi, with course-level GPA data support.

## Quick Start

```bash
# Terminal 1 (backend)
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
flask --app run.py db upgrade
python run.py

# Terminal 2 (frontend)
cd frontend
npm install
copy .env.example .env
npm run dev
```

- Backend: `http://127.0.0.1:5000`
- Frontend: `http://127.0.0.1:5173`
- Env templates:
  - [backend/.env.example](backend/.env.example)
  - [frontend/.env.example](frontend/.env.example)

## How To Get Environment Variables

Use the templates:
- [backend/.env.example](backend/.env.example)
- [frontend/.env.example](frontend/.env.example)

### Backend (`backend/.env`)

- `FLASK_ENV`:
  - Set to `development` for local work.
- `SECRET_KEY`:
  - Generate a random secret for Flask sessions.
  - PowerShell example:
    - `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `JWT_SECRET_KEY`:
  - Generate a separate random secret for signing JWTs.
  - PowerShell example:
    - `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `JWT_ALGORITHM`:
- `JWT_ACCESS_TOKEN_EXPIRES_HOURS`:
  - Set token lifetime in hours (for example, `1`).
- `DATABASE_USER` and `DATABASE_PASSWORD`:
  - Create/login to Supabase: `https://supabase.com/`
  - Open your project.
  - Go to `Settings` -> `Database` -> `Connection pooling`.
  - Copy the pooler username into `DATABASE_USER`.
  - Copy the pooler password into `DATABASE_PASSWORD`.
  - This app’s config already sets host/port/database/ssl for Supabase pooler, so only user/password are required in `.env`.

### Frontend (`frontend/.env`)

- `VITE_API_URL`:
  - Local dev default: `http://127.0.0.1:5000/api`
  - If backend runs elsewhere, set this to that API base URL.

## What This Project Does

- UCLA-only auth (`@ucla.edu` / `@g.ucla.edu`) with JWT login.
- Searchable syllabus catalog with filters:
  - professor last name
  - department
  - course number
  - quarter/year
  - sort by newest/oldest/download count
- PDF syllabus uploads with duplicate-file detection via SHA-256 hash.
- Favorites system (save/remove/list favorited syllabi).
- Grade submissions (one grade per user per course, updatable).
- Course grade-distribution endpoint (UCLA GPA buckets).

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Flask + SQLAlchemy + Flask-Migrate + Flask-CORS
- Database: Supabase-hosted PostgreSQL
- Auth: JWT (PyJWT), Werkzeug password hashing

## Repository Structure

```text
.
├─ frontend/            # React client
├─ backend/             # Flask API + models + migrations
│  ├─ app/              # route blueprints, auth, config
│  ├─ models/           # SQLAlchemy models
│  └─ migrations/       # Alembic migration history
├─ package.json         # root dependency metadata
└─ README.md
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ and pip
- PostgreSQL database credentials (Supabase pooler credentials expected by current backend config)

## Local Setup

### 1. Clone and enter repo

```bash
git clone <your-repo-url>
cd cs35l-project-w26
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env` from [`backend/.env.example`](backend/.env.example):

```env
FLASK_ENV=development
SECRET_KEY=replace-me
JWT_SECRET_KEY=replace-me
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRES_HOURS=1

DATABASE_USER=your_supabase_pooler_user
DATABASE_PASSWORD=your_supabase_pooler_password
```

Run migrations and start API:

```bash
flask --app run.py db upgrade
python run.py
```

Backend runs on `http://127.0.0.1:5000`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env` from [`frontend/.env.example`](frontend/.env.example):

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs on `http://127.0.0.1:5173`.

## API Overview

Base URL: `/api`

- `GET /health` - backend health check
- `POST /register` - create account (UCLA domains only)
- `POST /login` - returns JWT access token
- `GET /syllabi` - list/search syllabi
- `GET /syllabi/:id` - get one syllabus
- `POST /upload` - upload PDF syllabus (JWT required)
- `DELETE /syllabi/:id` - delete own syllabus (JWT required)
- `POST /syllabi/:id/favorite` - favorite syllabus (JWT required)
- `DELETE /syllabi/:id/favorite` - unfavorite syllabus (JWT required)
- `GET /favorites` - current user favorites (JWT required)
- `POST /grades` - submit/update grade for a course (JWT required)
- `GET /courses/:course_id/grade-distribution` - aggregate GPA data for one course

## User Guide

### Register and Login

1. Open `http://127.0.0.1:5173`.
2. Click `Register` and use a UCLA email (`@ucla.edu` or `@g.ucla.edu`).
3. Log in from the `Login` page.

### Browse Syllabi

1. Go to `Browse`.
2. Filter by department, course number, professor last name, quarter, year, and sort mode.
3. Review syllabus metadata in the results grid.

### Upload a Syllabus (must be logged in)

1. Go to `Upload`. 
2. Fill in course/professor/term/grade (optional) fields.
3. Select a PDF and submit.
4. If file content is identical to an existing upload for the same course/term, the backend rejects it as a duplicate.

### Favorites and Customization (must be logged in)

- Go to `My Uploads` to edit records of syllabi you've uploaded.
- Go to `Favorites` to view a list of your favorite syllabi. 

## Troubleshooting

- Upload fails:
  - Ensure file is a PDF and under 10MB.

## Database Models

- `users`
- `courses`
- `syllabi`
- `favorites`
- `grades`

See code in `backend/models/` and migrations in `backend/migrations/versions/`.

## Development Notes

- Uploaded PDFs are stored in `backend/uploads/`.
- CORS is currently configured for:
  - `http://127.0.0.1:5173`
  - `http://localhost:5173`
- `MAX_CONTENT_LENGTH` is set to 10MB for uploads.


## Contributors
- Saamiyah Ali
- Sofia Covarrubias
- Prabhav Rao
- Uzair Hammad
- Helin (Eric) Wang
- Lilian Pamula




