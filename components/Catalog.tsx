import PageIntro from './PageIntro';
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

// Pemetaan indikator asli Briguglio (2016) ke proksi tingkat provinsi.
const ADAPT: [string, string, string, string][] = [
  ['Keterbukaan (EVI)', '(Ekspor + impor) / 2, dibagi PDB', 'Idem, dari PDRB dan ekspor-impor BPS', 'Konsep sama. Perdagangan antarprovinsi idealnya ikut dihitung karena juga sumber paparan.'],
  ['Konsentrasi ekspor (EVI)', 'Porsi 3 kelompok ekspor barang dan jasa terbesar', 'Porsi 3 kelompok HS terbesar', 'Data ekspor jasa per provinsi belum tersedia.'],
  ['Impor strategis (EVI)', 'Impor pangan + bahan bakar, % total impor barang', 'Idem, ditambah neraca pangan Bapanas', 'Konsep sama.'],
  ['Kerawanan bencana (EVI)', 'Kerusakan ekonomi akibat bencana, % PDB', 'Kerugian bencana BNPB, % PDRB, rata-rata 10 tahun', 'Konsep sama.'],
  ['Stabilitas makro (ERI)', 'Utang publik/PDB, inflasi (deflator PDB), neraca transaksi berjalan; rata-rata 10 tahun', 'Inflasi IHK, volatilitas pertumbuhan PDRB, TPT, TPT usia muda, ketergantungan fiskal pada TKD', 'Provinsi tidak punya neraca transaksi berjalan dan utang publik yang berarti. TPT diambil dari versi 2008 (indeks “kesengsaraan” = inflasi + pengangguran). Ketergantungan TKD menggambarkan ruang fiskal untuk melawan guncangan (shock counteraction).'],
  ['Fleksibilitas pasar (ERI)', 'Regulasi pasar kerja dan regulasi bisnis (Economic Freedom of the World)', 'Indeks tata kelola ekonomi daerah (KPPOD), Kaitz index (UMP/upah median)', 'Indeks EFW hanya tingkat negara. Kaitz menangkap kekakuan upah minimum, salah satu unsur regulasi pasar kerja dalam EFW.'],
  ['Prudensi keuangan (ERI)', 'Kesehatan bank dan regulasi pasar modal (GCI), kedalaman keuangan (kredit swasta/PDB)', 'NPL kredit, kredit swasta/PDRB', 'NPL sebagai kebalikan kesehatan bank di tingkat daerah.'],
  ['Tata kelola politik (ERI)', 'Worldwide Governance Indicators (6 dimensi)', 'Survei Penilaian Integritas (KPK), Indeks Demokrasi Indonesia', 'Mewakili dimensi pengendalian korupsi serta suara dan akuntabilitas pada WGI.'],
  ['Tata kelola sosial (ERI)', 'Komponen pendidikan dan kesehatan IPM', 'Indeks pendidikan, umur harapan hidup, ditambah Gini dan kemiskinan', 'Gini dan kemiskinan disebut Briguglio dkk. (2008) sebagai indikator alternatif pembangunan sosial.'],
  ['Tata kelola lingkungan (ERI)', 'Environmental Performance Index (EPI)', 'Indeks Kualitas Lingkungan Hidup (KLHK)', 'Catatan: IKLH mengukur kondisi lingkungan, sedangkan Briguglio (2016) menekankan respons kebijakan. Perlu dicari proksi yang lebih dekat.'],
];

export default function Catalog() {
  const eviRows = EVI_IND.map((i) => ({ ...i, dir: 'high' as const }));
  return (
    <div className="page">
      <PageIntro
        kicker="Halaman 4 · Kamus variabel"
        title="Kamus variabel"
        lead={<>Daftar seluruh indikator yang membentuk indeks: apa yang diukur, satuannya, arah baik-buruknya, bobotnya dalam perhitungan, dan dari mana datanya diambil. Struktur indeks mengikuti Briguglio (2016); karena makalah itu dirancang untuk negara, tabel terakhir menjelaskan bagaimana tiap indikator diterjemahkan ke tingkat provinsi.</>}
        points={[
          { title: 'Kerentanan (EVI)', body: '4 komponen bawaan yang membuat ekonomi terpapar guncangan eksternal: keterbukaan, konsentrasi ekspor, ketergantungan impor strategis, kerawanan bencana. Nilai tinggi = lebih rentan.' },
          { title: 'Ketahanan (ERI)', body: '16 indikator dalam 3 pilar hasil kebijakan: stabilitas makro, fleksibilitas pasar yang disesuaikan prudensi keuangan, dan tata kelola. Skor dibalik bila perlu sehingga 1 selalu = paling tahan.' },
          { title: 'Indikator simulasi', body: '6 indikator paparan komoditas, fiskal, dan pangan yang hanya dipakai di halaman Simulasi guncangan, tidak masuk ke indeks inti.' },
        ]}
      />
    <div className="catalog">
      <section className="card">
        <h2>Kerentanan bawaan (EVI)</h2>
        <p className="note">Empat komponen berbobot sama (25%) dan dinormalisasi min–max antarprovinsi, persis seperti Briguglio (2016, gambar 1). Nilai tinggi berarti lebih rentan. Komponen ini dianggap permanen atau hampir permanen, sehingga tidak mencerminkan baik-buruknya kebijakan daerah.</p>
        <Table evi rows={eviRows} weightOf={() => '25%'} />
      </section>
      <section className="card">
        <h2>Ketahanan kebijakan (ERI)</h2>
        <p className="note">Tiga pilar berbobot sama (33,3%), mengikuti Briguglio (2016, gambar 3). Dalam pilar fleksibilitas pasar, regulasi pasar kerja dan bisnis berbobot 75% dan prudensi keuangan 25%, karena prudensi diperlakukan sebagai “penyesuaian” atas sisi buruk pasar bebas, yaitu risiko keuangan berlebih. Dalam pilar tata kelola, politik berbobot 2/3, sosial 1/6, lingkungan 1/6, karena tata kelola politik dianggap prasyarat bagi dua lainnya. Skor dibalik bila arah baik adalah “rendah”, sehingga 1 selalu berarti paling tahan.</p>
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
        <h2>Dari negara ke provinsi: penyesuaian indikator</h2>
        <p className="note">Briguglio (2016) menyusun indeks untuk 183 negara dengan indikator global. Sebagian tidak ada atau tidak bermakna di tingkat provinsi (misalnya transaksi berjalan dan utang publik), sehingga diganti proksi terdekat. Kolom “alasan” menjelaskan kaitan proksi dengan konsep aslinya.</p>
        <div className="table-scroll">
          <table className="plain">
            <thead><tr><th>Komponen</th><th>Indikator Briguglio (2016)</th><th>Proksi provinsi di dasbor</th><th>Alasan</th></tr></thead>
            <tbody>
              {ADAPT.map((a) => (<tr key={a[0]}><td><b>{a[0]}</b></td><td>{a[1]}</td><td>{a[2]}</td><td className="muted">{a[3]}</td></tr>))}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
