import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

/**
 * Instancia centralizada de Axios.
 *
 * En DESARROLLO: baseURL vacío → las peticiones van a /api/... en el mismo
 * origen (localhost:5173), y el proxy de Vite las reenvía a Laravel (8000).
 * Esto evita CORS y "connection refused" desde el navegador.
 *
 * En PRODUCCIÓN: usa VITE_API_BASE_URL del .env (URL absoluta del backend).
 *
 * - Interceptor que agrega el token Bearer en cada request
 * - Interceptor que maneja errores 401 (redirigir a login)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? ''),
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
