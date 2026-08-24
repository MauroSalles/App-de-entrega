"use client";

import Link from "next/link";
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
  const addItem = useCartStore((state) => state.addItem);

  const { data, isLoading, error } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: async () => {
      const response = await api.get<Product[]>(`/restaurants/${restaurantId}/menu`);
      return response.data;
    },
    enabled: Number.isFinite(restaurantId)
  });

  return (
    <main>
      <Header />
      <section className="container-box">
        <div className="mb-4 card">
          <h1 className="text-2xl font-black text-red-700">Cardapio</h1>
          <p className="text-sm text-slate-600">Monte seu carrinho. O checkout usa o carrinho local e um endereco cadastrado.</p>
        </div>

        {isLoading && <div className="card">Carregando...</div>}
        {error && <div className="card text-red-700">{getErrorMessage(error, "Nao foi possivel carregar o cardapio.")}</div>}

        <div className="grid gap-3">
          {data?.map((product) => (
            <article key={product.id} className="card flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold">{product.name}</h2>
                <p className="text-sm text-slate-600">{product.description ?? "Sem descricao"}</p>
                <p className="mt-1 font-semibold text-red-700">R$ {Number(product.price).toFixed(2)}</p>
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
          ))}
        </div>

        <div className="mt-4">
          <Link href="/cart" className="btn-primary inline-flex">
            Ir para o carrinho
          </Link>
        </div>
      </section>
    </main>
  );
}
