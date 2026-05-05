# Testing Patterns

**Analysis Date:** 2026-05-05

## Test Framework

**Runner:**
- JUnit 5 (Jupiter) via `useJUnitPlatform()` (see `build.gradle.kts:52-54`)
- Kotlin test bridge: `kotlin-test-junit5` (test dependency)
- Spring Boot test starter: `spring-boot-starter-test`
- Config: Gradle `Test` task in `build.gradle.kts`; no separate JUnit config file

**Mocking:**
- MockK 1.13.17 (`io.mockk:mockk:1.13.17`) — Kotlin-native mocking library
- No Mockito usage despite Spring Boot starter pulling it in transitively

**Assertions:**
- `org.junit.jupiter.api.Assertions.*` (wildcard import) — `assertEquals`, `assertTrue`, `assertThrows`
- No AssertJ, no Kotest, no kotlin.test asserts mixed in

**Run Commands:**
```bash
./gradlew test                  # Run all tests (BUILD SUCCESSFUL as of 2026-05-05)
./gradlew test --tests TransactionServiceTest    # Single class
./gradlew test --tests "*Esg*"                   # Pattern
./gradlew clean test            # Force re-run
```

**Test runtime:**
- Spring Boot context test (`SstApplicationTests`) uses H2 in-memory DB via `@ActiveProfiles("test")` → `application-test.yml` (`src/main/resources/application-test.yml`)
- Pure unit tests run with no Spring context, just MockK mocks

## Test File Organization

**Location:**
- Mirrors main source tree: `src/test/kotlin/com/rogerllina/sst/<package>/`
- Service tests live in `src/test/kotlin/com/rogerllina/sst/service/`
- Application context test at root: `src/test/kotlin/com/rogerllina/sst/SstApplicationTests.kt`

**Naming:**
- `<ClassUnderTest>Test.kt` — singular `Test`, no `Tests`/`Spec` suffix variants
- Test class name matches file: `class TransactionServiceTest`
- Test method names: backticked human-readable strings, lowercase verb-first phrases:
  ```kotlin
  @Test
  fun `seed clears existing transactions and persists new ones`() { ... }

  @Test
  fun `score known MCC returns correct co2 and esg`() { ... }

  @Test
  fun `getSummary on empty DB returns zeroes`() { ... }
  ```

**Inventory (4 test files, all passing 2026-05-05):**
| File | Tests | Style |
|------|-------|-------|
| `src/test/kotlin/com/rogerllina/sst/service/EsgScoringServiceTest.kt` | 3 | Pure unit + MockK |
| `src/test/kotlin/com/rogerllina/sst/service/DashboardServiceTest.kt` | 3 | Pure unit + MockK + helper factory |
| `src/test/kotlin/com/rogerllina/sst/service/TransactionServiceTest.kt` | 2 | Pure unit + MockK |
| `src/test/kotlin/com/rogerllina/sst/SstApplicationTests.kt` | 1 | `@SpringBootTest` context smoke test |

## Test Structure

**Suite organization:**
- Flat structure — no `@Nested` classes, no `@DisplayName` annotations
- Class-level `private val` declarations for mocks and SUT — instantiated once, no `@BeforeEach`/`@AfterEach` in current tests:
  ```kotlin
  class EsgScoringServiceTest {

      private val mccScoreRepository = mockk<MccScoreRepository>()
      private val service = EsgScoringService(mccScoreRepository)

      @Test
      fun `score known MCC returns correct co2 and esg`() {
          val mcc = MccScore("5411", "Food", "Supermarket", BigDecimal("0.2100"), 72)
          every { mccScoreRepository.findById("5411") } returns Optional.of(mcc)

          val result = service.score("5411", BigDecimal("100.00"))

          assertEquals(BigDecimal("21.000"), result.co2Kg)
          assertEquals(72, result.esgScore)
          assertEquals("Food", result.category)
      }
  }
  ```
  (see `src/test/kotlin/com/rogerllina/sst/service/EsgScoringServiceTest.kt:12-27`)

**AAA pattern (implicit):**
- Arrange: `every { ... } returns ...` setup + literal fixture construction
- Act: single call to the SUT, result captured in `val result` / `val summary` / `val categories`
- Assert: chain of `assertEquals(expected, actual)` calls

**Fresh mocks per class instance:**
- JUnit 5 creates a new test class instance per `@Test` by default — each test gets fresh `mockk<...>()` instances declared as class-level `val`s, so no manual reset is needed

## Mocking

**Framework:** MockK (`io.mockk:*`)

**Patterns:**
```kotlin
// Stub return value
every { mccScoreRepository.findById("5411") } returns Optional.of(mcc)

// Stub Unit-returning method
every { transactionRepository.deleteAll() } just Runs

// Match any argument of a specific type
every { transactionRepository.saveAll(any<List<Transaction>>()) } returns emptyList()
every { accountRepository.save(any()) } returns account

// Verify interactions
verify(exactly = 1) { transactionRepository.deleteAll() }
verify(exactly = 1) { transactionRepository.saveAll(any<List<Transaction>>()) }
```
(see `src/test/kotlin/com/rogerllina/sst/service/TransactionServiceTest.kt:39-53`)

**Imports used:**
- `io.mockk.*` (wildcard) — pulls in `mockk`, `every`, `verify`, `Runs`, `just`, `any`

