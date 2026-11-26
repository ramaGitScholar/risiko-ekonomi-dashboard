'use client';
import { useState } from 'react';
import { QUAD_COLOR } from '@/lib/colors';
import { QUADRANT_INFO, type Quadrant } from '@/lib/indices';

export type Pt = {
  kode: number;
  singkat: string;
  evi: number;
  eri: number;
  quadrant: Quadrant;
  risk: number;
  evi2?: number; // posisi setelah guncangan (opsional)
  eri2?: number;
  quadrant2?: Quadrant;
};

type Props = {
  pts: Pt[];
  cutEvi: number;
  cutEri: number;
  selected: number;
  onSelect: (kode: number) => void;
  dark: boolean;
};

const W = 560;
const H = 470;
const M = { l: 48, r: 14, t: 14, b: 44 };

export default function QuadrantPlot({ pts, cutEvi, cutEri, selected, onSelect, dark }: Props) {
  const [hov, setHov] = useState<number | null>(null);
  const x = (v: number) => M.l + v * (W - M.l - M.r);
  const y = (v: number) => H - M.b - v * (H - M.t - M.b);
  const after = pts.some((p) => p.evi2 !== undefined);

  const top = new Set([...pts].sort((a, b) => b.risk - a.risk).slice(0, 3).map((p) => p.kode));
  const movedTop = new Set(
    pts.filter((p) => p.quadrant2 !== undefined && p.quadrant2 !== p.quadrant)
      .sort((a, b) => (b.evi2! - b.eri2!) - (a.evi2! - a.eri2!)).slice(0, 5).map((p) => p.kode),
  );
  const labelled = (p: Pt) => p.kode === selected || p.kode === hov || (!after && top.has(p.kode)) || (after && movedTop.has(p.kode));

  const cx = x(cutEri);
  const cy = y(cutEvi);
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="qplot" role="group" aria-label="Matriks kuadran kerentanan dan ketahanan">
      <defs>
        <marker id="arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--ink2)" />
        </marker>
      </defs>

      {/* latar kuadran */}
      <rect x={M.l} y={M.t} width={cx - M.l} height={cy - M.t} className="q-bg q-worst" />
      <rect x={cx} y={M.t} width={W - M.r - cx} height={cy - M.t} className="q-bg q-self" />
      <rect x={M.l} y={cy} width={cx - M.l} height={H - M.b - cy} className="q-bg q-prod" />
      <rect x={cx} y={cy} width={W - M.r - cx} height={H - M.b - cy} className="q-bg q-best" />

      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={H - M.b} y2={H - M.b + 4} className="axis" />
          <text x={x(t)} y={H - M.b + 17} textAnchor="middle" className="tick">{String(t).replace('.', ',')}</text>
          <line x1={M.l - 4} x2={M.l} y1={y(t)} y2={y(t)} className="axis" />
          <text x={M.l - 8} y={y(t) + 4} textAnchor="end" className="tick">{String(t).replace('.', ',')}</text>
        </g>
      ))}
      <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} className="axis" />
      <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} className="axis" />
      <line x1={cx} x2={cx} y1={M.t} y2={H - M.b} className="cut" />
      <line x1={M.l} x2={W - M.r} y1={cy} y2={cy} className="cut" />

      <text x={M.l + 8} y={M.t + 16} className="qlabel">{QUADRANT_INFO.worst.nama}</text>
      <text x={W - M.r - 8} y={M.t + 16} textAnchor="end" className="qlabel">{QUADRANT_INFO['self-made'].nama}</text>
      <text x={M.l + 8} y={H - M.b - 8} className="qlabel">{QUADRANT_INFO.prodigal.nama}</text>
      <text x={W - M.r - 8} y={H - M.b - 8} textAnchor="end" className="qlabel">{QUADRANT_INFO.best.nama}</text>

      <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" className="axis-title">Ketahanan (ERI) →</text>
      <text transform={`translate(13 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" className="axis-title">Kerentanan (EVI) →</text>

      {after && pts.map((p) =>
        p.evi2 !== undefined && p.eri2 !== undefined && Math.hypot(x(p.eri2) - x(p.eri), y(p.evi2) - y(p.evi)) > 5 ? (
          <g key={'a' + p.kode}>
            <circle cx={x(p.eri)} cy={y(p.evi)} r={3.5} className="ghost" />
            <line x1={x(p.eri)} y1={y(p.evi)} x2={x(p.eri2) - ((x(p.eri2) - x(p.eri)) / Math.hypot(x(p.eri2) - x(p.eri), y(p.evi2) - y(p.evi))) * 10} y2={y(p.evi2) - ((y(p.evi2) - y(p.evi)) / Math.hypot(x(p.eri2) - x(p.eri), y(p.evi2) - y(p.evi))) * 10} className="shift" markerEnd="url(#arrow)" />
          </g>
        ) : null,
      )}

      {pts.map((p) => {
        const ex = after && p.eri2 !== undefined ? p.eri2 : p.eri;
        const ey = after && p.evi2 !== undefined ? p.evi2 : p.evi;
        const q = after && p.quadrant2 ? p.quadrant2 : p.quadrant;
        const sel = p.kode === selected;
        return (
          <g key={p.kode} transform={`translate(${x(ex)} ${y(ey)})`}
            onClick={() => onSelect(p.kode)} onMouseEnter={() => setHov(p.kode)} onMouseLeave={() => setHov(null)}
            tabIndex={0} role="button" aria-label={`${p.singkat}: ${QUADRANT_INFO[q].nama}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(p.kode))}
            className="dot">
            <circle r={13} fill="transparent" />
            <circle r={sel ? 8 : 6} fill={QUAD_COLOR(q, dark)} className={sel ? 'dot-sel' : 'dot-c'} />
            {labelled(p) && <text x={9} y={-8} className="dot-label">{p.singkat}</text>}
          </g>
        );
      })}
    </svg>
  );
}
