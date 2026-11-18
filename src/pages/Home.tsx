import { useRef } from 'react';
import { Link } from 'react-router';
import { categories, company, industries, pillars, process, products, section, tradeModels, seoFor, incorporatedLabel } from '@/data';
import { Marquee, useMeta } from '@/components/layout';
import { OrbitCarousel } from '@/components/OrbitCarousel';
import { CodeRail, FeatureRow, Finder, PagedSlider, ProcessBranch, SplitCta, Statement } from '@/components/sections';
import { CtaPair, Eyebrow, Icon, Img, Reveal, WordRise } from '@/components/ui';
import { useParallax } from '@/lib/motion';
import heroes from '@/data/content/heroes.json';

const PILLAR_ICONS = ['shield', 'layers', 'repeat', 'compass'] as const;

export default function Home() {
  const seo = seoFor('/');
  useMeta('United Raw Material — Singapore trading & indenting', seo?.description);
  const hero = heroes[0];
  const intro = section('home-intro');
  const trade = section('home-trade');
  const proc = section('home-process');
  const feat = section('home-featured');
  const inds = section('home-industries');
  const cta = section('home-cta');
  const img = useRef<HTMLDivElement>(null);
  useParallax(img, 70);

  return (
    <>
      {/* 1 · Cinematic hero with the wordmark marquee (reference frame 1) */}
      <section className="hero" aria-labelledby="hero-h">
        <div className="hero__media" ref={img}>
          <picture>
            <source media="(max-width: 719px)" srcSet="/images/hero-sea-portrait-640.webp 640w, /images/hero-sea-portrait-1080.webp 1080w" sizes="100vw" />
            <Img name="hero-sea" sizes="100vw" priority className="hero__img" />
          </picture>
        </div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__inner wrap">
          <div className="hero__copy">
            <p className="hero__eyebrow enter" style={{ ['--d' as string]: '700ms' }}>{hero.eyebrow}</p>
            <h1 id="hero-h" className="hero__title enter" style={{ ['--d' as string]: '820ms' }}>Global trade.<br /><em>Reliable supply.</em></h1>
            <p className="hero__lead enter" style={{ ['--d' as string]: '940ms' }}>{hero.subtitle}</p>
            <div className="hero__actions enter" style={{ ['--d' as string]: '1060ms' }}>
              <CtaPair to={hero.primaryCta.href}>{hero.primaryCta.label}</CtaPair>
              <Link to={hero.secondaryCta.href} className="hero__sec">{hero.secondaryCta.label}</Link>
            </div>
          </div>
          <dl className="hero__meta enter" style={{ ['--d' as string]: '1180ms' }}>
            <div><dt>Registered</dt><dd>Singapore · UEN {company.uen}</dd></div>
            <div><dt>Position</dt><dd>{company.coordinates}</dd></div>
            <div><dt>Model</dt><dd>{company.businessModel}</dd></div>
          </dl>
        </div>
        <div className="hero__band">
          <Marquee className="hero__marquee" />
        </div>
      </section>

      {/* 2 · Statement + four pillars (reference frame 2) */}
      <Statement eyebrow={intro.eyebrow ?? 'Who we are'} title={intro.title}>
        <Reveal as="p" className="stmt__body" delay={250}>{intro.body?.[0]}</Reveal>
        <Reveal delay={320}><Link className="tlink" to={intro.cta!.href}><span>{intro.cta!.label}</span><Icon name="arrow-right" size={16} /></Link></Reveal>
      </Statement>
      <div className="wrap feat-wrap">
        <FeatureRow items={pillars.map((p, i) => ({ id: p.id, icon: PILLAR_ICONS[i % 4], title: p.title, text: p.description, meta: p.proofValue ? `${p.proofLabel} · ${p.proofValue}` : undefined }))} />
      </div>

      {/* 3 · Curved cylinder carousel of trading verticals (reference frame 3, signature) */}
      <section className="verticals" aria-labelledby="vert-h">
        <header className="verticals__head wrap">
          <Reveal><Eyebrow>{trade.eyebrow}</Eyebrow></Reveal>
          <Reveal variant="blur" as="h2" id="vert-h" className="verticals__title">{trade.title}</Reveal>
          <Reveal variant="blur" as="p" className="verticals__lead" delay={120}>{trade.lead}</Reveal>
        </header>
        <Reveal variant="blur" delay={160}>
          <OrbitCarousel
            label="Trading verticals"
            items={categories.map((c) => ({
              id: c.id, image: c.image, label: c.name, href: `/products/${c.slug}`,
              status: c.availability === 'active' ? 'Published range' : 'Range in preparation',
              caption: c.intro ?? 'This range is being prepared for publication. Enquiries are welcome in the meantime.',
              cta: `Explore ${c.shortName}`,
            }))}
          />
        </Reveal>
      </section>

      {/* 4 · Navy process band with the branching line (reference frame 4) */}
      <ProcessBranch eyebrow={proc.eyebrow!} title={proc.title} lead={proc.lead} steps={process} cta={proc.cta} />

      {/* 5 · Featured products — horizontal code rail */}
      <Statement eyebrow={feat.eyebrow!} title={feat.title}>
        <Reveal as="p" className="stmt__body" delay={200}>{feat.lead}</Reveal>
      </Statement>
      <div className="wrap"><CodeRail items={products.filter((p) => p.featured)} /></div>

      {/* 6 · Glass finder over the broadside render (reference frame 5) */}
      <Finder />

      {/* 7 · Paged slider — trading vs indenting (reference frame 6 pattern) */}
      <PagedSlider
        eyebrow="Trading & indenting"
        title="Two ways we take part in a *trade*."
        lead="Which one fits depends on how the buyer and producer prefer to contract."
        slides={[
          { id: 'trading', kicker: 'Model 01', title: tradeModels[0].title, text: tradeModels[0].summary, points: tradeModels[0].points, image: 'aerial', chipLabel: 'Contracting from', chipValue: 'Singapore' },
          { id: 'indenting', kicker: 'Model 02', title: tradeModels[1].title, text: tradeModels[1].summary, points: tradeModels[1].points, image: 'port-dusk', chipLabel: 'Incorporated', chipValue: incorporatedLabel },
        ]}
      />

      {/* 8 · Industries — large type index */}
      <section className="ind-index" aria-labelledby="ind-h">
        <div className="wrap stmt__grid">
          <Reveal className="stmt__eye"><Eyebrow>{inds.eyebrow}</Eyebrow></Reveal>
          <div className="stmt__main">
            <WordRise text={inds.title} as="h2" className="stmt__title" />
            <span id="ind-h" className="sr-only">{inds.title}</span>
            <Reveal as="p" className="stmt__body" delay={200}>{inds.lead}</Reveal>
          </div>
        </div>
        <ul className="wrap ind-index__list">
          {industries.filter((i) => i.featured).map((i, k) => (
            <Reveal as="li" key={i.id} delay={k * 50}>
              <Link to={`/industries/${i.slug}`} className="ind-row">
                <span className="ind-row__n">{String(k + 1).padStart(2, '0')}</span>
                <span className="ind-row__name">{i.name}</span>
                <span className="ind-row__intro">{i.intro}</span>
                <span className="ind-row__go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
              </Link>
            </Reveal>
          ))}
        </ul>
        <div className="wrap ind-index__more"><Link className="tlink" to="/industries"><span>{inds.cta!.label}</span><Icon name="arrow-right" size={16} /></Link></div>
      </section>

      {/* 9 · Split CTA card (reference frame 7) */}
      <SplitCta title={cta.title} lead={cta.lead} cta={cta.cta!} secondary={cta.secondaryCta} />
    </>
  );
}
