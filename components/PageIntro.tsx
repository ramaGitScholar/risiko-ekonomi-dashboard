import type { ReactNode } from 'react';

export type IntroPoint = { title: string; body: ReactNode };

// Keterangan singkat di bagian atas setiap halaman: apa isi halaman ini dan cara membacanya.
export default function PageIntro({ kicker, title, lead, points }: { kicker: string; title: string; lead: ReactNode; points: IntroPoint[] }) {
  return (
    <section className="intro" aria-label={`Tentang halaman ${title}`}>
      <span className="kicker">{kicker}</span>
      <h1>{title}</h1>
      <p className="intro-lead">{lead}</p>
      <dl className="intro-points">
        {points.map((p) => (
          <div key={p.title}>
            <dt>{p.title}</dt>
            <dd>{p.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
