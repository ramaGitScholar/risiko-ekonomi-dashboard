'use client';
import Illustration from './Illustration';
import PageIntro from './PageIntro';
import { QUAD_COLOR } from '@/lib/colors';
import { QUADRANT_INFO, f2, type Quadrant, type Result } from '@/lib/indices';

const QUADS: Quadrant[] = ['worst', 'self-made', 'prodigal', 'best'];

// Definisi kuadran mengikuti Briguglio dkk. (2008, bagian 2) dan Briguglio (2016, bagian 4.1).
const QUAD_LONG: Record<Quadrant, string> = {
  worst: 'Kerentanan bawaan yang tinggi justru diperparah oleh kebijakan yang tidak mendukung ketahanan. Prioritas intervensi.',
  'self-made': 'Sangat terpapar guncangan, tetapi kebijakan yang tepat membuatnya mampu meredam atau bertahan. Contoh klasiknya Singapura.',
  prodigal: '“Lahir di keluarga baik, tetapi menghamburkan kekayaannya”: tidak terlalu terpapar, namun kebijakannya melemahkan ketahanan sehingga tetap rawan guncangan.',
  best: 'Tidak rentan secara bawaan dan sekaligus menjalankan kebijakan yang membangun ketahanan.',
};

const REFS: { key: string; cite: string; title: string; src: string; url: string; link: string; note: string }[] = [
  {
    key: '1',
    cite: 'Briguglio, L., Cordina, G., Farrugia, N., & Vella, S. (2008).',
    title: 'Economic Vulnerability and Resilience: Concepts and Measurements.',
    src: 'WIDER Research Paper No. 2008/55. Helsinki: UNU-WIDER. ISBN 978-92-9230-103-3.',
    url: 'https://hdl.handle.net/10419/45146',
    link: 'hdl.handle.net/10419/45146',
    note: 'Sumber konsep: definisi kerentanan sebagai paparan bawaan dan ketahanan sebagai kemampuan hasil kebijakan, empat skenario (best-case, worst-case, self-made, prodigal son), serta “paradoks Singapura”.',
  },
  {
    key: '2',
    cite: 'Briguglio, L. P. (2016).',
    title: 'Exposure to external shocks and economic resilience of countries: evidence from global indicators.',
    src: 'Journal of Economic Studies, 43(6), 1057–1078.',
    url: 'https://doi.org/10.1108/JES-12-2014-0203',
    link: 'doi.org/10.1108/JES-12-2014-0203',
    note: 'Sumber metode yang dipakai dasbor ini: empat komponen EVI berbobot sama, tiga pilar ERI (stabilitas makro, fleksibilitas pasar yang disesuaikan prudensi keuangan, tata kelola politik-sosial-lingkungan), normalisasi min–max, dan batas kuadran = rata-rata.',
  },
];

const SOURCES = [
  ['BPS', 'PDRB, ekspor-impor, inflasi, Sakernas, IPM, kemiskinan, Gini, IDI'],
  ['DJPK Kemenkeu', 'Pendapatan APBD, transfer ke daerah, DBH SDA'],
  ['Bank Indonesia / OJK', 'Kredit, NPL per provinsi'],
  ['BNPB (DIBI/IRBI)', 'Kerugian dan risiko bencana'],
  ['KPK, KLHK, KPPOD', 'Integritas, kualitas lingkungan, tata kelola ekonomi daerah'],
  ['Badan Pangan Nasional', 'Neraca pangan dan pasokan antarprovinsi'],
];

