# Indeks Risiko Ekonomi Provinsi (prototipe)

Rujukan utama:

1. Briguglio, L., Cordina, G., Farrugia, N., & Vella, S. (2008). *Economic Vulnerability and Resilience: Concepts and Measurements*. WIDER Research Paper 2008/55. https://hdl.handle.net/10419/45146
2. Briguglio, L. P. (2016). Exposure to external shocks and economic resilience of countries: evidence from global indicators. *Journal of Economic Studies*, 43(6), 1057–1078. https://doi.org/10.1108/JES-12-2014-0203

Dasbor Next.js (App Router, TypeScript) untuk kerangka Briguglio et al.: Risiko = EVI − ERI.
**Seluruh data adalah sintetis** (`lib/data.ts`), bukan data resmi.

    npm install
    npm run dev      # http://localhost:3000

- `lib/data.ts`    data contoh 34 provinsi, kunci `kode` BPS (ganti dengan hasil API BPS/DJPK/BI)
- `lib/indices.ts` kamus indikator, normalisasi min–max, EVI, ERI, kuadran
- `lib/stress.ts`  simulator guncangan (koefisien heuristik, belum dikalibrasi)
- `public/prov.geojson` batas 34 provinsi (sebelum pemekaran Papua 2022); 38 provinsi butuh GeoJSON baru
