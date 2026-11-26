import type { Quadrant } from './indices';

type RGB = [number, number, number];
const toRgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: RGB) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;

function ramp(stops: string[], t: number) {
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return css(mix(toRgb(stops[i]), toRgb(stops[i + 1]), x - i));
}

// Sequential: satu rona, terang→gelap. Di mode gelap dibalik agar nilai rendah menyatu dengan latar.
const BLUE = ['#cce3fd', '#84b9f3', '#338ced', '#1b64be', '#0e3d7e'];
const ORANGE = ['#fde3d0', '#f9b98a', '#f47230', '#c04f12', '#7d3008'];
export const seqBlue = (t: number, dark: boolean) => ramp(dark ? [...BLUE].reverse() : BLUE, t);
export const seqOrange = (t: number, dark: boolean) => ramp(dark ? [...ORANGE].reverse() : ORANGE, t);

// Diverging: dua rona + titik tengah abu-abu. t ∈ [−1, 1]; positif = merah (risiko), negatif = biru.
export function diverging(t: number, dark: boolean) {
  const mid = toRgb(dark ? '#383838' : '#efefef');
  const red = toRgb(dark ? '#eb6263' : '#b02a2b');
  const blue = toRgb(dark ? '#338ced' : '#1757ac');
  const a = Math.min(1, Math.abs(t));
  return css(mix(mid, t >= 0 ? red : blue, a));
}

// Kuadran: rona = kerentanan (merah tinggi, biru rendah); terang/gelap = ketahanan (gelap rendah).
export const QUAD_COLOR = (q: Quadrant, dark: boolean) =>
  dark
    ? { worst: '#e0504f', 'self-made': '#f5b3a6', prodigal: '#4d94e8', best: '#bcd8f7' }[q]
    : { worst: '#b3262a', 'self-made': '#f2a597', prodigal: '#2d6fc4', best: '#b4d3f6' }[q];
