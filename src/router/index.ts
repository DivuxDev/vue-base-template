import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Definición de rutas de la aplicación.
 * - meta.requiresAuth = true  → solo accesible con sesión activa
 * - meta.guestOnly    = true  → redirige al home si ya está logueado
 */
const routes: RouteRecordRaw[] = [
  // ── Rutas con layout principal ──────────────────────────────────────────
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Inicio' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: 'Mi Perfil', requiresAuth: true },
      },
    ],
  },

  // ── Rutas de autenticación (sin layout principal) ────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Iniciar Sesión', guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Registrarse', guestOnly: true },
  },

  // ── Callback OAuth Google ────────────────────────────────────────────────
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallbackView.vue'),
    meta: { title: 'Autenticando…' },
  },

  // ── 404 ─────────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// ─── Navigation Guard ──────────────────────────────────────────────────────────
router.beforeEach(async to => {
  // Actualizar el título de la pestaña
  document.title = to.meta.title
    ? `${to.meta.title} – ${import.meta.env.VITE_APP_NAME}`
    : (import.meta.env.VITE_APP_NAME as string)

  const authStore = useAuthStore()

  // Si hay token pero aún no se cargó el usuario, intentamos obtenerlo
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  // Ruta protegida → redirigir a login si no está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Ruta solo para invitados → redirigir al home si ya está logueado
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'Home' }
  }
})

// ─── Manejar evento de 401 del interceptor de Axios ──────────────────────────
window.addEventListener('auth:unauthenticated', () => {
  const authStore = useAuthStore()
  authStore.clearSession()
  router.push({ name: 'Login' })
})

export default router
