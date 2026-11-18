import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { categories, company, fullAddress, industries, social } from '@/data';
import { CtaPair, Icon, cx } from './ui';
import { useReducedMotion } from '@/lib/motion';

export const NAV = [
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/industries', label: 'Industries' },
  { href: '/global-network', label: 'Network' },
  { href: '/how-we-work', label: 'How We Work' },
  { href: '/insights', label: 'Insights' },
  { href: '/contact', label: 'Contact' },
];

// ---------- wordmark marquee ----------
export function Marquee({ text = 'United Raw Material', className, speed = 38, tone = 'light', as = 'div' }: { text?: string; className?: string; speed?: number; tone?: 'light' | 'ink' | 'faint'; as?: 'div' | 'p' }) {
  const Tag = as;
  const unit = (
    <span className="marquee__unit">
      {text}<span className="marquee__dash" aria-hidden="true">—</span>URMPL<span className="marquee__dash" aria-hidden="true">—</span>
    </span>
  );
  return (
    <Tag className={cx('marquee', `marquee--${tone}`, className)} aria-hidden="true">
      <span className="marquee__track" style={{ ['--speed' as string]: `${speed}s` }}>
        {unit}{unit}{unit}{unit}
      </span>
    </Tag>
  );
}

// ---------- header ----------
function SegmentedNav() {
  const ref = useRef<HTMLUListElement>(null);
  const [ind, setInd] = useState<{ x: number; w: number; on: boolean }>({ x: 0, w: 0, on: false });
  const { pathname } = useLocation();
  const place = useCallback((el: HTMLElement | null) => {
    if (!el || !ref.current) { setInd((s) => ({ ...s, on: false })); return; }
    const host = ref.current.getBoundingClientRect(); const r = el.getBoundingClientRect();
    setInd({ x: r.left - host.left, w: r.width, on: true });
  }, []);
  const toActive = useCallback(() => place(ref.current?.querySelector<HTMLElement>('a.active') ?? null), [place]);
  useLayoutEffect(() => { toActive(); }, [pathname, toActive]);
  useEffect(() => {
    const on = () => toActive();
    window.addEventListener('resize', on);
    document.fonts?.ready.then(on);
    return () => window.removeEventListener('resize', on);
  }, [toActive]);
  return (
    <ul className="seg" ref={ref} onMouseLeave={toActive} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) toActive(); }}>
      <span className={cx('seg__ind', ind.on && 'is-on')} style={{ transform: `translateX(${ind.x}px)`, width: ind.w }} aria-hidden="true" />
      {NAV.map((n, i) => (
        <li key={n.href} style={{ ['--i' as string]: i }}>
          <NavLink to={n.href} className={({ isActive }) => cx('seg__a', isActive && 'active')} onMouseEnter={(e) => place(e.currentTarget)} onFocus={(e) => place(e.currentTarget)}>{n.label}</NavLink>
        </li>
      ))}
    </ul>
  );
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={cx('hdr', scrolled && 'hdr--scrolled')}>
      <div className="hdr__left">
        <nav className="capsule" aria-label="Primary">
          <Link to="/" className="capsule__brand" aria-label="URMPL — home">
            <span className="brandmark" aria-hidden="true"><span className="brandmark__dot" /></span>
            <span className="capsule__name">URMPL</span>
          </Link>
          <SegmentedNav />
          <button type="button" className="capsule__menu" onClick={onMenu} aria-haspopup="dialog">
            <Icon name="menu" size={18} /><span>Menu</span>
          </button>
        </nav>
      </div>
      <div className="hdr__right">
        <CtaPair to="/request-quote" className="hdr__cta">Request a Quote</CtaPair>
      </div>
    </header>
  );
}

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add('no-scroll');
    const first = ref.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>('a, button'));
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.classList.remove('no-scroll'); prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="mmenu" role="dialog" aria-modal="true" aria-label="Site menu" ref={ref}>
      <div className="mmenu__top">
        <Link to="/" className="capsule__brand" onClick={onClose}><span className="brandmark" aria-hidden="true"><span className="brandmark__dot" /></span><span className="capsule__name">URMPL</span></Link>
        <button type="button" className="circle-btn circle-btn--light" onClick={onClose} aria-label="Close menu"><Icon name="close" /></button>
      </div>
      <ul className="mmenu__list">
        <li style={{ ['--i' as string]: 0 }}><Link to="/" onClick={onClose}><span className="mmenu__n">00</span>Home</Link></li>
        {NAV.map((n, i) => <li key={n.href} style={{ ['--i' as string]: i + 1 }}><Link to={n.href} onClick={onClose}><span className="mmenu__n">{String(i + 1).padStart(2, '0')}</span>{n.label}</Link></li>)}
      </ul>
      <div className="mmenu__foot">
        <CtaPair to="/request-quote">Request a Quote</CtaPair>
        <a href={company.phoneHref} className="mmenu__phone"><Icon name="phone" size={16} />{company.phone}</a>
      </div>
      <Marquee className="mmenu__marquee" tone="faint" speed={30} />
    </div>
  );
}

