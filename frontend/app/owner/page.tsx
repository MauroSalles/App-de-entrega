"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Order, Product, Restaurant, User } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

const emptyRestaurant = {
  name: "",
  description: "",
  delivery_fee: "6.5",
  avg_delivery_time_min: "35"
};

const emptyProduct = {
  name: "",
  description: "",
  price: "0",
  is_available: true
};

export default function OwnerPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [statusByOrder, setStatusByOrder] = useState<Record<number, string>>({});
  const [courierByOrder, setCourierByOrder] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const restaurantsQuery = useQuery({
    queryKey: ["owner-restaurants"],
    queryFn: async () => {
      const response = await api.get<Restaurant[]>("/restaurants/mine");
      return response.data;
    },
    enabled: user?.role === "dono_restaurante" || user?.role === "admin"
  });

  useEffect(() => {
    if (!selectedRestaurantId && restaurantsQuery.data?.length) {
      setSelectedRestaurantId(restaurantsQuery.data[0].id);
    }
  }, [restaurantsQuery.data, selectedRestaurantId]);

  const productsQuery = useQuery({
    queryKey: ["owner-products", selectedRestaurantId],
    queryFn: async () => {
      const response = await api.get<Product[]>(`/products/restaurant/${selectedRestaurantId}`);
      return response.data;
    },
    enabled: !!selectedRestaurantId
  });

  const ordersQuery = useQuery({
    queryKey: ["owner-orders"],
    queryFn: async () => {
      const response = await api.get<Order[]>("/orders/me");
      return response.data;
    },
    enabled: user?.role === "dono_restaurante" || user?.role === "admin"
  });

  const couriersQuery = useQuery({
    queryKey: ["couriers"],
    queryFn: async () => {
      const response = await api.get<User[]>("/users/couriers");
      return response.data;
    },
    enabled: user?.role === "dono_restaurante" || user?.role === "admin"
  });

  const filteredOrders = useMemo(
    () => ordersQuery.data?.filter((order) => !selectedRestaurantId || order.restaurant_id === selectedRestaurantId) ?? [],
    [ordersQuery.data, selectedRestaurantId]
  );

  async function createRestaurant(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    try {
      await api.post("/restaurants", {
        name: restaurantForm.name,
        description: restaurantForm.description || null,
        delivery_fee: Number(restaurantForm.delivery_fee),
        avg_delivery_time_min: Number(restaurantForm.avg_delivery_time_min)
      });
      setRestaurantForm(emptyRestaurant);
      setMessage("Restaurante criado com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["owner-restaurants"] });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel criar o restaurante."));
    }
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    if (!selectedRestaurantId) {
      setErrorMessage("Crie ou selecione um restaurante primeiro.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        restaurant_id: selectedRestaurantId,
        name: productForm.name,
        description: productForm.description || null,
        price: Number(productForm.price),
        is_available: productForm.is_available
      };

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
        setMessage("Produto atualizado.");
      } else {
        await api.post("/products", payload);
        setMessage("Produto criado.");
      }

      setEditingProductId(null);
      setProductForm(emptyProduct);
      await queryClient.invalidateQueries({ queryKey: ["owner-products", selectedRestaurantId] });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel salvar o produto."));
    }
  }

  async function deleteProduct(productId: number) {
    setMessage(null);
    setErrorMessage(null);

    try {
      await api.delete(`/products/${productId}`);
      setMessage("Produto removido.");
      await queryClient.invalidateQueries({ queryKey: ["owner-products", selectedRestaurantId] });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel remover o produto."));
    }
  }

  async function updateOrderStatus(orderId: number) {
    const status = statusByOrder[orderId];
    if (!status) {
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setMessage(`Status do pedido #${orderId} atualizado.`);
      await queryClient.invalidateQueries({ queryKey: ["owner-orders"] });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel atualizar o status."));
    }
  }

  async function assignCourier(orderId: number) {
    const courier_user_id = Number(courierByOrder[orderId]);
    if (!courier_user_id) {
      setErrorMessage("Selecione um entregador para vincular ao pedido.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    try {
      await api.patch(`/orders/${orderId}/assign-courier`, { courier_user_id });
      setMessage(`Entregador vinculado ao pedido #${orderId}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel vincular o entregador."));
    }
  }

  if (user?.role !== "dono_restaurante" && user?.role !== "admin") {
    return (
      <main>
        <Header />
        <section className="container-box">
          <div className="card text-sm text-slate-500">Esta area e exclusiva para donos de restaurante ou admin.</div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <section className="container-box space-y-4">
        {message && <div className="card text-emerald-700">{message}</div>}
        {errorMessage && <div className="card text-red-700">{errorMessage}</div>}

        <div className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={createRestaurant} className="card space-y-2">
            <h2 className="text-xl font-black text-red-700">Onboarding do restaurante</h2>
            <input className="w-full rounded-lg border border-red-100 p-2" placeholder="Nome" value={restaurantForm.name} onChange={(e) => setRestaurantForm((current) => ({ ...current, name: e.target.value }))} required />
            <textarea className="w-full rounded-lg border border-red-100 p-2" placeholder="Descricao" value={restaurantForm.description} onChange={(e) => setRestaurantForm((current) => ({ ...current, description: e.target.value }))} />
            <input className="w-full rounded-lg border border-red-100 p-2" type="number" step="0.01" placeholder="Taxa de entrega" value={restaurantForm.delivery_fee} onChange={(e) => setRestaurantForm((current) => ({ ...current, delivery_fee: e.target.value }))} required />
            <input className="w-full rounded-lg border border-red-100 p-2" type="number" placeholder="Tempo medio de entrega" value={restaurantForm.avg_delivery_time_min} onChange={(e) => setRestaurantForm((current) => ({ ...current, avg_delivery_time_min: e.target.value }))} required />
            <button className="btn-primary" type="submit">Criar restaurante</button>
          </form>

          <div className="card space-y-2">
            <h2 className="text-xl font-black text-red-700">Meus restaurantes</h2>
            {restaurantsQuery.isLoading && <p className="text-sm">Carregando...</p>}
            {!restaurantsQuery.data?.length && !restaurantsQuery.isLoading && <p className="text-sm text-slate-500">Nenhum restaurante cadastrado ainda.</p>}
            {!!restaurantsQuery.data?.length && (
              <select
                className="w-full rounded-lg border border-red-100 p-2"
                value={selectedRestaurantId ?? ""}
                onChange={(e) => setSelectedRestaurantId(Number(e.target.value))}
              >
                {restaurantsQuery.data.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={saveProduct} className="card space-y-2">
            <h2 className="text-xl font-black text-red-700">{editingProductId ? "Editar produto" : "Criar produto"}</h2>
            <input className="w-full rounded-lg border border-red-100 p-2" placeholder="Nome do produto" value={productForm.name} onChange={(e) => setProductForm((current) => ({ ...current, name: e.target.value }))} required />
            <textarea className="w-full rounded-lg border border-red-100 p-2" placeholder="Descricao" value={productForm.description} onChange={(e) => setProductForm((current) => ({ ...current, description: e.target.value }))} />
            <input className="w-full rounded-lg border border-red-100 p-2" type="number" step="0.01" placeholder="Preco" value={productForm.price} onChange={(e) => setProductForm((current) => ({ ...current, price: e.target.value }))} required />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={productForm.is_available} onChange={(e) => setProductForm((current) => ({ ...current, is_available: e.target.checked }))} />
              Produto disponivel
            </label>
            <div className="flex gap-2">
              <button className="btn-primary" type="submit">{editingProductId ? "Salvar" : "Criar produto"}</button>
              {editingProductId && (
                <button className="rounded-lg border border-red-200 px-3 py-1" type="button" onClick={() => { setEditingProductId(null); setProductForm(emptyProduct); }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="card space-y-3">
            <h2 className="text-xl font-black text-red-700">Produtos</h2>
            {productsQuery.isLoading && <p className="text-sm">Carregando produtos...</p>}
            {productsQuery.data?.map((product) => (
              <article key={product.id} className="rounded-xl border border-red-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-slate-600">{product.description ?? "Sem descricao"}</p>
                    <p className="text-sm text-red-700">R$ {Number(product.price).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{product.is_available ? "Disponivel" : "Indisponivel"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg border border-red-200 px-3 py-1 text-sm"
                      onClick={() => {
                        setEditingProductId(product.id);
                        setProductForm({
                          name: product.name,
                          description: product.description ?? "",
                          price: String(product.price),
                          is_available: product.is_available
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button className="rounded-lg border border-red-200 px-3 py-1 text-sm" onClick={() => deleteProduct(product.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {!productsQuery.isLoading && !productsQuery.data?.length && <p className="text-sm text-slate-500">Nenhum produto encontrado para este restaurante.</p>}
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-xl font-black text-red-700">Pedidos do restaurante</h2>
          {ordersQuery.isLoading && <p className="text-sm">Carregando pedidos...</p>}
          {filteredOrders.map((order) => (
            <article key={order.id} className="rounded-xl border border-red-100 p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <h3 className="font-semibold">Pedido #{order.id}</h3>
                  <p className="text-sm">Status atual: {order.status}</p>
                  <p className="text-sm">Cliente: {order.client_user_id}</p>
                  <p className="text-sm">Total: R$ {Number(order.total).toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <select
                    className="w-full rounded-lg border border-red-100 p-2"
                    value={statusByOrder[order.id] ?? order.status}
                    onChange={(e) => setStatusByOrder((current) => ({ ...current, [order.id]: e.target.value }))}
                  >
                    {["recebido", "em_preparo", "pronto", "saiu_entrega", "entregue", "cancelado"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button className="btn-primary" type="button" onClick={() => updateOrderStatus(order.id)}>
                    Atualizar status
                  </button>
                </div>
                <div className="space-y-2">
                  <select
                    className="w-full rounded-lg border border-red-100 p-2"
                    value={courierByOrder[order.id] ?? ""}
                    onChange={(e) => setCourierByOrder((current) => ({ ...current, [order.id]: e.target.value }))}
                  >
                    <option value="">Selecione um entregador</option>
                    {couriersQuery.data?.map((courier) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-lg border border-red-200 px-3 py-2 text-sm" type="button" onClick={() => assignCourier(order.id)}>
                    Vincular entregador
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!ordersQuery.isLoading && !filteredOrders.length && <p className="text-sm text-slate-500">Nenhum pedido encontrado para o restaurante selecionado.</p>}
        </div>
      </section>
    </main>
  );
}
