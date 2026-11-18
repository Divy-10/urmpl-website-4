import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { categories, getCategory, getIndustry, getProduct, industries, productHref, productMark, products, productsIn, searchProducts, section, seoFor, type Product } from '@/data';
import { Marquee, useMeta } from '@/components/layout';
import { Crumbs, Finder, PhotoHero, SplitCta, Statement, TypeHero } from '@/components/sections';
import { CtaPair, Eyebrow, Icon, Img, Reveal, cx } from '@/components/ui';
import NotFound from './NotFound';

function ProductRow({ p, i }: { p: Product; i: number }) {
  return (
    <Reveal as="li" delay={Math.min(i, 8) * 40}>
      <Link to={productHref(p)} className="prow">
        <span className="prow__code">{productMark(p)}</span>
        <span className="prow__name">{p.name}</span>
        <span className="prow__desc">{p.shortDescription}</span>
        <span className="prow__cat">{getCategory(p.category)?.shortName}</span>
        <span className="prow__go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
      </Link>
    </Reveal>
  );
}

export function ProductsIndex() {
  useMeta('Products', seoFor('/products')?.description);
  const hero = section('products-hero');
  const verts = section('products-verticals');
  const quote = section('products-quote');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const cat = params.get('vertical') ?? 'all';
  const list = useMemo(() => {
    const base = q.trim() ? searchProducts(q) : products;
    return cat === 'all' ? base : base.filter((p) => p.category === cat || p.crossListed.includes(cat));
  }, [q, cat]);
  const update = (k: string, v: string) => { const n = new URLSearchParams(params); if (v && v !== 'all') n.set(k, v); else n.delete(k); setParams(n, { replace: true }); };
  const active = categories.filter((c) => productsIn(c.slug).length > 0);
  return (
    <>
      <TypeHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead}>
        <p className="thero__meta">{products.length} published products · {categories.length} trading verticals</p>
      </TypeHero>

      {/* verticals — an index of six render tiles */}
      <section className="vtiles wrap" aria-labelledby="vt-h">
        <div className="vtiles__head"><Eyebrow>{verts.eyebrow}</Eyebrow><h2 id="vt-h">{verts.title}</h2></div>
        <ul className="vtiles__grid">
          {categories.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 70} variant="blur">
              <Link to={`/products/${c.slug}`} className="vtile">
                <Img name={c.image} sizes="(max-width: 719px) 92vw, (max-width: 1079px) 46vw, 30vw" alt="" />
                <span className="vtile__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="vtile__body"><span className="vtile__name">{c.name}</span><span className="vtile__meta">{c.availability === 'active' ? `${productsIn(c.slug).length} products` : 'In preparation'}</span></span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="catalogue wrap" id="catalogue" aria-labelledby="cat-h">
        <div className="catalogue__bar">
          <h2 id="cat-h" className="catalogue__title">All products</h2>
          <div className="catalogue__search">
            <Icon name="search" />
            <label htmlFor="cat-q" className="sr-only">Search products</label>
            <input id="cat-q" type="search" placeholder="Search by name, code or alias" value={q} onChange={(e) => update('q', e.target.value)} />
          </div>
          <div className="chips" role="group" aria-label="Filter by vertical">
            <button type="button" className={cx('chip', cat === 'all' && 'is-on')} aria-pressed={cat === 'all'} onClick={() => update('vertical', 'all')}>All</button>
            {active.map((c) => <button key={c.id} type="button" className={cx('chip', cat === c.slug && 'is-on')} aria-pressed={cat === c.slug} onClick={() => update('vertical', c.slug)}>{c.shortName}</button>)}
          </div>
        </div>
        <p className="catalogue__count" role="status">{list.length} {list.length === 1 ? 'product' : 'products'}{q && <> matching “{q}”</>}</p>
        {list.length ? <ul className="plist">{list.map((p, i) => <ProductRow key={p.id} p={p} i={i} />)}</ul> : (
          <div className="empty"><p>No published product matches. Our desk can still look at sourcing it.</p><CtaPair to={`/request-quote?product=${encodeURIComponent(q)}`}>Request a Quote</CtaPair></div>
        )}
      </section>

      <SplitCta title={quote.title} lead={quote.lead} cta={quote.cta!} secondary={quote.secondaryCta} image="mat-petrochemicals" />
    </>
  );
}

