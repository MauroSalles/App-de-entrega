"use client";

import Link from "next/link";

import { useAuthStore } from "@/store/auth";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="container-box">
      <nav className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-xl font-black tracking-tight text-red-700">
            Entrega PI II
          </Link>
          <p className="text-sm text-slate-500">MVP com cliente, restaurante e entregador.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
          <Link href="/">Inicio</Link>
          <Link href="/cart">Carrinho</Link>
          {user && <Link href="/orders">Pedidos</Link>}
          {user?.role === "cliente" && <Link href="/register">Conta</Link>}
          {(user?.role === "dono_restaurante" || user?.role === "admin") && <Link href="/owner">Painel Restaurante</Link>}
          {user?.role === "entregador" && <Link href="/courier">Painel Entregador</Link>}
          {!user ? (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Cadastro</Link>
            </>
          ) : (
            <>
              <span className="text-slate-500">{user.name}</span>
              <button className="rounded-lg border border-red-200 px-3 py-1" onClick={logout}>
                Sair
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
