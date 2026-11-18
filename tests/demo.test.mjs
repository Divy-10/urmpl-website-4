// Static tests (no browser): content integrity, assets, and demo safety.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');
const json = async (p) => JSON.parse(await read(p));

test('company facts match the verified record', async () => {
  const c = await json('src/data/content/company.json');
  assert.equal(c.legalName, 'United Raw Material Pte. Ltd.');
  assert.equal(c.uen, '200607763E');
  assert.equal(c.phone, '+65 6323 1721');
  assert.equal(c.incorporatedOn, '2006-05-30');
  assert.deepEqual(c.address.lines, ['33 Ubi Avenue 3', '#05-32 Vertex']);
  assert.equal(c.address.postalCode, '408868');
});

test('every image in the manifest exists locally with dimensions and alt text', async () => {
  const m = await json('src/data/images.json');
  for (const [name, e] of Object.entries(m)) {
    assert.ok(e.width > 0 && e.height > 0, `${name} dims`);
    assert.ok(e.alt.length > 10, `${name} alt`);
    for (const [, url] of e.srcset) await stat(new URL(`public${url}`, root));
  }
});

test('every category has a render, and no external image URLs are used', async () => {
  const cats = await json('src/data/content/categories.json');
  const m = await json('src/data/images.json');
  for (const c of cats) assert.ok(m[`mat-${c.slug}`], `render for ${c.slug}`);
  const files = await readdir(new URL('src/', root), { recursive: true });
  for (const f of files.filter((f) => /\.(tsx?|css)$/.test(f))) {
    const s = await read(`src/${f}`);
    assert.ok(!/https?:\/\/[^"'\s]+\.(jpe?g|png|webp|avif)/i.test(s), `${f} references an external image`);
  }
});

test('forms are demo-safe: no network calls, explicit demo messaging', async () => {
  const forms = await read('src/components/forms.tsx');
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|axios/.test(forms), 'no network calls in forms');
  assert.match(forms, /DEMO_MODE = true/);
  assert.match(forms, /nothing was sent/);
  assert.ok(!/received your|has been sent|Thank you for contacting/i.test(forms), 'no fake success copy');
});

test('pending values are never rendered and no invented metrics or testimonials exist', async () => {
  const data = await read('src/data/index.ts');
  assert.match(data, /isPending/);
  const src = (await Promise.all((await readdir(new URL('src/', root), { recursive: true })).filter((f) => f.endsWith('.tsx')).map((f) => read(`src/${f}`)))).join('\n');
  for (const s of ['350+', '30,000', '★', 'testimonial', 'clients served', 'ISO 9001']) assert.ok(!src.includes(s), `found “${s}”`);
});

test('site is excluded from indexing', async () => {
  assert.match(await read('index.html'), /noindex, nofollow/);
  assert.match(await read('public/robots.txt'), /Disallow: \//);
});

test('all original routes are declared', async () => {
  const main = await read('src/main.tsx');
  for (const r of ['about', 'products', 'products/:category', 'products/:category/:slug', 'industries', 'industries/:slug', 'global-network', 'how-we-work', 'insights', 'careers', 'contact', 'request-quote', 'privacy', 'terms', 'cookies', '*'])
    assert.ok(main.includes(`path="${r}"`), `route ${r}`);
});
