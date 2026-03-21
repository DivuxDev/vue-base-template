# Vue Base Template

SPA frontend built with **Vue 3 + Vite + TypeScript + Element Plus**, preconfigured to connect to the [laravel-base](../laravel-base) backend via **Sanctum Bearer token** auth, **Google OAuth**, and **Laravel Reverb** WebSockets.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build tool | Vite 5 |
| Language | TypeScript |
| UI components | Element Plus |
| State management | Pinia |
| Routing | Vue Router 4 |
| HTTP client | Axios (with interceptors) |
| WebSockets | Laravel Echo + pusher-js (Reverb) |
| Internationalization | vue-i18n (Spanish + English) |
| Auto-imports | unplugin-auto-import + unplugin-vue-components |

---

## Features

- **Authentication** — Login, register, logout with Sanctum Bearer tokens + Google OAuth
- **Dark mode** — Light/dark theme toggle with persistence (localStorage + system preference)
- **Internationalization (i18n)** — Full Spanish and English support, instant language switching
- **Profile editing** — Edit name and upload avatar from the profile page
- **Admin panel** — User management with pagination, search, sorting, role changes, password resets
- **Audit logs** — Admin view of all system actions with filters by action, date range, and user search
- **Pagination composable** — Generic `usePagination()` with debounced search, sorting, and page size
- **WebSocket notifications** — Real-time login toasts via Laravel Reverb
- **Route guards** — Role-based access control (auth, admin, guest-only)
- **Loading states** — Skeleton loaders on all views during data fetch

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in your values
cp .env.example .env

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment variables

Copy `.env.example` to `.env`:

```env
# Backend API base URL (used in production builds only — dev uses Vite proxy)
VITE_API_BASE_URL=http://localhost:8000

# Laravel Reverb WebSocket
# Must match REVERB_APP_KEY in the Laravel .env
VITE_REVERB_APP_KEY=your_reverb_app_key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8081
VITE_REVERB_SCHEME=http

# App metadata
VITE_APP_NAME="Vue Base Template"
VITE_APP_URL=http://localhost:5173
```

> In **development**, Axios sends requests to `/api/...` which Vite proxies to `http://localhost:8000`. No CORS issues.
> In **production**, Axios uses `VITE_API_BASE_URL` as the absolute base URL.

---

## Project structure

```
src/
├── api/
│   ├── axios.ts              # Axios instance — Vite proxy in dev, absolute URL in prod
│   ├── auth.ts               # Auth endpoints (register, login, logout, user)
│   ├── adminUsers.ts         # Admin user management endpoints (paginated)
│   ├── auditLogs.ts          # Admin audit log endpoints (paginated, filterable)
│   └── profile.ts            # Profile update endpoint (multipart/form-data)
├── assets/
│   └── styles/
│       ├── main.css          # Global styles with CSS variables
│       └── dark.css          # Dark mode CSS custom properties
├── components/
│   ├── NotificationToast.vue # Real-time login notifications via Reverb
│   └── layout/
│       └── MainLayout.vue    # App shell: navbar, dark mode toggle, language switcher
├── composables/
│   ├── useAuth.ts            # Auth actions + navigation logic
│   ├── useDarkMode.ts        # Dark mode toggle with persistence
│   ├── useLocale.ts          # Language switching (ES/EN) with persistence
│   ├── useNotifications.ts   # WebSocket notification listener
│   └── usePagination.ts      # Generic pagination, search, sort composable
├── i18n/
│   ├── index.ts              # vue-i18n setup
│   └── locales/
│       ├── es.ts             # Spanish translations
│       └── en.ts             # English translations
├── lib/
│   └── echo.ts               # Laravel Echo instance (conditionally created)
├── router/
│   └── index.ts              # Routes + navigation guards
├── stores/
│   └── auth.ts               # Pinia auth store (user, token, isAdmin, updateProfile)
├── types/
│   ├── auth.ts               # TypeScript types for User, AuthResponse, etc.
│   ├── audit.ts              # AuditLog type
│   ├── pagination.ts         # PaginationMeta, PaginationParams, PaginatedResponse
│   └── router.d.ts           # Vue Router meta type extensions
└── views/
    ├── HomeView.vue           # Landing page with feature showcase
    ├── LoginView.vue          # Login form + Google OAuth
    ├── RegisterView.vue       # Registration with password policy hints
    ├── ProfileView.vue        # Profile view + edit dialog (name, avatar)
    ├── AuthCallbackView.vue   # Reads ?token= after Google OAuth redirect
    └── admin/
        ├── UsersAdminView.vue  # User management: search, pagination, sort, CRUD
        └── AuditLogsView.vue   # Audit logs: filters, expandable diff rows
```

---

## Routing and access control

Routes are protected via `router.beforeEach` navigation guards using route meta flags:

| Meta flag | Behavior |
|---|---|
| `requiresAuth: true` | Redirects to `/login` if not authenticated |
| `requiresAdmin: true` | Redirects to `/` if authenticated but not admin |
| `guestOnly: true` | Redirects to `/` if already authenticated |

