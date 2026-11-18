import { useEffect, useState, type RefObject } from 'react';

/** True when the visitor asked the OS for reduced motion. Updates live. */
export function useReducedMotion(): boolean {
  const q = '(prefers-reduced-motion: reduce)';
  const [reduced, set] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => set(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function useMediaQuery(q: string): boolean {
  const [match, set] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => set(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return match;
}

// ---------- one shared IntersectionObserver for every reveal ----------
type RevealCb = () => void;
let revealIO: IntersectionObserver | null = null;
const revealCbs = new WeakMap<Element, RevealCb>();
function getRevealIO() {
  if (!revealIO) {
    revealIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          revealCbs.get(e.target)?.();
          revealIO!.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
  }
  return revealIO;
}
/** Adds `is-in` once the element scrolls into view (once). */
export function observeReveal(el: Element, cb: RevealCb) {
  if (typeof IntersectionObserver === 'undefined') { cb(); return () => {}; }
  revealCbs.set(el, cb);
  getRevealIO().observe(el);
  return () => getRevealIO().unobserve(el);
}

/** Live in-view state (not one-shot) — used to pause autoplay and parallax off-screen. */
export function useInView(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
  const [inView, set] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

// ---------- one rAF-throttled scroll loop for every parallax layer ----------
type Layer = { el: HTMLElement; strength: number; active: boolean };
const layers = new Set<Layer>();
let ticking = false;
function frame() {
  ticking = false;
  const vh = window.innerHeight;
  for (const l of layers) {
    if (!l.active) continue;
    const r = l.el.parentElement!.getBoundingClientRect();
    const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1 … 1 across the viewport
    l.el.style.transform = `translate3d(0, ${(p * l.strength).toFixed(1)}px, 0) scale(1.12)`;
  }
}
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

/** Moves `ref` vertically by up to ±strength px as its parent crosses the viewport. */
export function useParallax(ref: RefObject<HTMLElement | null>, strength = 60) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const layer: Layer = { el, strength, active: false };
    const io = new IntersectionObserver(([e]) => { layer.active = e.isIntersecting; if (layer.active) onScroll(); });
    io.observe(el.parentElement!);
    if (layers.size === 0) { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); }
    layers.add(layer);
    return () => {
      io.disconnect(); layers.delete(layer); el.style.transform = '';
      if (layers.size === 0) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
    };
  }, [ref, strength, reduced]);
}
