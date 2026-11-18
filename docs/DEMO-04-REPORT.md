# URMPL Website Concept 04 — "Wordmark & Wake" · Report

**Location:** `D:\urmpl-websites\urmpl-4`
**Status:** presentation demo. It is not indexed, has never been deployed, and its forms never send.
**Stack:** React 19 · Vite 7 · TypeScript 5.9 · React Router 7 · plain CSS (tokens + layered files) · self-hosted fonts (Unbounded, Inter Tight). There is no motion library and no runtime 3D.
**Read-only sources:** `D:\urmpl` was used for content and routes. Demos 01–03 were checked only through their README files, Demo 03's report and their `package.json` files. Nothing in any of those folders was modified.

---

## 1. Video reference analysis

**Source:** a 27.07 s MP4 at 480 × 656 px and 60 fps. It shows the "SHIPFLOW" logistics template scrolling inside a tablet frame.
**Method:** frames were extracted with ffmpeg. A 1 fps contact sheet covered the whole clip, and roughly 30 full-resolution stills were taken around each transition. Hover states and a mobile layout are not shown in the video, so nothing was assumed about them.
The frame-by-frame notes are in `docs/01-REFERENCE-ANALYSIS.md`. In summary:

| # | Moment in the video | What happens |
|---|---|---|
| 1 | 0–3 s, hero | A full-bleed ship-from-astern photo fades in alone. A **segmented pill nav** follows, its items staggering in from left to right, with an orange "Get a Quote" pill and a detached white ↗ circle. Small copy and a CTA sit bottom-left. A **giant ultra-wide wordmark scrolls continuously** along the bottom edge. |
| 2 | 5–8 s | The wordmark band hands over to a white section. An orange-dot eyebrow sits on the left and a **statement rises line by line** on the right, followed by four light-grey feature cards. |
| 3 | 9.5–11 s | The services section arrives **blurred, then sharpens**. A **curved carousel** shows tiles on the inside of a cylinder: the centre tile is flat, its neighbours swing in with their outer edges taller, and slivers appear at the edges. It auto-advances, and a caption with "Learn More" follows the active tile. |
| 4 | 12–13 s | A navy band with dotted-map textures in the corners. A centred two-line heading has a lighter second line. A **horizontal rule draws across, vertical drops descend**, and three orange numbered nodes sit at staggered heights. |
| 5 | 16–17 s | A full-bleed ship photo with mild parallax and a **frosted-glass card** centred over it, holding an input and an orange button ("Track your shipment"). |
| 6 | 18–21 s | A **paged slider**: heading, ‹ › arrows (the active one orange), dots, and a photo card with a white caption chip. |
| 7 | 22–26 s | A **split CTA**: a rounded photo tile beside a rounded navy card with the wordmark in orange. Then the footer, ending in a **huge pale wordmark** cropped by the page edge. |

## 2. Key visual and motion characteristics carried into Demo 04

