// DATA ILUSTRATIF (SINTETIS) — bukan data resmi.
// Struktur kolom mengikuti kamus variabel; ganti isi `buildProvinces()` dengan hasil
// tarikan API BPS / DJPK / BI saat data riil tersedia.

export type Prov = {
  kode: number; // kode BPS provinsi (sama dengan properti `kode` di GeoJSON)
  nama: string;
  singkat: string;
  // --- EVI (kerentanan bawaan) ---
  opn: number; // keterbukaan perdagangan, % PDRB
  exn: number; // konsentrasi ekspor: porsi 3 kelompok HS terbesar, %
  dsi: number; // ketergantungan impor strategis (pangan+energi), % total impor
  dpr: number; // kerugian bencana, % PDRB (rata-rata 10 tahun)
  // --- Eksposur tambahan untuk stress test (bukan bagian EVI inti) ---
  nikel: number; // porsi nikel dalam PDRB, %
  cpo: number; // porsi CPO/sawit dalam PDRB, %
  batubara: number; // porsi batubara dalam PDRB, %
  dbh: number; // porsi DBH SDA dalam pendapatan APBD, %
  agri: number; // porsi pertanian dalam PDRB, %
  foodDep: number; // porsi pangan yang didatangkan dari luar provinsi, %
  // --- ERI (ketahanan hasil kebijakan) ---
  infl: number; // rata-rata inflasi IHK, %
  volg: number; // volatilitas pertumbuhan PDRB, poin persen
  tpt: number; // tingkat pengangguran terbuka, %
  tptMuda: number; // TPT usia muda (15–24), %
  fisDep: number; // TKD (DAU/DBH) / total pendapatan APBD, %
  regBisnis: number; // indeks tata kelola ekonomi daerah, 0–100
  kaitz: number; // UMP / upah median (rasio)
  npl: number; // NPL kredit, %
  kredit: number; // kredit swasta / PDRB, %
  spi: number; // Survei Penilaian Integritas, 0–100
  idi: number; // Indeks Demokrasi Indonesia, 0–100
  edu: number; // indeks pendidikan (HLS+RLS), 0–1
  uhh: number; // umur harapan hidup, tahun
  gini: number; // rasio Gini
  miskin: number; // kemiskinan, %
  iklh: number; // Indeks Kualitas Lingkungan Hidup, 0–100
};

