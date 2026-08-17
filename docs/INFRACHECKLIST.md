# Infra Setup Checklist — Gym MMS

---

## 1. GitHub
- [ ] Create account (if not already)
- [ ] Create a new **private** repo — e.g. `gym-mms`
- [ ] Copy the clone URL (HTTPS or SSH)
- [ ] `git init` locally, `git remote add origin <url>`, push initial skeleton
- [ ] Set `main` as the default branch
- [ ] Enable **branch protection** on `main`: Settings → Branches → require PR before merging, no direct pushes
- [ ] Create and push a `dev` branch

## 2. Docker
- [ ] Install Docker Desktop (macOS/Windows) or `docker.io` (Linux)
- [ ] Verify install: `docker --version`
- [ ] From `backend/`, build the image: `docker build -t gym-mms-backend .`
- [ ] Confirm it builds without errors
- [ ] Run it locally: `docker run -p 8000:8000 --env-file .env gym-mms-backend`
- [ ] Confirm `http://localhost:8000/health` responds `{"status": "ok"}`
- [ ] Stop the container (`Ctrl+C` or `docker ps` + `docker stop <id>`)

*Note: Docker isn't required for day-to-day local development (you can run
`uvicorn` directly) — but confirm it builds now, so you're not debugging a
broken image for the first time when Render tries to deploy it.*

## 3. Supabase
- [ ] Create account at supabase.com
- [ ] Create project **`gym-mms-dev`**
  - [ ] Project Settings → API → copy **Project URL**
  - [ ] Project Settings → API → copy **anon public key**
  - [ ] SQL Editor → run `supabase/migrations/0001_init.sql`
  - [ ] Confirm seed data: `select * from tenants;` returns one row
  - [ ] Copy that tenant's `id` — this is your `DEFAULT_TENANT_ID`
- [ ] Create project **`gym-mms-prod`**
  - [ ] Repeat all steps above for this second project (separate URL, key, tenant id)
  - [ ] Keep dev and prod values clearly separated — never mix them

## 4. Render
- [ ] Create account at render.com, sign up via GitHub (auto-links repos)
- [ ] Create a **Web Service** for the backend, dev environment
  - [ ] Connect to the `gym-mms` repo, root directory `backend/`
  - [ ] Branch: `dev`
  - [ ] Confirm it detects the `Dockerfile` (or set build command manually)
  - [ ] Add environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, `DEFAULT_TENANT_ID`, `ENVIRONMENT=development` (using the **dev** Supabase project's values)
  - [ ] Deploy, confirm `/health` responds on the live Render URL
- [ ] Create a second **Web Service** for production
  - [ ] Same repo, root `backend/`, branch: `main`
  - [ ] Environment variables using the **prod** Supabase project's values, `ENVIRONMENT=production`
  - [ ] Do not deploy this yet — wait until dev is verified working end-to-end

## 5. Vercel
- [ ] Create account at vercel.com, sign up via GitHub
- [ ] Import the `gym-mms` repo, root directory `frontend/`
- [ ] Confirm it auto-detects Next.js
- [ ] Set environment variable `NEXT_PUBLIC_API_URL` → your Render **dev** backend URL
- [ ] Confirm preview deployments trigger automatically on push to any branch
- [ ] Confirm production deployment is tied to `main` only

## 6. Sentry
- [ ] Create account at sentry.io
- [ ] Create project: **backend** (platform: Python/FastAPI) → copy DSN
- [ ] Create project: **frontend** (platform: Next.js) → copy DSN
- [ ] Add backend DSN to Render env vars (`SENTRY_DSN`) for both dev and prod services
- [ ] Add frontend DSN to Vercel env vars once frontend Sentry SDK is wired in
- [ ] Trigger a test error locally, confirm it appears in the Sentry dashboard

## 7. Cross-check — dev environment fully wired
- [ ] Push a small change to `dev` branch → confirm Render dev service redeploys automatically
- [ ] Push a small change to `dev` branch → confirm Vercel preview deploys automatically
- [ ] Confirm dev frontend can successfully call dev backend (`NEXT_PUBLIC_API_URL` reachable, CORS not blocking)
- [ ] Confirm dev backend is reading from `gym-mms-dev` Supabase project (not prod) — sanity check by inserting a test row and confirming it appears in the correct Supabase project's table editor

## 8. Do NOT do yet (explicitly deferred)
- [ ] ~~Deploy `main`/production~~ — wait until Phase 1 features are built and tested in dev
- [ ] ~~Custom domain setup~~ — Phase 2
- [ ] ~~Cloudflare DNS~~ — only needed once you have a real domain to point somewhere

---

**Once every box above is checked**, you have a fully wired dev environment
— real database, real deployed backend, real deployed frontend, real error
tracking — ready for you to build features into via the branch/PR workflow.