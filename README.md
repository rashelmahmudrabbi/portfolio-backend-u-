# Portfolio Backend (Node.js + Express + Neon Postgres, on Vercel)

A small Express API that serves all the content for the portfolio site,
plus a built-in admin panel at `/admin` for editing everything after
deploy — no code changes or redeploys needed to update your CV, projects,
publications, etc.

This replaces the previous Django/DRF + Render backend. It's designed
specifically for Vercel: Node has by far the fastest cold starts of
Vercel's runtimes, and it's paired with Neon's HTTP Postgres driver, which
sends each query as a single `fetch()` call with no connection setup —
ideal for stateless serverless functions.

**The public API is unchanged**: same paths, same JSON field names
(including the `doiLink`/`githubLink`-style camelCase) as the old Django
backend, so the frontend needed no changes beyond the `API_BASE` URL.

---

## What's inside

```
portfolio-backend/
├── api/
│   └── index.js          # Vercel serverless entry point (exports the Express app)
├── src/
│   ├── app.js              # all routes: public API + admin panel
│   ├── db.js                # Postgres client (Neon HTTP driver, or `pg` for local dev)
│   ├── resources.js          # table/field config, shared by the API serializers and admin forms
│   ├── auth.js                # admin session cookie (login/logout)
│   ├── views.js                # tiny HTML helpers for the admin panel (no template engine)
│   ├── schema.sql               # table definitions
│   └── seed-data.js              # starter content (your existing CV/projects/etc.)
├── scripts/
│   ├── dev-server.js       # runs the app locally with app.listen()
│   ├── migrate.js           # creates/updates tables
│   └── seed.js                # loads the starter content
├── package.json
├── vercel.json              # tells Vercel to build api/index.js with @vercel/node
└── .env.example
```

## Tech stack

- **Express** — routing or the public API and admin panel
- **@neondatabase/serverless** — Neon's HTTP Postgres driver (production)
- **pg** — plain Postgres driver, used only for local dev (`DB_DRIVER=pg`)
  and the one-off `migrate`/`seed` scripts
- No template engine, no ORM, no session-store package — kept deliberately
  minimal so the serverless function bundle (and cold start) stays small

---

## 1. Local setup

You need a Postgres database to develop against — either a local Postgres
install, or a free [Neon](https://neon.tech) project (same one you'll use
in production).

```bash
npm install
cp .env.example .env      # then edit .env — see below
```

Edit `.env`:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | any long random string (signs the admin session cookie) |
| `DATABASE_URL` | your Postgres connection string |
| `DB_DRIVER` | set to `pg` for local Postgres; leave unset to use Neon's HTTP driver even locally |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | admin login for `/admin` |
| `CORS_ALLOWED_ORIGINS` | extra origins allowed to call the API from a browser (comma separated) |

Set up and start:

```bash
npm run migrate      # creates all tables
npm run seed          # loads starter content (safe to re-run — resets to these defaults)
npm run dev             # starts the server at http://localhost:8000
```

Visit `http://localhost:8000/admin` to log in and start editing content.

---

## 2. Editing content

Log in to `/admin` (locally or on the live Vercel URL) and you'll find a
page for every content type — Education, Experience, Publications,
Projects, Certifications, Awards, Activities, Gallery (events + nested
photos), Courses, Blog Posts, References, plus Site Settings (profile,
socials, skills, personal info, teaching info — a singleton) and its
nested lists (Research Interests, Spoken Languages, Teaching Roles,
Teaching Areas). Every list has a **Sort order** field you can edit
inline via the create/edit form.

The frontend fetches fresh data from this API on every page load, so
changes made in `/admin` appear on the live site immediately.

---

## 3. Deployment (Vercel)

1. Push this repo to GitHub, then import the `portfolio-backend` folder as
   a Vercel project (set it as the project **root directory** if your repo
   also contains the frontend).