| Characteristic | Reference | Demo 04 implementation |
|---|---|---|
| Palette | Ink-navy, white/mist, one orange | `--ink #0E1C2A`, `--mist #F3F4F5`, `--orange #F26B1D`. Text on orange is ink (6.3:1), and small orange text on white uses `#B84A0C` (5.1:1). |
| Display type | Ultra-wide geometric wordmark | **Unbounded** (variable), used only for wordmarks, product codes and big numerals |
| Text type | Neutral neo-grotesk, medium headlines | **Inter Tight** (variable), weight 500 headlines, tight tracking |
| Header | Segmented pill nav + orange pill + ↗ circle | `Header` + `SegmentedNav`. A **white indicator slides** to the hovered or focused item and returns to the active route. Items stagger in on load. |
| Kinetic wordmark | Continuous horizontal marquee in the hero | `Marquee` reads `UNITED RAW MATERIAL — URMPL —`. It is CSS-only (`translate3d`) and stops with reduced motion. It is reused at a smaller size on every photo hero, on the 404 page, in the menu sheet and as a "next vertical" link. |
| Statement reveal | Lines rising in | `WordRise`: each word rises from a mask with a 28 ms stagger. One shared IntersectionObserver drives all reveals. |
| Blur-to-focus | Section enters blurred | `Reveal variant="blur"` (14 px blur → 0) on the verticals header and carousel, the finder card and the vertical tiles |
| Curved carousel | Inside-of-a-cylinder coverflow | `OrbitCarousel`: 3D transforms per tile (`translate3d` + `rotateY`), outer edges toward the viewer, ±2 slivers, auto-advance |
| Branching process | Rule → drops → staggered nodes | `ProcessBranch`: the rule scales in over 1.3 s, the drops follow, then the nodes pop in with a slight overshoot. Below 960 px it becomes a vertical trunk. |
| Glass card over photo | Tracking input | `Finder`: a real product search with a combobox, keyboard support and live results |
| Paged slider | Testimonial slider | `PagedSlider` shows verified content only (see §3) |
| Split CTA + wordmark footer | Photo tile + navy card, giant wordmark | `SplitCta` plus a `Footer` whose wordmark **rises out of a mask** as it scrolls into view |
| Photo parallax | Mild | `useParallax`: one passive scroll listener and one rAF loop, active only while the layer is on screen, ±40–70 px |

## 3. How it was adapted for URMPL

URMPL is a **trading and indenting house**, not a freight forwarder, so the reference's logistics content was translated rather than copied:

- **Freight services → trading verticals.** The cylinder carousel carries URMPL's six published verticals. Each tile states honestly whether it is a "Published range" (textile, petrochemicals) or "Range in preparation".
- **"Track your shipment" → "Find a material".** URMPL publishes no tracking service, so a fake tracker would mislead. The glass card searches the 16 published products by name, trade code (PTA, MEG…) or alias.
- **Testimonial slider → trading vs indenting** on Home and the four "Why URMPL" pillars on About. **No testimonials, people, star ratings or logos are invented.** The reference's caption chip ("James R ★★★★★") became a factual chip such as "Incorporated · 30 May 2006", "Contracting from · Singapore" or "Years trading · 20".
- **Process "1-2-3" → URMPL's five verified stages:** Sourcing, Quality & Verification, Commercial Coordination, Logistics, Delivery.
- **Statement + 4 cards → "Who we are" + the four pillars.** Their proof lines show only confirmed values: "Incorporated in Singapore · 2006" and "Years trading · 20". The pending values (producer relationships, monthly volume) are left out.
- **Newsletter in the footer → "Request a Quote".** URMPL has no newsletter.
- **Hero meta:** UEN, coordinates and business model. All three come from the original project's `company.json`.
- **Never shown:** monthly volume (old site "30,000 MT"), client counts ("350+"), emails, leadership, principal names and spec tables, because the original project marks them all as pending. A build check fails if any of these strings reach the bundle.

## 4. Differences from Demos 01–03

| | Demo 01 | Demo 02 | Demo 03 | **Demo 04** |
|---|---|---|---|---|
| Source | Reference images | Reference images | 6 screenshots ("Neoteric") | **Video walkthrough ("SHIPFLOW")** |
| Mood | Dark photographic maritime | Light SaaS trade desk | White studio sheet on grey | **Cinematic grey-sea renders + ink/orange editorial** |
| Palette | Navy + sky blue | Evergreen, jade, amber | Near-black + cobalt | **Ink-navy + single orange** |
| Type | Archivo expanded caps + Inter | Plus Jakarta + IBM Plex Mono | Geist only | **Unbounded wordmarks + Inter Tight** |
| Header | Overlay on dark hero | Single floating glass bar + mega-menu | In-sheet header + bottom dock | **Brand chip + segmented pill with sliding indicator + detached quote circle** |
| Hero | Full-bleed parallax port | Dotted map + Trade Ticket | Crane hook with vertical loads | **Ship-from-astern render with a running wordmark marquee as the headline band** |
| Signature | Container-loading voyage | "Molecule to Mill" horizontal chain | "The Lift" pendulum | **Inside-the-cylinder vertical carousel + branching process line** |
| Product display | Rows | Requirement builder | Specimen rail | **Giant trade-code cards (PTA, MEG…) and a code-first product page** |
| Network | Interactive trade map | Dotted world map | Draggable engraved globe | **Hub-radial schematic (bearings from Singapore, selectable regions)** |
| Imagery | Code-drawn SVG illustrations | Code-drawn illustrations | 3D studio renders on white | **3D cinematic environment renders (sea, sky, wake shader) + dark-studio material still lifes** |
| Footer | Standard | Standard | Night slab | **Pale giant wordmark that rises from a mask** |

