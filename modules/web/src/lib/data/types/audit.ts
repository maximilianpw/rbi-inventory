// Generated TypeScript interfaces from Go models

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ADJUST_QUANTITY = 'ADJUST_QUANTITY',
  ADD_PHOTO = 'ADD_PHOTO',
  STATUS_CHANGE = 'STATUS_CHANGE',
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: AuditAction
  entity_type: string
  entity_id: string
  changes: string | null // JSONB stored as string
  ip_address: string | null
  created_at: string
}
