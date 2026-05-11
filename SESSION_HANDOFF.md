# Session Handoff — SST Deploy — 2026-05-06

## Estado actual

**Deploy en progreso.** Steps 1+2 completos. Bloqueado en Step 3 (GitHub repo) porque `gh` CLI no instalado.

---

## Qué está hecho ESTA sesión

### ✅ Step 1 — build.gradle.kts committado
- H2 movido de `testImplementation` → `runtimeOnly`
- Útil para dev local sin Docker: `.\gradlew.bat bootRun --args='--spring.profiles.active=test'`
- Commit: `e91df5c`

### ✅ Step 2 — WebConfig.kt patchado
- CORS ya no hardcodeado — lee env var `CORS_ORIGINS`
- Default: `http://localhost:5173,http://localhost:3000` (dev funciona sin config)
- En Railway setear: `CORS_ORIGINS=https://<vercel-url>`
- Commit: `e91df5c` (junto con Step 1)

### ❌ Step 3 — GitHub repo: PENDIENTE
- `gh` CLI no instalado en el sistema
- **Próxima acción:** instalar `gh` CLI o crear repo manualmente

---

## Próxima acción al volver

**OPCIÓN A — Instalar gh CLI (recomendado):**
```powershell
winget install GitHub.cli
# reiniciar terminal
gh auth login
cd "C:\Users\llina\Desktop\SecondBrain\03 Projects\Sustainable Spending Tracker\sst"
gh repo create sst --public --source=. --remote=origin --push
```

**OPCIÓN B — Manual (si no quieres instalar gh):**
1. Ve a github.com/new → nombre `sst` → Public → "Create repository"
2. Luego en terminal:
```powershell
cd "C:\Users\llina\Desktop\SecondBrain\03 Projects\Sustainable Spending Tracker\sst"
git remote add origin https://github.com/rogerllinares/sst.git
git branch -M main
git push -u origin main
```
(Cambiar `rogerllinares` por tu username real de GitHub)

---

## Plan completo de deploy (steps pendientes)

### Step 3 — Crear GitHub repo y push ← AQUÍ
```powershell
gh repo create sst --public --source=. --remote=origin --push
```
Verify: repo visible en github.com

### Step 4 — Deploy backend en Railway
1. Instalar Railway CLI: `npm install -g @railway/cli`
2. `railway login` (abre browser)
3. Desde `sst/`: `railway init` → seleccionar repo GitHub
4. `railway add --plugin postgresql` → auto-set `DATABASE_URL`
5. Set env vars:
   - `DB_USER=sst`
   - `DB_PASS=<password seguro>`
   - `CORS_ORIGINS=https://PLACEHOLDER` (actualizar en Step 6)
6. `railway up`

Verify: `https://<app>.up.railway.app/swagger-ui/index.html` → 200

### Step 5 — Crear .env.production para frontend
Antes de deployar Vercel, crear el archivo con la URL de Railway:
```
# sst/sst-frontend/.env.production
VITE_API_BASE_URL=https://<tu-app>.up.railway.app
```
Commit + push.

### Step 6 — Deploy frontend en Vercel
```powershell
cd "C:\Users\llina\Desktop\SecondBrain\03 Projects\Sustainable Spending Tracker\sst\sst-frontend"
npx vercel
# Responder:
#   Project name: sst-frontend
#   Framework: Vite
#   Build command: npm run build
#   Output: dist
```
O via vercel.com → "New Project" → importar repo GitHub → root dir: `sst/sst-frontend`

Set env var en Vercel dashboard:
- `VITE_API_BASE_URL=https://<app>.up.railway.app`

Verify: `https://<project>.vercel.app/login` carga

### Step 7 — Actualizar CORS en Railway
Ahora que tienes la URL de Vercel:
```powershell
railway variables set CORS_ORIGINS=https://<project>.vercel.app
```
Railway redeploya solo.

Verify: Network tab en browser no muestra errores CORS.

### Step 8 — Seed datos en producción
```powershell
Invoke-RestMethod -Method Post -Uri https://<app>.up.railway.app/api/admin/seed
```
Verify: dashboard muestra datos reales.

### Step 9 — Screenshot + portfolio
- Screenshot del dashboard live → guardar en `docs/screenshots/dashboard-prod.png`
- Actualizar `README.md` con live URLs
- Commit + push

---

## Orden crítico (no saltarse)

```
GitHub push → Railway deploy → URL Railway conocida
→ crear .env.production → Vercel deploy → URL Vercel conocida
→ CORS_ORIGINS Railway → seed → screenshot
```

---

## Info técnica clave

| | |
|---|---|
| Backend stack | Kotlin + Spring Boot 3.5.0 + PostgreSQL + Flyway |
| Frontend stack | Vite 5 + React 19 + TypeScript + TailwindCSS + shadcn/ui |
| Auth | Mock login (nombre + email → token falso en memoria) |
| Endpoints | `POST /api/admin/seed`, `GET /api/dashboard/summary`, `GET /api/dashboard/categories`, `GET /api/transactions` |
| Swagger | `/swagger-ui/index.html` |
| Env vars prod | `DATABASE_URL` (Railway auto), `DB_USER`, `DB_PASS`, `CORS_ORIGINS` |
| Rama git | `master` (local), sin remote todavía |
| Último commit | `e91df5c` — H2 runtimeOnly + CORS env var |

## Archivos importantes

| Archivo | Para qué |
|---|---|
| `src/main/kotlin/com/rogerllina/sst/config/WebConfig.kt` | CORS config (ya patchado) |
| `sst-frontend/.env` | URL API dev (localhost:8080) |
| `sst-frontend/.env.production` | URL API prod ← CREAR en Step 5 |
| `docker-compose.yml` | Dev local con Postgres |
| `Dockerfile` | Deploy Railway (ya existe, funciona) |
| `docs/superpowers/plans/2026-05-06-frontend-dashboard.md` | Plan completo frontend (referencia) |
