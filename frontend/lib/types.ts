export type UserRole = "cliente" | "dono_restaurante" | "entregador" | "admin";

export type Restaurant = {
  id: number;
  owner_user_id: number;
  name: string;
  description: string | null;
  delivery_fee: number;
  avg_delivery_time_min: number;
  is_active: boolean;
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

export type Address = {
  id: number;
  user_id: number;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  complement: string | null;
  reference: string | null;
};

export type CartItem = {
  id: number;
  product_id: number;
  restaurant_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type Delivery = {
  id: number;
  order_id: number;
  courier_user_id: number | null;
  status: string;
  started_at: string | null;
  delivered_at: string | null;
};
