import type { Metadata } from 'next';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/newsreader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Indeks Risiko Ekonomi Provinsi',
  description: 'Prototipe dasbor risiko ekonomi 34 provinsi berbasis kerangka kerentanan dan ketahanan Briguglio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