// kode, nama, singkat, opn, exn, dsi, dpr, nikel, cpo, batubara, dbh, agri, foodDep, g, s, f, m
// g=tata kelola, s=sosial, f=kapasitas fiskal, m=efisiensi pasar (0–1, hanya untuk membangkitkan data contoh)
const SEED: [number, string, string, number, number, number, number, number, number, number, number, number, number, number, number, number, number][] = [
  [11, 'Aceh', 'Aceh', 6, 70, 35, 1.8, 0, 6, 0.5, 14, 28, 35, 0.45, 0.45, 0.3, 0.4],
  [12, 'Sumatera Utara', 'Sumut', 22, 62, 40, 0.6, 0, 14, 0, 3, 22, 40, 0.55, 0.55, 0.55, 0.55],
  [13, 'Sumatera Barat', 'Sumbar', 9, 66, 30, 1.2, 0, 5, 2, 2, 22, 30, 0.55, 0.6, 0.5, 0.5],
  [14, 'Riau', 'Riau', 40, 85, 45, 0.5, 0, 18, 1, 10, 22, 45, 0.55, 0.55, 0.45, 0.55],
  [15, 'Jambi', 'Jambi', 28, 80, 38, 0.5, 0, 14, 6, 6, 28, 35, 0.55, 0.55, 0.45, 0.5],
  [16, 'Sumatera Selatan', 'Sumsel', 24, 78, 40, 0.8, 0, 8, 14, 7, 15, 30, 0.5, 0.5, 0.45, 0.5],
  [17, 'Bengkulu', 'Bengkulu', 8, 75, 35, 1.5, 0, 9, 4, 3, 30, 40, 0.45, 0.5, 0.35, 0.4],
  [18, 'Lampung', 'Lampung', 12, 55, 38, 0.7, 0, 6, 0, 2, 28, 30, 0.5, 0.5, 0.45, 0.5],
  [19, 'Kepulauan Bangka Belitung', 'Babel', 20, 88, 45, 0.4, 0, 3, 0, 4, 20, 50, 0.5, 0.55, 0.4, 0.45],
  [21, 'Kepulauan Riau', 'Kepri', 120, 60, 55, 0.2, 0, 0, 0, 2, 2, 60, 0.6, 0.6, 0.55, 0.65],
  [31, 'DKI Jakarta', 'DKI', 55, 40, 50, 0.1, 0, 0, 0, 1, 0.1, 85, 0.75, 0.8, 0.85, 0.7],
  [32, 'Jawa Barat', 'Jabar', 35, 30, 42, 0.9, 0, 1, 0, 1, 8, 40, 0.6, 0.6, 0.65, 0.65],
  [33, 'Jawa Tengah', 'Jateng', 22, 32, 40, 0.6, 0, 0, 0, 1, 15, 25, 0.65, 0.55, 0.55, 0.5],
  [34, 'DI Yogyakarta', 'DIY', 10, 35, 45, 1.0, 0, 0, 0, 1, 12, 45, 0.7, 0.75, 0.5, 0.55],
  [35, 'Jawa Timur', 'Jatim', 28, 35, 42, 0.5, 0, 0, 0, 1, 11, 15, 0.7, 0.6, 0.6, 0.6],
  [36, 'Banten', 'Banten', 45, 33, 45, 0.7, 0, 0, 0, 1, 5, 50, 0.6, 0.6, 0.6, 0.6],
  [51, 'Bali', 'Bali', 10, 55, 48, 0.6, 0, 0, 0, 1, 13, 55, 0.7, 0.7, 0.55, 0.6],
  [52, 'Nusa Tenggara Barat', 'NTB', 25, 80, 40, 2.0, 0, 0, 0, 4, 21, 15, 0.5, 0.4, 0.35, 0.45],
  [53, 'Nusa Tenggara Timur', 'NTT', 3, 70, 42, 2.2, 0, 0, 0, 1, 28, 40, 0.45, 0.3, 0.25, 0.35],
  [61, 'Kalimantan Barat', 'Kalbar', 24, 72, 38, 0.8, 0, 10, 0, 2, 22, 35, 0.5, 0.45, 0.4, 0.45],
  [62, 'Kalimantan Tengah', 'Kalteng', 32, 85, 40, 1.0, 0, 12, 8, 9, 24, 40, 0.5, 0.5, 0.4, 0.45],
  [63, 'Kalimantan Selatan', 'Kalsel', 45, 88, 38, 0.8, 0, 5, 22, 8, 12, 30, 0.55, 0.55, 0.55, 0.5],
  [64, 'Kalimantan Timur', 'Kaltim', 55, 90, 36, 0.3, 0, 4, 40, 15, 6, 45, 0.6, 0.65, 0.65, 0.55],
  [65, 'Kalimantan Utara', 'Kaltara', 38, 85, 40, 0.6, 0, 6, 25, 12, 14, 50, 0.5, 0.5, 0.4, 0.4],
  [71, 'Sulawesi Utara', 'Sulut', 12, 65, 40, 1.4, 0, 0, 0, 2, 18, 30, 0.6, 0.6, 0.5, 0.5],
  [72, 'Sulawesi Tengah', 'Sulteng', 60, 92, 38, 1.8, 35, 3, 0, 5, 22, 30, 0.45, 0.5, 0.45, 0.45],
  [73, 'Sulawesi Selatan', 'Sulsel', 15, 58, 38, 0.9, 4, 0, 0, 2, 22, 20, 0.6, 0.55, 0.55, 0.55],
  [74, 'Sulawesi Tenggara', 'Sultra', 35, 90, 40, 1.5, 28, 0, 0, 4, 24, 35, 0.5, 0.5, 0.45, 0.45],
  [75, 'Gorontalo', 'Gorontalo', 5, 70, 40, 1.2, 0, 0, 0, 1, 30, 35, 0.5, 0.45, 0.3, 0.4],
  [76, 'Sulawesi Barat', 'Sulbar', 10, 75, 40, 2.0, 0, 9, 0, 2, 38, 40, 0.4, 0.4, 0.3, 0.35],
  [81, 'Maluku', 'Maluku', 8, 78, 42, 1.8, 0, 0, 0, 2, 14, 50, 0.4, 0.4, 0.3, 0.35],
  [82, 'Maluku Utara', 'Malut', 90, 96, 40, 1.5, 45, 0, 0, 4, 16, 45, 0.45, 0.45, 0.4, 0.4],
  [91, 'Papua', 'Papua', 45, 90, 45, 1.2, 0, 0, 0, 20, 12, 60, 0.35, 0.2, 0.25, 0.3],
  [92, 'Papua Barat', 'Pabar', 35, 85, 45, 1.0, 0, 0, 0, 18, 10, 55, 0.4, 0.35, 0.3, 0.35],
];

