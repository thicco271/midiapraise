"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  url: string;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary" | "link" | "destructive";
  className?: string;
}

export function CopyLinkButton({
  url,
  label = "Copiar link",
  size = "default",
  variant = "outline",
  className,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const fullUrl =
        typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copiado para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link. Copie manualmente: " + url);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleCopy}
      className={className}
      aria-label={label}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden="true" />
          {label}
        </>
      )}
    </Button>
  );
}
