import { Link } from 'react-router';
import { categories } from '@/data';
import { Marquee, useMeta } from '@/components/layout';
import { CtaPair, Eyebrow, Img } from '@/components/ui';

export default function NotFound() {
  useMeta('Page not found');
  return (
    <section className="nf">
      <div className="nf__bg"><Img name="hero-sea" sizes="100vw" alt="" /></div>
      <div className="nf__shade" aria-hidden="true" />
      <div className="nf__inner wrap">
        <Eyebrow tone="light" className="enter">Error 404</Eyebrow>
        <h1 className="nf__title enter" style={{ ['--d' as string]: '120ms' }}>Off the trade lane.</h1>
        <p className="nf__lead enter" style={{ ['--d' as string]: '220ms' }}>The page you were looking for isn’t here. It may have moved, or it hasn’t been published yet.</p>
        <div className="nf__actions enter" style={{ ['--d' as string]: '320ms' }}>
          <CtaPair to="/">Back to home</CtaPair>
          <Link to="/products" className="hero__sec">Browse products</Link>
        </div>
        <ul className="nf__links enter" style={{ ['--d' as string]: '420ms' }}>{categories.slice(0, 4).map((c) => <li key={c.id}><Link to={`/products/${c.slug}`}>{c.name}</Link></li>)}</ul>
      </div>
      <Marquee text="Page not found" className="nf__marquee" />
    </section>
  );
}
