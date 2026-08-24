"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart";

export default function RestaurantMenuPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);
  const { items, restaurantId: cartRestaurantId, addItem } = useCartStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: async () => {
      const response = await api.get<Product[]>(`/restaurants/${restaurantId}/menu`);
      return response.data;
    },
    enabled: Number.isFinite(restaurantId)
  });

  const cartSummary = useMemo(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return { itemCount, subtotal };
  }, [items]);

  return (
    <main>
      <Header />
      <section className="container-box grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 glass-panel px-6 py-6">
            <span className="badge">Cardapio digital</span>
            <h1 className="mt-3 text-3xl font-black text-red-700">Cardapio</h1>
            <p className="mt-2 text-sm text-slate-600">Adicione itens rapidamente e acompanhe o subtotal em tempo real.</p>
            {cartRestaurantId && cartRestaurantId !== restaurantId && (
              <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Adicionar itens deste restaurante substitui o carrinho atual para manter um unico pedido por vez.
              </p>
            )}
          </div>

          {isLoading && <div className="card">Carregando...</div>}
          {error && <div className="card text-red-700">{getErrorMessage(error, "Nao foi possivel carregar o cardapio.")}</div>}

          <div className="grid gap-3">
            {data?.map((product) => {
              const quantityInCart = items.find((item) => item.product_id === product.id)?.quantity ?? 0;

              return (
                <article key={product.id} className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{product.name}</h2>
                      {quantityInCart > 0 && <span className="badge border-0 bg-emerald-100 text-emerald-700">{quantityInCart} no carrinho</span>}
                    </div>
                    <p className="text-sm text-slate-600">{product.description ?? "Sem descricao"}</p>
                    <p className="font-semibold text-red-700">R$ {Number(product.price).toFixed(2)}</p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() =>
                      addItem(restaurantId, {
                        product_id: product.id,
                        name: product.name,
                        price: Number(product.price)
                      })
                    }
                  >
                    Adicionar
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass-panel px-6 py-6">
            <h2 className="text-xl font-black text-red-700">Resumo rapido</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="card">
                <p className="text-sm text-slate-500">Itens selecionados</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{cartSummary.itemCount}</p>
              </div>
              <div className="card">
                <p className="text-sm text-slate-500">Subtotal atual</p>
                <p className="mt-2 text-3xl font-black text-slate-900">R$ {cartSummary.subtotal.toFixed(2)}</p>
              </div>
            </div>
            <Link href="/cart" className="btn-primary mt-4 inline-flex">
              Ir para o carrinho
            </Link>
          </div>

          <div className="card">
            <h3 className="font-bold text-slate-900">Como funciona</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Adicione produtos e acompanhe o contador no topo.</li>
              <li>• Finalize com um endereco salvo na conta do cliente.</li>
              <li>• Depois acompanhe o status em Meus Pedidos.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
