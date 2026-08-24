export type Restaurant = {
  id: number;
  name: string;
  description: string | null;
  delivery_fee: number;
  avg_delivery_time_min: number;
};

export type Product = {
  id: number;
  restaurant_id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

export type Order = {
  id: number;
  restaurant_id: number;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
};