export default function Overview({ res, dark, onPick }: {
  res: Result; dark: boolean; onPick: (kode: number) => void;
}) {
  const n = res.rows.length;
  const avg = (f: (r: Result['rows'][number]) => number) => res.rows.reduce((s, r) => s + f(r), 0) / n;
  const counts = QUADS.map((q) => ({ q, n: res.rows.filter((r) => r.quadrant === q).length }));
  const byRisk = [...res.rows].sort((a, b) => b.risk - a.risk);
  const avgRisk = avg((r) => r.risk);

  return (
    <div className="page">
      <PageIntro
        kicker="Halaman 1 · Ringkasan"
        title="Ringkasan dan profil dasbor"
        lead={<>Gambaran umum risiko ekonomi 34 provinsi dalam satu layar: definisi yang dipakai, kartu skor, sebaran provinsi per kuadran, profil dasbor, serta rujukan metodologinya. Kerangka dan definisinya mengikuti Briguglio dkk. (2008) dan Briguglio (2016). Mulai dari sini sebelum masuk ke peta dan simulasi.</>}
        points={[
          { title: 'Apa yang diukur', body: 'Risiko suatu perekonomian dirugikan oleh guncangan eksternal, yaitu pertemuan antara seberapa terpapar strukturnya (kerentanan) dan seberapa mampu kebijakannya menghadapi guncangan (ketahanan).' },
          { title: 'Cara membaca skor', body: <>Risiko = EVI − ERI. Kerentanan <b>menambah</b> risiko, ketahanan <b>mengurangi</b> risiko. Nilai positif berarti paparan lebih besar dari kemampuan menghadapinya.</> },
          { title: 'Langkah berikutnya', body: 'Buka halaman Peta dan kuadran untuk melihat posisi tiap provinsi, lima provinsi dengan risiko tertinggi dan terendah, serta rincian per provinsi. Kartu skor risiko tertinggi dan terendah di bawah juga bisa diklik.' },
        ]}
      />

      <section className="hero card">
        <div className="hero-text">
          <span className="kicker">Definisi</span>
          <h2 className="hero-title">Apa itu risiko ekonomi?</h2>
          <p>
            Dalam dasbor ini, <b>risiko ekonomi</b> adalah risiko suatu perekonomian <b>dirugikan oleh guncangan eksternal</b>
            (<i>the risk of an economy being harmed by external shocks</i>), yaitu kejadian dari luar yang tidak bisa dikendalikan daerah, seperti
            anjloknya harga komoditas, lonjakan harga pangan dan energi, atau bencana alam.<sup>[2]</sup>
          </p>
          <p>
            Briguglio memecah risiko ini menjadi dua unsur yang saling berlawanan.<sup>[1][2]</sup>
          </p>
          <div className="formula" aria-label="Risiko sama dengan kerentanan dikurangi ketahanan">
            <div className="f-box evi"><b>Kerentanan <em>EVI</em></b><span>paparan, menambah risiko</span></div>
            <span className="f-op" aria-hidden>−</span>
            <div className="f-box eri"><b>Ketahanan <em>ERI</em></b><span>daya hadapi, mengurangi risiko</span></div>
            <span className="f-op" aria-hidden>=</span>
            <div className="f-box risk"><b>Risiko</b><span>dirugikan guncangan eksternal</span></div>
          </div>
          <ul className="defs">
            <li>
              <b>Kerentanan ekonomi (EVI)</b> adalah keterpaparan perekonomian terhadap guncangan dari luar yang bersumber dari <b>ciri bawaan</b>:
              keterbukaan perdagangan, konsentrasi ekspor, ketergantungan pada impor strategis (pangan dan bahan bakar), serta kerawanan bencana alam.
              Ciri ini permanen atau hampir permanen, sehingga daerah dengan skor tinggi <i>tidak bisa disalahkan</i> atas kerentanannya.<sup>[1][2]</sup>
            </li>
            <li>
              <b>Ketahanan ekonomi (ERI)</b> adalah kemampuan <b>hasil kebijakan</b> untuk bertahan atau pulih dari guncangan. Ada dua makna:
              <i> meredam guncangan</i> (<i>shock absorption</i>, misalnya tenaga kerja yang fleksibel dan mudah berpindah sektor) dan
              <i> melawan guncangan</i> (<i>shock counteraction</i>, misalnya posisi fiskal kuat sehingga ada ruang untuk menambah belanja atau memotong pajak).
              Ibarat flu: tubuh bisa kebal sehingga tidak tertular, atau tertular tetapi cepat sembuh.<sup>[1]</sup>
            </li>
          </ul>
          <p className="note">
            <b>Paradoks Singapura.</b> Kerangka ini lahir untuk menjelaskan mengapa negara yang sangat rentan seperti Singapura tetap makmur.
            Jawabannya: keberhasilan ekonomi bukan <i>karena</i> kerentanan rendah, melainkan <i>terlepas dari</i> kerentanan,
            berkat kebijakan yang membangun ketahanan.<sup>[1]</sup> Pesan yang sama berlaku bagi provinsi: kerentanan adalah kondisi, ketahanan adalah pilihan kebijakan.
          </p>
        </div>
        <figure className="hero-art">
          <Illustration />
          <figcaption>
            <span className="kicker">Cara membaca gambar</span>
            <ul className="legend-illu">
              <li><i className="li-shock" /><span><b>Gelombang merah</b> adalah guncangan eksternal: harga komoditas, iklim, dan logistik antarpulau.</span></li>
              <li><i className="li-land" /><span><b>Pulau dan kotanya</b> adalah perekonomian daerah. Makin terbuka dan terkonsentrasi strukturnya, makin besar <b>kerentanannya</b>.</span></li>
              <li><i className="li-shield" /><span><b>Perisai</b> adalah ketahanan hasil kebijakan, yang meredam atau melawan guncangan sebelum menjadi kerugian.</span></li>
            </ul>
          </figcaption>
        </figure>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Kartu skor umum</h2>
          <span className="muted small">Batas kuadran: {f2(res.cutEvi)} (EVI) dan {f2(res.cutEri)} (ERI)</span>
        </div>
        <div className="kpis">
          <div className="kpi"><span>Provinsi dianalisis</span><b>{n}</b><em>batas wilayah sebelum 2022</em></div>
          <div className="kpi"><span>Rata-rata kerentanan (EVI)</span><b>{f2(avg((r) => r.evi))}</b><em>skala 0–1, tinggi = rentan</em></div>
          <div className="kpi"><span>Rata-rata ketahanan (ERI)</span><b>{f2(avg((r) => r.eri))}</b><em>skala 0–1, tinggi = tahan</em></div>
          <div className="kpi"><span>Rata-rata risiko</span><b>{avgRisk > 0 ? '+' : ''}{f2(avgRisk)}</b><em>EVI − ERI</em></div>
          <button className="kpi warn kpi-link" onClick={() => onPick(byRisk[0].prov.kode)} title="Buka rincian di halaman Peta dan kuadran"><span>Risiko tertinggi</span><b className="kpi-name">{byRisk[0].prov.nama}</b><em>{byRisk[0].risk > 0 ? '+' : ''}{f2(byRisk[0].risk)} · lihat rincian →</em></button>
          <button className="kpi good kpi-link" onClick={() => onPick(byRisk[n - 1].prov.kode)} title="Buka rincian di halaman Peta dan kuadran"><span>Risiko terendah</span><b className="kpi-name">{byRisk[n - 1].prov.nama}</b><em>{f2(byRisk[n - 1].risk)} · lihat rincian →</em></button>
        </div>

        <h3>Sebaran provinsi per kuadran</h3>
        <div className="stack" role="img" aria-label={counts.map(({ q, n: c }) => `${QUADRANT_INFO[q].nama} ${c} provinsi`).join(', ')}>
          {counts.map(({ q, n: c }) => c > 0 && (
            <span key={q} style={{ flex: c, background: QUAD_COLOR(q, dark) }} className={q === 'worst' || q === 'prodigal' ? 'on-dark' : ''}>{c}</span>
          ))}
        </div>
        <div className="quad-cards">
          {counts.map(({ q, n: c }) => (
            <div key={q} className="quad-card-mini">
              <div className="qc-head"><i style={{ background: QUAD_COLOR(q, dark) }} /><b>{QUADRANT_INFO[q].nama}</b><span className="muted">{c} provinsi</span></div>
              <p className="muted small">{QUADRANT_INFO[q].ringkas}. {QUAD_LONG[q]}</p>
            </div>
          ))}
        </div>
        <p className="note">
          Empat skenario ini berasal dari Briguglio dkk.<sup>[1]</sup> Karena kerentanan bersifat bawaan, sebuah daerah praktis <b>tidak bergerak naik-turun</b> antarkuadran.
          Yang mungkin adalah <b>gerak mendatar</b> lewat kebijakan: dari Worst-case ke Self-made, atau dari Prodigal son ke Best-case.
          Batas kuadran adalah rata-rata antarprovinsi, sesuai praktik kedua makalah. Pilihan batas ini subjektif, jadi provinsi yang dekat garis batas sebaiknya dibaca sebagai kasus perbatasan
          (Briguglio dkk. memakai pita ±5%).<sup>[1][2]</sup>
        </p>
      </section>

      <div className="grid">
        <section className="card fit">
          <h2>Profil dasbor</h2>
          <dl className="profile fit-body">
            <div><dt>Tujuan</dt><dd>Memetakan provinsi mana yang paling terpapar guncangan ekonomi dan seberapa jauh kebijakan daerah mampu meredamnya, sebagai bahan prioritas kebijakan dan peringatan dini.</dd></div>
            <div><dt>Cakupan</dt><dd>34 provinsi (batas wilayah sebelum pemekaran Papua 2022).</dd></div>
            <div><dt>Kerangka</dt><dd>Kerangka kerentanan–ketahanan (<i>V&amp;R framework</i>) Briguglio dkk. (2008) dalam versi revisi Briguglio (2016), diturunkan dari tingkat negara ke tingkat provinsi.</dd></div>
            <div><dt>Metode</dt><dd>Indikator dinormalisasi min–max ke skala 0–1 antarprovinsi, rumus yang sama dengan kedua makalah. EVI = rata-rata empat komponen (masing-masing 25%). ERI = rata-rata tiga pilar (masing-masing 33,3%), dengan pembobotan internal mengikuti Briguglio (2016). Batas kuadran = rata-rata antarprovinsi (opsi median tersedia).</dd></div>
            <div><dt>Penyesuaian</dt><dd>Beberapa indikator global (WGI, Economic Freedom of the World, EPI) tidak tersedia per provinsi, sehingga diganti proksi nasional seperti SPI KPK, IDI, KPPOD, dan IKLH. Rinciannya ada di halaman Kamus variabel.</dd></div>
            <div><dt>Konteks</dt><dd>Pada pemeringkatan 183 negara di Briguglio (2016), Indonesia masuk kelompok <i>borderline</i> berkerentanan rendah dengan ketahanan di sekitar batas. Dasbor ini melihat ke dalam: provinsi mana yang menyimpang dari gambaran nasional tersebut.</dd></div>
            <div><dt>Isi</dt><dd>4 komponen kerentanan, 16 indikator ketahanan dalam 3 pilar, 6 indikator paparan untuk simulasi guncangan.</dd></div>
            <div><dt>Pengguna sasaran</dt><dd>Perencana pembangunan daerah, analis fiskal, peneliti kebijakan.</dd></div>
            <div><dt>Status</dt><dd><span className="pill">Prototipe</span> Seluruh angka adalah data sintetis untuk memperlihatkan alur kerja, bukan data resmi.</dd></div>
          </dl>
        </section>

        <section className="card">
          <h2>Rujukan</h2>
          <p className="note">Konsep, definisi, dan metode di dasbor ini merujuk pada dua dokumen berikut. Nomor dalam kurung siku di teks merujuk ke daftar ini.</p>
          <ol className="refs">
            {REFS.map((r) => (
              <li key={r.key}>
                {r.cite} <i>{r.title}</i> {r.src}{' '}
                <a href={r.url} target="_blank" rel="noopener noreferrer">{r.link}</a>
                <div className="muted small ref-note">{r.note}</div>
              </li>
            ))}
          </ol>
          <h3>Sumber data yang direncanakan</h3>
          <table className="plain">
            <tbody>
              {SOURCES.map(([s, d]) => (<tr key={s}><td><b>{s}</b></td><td className="muted">{d}</td></tr>))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
