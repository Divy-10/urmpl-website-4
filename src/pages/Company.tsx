import { Link, useSearchParams } from 'react-router';
import { careersThemes, company, enquiryTypes, fullAddress, insightStreams, section, seoFor } from '@/data';
import { Marquee, useMeta } from '@/components/layout';
import { FeatureRow, PhotoHero, SplitCta, Statement, TypeHero } from '@/components/sections';
import { ContactForm, RfqForm, RfqGuidance } from '@/components/forms';
import { CtaPair, Eyebrow, Icon, Reveal } from '@/components/ui';

export function Insights() {
  useMeta('Insights', seoFor('/insights')?.description);
  const hero = section('insights-hero');
  const streams = section('insights-streams');
  const prep = section('insights-preparing');
  return (
    <>
      <TypeHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead} />
      <section className="streams wrap" aria-labelledby="str-h">
        <div className="streams__head"><Eyebrow>{streams.eyebrow}</Eyebrow><h2 id="str-h">{streams.title.replace(/\*/g, '')}</h2><p>{streams.lead}</p></div>
        <ol className="streams__list">
          {insightStreams.map((s, i) => (
            <Reveal as="li" key={s.id} id={`stream-${s.id}`} className="stream" delay={i * 100}>
              <span className="stream__n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3><p>{s.description}</p>
              <span className="stream__state">No articles published yet</span>
            </Reveal>
          ))}
        </ol>
      </section>
      <section className="pending-band wrap" aria-labelledby="ip-h">
        <div><Eyebrow>{prep.eyebrow}</Eyebrow><h2 id="ip-h">{prep.title.replace(/\*/g, '')}</h2></div>
        <div><p>{prep.lead}</p>
          <div className="row-links"><Link className="tlink" to="/products"><span>Product catalogue</span><Icon name="arrow-right" size={16} /></Link><Link className="tlink" to="/industries"><span>Industries</span><Icon name="arrow-right" size={16} /></Link><Link className="tlink" to="/contact"><span>Contact</span><Icon name="arrow-right" size={16} /></Link></div>
        </div>
      </section>
    </>
  );
}

export function Careers() {
  useMeta('Careers', seoFor('/careers')?.description);
  const hero = section('careers-hero');
  const why = section('careers-why');
  const open = section('careers-openings');
  const cta = section('careers-cta');
  return (
    <>
      <PhotoHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead} image="port-dusk" mark="Careers" />
      <Statement eyebrow={why.eyebrow!} title={why.title} />
      <div className="wrap feat-wrap"><FeatureRow items={careersThemes.map((t, i) => ({ id: t.id, icon: (['globe', 'layers', 'repeat', 'pin'] as const)[i % 4] as 'globe', title: t.title, text: t.text }))} /></div>
      <section className="openings wrap" aria-labelledby="op-h">
        <Eyebrow>{open.eyebrow}</Eyebrow>
        <h2 id="op-h" className="openings__title">{open.title}</h2>
        <div className="openings__empty"><p className="openings__zero" aria-hidden="true">00</p><p>No roles are listed at the moment.</p></div>
      </section>
      <SplitCta title={cta.title} lead={cta.lead} cta={cta.cta!} secondary={cta.secondaryCta} image="aerial" />
    </>
  );
}

export function Contact() {
  useMeta('Contact', seoFor('/contact')?.description);
  const [params] = useSearchParams();
  const hero = section('contact-hero');
  const paths = section('contact-paths');
  const form = section('contact-form');
  const office = section('contact-office');
  return (
    <>
      <TypeHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead}>
        <div className="contact-quick">
          <a href={company.phoneHref} className="contact-quick__big"><Icon name="phone" size={22} />{company.phone}</a>
          <p><Icon name="pin" size={16} />{fullAddress}</p>
          <p className="contact-quick__note">Public email addresses are still being confirmed, so none are shown.</p>
        </div>
      </TypeHero>
      <section className="paths wrap" aria-labelledby="paths-h">
        <h2 id="paths-h" className="paths__title">{paths.title}</h2>
        <ul className="paths__grid">
          {enquiryTypes.map((t, i) => (
            <Reveal as="li" key={t.id} delay={i * 60}>
              <Link to={t.action.href} className="path"><span className="path__n">{String(i + 1).padStart(2, '0')}</span><span className="path__t">{t.label}</span><span className="path__d">{t.description}</span><span className="path__a">{t.action.label}<Icon name="arrow-right" size={16} /></span></Link>
            </Reveal>
          ))}
        </ul>
      </section>
      <section className="formsec wrap" id="enquiry-form" aria-labelledby="form-h">
        <div className="formsec__head"><Eyebrow>{form.eyebrow}</Eyebrow><h2 id="form-h">{form.title.replace(/\*/g, '')}</h2><p>{form.lead}</p></div>
        <div className="formsec__body"><ContactForm initialType={params.get('type') ?? 'product'} /></div>
      </section>
      <section className="office tone-ink" aria-labelledby="off-h">
        <div className="wrap office__grid">
          <div><Eyebrow tone="light">{office.eyebrow}</Eyebrow><h2 id="off-h" className="office__title">{office.title.replace(/\*/g, '')}</h2><p className="office__lead">{office.lead}</p></div>
          <dl className="hubband__facts">
            <div><dt>Address</dt><dd>{company.addressLines.map((l) => <span key={l}>{l}<br /></span>)}{company.city} {company.postalCode}</dd></div>
            <div><dt>Telephone</dt><dd><a href={company.phoneHref}>{company.phone}</a></dd></div>
            <div><dt>Company</dt><dd>{company.legalName}<br />UEN {company.uen}</dd></div>
          </dl>
        </div>
        <Marquee text="Singapore" className="office__marquee" tone="faint" />
      </section>
    </>
  );
}

export function RequestQuote() {
  useMeta('Request a Quote', seoFor('/request-quote')?.description);
  const [params] = useSearchParams();
  const hero = section('rfq-hero');
  const form = section('rfq-form');
  return (
    <>
      <TypeHero eyebrow={hero.eyebrow!} title={hero.title} lead={hero.lead} />
      <section className="formsec formsec--rfq wrap" aria-labelledby="rfq-h">
        <div className="formsec__head"><Eyebrow>{form.eyebrow}</Eyebrow><h2 id="rfq-h">{form.title.replace(/\*/g, '')}</h2><RfqGuidance /></div>
        <div className="formsec__body"><RfqForm initialProduct={params.get('product') ?? ''} /></div>
      </section>
    </>
  );
}

export function Legal({ title }: { title: string }) {
  useMeta(title);
  return (
    <>
      <TypeHero eyebrow="Legal" title={title} lead="This policy is being prepared and has not yet been approved by United Raw Material Pte. Ltd., so no text is published here.">
        <p className="thero__meta">For questions in the meantime, contact our Singapore office on <a href={company.phoneHref}>{company.phone}</a>.</p>
      </TypeHero>
      <section className="pending-band wrap"><div><Eyebrow>Holding page</Eyebrow><h2>Approved text will replace this page.</h2></div><div><p>This concept demo collects no personal data and sets no cookies of its own.</p><CtaPair to="/" tone="ink">Back to home</CtaPair></div></section>
    </>
  );
}
