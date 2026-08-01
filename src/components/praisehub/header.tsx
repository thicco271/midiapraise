"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Church, LogOut, LayoutDashboard, Calendar, Settings, History } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/praisehub/auth-provider";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navPublico: NavItem[] = [
  { href: "/", label: "Início", icon: Church },
  { href: "/eventos", label: "Próximos cultos", icon: Calendar },
  { href: "/historico", label: "Histórico", icon: History },
];

const navAdmin: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const items = user ? [...navPublico, ...navAdmin] : navPublico;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="praise-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="ADSA Reimberg Mídias - página inicial">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            aria-hidden="true"
          >
            <Church className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold text-primary">ADSA Reimberg Mídias</span>
            <span className="hidden text-[11px] uppercase tracking-widest text-praise-gold sm:inline">
              ADSA Reimberg
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground" aria-label={`Conectado como ${user.nome}`}>
                {user.nome.split(" ")[0]}
              </span>
              <Button size="sm" variant="ghost" onClick={() => logout()} aria-label="Sair da conta">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden praise-touch"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-background">
          <nav className="praise-container flex flex-col gap-1 py-3" aria-label="Navegação móvel">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-border pt-3">
              {user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="inline-flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Sair ({user.nome.split(" ")[0]})
                </button>
              ) : (
                <Button asChild className="w-full praise-touch">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
