"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Detecta páginas sin header (públicas)
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/splash");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header solo en páginas privadas */}
      {!isPublicPage && <Header />}

      {/* Main con orden fijo de clases */}
      <main className="flex flex-col flex-grow">{children}</main>

      <Footer />
    </div>
  );
}
