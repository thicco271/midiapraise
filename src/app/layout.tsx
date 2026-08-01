import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/praisehub/auth-provider";
import { LayoutShell } from "@/components/praisehub/layout-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADSA Reimberg Mídias · Central de Mídia ADSA Reimberg",
  description:
    "Artes, fotos e materiais oficiais da ADSA Reimberg, organizados em um só lugar. Consulte o próximo culto, baixe as artes e utilize na igreja.",
  keywords: [
    "ADSA Reimberg Mídias",
    "ADSA Reimberg",
    "mídia",
    "culto",
    "artes",
    "galeria",
    "igreja",
  ],
  authors: [{ name: "ADSA Reimberg" }],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "ADSA Reimberg Mídias · Central de Mídia ADSA Reimberg",
    description:
      "Artes, fotos e materiais oficiais da ADSA Reimberg, organizados em um só lugar.",
    siteName: "ADSA Reimberg Mídias",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F2A5C",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={geistSans.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
