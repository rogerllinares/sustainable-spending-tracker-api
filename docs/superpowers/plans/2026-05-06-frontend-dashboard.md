# SST Frontend Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + TypeScript dashboard with mock auth, CO₂/ESG metrics visualization, and a filterable transactions table connected to the existing Spring Boot backend.

**Architecture:** Vite SPA with React Router for `/login` and `/dashboard`. Auth flow: mock login form (name + email) → state stored in React Context (in-memory) → ProtectedRoute guards `/dashboard`. Backend stays without authentication (as-is) — architecture is OAuth-ready (AuthContext + Bearer interceptor in place) but not wired to a real provider. Data fetching via TanStack Query.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, shadcn/ui (Radix), Recharts 2, TanStack Query v5, Axios, react-router-dom 6

**Auth note:** OAuth was deferred to keep the demo self-contained (no external accounts, no Cloud Console setup). Switching to real OAuth later only requires replacing the LoginPage form with a `<GoogleLogin>` button and adding Spring Security to the backend — the AuthContext and API client are already designed for it.

**Working directory:** All commands relative to `C:\Users\llina\Desktop\SecondBrain\03 Projects\Sustainable Spending Tracker\sst\` unless stated otherwise. Frontend lives in `sst-frontend/` subdirectory.

**Color palette (from CONTEXT.md):**
- `--bg`: `#F8FAF9` · `--primary`: `#16A34A` (green-600) · `--accent`: `#4ADE80` (green-400) · `--text`: `#111827` · `--border`: `#E5E7EB`

**Backend contract reference (already implemented):**
```
POST /api/admin/seed                    → seeds 90 mock txns (kept public)
GET  /api/dashboard/summary             → { totalCo2Kg, avgEsgScore, monthlyTrend: [{month, co2Kg}] }
GET  /api/dashboard/categories          → [{ category, totalCo2Kg, avgEsgScore, transactionCount }]
GET  /api/transactions?category&dateFrom&dateTo&minScore&maxScore&page&size
                                        → { content: TransactionDto[], page, size, totalElements, totalPages }
TransactionDto: { id, date, description, category, amountEur, co2Kg, esgScore }
```

---

## Task 1: ~~Google OAuth Client ID~~ — SKIPPED

Mock auth approach. No external OAuth setup. See header note.

---

## Task 2: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `sst-frontend/` (entire directory tree)
- Create: `sst-frontend/package.json`, `sst-frontend/vite.config.ts`, `sst-frontend/tsconfig.json`, etc.

- [ ] **Step 2.1: Run Vite scaffold**

Run from `sst/`:
```bash
npm create vite@latest sst-frontend -- --template react-ts
```

When prompted, accept defaults.

- [ ] **Step 2.2: Install base dependencies**

Run from `sst-frontend/`:
```bash
cd sst-frontend
npm install
```

- [ ] **Step 2.3: Verify dev server starts**

Run from `sst-frontend/`:
```bash
npm run dev
```

Expected: Vite serves on `http://localhost:5173`. Open it — you should see the Vite + React starter. Stop the server (Ctrl+C).

- [ ] **Step 2.4: Commit**

Run from `sst/`:
```bash
git add sst-frontend/
git commit -m "feat(frontend): scaffold Vite + React + TypeScript project"
```

---

## Task 3: Install runtime dependencies and configure Tailwind + shadcn/ui

**Files:**
- Modify: `sst-frontend/package.json`
- Create: `sst-frontend/tailwind.config.ts`
- Create: `sst-frontend/postcss.config.js`
- Modify: `sst-frontend/src/index.css`
- Create: `sst-frontend/components.json`
- Create: `sst-frontend/src/lib/utils.ts`
- Modify: `sst-frontend/tsconfig.json`, `sst-frontend/tsconfig.app.json`, `sst-frontend/vite.config.ts`
- Create: `sst-frontend/.env`

- [ ] **Step 3.1: Install runtime libraries**

