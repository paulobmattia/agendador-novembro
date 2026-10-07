import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agendador Novembro - Conciliação de Agendas em Grupo',
  description:
    'Aplicação moderna e fluida mobile-first para conciliar disponibilidades e encontrar as melhores datas em comum no mês de Novembro.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Agendador Novembro',
    description: 'Preencha sua disponibilidade de Novembro em segundos.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="antialiased selection:bg-emerald-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
