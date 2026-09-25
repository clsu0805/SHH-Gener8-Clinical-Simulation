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

## Scoring rule

AECOPD v1.0 uses equal-weight scoring:

Score = (number of correctly completed questions / total scored questions) x 100

The current scored set contains 7 questions, so each question is worth 100 / 7 = 14.2857 points before final rounding. The API calculates the score from the raw learning events when a session is completed, and rounds the final score to 2 decimals.

Current scored questions:

- act1_lung_sound
- act1_cxr
- act1_medication
- act1_oxygen
- act2_lung_sound
- act2_abg
- act2_treatment

For multi-selection items, the question is counted as correct only after all required correct selections have been recorded. Wrong attempts do not deduct points under the current rule; they remain available in Learning_Events for learning-process analysis.
