# Codebase Concerns

**Original analysis:** 2026-05-05 · **Refreshed:** 2026-06-15

> Snapshot of known technical debt and conscious limitations in the current `master` tree. This list is kept deliberately as portfolio/interview material — it documents trade-offs made on purpose (mock auth, in-memory dashboard aggregation, single-tenant model) rather than hiding them. File paths are relative to the repo root.

## Tech Debt

**No global exception handler:**
- Issue: Services throw `IllegalStateException`, `NoSuchElementException`, raw exceptions; no `@RestControllerAdvice` translates them to proper HTTP statuses with structured error bodies. Clients receive default Spring Boot whitelabel 500s instead of 404/400 with JSON.
- Files: `src/main/kotlin/com/rogerllina/sst/service/TransactionService.kt:41`, `src/main/kotlin/com/rogerllina/sst/service/TransactionService.kt:82`
- Impact: Frontend cannot reliably distinguish "not found" vs server crash; no contract for error shape; leaks stack traces in dev.
- Fix approach: Add `GlobalExceptionHandler` (`@RestControllerAdvice`) mapping `NoSuchElementException → 404`, `IllegalStateException/IllegalArgumentException → 400`, validation errors → 400 with field map.

**Dashboard loads all transactions into memory:**
- Issue: `DashboardService.getSummary()` and `getCategories()` call `transactionRepository.findAll()` then aggregate in Kotlin (groupBy, fold). With 90 seeded rows this is fine; with real bank data (thousands per user/year) this is O(n) JVM work per request and full table scan per call.
- Files: `src/main/kotlin/com/rogerllina/sst/service/DashboardService.kt:17`, `src/main/kotlin/com/rogerllina/sst/service/DashboardService.kt:44`
- Impact: Performance and memory cost grows linearly with dataset; will degrade once real bank integration lands.
- Fix approach: Replace with SQL aggregations — `@Query` with `GROUP BY date_trunc('month', date)` for monthly trend and `GROUP BY category` for categories. Returns `List<MonthlyTrendDto>` projection directly.

**`TransactionService.seed()` does `deleteAll` + reseed unconditionally:**
- Issue: Calling `/api/admin/seed` wipes the entire `transactions` table for every user/account, then reinserts mock data. Single-tenant assumption; destructive.
- Files: `src/main/kotlin/com/rogerllina/sst/service/TransactionService.kt:37`, `src/main/kotlin/com/rogerllina/sst/controller/AdminController.kt:11-15`
- Impact: One unauthenticated POST destroys all transaction history. Combined with NO AUTH this is a data-loss vector.
- Fix approach: Restrict endpoint to dev/test profile (`@Profile("!prod")` on `AdminController`), or remove from production via Spring profile-conditional bean.

**`MockBankService` returns identical data deterministically:**
- Issue: `Random(42)` seed plus `LocalDateTime.now()` window means transactions are stable per call but tied to current month. No tenant context — all callers see the same single account.
- Files: `src/main/kotlin/com/rogerllina/sst/service/MockBankService.kt:51`, `src/main/kotlin/com/rogerllina/sst/service/MockBankService.kt:74-82`
- Impact: Cannot simulate multi-user/multi-account scenarios needed for B2B2C repositioning.
- Fix approach: Accept a `tenantId` / `userId` parameter, derive seed from it; return per-tenant accounts.

## Known Bugs

**`Transaction.description` non-null in entity but nullable in schema:**
- Symptoms: `V3__create_transactions.sql` declares `description VARCHAR(500)` (nullable), but Kotlin `Transaction.description: String` (non-null) and `TransactionDto.description: String` (non-null). If a row is ever inserted with NULL description, JPA mapping will fail at read time.
- Files: `src/main/resources/db/migration/V3__create_transactions.sql:10`, `src/main/kotlin/com/rogerllina/sst/model/Transaction.kt:23`
- Trigger: Not currently reachable — `MockBankService` always supplies a description. But future bank integrations or manual inserts could break this.
- Workaround: Either change column to `NOT NULL` or make Kotlin field `String?`.

