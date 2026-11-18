# Demo 04 — Image prompt pack

**No AI image-generation tool was available when this demo was built.** Every image in `public/images/` is an original 3D render made in code with three.js (`art/scenes.js`), then graded with a vignette and film grain. None of them is a photograph or an AI image.

If approved photography or AI-generated images are wanted later, use the prompts below. Export at the master size listed, then run `node art/encode.mjs` with the new PNGs in `art/out/` under the **same names**. That regenerates the WebP files and the manifest, so no code changes are needed.

**Shared art direction.** These are taken from the reference video:

- Cinematic, slightly desaturated, cool blue-grey sea light with warm material accents.
- Overcast or golden-hour skies.
- Generous negative space where copy sits.
- No text, logos, watermarks, flags, people's faces or identifiable company branding.
- Do not depict URMPL offices, staff, owned vessels or facilities.

| File (`art/out/…png`) | Master size | Used on | Prompt |
|---|---|---|---|
| `hero-sea` | 2400×1350 | Home hero, 404 | Elevated view from astern of a large container ship sailing away across a calm grey-blue sea, long white wake trailing toward the camera, hazy overcast horizon, muted container colours, cinematic and desaturated, empty sky in the upper third, no logos or text |
| `hero-sea-portrait` | 1080×1500 | Home hero (≤719 px) | Same scene in portrait, ship in the lower-middle third, wake running to the bottom edge, large quiet sky |
| `ship-broadside` | 2400×1200 | Finder band, About hero, Network CTA | Fully laden container ship broadside on the horizon in the left third, flat calm sea, soft overcast light, wide empty centre for a UI card, no branding |
| `ship-red` | 1600×1200 | Split CTAs | Red-hulled container ship at sea seen from the bow quarter, bright soft daylight, gentle swell, colourful containers, no logos |
| `aerial` | 1600×1600 | How We Work hero, sliders | Top-down drone view of a container ship on deep teal-blue water, vivid multicoloured containers, white wake, minimal composition |
| `port-dusk` | 2400×1350 | Global Network hero, Careers hero | Container terminal at dusk, quay cranes silhouetted against an orange-to-navy sky, ship alongside, yard lights starting to glow, no signage |
| `mat-textile` | 1600×1600 | Textile vertical | Rows of yarn cones (ecru, white, indigo, one orange) on a creel, dark teal studio backdrop, warm key light, shallow depth of field |
| `mat-petrochemicals` | 1600×1600 | Petrochemicals vertical | Heap of white polymer pellets (PET/PTA-like) with a steel scoop, dark studio, crisp rim light, macro detail |
| `mat-chemicals` | 1600×1600 | Chemicals vertical | Rows of blue, white and grey steel drums on timber pallets in a dim warehouse, one orange drum, warm key light, no labels |
| `mat-minerals` | 1600×1600 | Minerals vertical | Mound of grey and ochre crushed mineral ore on a dark floor, raking side light, editorial still life |
| `mat-agro` | 1600×1600 | Agro & Forest vertical | Stacked timber logs showing cut ends with growth rings, dark backdrop, warm side light |
| `mat-packaging` | 1600×1600 | Paper & Packaging vertical | Kraft and white paper reels standing in a warehouse, one reel lying in the foreground, soft directional light |

**Placement and cropping notes**

- The hero and finder images are cropped with `object-fit: cover`, so keep the subject inside the central 60%. On the finder, keep the ship in the left 40% because the glass card sits in the centre.
- Material images are shown square, 4:5 and 4:3, so keep the subject centred.
- Keep each master at least 1600 px wide. The encoder produces 2400/1440/800-wide WebP for wide images and 1400/800/480-wide WebP for square ones.