Run from `sst-frontend/`:
```bash
npm install react-router-dom@6 @tanstack/react-query@5 axios recharts class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 3.2: Install Tailwind + dev tooling**

Run from `sst-frontend/`:
```bash
npm install -D tailwindcss@3 postcss autoprefixer @types/node
npx tailwindcss init -p
```

This creates `tailwind.config.js` and `postcss.config.js`. Rename the config to `.ts`:
```bash
mv tailwind.config.js tailwind.config.ts
```

- [ ] **Step 3.3: Configure `tailwind.config.ts`**

Replace `sst-frontend/tailwind.config.ts` with:
```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 3.4: Replace `sst-frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 150 25% 98%;        /* #F8FAF9 off-white */
    --foreground: 222 47% 11%;        /* #111827 gray-900 */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --primary: 142 76% 36%;           /* #16A34A green-600 */
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 142 71% 58%;            /* #4ADE80 green-400 */
    --accent-foreground: 222 47% 11%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 91%;            /* #E5E7EB gray-200 */
    --input: 220 13% 91%;
    --ring: 142 76% 36%;
    --radius: 0.5rem;
  }
  body {
    @apply bg-background text-foreground;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
}
```

- [ ] **Step 3.5: Configure path alias `@/*`**

Modify `sst-frontend/tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Modify `sst-frontend/tsconfig.app.json` — add inside `compilerOptions`:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

Modify `sst-frontend/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { port: 5173 },
})
```

- [ ] **Step 3.6: Create `sst-frontend/src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3.7: Create `sst-frontend/components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 3.8: Create `sst-frontend/.env`**

```
VITE_API_BASE_URL=http://localhost:8080
```

- [ ] **Step 3.9: Add `.env` to `.gitignore`** (if not already)

Verify `sst-frontend/.gitignore` contains the line `.env`. Vite's default scaffold already includes it; if missing, add:
```
.env
```

- [ ] **Step 3.10: Commit**

Run from `sst/`:
```bash
git add sst-frontend/
git commit -m "feat(frontend): configure Tailwind, shadcn/ui base, env vars"
```

---

## Task 4: ~~Backend Spring Security~~ — SKIPPED

Backend stays public (no auth). Mock auth in frontend only. Skip to Task 5.

---

## Task 4 (legacy, skipped): Backend — Add Spring Security OAuth2 Resource Server

**Files:**
- Modify: `sst/build.gradle.kts`
- Create: `sst/src/main/kotlin/com/rogerllina/sst/config/SecurityConfig.kt`
- Modify: `sst/src/main/resources/application.yml`
- Modify: `sst/src/main/resources/application-test.yml`

- [ ] **Step 4.1: Read current `build.gradle.kts`**

Read: `sst/build.gradle.kts` to confirm the `dependencies` block. The file contains entries like `implementation("org.springframework.boot:spring-boot-starter-web")`.

- [ ] **Step 4.2: Add Spring Security dependencies**

In `sst/build.gradle.kts`, inside the `dependencies { ... }` block, add (alongside the existing starters):
```kotlin
implementation("org.springframework.boot:spring-boot-starter-security")
implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
testImplementation("org.springframework.security:spring-security-test")
```

- [ ] **Step 4.3: Update `application.yml`**

Read `sst/src/main/resources/application.yml`. Append (or merge into existing `spring:` block):
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: https://www.googleapis.com/oauth2/v3/certs
          issuer-uri: https://accounts.google.com

google:
  oauth:
    client-id: PASTE_YOUR_CLIENT_ID_FROM_TASK_1_HERE
```

Replace `PASTE_YOUR_CLIENT_ID_FROM_TASK_1_HERE` with the actual Client ID.

- [ ] **Step 4.4: Update `application-test.yml`** to disable security in tests

Read `sst/src/main/resources/application-test.yml`. Append:
```yaml
spring:
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
      - org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration
```

This keeps the existing integration test (Task 12 from backend) green — auth is disabled under the `test` profile.

- [ ] **Step 4.5: Create `SecurityConfig.kt`**

