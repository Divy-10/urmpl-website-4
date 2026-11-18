// PNG masters (art/out) → responsive WebP files (public/images) + src/data/images.json manifest.
// Usage: node art/encode.mjs   (needs `sharp`; set SHARP_MODULE to use a global install)
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sharp = (await import(process.env.SHARP_MODULE || 'sharp')).default;
const outDir = join(here, '..', 'public', 'images');
await mkdir(outDir, { recursive: true });

// Alt text describes what the render shows. Every image is an original 3D render made in code.
const ALT = {
  'hero-sea': 'Rendered container ship sailing away across a grey, hazy sea, leaving a white wake',
  'hero-sea-portrait': 'Rendered container ship seen from astern on an overcast sea',
  'ship-broadside': 'Rendered container ship on the horizon under an overcast sky',
  'ship-red': 'Rendered red-hulled container ship at sea, seen from the bow quarter',
  aerial: 'Rendered top-down view of a container ship with colourful containers on deep blue water',
  'port-dusk': 'Rendered container terminal at dusk with quay cranes and a ship alongside',
  'mat-textile': 'Rendered rows of yarn cones in ecru, white, indigo and orange',
  'mat-petrochemicals': 'Rendered heap of white polymer pellets with a steel scoop',
  'mat-chemicals': 'Rendered rows of blue, white and grey steel drums on pallets',
  'mat-minerals': 'Rendered heap of grey and ochre mineral rock',
  'mat-agro': 'Rendered stack of timber logs showing their cut ends',
  'mat-packaging': 'Rendered kraft and white paper reels standing in a warehouse',
};
const WIDTHS = { wide: [2400, 1440, 800], square: [1400, 800, 480], portrait: [1080, 640] };

const manifest = {};
for (const f of (await readdir(join(here, 'out'))).filter((f) => f.endsWith('.png'))) {
  const name = f.replace(/\.png$/, '');
  const src = sharp(join(here, 'out', f));
  const { width, height } = await src.metadata();
  const kind = width === height ? 'square' : width > height ? 'wide' : 'portrait';
  const files = [];
  for (const w of WIDTHS[kind].filter((w) => w <= width)) {
    const file = `${name}-${w}.webp`;
    await sharp(join(here, 'out', f)).resize({ width: w }).webp({ quality: w > 1500 ? 72 : 76, effort: 6 }).toFile(join(outDir, file));
    files.push({ w, file, kb: Math.round((await stat(join(outDir, file))).size / 1024) });
  }
  manifest[name] = { width, height, alt: ALT[name] || '', srcset: files.map(({ w, file }) => [w, `/images/${file}`]) };
  console.log(name, files.map((x) => `${x.w}w ${x.kb}KB`).join(' · '));
}
await writeFile(join(here, '..', 'src', 'data', 'images.json'), JSON.stringify(manifest, null, 2));
