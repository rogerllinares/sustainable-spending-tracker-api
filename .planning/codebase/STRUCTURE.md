# Codebase Structure

**Analysis Date:** 2026-05-05

## Directory Layout

```
sst/                                    # Repo root (main branch — scaffold only)
├── build.gradle.kts                    # Kotlin DSL build config (Spring Boot 3.5, Kotlin 1.9.25, JDK 21)
├── settings.gradle.kts                 # Gradle settings (rootProject.name = "sst")
├── gradlew / gradlew.bat               # Gradle wrapper
├── HELP.md                             # Spring Initializr generated help
├── gradle/                             # Wrapper jar + properties
├── src/                                # Main branch: empty Spring Boot scaffold only
│   ├── main/
│   │   ├── kotlin/com/rogerllina/sst/
│   │   │   └── SstApplication.kt       # @SpringBootApplication
│   │   └── resources/
│   │       ├── application.properties  # (legacy, empty)
│   │       └── application.yaml        # (scaffold)
│   └── test/kotlin/com/rogerllina/sst/
│       └── SstApplicationTests.kt
├── .planning/codebase/                 # Codebase maps (this directory)
└── .worktrees/feature-backend/         # ALL real backend code lives here
    ├── build.gradle.kts                # Same as root + production deps
    ├── build/                          # Gradle build output (gitignored)
    └── src/
        ├── main/
        │   ├── kotlin/com/rogerllina/sst/
        │   │   ├── SstApplication.kt
        │   │   ├── config/             # Spring @Configuration beans
        │   │   │   ├── CorsConfig.kt
        │   │   │   └── SwaggerConfig.kt
        │   │   ├── controller/         # @RestController HTTP layer
        │   │   │   ├── AccountController.kt
        │   │   │   ├── AdminController.kt
        │   │   │   ├── DashboardController.kt
        │   │   │   ├── MockBankController.kt
        │   │   │   └── TransactionController.kt
        │   │   ├── dto/                # Wire-format data classes + from(entity) factories
        │   │   │   ├── DashboardSummaryDto.kt   # incl. MonthlyTrendDto, CategorySummaryDto
        │   │   │   ├── PagedResponseDto.kt
        │   │   │   └── TransactionDto.kt
        │   │   ├── model/              # @Entity JPA data classes
        │   │   │   ├── Account.kt
        │   │   │   ├── MccScore.kt
        │   │   │   └── Transaction.kt
        │   │   ├── repository/         # Spring Data JPA interfaces
        │   │   │   ├── AccountRepository.kt
        │   │   │   ├── MccScoreRepository.kt
        │   │   │   └── TransactionRepository.kt
        │   │   └── service/            # @Service business logic
        │   │       ├── DashboardService.kt
        │   │       ├── EsgScoringService.kt
        │   │       ├── MockBankService.kt        # incl. BankTransaction, BankAccount data classes
        │   │       └── TransactionService.kt
        │   └── resources/
        │       ├── application.yml             # Active config (Postgres, Flyway, SpringDoc)
        │       ├── application-test.yml        # Test profile (H2 in-memory)
        │       └── db/migration/               # Flyway versioned migrations
        │           ├── V1__create_accounts.sql
        │           ├── V2__create_mcc_scores.sql
        │           ├── V3__create_transactions.sql
        │           └── V4__seed_mcc_scores.sql
        └── test/kotlin/com/rogerllina/sst/
            ├── SstApplicationTests.kt           # Spring context loads
            └── service/
                ├── DashboardServiceTest.kt
                ├── EsgScoringServiceTest.kt
                └── TransactionServiceTest.kt
```

## Directory Purposes

**`sst/` (main branch):**
- Purpose: Spring Initializr scaffold. Currently the only Kotlin file is `SstApplication.kt`.
- Status: Holding pen until `feature-backend` is merged.

**`sst/.worktrees/feature-backend/`:**
- Purpose: Active development worktree. All controllers/services/repos/migrations live here.
- This is where any edit to backend code MUST happen until the branch is merged.

**`src/main/kotlin/com/rogerllina/sst/config/`:**
- Purpose: Spring `@Configuration` classes that produce framework beans (CORS filter, OpenAPI metadata).
- Contains: Cross-cutting wiring only — no business logic.
- Key files: `CorsConfig.kt` (CORS allowlist), `SwaggerConfig.kt` (OpenAPI bean).