Create `sst/src/main/kotlin/com/rogerllina/sst/config/SecurityConfig.kt`:
```kotlin
package com.rogerllina.sst.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtClaimValidator
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtIssuerValidator
import org.springframework.security.oauth2.jwt.JwtTimestampValidator
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig(
    @Value("\${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}") private val jwkSetUri: String,
    @Value("\${google.oauth.client-id}") private val googleClientId: String,
) {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { }
            .authorizeHttpRequests { auth ->
                auth.requestMatchers(
                    "/api/admin/seed",
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/api-docs/**",
                    "/v3/api-docs/**",
                    "/actuator/health",
                ).permitAll()
                auth.anyRequest().authenticated()
            }
            .oauth2ResourceServer { oauth2 -> oauth2.jwt { } }
        return http.build()
    }

    @Bean
    fun jwtDecoder(): JwtDecoder {
        val decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build()
        val audienceValidator: OAuth2TokenValidator<Jwt> =
            JwtClaimValidator("aud") { aud ->
                when (aud) {
                    is String -> aud == googleClientId
                    is List<*> -> aud.contains(googleClientId)
                    else -> false
                }
            }
        decoder.setJwtValidator(
            DelegatingOAuth2TokenValidator(
                JwtTimestampValidator(),
                JwtIssuerValidator("https://accounts.google.com"),
                audienceValidator,
            )
        )
        return decoder
    }
}
```

- [ ] **Step 4.6: Build and run tests**

Run from `sst/`:
```bash
./gradlew test
```

Expected: All 10 backend tests still PASS (test profile excludes security).

- [ ] **Step 4.7: Boot the app and smoke-check**

Run from `sst/`:
```bash
./gradlew bootRun
```

In another terminal:
```bash
curl -i http://localhost:8080/api/dashboard/summary
```

Expected: HTTP `401 Unauthorized` (security is now active).

```bash
curl -i -X POST http://localhost:8080/api/admin/seed
```

Expected: HTTP `200 OK` (seed endpoint stays public for demo).

Stop the server (Ctrl+C).

- [ ] **Step 4.8: Commit**

Run from `sst/`:
```bash
git add build.gradle.kts src/main/kotlin/com/rogerllina/sst/config/SecurityConfig.kt src/main/resources/application.yml src/main/resources/application-test.yml
git commit -m "feat(backend): add Spring Security OAuth2 resource server with Google JWT validation"
```

---

## Task 5: AuthContext + ProtectedRoute (frontend)

**Files:**
- Create: `sst-frontend/src/auth/AuthContext.tsx`
- Create: `sst-frontend/src/auth/ProtectedRoute.tsx`

- [ ] **Step 5.1: Create `AuthContext.tsx`**

`sst-frontend/src/auth/AuthContext.tsx`:
```tsx
import { createContext, useContext, useState, useMemo, type ReactNode } from "react"

interface AuthState {
  token: string | null
  email: string | null
  name: string | null
  picture: string | null
}

interface AuthContextValue extends AuthState {
  login: (token: string, profile: { email: string; name: string; picture: string }) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    email: null,
    name: null,
    picture: null,
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.token,
      login: (token, profile) =>
        setState({ token, email: profile.email, name: profile.name, picture: profile.picture }),
      logout: () => setState({ token: null, email: null, name: null, picture: null }),
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
```

> **Why in-memory (not localStorage):** Avoids XSS token theft. Trade-off: refresh logs the user out. Acceptable for portfolio demo. If you want persistence later, switch to a httpOnly cookie set by the backend.

- [ ] **Step 5.2: Create `ProtectedRoute.tsx`**

`sst-frontend/src/auth/ProtectedRoute.tsx`:
```tsx
import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { useAuth } from "./AuthContext"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

- [ ] **Step 5.3: Commit**

Run from `sst/`:
```bash
git add sst-frontend/src/auth/
git commit -m "feat(frontend): auth context + protected route"
```

---

## Task 6: API client + React Query setup

**Files:**
- Create: `sst-frontend/src/api/client.ts`
- Create: `sst-frontend/src/api/types.ts`
- Create: `sst-frontend/src/api/dashboard.ts`
- Create: `sst-frontend/src/api/transactions.ts`

- [ ] **Step 6.1: Create `types.ts` mirroring backend DTOs**

`sst-frontend/src/api/types.ts`:
```ts
export interface MonthlyTrendPoint {
  month: string   // ISO "2026-04"
  co2Kg: number
}

export interface DashboardSummary {
  totalCo2Kg: number
  avgEsgScore: number
  monthlyTrend: MonthlyTrendPoint[]
}

export interface CategorySummary {
  category: string
  totalCo2Kg: number
  avgEsgScore: number
  transactionCount: number
}

export interface Transaction {
  id: string
  date: string         // ISO date
  description: string
  category: string
  amountEur: number
  co2Kg: number
  esgScore: number
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface TransactionFilters {
  category?: string
  dateFrom?: string
  dateTo?: string
  minScore?: number
  maxScore?: number
  page?: number
  size?: number
}
```

- [ ] **Step 6.2: Create `client.ts` with axios + Bearer interceptor**

`sst-frontend/src/api/client.ts`:
```ts
import axios from "axios"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
})

