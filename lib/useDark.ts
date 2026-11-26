'use client';
import { useEffect, useState } from 'react';

// Mengikuti preferensi warna sistem; dipakai untuk warna yang dihitung di JS (peta, grafik).
export function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setDark(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return dark;
}
