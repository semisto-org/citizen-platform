# CLAUDE.md — Villages Nourriciers / Citizen Platform

## Project Overview

Citizen mapping platform for Belgium ("Villages Nourriciers"). Citizens map hedgerows, trees, and planting spots on an interactive Mapbox map, validate contributions, earn points/badges, and track village-level progress (levels 0–5).

**Stack:** Rails 8.1 API + React 19 / TypeScript / Vite 7 SPA (monorepo)

## Quick Reference

| Area | Detail |
|---|---|
| Ruby | 3.3 (see `.tool-versions`) |
| Rails | 8.1.2, API-only mode |
| Frontend | React 19 + TypeScript 5.9 + Vite 7 |
| Database | PostgreSQL |
| Auth | JWT (24h expiry), `Authorization: Bearer <token>` |
| Map | Mapbox GL JS |
| Package managers | Bundler (backend), npm (frontend) |
| Linter | RuboCop (`rubocop-rails-omakase`) |
| Deployment | Kamal |

## Development Setup

```bash
# Backend
bin/rails db:create db:migrate db:seed

# Frontend
cd frontend && npm install

# Start both servers (Rails on :3000, Vite on :5173)
bin/dev
```

Frontend `.env` requires `VITE_API_URL` and `VITE_MAPBOX_TOKEN` (see `frontend/.env.example`).

## Commands

```bash
# Lint
bin/rubocop           # Ruby style check
bin/rubocop -a        # Auto-fix

# Security
bin/brakeman --quiet  # Static analysis
bin/bundler-audit     # Gem vulnerability scan

# Full local CI
bin/ci                # Runs rubocop + brakeman + bundler-audit

# Frontend
cd frontend && npm run dev      # Dev server
cd frontend && npm run build    # Production build
cd frontend && npx eslint .     # Lint TypeScript/React
```

No test suite exists yet. Do not add test infrastructure unless asked.

## Architecture

### Backend (Rails API)

- **API namespace:** `api/v1` — all endpoints under `/api/v1/`
- **Controllers:** `app/controllers/api/v1/` — auth, dashboard, spots, users, villages
- **Auth:** JWT via `lib/json_web_token.rb`. `ApplicationController` enforces auth by default; controllers opt out with `skip_before_action :authorize_request`
- **Serialization:** Inline private methods per controller (e.g., `spot_json`, `village_summary`). No serializer gem.
- **CORS:** Wide-open (`origins "*"`) via `rack-cors`

### Frontend (React SPA)

- **Entry:** `frontend/src/main.tsx` → `App.tsx` (router + AuthProvider)
- **Pages:** `frontend/src/pages/` — one file per route
- **Components:** `frontend/src/components/` — shared UI
- **Types:** `frontend/src/types/index.ts` — all shared TypeScript types (centralized)
- **API client:** `frontend/src/lib/api.ts` — typed fetch wrapper with `ApiRequestError`
- **Auth hook:** `frontend/src/hooks/useAuth.ts` — Context + `useAuth()` hook, token in `localStorage`
- **Vite proxy:** `/api` requests forwarded to `localhost:3000` in dev

### Domain Model

```
Region (1) → (*) Village (1) → (*) Spot
                  Village (1) → (*) User
User (1) → (*) Spot (creator)
User (1) → (*) Contribution → Spot
Spot (1) → (*) Photo
User (*) ↔ (*) Badge (via UserBadge)
```

**Spot lifecycle:** `brouillon` → `soumis` → `validé` → `planté`
- 2 positive validations auto-promote `soumis` → `validé`

**Points:** submit=15, validation=5, correction=5, signalement=2

**User roles:** visiteur, membre, planteur, parrain, ambassadeur, admin

## Conventions

### Language
- **Domain terms, statuses, and user-facing strings are in French.** Maintain this. Examples: `brouillon`, `soumis`, `validé`, `planté`, `signalement`.
- Code identifiers (variable names, method names) are in English or French depending on domain proximity. Follow existing patterns.

### Backend
- Follow `rubocop-rails-omakase` style (no custom overrides)
- Controllers return JSON with appropriate HTTP status codes
- Model status transitions via bang methods (`spot.submit!`, `spot.check_validation!`)
- Named scopes preferred for query filtering (`published`, `by_village`, `by_type`, `nearby`)
- Callbacks for side effects (`after_create` on Contribution)

### Frontend
- All types in `types/index.ts`, all API calls in `lib/api.ts`
- `const` objects with `as const` for enum-like domain values
- Functional components with hooks
- No component library — custom CSS (Tailwind-style utility classes in `index.css`)

## CI/CD

GitHub Actions runs on PRs and pushes to `main`:
1. `scan_ruby` — brakeman + bundler-audit
2. `lint` — rubocop

No frontend CI step. No automated tests in CI.
