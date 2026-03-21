import apiClient from './axios'
import type { UserResponse } from '@/types/auth'

/** PUT /api/user/profile → actualiza nombre y/o avatar del usuario autenticado */
export const updateProfile = (formData: FormData) =>
  apiClient.put<UserResponse>('/api/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
