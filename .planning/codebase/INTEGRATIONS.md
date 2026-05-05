# External Integrations

**Analysis Date:** 2026-05-05

## APIs & External Services

**Banking (mocked, no real provider):**
- Mock bank service - In-process generator, no HTTP egress
  - SDK/Client: none (pure Kotlin `Random`-seeded generator)
  - Implementation: `src/main/kotlin/com/rogerllina/sst/service/MockBankService.kt` (16 hard-coded Spanish merchants: Mercadona, Lidl, Repsol, TMB, Uber, McDonald's, Zara, Netflix, Booking.com, Endesa, etc.)
  - Exposed as: `GET /mock-bank/transactions`, `GET /mock-bank/accounts` via `MockBankController.kt`
  - Output shape: `BankTransaction { id, date, amount, currency, merchantName, mccCode, description }`, `BankAccount { id, name, iban, currency, balance }`
  - Auth: none

**Carbon footprint scoring:**
- Climatiq API - Planned but **not yet implemented**. No HTTP client, SDK, or env var exists in repo.
- Current implementation: local MCC-to-CO2 lookup table seeded via Flyway migration `src/main/resources/db/migration/V4__seed_mcc_scores.sql` (19 rows, e.g. `5411 Supermarket → 0.21 kg CO2/EUR, ESG 72`); served by `src/main/kotlin/com/rogerllina/sst/service/EsgScoringService.kt` with a fallback row (`co2PerEur=0.5000, esgScore=50`) for unknown MCCs.

**API Documentation:**
- springdoc-openapi 2.8.8 - Auto-generated OpenAPI 3 + Swagger UI
  - Configured in: `src/main/kotlin/com/rogerllina/sst/config/SwaggerConfig.kt` (title "Sustainable Spending Tracker API", version `1.0.0`)
  - Endpoints: `/api-docs` (JSON), `/swagger-ui.html` (UI)

## Data Storage

**Databases:**
- PostgreSQL (production)
  - Connection: `${DATABASE_URL:jdbc:postgresql://localhost:5432/sst}`, `${DB_USER:sst}`, `${DB_PASS:sst}` in `.worktrees/feature-backend/src/main/resources/application.yml`
  - Driver: `org.postgresql:postgresql` (runtimeOnly, BOM-managed)
  - Client: Spring Data JPA + Hibernate (`spring-boot-starter-data-jpa`)
  - Schema: Flyway-managed (`V1__create_accounts.sql`, `V2__create_mcc_scores.sql`, `V3__create_transactions.sql`, `V4__seed_mcc_scores.sql`)
  - Tables: `accounts` (UUID PK, IBAN, balance), `mcc_scores` (mcc_code PK, co2_per_eur, esg_score), `transactions` (UUID PK, FKs to accounts + mcc_scores, indexed on date/category/esg_score)
  - Hibernate `ddl-auto: validate` — schema is owned exclusively by Flyway

- H2 (test only, PostgreSQL compatibility mode)
  - Connection: `jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE` in `.worktrees/feature-backend/src/main/resources/application-test.yml`
  - Used by: `@SpringBootTest` slice in `src/test/kotlin/com/rogerllina/sst/SstApplicationTests.kt`

**File Storage:**
- Local filesystem only (no S3/GCS/Azure Blob). No file uploads handled.

**Caching:**
- None. No Redis, Caffeine, or `@Cacheable` usage.

## Authentication & Identity

**Auth Provider:**
- None implemented yet. OAuth 2.0 (Google/GitHub) is planned per project `CLAUDE.md` but not present in code.
- No `spring-boot-starter-security`, `spring-security-oauth2-client`, or `…-resource-server` in `build.gradle.kts`.
- All endpoints currently public, including `POST /api/admin/seed` (`AdminController.kt`).

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Rollbar, etc.).

**Health/Metrics:**
- Spring Boot Actuator (`spring-boot-starter-actuator`) — default endpoints exposed at `/actuator/health`, `/actuator/info`. No custom indicators or Micrometer registry configured.

**Logs:**
- Default Spring Boot Logback (console). `spring.jpa.show-sql: false`. No structured logging or external log shipper.

## CI/CD & Deployment

**Hosting:**
- Not yet deployed. Target per `CLAUDE.md`: Railway or Fly.io with Docker.

**CI Pipeline:**
- None. No `.github/workflows/`, no `Dockerfile`, no `fly.toml` or `railway.json` in repo.

## Environment Configuration

**Required env vars (production):**
- `DATABASE_URL` - JDBC URL for PostgreSQL
- `DB_USER` - DB username
- `DB_PASS` - DB password

**Optional / future (planned, not wired):**
- Climatiq API key (when integration lands)
- OAuth client IDs/secrets for Google + GitHub

**Secrets location:**
- No `.env`, `.env.local`, or secrets file present. Dev defaults are inlined as Spring placeholder fallbacks in `application.yml`. Production secrets expected to be injected by host platform (Railway/Fly.io).

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None. No external HTTP egress in the codebase (`MockBankService` is purely in-process; no `RestTemplate` / `WebClient` / `HttpClient` instantiated anywhere).

## REST Endpoint Inventory

Implemented in `.worktrees/feature-backend/`:
- `GET /api/accounts` - `AccountController.kt`
- `GET /api/transactions` (paginated, filterable) - `TransactionController.kt`
- `GET /api/dashboard/summary` - `DashboardController.kt`
- `POST /api/admin/seed` - `AdminController.kt` (triggers `TransactionService.seed()` from mock bank data)
- `GET /mock-bank/transactions`, `GET /mock-bank/accounts` - `MockBankController.kt`
- `GET /actuator/health`, `GET /actuator/info` - Actuator
- `GET /api-docs`, `GET /swagger-ui.html` - springdoc-openapi

## CORS

Configured in `src/main/kotlin/com/rogerllina/sst/config/CorsConfig.kt`:
- Allowed origins: `http://localhost:5173` (Vite dev), `http://localhost:3000` (Next/CRA dev)
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Credentials: allowed
- Applied globally to `/**`

---

*Integration audit: 2026-05-05*
