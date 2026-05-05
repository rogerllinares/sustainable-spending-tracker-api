# Technology Stack

**Analysis Date:** 2026-05-05

## Languages

**Primary:**
- Kotlin 1.9.25 - All application source code (`src/main/kotlin/com/rogerllina/sst/`) and tests (`src/test/kotlin/`)
- SQL (PostgreSQL dialect) - Flyway migrations under `src/main/resources/db/migration/`

**Secondary:**
- Kotlin Gradle DSL - Build configuration (`build.gradle.kts`, `settings.gradle.kts`)

## Runtime

**Environment:**
- Java 21 (JVM toolchain pinned via `java.toolchain.languageVersion = JavaLanguageVersion.of(21)` in `build.gradle.kts`)
- Spring Boot 3.5.0 embedded Tomcat (default `spring-boot-starter-web`)

**Package Manager:**
- Gradle 8.14.4 (Kotlin DSL) — wrapper pinned in `gradle/wrapper/gradle-wrapper.properties`
- Lockfile: not present (Gradle dependency-management plugin `io.spring.dependency-management:1.1.7` provides BOM-managed versions)

## Frameworks

**Core:**
- Spring Boot 3.5.0 - Application framework (`org.springframework.boot:spring-boot-starter-web`, `…-data-jpa`, `…-actuator`, `…-validation`)
- Spring Data JPA / Hibernate - ORM (`spring-boot-starter-data-jpa`); `@Entity` classes auto-opened via Kotlin `kotlin("plugin.jpa")` + `allOpen` plugin
- Jackson Kotlin module - JSON (de)serialization (`com.fasterxml.jackson.module:jackson-module-kotlin`)
- Flyway 11.x (BOM-managed) - DB migrations (`org.flywaydb:flyway-core` + `flyway-database-postgresql`)
- springdoc-openapi 2.8.8 - Swagger UI / OpenAPI generation (`org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.8`)

**Testing:**
- JUnit 5 (Jupiter) - Test runner (`useJUnitPlatform()` in `build.gradle.kts`); `org.junit.platform:junit-platform-launcher` runtime
- Spring Boot Test starter - Slice + integration tests (`spring-boot-starter-test`)
- kotlin-test-junit5 - Kotlin assertions
- MockK 1.13.17 - Kotlin-native mocking (`io.mockk:mockk:1.13.17`)
- H2 (in-memory, PostgreSQL mode) - Test datasource (`runtimeOnly("com.h2database:h2")`); configured in `src/main/resources/application-test.yml`

**Build/Dev:**
- Kotlin JVM plugin 1.9.25 (`kotlin("jvm")`)
- Kotlin Spring plugin 1.9.25 (`kotlin("plugin.spring")`) - Auto-opens `@Component`/`@Configuration`/`@Service`/etc.
- Kotlin JPA plugin 1.9.25 (`kotlin("plugin.jpa")`) - No-arg constructors for entities
- Spring Boot Gradle plugin 3.5.0 (`org.springframework.boot`)
- Spring dependency-management 1.1.7 (`io.spring.dependency-management`)

## Key Dependencies

**Critical:**
- `org.springframework.boot:spring-boot-starter-web` - REST controllers (all `@RestController` classes under `src/main/kotlin/com/rogerllina/sst/controller/`)
- `org.springframework.boot:spring-boot-starter-data-jpa` - Repositories (`src/main/kotlin/com/rogerllina/sst/repository/`)
- `org.springframework.boot:spring-boot-starter-validation` - Bean Validation (jakarta.validation) on DTOs
- `org.springframework.boot:spring-boot-starter-actuator` - Health/metrics endpoints (`/actuator/*`)
- `org.flywaydb:flyway-core` + `flyway-database-postgresql` - Schema versioning (`V1`–`V4` SQL files)
- `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.8` - `/swagger-ui.html` + `/api-docs`; configured in `src/main/kotlin/com/rogerllina/sst/config/SwaggerConfig.kt`
- `org.jetbrains.kotlin:kotlin-reflect` - Required by Spring + Jackson Kotlin module

**Infrastructure:**
- `org.postgresql:postgresql` (runtimeOnly) - Production JDBC driver
- `com.h2database:h2` (runtimeOnly) - Test JDBC driver (PostgreSQL compatibility mode)

## Configuration

**Environment:**

Main scaffold (`main` branch, `src/main/resources/`):
- `application.properties` - `spring.application.name=sst` only
- `application.yaml` - Same single property in YAML form

Feature backend worktree (`.worktrees/feature-backend/src/main/resources/`):
- `application.yml` - Datasource, JPA, Flyway, server port, springdoc paths
- `application-test.yml` - H2 in-memory PostgreSQL-compat profile

Required env vars (with defaults for dev):
- `DATABASE_URL` (default `jdbc:postgresql://localhost:5432/sst`)
- `DB_USER` (default `sst`)
- `DB_PASS` (default `sst`)

Other config:
- `spring.jpa.hibernate.ddl-auto: validate` (schema owned by Flyway)
- `spring.jpa.open-in-view: false`
- `spring.flyway.locations: classpath:db/migration`
- `server.port: 8080`
- `springdoc.api-docs.path: /api-docs`
- `springdoc.swagger-ui.path: /swagger-ui.html`

`.env*` files: not present.

**Build:**
- `build.gradle.kts` - Single-module Gradle build (Kotlin DSL)
- `settings.gradle.kts` - `rootProject.name = "sst"`
- `gradle/wrapper/gradle-wrapper.properties` - Gradle 8.14.4
- `gradlew` / `gradlew.bat` - Wrapper scripts
- `HELP.md` - Spring Initializr boilerplate

## Platform Requirements

**Development:**
- JDK 21 (Gradle toolchain auto-provisions if absent)
- Local PostgreSQL 14+ instance reachable at `jdbc:postgresql://localhost:5432/sst` (or override via `DATABASE_URL`)
- Gradle wrapper handles Gradle install

**Production:**
- JVM 21 runtime
- PostgreSQL database (env-injected URL/user/pass)
- HTTP port `8080` exposed
- Deploy target per `CLAUDE.md`: Docker + Railway or Fly.io (not yet configured — no `Dockerfile` or CI workflows in repo)

---

*Stack analysis: 2026-05-05*
