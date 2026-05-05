<!-- refreshed: 2026-05-05 -->
# Architecture

**Analysis Date:** 2026-05-05

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Clients (REST)                       │
│         Frontend (Vite @ localhost:5173) / Swagger UI        │
└──────────────────────────┬──────────────────────────────────┘
                           │ JSON over HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                          │
│  `src/main/kotlin/com/rogerllina/sst/controller/`            │
├──────────────┬─────────────┬───────────┬────────┬───────────┤
│  Dashboard   │ Transaction │  Account  │ Admin  │ MockBank  │
│ `/api/dash…` │`/api/trans…`│`/api/acc…`│`/api/  │ `/mock-   │
│              │             │           │ admin` │  bank`    │
└──────┬───────┴──────┬──────┴─────┬─────┴───┬────┴─────┬─────┘
       │              │            │         │          │
       ▼              ▼            ▼         ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  `src/main/kotlin/com/rogerllina/sst/service/`               │
│  DashboardService · TransactionService · EsgScoringService   │
│              · MockBankService (in-memory generator)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Repository Layer (JPA)                     │
│  `src/main/kotlin/com/rogerllina/sst/repository/`            │
│  TransactionRepository · AccountRepository · MccScoreRepo    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL (prod) / H2 (test) — schema via Flyway V1–V4     │
│  `src/main/resources/db/migration/`                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `SstApplication` | Spring Boot entry point, component scan root | `src/main/kotlin/com/rogerllina/sst/SstApplication.kt` |
| `DashboardController` | Aggregate metrics endpoints (`/summary`, `/categories`) | `src/main/kotlin/com/rogerllina/sst/controller/DashboardController.kt` |
| `TransactionController` | Filter + paginate transactions, fetch by id | `src/main/kotlin/com/rogerllina/sst/controller/TransactionController.kt` |
| `AccountController` | List accounts (passes through to repo) | `src/main/kotlin/com/rogerllina/sst/controller/AccountController.kt` |
| `MockBankController` | Expose mock bank feed for frontend dev | `src/main/kotlin/com/rogerllina/sst/controller/MockBankController.kt` |
| `AdminController` | `POST /api/admin/seed` to (re)populate DB | `src/main/kotlin/com/rogerllina/sst/controller/AdminController.kt` |
| `DashboardService` | In-memory aggregation (sum/avg/groupBy) of all transactions | `src/main/kotlin/com/rogerllina/sst/service/DashboardService.kt` |
| `TransactionService` | Seeding orchestration, filtered queries, DTO mapping | `src/main/kotlin/com/rogerllina/sst/service/TransactionService.kt` |
| `EsgScoringService` | MCC-based CO₂ and ESG score computation | `src/main/kotlin/com/rogerllina/sst/service/EsgScoringService.kt` |
| `MockBankService` | Deterministic random transaction/account generator (seed=42) | `src/main/kotlin/com/rogerllina/sst/service/MockBankService.kt` |
| `Account` / `Transaction` / `MccScore` | JPA entities (data classes) | `src/main/kotlin/com/rogerllina/sst/model/` |
| `*Repository` | Spring Data JPA interfaces | `src/main/kotlin/com/rogerllina/sst/repository/` |
| `CorsConfig` | CORS for `localhost:5173` and `localhost:3000` | `src/main/kotlin/com/rogerllina/sst/config/CorsConfig.kt` |
| `SwaggerConfig` | OpenAPI metadata bean | `src/main/kotlin/com/rogerllina/sst/config/SwaggerConfig.kt` |

## Pattern Overview

**Overall:** Classic layered Spring MVC monolith — Controller → Service → Repository → DB. DTO boundary at the controller; entities never leak into JSON responses (except `AccountController`, which currently returns `Account` directly — see CONCERNS).

**Key Characteristics:**
- Constructor injection everywhere (Kotlin `val` params on `@Service` / `@RestController` / `@Configuration`)
- Spring Data JPA repositories — no hand-rolled DAO layer
- Schema owned by Flyway (`ddl-auto: validate`), not Hibernate
- Stateless services; aggregation is currently done in-memory in JVM, not via SQL `GROUP BY`
- No security layer (no Spring Security on classpath); CORS-only

## Layers

**Controller (`controller/`):**
- Purpose: HTTP boundary, request binding, returns `ResponseEntity<DTO>`
- Location: `src/main/kotlin/com/rogerllina/sst/controller/`
- Contains: `@RestController` classes, `@RequestMapping` route prefixes, `@GetMapping` / `@PostMapping`
- Depends on: services (via constructor injection), DTOs
- Used by: external HTTP clients

**Service (`service/`):**
- Purpose: Business logic, orchestration, entity → DTO mapping
- Location: `src/main/kotlin/com/rogerllina/sst/service/`
- Contains: `@Service` classes, transactional boundaries (`@Transactional` on `TransactionService.seed`)
- Depends on: repositories, other services (`TransactionService` composes 3 repos + 2 services)
- Used by: controllers