No code, CSS, assets or animation logic was copied from the earlier demos. Demo 01's container-loading animation is not used.

## 5. Pages implemented (all original routes)

| Route | Layout |
|---|---|
| `/` | Hero + marquee → statement + 4 pillars → **cylinder carousel** → **process branch** → featured products code rail → **glass finder** → paged slider (trading/indenting) → industries type-index → split CTA |
| `/about` | Photo hero ("Since 2006" marquee) → who we are → company register (6 verified facts) → navy story timeline (2006, Today, with sources) → vision/mission → "Why URMPL" paged slider → trading vs indenting → leadership holding band → split CTA |
| `/products` | Type hero → 6 vertical render tiles → catalogue with search (URL-synced `?q=`), vertical filter chips and the 16-product list → split CTA |
| `/products/:category` ×6 | Photo hero with the vertical render → product list, or a "range in preparation" statement → industries served → next-vertical marquee link |
| `/products/:category/:slug` ×16 (+ PET cross-listed under textile) | Giant trade-code mark → name, description, aliases, quote CTA (prefills the RFQ) → "specifications on request" band with the 5-item checklist → industries → related → finder |
| `/industries` | Type hero → index list with a **sticky render preview that follows hover/focus** → industries × verticals matrix → split CTA |
| `/industries/:slug` ×9 | Type hero with image → supplying verticals → published products for that industry (or an honest empty state) → pillars → next industry |
| `/global-network` | Photo hero (port at dusk) → **hub radial** with region filter + text list → Singapore hub band (address, phone, coordinates) → 4 network principles → split CTA |
| `/how-we-work` | Photo hero (aerial) → process branch → **stacked sticky stage cards** → trading vs indenting → commitments → "start from a product / industry" → split CTA |
| `/insights` | Type hero → 3 editorial streams marked "No articles published yet" → in-preparation band |
| `/careers` | Photo hero → 4 themes → "00 open positions" empty state → split CTA |
| `/contact` | Type hero with phone + address → 5 enquiry paths → **demo contact form** (`?type=` preselects) → navy office band with "SINGAPORE" marquee |
| `/request-quote` | Type hero → **two-step demo RFQ** (`?product=slug` prefills) + "What to include" guidance |
| `/privacy`, `/terms`, `/cookies` | Legal holding pages |
| `/insights/:slug`, `/careers/:slug`, unknown categories/products, `*` | Custom 404 ("Off the trade lane.") with its own marquee |

## 6. Asset inventory

There are 12 original renders, each encoded to 2–3 WebP widths: 34 files, **1.6 MB in total**. They are made in `art/scenes.js` (three.js in headless Chromium with SwiftShader) with a custom ocean shader (multi-octave wave normals, Fresnel sky reflection, ship-local streaked wake and Kelvin arms, atmospheric fog), a procedural cloud sky, a lofted hull, instanced corrugated containers, and canvas-texture materials.

