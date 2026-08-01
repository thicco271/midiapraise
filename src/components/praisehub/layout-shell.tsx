"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/praisehub/header";
import { Footer } from "@/components/praisehub/footer";

// Rotas que NÃO devem ter Header/Footer (fullscreen)
const FULLSCREEN_ROUTES = ["/telao"];

function isFullscreenRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  // /telao (exato) é fullscreen
  // /telao/selecionar NÃO é fullscreen (precisa do header)
  if (pathname === "/telao") return true;
  return false;
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = isFullscreenRoute(pathname);

  if (isFullscreen) {
    // Sem Header/Footer — modo telão fullscreen
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1" id="conteudo-principal">
        {children}
      </main>
      <Footer />
    </div>
  );
}
