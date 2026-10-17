import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { BetProvider } from '@/context/BetContext';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import LiveAlert from '@/components/LiveAlert/LiveAlert';
import Betslip from '@/components/Betslip/Betslip';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'BetCerta — Apostas Esportivas e Futebol Online Brasil',
  description:
    'A melhor e mais moderna plataforma de apostas esportivas e futebol do Brasil. Depósito e saque instantâneo via PIX, super odds de futebol, Brasileirão e grandes ligas!',
  keywords:
    'apostas esportivas, futebol, betcerta, super odds, pix rapido, brasileirao, champions league, premier league',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <BetProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Suspense fallback={<div style={{ height: '68px', background: '#0a0f1d' }} />}>
              <Navbar />
            </Suspense>
            <LiveAlert />
            <div style={{ flex: 1 }}>{children}</div>
            <Footer />
            <Betslip />
          </div>
        </BetProvider>
      </body>
    </html>
  );
}
