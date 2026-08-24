"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { Delivery } from "@/lib/types";

export default function CourierPage() {
  const [locationDrafts, setLocationDrafts] = useState<Record<number, { latitude: string; longitude: string }>>({});
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["active-deliveries"],
    queryFn: async () => {
      const response = await api.get<Delivery[]>("/deliveries/me/active");
      return response.data;
    }
  });

  async function updateStatus(deliveryId: number, status: string) {
    await api.patch(`/deliveries/${deliveryId}/status`, { status });
    await refetch();
  }

  async function sendLocation(deliveryId: number) {
    const draft = locationDrafts[deliveryId];
    if (!draft?.latitude || !draft?.longitude) {
      return;
    }
    await api.post(`/deliveries/${deliveryId}/location`, {
      latitude: Number(draft.latitude),
      longitude: Number(draft.longitude)
    });
    alert("Localização enviada.");
  }

  return (
    <main>
      <Header />
      <section className="container-box space-y-4">
        <div className="card">
          <h1 className="text-2xl font-black text-red-700">Painel do Entregador</h1>
        </div>
        {data !== undefined && !isLoading && !data.length && <div className="card">Nenhuma entrega ativa no momento.</div>}
        {data === undefined && !isLoading && <div className="card">Faça login como entregador para acessar este painel.</div>}
        {isLoading && <div className="card">Carregando...</div>}
        {(data ?? []).map((delivery) => (
          <article key={delivery.id} className="card space-y-3">
            <div>
              <h2 className="font-bold">Entrega #{delivery.id}</h2>
              <p className="text-sm">Pedido #{delivery.order_id}</p>
              <p className="text-sm">Status atual: {delivery.status}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => updateStatus(delivery.id, "retirado")}>
                Marcar retirado
              </button>
              <button className="btn-primary" onClick={() => updateStatus(delivery.id, "em_rota")}>
                Em rota
              </button>
              <button className="btn-primary" onClick={() => updateStatus(delivery.id, "entregue")}>
                Entregue
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <input
                className="rounded-lg border border-red-100 p-2"
                placeholder="Latitude"
                value={locationDrafts[delivery.id]?.latitude ?? ""}
                onChange={(e) =>
                  setLocationDrafts((current) => ({
                    ...current,
                    [delivery.id]: { latitude: e.target.value, longitude: current[delivery.id]?.longitude ?? "" }
                  }))
                }
              />
              <input
                className="rounded-lg border border-red-100 p-2"
                placeholder="Longitude"
                value={locationDrafts[delivery.id]?.longitude ?? ""}
                onChange={(e) =>
                  setLocationDrafts((current) => ({
                    ...current,
                    [delivery.id]: { latitude: current[delivery.id]?.latitude ?? "", longitude: e.target.value }
                  }))
                }
              />
              <button className="rounded-lg border border-red-200 px-3 py-2" onClick={() => sendLocation(delivery.id)}>
                Enviar localização
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
