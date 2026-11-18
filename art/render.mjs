// Renders every scene in scenes.js with headless Chromium (WebGL via SwiftShader) and writes
// PNG masters to art/out/. Then `node art/encode.mjs` produces the WebP files in public/images/.
// Usage: node art/render.mjs [sceneName ...]
// Needs: npm i (in art/) for three; a Playwright install (CHROMIUM_PATH optional).
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

export const JOBS = [
  { name: 'hero-sea', scene: 'hero-sea', w: 2400, h: 1350 },
  { name: 'hero-sea-portrait', scene: 'hero-sea', w: 1080, h: 1500 },
  { name: 'ship-broadside', scene: 'ship-broadside', w: 2400, h: 1200 },
  { name: 'ship-red', scene: 'ship-red', w: 1600, h: 1200 },
  { name: 'aerial', scene: 'aerial', w: 1600, h: 1600 },
  { name: 'port-dusk', scene: 'port-dusk', w: 2400, h: 1350 },
  { name: 'mat-textile', scene: 'textile', w: 1600, h: 1600 },
  { name: 'mat-petrochemicals', scene: 'petrochemicals', w: 1600, h: 1600 },
  { name: 'mat-chemicals', scene: 'chemicals', w: 1600, h: 1600 },
  { name: 'mat-minerals', scene: 'minerals', w: 1600, h: 1600 },
  { name: 'mat-agro', scene: 'agro', w: 1600, h: 1600 },
  { name: 'mat-packaging', scene: 'packaging', w: 1600, h: 1600 },
];

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    const p = join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const only = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
await mkdir(join(here, 'out'), { recursive: true });
for (const job of JOBS) {
  if (only.length && !only.includes(job.name)) continue;
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.on('console', (m) => { if (m.type() === 'error') console.error(`[${job.name}]`, m.text().slice(0, 400)); });
  page.on('pageerror', (e) => console.error(`[${job.name}] pageerror`, e.message));
  const t0 = Date.now();
  const q = new URLSearchParams({ scene: job.scene, w: job.w, h: job.h, ...(job.extra || {}) });
  await page.goto(`http://localhost:${port}/render.html?${q}`, { waitUntil: 'commit', timeout: 600_000 });
  await page.waitForFunction(() => window.__done === true, null, { timeout: 600_000 });
  const data = await page.evaluate(() => document.getElementById('out').toDataURL('image/png'));
  await writeFile(join(here, 'out', `${job.name}.png`), Buffer.from(data.split(',')[1], 'base64'));
  console.log(`${job.name}  ${job.w}x${job.h}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await page.close();
}
await browser.close();
server.close();
