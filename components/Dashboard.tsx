'use client';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import MapView, { useProvFeatures } from './MapView';
import QuadrantPlot from './QuadrantPlot';
import DetailPanel, { QuadChip } from './DetailPanel';
import StressTest from './StressTest';
import Catalog from './Catalog';
import Overview from './Overview';
import PageIntro from './PageIntro';
import TopFive from './TopFive';
import { buildProvinces } from '@/lib/data';
import { QUAD_COLOR, diverging, seqBlue, seqOrange } from '@/lib/colors';
import { QUADRANT_INFO, computeIndices, f1, f2, type Quadrant } from '@/lib/indices';
import { useTheme } from '@/lib/useDark';

type Tab = 'ringkasan' | 'peta' | 'stress' | 'kamus';
type Metric = 'risk' | 'evi' | 'eri' | 'quad';

const METRICS: { id: Metric; label: string }[] = [
  { id: 'risk', label: 'Risiko' },
  { id: 'evi', label: 'Kerentanan (EVI)' },
  { id: 'eri', label: 'Ketahanan (ERI)' },
  { id: 'quad', label: 'Kuadran' },
];

const QUADS: Quadrant[] = ['worst', 'self-made', 'prodigal', 'best'];

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const NAV: { id: Tab; label: string; hint: string; icon: ReactNode }[] = [
  { id: 'ringkasan', label: 'Ringkasan', hint: 'Skor umum dan profil', icon: <Icon d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" /> },
  { id: 'peta', label: 'Peta dan kuadran', hint: 'Posisi tiap provinsi', icon: <Icon d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /> },
  { id: 'stress', label: 'Simulasi guncangan', hint: 'Bagaimana jika…?', icon: <Icon d="M13 2 4 14h7l-1 8 9-12h-7z" /> },
  { id: 'kamus', label: 'Kamus variabel', hint: 'Indikator dan sumber', icon: <Icon d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM4 17a3 3 0 0 1 3-3h11M8 8h6" /> },
];

export default function Dashboard() {
  const [dark, setDark] = useTheme();
  const [tab, setTab] = useState<Tab>('ringkasan');
  const [metric, setMetric] = useState<Metric>('quad');
  const [winsor, setWinsor] = useState(false);
  const [cut, setCut] = useState<'mean' | 'median'>('mean');
  const [selected, setSelected] = useState(64);
  const [sort, setSort] = useState<'risk' | 'evi' | 'eri'>('risk');
  const { features, status: mapStatus, retry } = useProvFeatures();

  // Tautan langsung per halaman lewat hash URL, mis. /#stress
  useEffect(() => {
    const h = window.location.hash.slice(1) as Tab;
    if (NAV.some((n) => n.id === h)) setTab(h);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    window.history.replaceState(null, '', tab === 'ringkasan' ? window.location.pathname : `#${tab}`);
  }, [tab]);

  const provs = useMemo(buildProvinces, []);
  const res = useMemo(() => computeIndices(provs, { winsor, cut }), [provs, winsor, cut]);
  const byKode = useMemo(() => new Map(res.rows.map((r) => [r.prov.kode, r])), [res]);
  const row = byKode.get(selected) ?? res.rows[0];

  const fill = (k: number) => {
    const r = byKode.get(k);
    if (!r) return 'var(--map-nodata)';
    if (metric === 'quad') return QUAD_COLOR(r.quadrant, dark);
    if (metric === 'evi') return seqBlue(0.08 + 0.92 * r.evi, dark);
    if (metric === 'eri') return seqOrange(0.08 + 0.92 * r.eri, dark);
    return diverging(r.risk / 0.6, dark);
  };

  const sorted = useMemo(
    () => [...res.rows].sort((a, b) => (sort === 'risk' ? b.risk - a.risk : sort === 'evi' ? b.evi - a.evi : a.eri - b.eri)),
    [res, sort],
  );
  const counts = QUADS.map((q) => ({ q, n: res.rows.filter((r) => r.quadrant === q).length }));
  const openProv = (k: number) => { setSelected(k); setTab('peta'); };

  return (
    <div className="shell">
      <aside className="side">
        <a className="brand" href="/" title="Kembali ke halaman Ringkasan" onClick={(e) => { e.preventDefault(); setTab('ringkasan'); }}>
          <span className="brand-mark" aria-hidden>
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z" fill="currentColor" /></svg>
          </span>
          <div>
            <b className="brand-name">VERA</b>
            <span>Vulnerability &amp; Economic Resilience Atlas</span>
          </div>
        </a>
        <nav className="side-nav" aria-label="Halaman">
          {NAV.map((n) => (
            <button key={n.id} aria-current={tab === n.id ? 'page' : undefined} className={tab === n.id ? 'on' : ''} onClick={() => setTab(n.id)}>
              {n.icon}
              <span><b>{n.label}</b><em>{n.hint}</em></span>
            </button>
          ))}
        </nav>
        <div className="theme-switch" role="group" aria-label="Tema tampilan">
          <button aria-pressed={!dark} className={!dark ? 'on' : ''} onClick={() => setDark(false)} title="Mode terang">
            <Icon d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" /><span>Terang</span>
          </button>
          <button aria-pressed={dark} className={dark ? 'on' : ''} onClick={() => setDark(true)} title="Mode gelap">
            <Icon d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /><span>Gelap</span>
          </button>
        </div>
        <div className="side-foot">
          <span className="pill">Prototipe</span>
          <p>Data sintetis, bukan data resmi. Batas 34 provinsi sebelum pemekaran Papua 2022.</p>
        </div>
      </aside>

      <div className="content">
        {tab === 'ringkasan' && (
          <Overview res={res} dark={dark} onPick={openProv} />
        )}

        {tab === 'peta' && (
          <div className="page">
            <PageIntro
              kicker="Halaman 2 · Peta dan kuadran"
              title="Peta dan kuadran risiko"
              lead={<>Halaman ini menunjukkan <b>posisi setiap provinsi</b> berdasarkan dua ukuran: seberapa terpapar struktur ekonominya terhadap guncangan eksternal (kerentanan, EVI) dan seberapa mampu kebijakannya meredam atau melawan guncangan (ketahanan, ERI). Mengikuti Briguglio, keduanya disandingkan untuk menilai risiko daerah dirugikan oleh guncangan.</>}
              points={[
                { title: 'Peta', body: 'Pilih ukuran yang diwarnai: risiko, kerentanan, ketahanan, atau kuadran. Arahkan kursor untuk melihat angka, klik untuk membuka rincian provinsi di panel kanan.' },
                { title: 'Matriks kuadran', body: 'Diagram V&R (vulnerability–resilience) dari Briguglio. Sumbu tegak = kerentanan, sumbu datar = ketahanan, garis putus-putus = rata-rata antarprovinsi. Karena kerentanan bersifat bawaan, kebijakan hanya bisa menggeser provinsi secara mendatar: dari Worst-case ke Self-made, atau dari Prodigal son ke Best-case.' },
                { title: 'Peringkat', body: 'Lima provinsi dengan risiko tertinggi dan terendah (kiri bawah), serta tabel lengkap 34 provinsi yang bisa diurutkan dan digulir (kanan).' },
              ]}
            />
            <main className="grid cols">
              <div className="col">
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
                  status={mapStatus}
                  onRetry={retry}
                  fill={fill}
                  selected={selected}
                  onSelect={setSelected}
                  nameOf={(k) => byKode.get(k)?.prov.nama ?? ''}
                  tip={(k) => {
                    const r = byKode.get(k);
                    if (!r) return null;
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
                    <i style={{ background: `linear-gradient(90deg, ${seqBlue(0.08, dark)}, ${seqBlue(0.5, dark)}, ${seqBlue(1, dark)})` }} />
                    <span>Sangat rentan</span></div>
                )}
                {metric === 'eri' && (
                  <div className="legend-seq"><span>Ketahanan rendah</span>
                    <i style={{ background: `linear-gradient(90deg, ${seqOrange(0.08, dark)}, ${seqOrange(0.5, dark)}, ${seqOrange(1, dark)})` }} />
                    <span>Ketahanan tinggi</span></div>
                )}
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

              <section className="card">
                <h2>Top 5 risiko tertinggi dan terendah</h2>
                <p className="note">Klik nama provinsi untuk menampilkan rinciannya di panel kanan.</p>
                <TopFive rows={res.rows} dark={dark} onPick={(k) => { setSelected(k); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </section>
              </div>
              <div className="col fill">
              <section className="card detail-card" aria-live="polite">
                <DetailPanel row={row} dark={dark} />
              </section>

              <section className="card rank-card fit">
                <div className="card-head">
                  <h2>Peringkat lengkap {res.rows.length} provinsi</h2>
                  <label className="opts">Urutkan{' '}
                    <select value={sort} onChange={(e) => setSort(e.target.value as 'risk' | 'evi' | 'eri')}>
                      <option value="risk">risiko tertinggi</option>
                      <option value="evi">kerentanan tertinggi</option>
                      <option value="eri">ketahanan terendah</option>
                    </select>
                  </label>
                </div>
                <p className="note">Gulir tabel untuk melihat semua provinsi; klik baris untuk menampilkan rinciannya di panel atas.</p>
                <div className="table-scroll fit-body">
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
              </div>
            </main>
          </div>
        )}

        {tab === 'stress' && (
          <StressTest base={res} features={features} mapStatus={mapStatus} onRetry={retry} selected={selected} onSelect={setSelected} dark={dark} />
        )}
        {tab === 'kamus' && <Catalog />}

        <footer className="foot">
          <p className="foot-note">
            Skala {f1(0, 0)}–1 per indikator (min–max antarprovinsi{winsor ? ', dipotong di persentil 5 dan 95' : ''}). Bobot sama kecuali dinyatakan lain di kamus variabel. Seluruh angka adalah data sintetis.
          </p>
          {/* TEMPLATE: ganti nama lembaga, tahun, dan tautan di bawah sebelum dipublikasikan. */}
          <div className="copyright">
            <span>© {new Date().getFullYear()} Klaster Riset Ketahanan & Keamanan &middot; Sekolah Kajian Stratejik dan Global (SKSG) Universitas Indonesia. All rights reserved.</span>
            <nav aria-label="Tautan kaki halaman">
              <a href="#">Tentang</a>
              <a href="#">Kontak</a>
              <a href="#">Kebijakan privasi</a>
              <a href="#">Syarat penggunaan</a>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
