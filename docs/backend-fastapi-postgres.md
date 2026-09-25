# Gener8 FastAPI + PostgreSQL

## Architecture

Gener8 Frontend -> FastAPI -> PostgreSQL -> Gener8 Dashboard -> Excel / Power BI

GitHub Pages continues to host the static frontend and dashboard. FastAPI and PostgreSQL must be deployed separately on an HTTPS host.

## Local start

1. Copy `backend/.env.example` to `backend/.env` and change passwords/tokens.
2. From the repository root run:

```bash
docker compose up -d --build
```

3. Health check:

```text
http://localhost:8000/health
```

4. Open the Dashboard and save the API base URL. For local testing use `http://localhost:8000`.

## Core tables

- `sessions`: Team session, scenario/version, start/end, duration, score/completion.
- `participants`: member number, profession, role.
- `learning_events`: answer order, selected option, correctness, attempt count, elapsed milliseconds.
- `satisfaction`: five Likert items and average.
- `scenarios`: scenario registry for future AECOPD / Sepsis / CHF expansion.

## API routes

- `POST /api/v1/sessions`
- `POST /api/v1/sessions/{id}/events`
- `POST /api/v1/sessions/{id}/satisfaction`
- `POST /api/v1/sessions/{id}/complete`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/sessions`
- `GET /api/v1/dashboard/question-stats`
- `GET /api/v1/export/excel`
- `GET /health`

## Production deployment requirements

- PostgreSQL persistent volume or managed PostgreSQL.
- HTTPS for FastAPI.
- Set `CORS_ORIGINS=https://clsu0805.github.io`.
- Change the default PostgreSQL password and `ADMIN_TOKEN`.
- Add authentication/authorization before using real learner data.
- Add backups, database migrations, audit logging, and hospital-approved privacy/security controls before production use.

## Current scoring note

The API intentionally does not invent a total-score rule. It stores detailed question events and can calculate a formal score after the educational scoring policy is defined. This avoids treating eventual-correct answers, first-attempt correctness, and retry penalties as if they were equivalent.