**Repository (`repository/`):**
- Purpose: Persistence access via Spring Data JPA
- Location: `src/main/kotlin/com/rogerllina/sst/repository/`
- Contains: `interface ... : JpaRepository<Entity, IdType>`; one custom `@Query` (`TransactionRepository.findFiltered`)
- Depends on: JPA entities
- Used by: services

**Model (`model/`):**
- Purpose: JPA entities mapped to Postgres tables
- Location: `src/main/kotlin/com/rogerllina/sst/model/`
- Contains: `@Entity data class` types with `@ManyToOne` relations (Transaction → Account, Transaction → MccScore)

**DTO (`dto/`):**
- Purpose: Wire format decoupled from entities
- Location: `src/main/kotlin/com/rogerllina/sst/dto/`
- Contains: `data class` + `companion object { fun from(entity) }` factories
- Notable: `TransactionDto.scoringRationale` is computed on mapping for API explainability

**Config (`config/`):**
- Purpose: Cross-cutting Spring beans
- Location: `src/main/kotlin/com/rogerllina/sst/config/`
- Contains: `CorsConfig`, `SwaggerConfig`

## Data Flow

### Primary Read Path — `GET /api/transactions?category=Food&page=0&size=20`

1. Spring routes to `TransactionController.getAll` (`controller/TransactionController.kt:17`)
2. Query params bound (`@RequestParam`, `@DateTimeFormat` for dates)
3. Delegates to `TransactionService.findFiltered` (`service/TransactionService.kt:59`)
4. Builds `PageRequest` and calls `TransactionRepository.findFiltered` JPQL query (`repository/TransactionRepository.kt:14`)
5. JPA returns `Page<Transaction>` with eager `Account` + `MccScore` joins
6. Service maps each `Transaction` → `TransactionDto` via `TransactionDto.from` (`dto/TransactionDto.kt:22`)
7. Wraps in `PagedResponseDto.from(page)` (`dto/PagedResponseDto.kt:13`)
8. Controller returns `ResponseEntity.ok(...)` → JSON via Jackson Kotlin module

### Dashboard Aggregation — `GET /api/dashboard/summary`

1. `DashboardController.getSummary` → `DashboardService.getSummary` (`service/DashboardService.kt:16`)
2. **Loads ALL transactions into memory** via `transactionRepository.findAll()`
3. Computes `totalCo2`, `avgEsg`, monthly trend with Kotlin collection ops (`fold`, `groupBy`, `average`)
4. Returns `DashboardSummaryDto`

### Seed Flow — `POST /api/admin/seed`

1. `AdminController.seed` → `TransactionService.seed` (`service/TransactionService.kt:25`, `@Transactional`)
2. `MockBankService.getAccounts()` → upserts `Account` rows (idempotent by IBAN)
3. `transactionRepository.deleteAll()` — wipes all transactions
4. `MockBankService.getTransactions()` generates 90 deterministic transactions (6 months × 15, `Random(42)`)
5. For each: lookup `MccScore` (throws if missing), call `EsgScoringService.score(mcc, amount)` to compute `co2Kg` + `esgScore`
6. `transactionRepository.saveAll(transactions)`

**State Management:**
- All persistent state in Postgres
- `MockBankService` is stateless — generates fresh data per call (deterministic via fixed seed)
- No caching layer

## Key Abstractions

**`EsgResult` (value object):**
- Purpose: tuple `{co2Kg, esgScore, category}` returned by scoring
- File: `src/main/kotlin/com/rogerllina/sst/service/EsgScoringService.kt:9`

**`MccScore` (reference table entity):**
- Purpose: per-MCC CO₂-per-EUR factor and ESG score; PK is the 4-char MCC code itself
- Seed data: `src/main/resources/db/migration/V4__seed_mcc_scores.sql`
- Pattern: lookup-by-id reference data, joined eagerly from `Transaction`

**`BankTransaction` / `BankAccount` (mock bank wire types):**
- Purpose: separate the synthetic feed format from the persisted `Transaction` entity
- File: `src/main/kotlin/com/rogerllina/sst/service/MockBankService.kt:10`

**DTO `from(entity)` factory pattern:**
- Every DTO has a `companion object { fun from(...) }` static — single mapping point
- Examples: `TransactionDto.from`, `PagedResponseDto.from`

## Entry Points

**`SstApplication.main`:**
- Location: `src/main/kotlin/com/rogerllina/sst/SstApplication.kt:9`
- Triggers: `./gradlew bootRun` or executable jar
- Responsibilities: `@SpringBootApplication` — autoconfig + component scan rooted at `com.rogerllina.sst`

