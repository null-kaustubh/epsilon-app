# Epsilon

Epsilon is a block-based workspace for notes, canvases, and lightweight project boards. Users authenticate, create **spaces**, and arrange **blocks** (text, markdown, images, code, todos) on a drag-and-drop canvas.

This repository is a **Turborepo monorepo**: a Next.js frontend, a Go REST API, PostgreSQL, and shared packages.

## Architecture

```text
┌─────────────────┐     credentials + cookies      ┌──────────────────┐
│  apps/web       │ ─────────────────────────────► │  apps/api-golang │
│  Next.js 16     │         REST / JSON            │  Go 1.26         │
└─────────────────┘                                └────────┬─────────┘
                                                              │
                                                              ▼
                                                    ┌──────────────────┐
                                                    │  PostgreSQL 16   │
                                                    │  (Docker local)  │
                                                    └──────────────────┘
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Frontend | `apps/web` | UI, canvas, auth pages, route protection (`proxy.ts`) |
| API | `apps/api-golang` | Auth, spaces, blocks, sessions, OAuth |
| Data | `apps/api-golang/internal/db` | Migrations (golang-migrate), queries (sqlc) |
| Emails | `packages/emails` | React Email templates + local render service |

Backend pattern: **handler → service → repository → sqlc**.

## Prerequisites

| Tool | Version | Notes |
|------|---------|--------|
| Node.js | ≥ 18 | Frontend and tooling |
| Yarn | 1.22.x | Package manager |
| Go | 1.26+ | API server |
| Docker | Latest | Local PostgreSQL |
| golang-migrate | Latest | `yarn db:migrate` |
| sqlc | Latest | `yarn db:generate` |

Optional: `pg_dump` (for `yarn db:schema`), `psql` (manual DB inspection).

See [CONTRIBUTING.md](CONTRIBUTING.md) for install commands.

## Quick start

```bash
git clone <repo-url>
cd epsilon-app
yarn install

# Environment (split by app — no secrets at repo root)
cp apps/api-golang/.env.example apps/api-golang/.env.local
cp apps/web/.env.example apps/web/.env.local

# Database
yarn db:up
yarn db:sync
yarn db:seed   # optional demo data

# Run frontend + API + email render service
yarn dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:8080 |
| API health | http://localhost:8080/health |
| Swagger (dev only) | http://localhost:8080/swagger/ |
| Email render | http://localhost:3001 |

## Environment variables

Configuration is **per application**, not in a single root `.env.local`.

| File | Copy to | Contains |
|------|---------|----------|
| [`apps/api-golang/.env.example`](apps/api-golang/.env.example) | `.env.local` (dev) or `.env` (server) | `DATABASE_URL`, OAuth, Resend, `ENV`, URLs |
| [`apps/web/.env.example`](apps/web/.env.example) | `.env.local` | `NEXT_PUBLIC_API_URL`, `API_URL`, public assets |
| [`.env.example`](.env.example) | — | Documentation pointer only |

Root scripts (`yarn db:migrate`, `yarn db:seed`) read **`apps/api-golang/.env.local`**.

### Production checklist

Set on the server (e.g. EC2) in `apps/api-golang/.env` or via systemd `EnvironmentFile`:

- `ENV=production`
- `DATABASE_URL` with TLS (`sslmode=require`)
- `FRONTEND_URL`, `BACKEND_URL` (HTTPS)
- `COOKIE_SECURE=true`, `TRUST_PROXY=true` (behind reverse proxy)
- OAuth and `RESEND_API_KEY`
- `EMAIL_RENDER_URL` pointing to an **internal** email render service (not public internet)

Do **not** run `yarn db:seed` in production.

## Development commands

```bash
yarn dev              # web + api + email render (parallel)
yarn build            # production build (all workspaces)
yarn lint             # ESLint across monorepo
yarn check-types      # TypeScript (web)

yarn db:up            # start Postgres container
yarn db:migrate       # apply migrations
yarn db:generate      # sqlc codegen
yarn db:sync          # migrate + schema dump + generate
yarn db:seed          # demo users/spaces (dev only)
yarn db:reset         # destroy and recreate local DB
yarn format           # Prettier
```

## Project structure

```text
apps/
  web/                 # Next.js frontend
  api-golang/          # Go REST API
    cmd/server/        # entrypoint
    internal/
      handler/         # HTTP handlers
      service/         # business logic
      repository/      # data access
      middleware/      # auth, CORS, rate limit, security headers
      db/migrations/   # SQL migrations
packages/
  ui/                  # shared React components
  emails/              # email templates + render server
docker-compose.yml     # local PostgreSQL
turbo.json             # Turborepo pipeline
.github/workflows/     # CI (lint, typecheck, audit)
```

## Authentication

- **Session cookies** (`session_id`), HttpOnly, server-side storage in Postgres
- **Local** email/password (Argon2id)
- **OAuth** Google and GitHub
- Protected routes on the web app via `apps/web/proxy.ts`

## CI

On push/PR to `main` or `dev`, [`.github/workflows/security.yml`](.github/workflows/security.yml) runs:

- `yarn workspace web lint` (zero warnings)
- `yarn workspace web check-types`
- `go vet` / `go build`
- `yarn audit` and `govulncheck` (informational)

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup, database workflow, and contribution guidelines.

## License

Private / project-specific — see repository settings for license terms.