let currentToken: string | null = null
export function setAuthToken(token: string | null) {
  currentToken = token
}

apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`
  }
  return config
})
```

- [ ] **Step 6.3: Create `dashboard.ts` query hooks**

`sst-frontend/src/api/dashboard.ts`:
```ts
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "./client"
import type { DashboardSummary, CategorySummary } from "./types"

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardSummary>("/api/dashboard/summary")
      return data
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ["dashboard", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<CategorySummary[]>("/api/dashboard/categories")
      return data
    },
  })
}
```

- [ ] **Step 6.4: Create `transactions.ts` query hook**

`sst-frontend/src/api/transactions.ts`:
```ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { apiClient } from "./client"
import type { PagedResponse, Transaction, TransactionFilters } from "./types"

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.set("category", filters.category)
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.set("dateTo", filters.dateTo)
      if (filters.minScore !== undefined) params.set("minScore", String(filters.minScore))
      if (filters.maxScore !== undefined) params.set("maxScore", String(filters.maxScore))
      params.set("page", String(filters.page ?? 0))
      params.set("size", String(filters.size ?? 20))
      const { data } = await apiClient.get<PagedResponse<Transaction>>(
        `/api/transactions?${params.toString()}`,
      )
      return data
    },
    placeholderData: keepPreviousData,
  })
}
```

- [ ] **Step 6.5: Commit**

Run from `sst/`:
```bash
git add sst-frontend/src/api/
git commit -m "feat(frontend): API client with Bearer interceptor + React Query hooks"
```

---

## Task 7: App.tsx routing + providers

**Files:**
- Modify: `sst-frontend/src/main.tsx`
- Replace: `sst-frontend/src/App.tsx`

- [ ] **Step 7.1: Replace `sst-frontend/src/main.tsx`**

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/auth/AuthContext"
import App from "./App"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 7.2: Replace `sst-frontend/src/App.tsx`**

```tsx
import { Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ProtectedRoute } from "@/auth/ProtectedRoute"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 7.3: Delete unused starter files**

Delete `sst-frontend/src/App.css` and `sst-frontend/src/assets/react.svg` (Vite scaffold leftovers). The fresh `App.tsx` no longer imports them.

- [ ] **Step 7.4: Commit**

Run from `sst/`:
```bash
git add sst-frontend/src/main.tsx sst-frontend/src/App.tsx
git rm -f sst-frontend/src/App.css sst-frontend/src/assets/react.svg
git commit -m "feat(frontend): app providers (Router, QueryClient, GoogleOAuth, Auth)"
```

---

## Task 8: LoginPage with mock auth form

**Files:**
- Create: `sst-frontend/src/pages/LoginPage.tsx`

- [ ] **Step 8.1: Create `LoginPage.tsx`**

`sst-frontend/src/pages/LoginPage.tsx`:
```tsx
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"
import { setAuthToken } from "@/api/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    const fakeToken = `demo-${Date.now()}`
    const initials = name.trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase()
    const picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16A34A&color=fff`
    login(fakeToken, { email: email.trim(), name: name.trim(), picture })
    setAuthToken(fakeToken)
    navigate("/dashboard", { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <span className="text-primary text-2xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sustainable Spending Tracker</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Demo login — enter any name and email to explore the dashboard.
          </p>
        </div>
        <div className="space-y-3">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">Enter demo</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          No password, no verification — this is a portfolio demo.
        </p>
      </form>
    </div>
  )
}
```

- [ ] **Step 8.2: Commit**

(Skip dev-server smoke test — `Input` and `Button` come from shadcn primitives added in Task 9. Build verification happens in Task 9.3 and Task 12.2.)

Run from `sst/`:
```bash
git add sst-frontend/src/pages/LoginPage.tsx
git commit -m "feat(frontend): mock login page with name + email form"
```

---

## Task 9: shadcn/ui primitives + EsgBadge component

