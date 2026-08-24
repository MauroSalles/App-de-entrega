"use client";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart";

export default function CartPage() {
  const { items, restaurantId, removeItem, clear } = useCartStore();
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  async function createOrder() {
    if (!restaurantId || !items.length) {
      return;
    }

    await api.post("/orders", {
      restaurant_id: restaurantId,
      delivery_address_id: 1,
      items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
    });

    clear();
    alert("Pedido criado com sucesso.");
  }

  return (
    <main>
      <Header />
      <section className="container-box">
        <div className="mb-4 card">
          <h1 className="text-2xl font-black text-red-700">Carrinho</h1>
        </div>

        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.product_id} className="card flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm">Qtd: {item.quantity}</p>
                <p className="text-red-700">R$ {(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <button className="rounded-lg border border-red-200 px-3 py-1" onClick={() => removeItem(item.product_id)}>
                Remover
              </button>
            </article>
          ))}
        </div>

        <div className="mt-4 card">
          <p className="font-semibold">Subtotal: R$ {total.toFixed(2)}</p>
          <button className="btn-primary mt-3" onClick={createOrder}>
            Finalizar Pedido
          </button>
        </div>
      </section>
    </main>
  );
}