2. Create a free [Neon](https://neon.tech) Postgres project and copy its
   connection string.
3. In the Vercel dashboard, set these **Environment Variables**:

   | Key | Value |
   |---|---|
   | `SECRET_KEY` | a long random string, generated for production |
   | `DATABASE_URL` | your Neon connection string |
   | `ADMIN_USERNAME` / `ADMIN_PASSWORD` | your real admin login |
   | `CORS_ALLOWED_ORIGINS` | leave unset unless the frontend moves off `https://rashelmahmudrabbi.github.io` |

   Do **not** set `DB_DRIVER` in production — leaving it unset uses Neon's
   fast HTTP driver, which is what you want on Vercel.

4. Vercel has no build-time shell-command hook for this runtime, so run
   the migration and seed **once, from your own machine**, pointed at the
   same `DATABASE_URL` you put in Vercel:

   ```bash
   DATABASE_URL="<same value you put in Vercel>" npm run migrate
   DATABASE_URL="<same value you put in Vercel>" npm run seed   # first deploy only
   ```

   Re-run `migrate` the same way if you ever add a new table/column
   (i.e. edit `src/schema.sql`), then redeploy. You do **not** need to
   re-run anything for day-to-day content edits — those go through
   `/admin`, not through redeploys.
5. Push to `main` (or run `vercel --prod`) — Vercel redeploys automatically
   on every push once the project is linked to the GitHub repo.
6. Confirm `https://portfolio-backend-u.vercel.app/api/health` returns
   `{"ok":true}`, then update the frontend's `assets/js/config.js`
   `API_BASE` to `https://portfolio-backend-u.vercel.app/api`.

### Why Vercel instead of Render for this backend

Render's free tier spins Web Services down after ~15 minutes idle, and the
next request pays a 30–60s cold-boot penalty to wake it back up. Vercel's
serverless functions have no such sleep state — combined with Neon's HTTP
driver (no connection handshake) and Node's fast cold starts, this stays
responsive on a low/bursty personal-site traffic pattern without needing a
paid always-on instance.

---

## 4. CORS

Requests are only allowed to read the API from a browser if their Origin
is in the allow-list built in `src/app.js` — currently:

- `https://rashelmahmudrabbi.github.io` (production frontend)
- `http://localhost:5500` / `http://127.0.0.1:5500` (local frontend dev)
- anything added via the `CORS_ALLOWED_ORIGINS` env var (comma separated)

If the frontend ever moves to a new domain, add it there (env var, no code
change needed) and redeploy.

---

## API reference

Routes use **no trailing slash** (`/api/education`, not `/api/education/`)
to match the frontend's existing fetch calls — identical to the previous
Django backend.

| Path | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/settings` | GET | Singleton profile/site content |
| `/api/education` | GET | List of education entries |
| `/api/experience` | GET | List of work/research experience entries |
| `/api/publications` | GET | List of publications |
| `/api/projects` | GET | List of projects |
| `/api/certifications` | GET | List of certifications |
| `/api/awards` | GET | List of awards |
| `/api/activities` | GET | List of co-curricular activities |
| `/api/gallery` | GET | List of gallery events, each with nested `photos` |
| `/api/courses` | GET | List of teaching courses |
| `/api/blog` | GET | List of blog posts |
| `/api/references` | GET | List of references |

Each collection also supports `/api/<name>/<id>` for a single item. All
endpoints are public/read-only — every edit happens through `/admin`.

---

## Troubleshooting

- **`DATABASE_URL is not set`** — set it in `.env` locally, or in the
  Vercel project's Environment Variables in production.
- **Admin pages 500 with a Postgres connection error** — check
  `DATABASE_URL` is correct and (for local dev) that your local Postgres
  is actually running.
- **Frontend gets CORS errors / data doesn't load** — confirm the
  frontend's exact origin (protocol + domain, no trailing slash) is in the
  allow-list described above, and that `API_BASE` in
  `assets/js/config.js` points at your deployed Vercel URL.
- **Content edited in `/admin` doesn't show up on the site** — the
  frontend fetches on every page load, so this is almost always a caching
  issue in the browser rather than the backend; hard-refresh to confirm.
