import type { Result, Quadrant } from './indices';
import { quadrantOf } from './indices';

// Heuristik ILUSTRATIF untuk simulasi what-if. Koefisien belum dikalibrasi dan
// harus diganti dengan elastisitas hasil estimasi sebelum dipakai untuk keputusan.

export type Shock = {
  nikel: number; // perubahan harga nikel, %
  cpo: number; // perubahan harga CPO, %
  batubara: number; // perubahan harga batubara, %
  elnino: number; // intensitas El Niño, 0–100
  logistik: number; // gangguan logistik antar-pulau, 0–100
};

export const NO_SHOCK: Shock = { nikel: 0, cpo: 0, batubara: 0, elnino: 0, logistik: 0 };

export type StressRow = {
  kode: number;
  nama: string;
  singkat: string;
  hitPdrb: number; // dampak komoditas pada PDRB, poin persen
  hitFiskal: number; // dampak pada pendapatan APBD melalui DBH, %
  tekananPangan: number; // indeks tekanan harga pangan, 0–30
  eviBase: number;
  eriBase: number;
  eviAfter: number;
  eriAfter: number;
  riskBase: number;
  riskAfter: number;
  dRisk: number;
  qBase: Quadrant;
  qAfter: Quadrant;
};

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

export function runStress(base: Result, s: Shock): StressRow[] {
  return base.rows.map((r) => {
    const p = r.prov;
    const hitPdrb = (p.nikel * s.nikel + p.cpo * s.cpo + p.batubara * s.batubara) / 100;
    const share = p.nikel + p.cpo + p.batubara;
    const wPrice = share > 0 ? (p.nikel * s.nikel + p.cpo * s.cpo + p.batubara * s.batubara) / share : 0;
    const hitFiskal = (p.dbh / 100) * wPrice;
    const tekananPangan = (s.elnino / 100) * p.agri * 0.6 + (s.logistik / 100) * p.foodDep * 0.4;

    const dE = 0.25 * clamp(-hitPdrb / 20) + 0.25 * clamp(tekananPangan / 30);
    const dR = 0.15 * clamp(-hitFiskal / 15);
    const eviAfter = clamp(r.evi + dE);
    const eriAfter = clamp(r.eri - dR);
    return {
      kode: p.kode, nama: p.nama, singkat: p.singkat,
      hitPdrb, hitFiskal, tekananPangan,
      eviBase: r.evi, eriBase: r.eri, eviAfter, eriAfter,
      riskBase: r.risk, riskAfter: eviAfter - eriAfter, dRisk: eviAfter - eriAfter - r.risk,
      qBase: r.quadrant,
      qAfter: quadrantOf(eviAfter, eriAfter, base.cutEvi, base.cutEri),
    };
  });
}
