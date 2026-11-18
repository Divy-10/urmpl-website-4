import { useEffect, useRef, useState } from 'react';
import { markets, regions, marketsIn } from '@/data';
import { observeReveal } from '@/lib/motion';
import { cx } from './ui';

/**
 * "Hub radial" — Singapore at the centre, the published markets around it.
 * It is schematic. Bearings follow the real direction from Singapore and rings group distance
 * loosely, but it is not a map and is not to scale. Each region can be selected with the
 * buttons or the keyboard, and the same information is listed as text.
 */
const PLACE: Record<string, { b: number; r: number }> = {
  malaysia: { b: 332, r: 92 }, bangladesh: { b: 318, r: 178 }, india: { b: 300, r: 204 }, pakistan: { b: 292, r: 258 },
  china: { b: 8, r: 200 }, taiwan: { b: 30, r: 196 }, 'south-korea': { b: 18, r: 262 },
  'eastern-europe': { b: 314, r: 330 }, 'united-states': { b: 50, r: 342 }, canada: { b: 36, r: 356 }, mexico: { b: 66, r: 322 },
};
const C = 400;
const xy = (b: number, r: number) => { const a = ((b - 90) * Math.PI) / 180; return [C + Math.cos(a) * r, C + Math.sin(a) * r] as const; };

export function HubRadial() {
  const [sel, setSel] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => (ref.current ? observeReveal(ref.current, () => setIn(true)) : undefined), []);
  const hub = markets.find((m) => m.type === 'hub');
  const list = markets.filter((m) => m.type === 'market' && PLACE[m.slug]);
  return (
    <div className={cx('hub', inView && 'is-in')} ref={ref}>
      <div className="hub__chart">
        <svg viewBox="0 10 800 720" role="img" aria-label="Schematic of URMPL's markets radiating from Singapore. Not to scale; the same list follows as text.">
          {[100, 200, 300, 380].map((r) => <circle key={r} cx={C} cy={C} r={r} className="hub__ring" />)}
          {[0, 90, 180, 270].map((b) => { const [x, y] = xy(b, 392); return <text key={b} x={x} y={y} className="hub__compass" textAnchor="middle" dominantBaseline="middle">{['N', 'E', 'S', 'W'][b / 90]}</text>; })}
          {list.map((m, i) => {
            const p = PLACE[m.slug]; const [x, y] = xy(p.b, p.r);
            const mx = (C + x) / 2 + (y - C) * 0.12, my = (C + y) / 2 - (x - C) * 0.12;
            const on = !sel || sel === m.region;
            return (
              <g key={m.id} className={cx('hub__lane', on ? 'is-on' : 'is-dim')} style={{ ['--i' as string]: i }}>
                <path d={`M${C},${C} Q${mx},${my} ${x},${y}`} pathLength={1} className="hub__path" />
                <circle cx={x} cy={y} r={6} className="hub__dot" />
                <text x={x + (x >= C ? 12 : -12)} y={y + 4} textAnchor={x >= C ? 'start' : 'end'} className="hub__label">{m.name}</text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r={22} className="hub__core-ring" />
          <circle cx={C} cy={C} r={9} className="hub__core" />
          <text x={C} y={C + 44} textAnchor="middle" className="hub__hublabel">{hub?.name ?? 'Singapore'}</text>
        </svg>
        <p className="hub__note">Schematic, not to scale.</p>
      </div>
      <div className="hub__side">
        <div className="hub__tabs" role="group" aria-label="Highlight a region">
          <button type="button" className={cx('chip', !sel && 'is-on')} aria-pressed={!sel} onClick={() => setSel(null)}>All regions</button>
          {regions.map((r) => <button key={r.id} type="button" className={cx('chip', sel === r.id && 'is-on')} aria-pressed={sel === r.id} onClick={() => setSel(sel === r.id ? null : r.id)}>{r.name}</button>)}
        </div>
        <ul className="hub__regions">
          {regions.map((r) => {
            const ms = r.id === 'southeast-asia' ? markets.filter((m) => m.region === r.id) : marketsIn(r.id);
            return (
              <li key={r.id} className={cx('hub__region', sel && sel !== r.id && 'is-dim')}>
                <h3>{r.name}</h3>
                <p className="hub__markets">{ms.map((m) => m.name + (m.type === 'hub' ? ' (hub)' : '')).join(' · ')}</p>
                <p className="hub__desc">{r.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
