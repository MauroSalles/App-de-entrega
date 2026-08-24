"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { Address, CartItem } from "@/lib/types";

export default function CartPage() {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressForm, setAddressForm] = useState({
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
    zip_code: "",
    complement: "",
    reference: ""
  });

  const cartQuery = useQuery({
    queryKey: ["cart-items"],
    queryFn: async () => {
      const response = await api.get<CartItem[]>("/cart/items");
      return response.data;
    }
  });

  const addressQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await api.get<Address[]>("/addresses");
      return response.data;
    }
  });

  useEffect(() => {
    if (!selectedAddressId && addressQuery.data?.length) {
      setSelectedAddressId(String(addressQuery.data[0].id));
    }
  }, [addressQuery.data, selectedAddressId]);

  const total = (cartQuery.data ?? []).reduce((acc, item) => acc + Number(item.line_total), 0);

  async function removeItem(itemId: number) {
    await api.delete(`/cart/items/${itemId}`);
    await cartQuery.refetch();
  }

  async function saveAddress(event: FormEvent) {
    event.preventDefault();
    await api.post("/addresses", addressForm);
    setAddressForm({
      street: "",
      number: "",
      district: "",
      city: "",
      state: "",
      zip_code: "",
      complement: "",
      reference: ""
    });
    const result = await addressQuery.refetch();
    if (result.data?.length) {
      setSelectedAddressId(String(result.data[result.data.length - 1].id));
    }
  }

  async function createOrder() {
    const items = cartQuery.data ?? [];
    if (!items.length || !selectedAddressId) {
      return;
    }

    await api.post("/orders", {
      restaurant_id: items[0].restaurant_id,
      delivery_address_id: Number(selectedAddressId),
      items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
    });

    await cartQuery.refetch();
    router.push("/orders");
  }

  return (
    <main>
      <Header />
      <section className="container-box">
        <div className="mb-4 card">
          <h1 className="text-2xl font-black text-red-700">Carrinho</h1>
        </div>

        {(cartQuery.isError || addressQuery.isError) && (
          <div className="mb-4 card">Faça login como cliente para acessar carrinho e endereços.</div>
        )}

        <div className="grid gap-3">
          {(cartQuery.data ?? []).map((item) => (
            <article key={item.id} className="card flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{item.product_name}</h2>
                <p className="text-sm">Qtd: {item.quantity}</p>
                <p className="text-red-700">R$ {Number(item.line_total).toFixed(2)}</p>
              </div>
              <button className="rounded-lg border border-red-200 px-3 py-1" onClick={() => removeItem(item.id)}>
                Remover
              </button>
            </article>
          ))}
        </div>

        {!cartQuery.data?.length && <div className="mt-4 card">Seu carrinho está vazio.</div>}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="card space-y-3">
            <h2 className="text-lg font-bold text-red-700">Endereço de entrega</h2>
            <select
              className="w-full rounded-lg border border-red-100 p-2"
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              <option value="">Selecione um endereço</option>
              {(addressQuery.data ?? []).map((address) => (
                <option key={address.id} value={address.id}>
                  {address.street}, {address.number} - {address.city}/{address.state}
                </option>
              ))}
            </select>
            <form className="space-y-2" onSubmit={saveAddress}>
              <input className="w-full rounded-lg border border-red-100 p-2" placeholder="Rua" value={addressForm.street} onChange={(e) => setAddressForm((current) => ({ ...current, street: e.target.value }))} required />
              <div className="grid gap-2 md:grid-cols-2">
                <input className="w-full rounded-lg border border-red-100 p-2" placeholder="Número" value={addressForm.number} onChange={(e) => setAddressForm((current) => ({ ...current, number: e.target.value }))} required />
                <input className="w-full rounded-lg border border-red-100 p-2" placeholder="Bairro" value={addressForm.district} onChange={(e) => setAddressForm((current) => ({ ...current, district: e.target.value }))} required />
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <input className="w-full rounded-lg border border-red-100 p-2" placeholder="Cidade" value={addressForm.city} onChange={(e) => setAddressForm((current) => ({ ...current, city: e.target.value }))} required />
                <input className="w-full rounded-lg border border-red-100 p-2" placeholder="UF" maxLength={2} value={addressForm.state} onChange={(e) => setAddressForm((current) => ({ ...current, state: e.target.value.toUpperCase() }))} required />
                <input className="w-full rounded-lg border border-red-100 p-2" placeholder="CEP" value={addressForm.zip_code} onChange={(e) => setAddressForm((current) => ({ ...current, zip_code: e.target.value }))} required />
              </div>
              <input className="w-full rounded-lg border border-red-100 p-2" placeholder="Complemento" value={addressForm.complement} onChange={(e) => setAddressForm((current) => ({ ...current, complement: e.target.value }))} />
              <input className="w-full rounded-lg border border-red-100 p-2" placeholder="Referência" value={addressForm.reference} onChange={(e) => setAddressForm((current) => ({ ...current, reference: e.target.value }))} />
              <button className="btn-primary" type="submit">
                Salvar endereço
              </button>
            </form>
          </div>

          <div className="card">
            <p className="font-semibold">Subtotal: R$ {total.toFixed(2)}</p>
            <button className="btn-primary mt-3" onClick={createOrder}>
              Finalizar Pedido
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