**`src/main/kotlin/com/rogerllina/sst/controller/`:**
- Purpose: HTTP layer. One controller per resource (`/api/<resource>`).
- Contains: `@RestController` classes with `@RequestMapping` route prefixes.
- Convention: thin — delegates to a service, returns `ResponseEntity<DTO>`.

**`src/main/kotlin/com/rogerllina/sst/service/`:**
- Purpose: Business logic and orchestration. Aggregation, scoring, seeding, DTO mapping.
- Contains: `@Service` classes; supporting `data class` types defined alongside the service that owns them (`EsgResult`, `BankTransaction`, `BankAccount`).
- Pattern: Constructor-injected repositories and other services.

**`src/main/kotlin/com/rogerllina/sst/repository/`:**
- Purpose: Spring Data JPA persistence interfaces.
- Contains: `interface ... : JpaRepository<E, ID>`; one custom JPQL `@Query` (filtered transactions).

**`src/main/kotlin/com/rogerllina/sst/model/`:**
- Purpose: JPA `@Entity` data classes — one per Postgres table.
- Naming: PascalCase, singular (`Account`, `Transaction`, `MccScore`).
- Tables: `accounts`, `transactions`, `mcc_scores` (snake_case via `@Table(name=...)`).

**`src/main/kotlin/com/rogerllina/sst/dto/`:**
- Purpose: Wire-format data classes for JSON responses.
- Convention: each file may contain 1+ related DTOs (e.g., `DashboardSummaryDto.kt` also exports `MonthlyTrendDto`, `CategorySummaryDto`).
- Convention: `companion object { fun from(entity): Dto }` for entity → DTO mapping.

**`src/main/resources/db/migration/`:**
- Purpose: Flyway versioned SQL migrations. Owned source of truth for schema (`ddl-auto: validate`).
- Naming: `V<n>__<snake_case_description>.sql` — Flyway-mandated format.

**`src/test/kotlin/com/rogerllina/sst/service/`:**
- Purpose: Unit tests for services using JUnit 5 + MockK.
- Convention: package mirrors `main/`; test class is `<Class>Test.kt`.

## Key File Locations

**Entry Points:**
- `src/main/kotlin/com/rogerllina/sst/SstApplication.kt`: Spring Boot main, component scan root

**Configuration:**
- `build.gradle.kts`: dependencies, JDK 21 toolchain, Kotlin all-open for JPA
- `src/main/resources/application.yml`: datasource (env-driven), JPA, Flyway, SpringDoc, port 8080
- `src/main/resources/application-test.yml`: H2 + Flyway-disabled test profile
- `src/main/kotlin/com/rogerllina/sst/config/CorsConfig.kt`: CORS allowlist (5173, 3000)
- `src/main/kotlin/com/rogerllina/sst/config/SwaggerConfig.kt`: OpenAPI title/version

**Core Logic:**
- `src/main/kotlin/com/rogerllina/sst/service/EsgScoringService.kt`: CO₂ + ESG calculation rule
- `src/main/kotlin/com/rogerllina/sst/service/TransactionService.kt`: seed orchestration + filtering
- `src/main/kotlin/com/rogerllina/sst/service/DashboardService.kt`: aggregation
- `src/main/kotlin/com/rogerllina/sst/service/MockBankService.kt`: synthetic data generator
- `src/main/kotlin/com/rogerllina/sst/repository/TransactionRepository.kt`: filtered JPQL query

**Schema:**
- `src/main/resources/db/migration/V1__create_accounts.sql`
- `src/main/resources/db/migration/V2__create_mcc_scores.sql`
- `src/main/resources/db/migration/V3__create_transactions.sql`
- `src/main/resources/db/migration/V4__seed_mcc_scores.sql`

**Testing:**
- `src/test/kotlin/com/rogerllina/sst/SstApplicationTests.kt`: context loads
- `src/test/kotlin/com/rogerllina/sst/service/*Test.kt`: service-level unit tests

## Naming Conventions

