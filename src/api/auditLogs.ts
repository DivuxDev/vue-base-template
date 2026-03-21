import apiClient from './axios'
import type { AuditLog } from '@/types/audit'
import type { ApiResponse } from '@/types/auth'
import type { PaginationParams, PaginationMeta } from '@/types/pagination'

export interface AuditLogsData {
  audit_logs: AuditLog[]
  meta: PaginationMeta
}

export interface AuditLogsResponse extends ApiResponse<AuditLogsData> {}

export interface AuditLogsParams extends PaginationParams {
  action?: string
  from?: string
  to?: string
}

/** GET /api/admin/audit-logs → lista registros de auditoría paginados */
export const getAuditLogs = (params?: AuditLogsParams) =>
  apiClient.get<AuditLogsResponse>('/api/admin/audit-logs', { params })
