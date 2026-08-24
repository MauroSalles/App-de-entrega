"use client";

import { useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { Order, Product, Restaurant, UserProfile } from "@/lib/types";

export default function OwnerPage() {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    description: "",
    delivery_fee: "0",
    avg_delivery_time_min: "40"
  });
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "0" });
  const [statusDrafts, setStatusDrafts] = useState<Record<number, string>>({});
  const [courierDrafts, setCourierDrafts] = useState<Record<number, string>>({});

  const restaurantQuery = useQuery({
    queryKey: ["owner-restaurants"],
    queryFn: async () => {
      const response = await api.get<Restaurant[]>("/restaurants/me");
      return response.data;
    }
  });

  const productQuery = useQuery({
    queryKey: ["owner-products", selectedRestaurantId],
    queryFn: async () => {
      const response = await api.get<Product[]>(`/products/restaurant/${selectedRestaurantId}`);
      return response.data;
    },
    enabled: Boolean(selectedRestaurantId)
  });

  const orderQuery = useQuery({
    queryKey: ["owner-orders"],
    queryFn: async () => {
      const response = await api.get<Order[]>("/orders/me");
      return response.data;
    }
  });

  const courierQuery = useQuery({
    queryKey: ["couriers"],
    queryFn: async () => {
      const response = await api.get<UserProfile[]>("/auth/couriers");
      return response.data;
    }
  });

  useEffect(() => {
    if (!selectedRestaurantId && restaurantQuery.data?.length) {
      setSelectedRestaurantId(String(restaurantQuery.data[0].id));
    }
  }, [restaurantQuery.data, selectedRestaurantId]);

  useEffect(() => {
    const restaurant = restaurantQuery.data?.find((item) => String(item.id) === selectedRestaurantId);
    if (!restaurant) {
      return;
    }
    setRestaurantForm({
      name: restaurant.name,
      description: restaurant.description ?? "",
      delivery_fee: String(restaurant.delivery_fee),
      avg_delivery_time_min: String(restaurant.avg_delivery_time_min)
    });
  }, [restaurantQuery.data, selectedRestaurantId]);

  async function createRestaurant(event: FormEvent) {
    event.preventDefault();
    const response = await api.post<Restaurant>("/restaurants", {
      name: restaurantForm.name,
      description: restaurantForm.description,
      delivery_fee: Number(restaurantForm.delivery_fee),
      avg_delivery_time_min: Number(restaurantForm.avg_delivery_time_min)
    });
    await restaurantQuery.refetch();
    setSelectedRestaurantId(String(response.data.id));
    alert("Restaurante criado");
  }

  async function updateRestaurant(event: FormEvent) {
    event.preventDefault();
    if (!selectedRestaurantId) {
      return;
    }
    await api.put(`/restaurants/${selectedRestaurantId}`, {
      name: restaurantForm.name,
      description: restaurantForm.description,
      delivery_fee: Number(restaurantForm.delivery_fee),
      avg_delivery_time_min: Number(restaurantForm.avg_delivery_time_min)
    });
    await restaurantQuery.refetch();
    alert("Restaurante atualizado");
  }

  async function createProduct(event: FormEvent) {
    event.preventDefault();
    if (!selectedRestaurantId) {
      return;
    }
    await api.post("/products", {
      restaurant_id: Number(selectedRestaurantId),
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price)
    });
    setProductForm({ name: "", description: "", price: "0" });
    await productQuery.refetch();
    alert("Produto criado");
  }

  async function toggleProductAvailability(product: Product) {
    await api.put(`/products/${product.id}`, { is_available: !product.is_available });
    await productQuery.refetch();
  }

  async function deleteProduct(productId: number) {
    await api.delete(`/products/${productId}`);
    await productQuery.refetch();
  }

  async function updateOrderStatus(orderId: number, currentStatus: string) {
    await api.patch(`/orders/${orderId}/status`, { status: statusDrafts[orderId] ?? currentStatus });
    await orderQuery.refetch();
  }

  async function assignCourier(orderId: number) {
    const courierUserId = courierDrafts[orderId];
    if (!courierUserId) {
      return;
    }
    await api.patch(`/orders/${orderId}/assign-courier`, { courier_user_id: Number(courierUserId) });
    await orderQuery.refetch();
  }

  return (
    <main>
      <Header />
      <section className="container-box space-y-4">
        {(restaurantQuery.isError || orderQuery.isError || courierQuery.isError) && (
          <div className="card">Faça login como dono de restaurante para acessar este painel.</div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={createRestaurant} className="card space-y-2">
            <h2 className="text-xl font-black text-red-700">Novo restaurante</h2>
            <input
              className="w-full rounded-lg border border-red-100 p-2"
              placeholder="Nome"
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm((current) => ({ ...current, name: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-lg border border-red-100 p-2"
              placeholder="Descrição"
              value={restaurantForm.description}
              onChange={(e) => setRestaurantForm((current) => ({ ...current, description: e.target.value }))}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="w-full rounded-lg border border-red-100 p-2"
                placeholder="Taxa de entrega"
                type="number"
                step="0.01"
                value={restaurantForm.delivery_fee}
                onChange={(e) => setRestaurantForm((current) => ({ ...current, delivery_fee: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-red-100 p-2"
                placeholder="Tempo médio"
                type="number"
                value={restaurantForm.avg_delivery_time_min}
                onChange={(e) =>
                  setRestaurantForm((current) => ({ ...current, avg_delivery_time_min: e.target.value }))
                }
              />
            </div>
            <button className="btn-primary" type="submit">
              Criar restaurante
            </button>
          </form>

          <form onSubmit={updateRestaurant} className="card space-y-2">
            <h2 className="text-xl font-black text-red-700">Editar restaurante</h2>
            <select
              className="w-full rounded-lg border border-red-100 p-2"
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
              <option value="">Selecione um restaurante</option>
              {(restaurantQuery.data ?? []).map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-lg border border-red-100 p-2"
              placeholder="Nome"
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm((current) => ({ ...current, name: e.target.value }))}
            />
            <input
              className="w-full rounded-lg border border-red-100 p-2"
              placeholder="Descrição"
              value={restaurantForm.description}
              onChange={(e) => setRestaurantForm((current) => ({ ...current, description: e.target.value }))}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="w-full rounded-lg border border-red-100 p-2"
                placeholder="Taxa de entrega"
                type="number"
                step="0.01"
                value={restaurantForm.delivery_fee}
                onChange={(e) => setRestaurantForm((current) => ({ ...current, delivery_fee: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-red-100 p-2"
                placeholder="Tempo médio"
                type="number"
                value={restaurantForm.avg_delivery_time_min}
                onChange={(e) =>
                  setRestaurantForm((current) => ({ ...current, avg_delivery_time_min: e.target.value }))
                }
              />
            </div>
            <button className="btn-primary" type="submit">
              Salvar restaurante
            </button>
          </form>
        </div>

        <form onSubmit={createProduct} className="card space-y-2">
          <h2 className="text-xl font-black text-red-700">Cadastrar produto</h2>
          <p className="text-sm text-slate-600">Selecione um restaurante para montar o cardápio.</p>
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="Nome do produto"
            value={productForm.name}
            onChange={(e) => setProductForm((current) => ({ ...current, name: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="Descrição"
            value={productForm.description}
            onChange={(e) => setProductForm((current) => ({ ...current, description: e.target.value }))}
          />
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="Preço"
            type="number"
            step="0.01"
            value={productForm.price}
            onChange={(e) => setProductForm((current) => ({ ...current, price: e.target.value }))}
            required
          />
          <button className="btn-primary" type="submit">
            Criar produto
          </button>
        </form>

        <div className="grid gap-3">
          {(productQuery.data ?? []).map((product) => (
            <article key={product.id} className="card flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-slate-600">{product.description ?? "Sem descrição"}</p>
                <p className="text-sm text-red-700">
                  R$ {Number(product.price).toFixed(2)} • {product.is_available ? "Disponível" : "Indisponível"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-red-200 px-3 py-2"
                  type="button"
                  onClick={() => toggleProductAvailability(product)}
                >
                  Alternar disponibilidade
                </button>
                <button
                  className="rounded-lg border border-red-200 px-3 py-2"
                  type="button"
                  onClick={() => deleteProduct(product.id)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-3">
          {(orderQuery.data ?? []).map((order) => (
            <article key={order.id} className="card space-y-2">
              <div>
                <h2 className="font-bold">Pedido #{order.id}</h2>
                <p className="text-sm">Status atual: {order.status}</p>
                <p className="text-sm">Total: R$ {Number(order.total).toFixed(2)}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <select
                  className="w-full rounded-lg border border-red-100 p-2"
                  value={statusDrafts[order.id] ?? order.status}
                  onChange={(e) => setStatusDrafts((current) => ({ ...current, [order.id]: e.target.value }))}
                >
                  <option value="recebido">recebido</option>
                  <option value="em_preparo">em_preparo</option>
                  <option value="pronto">pronto</option>
                  <option value="saiu_entrega">saiu_entrega</option>
                  <option value="entregue">entregue</option>
                </select>
                <button className="btn-primary" type="button" onClick={() => updateOrderStatus(order.id, order.status)}>
                  Atualizar status
                </button>
                <select
                  className="w-full rounded-lg border border-red-100 p-2"
                  value={courierDrafts[order.id] ?? ""}
                  onChange={(e) => setCourierDrafts((current) => ({ ...current, [order.id]: e.target.value }))}
                >
                  <option value="">Selecionar entregador</option>
                  {(courierQuery.data ?? []).map((courier) => (
                    <option key={courier.id} value={courier.id}>
                      {courier.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="rounded-lg border border-red-200 px-3 py-2" type="button" onClick={() => assignCourier(order.id)}>
                Vincular entregador
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
