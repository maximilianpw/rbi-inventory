// Generated TypeScript interfaces from Go models

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_id: string;
  supplier_sku: string | null;
  cost_per_unit: number | null;
  lead_time_days: number | null;
  minimum_order_quantity: number | null;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
}
