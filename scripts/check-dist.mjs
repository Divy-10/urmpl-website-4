// Post-build safety checks for the demo. Fails the build if any check fails.
import { readFile, readdir, copyFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); else console.log('  ✓', msg); };

const html = await readFile(join(dist, 'index.html'), 'utf8');
ok(/<meta name="robots" content="noindex, nofollow/.test(html), 'index.html carries noindex, nofollow');
ok((await readFile(join(dist, 'robots.txt'), 'utf8')).includes('Disallow: /'), 'robots.txt disallows all crawling');

// Every image referenced by the manifest exists in dist.
const manifest = JSON.parse(await readFile(new URL('../src/data/images.json', import.meta.url), 'utf8'));
let missing = 0;
for (const [, m] of Object.entries(manifest)) for (const [, u] of m.srcset) { try { await stat(join(dist, u)); } catch { missing++; console.error('  missing', u); } }
ok(missing === 0, `all ${Object.values(manifest).reduce((n, m) => n + m.srcset.length, 0)} manifest images present in dist`);

// No unconfirmed content, endpoints or secrets leak into the bundle.
const assets = (await readdir(join(dist, 'assets'))).filter((f) => f.endsWith('.js'));
const js = (await Promise.all(assets.map((f) => readFile(join(dist, 'assets', f), 'utf8')))).join('\n');
ok(!/script\.google\.com\/macros/.test(js), 'no live form endpoint (Apps Script URL) in the bundle');
ok(!/VITE_GOOGLE_APPS_SCRIPT_URL|apiKey|secret/i.test(js), 'no endpoint variables or secrets referenced');
ok(!/fetch\(/.test(js.replace(/import\(/g, '')) || !/method:\s*["']POST["']/.test(js), 'no POST requests in the bundle');
for (const s of ['30,000 MT', '350+', 'testimonial']) ok(!js.includes(s), `unconfirmed/invented content “${s}” absent`);

// SPA fallback for static hosts that serve 404.html.
await copyFile(join(dist, 'index.html'), join(dist, '404.html'));
console.log('  ✓ 404.html written (SPA fallback)');

if (fails.length) { console.error('\ncheck-dist failed:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('\ncheck-dist: all checks passed');
