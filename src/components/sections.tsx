import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { getCategory, productHref, productMark, products, searchProducts, type Product, type Step } from '@/data';
import { observeReveal, useParallax, useReducedMotion } from '@/lib/motion';
import { CtaPair, DotField, Eyebrow, Icon, Img, Reveal, Rich, WordRise, cx } from './ui';
import { Marquee } from './layout';

// ---------- statement block: eyebrow left, statement right ----------
export function Statement({ eyebrow, title, children, tone = 'light', id, as = 'h2' }: { eyebrow: string; title: string; children?: ReactNode; tone?: 'light' | 'ink' | 'mist'; id?: string; as?: 'h1' | 'h2' }) {
  return (
    <section className={cx('stmt', `tone-${tone}`)} id={id} aria-label={eyebrow}>
      <div className="wrap stmt__grid">
        <Reveal className="stmt__eye"><Eyebrow tone={tone === 'ink' ? 'light' : 'dark'}>{eyebrow}</Eyebrow></Reveal>
        <div className="stmt__main">
          <WordRise text={title} as={as} className="stmt__title" />
          {children}
        </div>
      </div>
    </section>
  );
}

export function FeatureRow({ items, tone = 'light' }: { items: Array<{ id: string; icon: Parameters<typeof Icon>[0]['name']; title: string; text: string; meta?: string }>; tone?: 'light' | 'ink' }) {
  return (
    <ul className={cx('feat', tone === 'ink' && 'feat--ink')}>
      {items.map((f, i) => (
        <Reveal as="li" key={f.id} delay={120 + i * 90} className="feat__item">
          <span className="feat__icon"><Icon name={f.icon} size={18} /></span>
          <h3 className="feat__title">{f.title}</h3>
          <p className="feat__text">{f.text}</p>
          {f.meta && <p className="feat__meta">{f.meta}</p>}
        </Reveal>
      ))}
    </ul>
  );
}

