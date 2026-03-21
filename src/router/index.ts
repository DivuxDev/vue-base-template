import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
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
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UsersAdminView.vue'),
        meta: { title: 'Gestión de Usuarios', requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'admin/audit-logs',
        name: 'AuditLogs',
        component: () => import('@/views/admin/AuditLogsView.vue'),
        meta: { title: 'Registros de Auditoría', requiresAuth: true, requiresAdmin: true },
      },
    ],
  },
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
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallbackView.vue'),
    meta: { title: 'Autenticando…' },
  },
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

router.beforeEach(async to => {
  document.title = to.meta.title
    ? `${to.meta.title} – ${import.meta.env.VITE_APP_NAME}`
    : (import.meta.env.VITE_APP_NAME as string)

  const authStore = useAuthStore()

  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'Home' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'Home' }
  }
})

window.addEventListener('auth:unauthenticated', () => {
  const authStore = useAuthStore()
  authStore.clearSession()
  router.push({ name: 'Login' })
})

export default router
