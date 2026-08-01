"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/praisehub/auth-provider";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const cb = encodeURIComponent(pathname || "/admin/dashboard");
      router.replace(`/login?callbackUrl=${cb}`);
      return;
    }
    if (user.perfil === "visitante") {
      router.replace("/");
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Verificando permissões…</span>
      </div>
    );
  }

  return <>{children}</>;
}