**What gets mocked:**
- All Spring Data repositories (`TransactionRepository`, `AccountRepository`, `MccScoreRepository`)
- Collaborator services (`MockBankService`, `EsgScoringService` when testing `TransactionService`)

**What does NOT get mocked:**
- The class under test (instantiated directly with mocked deps)
- Plain data classes (`Account`, `Transaction`, `MccScore`, `BankTransaction`, `EsgResult`) — built with real constructors
- `BigDecimal` / `LocalDateTime` / `UUID` — used as real values

**Optional handling:**
- Spring Data `findById` returns `Optional<T>` — tests stub with `Optional.of(entity)` for hit and `Optional.empty()` for miss (see `TransactionServiceTest.kt:59`)

## Fixtures and Factories

**Inline literal fixtures** are the dominant style. No external fixture files, no JSON resources, no `@TestConfiguration` data builders.

**Per-class helper factory** when fixtures repeat — see `DashboardServiceTest`:
```kotlin
private val account = Account(UUID.randomUUID(), "Main", "ES91...", "EUR", BigDecimal("1000"))
private val mccFood = MccScore("5411", "Food", "Supermarket", BigDecimal("0.21"), 72)
private val mccFuel = MccScore("5541", "Transport", "Gas Station", BigDecimal("2.30"), 12)

private fun tx(mcc: MccScore, amount: BigDecimal, co2: BigDecimal, esg: Int, date: LocalDateTime) =
    Transaction(UUID.randomUUID(), account, mcc, date, amount, "EUR", "Shop", mcc.category, "", co2, esg)
```
(see `src/test/kotlin/com/rogerllina/sst/service/DashboardServiceTest.kt:20-25`)

**Location:** Co-located inside the test class. No shared `testFixtures` source set, no `*TestUtils.kt` files.

## Spring Boot Integration Testing

**Smoke test only** — `SstApplicationTests`:
```kotlin
@SpringBootTest
@ActiveProfiles("test")
class SstApplicationTests {

    @Test
    fun contextLoads() {
    }

}
```
(see `src/test/kotlin/com/rogerllina/sst/SstApplicationTests.kt:7-15`)

- Activates `test` profile → loads `application-test.yml` → swaps PostgreSQL for H2 (`jdbc:h2:mem:testdb;MODE=PostgreSQL;...`)
- Flyway runs migrations against H2 (`flyway.locations: classpath:db/migration`)
- No `@SpringBootTest` with `webEnvironment` set, no `MockMvc`, no `WebTestClient`, no `TestRestTemplate` usage

## Coverage

**Tooling:** None configured. No JaCoCo plugin in `build.gradle.kts`, no Kover, no coverage gate.

**Coverage gaps (high-priority):**

| Area | Gap |
|------|-----|
| Controllers | **All 4 controllers untested** (`TransactionController`, `DashboardController`, `AccountController`, `AdminController`). No `@WebMvcTest` / `MockMvc` tests for routing, status codes, query-param binding, JSON serialization. |
| Repositories | `TransactionRepository.findFiltered` JPQL is **not exercised** by an integration test (`@DataJpaTest`). Filter null-coalescing logic could regress silently. |
| Service | `MockBankService` has zero tests despite seeded `Random(42)` making it deterministic and easy to assert. |
| Service | `TransactionService.findFiltered` (page/size/filter wiring) untested. |
| Service | `TransactionService.seed` happy path is tested, but the `IllegalStateException("Unknown MCC: ...")` branch (line 41) is not. |
| Config | `CorsConfig` and `SwaggerConfig` not asserted via integration test. |
| End-to-end | No full request → DB → response test. The single `@SpringBootTest` only verifies context boot. |
| Error mapping | No `@ControllerAdvice` exists, so no test asserts that `NoSuchElementException` → 404 (it currently returns 500). |

## Test Types Currently Used

**Unit tests (MockK + JUnit 5):**
- All 3 service test files. Fast, no Spring context, mock all repositories.

**Spring context smoke test:**
- `SstApplicationTests` — proves Spring wiring + H2 + Flyway boot together.

**Integration / Web layer / E2E:**
- Not used.

## Common Patterns

**Exception testing:**
```kotlin
@Test
fun `findById throws exception when transaction not found`() {
    val id = UUID.randomUUID()
    every { transactionRepository.findById(id) } returns Optional.empty()

    assertThrows(NoSuchElementException::class.java) { service.findById(id) }
}
```
(see `src/test/kotlin/com/rogerllina/sst/service/TransactionServiceTest.kt:56-62`)

**BigDecimal equality:**
- Tests use `assertEquals(BigDecimal("21.000"), result.co2Kg)` — string-constructed `BigDecimal` so the **scale matches**. `BigDecimal.equals` is scale-sensitive (`"21.0" != "21.00"`), so the production code's `.setScale(3, RoundingMode.HALF_UP)` is what makes assertions stable.

**Time in tests:**
- `LocalDateTime.now()` used directly (e.g., `DashboardServiceTest.kt:29`). No frozen-clock abstraction. Tests pass because they don't assert on absolute timestamps — only on grouping/aggregation outcomes derived from `now.minusMonths(1)`.

**Async testing:**
- Not applicable — no coroutines, reactive streams, or async code in the project yet.

---

*Testing analysis: 2026-05-05*
