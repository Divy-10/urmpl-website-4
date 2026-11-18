import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Icon, Img, cx } from './ui';
import { useInView, useMediaQuery, useReducedMotion } from '@/lib/motion';

export interface OrbitItem { id: string; image: string; label: string; caption: string; href: string; cta: string; status?: string }

/**
 * Signature component, taken from the reference: tiles on the inside of a cylinder.
 * The centre tile is flat; its neighbours swing towards the viewer, so their outer edges
 * read taller. It advances on its own, pausing on hover or focus, while off-screen, and with
 * reduced motion. It can be driven by the arrows, the dots, the keyboard, a click on a side
 * tile or a swipe.
 */
export function OrbitCarousel({ items, interval = 4200, label }: { items: OrbitItem[]; interval?: number; label: string }) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(host, '-10% 0px');
  const reduced = useReducedMotion();
  const narrow = useMediaQuery('(max-width: 719px)');
  const mid = useMediaQuery('(max-width: 1079px)');
  const go = useCallback((i: number) => setActive(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || !inView || reduced) return;
    const t = window.setTimeout(() => go(active + 1), interval);
    return () => window.clearTimeout(t);
  }, [active, paused, inView, reduced, interval, go]);

  // swipe
  const drag = useRef<{ x: number; id: number } | null>(null);
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, id: e.pointerId }; };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x; drag.current = null;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  };

  // geometry — tile width and swing angle per breakpoint
  const tileW = narrow ? 240 : mid ? 300 : 340;
  const step = narrow ? 0.98 : 1.04;      // horizontal spacing as a fraction of tile width
  const swing = narrow ? 30 : 34;         // degrees per step away from centre
  const cur = items[active];

  return (
    <div
      className="orbit" ref={host} role="region" aria-roledescription="carousel" aria-label={label}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); } }}
    >
      <div className="orbit__stage" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (drag.current = null)} style={{ ['--tile-w' as string]: `${tileW}px` }}>
        {items.map((it, i) => {
          let off = i - active;
          if (off > n / 2) off -= n; if (off < -n / 2) off += n;
          const a = Math.abs(off);
          const x = Math.sign(off) * (a === 0 ? 0 : a === 1 ? step * tileW : (step + 0.66) * tileW);
          const rot = Math.sign(off) * (a === 0 ? 0 : a === 1 ? swing : swing + 14); // outer edges swing towards the viewer: the inside of a cylinder
          const z = -a * (narrow ? 40 : 70);
          const hidden = a > 2;
          return (
            <button
              key={it.id} type="button" className={cx('orbit__tile', a === 0 && 'is-active')}
              style={{ transform: `translate3d(${x}px,0,${z}px) rotateY(${rot}deg)`, opacity: hidden ? 0 : a === 2 ? 0.85 : 1, zIndex: 10 - a, pointerEvents: hidden ? 'none' : undefined }}
              onClick={() => (a === 0 ? undefined : go(i))} tabIndex={a === 0 ? -1 : hidden ? -1 : 0}
              aria-hidden={a !== 0 ? undefined : true}
              aria-label={a === 0 ? undefined : `Show ${it.label}`}
            >
              <Img name={it.image} sizes={`${tileW}px`} className="orbit__img" alt="" />
              <span className="orbit__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {it.status && <span className="orbit__status">{it.status}</span>}
              <span className="orbit__label" aria-hidden="true">{it.label}</span>
            </button>
          );
        })}
      </div>

      <div className="orbit__caption" aria-live={paused || reduced ? 'polite' : 'off'}>
        <p className="orbit__title"><span className="orbit__count">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>{cur.label}</p>
        <p className="orbit__text" key={cur.id}>{cur.caption}</p>
        <Link to={cur.href} className="pill pill--orange">{cur.cta}<Icon name="arrow-right" size={16} /></Link>
      </div>

      <div className="orbit__controls">
        <button type="button" className="circle-btn" onClick={() => go(active - 1)} aria-label="Previous vertical"><Icon name="arrow-left" /></button>
        <ol className="dots" aria-label="Choose a vertical">
          {items.map((it, i) => (
            <li key={it.id}><button type="button" className={cx('dots__b', i === active && 'is-on')} onClick={() => go(i)} aria-label={it.label} aria-current={i === active ? 'true' : undefined} /></li>
          ))}
        </ol>
        <button type="button" className="circle-btn circle-btn--orange" onClick={() => go(active + 1)} aria-label="Next vertical"><Icon name="arrow-right" /></button>
      </div>
    </div>
  );
}