**`ddl-auto: validate` will fail if entity drifts from schema:**
- Symptoms: Adding a non-nullable Kotlin field without a Flyway migration crashes app startup with `SchemaManagementException`.
- Files: `src/main/resources/application.yml:9`
- Trigger: Any forgotten migration when adding fields.
- Workaround: This is intentional and good — flagged here so future contributors know the system is strict.

## Security Considerations

**NO AUTHENTICATION (critical):**
- Risk: Every endpoint (`/api/transactions`, `/api/dashboard/*`, `/api/accounts`, `/api/admin/seed`, `/mock-bank/*`) is publicly accessible. Anyone reaching the host can read all transactions, trigger destructive seed, and view account balances/IBAN.
- Files: All controllers in `src/main/kotlin/com/rogerllina/sst/controller/`. No `SecurityFilterChain` bean exists; no `spring-boot-starter-security` dependency in `build.gradle.kts`.
- Current mitigation: None. CORS is set to `allowCredentials = true` but no auth to credential.
- Recommendations: Fase B should add `spring-boot-starter-oauth2-resource-server` with JWT validation against an external IdP (Auth0/Cognito/Supabase), `SecurityFilterChain` requiring `authenticated()` on `/api/**`, and per-user tenant scoping on every repository query.

**`/api/admin/seed` is destructive and unauthenticated:**
- Risk: Anonymous POST wipes `transactions` table. Trivial DoS / data loss.
- Files: `src/main/kotlin/com/rogerllina/sst/controller/AdminController.kt:11-15`
- Current mitigation: None.
- Recommendations: Gate behind `@Profile("dev","test")` or require admin role once auth lands. Should never deploy to prod as-is.

**`/mock-bank/*` exposed:**
- Risk: Endpoints `GET /mock-bank/transactions` and `GET /mock-bank/accounts` reveal raw mock-bank payloads including account `iban` and `balance`. In a real deployment this controller represents an internal data-source adapter and shouldn't have HTTP surface.
- Files: `src/main/kotlin/com/rogerllina/sst/controller/MockBankController.kt:9-20`
- Current mitigation: None.
- Recommendations: Either delete the controller (use `MockBankService` only as an internal collaborator of `TransactionService`) or `@Profile("dev")` it.

**CORS not production-ready:**
- Risk: `allowedOrigins = ["http://localhost:5173", "http://localhost:3000"]` plus `allowCredentials = true` means production frontend won't connect; equally, no env-driven config exists.
- Files: `src/main/kotlin/com/rogerllina/sst/config/CorsConfig.kt:15-18`
- Current mitigation: Hardcoded localhost.
- Recommendations: Read allowed origins from `${cors.allowed-origins}` property bound to env var; never use `*` together with `allowCredentials = true`.

**Database credentials default to `sst/sst`:**
- Risk: `application.yml` falls back to `username: sst, password: sst` when env vars missing. If image is shipped without proper env, defaults will be tried against a real Postgres.
- Files: `src/main/resources/application.yml:5-6`
- Current mitigation: Env vars override.
- Recommendations: In a `application-prod.yml` profile, omit defaults so missing env fails fast.

**Swagger UI exposed at `/swagger-ui.html`:**
- Risk: Full API surface advertised publicly with no auth.
- Files: `src/main/resources/application.yml:22-23`, `src/main/kotlin/com/rogerllina/sst/config/SwaggerConfig.kt`
- Current mitigation: None.
- Recommendations: Disable `springdoc.swagger-ui.enabled` in prod profile, or gate behind admin auth.

**No rate limiting / no request size limits:**
- Risk: Unauthenticated `findFiltered` accepts arbitrary `size` page parameter — `?size=1000000` would attempt huge page allocation.
- Files: `src/main/kotlin/com/rogerllina/sst/controller/TransactionController.kt:24`
- Current mitigation: None.
- Recommendations: Cap `size` in controller (e.g., `min(size, 100)`); add bucket4j or gateway-level rate limiting.

