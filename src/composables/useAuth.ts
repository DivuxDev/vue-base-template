import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginPayload, RegisterPayload } from '@/types/auth'

/**
 * Composable que encapsula la lógica de autenticación
 * y la navegación posterior a cada acción.
 *
 * Uso: const { login, register, logout, isAuthenticated } = useAuth()
 */
export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()

  /**
   * Iniciar sesión.
   * Si tiene éxito, redirige al Home (o a la ruta que el guard guardó).
   */
  async function login(payload: LoginPayload): Promise<void> {
    const ok = await authStore.login(payload)
    if (ok) {
      const redirect = router.currentRoute.value.query.redirect as string | undefined
      await router.push(redirect ?? { name: 'Home' })
    }
  }

  /**
   * Registrar usuario.
   * Si tiene éxito, redirige al Home.
   */
  async function register(payload: RegisterPayload): Promise<void> {
    const ok = await authStore.register(payload)
    if (ok) {
      await router.push({ name: 'Home' })
    }
  }

  /**
   * Cerrar sesión y redirigir al Login.
   */
  async function logout(): Promise<void> {
    await authStore.logout()
    await router.push({ name: 'Login' })
  }

  return {
    login,
    register,
    logout,
    isAuthenticated: authStore.isAuthenticated,
    loading: authStore.loading,
    error: authStore.error,
    user: authStore.user,
  }
}
