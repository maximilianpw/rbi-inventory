// Generated TypeScript interfaces from Go models

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export interface Client {
  id: string
  company_name: string
  yacht_name: string | null
  contact_person: string
  email: string
  phone: string | null
  billing_address: string | null
  default_delivery_address: string | null
  account_status: ClientStatus
  payment_terms: string | null
  credit_limit: number | null
  notes: string | null
  created_at: string
  updated_at: string
}