export function ProductCategory() {
  const { category = '' } = useParams();
  const c = getCategory(category);
  useMeta(c ? c.name : 'Not found', c?.intro);
  if (!c) return <NotFound />;
  const list = productsIn(c.slug);
  const prep = section('category-preparing');
  const inds = industries.filter((i) => i.categories.includes(c.slug));
  const idx = categories.indexOf(c);
  const next = categories[(idx + 1) % categories.length];
  return (
    <>
      <PhotoHero eyebrow={`Vertical ${String(idx + 1).padStart(2, '0')} · ${c.availability === 'active' ? 'Published range' : 'In preparation'}`} title={c.name} lead={c.intro} image={c.image} mark={c.shortName}>
        <CtaPair to={`/request-quote?product=${encodeURIComponent(c.name)}`}>Request a Quote</CtaPair>
      </PhotoHero>
      <Crumbs items={[{ href: '/', label: 'Home' }, { href: '/products', label: 'Products' }, { label: c.name }]} />
      {list.length ? (
        <section className="catalogue wrap" aria-labelledby="cl-h">
          <div className="catalogue__bar"><h2 id="cl-h" className="catalogue__title">{list.length} products in {c.shortName}</h2></div>
          <ul className="plist">{list.map((p, i) => <ProductRow key={p.id} p={p} i={i} />)}</ul>
        </section>
      ) : (
        <Statement eyebrow={prep.eyebrow!} title={prep.title}>
          <Reveal as="p" className="stmt__body" delay={200}>{prep.lead}</Reveal>
          <Reveal delay={260}><CtaPair to={`/request-quote?product=${encodeURIComponent(c.name)}`}>Request a Quote</CtaPair></Reveal>
        </Statement>
      )}
      {inds.length > 0 && (
        <section className="tagband wrap" aria-labelledby="ci-h">
          <h2 id="ci-h" className="tagband__h">Industries this vertical serves</h2>
          <ul className="tagband__list">{inds.map((i) => <li key={i.id}><Link to={`/industries/${i.slug}`} className="chip chip--link">{i.name}<Icon name="arrow" size={14} /></Link></li>)}</ul>
        </section>
      )}
      <Link to={`/products/${next.slug}`} className="nextband">
        <span className="nextband__k">Next vertical</span>
        <Marquee text={next.name} tone="ink" className="nextband__marquee" speed={30} />
      </Link>
    </>
  );
}

export function ProductDetail() {
  const { category = '', slug = '' } = useParams();
  const p = getProduct(category, slug);
  useMeta(p ? `${p.name}${p.code ? ` (${p.code})` : ''}` : 'Not found', p?.shortDescription);
  if (!p) return <NotFound />;
  const c = getCategory(p.category)!;
  const enquiry = section('product-enquiry');
  const related = productsIn(p.category).filter((x) => x.id !== p.id).slice(0, 4);
  const inds = p.industries.map(getIndustry).filter(Boolean);
  return (
    <>
      <section className="pd">
        <Crumbs items={[{ href: '/', label: 'Home' }, { href: '/products', label: 'Products' }, { href: `/products/${c.slug}`, label: c.name }, { label: p.name }]} />
        <div className="wrap pd__grid">
          <div className="pd__mark enter" aria-hidden="true">{productMark(p)}</div>
          <div className="pd__head">
            <Eyebrow className="enter">{c.name}</Eyebrow>
            <h1 className="pd__title enter" style={{ ['--d' as string]: '100ms' }}>{p.name}{p.code && <span className="pd__code"> · {p.code}</span>}</h1>
            <p className="pd__lead enter" style={{ ['--d' as string]: '200ms' }}>{p.shortDescription}</p>
            {p.aliases.length > 0 && <p className="pd__aliases enter" style={{ ['--d' as string]: '260ms' }}>Also known as: {p.aliases.join(', ')}</p>}
            <div className="pd__actions enter" style={{ ['--d' as string]: '320ms' }}>
              <CtaPair to={`/request-quote?product=${p.slug}`}>Request a Quote</CtaPair>
              <Link to={`/contact?type=product#enquiry-form`} className="hero__sec hero__sec--dark">Ask a question</Link>
            </div>
          </div>
          <figure className="pd__fig enter" style={{ ['--d' as string]: '200ms' }}>
            <Img name={c.image} sizes="(max-width: 1079px) 92vw, 30vw" alt="" />
            <figcaption>Illustrative render of the {c.shortName.toLowerCase()} vertical — not this product.</figcaption>
          </figure>
        </div>
      </section>

      <section className="pd-spec wrap" aria-labelledby="spec-h">
        <div>
          <Eyebrow>{enquiry.eyebrow}</Eyebrow>
          <h2 id="spec-h" className="pd-spec__title">{enquiry.title}</h2>
          <p className="pd-spec__lead">URMPL has not yet published grade tables for this product, so none are shown here. {enquiry.lead}</p>
        </div>
        <ol className="pd-spec__list">
          {enquiry.body?.map((b, i) => <Reveal as="li" key={b} delay={i * 60}><span>{String(i + 1).padStart(2, '0')}</span>{b}</Reveal>)}
        </ol>
      </section>

      {inds.length > 0 && (
        <section className="tagband wrap" aria-labelledby="pi-h">
          <h2 id="pi-h" className="tagband__h">Used by</h2>
          <ul className="tagband__list">{inds.map((i) => <li key={i!.id}><Link to={`/industries/${i!.slug}`} className="chip chip--link">{i!.name}<Icon name="arrow" size={14} /></Link></li>)}</ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="related wrap" aria-labelledby="rel-h">
          <h2 id="rel-h" className="related__h">More in {c.shortName}</h2>
          <ul className="plist">{related.map((r, i) => <ProductRow key={r.id} p={r} i={i} />)}</ul>
        </section>
      )}
      <Finder title="Looking for something else?" image="aerial" />
    </>
  );
}