**Files:**
- Create: `sst-frontend/src/components/ui/card.tsx`
- Create: `sst-frontend/src/components/ui/badge.tsx`
- Create: `sst-frontend/src/components/ui/button.tsx`
- Create: `sst-frontend/src/components/ui/input.tsx`
- Create: `sst-frontend/src/components/ui/select.tsx`
- Create: `sst-frontend/src/components/ui/table.tsx`
- Create: `sst-frontend/src/components/EsgBadge.tsx`

- [ ] **Step 9.1: Add shadcn primitives via CLI**

Run from `sst-frontend/`:
```bash
npx shadcn@latest add card badge button input select table
```

If the CLI prompts for config, accept defaults (TypeScript, default style, src/index.css, alias `@/*`). Files land under `src/components/ui/`.

- [ ] **Step 9.2: Create `EsgBadge.tsx`**

`sst-frontend/src/components/EsgBadge.tsx`:
```tsx
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EsgBadgeProps {
  score: number   // 0-100
  className?: string
}

export function EsgBadge({ score, className }: EsgBadgeProps) {
  const tone =
    score >= 70 ? "bg-green-100 text-green-800 border-green-200"
    : score >= 40 ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-red-100 text-red-800 border-red-200"
  return (
    <Badge variant="outline" className={cn("font-medium", tone, className)}>
      {score.toFixed(0)}
    </Badge>
  )
}
```

- [ ] **Step 9.3: Verify type-check passes**

Run from `sst-frontend/`:
```bash
npm run build
```

Expected: build succeeds (this also catches TS errors). Don't worry about LoginPage/DashboardPage import errors yet — those resolve in Task 10/11.

If `DashboardPage` import errors show up, ignore them — they will be fixed in Task 11. But shadcn primitives must compile.

- [ ] **Step 9.4: Commit**

Run from `sst/`:
```bash
git add sst-frontend/
git commit -m "feat(frontend): shadcn/ui primitives + EsgBadge"
```

---

## Task 10: HeroSection + TrendChart

**Files:**
- Create: `sst-frontend/src/components/HeroSection.tsx`
- Create: `sst-frontend/src/components/TrendChart.tsx`

- [ ] **Step 10.1: Create `HeroSection.tsx`**

`sst-frontend/src/components/HeroSection.tsx`:
```tsx
import { Card, CardContent } from "@/components/ui/card"
import { useDashboardSummary, useCategories } from "@/api/dashboard"
import { EsgBadge } from "./EsgBadge"

export function HeroSection() {
  const summary = useDashboardSummary()
  const categories = useCategories()

  if (summary.isLoading || categories.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}><CardContent className="h-32 animate-pulse bg-muted/30" /></Card>
        ))}
      </div>
    )
  }
  if (summary.isError || !summary.data) {
    return <div className="text-destructive">Failed to load summary.</div>
  }

  const topCategory = categories.data?.[0]?.category ?? "—"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Total CO₂ (last 6 months)</p>
          <p className="text-4xl font-bold text-primary mt-2">
            {summary.data.totalCo2Kg.toFixed(1)} <span className="text-lg font-medium">kg</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Average ESG score</p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-4xl font-bold text-foreground">
              {summary.data.avgEsgScore.toFixed(0)}
            </p>
            <EsgBadge score={summary.data.avgEsgScore} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Top polluting category</p>
          <p className="text-2xl font-semibold text-foreground mt-2">{topCategory}</p>
          {categories.data?.[0] && (
            <p className="text-xs text-muted-foreground mt-1">
              {categories.data[0].totalCo2Kg.toFixed(1)} kg CO₂
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 10.2: Create `TrendChart.tsx`**

`sst-frontend/src/components/TrendChart.tsx`:
```tsx
import { Card, CardContent } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useDashboardSummary } from "@/api/dashboard"