function rng(seed: number) {
  let a = seed * 2654435761;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildProvinces(): Prov[] {
  return SEED.map(([kode, nama, singkat, opn, exn, dsi, dpr, nikel, cpo, batubara, dbh, agri, foodDep, g, s, f, m]) => {
    const r = rng(kode);
    const n = () => r() * 2 - 1; // −1..1
    const fm = 0.5 * f + 0.5 * m;
    const tpt = 8 - 5 * (0.5 * s + 0.5 * m) + n() * 0.6;
    return {
      kode, nama, singkat, opn, exn, dsi, dpr, nikel, cpo, batubara, dbh, agri, foodDep,
      infl: 2 + (1 - f) * 1.5 + n() * 0.4,
      volg: 0.8 + (opn / 100) * 1.5 + (1 - f) * 1 + n() * 0.3,
      tpt,
      tptMuda: tpt * 2.4 + n(),
      fisDep: 100 * (1 - f) * 0.85 + 8 + n() * 3,
      regBisnis: 35 + 50 * m + n() * 3,
      kaitz: 0.8 - 0.4 * m + n() * 0.04,
      npl: 4.8 - 3 * fm + n() * 0.3,
      kredit: 15 + 70 * fm + n() * 4,
      spi: 55 + 30 * g + n() * 2,
      idi: 60 + 30 * g + n() * 3,
      edu: 0.55 + 0.35 * s + n() * 0.02,
      uhh: 66 + 8 * s + n() * 0.5,
      gini: 0.4 - 0.05 * s + n() * 0.01,
      miskin: 22 - 18 * s + n() * 1.2,
      iklh: 55 + 35 * (0.5 * g + 0.5 * s) + n() * 3,
    };
  });
}

// Deret bulanan sintetis untuk panel peringatan dini (12 bulan terakhir).
export type Ews = { inflPangan: number[]; tptMuda: number[]; realisasi: number[] };
export function buildEws(p: Prov): Ews {
  const r = rng(p.kode + 1000);
  const walk = (start: number, step: number, lo: number, hi: number) => {
    const out: number[] = [];
    let v = start;
    for (let i = 0; i < 12; i++) {
      v = Math.min(hi, Math.max(lo, v + (r() * 2 - 1) * step));
      out.push(v);
    }
    return out;
  };
  return {
    inflPangan: walk(2.5 + (p.foodDep / 100) * 5, 0.9, -1, 12),
    tptMuda: walk(p.tptMuda, 0.5, 2, 30),
    realisasi: Array.from({ length: 12 }, (_, i) => Math.min(100, (i + 1) * (6.5 + r() * 3 - (1 - p.fisDep / 100) * 1))),
  };
}