### Route list

| Path | Name | Access | Description |
|---|---|---|---|
| `/` | `Home` | Public | Landing page with feature cards |
| `/login` | `Login` | Guest only | Login form |
| `/register` | `Register` | Guest only | Registration form |
| `/profile` | `Profile` | Auth required | User profile + edit dialog |
| `/admin/users` | `AdminUsers` | Admin only | User management with pagination |
| `/admin/audit-logs` | `AuditLogs` | Admin only | Audit log viewer with filters |
| `/auth/callback` | `AuthCallback` | Public | Receives token from Google OAuth |

---

## Dark mode

Toggle dark/light mode via the moon/sun icon in the header. State is persisted to `localStorage` under `color-scheme` and falls back to the system `prefers-color-scheme` preference.

Uses Element Plus built-in dark CSS variables (`element-plus/theme-chalk/dark/css-vars.css`) plus custom `dark.css` with app-specific variables.

---

## Internationalization (i18n)

The app supports **Spanish** (default) and **English**. Switch languages via the ES/EN dropdown in the header. The choice is persisted to `localStorage` under `locale`.

All user-facing strings use `$t('key')` / `t('key')` via vue-i18n. Translation files are at `src/i18n/locales/es.ts` and `src/i18n/locales/en.ts`.

---

## Authentication

The app uses **Sanctum Bearer tokens** stored in `localStorage` under the key `auth_token`.

**Login flow:**
1. `POST /api/auth/login` → receives `{ user, token }`
2. Token stored in `localStorage` + Pinia store
3. Axios request interceptor injects `Authorization: Bearer {token}` on every request
4. On `401` response, token is removed and `auth:unauthenticated` event dispatched (router guard redirects to `/login`)

**Logout flow:**
1. `POST /api/auth/logout` → revokes token on server
2. Local store and `localStorage` cleared
3. Navigate to `/login`

---

## Google OAuth flow

1. User clicks "Login with Google"
2. Frontend redirects browser to `http://localhost:8000/api/auth/google/redirect`
3. Google redirects to Laravel callback
4. Laravel redirects to `/auth/callback?token=<sanctum_token>`
5. `AuthCallbackView.vue` reads `?token=` from query params, stores it, navigates to `/`
6. On error, Laravel redirects to `/auth/callback?error=google_auth_failed`

---

## Pagination composable

The `usePagination<T>()` composable provides a generic way to fetch paginated data from any backend endpoint:

```ts
const { data, meta, loading, goToPage, setSearch, setSort, refresh, params } =
  usePagination(fetchFn, { per_page: 15 })
```

Features:
- Auto-fetches on any param change (page, search, sort, per_page)
- Debounced search (300ms)
- Configurable default params
- Returns reactive `meta` with `current_page`, `last_page`, `per_page`, `total`

---

## WebSocket (Reverb)

Echo is initialized in `src/lib/echo.ts` only when `VITE_REVERB_APP_KEY` is set. It connects to Reverb using the `pusher-js` adapter.

The `NotificationToast.vue` component listens to the public `notifications` channel and shows a toast when another user logs in:

```ts
echo.channel('notifications').listen('.user.logged-in', (e) => {
  // shows notification: "{name} just logged in"
})
```

---

## API integration

### Endpoints consumed

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/user` | Get current user |
| `PUT` | `/api/user/profile` | Update name/avatar (multipart) |
| `GET` | `/api/admin/users` | List users (paginated, searchable) |
| `PATCH` | `/api/admin/users/{id}/role` | Change role (admin) |
| `POST` | `/api/admin/users/{id}/reset-password` | Reset password (admin) |
| `DELETE` | `/api/admin/users/{id}` | Delete user (admin) |
| `GET` | `/api/admin/audit-logs` | List audit logs (paginated, filterable) |

### Response envelope

All backend responses follow:

```json
{
  "success": true,
  "data": { ... },
  "message": "string"
}
```

Paginated endpoints include `meta` inside `data`:

```json
{
  "data": {
    "users": [...],
    "meta": { "current_page": 1, "last_page": 5, "per_page": 15, "total": 72 }
  }
}
```

---

## Connecting to the backend

1. Make sure [laravel-base](../laravel-base) is running on `http://localhost:8000`
2. Set `VITE_REVERB_APP_KEY` to the same value as `REVERB_APP_KEY` in the Laravel `.env`
3. Run `npm run dev` — the Vite proxy handles `/api/*` → `http://localhost:8000`

### Vite proxy (development only)

Configured in `vite.config.ts`:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  }
}
```

---

## Available scripts

```bash
npm run dev       # Start development server (http://localhost:5173)
npm run build     # Type-check + production build
npm run preview   # Preview production build locally
npm run lint      # ESLint with auto-fix
npm run format    # Prettier format all src files
```

---

## Test accounts (from Laravel seeder)

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `password` | Admin — access to `/admin/users` and `/admin/audit-logs` |
| `user@example.com` | `password` | Regular user |
| `test@example.com` | `password` | Regular user |
