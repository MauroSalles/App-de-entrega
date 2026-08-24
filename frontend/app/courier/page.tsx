"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Delivery } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

export default function CourierPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [statusByDelivery, setStatusByDelivery] = useState<Record<number, string>>({});
  const [locationByDelivery, setLocationByDelivery] = useState<Record<number, { latitude: string; longitude: string }>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deliveriesQuery = useQuery({
    queryKey: ["courier-deliveries"],
    queryFn: async () => {
      const response = await api.get<Delivery[]>("/deliveries/me/active");
      return response.data;
    },
    enabled: user?.role === "entregador"
  });

  async function updateStatus(deliveryId: number) {
    const status = statusByDelivery[deliveryId];
    if (!status) {
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    try {
      await api.patch(`/deliveries/${deliveryId}/status`, { status });
      setMessage(`Status da entrega #${deliveryId} atualizado.`);
      await queryClient.invalidateQueries({ queryKey: ["courier-deliveries"] });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel atualizar o status da entrega."));
    }
  }

  async function sendLocation(deliveryId: number) {
    const current = locationByDelivery[deliveryId];
    if (!current?.latitude || !current.longitude) {
      setErrorMessage("Informe latitude e longitude antes de enviar a localizacao.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    try {
      await api.post(`/deliveries/${deliveryId}/location`, {
        latitude: Number(current.latitude),
        longitude: Number(current.longitude),
        status: statusByDelivery[deliveryId] ?? null
      });
      setMessage(`Localizacao da entrega #${deliveryId} registrada.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel registrar a localizacao."));
    }
  }

  if (user?.role !== "entregador") {
    return (
      <main>
        <Header />
        <section className="container-box">
          <div className="card text-sm text-slate-500">Esta area e exclusiva para entregadores.</div>
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

        <div className="card">
          <h1 className="text-2xl font-black text-red-700">Painel do entregador</h1>
          <p className="text-sm text-slate-600">Atualize o status e envie localizacao simplificada das entregas ativas.</p>
        </div>

        {deliveriesQuery.isLoading && <div className="card">Carregando...</div>}

        <div className="grid gap-3">
          {deliveriesQuery.data?.map((delivery) => (
            <article key={delivery.id} className="card grid gap-3 md:grid-cols-3">
              <div>
                <h2 className="font-bold">Entrega #{delivery.id}</h2>
                <p className="text-sm">Pedido: {delivery.order_id}</p>
                <p className="text-sm">Status atual: {delivery.status}</p>
              </div>

              <div className="space-y-2">
                <select
                  className="w-full rounded-lg border border-red-100 p-2"
                  value={statusByDelivery[delivery.id] ?? delivery.status}
                  onChange={(e) => setStatusByDelivery((current) => ({ ...current, [delivery.id]: e.target.value }))}
                >
                  {["aguardando_retirada", "retirado", "em_rota", "entregue"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className="btn-primary" type="button" onClick={() => updateStatus(delivery.id)}>
                  Atualizar status
                </button>
              </div>

              <div className="space-y-2">
                <input
                  className="w-full rounded-lg border border-red-100 p-2"
                  placeholder="Latitude"
                  value={locationByDelivery[delivery.id]?.latitude ?? ""}
                  onChange={(e) => setLocationByDelivery((current) => ({ ...current, [delivery.id]: { latitude: e.target.value, longitude: current[delivery.id]?.longitude ?? "" } }))}
                />
                <input
                  className="w-full rounded-lg border border-red-100 p-2"
                  placeholder="Longitude"
                  value={locationByDelivery[delivery.id]?.longitude ?? ""}
                  onChange={(e) => setLocationByDelivery((current) => ({ ...current, [delivery.id]: { latitude: current[delivery.id]?.latitude ?? "", longitude: e.target.value } }))}
                />
                <button className="rounded-lg border border-red-200 px-3 py-2 text-sm" type="button" onClick={() => sendLocation(delivery.id)}>
                  Enviar localizacao
                </button>
              </div>
            </article>
          ))}
          {!deliveriesQuery.isLoading && !deliveriesQuery.data?.length && <div className="card text-sm text-slate-500">Nenhuma entrega ativa encontrada.</div>}
        </div>
      </section>
    </main>
  );
}
