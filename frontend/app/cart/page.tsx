"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Address, AddressPayload } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

const emptyAddress: AddressPayload = {
  street: "",
  number: "",
  district: "",
  city: "",
  state: "",
  zip_code: "",
  complement: "",
  reference: ""
};

export default function CartPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { items, restaurantId, removeItem, decrementItem, clear } = useCartStore();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState<AddressPayload>(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await api.get<Address[]>("/addresses");
      return response.data;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (!selectedAddressId && addressesQuery.data?.length) {
      setSelectedAddressId(addressesQuery.data[0].id);
    }
  }, [addressesQuery.data, selectedAddressId]);

  function resetAddressForm() {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
  }

  async function saveAddress(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingAddressId) {
        await api.put(`/addresses/${editingAddressId}`, addressForm);
        setSuccessMessage("Endereco atualizado.");
      } else {
        await api.post("/addresses", addressForm);
        setSuccessMessage("Endereco cadastrado.");
      }
      resetAddressForm();
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel salvar o endereco."));
    }
  }

  async function removeAddress(addressId: number) {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.delete(`/addresses/${addressId}`);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
      setSuccessMessage("Endereco removido.");
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel remover o endereco."));
    }
  }

  async function createOrder() {
    if (!restaurantId || !items.length) {
      return;
    }

    if (!selectedAddressId) {
      setErrorMessage("Selecione ou cadastre um endereco para finalizar o pedido.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.post("/orders", {
        restaurant_id: restaurantId,
        delivery_address_id: selectedAddressId,
        items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
      });

      clear();
      setSuccessMessage("Pedido criado com sucesso.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel criar o pedido."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <Header />
      <section className="container-box grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="glass-panel px-6 py-6">
            <span className="badge">Checkout inteligente</span>
            <h1 className="mt-3 text-3xl font-black text-red-700">Carrinho</h1>
            <p className="mt-2 text-sm text-slate-600">Ajuste quantidades, confirme o endereco e finalize o pedido em poucos passos.</p>
          </div>

          {errorMessage && <div className="card text-red-700">{errorMessage}</div>}
          {successMessage && <div className="card text-emerald-700">{successMessage}</div>}

          <div className="grid gap-3">
            {items.map((item) => (
              <article key={item.product_id} className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-slate-500">Qtd: {item.quantity}</p>
                  <p className="text-red-700">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="btn-secondary px-3 py-1.5" onClick={() => decrementItem(item.product_id)} type="button">
                    -1
                  </button>
                  <button className="btn-primary px-3 py-1.5" onClick={() => removeItem(item.product_id)} type="button">
                    Remover
                  </button>
                </div>
              </article>
            ))}
            {!items.length && <div className="card text-sm text-slate-500">Seu carrinho esta vazio.</div>}
          </div>

          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Itens no carrinho</p>
                <p className="text-2xl font-black text-slate-900">{itemCount}</p>
              </div>
              {!!items.length && (
                <button className="btn-secondary" onClick={clear} type="button">
                  Limpar carrinho
                </button>
              )}
            </div>
            <p className="mt-4 font-semibold">Subtotal: R$ {total.toFixed(2)}</p>
            {restaurantId && <p className="mt-1 text-sm text-slate-500">Pedido vinculado ao restaurante #{restaurantId}.</p>}
            {!user ? (
              <p className="mt-3 text-sm text-slate-600">Faca login para cadastrar endereco e concluir o pedido.</p>
            ) : (
              <button className="btn-primary mt-3" onClick={createOrder} disabled={isSubmitting || !items.length}>
                {isSubmitting ? "Finalizando..." : "Finalizar Pedido"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="text-xl font-black text-red-700">Endereco de entrega</h2>
            {!user && <p className="mt-2 text-sm text-slate-500">Entre na sua conta para gerenciar enderecos.</p>}
            {addressesQuery.isLoading && user && <p className="mt-2 text-sm">Carregando enderecos...</p>}
            {user && (
              <div className="mt-3 space-y-3">
                {addressesQuery.data?.map((address) => (
                  <article key={address.id} className="rounded-xl border border-red-100 p-3">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="radio"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-semibold">
                          {address.street}, {address.number}
                        </p>
                        <p>
                          {address.district} - {address.city}/{address.state}
                        </p>
                        <p>CEP {address.zip_code}</p>
                        {address.complement && <p>{address.complement}</p>}
                        {address.reference && <p>{address.reference}</p>}
                      </div>
                    </label>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="rounded-lg border border-red-200 px-3 py-1 text-sm"
                        onClick={() => {
                          setEditingAddressId(address.id);
                          setAddressForm({
                            street: address.street,
                            number: address.number,
                            district: address.district,
                            city: address.city,
                            state: address.state,
                            zip_code: address.zip_code,
                            complement: address.complement ?? "",
                            reference: address.reference ?? ""
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg border border-red-200 px-3 py-1 text-sm"
                        onClick={() => removeAddress(address.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
                {!addressesQuery.data?.length && <p className="text-sm text-slate-500">Nenhum endereco cadastrado.</p>}
              </div>
            )}
          </div>

          {user && (
            <form onSubmit={saveAddress} className="card space-y-2">
              <h2 className="text-lg font-black text-red-700">{editingAddressId ? "Editar endereco" : "Novo endereco"}</h2>
              {([
                ["street", "Rua"],
                ["number", "Numero"],
                ["district", "Bairro"],
                ["city", "Cidade"],
                ["state", "UF"],
                ["zip_code", "CEP"],
                ["complement", "Complemento"],
                ["reference", "Referencia"]
              ] as Array<[keyof AddressPayload, string]>).map(([field, label]) => (
                <input
                  key={field}
                  className="w-full rounded-lg border border-red-100 p-2"
                  placeholder={label}
                  value={addressForm[field] ?? ""}
                  onChange={(event) => setAddressForm((current) => ({ ...current, [field]: event.target.value }))}
                  required={["street", "number", "district", "city", "state", "zip_code"].includes(field)}
                />
              ))}
              <div className="flex gap-2">
                <button className="btn-primary" type="submit">
                  {editingAddressId ? "Salvar alteracoes" : "Cadastrar endereco"}
                </button>
                {editingAddressId && (
                  <button className="rounded-lg border border-red-200 px-3 py-1" type="button" onClick={resetAddressForm}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
