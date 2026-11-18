import { Link } from 'react-router';
import { company, fullAddress, incorporatedLabel, pillars, section, seoFor, statements, timeline, tradeModels, yearsSinceFounding } from '@/data';
import { useMeta } from '@/components/layout';
import { PagedSlider, PhotoHero, SplitCta, Statement } from '@/components/sections';
import { CtaPair, Eyebrow, Icon, Reveal, WordRise } from '@/components/ui';

export default function About() {
  useMeta('About URMPL', seoFor('/about')?.description);
  const hero = section('about-hero');
  const who = section('about-who');
  const story = section('about-story');
  const lead = section('about-leadership');
  const why = section('about-why');
  const cta = section('about-cta');
  return (
    <>
      <PhotoHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead} image="ship-broadside" mark="Since 2006">
        <CtaPair to="/request-quote">Request a Quote</CtaPair>
      </PhotoHero>

      <Statement eyebrow={who.eyebrow!} title={who.title}>
        <div className="cols-2">
          {who.body?.map((p, i) => <Reveal as="p" key={i} className="stmt__body" delay={200 + i * 80}>{p}</Reveal>)}
        </div>
      </Statement>

      {/* Company register: verified facts only */}
      <section className="register wrap" aria-labelledby="reg-h">
        <h2 id="reg-h" className="sr-only">Company facts</h2>
        <dl className="register__grid">
          {[
            ['Legal name', company.legalName],
            ['Incorporated', incorporatedLabel],
            ['UEN', company.uen],
            ['Business', company.businessModel],
            ['Activity', company.principalActivity],
            ['Registered office', fullAddress],
          ].map(([k, v], i) => (
            <Reveal key={k} className="register__cell" delay={i * 60}><dt>{k}</dt><dd>{v}</dd></Reveal>
          ))}
        </dl>
      </section>

      {/* Story: only documented milestones */}
      <section className="story tone-ink" aria-labelledby="story-h">
        <div className="wrap">
          <Reveal><Eyebrow tone="light">{story.eyebrow}</Eyebrow></Reveal>
          <WordRise text={story.title} as="h2" className="story__title" />
          <span id="story-h" className="sr-only">{story.title}</span>
          <Reveal as="p" className="story__lead" delay={160}>{story.lead}</Reveal>
          <ol className="story__line">
            {timeline.map((t, i) => (
              <Reveal as="li" key={t.id} className="story__item" delay={200 + i * 160}>
                <span className="story__year">{t.year}</span>
                <div><h3>{t.title}</h3><p>{t.description}</p><p className="story__src">Source: {t.source}</p></div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="vm wrap" aria-label="Vision and mission">
        {statements.map((s, i) => (
          <Reveal key={s.id} className="vm__item" delay={i * 120}>
            <Eyebrow>{s.label}</Eyebrow>
            <p className="vm__text">{s.text}</p>
          </Reveal>
        ))}
      </section>

      <PagedSlider
        eyebrow={why.eyebrow!}
        title={why.title}
        slides={pillars.map((p, i) => ({
          id: p.id, kicker: `Reason ${String(i + 1).padStart(2, '0')}`, title: p.title, text: p.detail,
          image: ['ship-broadside', 'port-dusk', 'aerial', 'hero-sea'][i % 4],
          chipLabel: p.proofLabel, chipValue: p.proofValue ?? (p.id === 'why-knowledge' ? `${yearsSinceFounding} years` : 'Details on request'),
        }))}
      />

      <section className="models wrap" aria-labelledby="models-h">
        <h2 id="models-h" className="models__title">Trading and indenting</h2>
        <div className="models__grid">
          {tradeModels.map((m, i) => (
            <Reveal key={m.id} className="model" delay={i * 120}>
              <p className="model__n">0{i + 1}</p>
              <h3>{m.title}</h3>
              <p>{m.summary}</p>
              <ul className="ticks">{m.points.map((p) => <li key={p}><Icon name="check" size={16} />{p}</li>)}</ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pending-band wrap" aria-labelledby="lead-h">
        <div>
          <Eyebrow>{lead.eyebrow}</Eyebrow>
          <h2 id="lead-h">{lead.title}</h2>
        </div>
        <div>
          <p>{lead.lead}</p>
          <Link className="tlink" to={lead.cta!.href}><span>{lead.cta!.label}</span><Icon name="arrow-right" size={16} /></Link>
        </div>
      </section>

      <SplitCta title={cta.title} lead={cta.lead} cta={cta.cta!} secondary={cta.secondaryCta} image="mat-textile" />
    </>
  );
}
