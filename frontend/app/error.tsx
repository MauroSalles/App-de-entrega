"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-box flex min-h-screen items-center justify-center">
      <section className="glass-panel max-w-xl px-6 py-8 text-center">
        <span className="badge">Ops</span>
        <h1 className="mt-4 text-3xl font-black text-red-700">Algo saiu do caminho.</h1>
        <p className="mt-3 text-sm text-slate-600">Tente carregar a pagina novamente ou volte para a vitrine principal.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-primary" onClick={reset} type="button">
            Tentar novamente
          </button>
          <Link href="/" className="btn-secondary">
            Voltar ao inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
