import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { categories, company, fullAddress, getCategory, getIndustry, industries, pillars, principles, process, productHref, productMark, productsForIndustry, section, seoFor, tradeModels } from '@/data';
import { useMeta } from '@/components/layout';
import { HubRadial } from '@/components/HubRadial';
import { Crumbs, FeatureRow, PhotoHero, ProcessBranch, SplitCta, Statement, TypeHero } from '@/components/sections';
import { CtaPair, Eyebrow, Icon, Img, Reveal, WordRise, cx } from '@/components/ui';
import NotFound from './NotFound';

// ---------- Industries ----------
export function IndustriesIndex() {
  useMeta('Industries', seoFor('/industries')?.description);
  const hero = section('industries-hero');
  const matrix = section('industries-matrix');
  const cta = section('industries-cta');
  const [hover, setHover] = useState<string | null>(null);
  const preview = hover ? getIndustry(hover) : industries[0];
  const previewImg = preview ? getCategory(preview.categories[0])?.image ?? 'mat-chemicals' : 'mat-chemicals';
  return (
    <>
      <TypeHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead} />
      {/* Index list with a sticky preview that follows hover / focus */}
      <section className="iidx wrap" aria-label="The sectors we serve">
        <ul className="iidx__list" onMouseLeave={() => setHover(null)}>
          {industries.map((i, k) => (
            <Reveal as="li" key={i.id} delay={k * 40}>
              <Link to={`/industries/${i.slug}`} className={cx('ind-row', hover === i.slug && 'is-hover')} onMouseEnter={() => setHover(i.slug)} onFocus={() => setHover(i.slug)}>
                <span className="ind-row__n">{String(k + 1).padStart(2, '0')}</span>
                <span className="ind-row__name">{i.name}</span>
                <span className="ind-row__intro">{i.intro}</span>
                <span className="ind-row__go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
              </Link>
            </Reveal>
          ))}
        </ul>
        <aside className="iidx__preview" aria-hidden="true">
          <div className="iidx__frame" key={previewImg}><Img name={previewImg} sizes="30vw" alt="" /></div>
          <p className="iidx__cap">{preview?.name}<span>{preview?.categories.map((c) => getCategory(c)?.shortName).join(' · ')}</span></p>
        </aside>
      </section>

      <section className="matrix wrap" aria-labelledby="mx-h">
        <div className="matrix__head"><Eyebrow>{matrix.eyebrow}</Eyebrow><h2 id="mx-h">{matrix.title}</h2><p>{matrix.lead}</p></div>
        <div className="matrix__scroll" tabIndex={0} role="region" aria-label="Industries by vertical, scrollable table">
          <table className="matrix__table">
            <thead><tr><th scope="col">Industry</th>{categories.map((c) => <th key={c.id} scope="col">{c.shortName}{c.availability !== 'active' && <small>in preparation</small>}</th>)}</tr></thead>
            <tbody>
              {industries.map((i) => (
                <tr key={i.id}><th scope="row"><Link to={`/industries/${i.slug}`}>{i.name}</Link></th>
                  {categories.map((c) => <td key={c.id}>{i.categories.includes(c.slug) ? <><span className="mx-dot" aria-hidden="true" /><span className="sr-only">Yes</span></> : <span className="sr-only">No</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <SplitCta title={cta.title} lead={cta.lead} cta={cta.cta!} secondary={cta.secondaryCta} image="mat-chemicals" />
    </>
  );
}

export function IndustryDetail() {
  const { slug = '' } = useParams();
  const ind = getIndustry(slug);
  useMeta(ind ? ind.name : 'Not found', ind?.intro);
  if (!ind) return <NotFound />;
  const ps = productsForIndustry(ind.slug);
  const why = section('industry-why');
  const cats = ind.categories.map(getCategory).filter(Boolean);
  const idx = industries.indexOf(ind);
  const next = industries[(idx + 1) % industries.length];
  return (
    <>
      <TypeHero eyebrow={`Industry ${String(idx + 1).padStart(2, '0')} / ${String(industries.length).padStart(2, '0')}`} title={ind.name} lead={ind.intro}
        aside={<div className="thero__img enter" style={{ ['--d' as string]: '300ms' }}><Img name={cats[0]?.image ?? 'mat-chemicals'} sizes="(max-width: 1079px) 92vw, 40vw" priority alt="" /></div>}>
        <CtaPair to={`/request-quote?product=${encodeURIComponent(ind.name)}`}>Request a Quote</CtaPair>
      </TypeHero>
      <Crumbs items={[{ href: '/', label: 'Home' }, { href: '/industries', label: 'Industries' }, { label: ind.name }]} />
      <section className="tagband wrap" aria-labelledby="iv-h">
        <h2 id="iv-h" className="tagband__h">Verticals that supply it</h2>
        <ul className="tagband__list">{cats.map((c) => <li key={c!.id}><Link to={`/products/${c!.slug}`} className="chip chip--link">{c!.name}{c!.availability !== 'active' && ' (in preparation)'}<Icon name="arrow" size={14} /></Link></li>)}</ul>
      </section>
      {ps.length > 0 ? (
        <section className="related wrap" aria-labelledby="ip-h">
          <h2 id="ip-h" className="related__h">Published products for {ind.name.toLowerCase()}</h2>
          <ul className="code-grid">
            {ps.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 60}>
                <Link to={productHref(p)} className="code-card"><span className="code-card__cat">{getCategory(p.category)?.shortName}</span><span className="code-card__code" aria-hidden="true">{productMark(p)}</span><span className="code-card__name">{p.name}</span><span className="code-card__text">{p.shortDescription}</span><span className="code-card__go" aria-hidden="true"><Icon name="arrow" size={16} /></span></Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : (
        <section className="pending-band wrap"><div><Eyebrow>Products</Eyebrow><h2>No products are published for this industry yet.</h2></div><div><p>Tell us the material and grade your line uses, the quantity and destination, and our Singapore desk will respond directly.</p><CtaPair to="/request-quote">Request a Quote</CtaPair></div></section>
      )}
      <Statement eyebrow={why.eyebrow!} title={why.title} />
      <div className="wrap feat-wrap"><FeatureRow items={pillars.map((p, i) => ({ id: p.id, icon: (['shield', 'layers', 'repeat', 'compass'] as const)[i], title: p.title, text: p.description }))} /></div>
      <Link to={`/industries/${next.slug}`} className="nextline wrap"><span>Next industry</span><strong>{next.name}</strong><Icon name="arrow-right" size={22} /></Link>
    </>
  );
}

// ---------- Global network ----------
export function GlobalNetwork() {
  useMeta('Global Network', seoFor('/global-network')?.description);
  const hero = section('network-hero');
  const map = section('network-map');
  const hub = section('network-hub');
  const pr = section('network-principles');
  const cta = section('network-cta');
  return (
    <>
      <PhotoHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead} image="port-dusk" mark="Singapore hub" />
      <section className="network wrap" id="markets" aria-labelledby="net-h">
        <div className="network__head">
          <Reveal><Eyebrow>{map.eyebrow}</Eyebrow></Reveal>
          <WordRise text={map.title} as="h2" className="network__title" />
          <span id="net-h" className="sr-only">{map.title}</span>
          <Reveal as="p" className="network__lead" delay={150}>Select a region to highlight its lanes. The same information is listed alongside.</Reveal>
        </div>
        <HubRadial />
      </section>
      <section className="hubband tone-ink" id="hub" aria-labelledby="hub-h">
        <div className="wrap hubband__grid">
          <div>
            <Eyebrow tone="light">{hub.eyebrow}</Eyebrow>
            <h2 id="hub-h" className="hubband__title">{hub.title.replace(/\*/g, '')}</h2>
            <p className="hubband__lead">{hub.body?.[0]}</p>
            <div className="hubband__actions"><CtaPair to={hub.secondaryCta!.href}>{hub.secondaryCta!.label}</CtaPair><Link to={hub.cta!.href} className="hero__sec">{hub.cta!.label}</Link></div>
          </div>
          <dl className="hubband__facts">
            <div><dt>Office</dt><dd>{fullAddress}</dd></div>
            <div><dt>Telephone</dt><dd><a href={company.phoneHref}>{company.phone}</a></dd></div>
            <div><dt>Coordinates</dt><dd>{company.coordinates}</dd></div>
            <div><dt>Registered since</dt><dd>{company.foundedYear}</dd></div>
          </dl>
        </div>
      </section>
      <Statement eyebrow={pr.eyebrow!} title={pr.title} />
      <div className="wrap feat-wrap"><FeatureRow items={principles.map((p, i) => ({ id: p.id, icon: (['layers', 'compass', 'repeat', 'globe'] as const)[i % 4], title: p.title, text: p.text }))} /></div>
      <SplitCta title={cta.title} lead={cta.lead} cta={cta.cta!} secondary={cta.secondaryCta} image="ship-broadside" />
    </>
  );
}

// ---------- How we work ----------
export function HowWeWork() {
  useMeta('How We Work', seoFor('/how-we-work')?.description);
  const hero = section('hww-hero');
  const pr = section('hww-process');
  const models = section('hww-models');
  const expect = section('hww-expect');
  const start = section('hww-start');
  const cta = section('hww-cta');
  return (
    <>
      <PhotoHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead} image="aerial" mark="Five stages" />
      <ProcessBranch eyebrow={pr.eyebrow!} title={pr.title} lead={pr.lead} steps={process} />
      {/* stage detail — sticky index with stacked panels */}
      <section className="stages wrap" aria-label="Stages in detail">
        <ol className="stages__list">
          {process.map((s, i) => (
            <li key={s.id} className="stage" style={{ ['--i' as string]: i }}>
              <span className="stage__n" aria-hidden="true">{String(s.step).padStart(2, '0')}</span>
              <div className="stage__body"><h3>{s.title}</h3><p>{s.summary}</p></div>
            </li>
          ))}
        </ol>
      </section>
      <section className="models wrap" aria-labelledby="hm-h">
        <div className="models__head"><Eyebrow>{models.eyebrow}</Eyebrow><h2 id="hm-h" className="models__title">{models.title}</h2><p>{models.lead}</p></div>
        <div className="models__grid">
          {tradeModels.map((m, i) => (
            <Reveal key={m.id} className="model" delay={i * 120}>
              <p className="model__n">0{i + 1}</p><h3>{m.title}</h3><p>{m.summary}</p>
              <ul className="ticks">{m.points.map((p) => <li key={p}><Icon name="check" size={16} />{p}</li>)}</ul>
            </Reveal>
          ))}
        </div>
      </section>
      <Statement eyebrow={expect.eyebrow!} title={expect.title} />
      <div className="wrap feat-wrap"><FeatureRow items={pillars.map((p, i) => ({ id: p.id, icon: (['shield', 'layers', 'repeat', 'compass'] as const)[i], title: p.title, text: p.description }))} /></div>
      <section className="starts wrap" aria-labelledby="st-h">
        <div className="starts__head"><Eyebrow>{start.eyebrow}</Eyebrow><h2 id="st-h"><span>{start.title.replace(/\*/g, '')}</span></h2><p>{start.lead}</p></div>
        <div className="starts__grid">
          <Link to="/products" className="start-card"><Img name="mat-petrochemicals" sizes="(max-width: 719px) 92vw, 45vw" alt="" /><span className="start-card__k">Start from a product</span><span className="start-card__t">Browse the catalogue</span></Link>
          <Link to="/industries" className="start-card"><Img name="mat-textile" sizes="(max-width: 719px) 92vw, 45vw" alt="" /><span className="start-card__k">Start from your industry</span><span className="start-card__t">See the sectors we serve</span></Link>
        </div>
      </section>
      <SplitCta title={cta.title} lead={cta.lead} cta={cta.cta!} secondary={cta.secondaryCta} image="ship-red" />
    </>
  );
}
