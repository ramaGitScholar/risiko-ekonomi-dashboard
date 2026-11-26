'use client';
import { useMemo } from 'react';
import { buildEws } from '@/lib/data';
import { QUAD_COLOR } from '@/lib/colors';
import { QUADRANT_INFO, f1, f2, type Scored } from '@/lib/indices';

function Bar({ label, value, color, right, sub }: { label: string; value: number; color: string; right: string; sub?: boolean }) {
  return (
    <div className={'bar-row' + (sub ? ' sub' : '')}>
      <span className="bar-label">{label}</span>
      <span className="bar-track" aria-hidden>
        <span className="bar-fill" style={{ width: `${Math.max(2, value * 100)}%`, background: color }} />
      </span>
      <span className="bar-val">{right}</span>
    </div>
  );
}

function Spark({ data, max }: { data: number[]; max?: number }) {
  const w = 110, h = 28;
  const lo = Math.min(...data), hi = max ?? Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - lo) / (hi - lo || 1)) * (h - 6)}`).join(' ');
  const last = pts.split(' ').pop()!.split(',');
  return (
    <svg width={w} height={h} className="spark" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--ink2)" strokeWidth="1.5" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill="var(--ink)" />
    </svg>
  );
}

export function QuadChip({ q, dark }: { q: Scored['quadrant']; dark: boolean }) {
  return (
    <span className="chip">
      <i style={{ background: QUAD_COLOR(q, dark) }} />
      {QUADRANT_INFO[q].nama} <span className="muted">({QUADRANT_INFO[q].alias})</span>
    </span>
  );
}

export default function DetailPanel({ row, dark }: { row: Scored; dark: boolean }) {
  const ews = useMemo(() => buildEws(row.prov), [row.prov]);
  const lastInfl = ews.inflPangan[11];
  const lastTpt = ews.tptMuda[11];
  const real = ews.realisasi[8];
  const flag = (bad: boolean) => (bad ? <b className="flag bad">▲ Waspada</b> : <b className="flag ok">● Normal</b>);

  return (
    <div className="detail">
      <h2 className="prov-name">{row.prov.nama}</h2>
      <QuadChip q={row.quadrant} dark={dark} />

      <div className="scores">
        <div><span className="muted">Kerentanan (EVI)</span><b>{f2(row.evi)}</b></div>
        <div><span className="muted">Ketahanan (ERI)</span><b>{f2(row.eri)}</b></div>
        <div><span className="muted">Risiko (EVI − ERI)</span><b>{row.risk > 0 ? '+' : ''}{f2(row.risk)}</b><span className="muted">peringkat {row.rankRisk} dari 34</span></div>
      </div>

      <h3>Kerentanan bawaan <span className="muted">bobot sama 25%</span></h3>
      {row.eviParts.map((p) => (
        <Bar key={p.id} label={p.label} value={p.score} color="var(--c-evi)" right={`${f2(p.score)}`} />
      ))}

      <h3>Ketahanan <span className="muted">tiga pilar, masing-masing 33,3%</span></h3>
      {row.subs.map((s) => (
        <Bar key={s.label} label={s.label} value={s.score} color="var(--c-eri)" right={f2(s.score)} sub={s.label.startsWith('–')} />
      ))}

      <h3>Radar peringatan dini <span className="muted">12 bulan terakhir, data contoh</span></h3>
      <div className="ews">
        <div><span>Inflasi pangan (yoy)</span><Spark data={ews.inflPangan} /><b>{f1(lastInfl)}%</b>{flag(lastInfl > 5)}</div>
        <div><span>TPT usia muda</span><Spark data={ews.tptMuda} /><b>{f1(lastTpt)}%</b>{flag(lastTpt > 15)}</div>
        <div><span>Realisasi belanja APBD (s.d. bulan ke-9)</span><Spark data={ews.realisasi.slice(0, 9)} max={100} /><b>{f1(real, 0)}%</b>{flag(real < 65)}</div>
      </div>
    </div>
  );
}
