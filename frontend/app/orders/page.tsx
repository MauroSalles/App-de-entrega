"use client";

import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Order } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const response = await api.get<Order[]>("/orders/me");
      return response.data;
    },
    enabled: !!user
  });

  return (
    <main>
      <Header />
      <section className="container-box">
        <div className="mb-4 card">
          <h1 className="text-2xl font-black text-red-700">Meus Pedidos</h1>
          <p className="text-sm text-slate-600">A mesma tela mostra pedidos do cliente, do restaurante ou do admin.</p>
        </div>

        {!user && <div className="card text-sm text-slate-500">Faca login para visualizar seus pedidos.</div>}
        {isLoading && <div className="card">Carregando...</div>}
        {error && <div className="card text-red-700">{getErrorMessage(error, "Nao foi possivel carregar os pedidos.")}</div>}

        <div className="grid gap-3">
          {data?.map((order) => (
            <article key={order.id} className="card">
              <h2 className="font-bold">Pedido #{order.id}</h2>
              <p className="text-sm">Status: {order.status}</p>
              <p className="text-sm">Restaurante: {order.restaurant_id}</p>
              <p className="text-sm">Endereco: {order.delivery_address_id}</p>
              <p className="text-sm">Total: R$ {Number(order.total).toFixed(2)}</p>
            </article>
          ))}
          {user && !isLoading && !data?.length && <div className="card text-sm text-slate-500">Nenhum pedido encontrado.</div>}
        </div>
      </section>
    </main>
  );
}
