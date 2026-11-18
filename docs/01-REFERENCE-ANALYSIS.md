# Demo 04 — Reference video analysis

**Source:** `WhatsApp Video 2026-10-16 at 11.40.08 AM.mp4`. It is 27.07 s long, 480 × 656 px at 60 fps, with no meaningful audio.
**Method:** frames were extracted with ffmpeg. A 1 fps contact sheet covered all 27 s, and full-resolution stills were taken at 0.3, 1.0, 1.5, 2.0, 2.5, 3.0, 4, 5, 6, 7, 7.5, 8, 8.5, 9.5, 10, 10.5, 11, 12, 13, 14.5, 16, 17, 18, 19.5, 21, 22, 23, 25 and 26.5 s.
**What it is:** a showcase reel for a logistics landing-page template called "SHIPFLOW". A tablet-framed browser scrolls slowly through the full page on a pale sky-gradient backdrop. A tall full-page "stack" composition opens and closes the reel.

Only what is visible in those frames is described below. Hover states are not shown in the reel, and neither is a mobile layout.

---

## A. Visual identity

| Aspect | Observed |
|---|---|
| Palette | Deep ink-navy (≈ `#0F2033`) for the hero grade, process band and CTA card. Clean white and very light grey (≈ `#F5F6F7`) for content sections. A single saturated **orange** (≈ `#F47B20`) for every CTA, the numbered process nodes and the eyebrow dots. Photography is cool blue-grey sea with warm container colours. |
| Typography | (1) An **ultra-wide geometric display face** with rounded "W", used only for the giant wordmark marquee and the footer wordmark. (2) A neutral neo-grotesk for everything else: medium-weight headlines in sentence case at ~28–36 px, small grey body copy, tiny eyebrows with an orange dot. |
| Header | A floating **segmented pill nav** on the left: a translucent dark capsule holding Home · About · Services · Tracking · Contact, with the active item as a solid white pill. On the right sit an orange "Get a Quote" pill and a separate white **circular arrow button** (↗). |
| Buttons | Orange pill plus a detached white circle with ↗. The pair repeats on the hero, the CTA card and the footer. "Learn More" and "Track Now" are small orange pills. |
| Backgrounds / textures | Flat white and grey. The navy sections carry **faint dotted world-map fragments** in their corners. There is no grain. |
| Image composition | Cinematic, desaturated, full-bleed photography for the hero (ship seen from astern) and the tracking band (ship broadside under clouds). Saturated, rounded-corner photo tiles appear in the carousel and the CTA. |
| Spacing / density | Generous. A large left gutter carries the eyebrow, while the main statement sits in a right-hand column. Feature rows use four equal columns. |
| Corners | 14–18 px on cards and tiles, full pills on buttons and nav. |

## B. Motion and interaction

| Moment | Behaviour |
|---|---|
| Page entrance (0–3 s) | The hero photo appears first, alone and dark. Then the nav capsule fades in and its items **stagger in left to right**: at 2.5 s only "Home · About" are visible, and at 3 s all five are. The quote pill, circle button, hero copy and CTA fade up together. |
| Wordmark marquee | "SHIPFLOW-SHIPFLOW-…" in the wide display face **scrolls continuously horizontally** along the bottom of the hero. It sits on a dark band that continues below the photo, so it visually "holds" the hero to the next section. |
| Statement + features | The right-hand statement **rises in line by line**. Four light feature cards fade up after it with a slight stagger. |
| Section entrance (≈ 9.5 s) | The services section arrives **blurred and slightly faded, then sharpens**. This is a blur-to-focus reveal. |
| Curved carousel (9.5–11 s) | The signature component. About five rounded image tiles sit on the **inside of a cylinder**: the centre tile is flat and largest (number "03" + label "Sea Shipping"), its neighbours are rotated in perspective so their outer edges are taller, and the outermost tiles are slivers at the viewport edges. It **advances on its own**. The caption and "Learn More" below change with the active tile, and pagination dots sit under it. |
| Process band (12–13 s) | A navy section with a centred two-line heading (the second line lighter). A **horizontal rule draws across, then vertical drop-lines** descend to three orange numbered nodes at **staggered heights** (the middle one lower). Labels sit beneath each node. |
| Service row (14.5 s) | Repeats the eyebrow-left / statement-right layout with four icon cards. |
| Tracking band (16–17 s) | A full-bleed ship photo with a **glass (frosted, translucent dark) card** centred over it, containing a heading, short copy, a white input and an orange button. The photo moves slightly slower than the page (mild parallax). |
| Testimonial (18–21 s) | A heading on the left with ‹ › arrow controls (the active arrow is an orange circle) and dots. A portrait card on the right has a white caption chip (name, role, ★★★★★). The card slides as you page. |
| CTA (22–23 s) | Split composition: a rounded photo tile on the left and a rounded navy card on the right with a heading, copy, the orange pill + circle pair and the **brand wordmark in orange** in the corner. The pair slides up as one. |
| Footer (23–26 s) | Brand + short paragraph on the left, Page / Follow us / Subscribe columns, then a **giant pale wordmark** filling the full width at the bottom, cropped by the page edge. |
| Outro (26–27 s) | The full-page "stack" composition shown again. |

## C. Key frames

| # | State | Visible | Changes on scroll / interaction | Effect | URMPL adaptation |
|---|---|---|---|---|---|
| 1 | Initial viewport | Ship-from-astern photo, segmented pill nav, orange quote pill + ↗, small left copy + CTA, wordmark marquee across the bottom | Nav items stagger in; the marquee runs constantly | Cinematic hero + kinetic wordmark | Original rendered ship-at-sea hero; the marquee reads `UNITED RAW MATERIAL — URMPL — SINGAPORE — ` in a wide display face |
| 2 | First transition | The marquee band becomes the top edge of a white section; eyebrow left, statement right | Statement lines rise in; four cards fade up | Line-mask reveal | "Who we are" statement + four pillars (Singapore-grade trust, access to producers, volume & continuity, market knowledge) |
| 3 | Main storytelling | Centred heading + curved cylinder carousel | Blur-to-focus entrance; carousel auto-advances; caption swaps | 3D curved coverflow | The **six trading verticals** on the cylinder: textile, petrochemicals, chemicals, minerals, agro, packaging, with the published or "in preparation" status shown honestly |
| 4 | Animated section | Navy band, dotted-map corners, branching timeline with orange nodes | Rule and drops draw in; nodes pop in sequence | SVG line drawing | URMPL's **five verified process stages** (Sourcing → Delivery) |
| 5 | Content showcase | Full-bleed ship + glass card with input | Parallax photo | Glass utility card | **"Find a material"**: a real search across the 16 published products. It replaces shipment tracking, which URMPL does not offer and which would be fake data. |
| 6 | Lower page | Testimonial slider | Paged slider, arrows, dots | Paged slider | **No testimonials exist, so none are invented.** The pattern is reused as a paged "Trading vs Indenting / Why URMPL" slider, with a factual chip ("Incorporated 30 May 2006") instead of stars |
| 7 | Footer | Split CTA card + footer + giant wordmark | Slide-up; static wordmark | Wordmark sign-off | Split CTA ("Looking for a reliable global raw-material partner?") + footer with a giant `URMPL` wordmark that rises out of a mask as it enters |

## What is deliberately *not* carried over

- SHIPFLOW's content, name, photos, copy, star ratings and testimonial person.
- Freight-forwarder services (air / land / sea) and parcel tracking. URMPL is a trading and indenting house, not a carrier.
- The newsletter subscribe box. URMPL has no newsletter, so the footer uses "Request a quote".
