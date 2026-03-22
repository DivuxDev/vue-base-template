import apiClient from './axios'

/** POST /api/auth/forgot-password */
export const forgotPassword = (email: string) =>
  apiClient.post('/api/auth/forgot-password', { email })

/** POST /api/auth/reset-password */
export const resetPassword = (payload: {
  token: string
  email: string
  password: string
  password_confirmation: string
}) => apiClient.post('/api/auth/reset-password', payload)
