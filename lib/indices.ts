import type { Prov } from './data';

export type Quadrant = 'worst' | 'self-made' | 'prodigal' | 'best';

export const QUADRANT_INFO: Record<Quadrant, { nama: string; alias: string; ringkas: string }> = {
  worst: { nama: 'Worst-case', alias: 'Rentan', ringkas: 'Kerentanan tinggi, ketahanan rendah' },
  'self-made': { nama: 'Self-made', alias: 'Mandiri', ringkas: 'Kerentanan tinggi, ketahanan tinggi' },
  prodigal: { nama: 'Prodigal son', alias: 'Self-inflicted', ringkas: 'Kerentanan rendah, ketahanan rendah' },
  best: { nama: 'Best-case', alias: 'Terbaik', ringkas: 'Kerentanan rendah, ketahanan tinggi' },
};

export type IndId = Exclude<keyof Prov, 'kode' | 'nama' | 'singkat'>;

export type Indicator = {
  id: IndId;
  label: string;
  unit: string;
  dir: 'high' | 'low'; // EVI: high = lebih rentan. ERI: arah yang BAIK.
  group: string;
  source: string;
  catatan?: string;
};

export const EVI_IND: Indicator[] = [
  { id: 'opn', label: 'Keterbukaan perdagangan', unit: '% PDRB', dir: 'high', group: 'Keterbukaan', source: 'BPS', catatan: 'Briguglio (2016): (ekspor + impor) / 2, dibagi PDB. Untuk provinsi, tambahkan perdagangan antarwilayah bila tersedia.' },
  { id: 'exn', label: 'Konsentrasi ekspor', unit: '% ekspor', dir: 'high', group: 'Konsentrasi', source: 'BPS', catatan: 'Briguglio (2016): porsi tiga kelompok besar ekspor barang dan jasa terbesar dalam total ekspor. Pakai provinsi asal barang, bukan pelabuhan.' },
  { id: 'dsi', label: 'Ketergantungan impor strategis', unit: '% impor', dir: 'high', group: 'Impor strategis', source: 'BPS, Badan Pangan Nasional', catatan: 'Briguglio (2016): impor pangan + bahan bakar sebagai % total impor barang. Permintaannya tidak elastis, sehingga memperkuat paparan.' },
  { id: 'dpr', label: 'Kerugian bencana', unit: '% PDRB', dir: 'high', group: 'Bencana', source: 'BNPB (DIBI/IRBI)', catatan: 'Briguglio (2016): kerusakan ekonomi akibat bencana relatif terhadap PDB. Dirata-ratakan 10 tahun untuk meredam lonjakan.' },
];

export const ERI_IND: Indicator[] = [
  { id: 'infl', label: 'Inflasi IHK', unit: '%', dir: 'low', group: 'Stabilitas makro', source: 'BPS' },
  { id: 'volg', label: 'Volatilitas pertumbuhan PDRB', unit: 'pp', dir: 'low', group: 'Stabilitas makro', source: 'BPS' },
  { id: 'tpt', label: 'Pengangguran terbuka (TPT)', unit: '%', dir: 'low', group: 'Stabilitas makro', source: 'BPS Sakernas' },
  { id: 'tptMuda', label: 'TPT usia muda (15–24)', unit: '%', dir: 'low', group: 'Stabilitas makro', source: 'BPS Sakernas' },
  { id: 'fisDep', label: 'Ketergantungan fiskal (TKD)', unit: '% pendapatan', dir: 'low', group: 'Stabilitas makro', source: 'DJPK Kemenkeu' },
  { id: 'regBisnis', label: 'Tata kelola ekonomi daerah', unit: 'indeks 0–100', dir: 'high', group: 'Fleksibilitas pasar', source: 'KPPOD, BKPM' },
  { id: 'kaitz', label: 'Kaitz index (UMP / upah median)', unit: 'rasio', dir: 'low', group: 'Fleksibilitas pasar', source: 'BPS, Kemnaker' },
  { id: 'npl', label: 'NPL kredit', unit: '%', dir: 'low', group: 'Prudensi keuangan', source: 'BI / OJK' },
  { id: 'kredit', label: 'Kredit swasta / PDRB', unit: '%', dir: 'high', group: 'Prudensi keuangan', source: 'BI (KPPTR)' },
  { id: 'spi', label: 'Survei Penilaian Integritas', unit: 'indeks 0–100', dir: 'high', group: 'Tata kelola politik', source: 'KPK' },
  { id: 'idi', label: 'Indeks Demokrasi Indonesia', unit: 'indeks 0–100', dir: 'high', group: 'Tata kelola politik', source: 'BPS' },
  { id: 'edu', label: 'Indeks pendidikan', unit: '0–1', dir: 'high', group: 'Tata kelola sosial', source: 'BPS' },
  { id: 'uhh', label: 'Umur harapan hidup', unit: 'tahun', dir: 'high', group: 'Tata kelola sosial', source: 'BPS' },
  { id: 'gini', label: 'Rasio Gini', unit: '0–1', dir: 'low', group: 'Tata kelola sosial', source: 'BPS' },
  { id: 'miskin', label: 'Kemiskinan', unit: '%', dir: 'low', group: 'Tata kelola sosial', source: 'BPS' },
  { id: 'iklh', label: 'Indeks Kualitas Lingkungan Hidup', unit: 'indeks 0–100', dir: 'high', group: 'Tata kelola lingkungan', source: 'KLHK' },
];

