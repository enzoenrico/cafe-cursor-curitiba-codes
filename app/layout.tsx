import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { LanguageProvider } from "@/components/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cafe Cursor | Obtenha seu crédito gratuito",
  description: "Cadastre-se para obter seu crédito gratuito do Cursor IDE. Comunidade de desenvolvedores.",
  keywords: ["cursor", "ide", "crédito", "desenvolvedores", "programação"],
  authors: [{ name: "Cafe Cursor" }],
  openGraph: {
    title: "Cafe Cursor | Obtenha seu crédito gratuito",
    description: "Cadastre-se para obter seu crédito gratuito do Cursor IDE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
