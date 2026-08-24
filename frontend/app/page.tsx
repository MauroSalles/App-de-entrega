"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Restaurant } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [onlyFast, setOnlyFast] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const response = await api.get<Restaurant[]>("/restaurants");
      return response.data;
    }
  });

  const filteredRestaurants = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (data ?? []).filter((restaurant) => {
      const matchesSearch =
        !term ||
        restaurant.name.toLowerCase().includes(term) ||
        restaurant.description?.toLowerCase().includes(term);
      const matchesDelivery = !onlyFast || Number(restaurant.delivery_fee) <= 5;

      return matchesSearch && matchesDelivery;
    });
  }, [data, onlyFast, search]);

  const stats = useMemo(() => {
    const restaurants = data ?? [];
    const avgTime = restaurants.length
      ? Math.round(restaurants.reduce((total, item) => total + item.avg_delivery_time_min, 0) / restaurants.length)
      : 0;
    const bestFee = restaurants.length ? Math.min(...restaurants.map((item) => Number(item.delivery_fee))) : 0;

    return {
      totalRestaurants: restaurants.length,
      avgTime,
      bestFee
    };
  }, [data]);

  return (
    <main>
      <Header />
      <section className="container-box space-y-6">
        <div className="glass-panel fade-up relative overflow-hidden px-6 py-8">
          <div className="hero-orb absolute -left-10 top-10 h-32 w-32 rounded-full bg-orange-300/30 blur-3xl" />
          <div className="hero-orb-delay absolute right-0 top-0 h-40 w-40 rounded-full bg-red-300/30 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <span className="badge">Projeto integrador em evolucao</span>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                  Restaurantes, pedidos e entregas com uma vitrine mais rapida e viva.
                </h1>
                <p className="max-w-2xl text-base text-slate-600 md:text-lg">
                  Navegue por parceiros, encontre opcoes com entrega mais barata e monte seu pedido com um fluxo mais claro.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="#restaurantes" className="btn-primary">
                  Explorar restaurantes
                </Link>
                <Link href="/cart" className="btn-secondary">
                  Revisar carrinho
                </Link>
              </div>
              {!user && <p className="text-sm text-slate-500">Voce pode navegar sem login e entrar antes do checkout.</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <article className="card soft-pulse">
                <p className="text-sm text-slate-500">Restaurantes ativos</p>
                <p className="mt-2 text-3xl font-black text-red-700">{stats.totalRestaurants}</p>
              </article>
              <article className="card">
                <p className="text-sm text-slate-500">Tempo medio</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{stats.avgTime || "--"} min</p>
              </article>
              <article className="card">
                <p className="text-sm text-slate-500">Melhor frete</p>
                <p className="mt-2 text-3xl font-black text-slate-900">R$ {stats.bestFee.toFixed(2)}</p>
              </article>
            </div>
          </div>
        </div>

        <div id="restaurantes" className="card fade-up space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-red-700">Restaurantes</h2>
              <p className="text-sm text-slate-600">Filtre o cardapio ideal por nome, descricao ou opcoes com frete enxuto.</p>
            </div>
            <div className="flex flex-col gap-2 md:w-[26rem] md:flex-row">
              <input
                className="w-full rounded-xl border border-red-100 bg-white px-4 py-3 outline-none ring-0 transition focus:border-red-300"
                placeholder="Buscar por nome ou tipo de cozinha"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button className={onlyFast ? "btn-primary" : "btn-secondary"} onClick={() => setOnlyFast((current) => !current)}>
                Frete ate R$ 5
              </button>
            </div>
          </div>

          {isLoading && <div className="card">Carregando...</div>}
          {error && <div className="card text-red-700">{getErrorMessage(error, "Nao foi possivel carregar os restaurantes.")}</div>}

          {!isLoading && !error && !filteredRestaurants.length && (
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 px-5 py-8 text-center text-sm text-slate-600">
              Nenhum restaurante encontrado para os filtros atuais.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="card fade-up group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{restaurant.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{restaurant.description ?? "Sem descricao"}</p>
                  </div>
                  <span className="badge whitespace-nowrap border-0 bg-red-100/80">{restaurant.avg_delivery_time_min} min</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">
                    Entrega R$ {Number(restaurant.delivery_fee).toFixed(2)}
                  </span>
                  <span className="text-slate-500 transition group-hover:text-red-700">Ver cardapio →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
