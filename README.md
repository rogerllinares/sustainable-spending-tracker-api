# Sustainable Spending Tracker (SST)

Portfolio app — connects bank transactions and computes per-purchase CO₂ footprint and ESG score. Built as a portfolio piece for Clarity AI.

## Live

- **Frontend:** https://sst-frontend-steel.vercel.app
- **API:** https://sst-api-hxmn.onrender.com (Swagger: `/swagger-ui.html`)
- **DB:** Supabase Postgres (eu-central-1, pooler `aws-1-eu-central-1`)

> Render free tier sleeps after 15 min idle — first request after a cold start takes ~50s.

## Stack

- **Backend:** Kotlin · Spring Boot 3.5 · PostgreSQL · Flyway · TDD with MockK
- **Frontend:** React 18 · TypeScript · Vite · Tailwind · shadcn/ui · Recharts · TanStack Query
- **Auth:** Mock login form (portfolio demo). Architecture is OAuth-ready — see *Possible improvements*.
- **Infra:** Docker · Vercel (frontend) · Render (backend) · Supabase (DB)

## Screenshots

![Dashboard](docs/screenshots/sst-dashboard-prod.png)

## Run locally

1. **Backend:**
   ```bash
   docker-compose up
   ```
   (or `./gradlew bootRun` with a local Postgres on `:5432`)

2. **Seed mock data:**
   ```bash
   curl -X POST http://localhost:8080/api/admin/seed
   ```

3. **Frontend:**
   ```bash
   cd sst-frontend
   npm install
   npm run dev
   ```

4. Open http://localhost:5173 → enter any name + email → explore the dashboard.

## API

Swagger UI: http://localhost:8080/swagger-ui.html

Key endpoints:

| Endpoint | Description |
|---|---|
| `POST /api/admin/seed` | Seeds 90 mock transactions (6 months) |
| `GET /api/dashboard/summary` | Total CO₂, avg ESG, monthly trend |
| `GET /api/dashboard/categories` | CO₂/ESG breakdown by category |
| `GET /api/transactions` | Paginated list with filters: `category`, `dateFrom`, `dateTo`, `minScore`, `maxScore`, `page`, `size` |

## Project structure

```
sst/
├── src/main/kotlin/com/rogerllina/sst/   ← Backend (controllers, services, repos, JPA)
├── src/main/resources/db/migration/       ← Flyway V1–V4
├── sst-frontend/                          ← React + TS dashboard
│   ├── src/api/                           ← axios + React Query hooks
│   ├── src/auth/                          ← AuthContext + ProtectedRoute
│   ├── src/components/                    ← Hero, TrendChart, TransactionsTable, EsgBadge, shadcn/ui
│   └── src/pages/                         ← LoginPage, DashboardPage
├── docker-compose.yml
└── Dockerfile                             ← multi-stage build
```

## Possible improvements

- **Real auth:** replace the mock login form with OAuth (Google, GitHub). The `AuthContext` and Bearer interceptor are already wired — only `LoginPage` and a backend Spring Security Resource Server need swapping in. The plan is to port the OAuth flow from the `Apostes Automatitzades` project once that ships.
- Make `POST /api/admin/seed` idempotent (currently duplicates on repeated calls).
- Move dashboard aggregation from in-memory to SQL `GROUP BY`.
- Dark mode toggle + mobile-first responsive review.
- Code-split Recharts bundle (currently ~676KB gzipped).
