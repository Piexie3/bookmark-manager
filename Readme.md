# Book Mark manager

A bookmark manager with collections, tags, favorites, and semantic search (OpenAI embeddings). Built with a Flask backend and a Next.js frontend.

<img width="1365" height="697" alt="image" src="https://github.com/user-attachments/assets/e72dff20-d089-4960-8aab-44aa3d465af4" /> | <img width="1365" height="690" alt="image" src="https://github.com/user-attachments/assets/650b0767-839d-4674-9e0a-6411f6b8219a" />
<img width="1365" height="701" alt="image" src="https://github.com/user-attachments/assets/d92c2f4b-8693-47fb-94c7-5a3dc269bc41" />|<img width="1365" height="696" alt="image" src="https://github.com/user-attachments/assets/ed0952e4-271f-434d-900b-fadad7c1c6c0" />

here is the API for the backend 
https://documenter.getpostman.com/view/39178540/2sBXVoAoGG



## Features

- **Bookmarks** — Add, edit, delete, and organize bookmarks with title, URL, and description
- **Collections** — Group bookmarks into collections (with icon and color)
- **Tags** — Label bookmarks with tags
- **Favorites** — Mark bookmarks as favorites
- **Search** — Semantic search over bookmarks (requires OpenAI API key) I useses Capability of 
- **Archive / Trash** — Archive and trash views

## Prerequisites

- **Python 3** (3.10+)
- **Node.js** (18+)
- **PostgreSQL** (for the backend database)
- **OpenAI API key** (optional; only needed for semantic search)

---

## Quick start

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/oxygene
API_KEY=sk-...   # Optional: for semantic search
```

Create the database (e.g. `createdb oxygene`), then run:

```bash
python main.py
```

Backend runs at **http://localhost:5000**.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**. It talks to the API at `http://localhost:5000` by default.

---

## Environment variables

### Backend (`backend/.env`)

| Variable       | Required | Description                          |
|----------------|----------|--------------------------------------|
| `DATABASE_URL` | Yes      | PostgreSQL connection string         |
| `API_KEY`      | No       | OpenAI API key for semantic search   |

### Frontend

| Variable              | Required | Description                                  |
|-----------------------|----------|----------------------------------------------|
| `NEXT_PUBLIC_API_URL` | No       | Backend API base URL (default: `http://localhost:5000`) |

---

## Scripts

### Backend

- **Development:** `python main.py` — Flask on port 5000
- **Tests:** `pytest` (from project root or `backend/`)
- **Production:** `gunicorn -c gunicorn.conf.py backend.main:app` — serves on port 8000 (see `gunicorn.conf.py`)

### Frontend

- **Development:** `npm run dev` — Next.js dev server (port 3000)
- **Build:** `npm run build`
- **Production:** `npm run start`
- **Lint:** `npm run lint`

---

## Project structure

```
oxygene/
├── backend/           # Flask API
│   ├── api/app.py     # Routes and app setup
│   ├── infra/db.py    # SQLAlchemy
│   ├── models/        # Bookmark, Collection, Tag
│   ├── services/      # Business logic
│   └── main.py        # Entry point
├── frontend/          # Next.js app
│   ├── app/           # Pages and layout
│   ├── components/    # UI components
│   ├── lib/api.ts     # API client
│   └── store/         # Zustand stores
└── Readme.md
```

---

## Notes

- If `API_KEY` is not set, semantic search will return a 503; the rest of the app works without it.
- CORS is configured for `localhost:3000`, `3001`, `3002` and `127.0.0.1` equivalents so the frontend can call the API during development.
