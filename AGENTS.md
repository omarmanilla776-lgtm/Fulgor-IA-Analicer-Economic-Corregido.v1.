# Base44 sandbox notes — Fulgor IA Analicer Economic

## How the app runs here

- One container, one Node process: `npm run dev` runs `tsx server.ts`. Express serves `/api/*` and
  mounts the **Vite dev server in middleware mode** for the UI, so frontend and API both answer on
  port 3000 (the preview's host port). There is no separate frontend build in dev.
- `docker-compose.base44.yml` bind-mounts the repo at `/app` and runs `npm install --no-audit --no-fund`
  before starting, so a dependency change is picked up by recreating the service:
  `docker compose -f docker-compose.base44.yml up -d`.
- The repo ships `bun.lock`, but neither the README nor CI uses Bun and there is no `package-lock.json`;
  npm (as CI does) is the supported install path here.
- `tsx server.ts` does not watch files. Frontend edits are served fresh by Vite on reload, but backend
  edits (`server.ts`) need `docker compose -f docker-compose.base44.yml restart app`.
- `NODE_ENV` must not be `production`: that mode serves a prebuilt `dist/` and breaks the edit loop.
- Vite's dev-server host check needs the preview host, so compose passes
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` through (Vite >= 6.1 appends it to `server.allowedHosts`).
  Never set `DISABLE_HMR=true`: it also disables the file watcher, so Vite would keep serving stale modules.
- `server.ts` sends `X-Frame-Options: DENY`; the preview proxy rewrites iframe-related response headers,
  so the app still embeds in the preview. Don't weaken that header for sandbox reasons.

## Environment and secrets

- The app boots with no secrets. `GEMINI_API_KEY` only affects `POST /api/copilot/chat`; without it the
  server answers with an explicit "no verified data" message. `FULGOR_API_KEY` (>= 32 chars) unlocks the
  protected `/api/v1/*` and legacy `/api/*` routes; without it they answer 503.
- The Copilot drawer and API Explorer therefore show honest "auth required / not configured" states on
  this branch. That is intended demo behavior (the browser must never hold `FULGOR_API_KEY`), not a
  broken setup.
- External secrets arrive in `/run/base44/app.env`, the **last** `env_file:` entry so dashboard values
  always win. Never move them under `environment:` and never let browser code hold them.
- `dotenv.config()` would read a repo-root `.env` if present; the container environment alone is enough
  and `.env` is gitignored.
- `TRUST_PROXY` stays unset, so the public feed's 30 requests/minute limit is keyed on the proxy address
  and is effectively shared by everyone reaching the sandbox preview.

## Verifying it works

- `curl -s http://localhost:3000/api/health` → `{"status":"ok",...}`.
- The served HTML must contain `/@vite/client`; that proves the Vite dev server, not a prebuilt bundle.
- The container healthcheck probes both `/api/health` and `/` (HTML containing `id="root"`).
- `curl -s -m 25 http://localhost:3000/api/public/world-bank` → live World Bank Open Data payload with
  `status: WORLD_BANK_DATA_RETRIEVED` (needs sandbox egress). A `502` with an explicit error message is
  the honest upstream-failure path; the app never substitutes invented figures.
- Run the checks CI runs inside the container:
  `docker compose -f docker-compose.base44.yml exec -T app npm run check` (lint + audit + build).

## Known, pre-existing

- At 375px width the header demo banner/ticker makes the document ~43px wider than the viewport
  (horizontal scroll). Unrelated to the sandbox setup.
