/**
 * Tipos base de autenticación usados en toda la aplicación.
 * Estos reflejan la estructura esperada del backend Laravel.
 */

/** Datos del usuario autenticado */
export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

/** Payload para login */
export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

/** Payload para registro */
export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

/** Respuesta del backend al hacer login/register */
export interface AuthResponse {
  token: string
  token_type: string
  user: User
}

/** Estado del store de autenticación */
export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}
