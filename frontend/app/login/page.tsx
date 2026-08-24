"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await api.post<{ access_token: string }>("/auth/login", { email, password });
      setToken(response.data.access_token);
      setSuccessMessage("Login realizado com sucesso.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Nao foi possivel fazer login."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <Header />
      <section className="container-box">
        <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-3">
          <h1 className="text-2xl font-black text-red-700">Entrar</h1>
          {errorMessage && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
          {successMessage && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p>}
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
          <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Acessar"}
          </button>
          <p className="text-sm text-slate-500">
            Ainda nao tem conta? <Link href="/register" className="text-red-700">Cadastre-se</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
