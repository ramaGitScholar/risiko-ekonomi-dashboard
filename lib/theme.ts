// Dipakai oleh server (app/layout.tsx) dan klien (lib/useDark.ts), jadi tanpa 'use client'.
export const THEME_KEY = 'theme';
export const THEME_INIT = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
