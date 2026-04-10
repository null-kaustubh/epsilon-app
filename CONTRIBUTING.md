# Contributing to Epsilon

Thanks for your interest in contributing to Epsilon 🚀

Epsilon is a block-based canvas application with a Turborepo monorepo:

- **Frontend** → Next.js (`apps/web`)
- **Backend** → Go (`apps/api-golang`)
- **Database** → PostgreSQL (via Docker)

---

## 📋 Prerequisites

Make sure you have the following installed on your machine before getting started:

| Tool                  | Version | Purpose                         | Install                                                                                                |
| --------------------- | ------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Node.js**           | >= 18   | JavaScript runtime              | [nodejs.org](https://nodejs.org)                                                                       |
| **Yarn**              | 1.22.x  | Package manager                 | `npm install -g yarn`                                                                                  |
| **Go**                | 1.26+   | Backend language                | [go.dev/dl](https://go.dev/dl)                                                                         |
| **Docker**            | Latest  | Runs PostgreSQL locally         | [docker.com](https://www.docker.com/get-started)                                                       |
| **golang-migrate**    | Latest  | Database migrations CLI         | [github.com/golang-migrate/migrate](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate) |
| **sqlc**              | Latest  | Generates type-safe Go from SQL | [sqlc.dev](https://sqlc.dev)                                                                           |
| **psql** _(optional)_ | Latest  | Inspect the local database      | Comes with [PostgreSQL client tools](https://www.postgresql.org/download/)                             |

> **Note:** `psql` is **not required** since the database runs on Docker. Install it only if you want to manually inspect or query the local database (e.g., `psql postgres://postgres:postgres@localhost:5432/epsilon`).

### Quick install cheatsheet

```bash
# golang-migrate (macOS)
brew install golang-migrate

# golang-migrate (Windows / Go install)
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# sqlc
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
# or: brew install sqlc
```

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd epsilon-app
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

This creates a `.env.local` file with the default database URL and port. The scripts read from `.env.local` automatically.

### 4. Start the database

```bash
yarn db:up
```

This spins up a PostgreSQL 16 container via Docker Compose.

### 5. Run database migrations & generate code

```bash
yarn db:sync
```

This single command runs **three steps** in sequence:

1. **`yarn db:migrate`** — applies all migration files from `apps/api-golang/internal/db/migrations/`
2. **`yarn db:schema`** — dumps the current schema to `apps/api-golang/internal/db/schema/schema.sql` (uses `pg_dump`)
3. **`yarn db:generate`** — runs `sqlc generate` to produce type-safe Go code in `apps/api-golang/internal/db/sqlc/`

> You can also run each step individually if needed.

### 6. Load seed data (first-time setup)

```bash
yarn db:seed
```

This populates the database with demo users, a sample space, and a few blocks so you can start exploring immediately.

| Email                     | Password       |
| ------------------------- | -------------- |
| `demo@epsilon.dev`        | `Demo1234!`    |
| `contributor@epsilon.dev` | `Contrib1234!` |

> This is idempotent — running it again will skip if the data already exists.

### 7. Start the application

```bash
yarn dev
```

This starts **all apps** (frontend + backend) concurrently using Turborepo.

- **Frontend** → [http://localhost:3000](http://localhost:3000)
- **Backend** → [http://localhost:8080](http://localhost:8080)

---

## 📦 Project Structure

```text
apps/
  web/             → frontend (Next.js)
  api-golang/      → backend (Go)
    internal/
      db/
        migrations/  → SQL migration files (golang-migrate)
        queries/     → SQL query files (sqlc)
        schema/      → dumped schema (pg_dump)
        sqlc/        → generated Go code (sqlc)
      handler/       → HTTP handlers
      service/       → business logic
      repository/    → data access layer
      middleware/    → middleware (auth, CORS, etc.)
      router/        → route definitions
      config/        → app configuration

packages/          → shared packages (if any)

docker-compose.yml → local infrastructure (PostgreSQL)
turbo.json         → Turborepo pipeline config
```

---

## 🧠 Backend Architecture (Go)

The backend follows a clean layered structure:

```text
handler → service → repository → database (sqlc)
```

- **handler** → HTTP layer (request/response)
- **service** → business logic
- **repository** → data access via sqlc-generated code
- **database** → PostgreSQL with sqlc for type-safe queries

---

## 🗃️ Database Workflow

All database commands are available from the **root** `package.json`:

| Command            | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `yarn db:up`       | Start the PostgreSQL Docker container                       |
| `yarn db:down`     | Stop the PostgreSQL Docker container                        |
| `yarn db:migrate`  | Apply all pending migrations                                |
| `yarn db:schema`   | Dump current DB schema to `schema.sql` (requires `pg_dump`) |
| `yarn db:generate` | Run `sqlc generate` to create Go code from SQL queries      |
| `yarn db:seed`     | Load demo users, a sample space, and blocks into the DB     |
| `yarn db:sync`     | Run migrate → schema → generate (all three in sequence)     |
| `yarn db:reset`    | Tear down DB, restart container, and re-sync everything     |

### Adding a new migration

```bash
# Create a new migration pair (requires golang-migrate CLI)
migrate create -ext sql -dir apps/api-golang/internal/db/migrations -seq <migration_name>
```

This creates `up` and `down` SQL files. Write your schema changes, then run `yarn db:sync`.

### Adding a new query

1. Add a `.sql` file in `apps/api-golang/internal/db/queries/`
2. Use [sqlc query annotations](https://docs.sqlc.dev/en/latest/howto/select.html) (e.g., `-- name: GetUser :one`)
3. Run `yarn db:generate` to regenerate Go code

---

## 🔐 Environment Setup

The project uses `.env.local` for local development:

```bash
cp .env.example .env.local
```

Default values in `.env.example`:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/epsilon?sslmode=disable
PORT=8080
```

> **Never commit** `.env.local` or any file containing secrets.

---

## 🧪 Development Commands

```bash
# Application
yarn dev              # start all apps (frontend + backend)
yarn build            # build all apps
yarn lint             # lint all apps
yarn check-types      # type-check frontend

# Database
yarn db:up            # start database
yarn db:down          # stop database
yarn db:seed          # load demo data (first-time setup)
yarn db:sync          # migrate + schema dump + sqlc generate
yarn db:reset         # full database reset

# Formatting
yarn format           # run prettier on ts, tsx, md files
```

---

## 🤝 Contribution Guidelines

- Create a new branch for each feature/fix
- Keep PRs focused and minimal
- Follow existing folder structure and patterns
- Avoid mixing concerns across layers (handler/service/repository)
- Run `yarn db:sync` after any migration or query changes
- Ensure the app runs locally before submitting

---

## ⚠️ Notes

- **Docker must be running** before starting the database or backend
- The database runs in Docker — you do **not** need PostgreSQL installed locally
- If you want to inspect the DB manually, install `psql` and connect with: `psql postgres://postgres:postgres@localhost:5432/epsilon`
- `yarn db:schema` requires `pg_dump` (part of PostgreSQL client tools) to be available on your PATH
- Do not commit secrets or `.env.local` files
- If something is unclear, open an issue or discussion

---

This guide will evolve as the project grows.
