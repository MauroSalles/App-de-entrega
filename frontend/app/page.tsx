"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { Restaurant } from "@/lib/types";

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const response = await api.get<Restaurant[]>("/restaurants");
      return response.data;
    }
  });

  return (
    <main>
      <Header />
      <section className="container-box">
        <div className="mb-4 card">
          <h1 className="text-2xl font-black text-red-700">Restaurantes</h1>
          <p className="text-sm text-slate-600">Escolha um restaurante e monte seu pedido.</p>
        </div>

        {isLoading && <div className="card">Carregando...</div>}

        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.id}`}
              className="card transition hover:-translate-y-0.5"
            >
              <h2 className="text-lg font-bold">{restaurant.name}</h2>
              <p className="text-sm text-slate-600">{restaurant.description ?? "Sem descricao"}</p>
              <p className="mt-2 text-sm text-red-700">
                Entrega R$ {Number(restaurant.delivery_fee).toFixed(2)} • {restaurant.avg_delivery_time_min} min
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
