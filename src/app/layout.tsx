import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/praisehub/auth-provider";
import { Header } from "@/components/praisehub/header";
import { Footer } from "@/components/praisehub/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PraiseHub · Central de Mídia ADSA Praise",
  description:
    "Artes, fotos e materiais oficiais da ADSA Praise, organizados em um só lugar. Consulte o próximo culto, baixe as artes e utilize na igreja.",
  keywords: [
    "PraiseHub",
    "ADSA Praise",
    "mídia",
    "culto",
    "artes",
    "galeria",
    "igreja",
  ],
  authors: [{ name: "ADSA Praise" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "PraiseHub · Central de Mídia ADSA Praise",
    description:
      "Artes, fotos e materiais oficiais da ADSA Praise, organizados em um só lugar.",
    siteName: "PraiseHub",
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
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1" id="conteudo-principal">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
