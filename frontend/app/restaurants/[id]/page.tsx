"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart";

export default function RestaurantMenuPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);
  const addItem = useCartStore((state) => state.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: async () => {
      const response = await api.get<Product[]>(`/restaurants/${restaurantId}/menu`);
      return response.data;
    }
  });

  return (
    <main>
      <Header />
      <section className="container-box">
        <div className="mb-4 card">
          <h1 className="text-2xl font-black text-red-700">Cardapio</h1>
          <p className="text-sm text-slate-600">Monte seu carrinho.</p>
        </div>

        {isLoading && <div className="card">Carregando...</div>}

        <div className="grid gap-3">
          {data?.map((product) => (
            <article key={product.id} className="card flex items-center justify-between">
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
      </section>
    </main>
  );
}
