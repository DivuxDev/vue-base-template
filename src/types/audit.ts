export interface AuditLog {
  id: number
  user: { id: number; name: string; email: string } | null
  action: string
  auditable_type: string | null
  auditable_id: number | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string
  created_at: string
}
