'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { geoMercator, geoPath } from 'd3-geo';

export type Feat = { type: 'Feature'; properties: { kode: number }; geometry: unknown };
export type MapStatus = 'loading' | 'ready' | 'error';

// Memuat batas provinsi sekali; status dipakai agar peta tidak pernah tampil sebagai kotak kosong.
export function useProvFeatures() {
  const [features, setFeatures] = useState<Feat[]>([]);
  const [status, setStatus] = useState<MapStatus>('loading');
  const load = useCallback(() => {
    setStatus('loading');
    fetch('/prov.geojson')
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((g) => {
        const f = (g?.features ?? []) as Feat[];
        setFeatures(f);
        setStatus(f.length ? 'ready' : 'error');
      })
      .catch(() => setStatus('error'));
  }, []);
  useEffect(load, [load]);
  return { features, status, retry: load };
}

type Props = {
  features: Feat[];
  status?: MapStatus;
  onRetry?: () => void;
  fill: (kode: number) => string;
  selected: number;
  onSelect: (kode: number) => void;
  tip: (kode: number) => ReactNode;
  nameOf: (kode: number) => string;
};

const W = 900;
const H = 350;

export default function MapView({ features, status = 'ready', onRetry, fill, selected, onSelect, tip, nameOf }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ kode: number; x: number; y: number } | null>(null);

  const paths = useMemo(() => {
    if (!features.length) return [];
    const proj = geoMercator().fitExtent(
      [[4, 4], [W - 4, H - 4]],
      { type: 'FeatureCollection', features } as never,
    );
    const gp = geoPath(proj);
    return features.map((f) => ({ kode: f.properties.kode, d: gp(f as never) ?? '' }));
  }, [features]);

  const move = (e: React.MouseEvent, kode: number) => {
    const r = wrap.current!.getBoundingClientRect();
    setHover({ kode, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  if (!paths.length) {
    return (
      <div className="map-wrap map-empty" style={{ aspectRatio: `${W} / ${H}` }}>
        {status === 'error' ? (
          <div className="map-msg">
            <b>Batas provinsi gagal dimuat.</b>
            <span>Periksa koneksi atau pastikan berkas <code>public/prov.geojson</code> tersedia.</span>
            {onRetry && <button className="btn" onClick={onRetry}>Coba lagi</button>}
          </div>
        ) : (
          <div className="map-msg"><span className="spinner" aria-hidden />Memuat batas provinsi…</div>
        )}
      </div>
    );
  }

  const tipContent = hover ? tip(hover.kode) : null;

  return (
    <div className="map-wrap" ref={wrap} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Peta provinsi Indonesia">
        {paths.map((p) => (
          <path
            key={p.kode}
            d={p.d}
            fill={fill(p.kode)}
            className={'prov' + (p.kode === selected ? ' is-selected' : '')}
            tabIndex={0}
            role="button"
            aria-label={nameOf(p.kode)}
            aria-pressed={p.kode === selected}
            onClick={() => onSelect(p.kode)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(p.kode))}
            onMouseMove={(e) => move(e, p.kode)}
            onFocus={() => setHover(null)}
          />
        ))}
      </svg>
      {hover && tipContent && (
        <div
          className="tooltip"
          style={{ left: Math.max(4, Math.min(hover.x + 14, (wrap.current?.clientWidth ?? 600) - 220)), top: hover.y + 14 }}
        >
          {tipContent}
        </div>
      )}
    </div>
  );
}
