import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { company, enquiryTypes, products, rfqGuidance, rfqTimelines } from '@/data';
import { Icon, cx } from './ui';

/**
 * Demo-safe forms. They validate input fully, but there is no endpoint and no network
 * request. On submit they say plainly that nothing was sent. There is no fake "message
 * received" screen.
 */
export const DEMO_MODE = true as const;

type Errors = Record<string, string>;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function Field({ id, label, required, error, hint, children }: { id: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className={cx('field', error && 'has-error')}>
      <label htmlFor={id} className="field__label">{label}{required && <span className="field__req" aria-hidden="true"> *</span>}</label>
      {children}
      {hint && !error && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field__err" id={`${id}-err`}><Icon name="info" size={14} />{error}</p>}
    </div>
  );
}
const describe = (id: string, err?: string, hint?: string) => (err ? `${id}-err` : hint ? `${id}-hint` : undefined);

function ErrorSummary({ errors, labels }: { errors: Errors; labels: Record<string, string> }) {
  const keys = Object.keys(errors);
  if (!keys.length) return null;
  return (
    <div className="form-errors" role="alert" tabIndex={-1}>
      <p><strong>Please check {keys.length === 1 ? 'one field' : `${keys.length} fields`}:</strong></p>
      <ul>{keys.map((k) => <li key={k}><a href={`#${k}`}>{labels[k]}: {errors[k]}</a></li>)}</ul>
    </div>
  );
}

function DemoResult({ onReset, summary }: { onReset: () => void; summary: Array<[string, string]> }) {
  return (
    <div className="demo-result" role="status" tabIndex={-1}>
      <p className="demo-result__tag"><Icon name="info" size={16} />Demo mode — not sent</p>
      <h3>Your entries passed validation, but nothing was sent.</h3>
      <p>This concept demo has no enquiry endpoint, so URMPL has <strong>not</strong> received this. To reach the Singapore office today, call <a href={company.phoneHref}>{company.phone}</a>.</p>
      <dl className="demo-result__dl">{summary.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <button type="button" className="pill pill--ghost" onClick={onReset}>Edit the form</button>
    </div>
  );
}

export function DemoBadge() {
  return <p className="demo-badge"><span aria-hidden="true" />Demo mode · this form does not send</p>;
}

// ---------- contact ----------
export function ContactForm({ initialType = 'product' }: { initialType?: string }) {
  const uid = useId();
  const types = enquiryTypes.filter((t) => t.inForm);
  const [v, setV] = useState({ type: types.some((t) => t.id === initialType) ? initialType : 'product', name: '', company: '', email: '', phone: '', country: '', message: '', consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const labels: Record<string, string> = { name: 'Full name', email: 'Email', message: 'Message', consent: 'Consent' };
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (v.name.trim().length < 2) er.name = 'Enter your name';
    if (!emailOk(v.email)) er.email = 'Enter a valid email address, like name@company.com';
    if (v.message.trim().length < 10) er.message = 'Tell us a little more (10 characters or more)';
    if (!v.consent) er.consent = 'Please confirm before sending';
    setErrors(er);
    if (Object.keys(er).length) { requestAnimationFrame(() => box.current?.querySelector<HTMLElement>('.form-errors')?.focus()); return; }
    setDone(true); requestAnimationFrame(() => box.current?.querySelector<HTMLElement>('.demo-result')?.focus());
  };
  if (done) return <div ref={box}><DemoResult onReset={() => setDone(false)} summary={[['Enquiry', types.find((t) => t.id === v.type)?.label ?? ''], ['Name', v.name], ['Company', v.company], ['Email', v.email], ['Country', v.country]]} /></div>;
  const f = (k: string) => `${uid}-${k}`;
  return (
    <div ref={box}>
      <DemoBadge />
      <form className="form" noValidate onSubmit={submit}>
        <ErrorSummary errors={Object.fromEntries(Object.entries(errors).map(([k, m]) => [f(k), m]))} labels={Object.fromEntries(Object.entries(labels).map(([k, l]) => [f(k), l]))} />
        <fieldset className="form__types">
          <legend className="field__label">What is this about?</legend>
          <div className="segs">
            {types.map((t) => (
              <label key={t.id} className={cx('seg-opt', v.type === t.id && 'is-on')}>
                <input type="radio" name="type" value={t.id} checked={v.type === t.id} onChange={set('type')} />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="form__grid">
          <Field id={f('name')} label="Full name" required error={errors.name}><input id={f('name')} value={v.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={describe(f('name'), errors.name)} /></Field>
          <Field id={f('company')} label="Company"><input id={f('company')} value={v.company} onChange={set('company')} autoComplete="organization" /></Field>
          <Field id={f('email')} label="Email" required error={errors.email}><input id={f('email')} type="email" value={v.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={describe(f('email'), errors.email)} /></Field>
          <Field id={f('phone')} label="Phone" hint="Include the country code"><input id={f('phone')} type="tel" value={v.phone} onChange={set('phone')} autoComplete="tel" aria-describedby={`${f('phone')}-hint`} /></Field>
          <Field id={f('country')} label="Country"><input id={f('country')} value={v.country} onChange={set('country')} autoComplete="country-name" /></Field>
        </div>
        <Field id={f('message')} label="Message" required error={errors.message}><textarea id={f('message')} rows={5} value={v.message} onChange={set('message')} aria-invalid={!!errors.message} aria-describedby={describe(f('message'), errors.message)} /></Field>
        <div className={cx('check', errors.consent && 'has-error')}>
          <input id={f('consent')} type="checkbox" checked={v.consent} onChange={set('consent')} aria-invalid={!!errors.consent} aria-describedby={describe(f('consent'), errors.consent)} />
          <label htmlFor={f('consent')}>I understand my details would be used to respond to this enquiry.</label>
          {errors.consent && <p className="field__err" id={`${f('consent')}-err`}><Icon name="info" size={14} />{errors.consent}</p>}
        </div>
        <div className="form__submit">
          <button type="submit" className="pill pill--orange">Check &amp; preview<Icon name="arrow-right" size={16} /></button>
          <p className="form__fine">Demo mode: nothing is sent from this page.</p>
        </div>
      </form>
    </div>
  );
}

// ---------- request a quote (two steps) ----------
export function RfqForm({ initialProduct = '' }: { initialProduct?: string }) {
  const uid = useId();
  const f = (k: string) => `${uid}-${k}`;
  const known = products.find((p) => p.slug === initialProduct);
  const [step, setStep] = useState<1 | 2>(1);
  const [v, setV] = useState({ product: known ? known.name : initialProduct, grade: '', qty: '', unit: 'MT', destination: '', timing: '', incoterm: '', notes: '', name: '', company: '', email: '', phone: '', consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const names = useMemo(() => products.map((p) => p.name), []);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
  const labels: Record<string, string> = { product: 'Product', qty: 'Quantity', destination: 'Destination', timing: 'Timing', name: 'Full name', email: 'Email', consent: 'Consent' };
  const focusErr = () => requestAnimationFrame(() => box.current?.querySelector<HTMLElement>('.form-errors')?.focus());
  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (v.product.trim().length < 2) er.product = 'Name the product or material';
    if (!/^\d+([.,]\d+)?$/.test(v.qty.trim())) er.qty = 'Enter a number, for example 500';
    if (v.destination.trim().length < 2) er.destination = 'Enter a destination port, city or country';
    if (!v.timing) er.timing = 'Choose when you need it';
    setErrors(er);
    if (Object.keys(er).length) return focusErr();
    setStep(2); requestAnimationFrame(() => document.getElementById(f('name'))?.focus());
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (v.name.trim().length < 2) er.name = 'Enter your name';
    if (!emailOk(v.email)) er.email = 'Enter a valid email address, like name@company.com';
    if (!v.consent) er.consent = 'Please confirm before sending';
    setErrors(er);
    if (Object.keys(er).length) return focusErr();
    setDone(true); requestAnimationFrame(() => box.current?.querySelector<HTMLElement>('.demo-result')?.focus());
  };
  const errs = Object.fromEntries(Object.entries(errors).map(([k, m]) => [f(k), m]));
  const labs = Object.fromEntries(Object.entries(labels).map(([k, l]) => [f(k), l]));
  if (done) return <div ref={box}><DemoResult onReset={() => { setDone(false); setStep(1); }} summary={[['Product', v.product], ['Grade', v.grade], ['Quantity', v.qty && `${v.qty} ${v.unit}`], ['Destination', v.destination], ['Timing', rfqTimelines.find((t) => t.value === v.timing)?.label ?? ''], ['Name', v.name], ['Email', v.email]]} /></div>;
  return (
    <div ref={box} className="rfq">
      <DemoBadge />
      <ol className="rfq__steps" aria-label="Progress">
        <li className={cx(step === 1 && 'is-on')} aria-current={step === 1 ? 'step' : undefined}><span>1</span>Requirement</li>
        <li className={cx(step === 2 && 'is-on')} aria-current={step === 2 ? 'step' : undefined}><span>2</span>Your details</li>
      </ol>
      {step === 1 ? (
        <form className="form" noValidate onSubmit={next}>
          <ErrorSummary errors={errs} labels={labs} />
          <Field id={f('product')} label="Product or material" required error={errors.product} hint="Pick from the list or type your own">
            <input id={f('product')} list={f('plist')} value={v.product} onChange={set('product')} aria-invalid={!!errors.product} aria-describedby={describe(f('product'), errors.product, 'h')} />
            <datalist id={f('plist')}>{names.map((n) => <option key={n} value={n} />)}</datalist>
          </Field>
          <div className="form__grid">
            <Field id={f('grade')} label="Grade or specification"><input id={f('grade')} value={v.grade} onChange={set('grade')} /></Field>
            <Field id={f('qty')} label="Quantity" required error={errors.qty}>
              <div className="qty">
                <input id={f('qty')} inputMode="decimal" value={v.qty} onChange={set('qty')} aria-invalid={!!errors.qty} aria-describedby={describe(f('qty'), errors.qty)} />
                <select aria-label="Unit" value={v.unit} onChange={set('unit')}><option value="MT">MT</option><option value="containers">containers</option></select>
              </div>
            </Field>
            <Field id={f('destination')} label="Destination" required error={errors.destination}><input id={f('destination')} value={v.destination} onChange={set('destination')} aria-invalid={!!errors.destination} aria-describedby={describe(f('destination'), errors.destination)} /></Field>
            <Field id={f('timing')} label="When do you need it?" required error={errors.timing}>
              <select id={f('timing')} value={v.timing} onChange={set('timing')} aria-invalid={!!errors.timing} aria-describedby={describe(f('timing'), errors.timing)}>
                <option value="">Choose…</option>{rfqTimelines.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field id={f('incoterm')} label="Incoterm (if known)"><input id={f('incoterm')} value={v.incoterm} onChange={set('incoterm')} placeholder="e.g. CFR, CIF, FOB" /></Field>
          </div>
          <Field id={f('notes')} label="Packing, documents or other notes"><textarea id={f('notes')} rows={4} value={v.notes} onChange={set('notes')} /></Field>
          <div className="form__submit"><button type="submit" className="pill pill--orange">Continue<Icon name="arrow-right" size={16} /></button></div>
        </form>
      ) : (
        <form className="form" noValidate onSubmit={submit}>
          <ErrorSummary errors={errs} labels={labs} />
          <div className="form__grid">
            <Field id={f('name')} label="Full name" required error={errors.name}><input id={f('name')} value={v.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={describe(f('name'), errors.name)} /></Field>
            <Field id={f('company')} label="Company"><input id={f('company')} value={v.company} onChange={set('company')} autoComplete="organization" /></Field>
            <Field id={f('email')} label="Email" required error={errors.email}><input id={f('email')} type="email" value={v.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={describe(f('email'), errors.email)} /></Field>
            <Field id={f('phone')} label="Phone"><input id={f('phone')} type="tel" value={v.phone} onChange={set('phone')} autoComplete="tel" /></Field>
          </div>
          <div className={cx('check', errors.consent && 'has-error')}>
            <input id={f('consent')} type="checkbox" checked={v.consent} onChange={set('consent')} aria-invalid={!!errors.consent} aria-describedby={describe(f('consent'), errors.consent)} />
            <label htmlFor={f('consent')}>I understand my details would be used to respond to this request.</label>
            {errors.consent && <p className="field__err" id={`${f('consent')}-err`}><Icon name="info" size={14} />{errors.consent}</p>}
          </div>
          <div className="form__submit">
            <button type="button" className="pill pill--ghost" onClick={() => { setErrors({}); setStep(1); }}><Icon name="arrow-left" size={16} />Back</button>
            <button type="submit" className="pill pill--orange">Check &amp; preview<Icon name="arrow-right" size={16} /></button>
          </div>
        </form>
      )}
    </div>
  );
}

export function RfqGuidance() {
  return (
    <aside className="guide">
      <h2 className="guide__h">{rfqGuidance.title}</h2>
      <ul className="ticks">{rfqGuidance.items.map((i) => <li key={i}><Icon name="check" size={16} />{i}</li>)}</ul>
      <p className="guide__alt">Prefer to talk? <a href={company.phoneHref}>{company.phone}</a></p>
    </aside>
  );
}
