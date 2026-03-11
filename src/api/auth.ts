import apiClient from './axios'
import type { AuthResponse, UserResponse, LoginPayload, RegisterPayload } from '@/types/auth'

/**
 * Módulo de llamadas a la API de autenticación.
 * Todos los endpoints apuntan al backend Laravel.
 *
 * Endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/user
 *   GET  /api/auth/google/redirect  (browser redirect, no Axios)
 */

/** POST /api/auth/login */
export const login = (payload: LoginPayload) =>
  apiClient.post<AuthResponse>('/api/auth/login', payload)

/** POST /api/auth/register */
export const register = (payload: RegisterPayload) =>
  apiClient.post<AuthResponse>('/api/auth/register', payload)

/** POST /api/auth/logout  (requiere token Bearer) */
export const logout = () => apiClient.post<void>('/api/auth/logout')

/** GET /api/user  (requiere token Bearer) */
export const getAuthUser = () => apiClient.get<UserResponse>('/api/user')

/**
 * OAuth Google — el navegador redirige directamente a esta URL.
 * El backend gestiona el consent screen y redirige de vuelta con ?token=...
 */
export const googleRedirectUrl = (): string => {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
  return `${base}/api/auth/google/redirect`
}
