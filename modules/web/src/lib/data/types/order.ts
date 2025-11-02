// Generated TypeScript interfaces from Go models

export enum OrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  SOURCING = 'SOURCING',
  PICKING = 'PICKING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  status: OrderStatus;
  delivery_deadline: string | null;
  delivery_address: string;
  yacht_name: string | null;
  special_instructions: string | null;
  total_amount: number;
  created_by: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  quantity_picked: number;
  quantity_packed: number;
  created_at: string;
  updated_at: string;
}