| Name | Master | WebP widths | Used on |
|---|---|---|---|
| hero-sea | 2400×1350 | 2400 / 1440 / 800 | Home hero, 404 |
| hero-sea-portrait | 1080×1500 | 1080 / 640 | Home hero ≤719 px |
| ship-broadside | 2400×1200 | 2400 / 1440 / 800 | Finder, About hero, Network CTA, About slider |
| ship-red | 1600×1200 | 1440 / 800 | Split CTAs |
| aerial | 1600×1600 | 1400 / 800 / 480 | How We Work hero, sliders, Careers CTA, product finder |
| port-dusk | 2400×1350 | 2400 / 1440 / 800 | Global Network + Careers heroes, sliders |
| mat-textile · mat-petrochemicals · mat-chemicals · mat-minerals · mat-agro · mat-packaging | 1600×1600 | 1400 / 800 / 480 | Carousel tiles, vertical tiles, category heroes, product figures, industry previews, CTAs |

- Every `<img>` has `width`/`height`, `srcset`/`sizes` and lazy loading below the fold. The home hero is preloaded with `fetchpriority="high"`.
- **No external image URLs** are used; a test enforces this.
- These are labelled as renders: alt text says "Rendered …", and product pages caption the figure "Illustrative render of the vertical — not this product".
- **AI image generation was not available in this environment.** Nothing is presented as photography or AI imagery. `docs/IMAGE-PROMPT-PACK.md` gives a prompt, size and placement for each file.

## 7. Animation implementation

- **Reveals:** a single shared `IntersectionObserver` (`lib/motion.ts → observeReveal`) adds `is-in` once. The hidden start states apply only under `html.js-motion`, so content is fully visible without JavaScript.
- **Hero entrance:** CSS keyframes. The render fades up from 35% brightness over 2.2 s, nav items stagger at 70 ms, and the copy follows at 700–1180 ms.
- **Marquee:** a CSS `translate3d(-50%)` loop over four copies of the unit, so it never shows a gap.
- **Carousel:** React state plus CSS transitions (900 ms, `cubic-bezier(.16,1,.3,1)`). The timer is a single `setTimeout` per step. It pauses on hover, on focus, while off-screen (via `useInView`) and with reduced motion. Input: arrow buttons, dots, ← → keys, clicking a side tile, or a 40 px swipe with `touch-action: pan-y`. The caption region becomes `aria-live="polite"` when the user is in control.
- **Process branch:** CSS `scaleX`/`scaleY` on the rule and drops, with a `scale` overshoot on the nodes, all chained with `transition-delay` driven by a `--i` custom property.
- **Parallax:** `useParallax`, with one passive scroll listener shared by every layer, rAF-throttled, and active only for layers whose section intersects the viewport.
- **Hub radial:** SVG `pathLength=1` dash-offset drawing, staggered per lane; nodes scale in and the Singapore core pulses.
- **Footer wordmark:** rises 55% → 0 over 1.4 s on first view.
- **Stage cards:** CSS `position: sticky` stacking with a 14 px offset per card. Below 720 px and with reduced motion they become plain cards.
- **Reduced motion:** `prefers-reduced-motion` drops every animation and transition to 1 ms, forces revealed states, stops the marquee and the hub pulse, and turns off carousel autoplay and parallax.
- **Performance:** only `transform`, `opacity` and `filter` are animated. There are no scroll-jacking or pinned scroll sequences, and no runtime WebGL.

## 8. Responsive testing results

`scripts/qa.mjs` loaded all **30 routes at each of 320, 375, 390, 430, 768, 1024, 1440 and 1920 px** (240 page loads) in Chromium. Each page was scrolled through and checked for console errors, failed requests or HTTP ≥ 400, horizontal overflow, the number of `<h1>` elements and broken images. Every internal link found (59 unique) was then opened to confirm it does not land on the 404 page.