// ---------- process branch: rule draws across, drops descend to staggered nodes ----------
export function ProcessBranch({ steps, title, lead, eyebrow, cta }: { steps: Step[]; title: string; lead?: string; eyebrow: string; cta?: { href: string; label: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => (ref.current ? observeReveal(ref.current, () => setIn(true)) : undefined), []);
  const depths = [0, 1, 0.35, 1, 0.1]; // staggered node heights, as in the reference
  return (
    <section className="branch tone-ink" aria-labelledby="branch-h">
      <DotField className="branch__dots branch__dots--l" seed={3} />
      <DotField className="branch__dots branch__dots--r" seed={7} />
      <div className="wrap">
        <header className="branch__head">
          <Reveal><Eyebrow tone="light">{eyebrow}</Eyebrow></Reveal>
          <WordRise text={title} as="h2" className="branch__title" />
          <span id="branch-h" className="sr-only">{title.replace(/\*/g, '')}</span>
          {lead && <Reveal as="p" className="branch__lead" delay={200}>{lead}</Reveal>}
        </header>
        <div className={cx('branch__tree', inView && 'is-in')} ref={ref} style={{ ['--n' as string]: steps.length }}>
          <span className="branch__rule" aria-hidden="true" />
          <ol className="branch__list">
            {steps.map((s, i) => (
              <li key={s.id} className="branch__node" style={{ ['--i' as string]: i, ['--depth' as string]: depths[i % depths.length] }}>
                <span className="branch__drop" aria-hidden="true" />
                <span className="branch__num" aria-hidden="true">{s.step}</span>
                <div className="branch__body">
                  <h3 className="branch__name"><span className="sr-only">Stage {s.step}: </span>{s.title}</h3>
                  <p className="branch__text">{s.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {cta && <div className="branch__cta"><CtaPair to={cta.href} tone="light">{cta.label}</CtaPair></div>}
      </div>
    </section>
  );
}

// ---------- finder: glass card over a full-bleed render (replaces the reference's tracking box) ----------
export function Finder({ image = 'ship-broadside', title = 'Find a material', lead }: { image?: string; title?: string; lead?: string }) {
  const bg = useRef<HTMLDivElement>(null);
  useParallax(bg, 50);
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(-1);
  const results = useMemo(() => searchProducts(q).slice(0, 6), [q]);
  const nav = useNavigate();
  const listId = 'finder-results';
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const hit = focus >= 0 ? results[focus] : results.length === 1 ? results[0] : undefined;
    nav(hit ? productHref(hit) : `/products?q=${encodeURIComponent(q.trim())}#catalogue`);
  };
  return (
    <section className="finder" aria-labelledby="finder-h">
      <div className="finder__bg" ref={bg}><Img name={image} sizes="100vw" alt="" /></div>
      <div className="finder__shade" aria-hidden="true" />
      <Reveal variant="blur" className="finder__card">
        <h2 id="finder-h" className="finder__title">{title}</h2>
        <p className="finder__lead">{lead ?? `Search the ${products.length} products we publish — by name, trade code or common alias.`}</p>
        <form className="finder__form" role="search" onSubmit={submit}>
          <label htmlFor="finder-q" className="sr-only">Product name, code or alias</label>
          <input
            id="finder-q" className="finder__input" type="search" autoComplete="off" placeholder="Try “PTA”, “viscose” or “glycol”"
            value={q} onChange={(e) => { setQ(e.target.value); setFocus(-1); }}
            role="combobox" aria-expanded={results.length > 0} aria-controls={listId} aria-autocomplete="list"
            aria-activedescendant={focus >= 0 ? `finder-opt-${focus}` : undefined}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setFocus((f) => Math.min(results.length - 1, f + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setFocus((f) => Math.max(-1, f - 1)); }
            }}
          />
          <button type="submit" className="pill pill--orange">Search</button>
        </form>
        <ul id={listId} className={cx('finder__results', results.length > 0 && 'is-open')} role="listbox" aria-label="Matching products">
          {results.map((p, i) => (
            <li key={p.id} id={`finder-opt-${i}`} role="option" aria-selected={i === focus}>
              <Link to={productHref(p)} className={cx('finder__hit', i === focus && 'is-focus')}>
                <span className="finder__code">{productMark(p)}</span>
                <span className="finder__name">{p.name}<small>{getCategory(p.category)?.name}</small></span>
                <Icon name="arrow" size={16} />
              </Link>
            </li>
          ))}
        </ul>
        {q.trim() && results.length === 0 && <p className="finder__none" role="status">No published product matches “{q}”. <Link to={`/request-quote?product=${encodeURIComponent(q)}`}>Ask our desk anyway</Link>.</p>}
      </Reveal>
    </section>
  );
}

// ---------- paged slider (the reference's customer-quote slider pattern, re-used for verified content only) ----------
export interface Slide { id: string; kicker: string; title: string; text: string; points?: string[]; image: string; chipLabel: string; chipValue: string }
export function PagedSlider({ eyebrow, title, lead, slides }: { eyebrow: string; title: string; lead?: string; slides: Slide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = (k: number) => setI(((k % n) + n) % n);
  const s = slides[i];
  return (
    <section className="paged" aria-roledescription="carousel" aria-label={eyebrow}>
      <div className="wrap paged__grid">
        <div className="paged__head">
          <Reveal><Eyebrow>{eyebrow}</Eyebrow></Reveal>
          <WordRise text={title} as="h2" className="paged__title" />
          {lead && <Reveal as="p" className="paged__lead" delay={150}>{lead}</Reveal>}
          <div className="paged__ctrl">
            <button type="button" className="circle-btn" onClick={() => go(i - 1)} aria-label="Previous"><Icon name="arrow-left" /></button>
            <button type="button" className="circle-btn circle-btn--orange" onClick={() => go(i + 1)} aria-label="Next"><Icon name="arrow-right" /></button>
            <span className="paged__count" aria-live="polite">{String(i + 1).padStart(2, '0')} <span>/ {String(n).padStart(2, '0')}</span></span>
          </div>
        </div>
        <div className="paged__body" key={s.id}>
          <div className="paged__text">
            <p className="paged__kicker">{s.kicker}</p>
            <h3 className="paged__h">{s.title}</h3>
            <p className="paged__p">{s.text}</p>
            {s.points && <ul className="ticks">{s.points.map((p) => <li key={p}><Icon name="check" size={16} />{p}</li>)}</ul>}
            <ol className="dots dots--dark" aria-label="Choose a slide">
              {slides.map((sl, k) => <li key={sl.id}><button type="button" className={cx('dots__b', k === i && 'is-on')} onClick={() => go(k)} aria-label={sl.title} aria-current={k === i ? 'true' : undefined} /></li>)}
            </ol>
          </div>
          <figure className="paged__fig">
            <Img name={s.image} sizes="(max-width: 1079px) 92vw, 34vw" alt="" />
            <figcaption className="paged__chip"><span>{s.chipLabel}</span><strong>{s.chipValue}</strong></figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

// ---------- horizontal code rail (featured products) ----------
export function CodeRail({ items }: { items: Product[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const reduced = useReducedMotion();
  const update = () => { const el = ref.current; if (!el) return; setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 }); };
  useEffect(update, []);
  const by = (d: number) => { const el = ref.current; if (!el) return; el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' }); };
  return (
    <div className="rail">
      <ul className="rail__list" ref={ref} onScroll={update} tabIndex={0} aria-label="Featured products — scroll horizontally">
        {items.map((p, i) => (
          <Reveal as="li" key={p.id} className="rail__item" delay={i * 70}>
            <Link to={productHref(p)} className="code-card">
              <span className="code-card__cat">{getCategory(p.category)?.shortName}</span>
              <span className="code-card__code" aria-hidden="true">{productMark(p)}</span>
              <span className="code-card__name">{p.name}</span>
              <span className="code-card__text">{p.shortDescription}</span>
              <span className="code-card__go" aria-hidden="true"><Icon name="arrow" size={16} /></span>
            </Link>
          </Reveal>
        ))}
      </ul>
      <div className="rail__ctrl">
        <button type="button" className="circle-btn" onClick={() => by(-1)} disabled={edge.start} aria-label="Scroll products left"><Icon name="arrow-left" /></button>
        <button type="button" className="circle-btn circle-btn--orange" onClick={() => by(1)} disabled={edge.end} aria-label="Scroll products right"><Icon name="arrow-right" /></button>
      </div>
    </div>
  );
}

// ---------- split CTA ----------
export function SplitCta({ title, lead, cta, secondary, image = 'ship-red' }: { title: string; lead?: string; cta: { href: string; label: string }; secondary?: { href: string; label: string }; image?: string }) {
  return (
    <section className="split wrap" aria-label="Request a quote">
      <Reveal className="split__img"><Img name={image} sizes="(max-width: 1079px) 92vw, 38vw" alt="" /></Reveal>
      <Reveal className="split__card tone-ink" delay={120}>
        <DotField className="split__dots" seed={11} />
        <h2 className="split__title"><Rich text={title} /></h2>
        {lead && <p className="split__lead">{lead}</p>}
        <div className="split__actions">
          <CtaPair to={cta.href}>{cta.label}</CtaPair>
          {secondary && <Link to={secondary.href} className="split__sec">{secondary.label}</Link>}
        </div>
        <span className="split__mark" aria-hidden="true">URMPL</span>
      </Reveal>
    </section>
  );
}

// ---------- page heroes ----------
/** Photo hero: an inset rounded render with the title set over it and a slim wordmark marquee. */
export function PhotoHero({ eyebrow, title, lead, image, children, mark }: { eyebrow: string; title: string; lead?: string; image: string; children?: ReactNode; mark?: string }) {
  const bg = useRef<HTMLDivElement>(null);
  useParallax(bg, 40);
  return (
    <section className="phero">
      <div className="phero__frame">
        <div className="phero__bg" ref={bg}><Img name={image} sizes="100vw" priority alt="" /></div>
        <div className="phero__shade" aria-hidden="true" />
        <div className="phero__content wrap">
          <Eyebrow tone="light" className="enter" >{eyebrow}</Eyebrow>
          <h1 className="phero__title enter" style={{ ['--d' as string]: '120ms' }}><Rich text={title} /></h1>
          {lead && <p className="phero__lead enter" style={{ ['--d' as string]: '240ms' }}>{lead}</p>}
          {children && <div className="phero__actions enter" style={{ ['--d' as string]: '340ms' }}>{children}</div>}
        </div>
        <Marquee text={mark ?? 'United Raw Material'} className="phero__marquee" speed={44} />
      </div>
    </section>
  );
}

/** Type hero: no photograph — a large statement with the lead in the right column. */
export function TypeHero({ eyebrow, title, lead, children, aside }: { eyebrow: string; title: string; lead?: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="thero">
      <div className="wrap thero__grid">
        <Eyebrow className="enter">{eyebrow}</Eyebrow>
        <h1 className="thero__title enter" style={{ ['--d' as string]: '100ms' }}><Rich text={title} /></h1>
        <div className="thero__side enter" style={{ ['--d' as string]: '220ms' }}>
          {lead && <p className="thero__lead">{lead}</p>}
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}

export function Crumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav className="crumbs wrap" aria-label="Breadcrumb">
      <ol>
        {items.map((c, i) => (
          <li key={i}>{c.href && i < items.length - 1 ? <Link to={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}
