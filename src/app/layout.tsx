import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

import { FooterWrapper } from '@/components/layout/FooterWrapper';

export const metadata: Metadata = {
  title: 'Escuela de Ingeniería Eléctrica | UTS',
  description: 'Portal Académico Institucional de Alta Concurrencia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased bg-white text-oxfordGrey-900`}>
        {children}
        <FooterWrapper />
      </body>
    </html>
  );
}
