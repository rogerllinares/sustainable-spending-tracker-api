# Phase 01 — Frontend React + TypeScript
**Date:** 2026-05-06
**Status:** Context captured — ready for planning

---

## Domain

Build a professional React + TypeScript dashboard (Vite SPA) that connects to the existing Spring Boot backend, visualizes CO₂ / ESG data, and includes Google OAuth authentication end-to-end (frontend + Spring Security backend).

This is a portfolio piece for Clarity AI — quality and visual polish matter.

---

## Decisions

### Stack
- **Build tool:** Vite + React + TypeScript
- **Component library:** shadcn/ui + Tailwind CSS (Radix primitives under the hood)
- **Charts:** Recharts (SVG-based, composable)
- **Data fetching:** TanStack Query (React Query v5) — standard for this stack
- **Port:** localhost:5173 (CORS already configured on backend)

### Visual Design
- **Background:** `#F8FAF9` (off-white, slight green tint)
- **Primary:** `#16A34A` (green-600)
- **Accent:** `#4ADE80` (green-400, metric highlights)
- **Text:** `#111827` (gray-900)
- **Border:** `#E5E7EB` (gray-200)
- **ESG badge color:** traffic-light (green/amber/red based on score)
- **Hero:** White cards, large CO₂ number in primary green, ESG score with semaphore badge

### Authentication
- **Approach:** Google OAuth — full stack (frontend + backend)
- **Frontend flow:** `@react-oauth/google` library → user clicks login → Google OAuth redirect → callback → JWT token stored in memory (not localStorage) → Bearer token on all API calls
- **Backend:** Spring Security OAuth2 Resource Server — validates Google JWT on every protected endpoint. All `/api/**` routes require authentication (except `/api/admin/seed` which stays open for demo purposes)
- **Login page:** `/login` route with "Sign in with Google" button. Redirect to `/dashboard` after auth.
- **Protected routes:** `/dashboard` and all sub-routes require auth. Redirect unauthenticated users to `/login`.

### Pages & Components

**Pages:**
- `/login` — Google OAuth button, ESG branding
- `/dashboard` — main view (hero + chart + table)

**Hero metrics (top of dashboard):**
- Total CO₂ (kg) — last 6 months
- Average ESG score — with semaphore color
- Top polluting category

**Chart:**
- Monthly CO₂ trend bar chart (Recharts BarChart)
- X-axis: month names, Y-axis: CO₂ kg
- Green bars, rounded tops

**Transactions table:**
- Columns: Date, Description, Category, Amount (€), CO₂ (kg), ESG Score
- Filters: category dropdown, date range (from/to), ESG score range (min/max)
- Pagination (matches backend `PagedResponseDto`)
- ESG score displayed as colored badge

### Backend Changes Required
The backend needs Spring Security added:
- Add `spring-boot-starter-security` + `spring-boot-starter-oauth2-resource-server`
- Configure Google as OIDC provider (validates `iss`, `aud`, `exp` from Google JWT)
- Protect `/api/**` (except seed endpoint)
- Add `google.client-id` to `application.yml` (from Google Cloud Console OAuth app)

---

## Canonical Refs

- `sst/.planning/codebase/ARCHITECTURE.md` — backend architecture, entity model
- `sst/.planning/codebase/STACK.md` — current stack decisions
- `sst/.planning/codebase/CONVENTIONS.md` — naming and code conventions
- `sst/SESSION_HANDOFF.md` — all backend endpoints, response shapes, CORS config
- `sst/src/main/resources/application.yml` — config to extend with OAuth2

---

## Code Context (Reusable from Backend)

- CORS already allows `localhost:5173` — no changes needed
- Backend endpoints and response shapes defined in `SESSION_HANDOFF.md`
- `PagedResponseDto<T>` has `content[]`, `page`, `size`, `totalElements`, `totalPages`
- `DashboardSummaryDto` has `totalCo2Kg`, `avgEsgScore`, `monthlyTrend[]` (month + co2Kg)
- `CategorySummaryDto` has `category`, `totalCo2Kg`, `avgEsgScore`, `transactionCount`
- `TransactionDto` has `id`, `date`, `description`, `category`, `amountEur`, `co2Kg`, `esgScore`

---

## Deferred Ideas

- Dark mode toggle — future phase
- Mobile responsive layout — future phase
- GitHub OAuth (second provider) — future phase
- Real bank integration (PSD2/Plaid) — separate phase
- Export to PDF/CSV — future phase