**HTTP entry points (all under embedded Tomcat, port `8080`):**
- `GET  /api/dashboard/summary`
- `GET  /api/dashboard/categories`
- `GET  /api/transactions` (filters: `category`, `dateFrom`, `dateTo`, `minScore`, `maxScore`, `page`, `size`)
- `GET  /api/transactions/{id}`
- `GET  /api/accounts`
- `POST /api/admin/seed`
- `GET  /mock-bank/transactions`
- `GET  /mock-bank/accounts`
- `GET  /api-docs` (OpenAPI JSON)
- `GET  /swagger-ui.html`
- `GET  /actuator/*` (health, info — actuator on classpath)

## Architectural Constraints

- **Threading:** Standard Spring MVC servlet model — Tomcat thread pool, blocking JDBC. No reactive stack, no `@Async`.
- **Global state:** None at JVM level. `MockBankService` uses `Random(42)` locally per call (deterministic). All shared state lives in Postgres.
- **Transactions:** Only `TransactionService.seed` is `@Transactional`. Read paths rely on JPA's default request-scoped session; `open-in-view: false` is set, so lazy loading after the service boundary will fail — relations (`Transaction.account`, `Transaction.mccScore`) are mapped `FetchType.EAGER` to avoid `LazyInitializationException` during DTO mapping.
- **Schema authority:** Flyway owns DDL (`ddl-auto: validate`). Adding a column requires a new `V*` migration; entities cannot drift.
- **Circular imports:** None. Dependency direction is strictly Controller → Service → Repository → Model. DTO depends on Model (one-way, in `from()`).
- **Security:** No authentication/authorization. `/api/admin/seed` is publicly callable.

## Anti-Patterns

### In-memory aggregation in `DashboardService`

**What happens:** `DashboardService.getSummary` and `.getCategories` both call `transactionRepository.findAll()` and aggregate with Kotlin collection operators in the JVM (`service/DashboardService.kt:17`, `:44`).
**Why it's wrong:** O(N) memory + network for every dashboard hit; will not scale beyond a demo dataset. Postgres can do this in a single `GROUP BY` query.
**Do this instead:** Add JPQL/native aggregate queries on `TransactionRepository` returning projection interfaces or DTO records. Example: `SELECT new com.rogerllina.sst.dto.MonthlyTrendDto(...) FROM Transaction t GROUP BY ...`.

### Entity leak in `AccountController`

**What happens:** `AccountController.getAll` returns `List<Account>` directly (`controller/AccountController.kt:13`), bypassing the DTO boundary used everywhere else.
**Why it's wrong:** Couples wire format to JPA mapping; future entity changes (e.g., adding a `userId` FK) become breaking API changes. Inconsistent with `TransactionController` / `DashboardController`.
**Do this instead:** Introduce `AccountDto` with a `from(Account)` factory (mirroring `TransactionDto`) and return that from an `AccountService`.

### Repository injected directly into a controller

**What happens:** `AccountController` depends on `AccountRepository` with no service layer (`controller/AccountController.kt:10`).
**Why it's wrong:** Skips the layer where business rules, mapping, and `@Transactional` boundaries belong. Other controllers in this codebase consistently go through a service.
**Do this instead:** Add `AccountService` even if it currently only delegates — it preserves the layering contract and gives a hook for DTO mapping.

### `deleteAll()` then `saveAll()` in seed

**What happens:** `TransactionService.seed` wipes the whole `transactions` table on every call (`service/TransactionService.kt:37`).
**Why it's wrong:** Destructive on a public endpoint with no auth. Also re-creates rows with new UUIDs each time, breaking any external references.
**Do this instead:** Gate behind a profile (`@Profile("dev")`) or auth, and/or make seeding upsert by a stable natural key.

## Error Handling

**Strategy:** Throw, let Spring's default `ResponseEntityExceptionHandler` translate.

**Patterns:**
- `NoSuchElementException` from `findById` → returns 500 by default (no `@ControllerAdvice` mapping it to 404)
- `IllegalStateException("Unknown MCC: ...")` thrown from seed if reference data is missing
- `EsgScoringService.score` falls back to a hardcoded `fallbackMcc` instead of throwing — divergent style vs. seed flow
- No global `@ControllerAdvice` / `@ExceptionHandler` — gap (see CONCERNS)

## Cross-Cutting Concerns

**Logging:** Default Spring Boot logback. No custom logger usage in services/controllers.
**Validation:** `spring-boot-starter-validation` is on the classpath but no `@Valid` or `@NotNull` annotations are applied to any controller input.
**Authentication:** None. All endpoints are public.
**CORS:** Allowlist `http://localhost:5173`, `http://localhost:3000` for all paths (`config/CorsConfig.kt:15`).
**API docs:** SpringDoc OpenAPI 2.8.8 — `/swagger-ui.html`, `/api-docs`.
**Health:** Spring Boot Actuator on classpath — `/actuator/health` available.

---

*Architecture analysis: 2026-05-05*
