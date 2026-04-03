# Contributing to Epsilon

Thanks for your interest in contributing to Epsilon 🚀

Epsilon is a block-based canvas application with a Turborepo setup:

* **Frontend** → Next.js (apps/web)
* **Backend** → Go (apps/api-golang)

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd epsilon-app
```

---

### 2. Start the database

We use Docker to provide a consistent local PostgreSQL instance.

```bash
yarn db:up
```

This runs the database defined in `docker-compose.yml`.

---

### 3. Run the application

```bash
yarn dev
```

This starts all apps (frontend + backend) using Turborepo.

---

## 📦 Project Structure

```text
apps/
  web/           → frontend (Next.js)
  api-golang/    → backend (Go)

packages/        → shared packages (if any)

docker-compose.yml → local infrastructure (PostgreSQL)
```

---

## 🧠 Backend Architecture (Go)

The backend follows a clean layered structure:

```text
handler → service → repository → database
```

* **handler** → HTTP layer
* **service** → business logic
* **repository** → data access
* **database** → (PostgreSQL / sqlc in future)

---

## 🔐 Environment Setup

If required:

```bash
cp .env.example .env
```

---

## 🧪 Development Commands

```bash
yarn dev         # run all apps
yarn db:up       # start database
yarn db:down     # stop database

yarn lint
yarn check-types
```

---

## 🤝 Contribution Guidelines

* Create a new branch for each feature/fix
* Keep PRs focused and minimal
* Follow existing folder structure and patterns
* Avoid mixing concerns across layers
* Ensure the app runs locally before submitting

---

## ⚠️ Notes

* Database runs via Docker — make sure it’s running before backend work
* Do not commit secrets or `.env` files
* If something is unclear, open an issue or discussion

---

This guide will evolve as the project grows.
