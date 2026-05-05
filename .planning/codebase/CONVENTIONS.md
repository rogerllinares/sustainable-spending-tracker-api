# Coding Conventions

**Analysis Date:** 2026-05-05

## Naming Patterns

**Files:**
- Kotlin source files: `PascalCase.kt` matching the primary class name (e.g., `TransactionService.kt`, `EsgScoringService.kt`, `DashboardController.kt`)
- One public top-level class per file (data classes for DTOs/results may be co-located: see `EsgResult` in `src/main/kotlin/com/rogerllina/sst/service/EsgScoringService.kt`, `BankTransaction`/`BankAccount` in `MockBankService.kt`)
- Test files: `<ClassUnderTest>Test.kt` (e.g., `TransactionServiceTest.kt`)
- SQL migrations: `V<n>__<snake_case_description>.sql` (Flyway convention) under `src/main/resources/db/migration/`

**Packages:**
- Root: `com.rogerllina.sst`
- Layered subpackages: `controller`, `service`, `repository`, `model`, `dto`, `config`
- Test mirrors main: `com.rogerllina.sst.service` for service tests

**Classes:**
- `PascalCase`
- Suffixes denote layer/role: `*Controller`, `*Service`, `*Repository`, `*Dto`, `*Config`
- JPA entities are plain nouns: `Account`, `Transaction`, `MccScore`

**Functions / Methods:**
- `camelCase`
- Verbs for actions (`seed`, `score`, `findFiltered`, `getSummary`, `getCategories`)
- Repository methods follow Spring Data conventions (`findById`, `findAll`, `findFiltered`)

**Variables / Properties:**
- `camelCase` for vals/vars and parameters
- Domain abbreviations kept lowercase after the first segment: `mccCode`, `co2Kg`, `co2PerEur`, `esgScore`, `iban`

**Constants / Companions:**
- `companion object` blocks host static factories (e.g., `TransactionDto.from(t: Transaction)` at `src/main/kotlin/com/rogerllina/sst/dto/TransactionDto.kt:21`)
- Module-private fixtures use `private val` at class level (e.g., `monthFmt` in `DashboardService.kt:14`, `fallbackMcc` in `EsgScoringService.kt:14`)

## Code Style

**Formatting:**
- No `.editorconfig`, `.ktlint`, or `detekt` config detected — formatting is IDE-default Kotlin style
- 4-space indentation throughout
- Trailing commas in multi-line constructor arg lists are inconsistent (none used in current code)
- Lines stay narrow (~120 chars); long parameter lists are broken onto separate lines (see `TransactionService.findFiltered` at `src/main/kotlin/com/rogerllina/sst/service/TransactionService.kt:59`)

**Linting:**
- No lint tooling configured. Compiler runs with `-Xjsr305=strict` (see `build.gradle.kts:42`) — JSR-305 nullability annotations are treated as errors

**Kotlin compiler:**
- Toolchain: JDK 21 (`build.gradle.kts:14`)
- Kotlin 1.9.25 with `plugin.spring` and `plugin.jpa` for `allOpen` on JPA annotations

## Import Organization

**Order (observed):**
1. Internal project imports (`com.rogerllina.sst.*`) — grouped first
2. Third-party (`io.mockk.*`, `org.springframework.*`, `jakarta.persistence.*`, `org.junit.*`)
3. Standard library (`java.math.*`, `java.time.*`, `java.util.*`)

**Path Aliases:**
- None. Plain fully-qualified package imports.

**Wildcard imports:**
- Used selectively: `org.springframework.web.bind.annotation.*` in controllers, `io.mockk.*` and `org.junit.jupiter.api.Assertions.*` in tests. Domain code uses explicit imports.

## Spring Boot Patterns

**Dependency Injection:**
- Constructor injection only. No `@Autowired` field/property injection anywhere.
- Services and controllers declare collaborators as `private val` constructor params:
  ```kotlin
  @Service
  class TransactionService(
      private val transactionRepository: TransactionRepository,
      private val accountRepository: AccountRepository,
      ...
  )
  ```
  (see `src/main/kotlin/com/rogerllina/sst/service/TransactionService.kt:17-23`)

**Stereotypes:**
- `@Service` on services, `@RestController` + `@RequestMapping("/api/<resource>")` on controllers, `@Configuration` on config classes
- Repositories are interfaces extending `JpaRepository<Entity, IdType>` — no `@Repository` annotation needed

**Transactions:**
- `@Transactional` only where multi-write atomicity matters (e.g., `TransactionService.seed()` at line 25). Read-only services rely on Spring defaults.

**Configuration:**
- Beans defined via `@Bean` in `@Configuration` classes (`CorsConfig.kt`, `SwaggerConfig.kt`)
- Externalized config via `application.yml` with `${ENV_VAR:default}` placeholders (see `src/main/resources/application.yml:4-6`)
- Profile-specific overrides: `application-test.yml` for H2 in-memory testing

## Controller / API Patterns

- One controller per resource, `@RequestMapping("/api/<plural>")`
- Endpoints return `ResponseEntity<T>` even for trivial 200 cases (consistent across `TransactionController`, `DashboardController`, `AccountController`, `AdminController`)
- Single-expression body style (`= ResponseEntity.ok(...)`):
  ```kotlin
  @GetMapping("/{id}")
  fun getById(@PathVariable id: UUID): ResponseEntity<TransactionDto> =
      ResponseEntity.ok(transactionService.findById(id))
  ```
  (see `src/main/kotlin/com/rogerllina/sst/controller/TransactionController.kt:28-30`)
