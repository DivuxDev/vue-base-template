import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

/**
 * Instancia centralizada de Axios.
 * - Base URL leída del .env (VITE_API_BASE_URL)
 * - Interceptor que agrega el token Bearer en cada request
 * - Interceptor que maneja errores 401 (redirigir a login)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // necesario para Sanctum (cookies de sesión)
})

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado → limpiar sesión y redirigir
      localStorage.removeItem('auth_token')
      // Evitar importar el router aquí para no crear dependencias circulares.
      // La redirección la maneja el guard de rutas en cada navegación.
      window.dispatchEvent(new CustomEvent('auth:unauthenticated'))
    }
    return Promise.reject(error)
  }
)

export default apiClient
