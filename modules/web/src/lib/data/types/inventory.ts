// Generated TypeScript interfaces from Go models

export enum StockMovementReason {
  PURCHASE_RECEIVE = 'PURCHASE_RECEIVE',
  SALE = 'SALE',
  WASTE = 'WASTE',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
  COUNT_CORRECTION = 'COUNT_CORRECTION',
  RETURN_FROM_CLIENT = 'RETURN_FROM_CLIENT',
  RETURN_TO_SUPPLIER = 'RETURN_TO_SUPPLIER',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
}
export enum LocationType {
  WAREHOUSE = 'WAREHOUSE',
  SUPPLIER = 'SUPPLIER',
  IN_TRANSIT = 'IN_TRANSIT',
  CLIENT = 'CLIENT',
}

export interface Location {
  id: string
  name: string
  type: LocationType
  address: string | null
  contact_person: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  product_id: string
  location_id: string
  quantity: number
  batch_number: string | null
  expiry_date: string | null
  cost_per_unit: number | null
  received_date: string | null
  updated_at: string
}

export interface StockMovement {
  id: string
  product_id: string
  from_location_id: string | null
  to_location_id: string | null
  quantity: number
  reason: StockMovementReason
  order_id: string | null
  reference_number: string | null
  cost_per_unit: number | null
  user_id: string
  notes: string | null
  created_at: string
}
