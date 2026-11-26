import { ERI_IND, EVI_IND, type Indicator } from '@/lib/indices';

const EXTRA = [
  { label: 'Porsi nikel dalam PDRB', unit: '% PDRB', source: 'BPS (PDRB lapangan usaha, ekspor per komoditas)', use: 'Stress test harga nikel' },
  { label: 'Porsi CPO/sawit dalam PDRB', unit: '% PDRB', source: 'BPS', use: 'Stress test harga CPO' },
  { label: 'Porsi batubara dalam PDRB', unit: '% PDRB', source: 'BPS', use: 'Stress test harga batubara' },
  { label: 'Porsi DBH SDA dalam pendapatan APBD', unit: '% pendapatan', source: 'DJPK Kemenkeu', use: 'Jalur penularan ke fiskal daerah' },
  { label: 'Porsi pertanian dalam PDRB', unit: '% PDRB', source: 'BPS', use: 'Stress test El Niño' },
  { label: 'Porsi pangan dari luar provinsi', unit: '%', source: 'Badan Pangan Nasional (Neraca Pangan)', use: 'Stress test logistik' },
];

function Table({ rows, weightOf, evi }: { rows: Indicator[]; weightOf: (i: Indicator) => string; evi?: boolean }) {
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>Indikator</th><th>Kelompok</th><th>Satuan</th><th>Arah</th><th className="num">Bobot</th><th>Sumber</th></tr></thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i.id}>
              <td>{i.label}{i.catatan && <div className="muted small">{i.catatan}</div>}</td>
              <td>{i.group}</td>
              <td>{i.unit}</td>
              <td>{evi ? 'Tinggi = lebih rentan' : i.dir === 'high' ? 'Tinggi lebih baik' : 'Rendah lebih baik'}</td>
              <td className="num">{weightOf(i)}</td>
              <td>{i.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Catalog() {
  const eviRows = EVI_IND.map((i) => ({ ...i, dir: 'high' as const }));
  return (
    <div className="catalog">
      <section className="card">
        <h2>Kerentanan bawaan (EVI)</h2>
        <p className="note">Empat komponen berbobot sama (25%), dinormalisasi min–max antarprovinsi. Nilai tinggi berarti lebih rentan.</p>
        <Table evi rows={eviRows} weightOf={() => '25%'} />
      </section>
      <section className="card">
        <h2>Ketahanan kebijakan (ERI)</h2>
        <p className="note">Tiga pilar berbobot sama (33,3%). Pasar kerja dan bisnis berbobot 75% dalam pilar fleksibilitas pasar, prudensi keuangan 25%. Tata kelola: politik 2/3, sosial 1/6, lingkungan 1/6. Skor dibalik bila arah baik adalah “rendah”, sehingga 1 selalu berarti paling tahan.</p>
        <Table
          rows={ERI_IND}
          weightOf={(i) => ({
            'Stabilitas makro': '1/5 × 33,3%',
            'Fleksibilitas pasar': '1/2 × 75% × 33,3%',
            'Prudensi keuangan': '1/2 × 25% × 33,3%',
            'Tata kelola politik': '1/2 × 2/3 × 33,3%',
            'Tata kelola sosial': '1/4 × 1/6 × 33,3%',
            'Tata kelola lingkungan': '1/6 × 33,3%',
          }[i.group] ?? '')}
        />
      </section>
      <section className="card">
        <h2>Indikator tambahan untuk simulasi (di luar indeks inti)</h2>
        <p className="note">Tidak masuk ke EVI/ERI agar indeks inti tetap sebanding dengan literatur Briguglio. Dipakai oleh simulator stress test.</p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Indikator</th><th>Satuan</th><th>Sumber</th><th>Dipakai untuk</th></tr></thead>
            <tbody>
              {EXTRA.map((e) => (<tr key={e.label}><td>{e.label}</td><td>{e.unit}</td><td>{e.source}</td><td>{e.use}</td></tr>))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
