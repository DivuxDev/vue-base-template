import apiClient from './axios'
import type { User } from '@/types/auth'
import type { ApiResponse } from '@/types/auth'
import type { PaginationParams, PaginationMeta } from '@/types/pagination'

/**
 * Módulo de llamadas a la API de administración de usuarios.
 * Todos los endpoints requieren Bearer token + rol admin.
 *
 *   GET    /api/admin/users
 *   PATCH  /api/admin/users/{id}/role
 *   POST   /api/admin/users/{id}/reset-password
 *   DELETE /api/admin/users/{id}
 */

export interface AdminUsersData {
  users: User[]
  meta: PaginationMeta
}

export interface AdminUsersResponse extends ApiResponse<AdminUsersData> {}
export interface AdminUserResponse extends ApiResponse<{ user: User }> {}
export interface ResetPasswordResponse extends ApiResponse<{ new_password: string }> {}

/** GET /api/admin/users → lista todos los usuarios con paginación */
export const getUsers = (params?: PaginationParams) =>
  apiClient.get<AdminUsersResponse>('/api/admin/users', { params })

/**
 * PATCH /api/admin/users/{id}/role
 * Cambia el rol de un usuario.
 */
export const changeUserRole = (id: number, role: 'admin' | 'user') =>
  apiClient.patch<AdminUserResponse>(`/api/admin/users/${id}/role`, { role })

/**
 * POST /api/admin/users/{id}/reset-password
 * Genera una nueva contraseña aleatoria. Devuelve la contraseña en texto plano.
 */
export const resetPassword = (id: number) =>
  apiClient.post<ResetPasswordResponse>(`/api/admin/users/${id}/reset-password`)

/** DELETE /api/admin/users/{id} → elimina el usuario */
export const deleteUser = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/api/admin/users/${id}`)