- Date params parsed with `@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)` — ISO-8601 only
- Pagination: `page`/`size` query params with `@RequestParam(defaultValue = ...)`, defaults `page=0`, `size=20`

**No global exception handler / `@ControllerAdvice`** — services throw `NoSuchElementException` / `IllegalStateException` and Spring's default error handling produces 500s. This is a known gap (see CONCERNS).

## DTO / Mapping Patterns

- DTOs are Kotlin `data class` in `dto/` package
- Entity → DTO mapping via `companion object { fun from(entity): Dto }` factory:
  ```kotlin
  data class TransactionDto(...) {
      companion object {
          fun from(t: Transaction): TransactionDto = TransactionDto(...)
      }
  }
  ```
  (see `src/main/kotlin/com/rogerllina/sst/dto/TransactionDto.kt:21-36`)
- Generic paged wrapper: `PagedResponseDto<T>` with `from(Page<T>)` factory
- DTOs may compose human-readable fields server-side (e.g., `scoringRationale` string built in `TransactionDto.from`)

## Domain / Persistence Patterns

**Entities:**
- `data class` annotated with `@Entity` and `@Table(name = "snake_case_plural")`
- IDs: `UUID` with `@GeneratedValue(strategy = GenerationType.UUID)` and a default `= UUID.randomUUID()`
- `kotlin("plugin.jpa")` + `allOpen` on `@Entity`/`@MappedSuperclass`/`@Embeddable` (see `build.gradle.kts:46-50`) so JPA can proxy data classes
- Relationships: `@ManyToOne(fetch = FetchType.EAGER)` with explicit `@JoinColumn` (e.g., `Transaction.account`, `Transaction.mccScore` at `model/Transaction.kt:12-17`)
- Default values used for sensible fields: `currency: String = "EUR"`

**Money / numeric values:**
- `BigDecimal` for all monetary and CO₂ values — never `Double`/`Float`
- Explicit scale + rounding mode at compute sites: `.setScale(3, RoundingMode.HALF_UP)` (see `EsgScoringService.kt:24`)

**Time:**
- `LocalDateTime` for transaction timestamps (no timezone)
- `LocalDate` at API boundary, converted via `dateFrom?.atStartOfDay()` / `dateTo?.atTime(23, 59, 59)` (see `TransactionService.kt:71-72`)

**Repositories:**
- Spring Data JPA interfaces extending `JpaRepository<Entity, ID>`
- Custom queries with `@Query("""...""")` triple-quoted JPQL and `@Param("name")` binding (see `TransactionRepository.kt:14-30`)
- Nullable filter params handled via `:p IS NULL OR field = :p` SQL pattern

**Migrations:**
- Flyway with `V<n>__<desc>.sql` files in `src/main/resources/db/migration/`
- Production uses `ddl-auto: validate`; tests use `ddl-auto: none` and let Flyway create the H2 schema

## Error Handling

**Patterns observed:**
- Services throw stdlib exceptions for not-found / invariant violations:
  - `NoSuchElementException("Transaction $id not found")` — `TransactionService.findById` (line 82)
  - `IllegalStateException("Unknown MCC: ${bt.mccCode}")` — `TransactionService.seed` (line 41)
- `Optional.orElseThrow { ... }` pattern when bridging Spring Data `Optional<T>` returns
- Fallback-instead-of-throw pattern when a domain default exists: `mccScoreRepository.findById(...).orElse(fallbackMcc)` (see `EsgScoringService.kt:23`)
- **No custom exception types and no `@ControllerAdvice` exception mapper** — controllers don't translate exceptions to HTTP status codes (gap)

**Validation:**
- `spring-boot-starter-validation` is on the classpath but no `@Valid` / Jakarta `@NotNull` / `@Min` annotations are used yet on request payloads
- All inputs come from `@RequestParam` with Kotlin nullable types (`Int?`, `String?`) — no bean-level constraint annotations

## Logging

- No logger declarations found in `src/main/kotlin/`. No `LoggerFactory.getLogger(...)` usage.
- Default Spring Boot logging only. JPA `show-sql: false` in `application.yml`.

## Function Design

- Single-expression body (`fun foo(): T = ...`) preferred when the body is one expression — used across controllers and small service methods
- Block bodies for multi-step orchestration (e.g., `TransactionService.seed`, `DashboardService.getSummary`)
- Functional/collection style preferred over loops:
  - `groupBy { ... }.map { (k, v) -> ... }.sortedBy { ... }` chain (see `DashboardService.kt:24-33`)
  - `fold(BigDecimal.ZERO) { acc, t -> acc + t.co2Kg }` for numeric aggregation
- Parameter lists with 4+ params are formatted one per line with named-argument call sites:
  ```kotlin
  transactionRepository.findFiltered(
      category = category,
      dateFrom = dateFrom?.atStartOfDay(),
      ...
  )
  ```

## Module Design

- No barrel/`index.kt` files — each consumer imports concrete classes
- Visibility: top-level classes are `public` (Kotlin default); internal helpers use `private val` at class level
- Companion objects are used solely for DTO factories — not for public constants

## Where to Add New Code

**New endpoint:** controller in `controller/`, service in `service/`, DTO in `dto/`, repository in `repository/` (if new entity)
**New entity:** `model/` + Flyway migration `V<next>__create_<plural>.sql` + JPA repository interface
**New cross-cutting bean:** `@Configuration` class in `config/`
**New scoring rule / domain logic:** put it in or beside `EsgScoringService`; keep `BigDecimal` arithmetic and explicit rounding

---

*Convention analysis: 2026-05-05*
