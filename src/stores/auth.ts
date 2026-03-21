import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginPayload, RegisterPayload } from '@/types/auth'
import * as authApi from '@/api/auth'
import * as profileApi from '@/api/profile'
import { ElMessage } from 'element-plus'
import i18n from '@/i18n'

const t = (key: string, params?: Record<string, unknown>) =>
  i18n.global.t(key, params ?? {})

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name ?? '')

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }

  function clearSession() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  async function login(payload: LoginPayload): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const { data: envelope } = await authApi.login(payload)
      if (!envelope.success || !envelope.data) throw new Error(envelope.message)
      setToken(envelope.data.token)
      user.value = envelope.data.user
      ElMessage.success(t('auth.welcome', { name: envelope.data.user.name }))
      return true
    } catch (err: unknown) {
      error.value = extractErrorMessage(err)
      ElMessage.error(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const { data: envelope } = await authApi.register(payload)
      if (!envelope.success || !envelope.data) throw new Error(envelope.message)
      setToken(envelope.data.token)
      user.value = envelope.data.user
      ElMessage.success(t('auth.accountCreated'))
      return true
    } catch (err: unknown) {
      error.value = extractErrorMessage(err)
      ElMessage.error(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    try {
      await authApi.logout()
    } catch {
    } finally {
      clearSession()
      loading.value = false
    }
  }

  async function fetchUser(): Promise<void> {
    if (!token.value) return
    loading.value = true
    try {
      const { data: envelope } = await authApi.getAuthUser()
      if (!envelope.success || !envelope.data) throw new Error('Sesión inválida')
      user.value = envelope.data.user
    } catch {
      clearSession()
    } finally {
      loading.value = false
    }
  }

  async function handleOAuthCallback(oauthToken: string): Promise<void> {
    setToken(oauthToken)
    await fetchUser()
  }

  async function updateProfile(formData: FormData): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const { data: envelope } = await profileApi.updateProfile(formData)
      if (!envelope.success || !envelope.data) throw new Error(envelope.message)
      user.value = envelope.data.user
      ElMessage.success(t('profile.changesSaved'))
      return true
    } catch (err: unknown) {
      error.value = extractErrorMessage(err)
      ElMessage.error(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user, token, loading, error,
    isAuthenticated, isAdmin, userName,
    login, register, logout, fetchUser, handleOAuthCallback, clearSession, updateProfile,
  }
})

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    if (err instanceof Error) return err.message
    if ('response' in err) {
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
      }
      const status = axiosErr.response?.status
      const body = axiosErr.response?.data
      if (status === 429) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
      if (status === 422 && body?.errors) {
        const firstField = Object.values(body.errors)[0]
        if (firstField?.length) return firstField[0]
      }
      return body?.message ?? 'Error inesperado'
    }
  }
  return 'Error de conexión'
}
