# pitch-please
The Pitch, Please! website revamped

## Project layout

- `pitch-please/` — React + Vite frontend
- `backend/` — Express + SQLite API (media, members, repertoire, auth)

## Configuration

The frontend reads its backend URL from Vite's `VITE_API_BASE_URL`
(`pitch-please/src/config.js`). It **defaults to empty**, which keeps every
request relative (`/api/...`, `/uploads/...`) so the app talks to whatever origin
serves it. That is the intended production setup — see below.

| Variable (frontend, `pitch-please/.env*`) | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend base URL. Leave empty for same-origin. Use `.env.development.local` for personal overrides. |

| Variable (backend) | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | HTTP port. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `pitchplease` | Seeded on first run only. |
| `CORS_ORIGIN` | unset (reflects request origin) | Comma-separated allowlist of frontend origins. |
| `COOKIE_SAME_SITE` | `Lax` | Set to `None` only when the frontend and API are on different sites (adds `Secure`, requires HTTPS). |

## Deployment (Render)

Auth is a cookie session (`pp_session`). For uploads to work, the browser must
send that cookie — which means the pages and the API must share **one origin**.
`backend/server.js` therefore serves the built frontend itself.

Deploy a **single Render Web Service**:

- **Root Directory**: repository root
- **Build Command**: `cd backend && npm install && cd ../pitch-please && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Environment**: do **not** set `VITE_API_BASE_URL` (leave it unset/empty)

With that setup `/`, `/members`, `/gallery`, `/api/*` and `/uploads/*` all come
from the same origin, so the session cookie stays first-party and uploads work.

Attach a **Persistent Disk** (e.g. mounted at `backend`) so the SQLite database
(`backend/data`) and uploaded files (`backend/uploads`) survive deploys — Render's
default filesystem is ephemeral.

> Deploying the frontend as a separate Render Static Site makes it a different
> origin (`onrender.com` is a public suffix, so different subdomains are
> different *sites*). The `SameSite=Lax` session cookie is then dropped and
> uploads fail with "Unauthorized. Please log in." If you must split the two
> services, set `CORS_ORIGIN` to the frontend origin and
> `COOKIE_SAME_SITE=None`, then set `VITE_API_BASE_URL` to the API's URL.

## Local development

Single origin (recommended, matches production):

```
cd pitch-please && npm install && npm run build
cd ../backend && npm install && npm start
# open http://localhost:3001
```

Hot-reload frontend against a local API — create `pitch-please/.env.development.local`:

```
VITE_API_BASE_URL=http://localhost:3001
```

then run `npm start` in `backend/` and `npm run dev` in `pitch-please/`. This is
cross-origin but same-site, so the `Lax` cookie still works; `credentials:
"include"` on the API calls plus the backend's CORS credentials support make it
function.