**Files:**
- One top-level class per file; filename = class name (e.g., `DashboardService.kt`)
- DTO files may export sibling related DTOs (`DashboardSummaryDto.kt` → also `MonthlyTrendDto`, `CategorySummaryDto`)
- Tests: `<ClassUnderTest>Test.kt` in mirrored package

**Classes:**
- Controllers: `<Resource>Controller` (e.g., `TransactionController`)
- Services: `<Domain>Service` (e.g., `EsgScoringService`)
- Repositories: `<Entity>Repository` (e.g., `AccountRepository`)
- DTOs: `<Purpose>Dto` (e.g., `TransactionDto`, `DashboardSummaryDto`)
- Entities: singular noun (`Account`, `Transaction`, `MccScore`)

**Packages:**
- Lowercase, single segment (`controller`, `service`, `repository`, `model`, `dto`, `config`)
- Root: `com.rogerllina.sst`

**Routes:**
- Domain endpoints: `/api/<resource>` (kebab-case if multi-word)
- Mock bank deliberately under `/mock-bank` (not `/api/...`) — signals it's a dev-only fixture feed

**Database:**
- Tables: snake_case plural (`accounts`, `transactions`, `mcc_scores`)
- Columns: snake_case (`account_id`, `mcc_code`, `co2_kg`, `esg_score`)
- Mapping: Hibernate naming strategy converts Kotlin camelCase fields automatically; explicit `@JoinColumn(name=...)` only where needed.
- Migrations: `V<n>__<snake_case>.sql`

**Variables / functions:** Idiomatic Kotlin camelCase; constructor params marked `val` or `private val` for DI.

## Where to Add New Code

**New REST endpoint on an existing resource:**
- Add the method to the existing controller in `src/main/kotlin/com/rogerllina/sst/controller/`
- Push logic into the corresponding service in `src/main/kotlin/com/rogerllina/sst/service/`
- Add a unit test in `src/test/kotlin/com/rogerllina/sst/service/<Service>Test.kt`

**New resource (e.g., `Budget`):**
1. Migration: `src/main/resources/db/migration/V<next>__create_budgets.sql`
2. Entity: `src/main/kotlin/com/rogerllina/sst/model/Budget.kt`
3. Repository: `src/main/kotlin/com/rogerllina/sst/repository/BudgetRepository.kt` (`: JpaRepository<Budget, UUID>`)
4. Service: `src/main/kotlin/com/rogerllina/sst/service/BudgetService.kt`
5. DTO: `src/main/kotlin/com/rogerllina/sst/dto/BudgetDto.kt` with `companion object { fun from(...) }`
6. Controller: `src/main/kotlin/com/rogerllina/sst/controller/BudgetController.kt` mapped at `/api/budgets`
7. Service test: `src/test/kotlin/com/rogerllina/sst/service/BudgetServiceTest.kt`

**New cross-cutting bean (filter, interceptor, mapper):**
- `src/main/kotlin/com/rogerllina/sst/config/<Name>Config.kt` with `@Configuration`

**Reference data / seed update:**
- New Flyway migration `V<next>__<desc>.sql` — never edit applied migrations.

**Schema change to existing entity:**
1. New `V<next>__alter_<table>_<change>.sql`
2. Update entity in `model/`
3. Update DTO mapping if column is exposed
4. Run `./gradlew test` — `ddl-auto: validate` will fail loudly if entity drifts from schema

## Special Directories

**`.worktrees/feature-backend/`:**
- Purpose: Git worktree for the feature-backend branch — current authoritative source of backend code
- Generated: No (manually created by `git worktree add`)
- Committed: Tracked under its own branch, not visible from `main`
- Note: All exploration, edits, and builds for backend work go here, not under `sst/src/`

**`build/` (inside the worktree):**
- Purpose: Gradle build output (compiled classes, jars, reports)
- Generated: Yes
- Committed: No (gitignored)

**`gradle/`:**
- Purpose: Gradle wrapper distribution metadata
- Generated: Initially yes; subsequently committed
- Committed: Yes (so `./gradlew` works without prior Gradle install)

**`.planning/codebase/`:**
- Purpose: Auto-generated codebase maps consumed by `/gsd-plan-phase` and `/gsd-execute-phase`
- Generated: Yes (by `/gsd-map-codebase`)
- Committed: Yes

---

*Structure analysis: 2026-05-05*
