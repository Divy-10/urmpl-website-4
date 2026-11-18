import { createElement, Fragment, useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { Link } from 'react-router';
import { images } from '@/data';
import { observeReveal } from '@/lib/motion';

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

// ---------- icons (inline, original) ----------
type IconName = 'arrow' | 'arrow-left' | 'arrow-right' | 'search' | 'phone' | 'pin' | 'close' | 'menu' | 'check' | 'globe' | 'layers' | 'repeat' | 'compass' | 'shield' | 'doc' | 'linkedin' | 'info';
const PATHS: Record<IconName, ReactNode> = {
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  'arrow-left': <path d="M19 12H5M11 6l-6 6 6 6" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
  pin: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 8h16M4 16h16" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.6 2.7 2.6 14.3 0 17M12 3.5c-2.6 2.7-2.6 14.3 0 17" /></>,
  layers: <><path d="m12 4 8.5 4.5L12 13 3.5 8.5Z" /><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" /></>,
  repeat: <><path d="M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3" /></>,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5Z" /></>,
  shield: <path d="M12 3.5 19 6v5.5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6Z" />,
  doc: <><path d="M7 3.5h7l4 4v13H7Z" /><path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6" /></>,
  linkedin: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8.5 10.5v5M8.5 8v.01M12 15.5v-5M12 13a2.5 2.5 0 0 1 5 0v2.5" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.01" /></>,
};
export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={cx('icon', className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}

// ---------- images ----------
export function Img({ name, sizes = '100vw', className, priority, alt, style }: { name: string; sizes?: string; className?: string; priority?: boolean; alt?: string; style?: React.CSSProperties }) {
  const m = images[name];
  if (!m) return null;
  const srcSet = m.srcset.map(([w, u]) => `${u} ${w}w`).join(', ');
  const fallback = m.srcset[Math.min(1, m.srcset.length - 1)][1];
  return (
    <img
      className={className} style={style} src={fallback} srcSet={srcSet} sizes={sizes} width={m.width} height={m.height}
      alt={alt ?? m.alt} loading={priority ? 'eager' : 'lazy'} decoding={priority ? 'sync' : 'async'}
      {...(priority ? { fetchPriority: 'high' as const } : {})}
    />
  );
}

// ---------- typography ----------
/** Renders `*word*` from the content as an emphasised (lighter) span, as the reference does with its second headline line. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return <>{parts.map((p, i) => (p.startsWith('*') && p.endsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>))}</>;
}

export function Eyebrow({ children, tone = 'dark', className }: { children: ReactNode; tone?: 'dark' | 'light'; className?: string }) {
  return <p className={cx('eyebrow', tone === 'light' && 'eyebrow--light', className)}><span className="eyebrow__dot" aria-hidden="true" />{children}</p>;
}

// ---------- reveals ----------
type RevealProps<T extends ElementType> = { as?: T; variant?: 'up' | 'blur' | 'fade' | 'mask'; delay?: number; children?: ReactNode; className?: string } & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;
/** Scroll reveal. Content is fully visible without JS and with reduced motion (CSS handles both). */
export function Reveal<T extends ElementType = 'div'>({ as, variant = 'up', delay = 0, children, className, style, ...rest }: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => (ref.current ? observeReveal(ref.current, () => setIn(true)) : undefined), []);
  return createElement(as ?? 'div', {
    ref, className: cx('rv', `rv--${variant}`, inView && 'is-in', className),
    style: { ...(style as object), ['--d' as string]: `${delay}ms` }, ...rest,
  }, children);
}

/** Splits a sentence into words that rise in sequence — the reference's line-by-line statement reveal. */
export function WordRise({ text, as = 'h2', className, step = 28 }: { text: string; as?: ElementType; className?: string; step?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => (ref.current ? observeReveal(ref.current, () => setIn(true)) : undefined), []);
  const tokens = text.split(/(\*[^*]+\*)/g).flatMap((chunk) => {
    const em = chunk.startsWith('*') && chunk.endsWith('*');
    return (em ? chunk.slice(1, -1) : chunk).split(/\s+/).filter(Boolean).map((w) => ({ w, em }));
  }).reduce<Array<{ w: string; em: boolean }>>((acc, t) => {
    // glue punctuation that follows an emphasised word back onto it (“trade.” not “trade .”)
    if (/^[.,;:!?—]+$/.test(t.w) && acc.length) acc[acc.length - 1] = { ...acc[acc.length - 1], w: acc[acc.length - 1].w + t.w };
    else acc.push(t);
    return acc;
  }, []);
  return createElement(as, { ref, className: cx('wr', inView && 'is-in', className), 'aria-label': text.replace(/\*/g, '') },
    tokens.map(({ w, em }, i) => (
      <Fragment key={i}>
        <span className="wr__w" aria-hidden="true"><span className={cx('wr__i', em && 'wr__em')} style={{ ['--i' as string]: i, ['--step' as string]: `${step}ms` }}>{w}</span></span>{' '}
      </Fragment>
    )));
}

// ---------- CTAs ----------
/** The reference's signature button pair: a filled pill plus a detached circle with an arrow. */
export function CtaPair({ to, children, tone = 'orange', className }: { to: string; children: ReactNode; tone?: 'orange' | 'light' | 'ink'; className?: string }) {
  return (
    <Link to={to} className={cx('cta', `cta--${tone}`, className)}>
      <span className="cta__pill">{children}</span>
      <span className="cta__circle" aria-hidden="true"><Icon name="arrow" size={16} /></span>
    </Link>
  );
}
export function TextLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return <Link to={to} className={cx('tlink', className)}><span>{children}</span><Icon name="arrow-right" size={16} /></Link>;
}
export function Pill({ to, children, tone = 'orange', className, onClick, type }: { to?: string; children: ReactNode; tone?: 'orange' | 'ghost' | 'ink' | 'white'; className?: string; onClick?: () => void; type?: 'button' | 'submit' }) {
  const cls = cx('pill', `pill--${tone}`, className);
  return to ? <Link to={to} className={cls}>{children}</Link> : <button type={type ?? 'button'} className={cls} onClick={onClick}>{children}</button>;
}

/** Decorative dot-field texture for navy bands (not a map). */
export function DotField({ className, seed = 1 }: { className?: string; seed?: number }) {
  const dots: Array<[number, number, number]> = [];
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const blobs = [[60, 50, 46], [140, 90, 34], [90, 140, 30]];
  for (let y = 0; y < 220; y += 6) for (let x = 0; x < 220; x += 6) {
    const inside = blobs.some(([bx, by, br]) => Math.hypot(x - bx, y - by) < br * (0.75 + rnd() * 0.5));
    if (inside && rnd() > 0.18) dots.push([x, y, 0.9 + rnd() * 0.5]);
  }
  return (
    <svg className={cx('dotfield', className)} viewBox="0 0 220 220" aria-hidden="true" focusable="false">
      {dots.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
    </svg>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return <p className="demo-note"><Icon name="info" size={16} /><span>{children}</span></p>;
}
