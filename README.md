# Event Management System (MERN)

Admin/multi-profile event manager with full timezone-aware create/view/update and a
timezone-aware update-log history, built per the assignment spec (`asign.pdf`).

## Stack
- **Frontend:** React 19 (Vite) + Zustand + vanilla CSS + `dayjs`
- **Backend:** Express + TypeScript + Mongoose
- **Database:** MongoDB

## Prerequisites
- **Node.js ≥ 20** and npm (check with `node -v`)
- **MongoDB** running and reachable. Any one of:
  - Local `mongod`
  - Docker: `docker run -d --name event-mgmt-mongo -p 27017:27017 mongo:7`
  - MongoDB Atlas (use its connection string as `MONGO_URI`)

## Project Structure
```
server/   Express + TypeScript API (models, controllers, services, routes, middleware)
client/   React (JS) + Zustand + vanilla CSS
```

## Quick Start
Run these in **two terminals** (backend + frontend). MongoDB must be running first.

**1. Start MongoDB** (skip if you already have one running):
```bash
docker run -d --name event-mgmt-mongo -p 27017:27017 mongo:7
```

**2. Backend** (terminal 1):
```bash
cd server
npm install
npm run dev
```
API comes up on **http://localhost:5000**. Verify: open
**http://localhost:5000/api/health** — it should return `{"status":"ok","db":"up"}`.

**3. Frontend** (terminal 2):
```bash
cd client
npm install
npm run dev
```
Open the app at **http://localhost:5173**.

> The defaults work out of the box against a local MongoDB on port 27017 — no `.env`
> file is strictly required for local dev. Create one only to override defaults
> (see below).

## Configuration (optional)

### Server (`server/.env`)
Copy the example and edit as needed:
```bash
# macOS/Linux
cp .env.example .env
# Windows (PowerShell)
copy .env.example .env
```

| Variable                | Default                                          | Description                                  |
|-------------------------|--------------------------------------------------|----------------------------------------------|
| `NODE_ENV`              | `development`                                    | `development` \| `test` \| `production`      |
| `PORT`                  | `5000`                                           | HTTP port                                    |
| `MONGO_URI`             | `mongodb://127.0.0.1:27017/event-management`     | MongoDB connection string                    |
| `CLIENT_ORIGIN`         | `*`                                              | CORS origin(s); `*` or comma-separated list  |
| `RATE_LIMIT_WINDOW_MS`  | `900000`                                         | Rate-limit window (ms)                       |
| `RATE_LIMIT_MAX`        | `300`                                            | Max requests per window per IP               |

The server **validates its environment on startup** and exits with a clear message if anything is invalid.

### Client (`client/.env`)
```bash
cp .env.example .env    # copy .env.example .env  on Windows
```
| Variable        | Default                        | Description                        |
|-----------------|--------------------------------|------------------------------------|
| `VITE_API_URL`  | `http://localhost:5000/api`    | Base URL of the backend API        |

## Available Scripts

### Server (`cd server`)
| Command                              | What it does                                             |
|--------------------------------------|----------------------------------------------------------|
| `npm run dev`                        | Start API in watch mode (`tsx`, hot reload)              |
| `npm run build`                      | Compile TypeScript to `dist/`                            |
| `npm start`                          | Run the compiled server (`node dist/server.js`)          |
| `npm run typecheck`                  | Type-check without emitting (`tsx` does not type-check)  |
| `npm run migrate:remove-event-title` | One-off data migration: purge the deprecated `title` field from existing event docs |

### Client (`cd client`)
| Command           | What it does                          |
|-------------------|---------------------------------------|
| `npm run dev`     | Start Vite dev server (port 5173)     |
| `npm run build`   | Production build to `dist/`           |
| `npm run preview` | Preview the production build          |
| `npm run lint`    | Lint with oxlint                      |

## Production Build
```bash
# Backend
cd server && npm install && npm run build && npm start
# Frontend
cd client && npm install && npm run build && npm run preview
```

## API Overview
| Method | Route                        | Description                    |
|--------|-------------------------------|---------------------------------|
| GET    | /api/health                  | Liveness + DB connectivity (503 if DB down) |
| GET    | /api/profiles                | List profiles                  |
| POST   | /api/profiles                | Create a profile                |
| PATCH  | /api/profiles/:id/timezone   | Update a profile's timezone     |
| GET    | /api/events                  | List events (`?profileId=`, `?page=`, `?limit=`) |
| POST   | /api/events                  | Create an event for 1+ profiles |
| PUT    | /api/events/:id               | Update an event (diff-logged)   |
| GET    | /api/events/:id/logs          | Get an event's update history   |

`GET /api/events` returns a **paginated envelope**: `{ items, page, limit, total, totalPages }`.

## Design Notes
- **Timestamps stored in UTC**, converted to the requested timezone only at
  render/log time (`dayjs` + `utc`/`timezone` plugins on both client and server).
  This avoids any drift or ambiguity from storing "local" wall-clock times.
- **Update logging** is diff-based: on every `PUT /api/events/:id`, the previous and
  new values for `profiles`, `timezone`, `startAt`, and `endAt` are compared and only
  changed fields are appended to `updateLogs`. Profile-set comparison uses a
  **Set-based symmetric difference** (`O(n + m)`) instead of a nested-loop compare
  (`O(n * m)`), so diffing scales linearly with the number of assigned profiles.
- **Validation**: end date/time must not be before start date/time, evaluated in UTC
  after converting both wall-clock inputs through the selected timezone.
- Backend uses TypeScript with a centralized `AppError` + `errorHandler` middleware
  and an `asyncHandler` wrapper so every route's rejected promises are funneled
  through one place instead of repeated try/catch blocks.
- **Request validation** is schema-driven with Zod (`src/schemas`) applied via a
  `validate()` middleware, so malformed input (bad ObjectId, unknown timezone,
  missing fields) returns a clean `400` instead of crashing into the `500` handler.
  The `errorHandler` maps Zod, Mongoose `CastError`/`ValidationError`, and `AppError`
  to appropriate status codes, and never leaks internal error text in production.
- **Business logic lives in a service layer** (`src/services`) that controllers call,
  keeping routes/controllers thin and making the API easy to extend or unit-test.
- **Diff-based update logging is data-driven**: the fields tracked in an event's
  history are declared in one `DIFF_FIELDS` table — adding a new tracked field is a
  single entry, no new branching.
- **Production middleware**: `helmet` (security headers), `express-rate-limit`
  (per-IP throttling), `morgan` (request logging), a JSON body-size limit, and a
  configurable CORS allowlist.
- **Operational safety**: env vars validated on boot, a DB-aware `/api/health`,
  MongoDB connection-event logging with a bounded pool, and **graceful shutdown**
  on `SIGTERM`/`SIGINT` (drains requests, closes the DB, then exits).
- **Client resilience**: 15s request timeout with friendly network-error messages,
  loading states, a retryable error banner, and a double-submit guard so rapid
  repeated clicks create exactly one entry.
- Frontend has no backend-agnostic state: all reads/writes go through the Express
  API via Zustand actions — nothing is persisted to `localStorage`.
