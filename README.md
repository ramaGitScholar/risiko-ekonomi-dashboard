# Indeks Risiko Ekonomi Provinsi (prototipe)

Dasbor Next.js (App Router, TypeScript) untuk kerangka Briguglio et al.: Risiko = EVI − ERI.
**Seluruh data adalah sintetis** (`lib/data.ts`), bukan data resmi.

    npm install
    npm run dev      # http://localhost:3000

- `lib/data.ts`    data contoh 34 provinsi, kunci `kode` BPS (ganti dengan hasil API BPS/DJPK/BI)
- `lib/indices.ts` kamus indikator, normalisasi min–max, EVI, ERI, kuadran
- `lib/stress.ts`  simulator guncangan (koefisien heuristik, belum dikalibrasi)
- `public/prov.geojson` batas 34 provinsi (sebelum pemekaran Papua 2022); 38 provinsi butuh GeoJSON baru
