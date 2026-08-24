"use client";

import { FormEvent, useState } from "react";

import { Header } from "@/components/header";
import { api } from "@/lib/api";

export default function OwnerPage() {
  const [restaurantId, setRestaurantId] = useState("1");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("em_preparo");

  async function createProduct(event: FormEvent) {
    event.preventDefault();
    await api.post("/products", {
      restaurant_id: Number(restaurantId),
      name,
      price: Number(price)
    });
    alert("Produto criado");
  }

  async function updateOrderStatus(event: FormEvent) {
    event.preventDefault();
    await api.patch(`/orders/${orderId}/status`, { status });
    alert("Status atualizado");
  }

  return (
    <main>
      <Header />
      <section className="container-box grid gap-4 md:grid-cols-2">
        <form onSubmit={createProduct} className="card space-y-2">
          <h2 className="text-xl font-black text-red-700">CRUD Produto (Criar)</h2>
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="ID Restaurante"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="Nome do produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="Preco"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button className="btn-primary" type="submit">
            Criar produto
          </button>
        </form>

        <form onSubmit={updateOrderStatus} className="card space-y-2">
          <h2 className="text-xl font-black text-red-700">Atualizar status do pedido</h2>
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="ID Pedido"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <select
            className="w-full rounded-lg border border-red-100 p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="recebido">recebido</option>
            <option value="em_preparo">em_preparo</option>
            <option value="pronto">pronto</option>
            <option value="saiu_entrega">saiu_entrega</option>
            <option value="entregue">entregue</option>
          </select>
          <button className="btn-primary" type="submit">
            Atualizar status
          </button>
        </form>
      </section>
    </main>
  );
}
