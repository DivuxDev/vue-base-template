# CLAUDE.md — Vue Base Template

## Project overview
SPA frontend (Vue 3 + TypeScript + Element Plus) that pairs with `laravel-base` backend. Features authentication, admin panel, audit logs, dark mode, and i18n (ES/EN).

## Quick commands
```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check + production build
npm run lint      # ESLint with auto-fix
npm run format    # Prettier format
```

## Architecture

### State management
- **Pinia** store at `src/stores/auth.ts`
- Token persisted in `localStorage` as `auth_token`
- Locale persisted as `locale` (es/en)
- Dark mode persisted as `color-scheme` (dark/light)

### API layer
- `src/api/axios.ts`: Centralized Axios instance with Bearer token interceptor and 401 auto-logout
- In **dev**: baseURL is empty, Vite proxy handles `/api/*` → `http://localhost:8000`
- In **prod**: uses `VITE_API_BASE_URL` as absolute base
- All API modules: `auth.ts`, `adminUsers.ts`, `auditLogs.ts`, `profile.ts`

### Response envelope
Backend returns: `{ success: bool, data: T|null, message: string }`. Paginated responses add `meta` inside `data`.

### Composables
- `useAuth()`: Login/register/logout with router navigation
- `usePagination<T>(fetchFn, defaultParams)`: Generic pagination — auto-fetches on param change, debounced search (300ms), returns data/meta/loading/params
- `useDarkMode()`: Singleton `isDark` ref + `toggleDark()` — adds/removes `.dark` class on `<html>`
- `useLocale()`: `currentLocale` + `setLocale()` — wraps vue-i18n locale switching
- `useNotifications()`: Reverb WebSocket listener for login events

### i18n
- vue-i18n with `legacy: false`
- Locale files: `src/i18n/locales/es.ts` and `en.ts`
- Default: `es`, fallback: `en`
- In components: `const { t } = useI18n()` then `t('key')`
- In stores (outside setup): `import i18n from '@/i18n'` then `i18n.global.t('key')`

### Dark mode
- Element Plus dark vars imported in `main.ts`: `element-plus/theme-chalk/dark/css-vars.css`
- Custom vars in `src/assets/styles/dark.css` for app-specific colors
- All views use CSS variables: `var(--app-text)`, `var(--app-bg)`, `var(--app-card-bg)`, etc.
- Auth page gradients: `var(--auth-gradient-start)` / `var(--auth-gradient-end)`

### Routing
- `src/router/index.ts` with meta-based guards: `requiresAuth`, `requiresAdmin`, `guestOnly`
- `router.beforeEach`: hydrates user from token if needed, enforces access rules
- `auth:unauthenticated` custom event from Axios interceptor triggers auto-logout

### Type system
- `src/types/auth.ts`: User, LoginPayload, RegisterPayload, ApiResponse, AuthResponse
- `src/types/pagination.ts`: PaginationMeta, PaginationParams, PaginatedResponse
- `src/types/audit.ts`: AuditLog
- `src/types/router.d.ts`: RouteMeta extension

### Styling approach
- Element Plus as component library (auto-imported via unplugin)
- CSS variables for dark mode compatibility (NO hardcoded colors in scoped styles)
- No Tailwind — pure scoped CSS with BEM-inspired naming

## Key files to modify for common tasks
- **Add new page**: Create view in `src/views/`, add route in `src/router/index.ts`, add nav link in `MainLayout.vue`
- **Add new API endpoint**: Create/edit module in `src/api/`, add types in `src/types/`
- **Add new translation key**: Add to both `src/i18n/locales/es.ts` and `en.ts`
- **Add paginated data view**: Use `usePagination()` composable — see `UsersAdminView.vue` as reference
- **Dark mode compatibility**: Use `var(--app-*)` CSS variables, never hardcode colors like `#303133` or `#fff`

## Important conventions
- All user-visible strings MUST use `$t()` or `t()` — no hardcoded text in templates
- API functions accept typed params and return typed responses
- Composables handle side effects (navigation, localStorage) — stores handle state
- `ElMessage` for success/error toasts, `ElMessageBox.confirm` for destructive actions