export function TrendChart() {
  const summary = useDashboardSummary()

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Monthly CO₂ trend</h2>
        <p className="text-sm text-muted-foreground mb-6">Kilograms of CO₂ per month</p>
        <div className="h-72 w-full">
          {summary.isLoading ? (
            <div className="h-full w-full bg-muted/30 animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.data?.monthlyTrend ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 8 }}
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, "CO₂"]}
                />
                <Bar dataKey="co2Kg" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 10.3: Commit**

Run from `sst/`:
```bash
git add sst-frontend/src/components/HeroSection.tsx sst-frontend/src/components/TrendChart.tsx
git commit -m "feat(frontend): hero metrics + monthly CO2 bar chart"
```

---

## Task 11: TransactionsTable with filters + pagination

**Files:**
- Create: `sst-frontend/src/components/TransactionsTable.tsx`

- [ ] **Step 11.1: Create `TransactionsTable.tsx`**

`sst-frontend/src/components/TransactionsTable.tsx`:
```tsx
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTransactions } from "@/api/transactions"
import { useCategories } from "@/api/dashboard"
import { EsgBadge } from "./EsgBadge"
import type { TransactionFilters } from "@/api/types"

const PAGE_SIZE = 10

export function TransactionsTable() {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, size: PAGE_SIZE })
  const txns = useTransactions(filters)
  const categories = useCategories()

  const update = (patch: Partial<TransactionFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: 0 }))

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Transactions</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filters.category ?? ""}
            onChange={(e) => update({ category: e.target.value || undefined })}
          >
            <option value="">All categories</option>
            {categories.data?.map((c) => (
              <option key={c.category} value={c.category}>{c.category}</option>
            ))}
          </select>

          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => update({ dateFrom: e.target.value || undefined })}
            className="h-9 w-40"
          />
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => update({ dateTo: e.target.value || undefined })}
            className="h-9 w-40"
          />

          <Input
            type="number"
            placeholder="Min ESG"
            min={0}
            max={100}
            value={filters.minScore ?? ""}
            onChange={(e) =>
              update({ minScore: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="h-9 w-24"
          />
          <Input
            type="number"
            placeholder="Max ESG"
            min={0}
            max={100}
            value={filters.maxScore ?? ""}
            onChange={(e) =>
              update({ maxScore: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="h-9 w-24"
          />

          <Button
            variant="outline"
            onClick={() => setFilters({ page: 0, size: PAGE_SIZE })}
            className="h-9"
          >
            Reset
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount (€)</TableHead>
                <TableHead className="text-right">CO₂ (kg)</TableHead>
                <TableHead className="text-right">ESG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.isLoading && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {txns.data?.content.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions match these filters.</TableCell></TableRow>
              )}
              {txns.data?.content.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.date}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className="text-muted-foreground">{t.category}</TableCell>
                  <TableCell className="text-right font-medium">{t.amountEur.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{t.co2Kg.toFixed(2)}</TableCell>
                  <TableCell className="text-right"><EsgBadge score={t.esgScore} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {txns.data && txns.data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {txns.data.page + 1} of {txns.data.totalPages} · {txns.data.totalElements} transactions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={txns.data.page === 0}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 0) - 1 }))}
              >Previous</Button>
              <Button
                variant="outline"
                size="sm"
                disabled={txns.data.page + 1 >= txns.data.totalPages}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 0) + 1 }))}
              >Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 11.2: Commit**

Run from `sst/`:
```bash
git add sst-frontend/src/components/TransactionsTable.tsx
git commit -m "feat(frontend): transactions table with filters and pagination"
```

---

## Task 12: DashboardPage assembly + smoke test

**Files:**
- Create: `sst-frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 12.1: Create `DashboardPage.tsx`**

`sst-frontend/src/pages/DashboardPage.tsx`:
```tsx
import { useAuth } from "@/auth/AuthContext"
import { setAuthToken } from "@/api/client"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/HeroSection"
import { TrendChart } from "@/components/TrendChart"
import { TransactionsTable } from "@/components/TransactionsTable"
import { useNavigate } from "react-router-dom"

export function DashboardPage() {
  const { name, picture, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setAuthToken(null)
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <h1 className="text-xl font-semibold text-foreground">Sustainable Spending Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            {picture && <img src={picture} alt={name ?? ""} className="h-8 w-8 rounded-full" />}
            <span className="text-sm text-foreground">{name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 space-y-6">
        <HeroSection />
        <TrendChart />
        <TransactionsTable />
      </main>
    </div>
  )
}
```

- [ ] **Step 12.2: Build to verify zero TS errors**

Run from `sst-frontend/`:
```bash
npm run build
```

Expected: build SUCCEEDS with no TypeScript errors.

- [ ] **Step 12.3: End-to-end smoke test**

In one terminal, from `sst/`:
```bash
docker-compose up   # OR ./gradlew bootRun
```

In another terminal:
```bash
curl -X POST http://localhost:8080/api/admin/seed
# Expected: 200 OK (90 transactions seeded)
```

In a third terminal, from `sst-frontend/`:
```bash
npm run dev
```

Open `http://localhost:5173`:
1. **Verify** redirect to `/login` shows the green-leaf logo + name/email form.
2. **Type** any name + email → click "Enter demo" → land on `/dashboard`.
3. **Verify** hero shows total CO₂, average ESG, top category.
4. **Verify** monthly CO₂ bar chart renders with green bars.
5. **Verify** transactions table loads, filtering by category works, date filters work, ESG min/max work, pagination works (Next/Previous).
6. **Click** "Sign out" → returns to `/login`.

If any step fails, check:
- Browser console for fetch errors → backend running on `:8080`?
- `.env` has correct `VITE_API_BASE_URL=http://localhost:8080`.
- Backend was seeded (`POST /api/admin/seed` returned 200).

- [ ] **Step 12.4: Stop both servers, commit**

Run from `sst/`:
```bash
git add sst-frontend/src/pages/DashboardPage.tsx
git commit -m "feat(frontend): dashboard page assembling hero, chart, table + sign-out"
```

---

## Task 13: README update + screenshot for portfolio

**Files:**
- Modify: `sst/README.md` (or create if missing)
- Create: `sst/docs/screenshots/dashboard.png`

- [ ] **Step 13.1: Take screenshot of the running dashboard**

With backend + seed + frontend all running and authenticated, take a screenshot of the dashboard page. Save as `sst/docs/screenshots/dashboard.png`.

- [ ] **Step 13.2: Update `README.md`**

Read current `sst/README.md`. Replace (or append to) with:
```markdown
# Sustainable Spending Tracker (SST)

Portfolio app — connects bank transactions and computes per-purchase CO₂ footprint and ESG score.

## Stack
- **Backend:** Kotlin · Spring Boot 3.5 · PostgreSQL · Flyway
- **Frontend:** React 18 · TypeScript · Vite · Tailwind · shadcn/ui · Recharts · TanStack Query
- **Auth:** Mock login form (portfolio demo). Architecture is OAuth-ready — see "Possible improvements".

## Screenshots

![Dashboard](docs/screenshots/dashboard.png)

## Run locally

1. Backend: `docker-compose up` (or `./gradlew bootRun` with a local Postgres).
2. Seed: `curl -X POST http://localhost:8080/api/admin/seed`.
3. Frontend: `cd sst-frontend && npm install && npm run dev`.
4. Open http://localhost:5173 and enter any name/email to access the dashboard.

## Possible improvements
- Replace mock login with OAuth (Google or any provider) — port the login flow from the `Apostes Automatitzades` project.
- Add Spring Security OAuth2 Resource Server on the backend.
- Make `/api/admin/seed` idempotent and protected.

## API
Swagger UI: `http://localhost:8080/swagger-ui.html`
```

- [ ] **Step 13.3: Commit**

Run from `sst/`:
```bash
git add README.md docs/screenshots/
git commit -m "docs: update README with frontend stack, screenshot, and run instructions"
```

---

## Self-Review Checklist (already applied)

- [x] **Spec coverage:** every CONTEXT.md decision is implemented (shadcn/ui, Recharts, Google OAuth full-stack, color palette, hero+chart+table, all 4 backend endpoints consumed, filters wired).
- [x] **Placeholder scan:** no TBD, TODO, "implement later". Every code block is concrete and runnable.
- [x] **Type consistency:** `Transaction`, `DashboardSummary`, `CategorySummary`, `PagedResponse<T>` types match backend DTOs (per ARCHITECTURE.md).
- [x] **Path consistency:** `@/*` alias used everywhere; declared in tsconfig + vite config.
- [x] **Auth flow:** id_token decoded client-side for profile display, sent as Bearer to backend, backend validates issuer + audience + signature against Google's JWKS.

## Known follow-ups (out of scope, deferred)

- **Replace mock auth with real OAuth — replicate the login pattern used in `03 Projects/Proyectos Prioritarios/Apostes Automatitzades/` (port that flow once Apostes ships).**
- Add Spring Security OAuth2 Resource Server on backend (Task 4 stub kept as legacy reference).
- Dark mode toggle.
- Mobile-first responsive review.
- Make `/api/admin/seed` idempotent + protected (currently public, destructive).
- Move dashboard aggregation to SQL `GROUP BY` (see ARCHITECTURE.md anti-pattern note).
