# KBV Education — Web (Phase 1)

Course Companion Platform frontend. React 19 · TypeScript · Vite · TailwindCSS ·
React Router · React Query · Zustand · React Hook Form · Axios.

## Architecture — Feature-Based

```
src/
  app/            App composition: providers + router
  components/     Cross-feature reusable UI
    ui/           Button, Input, Card, Badge, Spinner…
    layout/       AuthLayout, DashboardLayout, Sidebar, Topbar
    form/         FormField and form primitives
    feedback/     ErrorBoundary, PagePlaceholder
  config/         env + app constants
  lib/            apiClient (Axios + interceptors), queryClient, utils
  routes/         paths, ProtectedRoute, RoleGuard
  types/          Shared API + pagination types
  features/       Feature modules (self-contained)
    auth/         api · hooks · store · types · pages
    dashboard/    pages
    users/ students/ parents/ cohorts/ profile/  pages (+ api/hooks in later steps)
    misc/         NotFoundPage
```

Each **feature** owns its `api/`, `hooks/`, `store/`, `types/`, `components/`,
and `pages/`. Anything shared across features lives under top-level
`components/`, `lib/`, `hooks/`, `types/`.

### Foundations wired in Step 2
- **Axios client** (`lib/apiClient.ts`) — attaches the bearer token and
  transparently refreshes an expired access token once (single-flight queue),
  logging out on refresh failure.
- **Auth store** (`features/auth/store/authStore.ts`) — Zustand + `persist`.
- **Routing** — `createBrowserRouter` with `ProtectedRoute` (auth) and
  `RoleGuard` (role-based) guards.
- **Providers** — React Query, `react-hot-toast`, and a top-level
  `ErrorBoundary`.
- **Theme** — Tailwind tokens: primary `#1B3A6B`, accent `#C4972A`, surface
  `#F2F6FA`, Inter font (self-hosted via `@fontsource/inter`).

## Requirements
- Node.js 20+ and Yarn 1.x

## Getting started
```bash
yarn install
# .env.development is already present; adjust if needed
yarn dev                           # http://localhost:5173
```
The dev server proxies `/api` to the Spring Boot backend at
`http://localhost:8080` (see `vite.config.ts`).

## Scripts
| Script | Purpose |
|--------|---------|
| `yarn dev` | Start Vite dev server |
| `yarn build` | Type-check + production build |
| `yarn preview` | Preview the production build |
| `yarn lint` | ESLint |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn format` | Prettier |
| `yarn test` | Vitest (jsdom + Testing Library), single run |
| `yarn test:watch` | Vitest in watch mode |
| `yarn test:coverage` | Vitest with a v8 coverage report |

## Testing

Vitest + `@testing-library/react` + jsdom (introduced in Phase 5 Step 10 —
no test tooling existed before). Coverage is intentionally not comprehensive
yet: a handful of components (`Button`, `Modal`'s focus-trap/return-focus
behavior from decision #12, `ExportButtons`) plus one page test
(`ApplicationLogsPage`) with a mocked API. `npm test` runs in CI on every
push (see `.github/workflows/ci.yml`).

## Docker

```bash
docker build -t kbv-education-web --build-arg VITE_API_BASE_URL=/api .
```

Multi-stage build: `npm run build` in a Node image, then the static `dist/`
is served by nginx (`nginx.conf`), which reverse-proxies `/api/*` to the
backend container so the browser only ever talks to one origin. For the full
stack (Postgres + backend + frontend), see `DEPLOYMENT.md` and
`docker-compose.yml` in the sibling `kbv-education` repo — the compose file
expects both repos checked out side by side.

## Build plan
- [x] **Step 1** — Backend structure
- [x] **Step 2** — Frontend structure & foundations
- [ ] **Step 3** — Database schema
- [ ] **Step 4** — Authentication APIs
- [ ] **Step 5** — Admin APIs
- [x] **Step 6** — Frontend login (real form)
- [x] **Step 7** — Dashboards
- [x] **Step 8** — CRUD pages
