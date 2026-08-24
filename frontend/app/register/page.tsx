"use client";

import { FormEvent, useState } from "react";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("cliente");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await api.post("/auth/register", { name, email, password, role });
    alert("Cadastro realizado. Agora faça login.");
    setName("");
    setEmail("");
    setPassword("");
    setRole("cliente");
  }

  return (
    <main>
      <Header />
      <section className="container-box">
        <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-3">
          <h1 className="text-2xl font-black text-red-700">Criar conta</h1>
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border border-red-100 p-2"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="w-full rounded-lg border border-red-100 p-2"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="cliente">Cliente</option>
            <option value="dono_restaurante">Dono de restaurante</option>
            <option value="entregador">Entregador</option>
          </select>
          <button className="btn-primary w-full" type="submit">
            Cadastrar
          </button>
        </form>
      </section>
    </main>
  );
}
