// Ilustrasi konsep: guncangan eksternal (kiri) menghantam perekonomian kepulauan,
// kerentanan = seberapa terbuka pulau terhadap hantaman, ketahanan = perisai kebijakan.
export default function Illustration() {
  return (
    <svg viewBox="0 0 520 330" className="illu" role="img" aria-labelledby="illu-t illu-d">
      <title id="illu-t">Ilustrasi risiko ekonomi daerah</title>
      <desc id="illu-d">
        Tiga gelombang guncangan, yaitu harga komoditas, iklim, dan logistik, datang dari kiri menuju gugusan pulau.
        Pulau utama dilindungi perisai yang melambangkan ketahanan kebijakan.
      </desc>

      <rect x="0" y="0" width="520" height="330" rx="14" className="illu-sky" />
      <circle cx="446" cy="62" r="26" className="illu-sun" />

      {/* gelombang guncangan */}
      <g className="illu-shock">
        <path d="M18 96 q22 -16 44 0 t44 0 t44 0" />
        <path d="M18 146 q22 -16 44 0 t44 0 t44 0 t44 0" />
        <path d="M18 196 q22 -16 44 0 t44 0 t44 0" />
        <path d="M150 96 l14 0 m-6 -6 l6 6 l-6 6" />
        <path d="M194 146 l14 0 m-6 -6 l6 6 l-6 6" />
        <path d="M150 196 l14 0 m-6 -6 l6 6 l-6 6" />
      </g>
      <g className="illu-tag">
        <text x="20" y="80">Harga komoditas</text>
        <text x="20" y="130">Iklim / El Niño</text>
        <text x="20" y="180">Logistik antarpulau</text>
      </g>

      {/* laut */}
      <path d="M0 236 q32 -10 65 0 t65 0 t65 0 t65 0 t65 0 t65 0 t65 0 t65 0 V316 q0 14 -14 14 H14 q-14 0 -14 -14 z" className="illu-sea" />
      <path d="M40 270 q16 -6 32 0 M330 286 q16 -6 32 0 M200 304 q16 -6 32 0 M450 262 q16 -6 32 0" className="illu-ripple" />

      {/* pulau */}
      <path d="M214 240 q14 -40 60 -46 q50 -6 84 14 q30 18 34 32 z" className="illu-land" />
      <path d="M402 246 q10 -22 36 -24 q28 0 40 24 z" className="illu-land2" />
      <path d="M150 248 q8 -16 26 -16 q18 0 24 16 z" className="illu-land2" />

      {/* kota dan industri di pulau utama */}
      <g className="illu-build">
        <rect x="262" y="176" width="16" height="36" rx="1.5" />
        <rect x="282" y="160" width="18" height="52" rx="1.5" />
        <rect x="304" y="184" width="14" height="28" rx="1.5" />
        <rect x="324" y="190" width="22" height="22" rx="1.5" />
        <rect x="336" y="170" width="6" height="22" />
      </g>
      <g className="illu-win">
        <rect x="286" y="168" width="4" height="4" /><rect x="293" y="168" width="4" height="4" />
        <rect x="286" y="178" width="4" height="4" /><rect x="293" y="178" width="4" height="4" />
        <rect x="266" y="184" width="4" height="4" /><rect x="266" y="194" width="4" height="4" />
      </g>
      {/* pohon sawit */}
      <g className="illu-tree">
        <path d="M238 222 v-22" />
        <path d="M238 200 q-10 -2 -16 6 M238 200 q10 -2 16 6 M238 200 q-4 -10 -12 -12 M238 200 q4 -10 12 -12" />
        <path d="M440 226 v-16" />
        <path d="M440 210 q-8 -2 -12 4 M440 210 q8 -2 12 4 M440 210 q-3 -8 -9 -9 M440 210 q3 -8 9 -9" />
      </g>

      {/* kapal */}
      <g className="illu-ship">
        <path d="M84 254 h56 l-8 12 h-40 z" />
        <rect x="98" y="240" width="12" height="14" />
        <rect x="112" y="244" width="12" height="10" />
      </g>

      {/* perisai ketahanan */}
      <g transform="translate(236 70)">
        <path d="M0 0 C 18 -6 32 -10 44 -16 C 56 -10 70 -6 88 0 C 88 44 70 70 44 84 C 18 70 0 44 0 0 z" className="illu-shield" />
        <path d="M26 38 l12 12 l24 -26" className="illu-check" />
      </g>
      <g className="illu-tag">
        <text x="340" y="66">Ketahanan</text>
        <text x="340" y="82" className="illu-tag-sub">perisai kebijakan</text>
        <text x="372" y="146">Kerentanan</text>
        <text x="372" y="162" className="illu-tag-sub">struktur yang terpapar</text>
      </g>
    </svg>
  );
}
