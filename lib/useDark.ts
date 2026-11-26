'use client';
import { useCallback, useEffect, useState } from 'react';

import { THEME_KEY as KEY } from './theme';

// Tema mengikuti preferensi sistem sampai pengguna memilih sendiri lewat tombol.
// Pilihan disimpan di localStorage dan dipasang sebagai <html data-theme="...">
// (skrip kecil di app/layout.tsx memasangnya sebelum halaman tampil agar tidak berkedip).
export function useTheme(): [boolean, (dark: boolean) => void] {
  const [dark, setDarkState] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const t = root.dataset.theme;
      setDarkState(t === 'dark' || (t !== 'light' && mq.matches));
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const setDark = useCallback((d: boolean) => {
    const t = d ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch { /* penyimpanan diblokir: tema tetap berlaku untuk sesi ini */ }
    setDarkState(d);
  }, []);

  return [dark, setDark];
}

