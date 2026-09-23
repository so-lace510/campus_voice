# CampusVoice

An anonymous complaint platform for a faculty. Students submit complaints
with no identifying information attached; administrators sign in to a
separate dashboard to review complaints and see aggregated analysis and
recommendations. The two are fully separate — the admin dashboard route is
never linked from anywhere a student would casually stumble onto it, and
every write to it requires a password-protected session token.

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite (swap the `DATABASE_URL`
  for Postgres/MySQL later with no code changes).
- **Frontend:** React (Vite), React Router, Recharts, Axios.

## How anonymity is handled

- The complaint form never asks for a name, email, matric number, or any
  account. No IP address is stored.
- Each complaint gets a random 8-character tracking code, shown once at
  submission. Students use that code — not a login — to check on it later.
- The admin dashboard only ever shows department, category, message text,
  status, and timestamps. There is nothing in the data model that could be
  used to identify who submitted a complaint.

## Project layout

```
campus-voice/
  backend/     FastAPI app (complaint intake + admin API + analytics)
  frontend/    React app (public complaint form + admin dashboard)
```

## 1. Run the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and set ADMIN_PASSWORD and JWT_SECRET to real values

uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000`. Interactive docs are at
`http://localhost:8000/docs`.

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

- Public complaint form: `http://localhost:5173/`
- Track a complaint: `http://localhost:5173/track`
- Admin sign-in: `http://localhost:5173/admin/login` (use the
  `ADMIN_PASSWORD` you set in `backend/.env`)

If your backend runs somewhere other than `localhost:8000`, copy
`frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.

## API summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/complaints` | none | Submit an anonymous complaint |
| GET | `/api/complaints/track/{code}` | none | Check a complaint's status by code |
| GET | `/api/complaints/categories` | none | List available categories |
| POST | `/api/admin/login` | none | Exchange the admin password for a token |
| GET | `/api/admin/complaints` | admin token | List/filter/search complaints |
| PATCH | `/api/admin/complaints/{id}` | admin token | Update status / add a note |
| GET | `/api/admin/analytics` | admin token | Totals, trends, keywords, recommendations |

## Deploying

- **Backend:** any host that runs a Python ASGI app (Render, Railway, a VPS
  with `gunicorn -k uvicorn.workers.UvicornWorker`). Point `DATABASE_URL` at
  a real database for production and set `CORS_ORIGINS` to your deployed
  frontend URL.
- **Frontend:** `npm run build` produces a static `dist/` folder you can
  deploy to Vercel, Netlify, or any static host. Set `VITE_API_URL` to your
  deployed backend URL before building.

## Extending the analysis

`backend/app/routers/admin.py` has a `_build_recommendations()` function
with a few starter rules (a dominant category, welfare complaints, exam
complaints, facilities complaints). Add more rules there, or swap it for a
call to a proper NLP/LLM summarizer once you have more real data to test
against.
