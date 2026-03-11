/**
 * Tipos base de autenticación usados en toda la aplicación.
 * Estos reflejan la estructura exacta del backend Laravel.
 */

/**
 * Envoltorio estándar de todas las respuestas del backend.
 * { success, data, message }
 */
export interface ApiResponse<T = null> {
  success: boolean
  data: T | null
  message: string
}

/** Errores de validación (422) */
export interface ValidationErrors {
  message: string
  errors?: Record<string, string[]>
}

/** Datos del usuario autenticado */
export interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  created_at?: string
  updated_at?: string
}

/** Payload para login */
export interface LoginPayload {
  email: string
  password: string
}

/** Payload para registro */
export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

/** Datos dentro de data al hacer login/register */
export interface AuthResponseData {
  user: User
  token: string
}

/** Datos dentro de data al obtener el perfil */
export interface UserResponseData {
  user: User
}

/** Respuesta completa de login/register */
export type AuthResponse = ApiResponse<AuthResponseData>

/** Respuesta completa de GET /api/user */
export type UserResponse = ApiResponse<UserResponseData>

/** Estado del store de autenticación */
export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}
