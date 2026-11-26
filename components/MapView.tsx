'use client';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { geoMercator, geoPath } from 'd3-geo';

export type Feat = { type: 'Feature'; properties: { kode: number }; geometry: unknown };

type Props = {
  features: Feat[];
  fill: (kode: number) => string;
  selected: number;
  onSelect: (kode: number) => void;
  tip: (kode: number) => ReactNode;
  nameOf: (kode: number) => string;
};

const W = 900;
const H = 350;

export default function MapView({ features, fill, selected, onSelect, tip, nameOf }: Props) {
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

  return (
    <div className="map-wrap" ref={wrap} onMouseLeave={() => setHover(null)}>
      {!paths.length && <div className="map-loading">Memuat batas provinsi…</div>}
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
      {hover && (
        <div
          className="tooltip"
          style={{ left: Math.min(hover.x + 14, (wrap.current?.clientWidth ?? 600) - 220), top: hover.y + 14 }}
        >
          {tip(hover.kode)}
        </div>
      )}
    </div>
  );
}
