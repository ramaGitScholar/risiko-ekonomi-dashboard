'use client';
import { useMemo, useState } from 'react';
import MapView, { type Feat, type MapStatus } from './MapView';
import QuadrantPlot from './QuadrantPlot';
import { QuadChip } from './DetailPanel';
import PageIntro from './PageIntro';
import { diverging, seqOrange } from '@/lib/colors';
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

// Provinsi yang tidak terdampak tetap diberi warna netral (bukan oranye sangat pucat)
// dan ramp dimulai dari 0,18 agar dampak kecil pun terlihat.
const ZERO = 0.005;

export default function StressTest({ base, features, mapStatus, onRetry, selected, onSelect, dark }: {
  base: Result; features: Feat[]; mapStatus: MapStatus; onRetry: () => void; selected: number; onSelect: (k: number) => void; dark: boolean;
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
    <div className="page">
      <PageIntro
        kicker="Halaman 3 · Simulasi guncangan"
        title="Simulasi guncangan (stress test)"
        lead={<>Halaman ini menjawab pertanyaan <i>“bagaimana jika…?”</i>: bila terjadi guncangan tertentu, provinsi mana yang paling terpukul dan apakah posisinya bergeser ke kuadran yang lebih buruk. <b>Guncangan</b> di sini adalah <b>guncangan eksternal</b> (<i>exogenous shocks</i>) dalam pengertian Briguglio: kejadian dari luar yang tidak bisa dikendalikan pemerintah daerah. Indeks EVI dan ERI hanya mengukur paparan dan kemampuan menghadapi guncangan secara umum. Halaman ini adalah <b>perluasan</b> yang menerjemahkannya ke skenario konkret.</>}
        points={[
          { title: 'Guncangan harga komoditas', body: 'Turunnya harga nikel, CPO (sawit), atau batubara di pasar dunia. Memukul PDRB provinsi yang ekspornya terkonsentrasi pada komoditas tersebut (paparan konsentrasi ekspor), lalu menular ke APBD lewat Dana Bagi Hasil (DBH) SDA, sehingga ruang fiskal untuk melawan guncangan ikut menyempit.' },
          { title: 'Guncangan iklim (El Niño)', body: 'Kemarau panjang yang menurunkan produksi pertanian dan menaikkan harga pangan. Ini wujud kerawanan bencana alam, salah satu komponen kerentanan, dan paling terasa di provinsi yang bergantung pada pertanian.' },
          { title: 'Gangguan logistik antarpulau', body: 'Terhambatnya pengiriman barang antarpulau (cuaca buruk, gangguan pelabuhan). Menekan provinsi yang bergantung pada pasokan pangan dari luar, padanan provinsi dari “ketergantungan impor strategis”.' },
          { title: 'Cara membaca hasil', body: <>Peta menunjukkan besarnya <b>kenaikan risiko</b> tiap provinsi. Matriks memperlihatkan arah perpindahan dari posisi awal. Tabel merinci jalur dampaknya: PDRB, pendapatan APBD, dan tekanan pangan.</> },
        ]}
      />
    <div className="stress">
      <section className="card controls-card">
        <h2>Skenario guncangan</h2>
        <p className="note">Pilih skenario siap pakai, atau geser pengatur untuk menyusun guncangan sendiri. Angka negatif pada harga berarti harga turun.</p>
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
            status={mapStatus}
            onRetry={onRetry}
            fill={(k) => {
              const r = byKode.get(k);
              if (!r) return 'var(--map-nodata)';
              if (none) return diverging(r.riskBase / 0.6, dark);
              if (r.dRisk < ZERO) return 'var(--map-zero)';
              return seqOrange(0.18 + 0.82 * Math.min(1, r.dRisk / maxD), dark);
            }}
            tip={(k) => {
              const r = byKode.get(k);
              if (!r) return null;
              return none
                ? (<><b>{r.nama}</b><div>Risiko awal {r.riskBase > 0 ? '+' : ''}{f2(r.riskBase)}</div><div>{QUADRANT_INFO[r.qBase].nama}</div></>)
                : (<><b>{r.nama}</b><div>Δ risiko: {r.dRisk < ZERO ? 'tidak terdampak' : '+' + f2(r.dRisk)}</div><div>{QUADRANT_INFO[r.qBase].nama} → {QUADRANT_INFO[r.qAfter].nama}</div></>);
            }}
          />
          {none ? (
            <div className="legend-seq"><span>Belum ada guncangan, peta menampilkan risiko awal:</span>
              <span>rendah</span>
              <i style={{ background: `linear-gradient(90deg, ${diverging(-1, dark)}, ${diverging(0, dark)}, ${diverging(1, dark)})` }} />
              <span>tinggi</span></div>
          ) : (
            <div className="legend-seq">
              <span className="swatch" style={{ background: 'var(--map-zero)' }} /><span>Tidak terdampak</span>
              <i style={{ background: `linear-gradient(90deg, ${seqOrange(0.18, dark)}, ${seqOrange(0.6, dark)}, ${seqOrange(1, dark)})` }} />
              <span>Kenaikan risiko +{f2(maxD)}</span>
            </div>
          )}
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
    </div>
  );
}
