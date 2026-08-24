export type UserRole = "cliente" | "dono_restaurante" | "entregador" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
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

export type AddressPayload = Omit<Address, "id" | "user_id">;

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

export type Delivery = {
  id: number;
  order_id: number;
  courier_user_id: number | null;
  status: "aguardando_retirada" | "retirado" | "em_rota" | "entregue";
  started_at: string | null;
  delivered_at: string | null;
};

export type Order = {
  id: number;
  client_user_id: number;
  restaurant_id: number;
  delivery_address_id: number;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  created_at: string;
};
