// Browser QA sweep: every route × every target width. Reports console errors, failed requests,
// horizontal overflow, missing <h1>, broken internal links and images; optionally saves screenshots.
// Usage: npm run build && npm run preview   (in another terminal)
//        node scripts/qa.mjs [baseUrl=http://localhost:4176] [--shots] [--widths=390,1440] [--routes=/,/about]
import { mkdir } from 'node:fs/promises';

const args = process.argv.slice(2);
const base = (args.find((a) => a.startsWith('http')) || 'http://localhost:4176').replace(/\/$/, '');
const shots = args.includes('--shots');
const full = args.includes('--full');
const widthsArg = args.find((a) => a.startsWith('--widths='));
const routesArg = args.find((a) => a.startsWith('--routes='));
const WIDTHS = widthsArg ? widthsArg.slice(9).split(',').map(Number) : [320, 375, 390, 430, 768, 1024, 1440, 1920];
const ROUTES = routesArg ? routesArg.slice(9).split(',') : [
  '/', '/about', '/products', '/products/petrochemicals', '/products/textile', '/products/chemicals', '/products/minerals', '/products/agro', '/products/packaging',
  '/products/petrochemicals/pta', '/products/textile/cotton-yarn', '/products/textile/pet-chips', '/industries', '/industries/synthetic-fibres', '/industries/lubricants',
  '/global-network', '/how-we-work', '/insights', '/careers', '/contact', '/request-quote', '/request-quote?product=meg', '/privacy', '/terms', '/cookies',
  '/insights/anything', '/careers/anything', '/products/nope', '/products/textile/nope', '/does-not-exist',
];

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
if (shots) await mkdir('qa-shots', { recursive: true });
const problems = [];
const seenLinks = new Set();
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 720 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' });
  for (const r of ROUTES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('requestfailed', (q) => errs.push(`request failed ${q.url()}`));
    page.on('response', (res) => { if (res.status() >= 400 && !res.url().endsWith('/favicon.ico')) errs.push(`${res.status()} ${res.url()}`); });
    await page.goto(base + r, { waitUntil: 'networkidle' });
    // scroll through so lazy images and reveals run
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((s) => setTimeout(s, 40)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => {
      const doc = document.documentElement;
      const over = doc.scrollWidth - doc.clientWidth;
      const wide = [...document.querySelectorAll('body *')].filter((el) => { const b = el.getBoundingClientRect(); return b.right > doc.clientWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.marquee, .rail__list, .matrix__scroll, .orbit, .ftr__mark, .pd__mark, .nextband'); }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
      const h1 = document.querySelectorAll('h1').length;
      const brokenImgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map((i) => i.src);
      const links = [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href'));
      return { over, wide, h1, brokenImgs, links, title: document.title };
    });
    info.links.forEach((l) => seenLinks.add(l.split('#')[0]));
    const p = [];
    if (errs.length) p.push(`console: ${errs.slice(0, 3).join(' | ')}`);
    if (info.over > 0) p.push(`horizontal overflow ${info.over}px ${info.wide.join(', ')}`);
    if (info.h1 !== 1) p.push(`${info.h1} h1 elements`);
    if (info.brokenImgs.length) p.push(`broken images ${info.brokenImgs.join(', ')}`);
    if (p.length) problems.push(`[${w}] ${r}: ${p.join(' ; ')}`);
    if (shots) await page.screenshot({ path: `qa-shots/${w}${r.replace(/[/?=]/g, '_') || '_home'}.png`, fullPage: full });
    await page.close();
  }
  await ctx.close();
  console.log(`width ${w}: done`);
}
// internal link check (once, at desktop width)
const ctx = await browser.newContext();
const page = await ctx.newPage();
const dead = [];
for (const l of [...seenLinks].sort()) {
  await page.goto(base + l, { waitUntil: 'networkidle' });
  const nf = await page.evaluate(() => document.title.startsWith('Page not found'));
  if (nf) dead.push(l);
}
await browser.close();
console.log(`\nInternal links checked: ${seenLinks.size}; resolving to 404: ${dead.length ? dead.join(', ') : 'none'}`);
console.log(problems.length ? `\n${problems.length} problem(s):\n${problems.join('\n')}` : '\nNo problems found.');
process.exit(problems.length || dead.length ? 1 : 0);
