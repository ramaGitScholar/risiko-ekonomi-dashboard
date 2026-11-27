import type { Metadata } from 'next';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/newsreader';
import './globals.css';
import { THEME_INIT } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'VERA · Vulnerability & Economic Resilience Atlas',
  description: 'VERA: prototipe atlas risiko ekonomi 34 provinsi Indonesia berbasis kerangka kerentanan dan ketahanan Briguglio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
