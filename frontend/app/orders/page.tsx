"use client";

import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const response = await api.get<Order[]>("/orders/me");
      return response.data;
    }
  });

  return (
    <main>
      <Header />
      <section className="container-box">
        <div className="mb-4 card">
          <h1 className="text-2xl font-black text-red-700">Meus Pedidos</h1>
        </div>

        {isLoading && <div className="card">Carregando...</div>}

        <div className="grid gap-3">
          {data?.map((order) => (
            <article key={order.id} className="card">
              <h2 className="font-bold">Pedido #{order.id}</h2>
              <p className="text-sm">Status: {order.status}</p>
              <p className="text-sm">Total: R$ {Number(order.total).toFixed(2)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
