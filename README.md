# HireSense.AI

AI-powered job platform with resume analysis, intelligent job matching, interview prep, and role-based dashboards for Job Seeker, Company/HR, and Admin users.

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose)
- Auth: Firebase (client) + JWT (backend)
- Storage/AI: Supabase/Cloudinary (configurable), Gemini API

## Monorepo Structure

```text
Job-Finder/
├─ frontend/
├─ backend/
├─ netlify.toml
└─ README.md
```

## Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas (or local MongoDB)
- Firebase project (for Google login)

## Local Setup

### 1) Install dependencies

```bash
npm --prefix backend install
npm --prefix frontend install
```

### 2) Configure backend env

Create `backend/.env` (or copy from `backend/.env.example`) and set values:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>

JWT_SECRET=<long_random_secret>
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880

GEMINI_API_KEY=<your_gemini_key>
GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=

SUPABASE_URL=<optional>
SUPABASE_ANON_KEY=<optional>
SUPABASE_BUCKET_NAME=Resume

USE_CLOUDINARY=false
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

FIREBASE_SERVICE_ACCOUNT_KEY=<optional_for_local_if_using_google_login>
```

### 3) Configure frontend env (optional for local)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

If omitted, frontend falls back to `/api` in dev via Vite proxy.

### 4) Run app

Option A (single commands):

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

Option B (VS Code tasks):

- Run Backend Dev Server (Prefix)
- Run Frontend Dev Server (Prefix)

Frontend: http://localhost:3000
Backend health: http://localhost:5000/api/health

## Seed Data (Optional)

```bash
npm --prefix backend run seed
```

This resets and recreates users/jobs.

## Build Commands

```bash
npm --prefix backend run build
npm --prefix frontend run build
```

## Deployment

### Backend (Render)

- Root directory: `backend`
- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm run start`
- Set `NPM_CONFIG_PRODUCTION=false`

Required env on Render:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=<atlas_uri>
JWT_SECRET=<long_random_secret>
JWT_EXPIRE=7d
FRONTEND_URL=https://<your-netlify-site>.netlify.app
MAX_FILE_SIZE=5242880
GEMINI_API_KEY=<key>
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=<if used>
SUPABASE_ANON_KEY=<if used>
SUPABASE_BUCKET_NAME=Resume
FIREBASE_SERVICE_ACCOUNT_KEY=<one-line-json>
```

### Frontend (Netlify)

- Uses `netlify.toml` (`frontend` base, `npm run build`, `dist` publish)
- Add env var:

```env
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

- Redeploy after changing env vars.

## Common Issues

- `CORS blocked`: ensure Render `FRONTEND_URL` matches Netlify URL exactly.
- `firebase-login 404`: user not yet created in production DB; sign up first.
- `Cannot read .length`: fixed in latest main branch, redeploy frontend.
- Resume analyzer calling localhost in prod: fixed in latest main branch, redeploy frontend.

## Security Notes

- Never commit `.env` or service account JSON files.
- Rotate any keys that were shared in logs/chats.
- Prefer `FIREBASE_SERVICE_ACCOUNT_KEY` env var in production (not JSON file).

## License

MIT