## Performance Bottlenecks

**Dashboard endpoints scan full table every call:**
- Problem: `findAll()` then in-memory groupBy/fold for both `/api/dashboard/summary` and `/api/dashboard/categories`.
- Files: `src/main/kotlin/com/rogerllina/sst/service/DashboardService.kt:17`, `src/main/kotlin/com/rogerllina/sst/service/DashboardService.kt:44`
- Cause: No SQL-side aggregation; no caching.
- Improvement path: Push aggregation to SQL via `@Query` projections; add `@Cacheable` (Caffeine) with short TTL keyed by tenant + month.

**Eager `@ManyToOne` on `Transaction`:**
- Problem: `account` and `mccScore` are `FetchType.EAGER`. Listing 1000 transactions issues N+1 joins unless explicitly batched.
- Files: `src/main/kotlin/com/rogerllina/sst/model/Transaction.kt:12-17`
- Cause: Eager fetch was probably chosen so `TransactionDto.from()` could read `t.mccScore.description`. Works at small scale, hurts at large.
- Improvement path: Switch to `LAZY`, use a `@Query` with `JOIN FETCH t.mccScore` in `findFiltered` to fetch in one query.

## Fragile Areas

**`ESG fallback MCC` silently swallows unknown codes:**
- Files: `src/main/kotlin/com/rogerllina/sst/service/EsgScoringService.kt:14-20`
- Why fragile: `mccScoreRepository.findById(mccCode).orElse(fallbackMcc)` returns category="Other", co2=0.5, esg=50 without logging. If a real bank feeds an MCC missing from `V4__seed_mcc_scores.sql`, every transaction gets the same neutral score and nobody notices.
- Safe modification: Add `logger.warn("Unknown MCC: $mccCode, using fallback")` and emit a metric counter.
- Test coverage: `EsgScoringServiceTest` exists but probably doesn't assert the warning path — verify before relying on it.

**`TransactionService.seed()` uses `accounts.first()`:**
- Files: `src/main/kotlin/com/rogerllina/sst/service/TransactionService.kt:35`
- Why fragile: Throws `NoSuchElementException` if `mockBankService.getAccounts()` returns empty. Currently mocked to return one item, but any future config (e.g., toggling mock off without replacement) breaks seed silently.
- Safe modification: Validate `bankAccounts.isNotEmpty()` and throw a domain-specific exception with a clear message.
- Test coverage: Covered for happy path only (`TransactionServiceTest`).

**Controllers untested:**
- Files: All in `src/main/kotlin/com/rogerllina/sst/controller/`. Test directory has only `service/*Test.kt` and `SstApplicationTests.kt`.
- Why fragile: Wiring (request mapping, query param binding, validation, status codes, JSON serialization) has no automated coverage. A typo in `@RequestParam` name or path breaks the API silently.
- Safe modification: Add `@WebMvcTest` slices for each controller with MockMvc assertions.
- Test coverage: Zero controller tests.

**Repository `@Query` untested:**
- Files: `src/main/kotlin/com/rogerllina/sst/repository/TransactionRepository.kt:14-22`
- Why fragile: JPQL with five nullable params — typos or operator precedence errors in WHERE clause won't be caught until runtime.
- Safe modification: Add `@DataJpaTest` against H2 hitting all parameter combinations.
- Test coverage: None (services are mock-only).

## Scaling Limits

**Single-tenant data model:**
- Current capacity: 1 user / 1 account assumed everywhere. `seed()` picks `accounts.first()`. No `userId`, `tenantId`, or `apiKeyId` on `Transaction` or `Account`.
- Limit: Cannot host multiple users without schema change.
- Scaling path: Add `tenant_id UUID NOT NULL` to `accounts` and `transactions` (via Flyway migration), index it, scope every repository query (`findFiltered`, `findAll`) by tenant from auth context.

