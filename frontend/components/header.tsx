import Link from "next/link";

export function Header() {
  return (
    <header className="container-box">
      <nav className="card flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tight text-red-700">
          Entrega PI II
        </Link>
        <div className="flex gap-3 text-sm font-medium">
          <Link href="/login">Login</Link>
          <Link href="/cart">Carrinho</Link>
          <Link href="/orders">Pedidos</Link>
          <Link href="/owner">Painel Restaurante</Link>
        </div>
      </nav>
    </header>
  );
}
