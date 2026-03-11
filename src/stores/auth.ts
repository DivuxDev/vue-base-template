import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginPayload, RegisterPayload } from '@/types/auth'
import * as authApi from '@/api/auth'
import { ElMessage } from 'element-plus'

/**
 * Store de autenticación.
 * Maneja el ciclo completo: login, register, logout, carga del usuario.
 * El token se persiste en localStorage para sobrevivir recargas de página.
 */
export const useAuthStore = defineStore('auth', () => {
  // ─── State ─────────────────────────────────────────────────────────────────
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Getters ───────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userName = computed(() => user.value?.name ?? '')

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }

  function clearSession() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  /** Iniciar sesión con email y contraseña */
  async function login(payload: LoginPayload): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const { data: envelope } = await authApi.login(payload)
      // Respuesta: { success, data: { user, token }, message }
      if (!envelope.success || !envelope.data) throw new Error(envelope.message)
      setToken(envelope.data.token)
      user.value = envelope.data.user
      ElMessage.success(`Bienvenido, ${envelope.data.user.name}`)
      return true
    } catch (err: unknown) {
      error.value = extractErrorMessage(err)
      ElMessage.error(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  /** Registrar nuevo usuario */
  async function register(payload: RegisterPayload): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const { data: envelope } = await authApi.register(payload)
      if (!envelope.success || !envelope.data) throw new Error(envelope.message)
      setToken(envelope.data.token)
      user.value = envelope.data.user
      ElMessage.success('Cuenta creada exitosamente')
      return true
    } catch (err: unknown) {
      error.value = extractErrorMessage(err)
      ElMessage.error(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  /** Cerrar sesión */
  async function logout(): Promise<void> {
    loading.value = true
    try {
      await authApi.logout()
    } catch {
      // Si el backend falla, igual limpiamos la sesión local
    } finally {
      clearSession()
      loading.value = false
    }
  }

  /** Obtener usuario desde GET /api/user (usado al cargar la app si hay token) */
  async function fetchUser(): Promise<void> {
    if (!token.value) return
    loading.value = true
    try {
      const { data: envelope } = await authApi.getAuthUser()
      // Respuesta: { success, data: { user }, message }
      if (!envelope.success || !envelope.data) throw new Error('Sesión inválida')
      user.value = envelope.data.user
    } catch {
      // Token inválido → limpiar sesión
      clearSession()
    } finally {
      loading.value = false
    }
  }

  /**
   * Guardar token recibido desde OAuth (callback de Google).
   * Llama a fetchUser() para cargar los datos del usuario.
   */
  async function handleOAuthCallback(oauthToken: string): Promise<void> {
    setToken(oauthToken)
    await fetchUser()
  }

  return {
    // state
    user,
    token,
    loading,
    error,
    // getters
    isAuthenticated,
    userName,
    // actions
    login,
    register,
    logout,
    fetchUser,
    handleOAuthCallback,
    clearSession,
  }
})

// ─── Utilidad ─────────────────────────────────────────────────────────────────
/**
 * Extrae el mensaje de error más útil del error de Axios.
 * Maneja:
 *  - 401: credenciales incorrectas  → mensaje del backend
 *  - 422: errores de validación     → primer error de campo o mensaje
 *  - 429: rate limit                → mensaje amigable
 *  - otros: mensaje genérico
 */
function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    // Error lanzado manualmente (e.g. success = false)
    if (err instanceof Error) return err.message

    if ('response' in err) {
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
      }
      const status = axiosErr.response?.status
      const body = axiosErr.response?.data

      if (status === 429) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'

      // 422: devolver el primer error de campo si existe
      if (status === 422 && body?.errors) {
        const firstField = Object.values(body.errors)[0]
        if (firstField?.length) return firstField[0]
      }

      return body?.message ?? 'Error inesperado'
    }
  }
  return 'Error de conexión'
}