export function DemoBanner() {
  return (
    <div className="demobar" role="note">
      <span className="demobar__dot" aria-hidden="true" />
      <span><strong>Concept 04 · demo.</strong> Not the live URMPL website. Forms are in demo mode and send nothing.</span>
    </div>
  );
}

// ---------- footer ----------
export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const year = new Date().getFullYear();
  return (
    <footer className="ftr">
      <div className="ftr__grid wrap">
        <div className="ftr__brand">
          <p className="ftr__name">United Raw Material</p>
          <p className="ftr__text">A Singapore trading and indenting house connecting established producers with industrial buyers — textile fibres and yarns, petrochemicals and polymers, chemicals and packaging materials.</p>
          <address className="ftr__addr">
            <span><Icon name="pin" size={16} />{fullAddress}</span>
            <a href={company.phoneHref}><Icon name="phone" size={16} />{company.phone}</a>
          </address>
        </div>
        <nav className="ftr__col" aria-label="Company">
          <p className="ftr__h">Company</p>
          <ul>
            <li><Link to="/about">About URMPL</Link></li>
            <li><Link to="/how-we-work">How We Work</Link></li>
            <li><Link to="/global-network">Global Network</Link></li>
            <li><Link to="/insights">Insights</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
        <nav className="ftr__col" aria-label="Products">
          <p className="ftr__h"><Link to="/products">Products</Link></p>
          <ul>{categories.map((c) => <li key={c.id}><Link to={`/products/${c.slug}`}>{c.name}</Link></li>)}</ul>
        </nav>
        <nav className="ftr__col" aria-label="Industries">
          <p className="ftr__h"><Link to="/industries">Industries</Link></p>
          <ul>{industries.filter((i) => i.featured).slice(0, 6).map((i) => <li key={i.id}><Link to={`/industries/${i.slug}`}>{i.name}</Link></li>)}</ul>
        </nav>
        <div className="ftr__col ftr__act">
          <p className="ftr__h">Start a trade</p>
          <p className="ftr__small">Product, grade, quantity and destination — our Singapore desk takes it from there.</p>
          <CtaPair to="/request-quote">Request a Quote</CtaPair>
          {social.map((s) => <a key={s.url} className="ftr__social" href={s.url} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" size={16} />{s.label}</a>)}
        </div>
      </div>
      <div className="ftr__legal wrap">
        <p>© {year} {company.legalName} · UEN {company.uen} · Concept demo — not the live website.</p>
        <ul>
          <li><Link to="/privacy">Privacy Policy</Link></li>
          <li><Link to="/terms">Terms of Use</Link></li>
          <li><Link to="/cookies">Cookie Policy</Link></li>
        </ul>
      </div>
      <div className={cx('ftr__mark', inView && 'is-in')} ref={ref} aria-hidden="true"><span>URMPL</span></div>
    </footer>
  );
}

// ---------- layout ----------
export function Layout() {
  const [menu, setMenu] = useState(false);
  const { pathname, hash } = useLocation();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); return; }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash, reduced]);
  useEffect(() => setMenu(false), [pathname]);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <DemoBanner />
      <Header onMenu={() => setMenu(true)} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <main id="main" tabIndex={-1} key={pathname} className="page-enter">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

/** Sets <title> and the meta description for a page (all pages remain noindex). */
export function useMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} · URMPL Concept 04 (demo)`;
    const m = document.querySelector('meta[name="description"]');
    if (m && description) m.setAttribute('content', description);
  }, [title, description]);
}

export function Wrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('wrap', className)}>{children}</div>;
}
