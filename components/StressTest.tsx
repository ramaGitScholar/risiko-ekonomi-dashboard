'use client';
import { useMemo, useState } from 'react';
import MapView, { type Feat } from './MapView';
import QuadrantPlot from './QuadrantPlot';
import { QuadChip } from './DetailPanel';
import { seqOrange } from '@/lib/colors';
import { QUADRANT_INFO, f1, f2, type Result } from '@/lib/indices';
import { NO_SHOCK, runStress, type Shock } from '@/lib/stress';

const PRESETS: { label: string; s: Shock }[] = [
  { label: 'Nikel anjlok 30%', s: { ...NO_SHOCK, nikel: -30 } },
  { label: 'CPO anjlok 30%', s: { ...NO_SHOCK, cpo: -30 } },
  { label: 'El Niño parah', s: { ...NO_SHOCK, elnino: 80 } },
  { label: 'Semua bersamaan', s: { nikel: -30, cpo: -30, batubara: -30, elnino: 80, logistik: 50 } },
];

function Slider({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="slider">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={5} value={value} onChange={(e) => onChange(+e.target.value)} />
      <output>{value > 0 && min < 0 ? '+' : ''}{value}{unit}</output>
    </label>
  );
}

export default function StressTest({ base, features, selected, onSelect, dark }: {
  base: Result; features: Feat[]; selected: number; onSelect: (k: number) => void; dark: boolean;
}) {
  const [s, setS] = useState<Shock>(PRESETS[3].s);
  const rows = useMemo(() => runStress(base, s), [base, s]);
  const byKode = useMemo(() => new Map(rows.map((r) => [r.kode, r])), [rows]);
  const maxD = Math.max(0.001, ...rows.map((r) => r.dRisk));
  const moved = rows.filter((r) => r.qAfter !== r.qBase);
  const toWorst = moved.filter((r) => r.qAfter === 'worst');
  const top = [...rows].sort((a, b) => b.dRisk - a.dRisk).slice(0, 10);
  const none = rows.every((r) => r.dRisk < 1e-6);

  return (
    <div className="stress">
      <section className="card controls-card">
        <h2>Skenario guncangan</h2>
        <div className="presets">
          {PRESETS.map((p) => (
            <button key={p.label} className="btn" onClick={() => setS(p.s)}>{p.label}</button>
          ))}
          <button className="btn ghost" onClick={() => setS(NO_SHOCK)}>Atur ulang</button>
        </div>
        <Slider label="Harga nikel" value={s.nikel} min={-60} max={30} unit="%" onChange={(v) => setS({ ...s, nikel: v })} />
        <Slider label="Harga CPO" value={s.cpo} min={-60} max={30} unit="%" onChange={(v) => setS({ ...s, cpo: v })} />
        <Slider label="Harga batubara" value={s.batubara} min={-60} max={30} unit="%" onChange={(v) => setS({ ...s, batubara: v })} />
        <Slider label="Intensitas El Niño" value={s.elnino} min={0} max={100} unit="" onChange={(v) => setS({ ...s, elnino: v })} />
        <Slider label="Gangguan logistik antar-pulau" value={s.logistik} min={0} max={100} unit="" onChange={(v) => setS({ ...s, logistik: v })} />
        <p className="note">Koefisien dampak adalah heuristik ilustratif dan belum dikalibrasi. Ganti dengan elastisitas hasil estimasi sebelum dipakai untuk keputusan.</p>
      </section>

      <section className="card summary-card">
        <h2>Hasil</h2>
        {none ? (
          <p className="empty">Geser salah satu pengatur di kiri atau pilih skenario untuk melihat provinsi mana yang terdampak.</p>
        ) : (
          <p className="lead">
            <b>{moved.length}</b> provinsi berpindah kuadran, <b>{toWorst.length}</b> di antaranya masuk ke Worst-case
            {toWorst.length > 0 && <>: {toWorst.map((r) => r.singkat).join(', ')}</>}.
          </p>
        )}
        <div className="map-small">
          <MapView
            features={features}
            selected={selected}
            onSelect={onSelect}
            nameOf={(k) => byKode.get(k)?.nama ?? ''}
            fill={(k) => seqOrange(Math.min(1, (byKode.get(k)?.dRisk ?? 0) / maxD) * (none ? 0 : 1), dark)}
            tip={(k) => {
              const r = byKode.get(k)!;
              return (<><b>{r.nama}</b><div>Δ risiko: +{f2(r.dRisk)}</div><div>{QUADRANT_INFO[r.qBase].nama} → {QUADRANT_INFO[r.qAfter].nama}</div></>);
            }}
          />
          <div className="legend-seq">
            <span>Tidak berubah</span>
            <i style={{ background: `linear-gradient(90deg, ${seqOrange(0, dark)}, ${seqOrange(0.5, dark)}, ${seqOrange(1, dark)})` }} />
            <span>Kenaikan risiko +{f2(maxD)}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Pergeseran pada matriks kuadran</h2>
        <p className="note">Titik = posisi setelah guncangan; garis menunjukkan arah perpindahan dari posisi awal.</p>
        <QuadrantPlot
          dark={dark}
          cutEvi={base.cutEvi}
          cutEri={base.cutEri}
          selected={selected}
          onSelect={onSelect}
          pts={rows.map((r) => ({
            kode: r.kode, singkat: r.singkat, evi: r.eviBase, eri: r.eriBase, quadrant: r.qBase, risk: r.riskBase,
            evi2: r.eviAfter, eri2: r.eriAfter, quadrant2: r.qAfter,
          }))}
        />
      </section>

      <section className="card">
        <h2>Sepuluh provinsi paling terdampak</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Provinsi</th><th className="num">PDRB (pp)</th><th className="num">Pendapatan APBD (%)</th><th className="num">Tekanan pangan</th><th className="num">Δ risiko</th><th>Kuadran</th></tr>
            </thead>
            <tbody>
              {top.map((r) => (
                <tr key={r.kode} onClick={() => onSelect(r.kode)} className={r.kode === selected ? 'sel' : ''}>
                  <td>{r.nama}</td>
                  <td className="num">{f1(r.hitPdrb)}</td>
                  <td className="num">{f1(r.hitFiskal)}</td>
                  <td className="num">{f1(r.tekananPangan)}</td>
                  <td className="num">{r.dRisk > 0 ? '+' : ''}{f2(r.dRisk)}</td>
                  <td>{r.qAfter === r.qBase ? <QuadChip q={r.qAfter} dark={dark} /> : <>{QUADRANT_INFO[r.qBase].nama} → <b>{QUADRANT_INFO[r.qAfter].nama}</b></>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
