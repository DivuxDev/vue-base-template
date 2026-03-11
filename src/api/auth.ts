import apiClient from './axios'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth'

/**
 * Módulo de llamadas a la API de autenticación.
 * Todos los endpoints apuntan al backend Laravel.
 */

/** POST /api/login */
export const login = (payload: LoginPayload) =>
  apiClient.post<AuthResponse>('/api/login', payload)

/** POST /api/register */
export const register = (payload: RegisterPayload) =>
  apiClient.post<AuthResponse>('/api/register', payload)

/** POST /api/logout  (requiere token Bearer) */
export const logout = () => apiClient.post<void>('/api/logout')

/** GET /api/user  (requiere token Bearer) */
export const getAuthUser = () => apiClient.get<User>('/api/user')

/**
 * OAuth Google
 * El botón redirige directamente al backend.
 * El backend redirigirá al frontend con ?token=...
 */
export const googleRedirectUrl = (): string => {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
  return `${base}/api/auth/google/redirect`
}
