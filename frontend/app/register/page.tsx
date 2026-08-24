"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { UserRole } from "@/lib/types";

const roles: UserRole[] = ["cliente", "dono_restaurante", "entregador"];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cliente" as UserRole });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.post("/auth/register", form);
      setSuccessMessage("Cadastro realizado. Agora voce pode fazer login.");
      setForm({ name: "", email: "", password: "", role: form.role });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel concluir o cadastro."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <Header />
      <section className="container-box">
        <form onSubmit={onSubmit} className="card mx-auto max-w-xl space-y-3">
          <h1 className="text-2xl font-black text-red-700">Criar conta</h1>
          {errorMessage && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
          {successMessage && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p>}
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            type="password"
            placeholder="Senha"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
            required
          />
          <select
            className="w-full rounded-lg border border-red-100 p-2"
            value={form.role}
            onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as UserRole }))}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Cadastrar"}
          </button>
          <p className="text-sm text-slate-500">
            Ja tem conta? <Link href="/login" className="text-red-700">Entrar</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
