// Generated TypeScript interfaces from Go models

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string;
  brand_id: string | null;
  volume_ml: number | null;
  weight_kg: number | null;
  dimensions_cm: string | null;
  standard_cost: number | null;
  standard_price: number | null;
  markup_percentage: number | null;
  reorder_point: number;
  primary_supplier_id: string | null;
  supplier_sku: string | null;
  is_active: boolean;
  is_perishable: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  product_id: string;
  url: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}