**Synchronous in-process aggregation:**
- Current capacity: Fine up to ~thousands of transactions per request.
- Limit: At tens of thousands `findAll()` blocks the request thread for seconds.
- Scaling path: SQL aggregation + caching (see Performance section).

## Dependencies at Risk

**Gradle 9.0 deprecation warnings:**
- Risk: `build.gradle.kts` uses Kotlin DSL patterns that emit deprecation warnings under Gradle 9.0 (e.g., implicit `kotlin("jvm")` configuration). Non-blocking today.
- Impact: When Gradle 8.x is required to be replaced, build will fail until updated.
- Migration plan: Run `./gradlew build --warning-mode all`, address each warning, target Gradle 8.x latest before 9.0 lands.

**No dependency lock file:**
- Risk: `build.gradle.kts` declares versions but no `gradle.lockfile` is present. Transitive resolution can shift between machines.
- Impact: "Works on my machine" risk.
- Migration plan: Enable `dependencyLocking { lockAllConfigurations() }` and commit `gradle.lockfile`.

## Missing Critical Features

> **Resolved since the original analysis:** `Dockerfile` + `docker-compose.yml` (multi-stage build), a portfolio-grade `README.md`, and a GitHub Actions CI pipeline (`.github/workflows/ci.yml`, runs `./gradlew test` + frontend Vitest on every push/PR) all exist now.

**No production profile:**
- Problem: Only `application.yml` (dev defaults) and `application-test.yml`. No `application-prod.yml`.
- Blocks: Production deployment must override 6+ properties via env; profile-specific hardening (disable Swagger, lock CORS, fail-fast on missing creds) has nowhere to live.

## Test Coverage Gaps

**Controller layer (HTTP wiring):**
- What's not tested: All five controllers — request mapping, query param binding, validation, response status codes, JSON shape.
- Files: `src/main/kotlin/com/rogerllina/sst/controller/*.kt`
- Risk: API contract regressions ship undetected.
- Priority: High.

**Repository `findFiltered` query:**
- What's not tested: JPQL behavior with various combinations of nullable params (especially boundary conditions on `dateFrom`/`dateTo` and score ranges).
- Files: `src/main/kotlin/com/rogerllina/sst/repository/TransactionRepository.kt`
- Risk: Off-by-one or operator-precedence bugs only surface in production.
- Priority: High.

**Flyway migrations:**
- What's not tested: No test asserting migrations apply cleanly on a fresh DB or that V4 seed data matches what `MockBankService` references (MCC codes 5411, 5541, 4111, 4121, 5812, 5814, 5651, 5691, 5734, 5311, 7812, 7011, 4900, 5912, 8011).
- Files: `src/main/resources/db/migration/V4__seed_mcc_scores.sql`, `src/main/kotlin/com/rogerllina/sst/service/MockBankService.kt:31-48`
- Risk: A merchant with an MCC missing from V4 seed silently uses fallback (esg=50) — see Fragile Areas.
- Priority: Medium. Add an integration test asserting every MCC in `MockBankService.merchants` resolves to a real `MccScore`.

**Integration test of full HTTP → DB roundtrip:**
- What's not tested: No `@SpringBootTest` actually exercising controller → service → repo → H2 (only `contextLoads()`).
- Files: `src/test/kotlin/com/rogerllina/sst/SstApplicationTests.kt:11-13`
- Risk: Integration bugs (transactional boundaries, JPA fetch, JSON serialization with `BigDecimal`) hide.
- Priority: Medium.

**Edge cases in `EsgScoringService` and `DashboardService`:**
- What's not tested: Verify `EsgScoringServiceTest` covers fallback path explicitly; `DashboardServiceTest` empty-DB branch (line 18 returns zeros) and multi-month grouping.
- Files: `src/test/kotlin/com/rogerllina/sst/service/EsgScoringServiceTest.kt`, `src/test/kotlin/com/rogerllina/sst/service/DashboardServiceTest.kt`
- Priority: Low — verify, expand if missing.

---

*Concerns audit: 2026-05-05 · refreshed 2026-06-15 (reconciled against the current `master` tree).*