- **Final run: no problems found**, and 0 internal links resolve to 404.
- One bug was found and fixed during QA: on `/industries` at ≤430 px, the matrix's visually hidden "Yes/No" cells escaped their scroll container and caused 300–400 px of horizontal page overflow. Fixed with `position: relative` on the scroller.
- A reduced-motion pass (`REDUCED=1`) on `/`, `/how-we-work` and `/global-network` at 390 and 1440 px found no problems. Screenshots confirmed that content is visible with nothing left in a hidden state.

Mobile adaptations:

- The header collapses to brand + Menu at < 1240 px; the menu is a full-screen sheet with a focus trap, Esc to close and a faint marquee.
- On phones the quote CTA becomes an orange circle; its label stays available to screen readers.
- The hero uses a dedicated portrait render, and the meta column is hidden.
- The carousel narrows to 240 px tiles with a shallower perspective and swipe.
- The process branch becomes a vertical trunk.
- The code rail snaps at 78% card width.
- Grids step from 4 to 2 to 1 columns.
- The matrix scrolls inside its own region.
- Forms go to one column.
- Sticky stage cards unstick.

## 9. Build and test results (all actually run)

| Command | Result |
|---|---|
| `npm run typecheck` | Passed, 0 errors |
| `npm run build` | Passed. Main JS is 348 kB (106 kB gzip), plus route chunks of 3.5–19 kB and 65 kB of CSS (15 kB gzip). |
| `scripts/check-dist.mjs` (part of `build`) | All 10 checks passed: noindex, robots disallow, all 34 images present, no Apps Script endpoint, no secrets, no POST, no "30,000 MT" / "350+" / "testimonial", `404.html` written |
| `npm test` | **7/7 passed:** verified company facts, image manifest + alt text, a render for every category, no external images, demo-safe forms (no network calls, no fake success copy), no pending/invented metrics, noindex + robots, all routes declared |
| `scripts/qa.mjs`, 30 routes × 8 widths | **No problems found** |
| Interaction script (Playwright, 390 px) | RFQ prefilled "Monoethylene Glycol" from `?product=meg`. Empty submit showed a 4-item error summary and moved focus to it. Step 2 email validation worked. The final screen showed **"Demo mode — not sent"**. `/contact?type=supplier` preselected the supplier type. The menu opened with focus inside and closed on Esc. Carousel "next" moved 01 → 02. Typing "visc" in the finder gave 3 hits, and ↓ + Enter opened Viscose Filament Yarn. **Zero non-GET network requests.** |

## 10. Known limitations

- **Renders, not photographs.** The 3D scenes are deliberately simple: low-poly superstructures, flat crane geometry and box containers. Seen up close, especially the hero ship at 1920 px, they read as CGI. They are intended as consistent placeholders until approved photography or AI imagery is supplied; see the prompt pack.
- **Single-page app with no prerendering.** Page titles and descriptions are set at runtime and everything is `noindex`, so this does not matter for the demo, but production would want prerendering, as the original site has.
- **Font payload.** The full variable Unbounded and Inter Tight families are bundled, and browsers download only the subsets they use. Production could subset them to Latin.
- **The hub radial is schematic** (bearings approximate, not to scale), and it says so on the page.
- **Insights and Careers** have no published articles or roles, so their detail routes return the 404 page, matching the original site's behaviour.
- **Not tested:** real Safari/iOS, Firefox, and screen readers. QA ran in Chromium only, with emulated widths.
- **The video shows no hover states and no mobile layout,** so the hover behaviours (sliding nav indicator, card inversions, sticky industry preview) and the mobile layouts are this demo's own design decisions.

## 11. Exact commands

```bash
cd D:\urmpl-websites\urmpl-4
npm install
npm run dev            # → http://localhost:5176

npm run build          # typecheck + build + dist checks
npm run preview        # → http://localhost:4176
npm test

# optional QA (needs: npm i -D playwright && npx playwright install chromium)
node scripts/qa.mjs http://localhost:4176

# optional: regenerate every image (slow, needs Chromium)
npm run renders
```
