// Layout específico para o modo telão
// Layout pai (com Header/Footer) ainda aplica, mas TelaoPlayer usa position:fixed
// que cobre tudo visualmente
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Modo Telão · ADSA Reimberg Mídias",
};

export default function TelaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
      <SonnerToaster position="top-center" richColors />
    </>
  );
}
