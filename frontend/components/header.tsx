"use client";

import Link from "next/link";

import { useAuthStore } from "@/store/auth";

export function Header() {
  const { token, setToken } = useAuthStore();

  function logout() {
    setToken(null);
  }

  return (
    <header className="container-box">
      <nav className="card flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tight text-red-700">
          Entrega PI II
        </Link>
        <div className="flex gap-3 text-sm font-medium">
          {!token && <Link href="/login">Login</Link>}
          {!token && <Link href="/register">Cadastro</Link>}
          <Link href="/cart">Carrinho</Link>
          <Link href="/orders">Pedidos</Link>
          <Link href="/owner">Painel Restaurante</Link>
          <Link href="/courier">Painel Entregador</Link>
          {token && (
            <button className="text-red-700 font-semibold" onClick={logout}>
              Sair
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