export type Options = { winsor: boolean; cut: 'mean' | 'median' };

export type Scored = {
  prov: Prov;
  evi: number;
  eri: number;
  risk: number; // EVI − ERI, rentang −1..1
  quadrant: Quadrant;
  eviParts: { id: IndId; label: string; score: number; raw: number; unit: string }[];
  pillars: { makro: number; pasar: number; tata: number };
  subs: { label: string; score: number; weight: string }[]; // sub-komponen ERI untuk panel detail
  rankRisk: number;
};

export type Result = { rows: Scored[]; cutEvi: number; cutEri: number };

const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pct = (s: number[], q: number) => {
  const i = (s.length - 1) * q;
  const lo = Math.floor(i);
  return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (i - lo);
};

export function quadrantOf(evi: number, eri: number, cutEvi: number, cutEri: number): Quadrant {
  const highV = evi >= cutEvi;
  const highR = eri >= cutEri;
  return highV ? (highR ? 'self-made' : 'worst') : highR ? 'best' : 'prodigal';
}

export function computeIndices(provs: Prov[], opt: Options): Result {
  // Skor min–max (0–1) per indikator; untuk ERI dibalik sehingga 1 = paling tahan.
  const scorers = new Map<IndId, (v: number) => number>();
  for (const ind of [...EVI_IND, ...ERI_IND]) {
    const vals = provs.map((p) => p[ind.id] as number).sort((a, b) => a - b);
    const lo = opt.winsor ? pct(vals, 0.05) : vals[0];
    const hi = opt.winsor ? pct(vals, 0.95) : vals[vals.length - 1];
    scorers.set(ind.id, (v) => {
      const t = hi === lo ? 0 : (Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo);
      return t;
    });
  }
  const eriScore = (p: Prov, id: IndId) => {
    const ind = ERI_IND.find((i) => i.id === id)!;
    const t = scorers.get(id)!(p[id] as number);
    return ind.dir === 'low' ? 1 - t : t;
  };
  const avg = (p: Prov, ids: IndId[]) => mean(ids.map((id) => eriScore(p, id)));

  const rows: Scored[] = provs.map((p) => {
    const eviParts = EVI_IND.map((i) => ({ id: i.id, label: i.label, score: scorers.get(i.id)!(p[i.id] as number), raw: p[i.id] as number, unit: i.unit }));
    const evi = mean(eviParts.map((x) => x.score)); // bobot sama 25% per komponen

    const makro = avg(p, ['infl', 'volg', 'tpt', 'tptMuda', 'fisDep']);
    const mfx = avg(p, ['regBisnis', 'kaitz']);
    const fpr = avg(p, ['npl', 'kredit']);
    const pasar = 0.75 * mfx + 0.25 * fpr;
    const pol = avg(p, ['spi', 'idi']);
    const soc = avg(p, ['edu', 'uhh', 'gini', 'miskin']);
    const env = avg(p, ['iklh']);
    const tata = (2 / 3) * pol + (1 / 6) * soc + (1 / 6) * env;
    const eri = (makro + pasar + tata) / 3;

    return {
      prov: p, evi, eri, risk: evi - eri, quadrant: 'best', eviParts,
      pillars: { makro, pasar, tata },
      subs: [
        { label: 'Stabilitas makro', score: makro, weight: '33,3%' },
        { label: 'Fleksibilitas pasar (disesuaikan)', score: pasar, weight: '33,3%' },
        { label: '– Regulasi pasar kerja & bisnis', score: mfx, weight: '75% pilar' },
        { label: '– Prudensi keuangan', score: fpr, weight: '25% pilar' },
        { label: 'Tata kelola', score: tata, weight: '33,3%' },
        { label: '– Politik', score: pol, weight: '2/3 pilar' },
        { label: '– Sosial', score: soc, weight: '1/6 pilar' },
        { label: '– Lingkungan', score: env, weight: '1/6 pilar' },
      ],
      rankRisk: 0,
    };
  });

  const agg = opt.cut === 'mean' ? mean : median;
  const cutEvi = agg(rows.map((r) => r.evi));
  const cutEri = agg(rows.map((r) => r.eri));
  rows.forEach((r) => (r.quadrant = quadrantOf(r.evi, r.eri, cutEvi, cutEri)));
  [...rows].sort((a, b) => b.risk - a.risk).forEach((r, i) => (r.rankRisk = i + 1));
  return { rows, cutEvi, cutEri };
}

export const f1 = (x: number, d = 1) => x.toFixed(d).replace('.', ',');
export const f2 = (x: number) => f1(x, 2);
