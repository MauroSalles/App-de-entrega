"use client";

import { FormEvent, useState } from "react";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setToken = useAuthStore((state) => state.setToken);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await api.post<{ access_token: string }>("/auth/login", { email, password });
    setToken(response.data.access_token);
    alert("Login realizado.");
  }

  return (
    <main>
      <Header />
      <section className="container-box">
        <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-3">
          <h1 className="text-2xl font-black text-red-700">Entrar</h1>
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
          <button className="btn-primary w-full" type="submit">
            Acessar
          </button>
        </form>
      </section>
    </main>
  );
}
