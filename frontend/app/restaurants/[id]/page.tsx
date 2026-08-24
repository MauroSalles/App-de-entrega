"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";

export default function RestaurantMenuPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: async () => {
      const response = await api.get<Product[]>(`/restaurants/${restaurantId}/menu`);
      return response.data;
    }
  });

  async function addToCart(productId: number) {
    try {
      await api.post("/cart/items", { product_id: productId, quantity: 1 });
      alert("Item adicionado ao carrinho.");
    } catch {
      alert("Faça login como cliente para adicionar itens ao carrinho.");
    }
  }

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
                onClick={() => addToCart(product.id)}
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
