"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareWhatsAppButtonProps {
  slug: string;
  nome: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary" | "link" | "destructive";
}

export function ShareWhatsAppButton({
  slug,
  nome,
  className,
  size = "default",
  variant = "outline",
}: ShareWhatsAppButtonProps) {
  const handleClick = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/eventos/${slug}`;
    const mensagem = `As artes oficiais do próximo culto já estão disponíveis no PraiseHub. Acesse o link para visualizar e baixar as versões atualizadas.\n\n${nome}\n${url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank", "noopener,noreferrer");
      toast.success("Abrindo WhatsApp…");
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleClick}
      className={className}
      aria-label="Compartilhar no WhatsApp"
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      WhatsApp
    </Button>
  );
}
