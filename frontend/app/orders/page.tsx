"use client";

import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Order } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

const statusLabel: Record<string, string> = {
  recebido: "Recebido",
  em_preparo: "Em preparo",
  pronto: "Pronto",
  saiu_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado"
};

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
      <section className="container-box space-y-4">
        <div className="glass-panel px-6 py-6">
          <span className="badge">Acompanhamento</span>
          <h1 className="mt-3 text-3xl font-black text-red-700">Meus Pedidos</h1>
          <p className="mt-2 text-sm text-slate-600">Consulte pedidos por perfil com destaque para status, total e horario de criacao.</p>
        </div>

        {!user && <div className="card text-sm text-slate-500">Faca login para visualizar seus pedidos.</div>}
        {isLoading && <div className="card">Carregando...</div>}
        {error && <div className="card text-red-700">{getErrorMessage(error, "Nao foi possivel carregar os pedidos.")}</div>}

        {!!data?.length && (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="card">
              <p className="text-sm text-slate-500">Total de pedidos</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{data.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Ultimo total</p>
              <p className="mt-2 text-3xl font-black text-slate-900">R$ {Number(data[0].total).toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Maior pedido</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                R$ {Math.max(...data.map((order) => Number(order.total))).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3">
          {data?.map((order) => (
            <article key={order.id} className="card space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">Pedido #{order.id}</h2>
                  <p className="text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
                <span className="badge border-0 bg-red-100 text-red-700">{statusLabel[order.status] ?? order.status}</span>
              </div>
              <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                <p>Restaurante #{order.restaurant_id}</p>
                <p>Endereco #{order.delivery_address_id}</p>
                <p>Total R$ {Number(order.total).toFixed(2)}</p>
              </div>
              <div className="grid gap-2 text-sm text-slate-500 md:grid-cols-3">
                <p>Subtotal R$ {Number(order.subtotal).toFixed(2)}</p>
                <p>Entrega R$ {Number(order.delivery_fee).toFixed(2)}</p>
                <p>{order.notes ? `Observacoes: ${order.notes}` : "Sem observacoes"}</p>
              </div>
            </article>
          ))}
          {user && !isLoading && !data?.length && <div className="card text-sm text-slate-500">Nenhum pedido encontrado.</div>}
        </div>
      </section>
    </main>
  );
}
