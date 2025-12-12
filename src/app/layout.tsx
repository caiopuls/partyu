import type { Metadata } from "next";
import { Sora, Gochi_Hand } from "next/font/google";

import "./globals.css";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { SiteHeader } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const gochiHand = Gochi_Hand({
  variable: "--font-gochi",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "PartyU — Ingressos e revenda segura para eventos",
  description:
    "PartyU é sua carteira digital de ingressos para festas, shows e festivais, com compra e revenda segura usando PIX.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${gochiHand.variable} bg-background text-foreground antialiased font-sans`}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 bg-linear-to-b from-background via-background to-muted/60">
            {children}
          </main>
          <FooterWrapper />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
