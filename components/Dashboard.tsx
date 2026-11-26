'use client';
import { useEffect, useMemo, useState } from 'react';
import MapView, { type Feat } from './MapView';
import QuadrantPlot from './QuadrantPlot';
import DetailPanel, { QuadChip } from './DetailPanel';
import StressTest from './StressTest';
import Catalog from './Catalog';
import { buildProvinces } from '@/lib/data';
import { QUAD_COLOR, diverging, seqBlue, seqOrange } from '@/lib/colors';
import { QUADRANT_INFO, computeIndices, f1, f2, type Quadrant } from '@/lib/indices';
import { useDark } from '@/lib/useDark';

type Tab = 'peta' | 'stress' | 'kamus';
type Metric = 'risk' | 'evi' | 'eri' | 'quad';

const METRICS: { id: Metric; label: string }[] = [
  { id: 'risk', label: 'Risiko' },
  { id: 'evi', label: 'Kerentanan (EVI)' },
  { id: 'eri', label: 'Ketahanan (ERI)' },
  { id: 'quad', label: 'Kuadran' },
];

const QUADS: Quadrant[] = ['worst', 'self-made', 'prodigal', 'best'];

export default function Dashboard() {
  const dark = useDark();
  const [tab, setTab] = useState<Tab>('peta');
  const [metric, setMetric] = useState<Metric>('quad');
  const [winsor, setWinsor] = useState(false);
  const [cut, setCut] = useState<'mean' | 'median'>('mean');
  const [selected, setSelected] = useState(64);
  const [features, setFeatures] = useState<Feat[]>([]);
  const [sort, setSort] = useState<'risk' | 'evi' | 'eri'>('risk');

  useEffect(() => {
    fetch('/prov.geojson').then((r) => r.json()).then((g) => setFeatures(g.features));
  }, []);

  const provs = useMemo(buildProvinces, []);
  const res = useMemo(() => computeIndices(provs, { winsor, cut }), [provs, winsor, cut]);
  const byKode = useMemo(() => new Map(res.rows.map((r) => [r.prov.kode, r])), [res]);
  const row = byKode.get(selected) ?? res.rows[0];

  const fill = (k: number) => {
    const r = byKode.get(k);
    if (!r) return 'var(--line)';
    if (metric === 'quad') return QUAD_COLOR(r.quadrant, dark);
    if (metric === 'evi') return seqBlue(r.evi, dark);
    if (metric === 'eri') return seqOrange(r.eri, dark);
    return diverging(r.risk / 0.6, dark);
  };

  const sorted = useMemo(
    () => [...res.rows].sort((a, b) => (sort === 'risk' ? b.risk - a.risk : sort === 'evi' ? b.evi - a.evi : a.eri - b.eri)),
    [res, sort],
  );
  const counts = QUADS.map((q) => ({ q, n: res.rows.filter((r) => r.quadrant === q).length }));

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>Indeks Risiko Ekonomi Provinsi</h1>
          <p className="sub">Risiko = kerentanan bawaan − ketahanan kebijakan, mengikuti kerangka Briguglio et al. (2008, 2016)</p>
        </div>
        <nav className="tabs" role="tablist" aria-label="Tampilan">
          {([['peta', 'Peta dan kuadran'], ['stress', 'Simulasi guncangan'], ['kamus', 'Kamus variabel']] as [Tab, string][]).map(([id, l]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>
          ))}
        </nav>
      </header>

      <div className="banner" role="note">
        <b>Prototipe.</b> Seluruh angka adalah data sintetis untuk memperlihatkan alur kerja, bukan data resmi. Peta memakai batas 34 provinsi sebelum pemekaran Papua 2022.
      </div>

      {tab === 'peta' && (
        <main className="grid">
          <section className="card map-card">
            <div className="card-head">
              <div className="seg" role="radiogroup" aria-label="Ukuran yang diwarnai pada peta">
                {METRICS.map((m) => (
                  <button key={m.id} role="radio" aria-checked={metric === m.id} className={metric === m.id ? 'on' : ''} onClick={() => setMetric(m.id)}>{m.label}</button>
                ))}
              </div>
              <div className="opts">
                <label><input type="checkbox" checked={winsor} onChange={(e) => setWinsor(e.target.checked)} /> Redam pencilan (persentil 5–95)</label>
                <label>Batas kuadran{' '}
                  <select value={cut} onChange={(e) => setCut(e.target.value as 'mean' | 'median')}>
                    <option value="mean">rata-rata</option>
                    <option value="median">median</option>
                  </select>
                </label>
              </div>
            </div>

            <MapView
              features={features}
              fill={fill}
              selected={selected}
              onSelect={setSelected}
              nameOf={(k) => byKode.get(k)?.prov.nama ?? ''}
              tip={(k) => {
                const r = byKode.get(k)!;
                return (<><b>{r.prov.nama}</b><div>EVI {f2(r.evi)} · ERI {f2(r.eri)}</div><div>Risiko {r.risk > 0 ? '+' : ''}{f2(r.risk)}</div><div>{QUADRANT_INFO[r.quadrant].nama}</div></>);
              }}
            />

            {metric === 'quad' && (
              <ul className="legend-quad">
                {counts.map(({ q, n }) => (
                  <li key={q}><i style={{ background: QUAD_COLOR(q, dark) }} /><b>{QUADRANT_INFO[q].nama}</b> <span className="muted">{QUADRANT_INFO[q].ringkas} · {n} provinsi</span></li>
                ))}
              </ul>
            )}
            {metric === 'risk' && (
              <div className="legend-seq"><span>Risiko lebih rendah dari rata-rata</span>
                <i style={{ background: `linear-gradient(90deg, ${diverging(-1, dark)}, ${diverging(0, dark)}, ${diverging(1, dark)})` }} />
                <span>Risiko tinggi</span></div>
            )}
            {metric === 'evi' && (
              <div className="legend-seq"><span>Kurang rentan</span>
                <i style={{ background: `linear-gradient(90deg, ${seqBlue(0, dark)}, ${seqBlue(0.5, dark)}, ${seqBlue(1, dark)})` }} />
                <span>Sangat rentan</span></div>
            )}
            {metric === 'eri' && (
              <div className="legend-seq"><span>Ketahanan rendah</span>
                <i style={{ background: `linear-gradient(90deg, ${seqOrange(0, dark)}, ${seqOrange(0.5, dark)}, ${seqOrange(1, dark)})` }} />
                <span>Ketahanan tinggi</span></div>
            )}
          </section>

          <section className="card detail-card" aria-live="polite">
            <DetailPanel row={row} dark={dark} />
          </section>

          <section className="card quad-card">
            <h2>Matriks kuadran</h2>
            <p className="note">Batas kuadran: {cut === 'mean' ? 'rata-rata' : 'median'} antarprovinsi (EVI {f2(res.cutEvi)}, ERI {f2(res.cutEri)}). Kerentanan bersifat struktural; yang bisa bergeser lewat kebijakan adalah ketahanan, yaitu gerak mendatar.</p>
            <QuadrantPlot
              dark={dark}
              cutEvi={res.cutEvi}
              cutEri={res.cutEri}
              selected={selected}
              onSelect={setSelected}
              pts={res.rows.map((r) => ({ kode: r.prov.kode, singkat: r.prov.singkat, evi: r.evi, eri: r.eri, quadrant: r.quadrant, risk: r.risk }))}
            />
          </section>

          <section className="card rank-card">
            <div className="card-head">
              <h2>Peringkat provinsi</h2>
              <label className="opts">Urutkan{' '}
                <select value={sort} onChange={(e) => setSort(e.target.value as 'risk' | 'evi' | 'eri')}>
                  <option value="risk">risiko tertinggi</option>
                  <option value="evi">kerentanan tertinggi</option>
                  <option value="eri">ketahanan terendah</option>
                </select>
              </label>
            </div>
            <div className="table-scroll tall">
              <table>
                <thead><tr><th className="num">#</th><th>Provinsi</th><th className="num">EVI</th><th className="num">ERI</th><th className="num">Risiko</th><th>Kuadran</th></tr></thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <tr key={r.prov.kode} className={r.prov.kode === selected ? 'sel' : ''} onClick={() => setSelected(r.prov.kode)}>
                      <td className="num">{i + 1}</td>
                      <td>{r.prov.nama}</td>
                      <td className="num">{f2(r.evi)}</td>
                      <td className="num">{f2(r.eri)}</td>
                      <td className="num">{r.risk > 0 ? '+' : ''}{f2(r.risk)}</td>
                      <td><QuadChip q={r.quadrant} dark={dark} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {tab === 'stress' && (
        <StressTest base={res} features={features} selected={selected} onSelect={setSelected} dark={dark} />
      )}
      {tab === 'kamus' && <Catalog />}

      <footer className="foot">
        Skala {f1(0, 0)}–1 per indikator (min–max antarprovinsi{winsor ? ', dipotong di persentil 5 dan 95' : ''}). Bobot sama kecuali dinyatakan lain di kamus variabel.
      </footer>
    </div>
  );
}
