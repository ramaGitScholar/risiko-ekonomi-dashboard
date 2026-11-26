'use client';
import { QuadChip } from './DetailPanel';
import { diverging } from '@/lib/colors';
import { f2, type Scored } from '@/lib/indices';

function List({ title, note, rows, total, dark, onPick, tone }: {
  title: string; note: string; rows: Scored[]; total: number; dark: boolean; onPick: (k: number) => void; tone: 'high' | 'low';
}) {
  const maxAbs = Math.max(0.001, ...rows.map((r) => Math.abs(r.risk)));
  return (
    <div className={'top5 ' + tone}>
      <h3>{title}</h3>
      <p className="note">{note}</p>
      <ol>
        {rows.map((r) => (
          <li key={r.prov.kode}>
            <button className="top5-row" onClick={() => onPick(r.prov.kode)} title={`Lihat detail ${r.prov.nama}`}>
              <span className="top5-rank">{r.rankRisk}<span className="muted">/{total}</span></span>
              <span className="top5-name">
                <b>{r.prov.nama}</b>
                <QuadChip q={r.quadrant} dark={dark} />
              </span>
              <span className="top5-bar" aria-hidden>
                <span style={{ width: `${Math.max(4, (Math.abs(r.risk) / maxAbs) * 100)}%`, background: diverging(r.risk / 0.6, dark) }} />
              </span>
              <span className="top5-val">{r.risk > 0 ? '+' : ''}{f2(r.risk)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function TopFive({ rows, dark, onPick }: { rows: Scored[]; dark: boolean; onPick: (k: number) => void }) {
  const byRisk = [...rows].sort((a, b) => b.risk - a.risk);
  return (
    <div className="top5-grid">
      <List
        tone="high"
        title="5 provinsi risiko tertinggi"
        note="Kerentanan bawaan paling besar dibanding ketahanannya."
        rows={byRisk.slice(0, 5)}
        total={rows.length}
        dark={dark}
        onPick={onPick}
      />
      <List
        tone="low"
        title="5 provinsi risiko terendah"
        note="Ketahanan kebijakan paling mampu menutup kerentanannya."
        rows={byRisk.slice(-5).reverse()}
        total={rows.length}
        dark={dark}
        onPick={onPick}
      />
    </div>
  );
}
