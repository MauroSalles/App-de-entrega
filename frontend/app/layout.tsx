import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "App de Entrega",
    template: "%s | App de Entrega"
  },
  description: "Aplicacao de delivery full stack com cliente, restaurante e entregador.",
  keywords: ["delivery", "next.js", "fastapi", "projeto integrador", "app de entrega"]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
