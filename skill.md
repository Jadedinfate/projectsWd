---
name: brutalist-motion-design
description: Use whenever building or restyling frontend UI — landing pages, product/cart pages, checkout flows, dashboards, or any React interface — where the brief calls for a bold, high-contrast, animated visual identity instead of a generic SaaS look. Combines React Bits (reactbits.dev) for showpiece decorative/ambient components with Motion (formerly Framer Motion) for functional interaction animation, art-directed through a sleek, abstract neubrutalist lens: raw structural bones executed with precision rather than kitsch. Trigger this any time the user mentions React Bits, Framer Motion, Motion.dev, brutalism, or neubrutalism, or asks for UI that's "bold," "sleek," "abstract," "edgy," "raw," or explicitly "not generic" — even if they don't name the libraries.
compatibility: React project (Next.js, Vite, Remix, or Astro) using Tailwind CSS; Node.js/npm for installing React Bits components and the `motion` package.
---

# Brutalist Motion Design

Approach this the way a studio would if a client walked in already speaking in specifics: React Bits, Framer Motion, brutalism. They've named their tools and their reference point — the job is direction, not translation. Build a visual identity out of raw, honest structure (thick borders, hard shadows, exposed grid) executed with enough precision and restraint that it reads as *sleek* and *abstract*, not chaotic or unfinished. Two libraries split the work: React Bits supplies the showpiece, ambient moments; Motion — the library most people still call Framer Motion — handles everything the interface does in direct response to the person using it.

## The direction, precisely

Brutalism at its rawest (bare HTML, monospace everything, zero polish) reads as *broken*, not *sleek*. What's actually being asked for sits closer to what's currently called **neubrutalism**: brutalist bones executed with the precision of abstract art, not the chaotic maximalism (stickers, comic-sans energy, confetti primaries) neubrutalism often collapses into. Concretely:

- **Structure is exposed, not hidden.** Borders, grids, and dividers are visible and load-bearing, not decorative flourishes.
- **Shadows are hard-edged and offset** (`4px 4px 0 #000`), never soft or blurred — blur reads as default-SaaS, not brutalist.
- **Corners are square by default.** If you break that rule, break it once, deliberately, as the signature element — don't let softness creep back in "just for this one card."
- **Color is high-contrast and confident**: true black/near-white plus 2–3 flat, saturated accents, not a gradient-soft palette.
- **Abstraction comes from shape and motion**, not illustration: geometric forms, grain/noise, distorted or kinetic type, glitch/scan artifacts — not stock-illustration iconography.

## Design tokens (a starting point — adapt to the actual brief, don't copy wholesale)

```css
:root {
  --ink: #111111;         /* base text / structure */
  --paper: #FAFAF7;       /* base surface — deliberately not the warm-cream #F4F1EA
                              that's become an AI-design tell; keep it closer to true white */
  --accent-blue: #2B2FF0; /* primary accent — signature color */
  --accent-red: #FF3E1F;  /* secondary accent — used for urgency/CTA states */
  --accent-lime: #C9FF3D; /* tertiary — sparingly, for focus rings and highlights only */
}
```

- **Type**: a characterful grotesk for display (Space Grotesk, Archivo Black, or Neue Machina for maximum punch), a highly legible grotesk for body (Inter or Public Sans), and — this is the move that ties the aesthetic to the content — a monospace (JetBrains Mono, IBM Plex Mono) for anything numeric: prices, SKUs, order IDs, quantities. Raw data in a raw typeface.
- **Scale**: big, confident jumps, not a gentle 1.2 ratio — e.g. 14 / 16 / 20 / 32 / 56 / 96.
- **Layout**: visible grid lines between sections, not just whitespace; asymmetric, off-center compositions weighted by content importance over centered "SaaS hero" balance; dense information (tables, labels, borders) is a feature here, not something to soften.

## Two tools, two jobs

### React Bits — the showpiece layer

An open-source library (reactbits.dev, David Haz) of 160+ animated components across four categories: **Text Animations**, **Animations**, **Components**, and **Backgrounds** — free core, MIT-licensed, with an optional Pro tier. Components install one at a time via CLI and get copied straight into your own codebase rather than pulled in as an npm dependency:

```bash
npx jsrepo add https://reactbits.dev/tailwind/<Category>/<ComponentName>
# drop "tailwind" for the plain-CSS variant; shadcn CLI is also supported
```

Because the code lands directly in your repo, you can — and for this aesthetic, should — edit it rather than fight its props. That fits the ethos: own the raw material, don't hide it behind an abstraction.

**Where to reach for it**: backgrounds, hero text treatments, cursor/scroll ambience — moments that are allowed to be a little extra. Confirmed components worth knowing (verify current names/props at reactbits.dev before wiring one in — the library adds new ones weekly): `Aurora`, `Threads`, `Silk`, `Iridescence`, `LiquidChrome` (backgrounds); `SplitText`, `BlurText` (text animations); `SplashCursor` (ambient cursor effect). Some components lean on Motion under the hood, others on GSAP, OGL (shader backgrounds), or Three.js (3D pieces) — check what a component needs before adding it, so one page doesn't end up pulling in three animation engines.

**Where not to reach for it**: the actual payment form, or anything else on the critical conversion path. A shader background behind a card-entry field is a liability, not a flex — see below.

### Motion (formerly Framer Motion) — the interaction layer

Naming note, since this trips people up: the library most people still call "Framer Motion" was renamed **Motion** in 2025 and now lives at motion.dev. Install and import the current name:

```bash
npm install motion
```
```js
import { motion, AnimatePresence } from "motion/react"
```

`framer-motion` still works as a legacy alias but isn't where new development happens — don't scaffold a new project against it.

**Where to reach for it**: everything the interface does in direct response to the user — cart drawer slide-ins, add-to-cart confirmations, checkout step transitions, form-validation feedback, button hover/press states, layout shifts when line items change (the `layout` prop and `AnimatePresence` handle this well).

**Brutalist motion character**: it should feel *mechanical and decisive*, not soft and bouncy. Prefer sharp or slightly-overshot easing and short durations over the default gentle spring:

```js
// Decisive, not springy — a brutalist micro-interaction
const snap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.16, ease: [0.2, 0, 0, 1] } // hard deceleration, no bounce
};
```

Reserve anything springier or more elaborate for one signature moment — spend the boldness in a single place, keep the rest disciplined.

## Applying this to checkout flows

- **Go bold**: product grid, cart drawer, order summary, empty/error states, the confirmation screen. This is where React Bits backgrounds, kinetic type, and Motion's layout animation earn their keep, and where the aesthetic builds brand memorability.
- **Go restrained**: the card-entry step itself. Stripe Elements renders card inputs inside an iframe for PCI compliance, so that markup isn't directly stylable — it's themed through Stripe's `appearance` API (`variables` like `colorPrimary`, `fontFamily`, `borderRadius`; `rules` keyed to selectors like `.Input`, `.Input:focus`, `.Label`). You can carry the brutalist language in there — thick borders, square corners, your accent color on focus — but keep it legible and low-motion. A payment field is not the place for a shader background or a 400ms slam transition: friction and disorientation at the exact moment someone is trusting you with a card number costs conversions, not compliments.
- **Make the transition between the two feel intentional.** A hard-edged divider or a background shift as the user moves from "browsing" into "paying" can reinforce trust — this is now a different, more serious mode — rather than just breaking the aesthetic.

## Guardrails

- **Reduced motion is non-negotiable, especially here.** Wrap Motion animations behind `useReducedMotion()`, and give React Bits' more aggressive components (cursor effects, parallax, autoplaying backgrounds) a static fallback.
- **Focus states**: thick, high-contrast focus outlines are both an accessibility requirement and a brutalist signature — one of the rare cases where "correct" and "on-brand" are the same instruction. Don't lose them chasing a cleaner look.
- **Contrast**: the high-contrast palette usually clears WCAG AA by default — don't undermine that softening ink-on-paper contrast for "sleekness." Check accent-on-accent text pairings specifically; that's where it tends to break.
- **Performance**: shader backgrounds (OGL/Three.js-based) are gorgeous and not free. Lazy-load below the fold, avoid stacking more than one per view, and profile on a mid-range device — a checkout flow that jank-scrolls loses more trust than a plain background ever earns back.
- **Avoid the generic-AI tells creeping back in**: no soft blurred shadows, no centered-hero-with-gradient-blob, no border-radius softening "just this once." If unsure whether a choice is structurally honest or just decoratively safe, that's the tell. (The `frontend-design` skill has more on spotting these defaults if it's available in this project.)

## Before shipping a screen

- [ ] Structure (borders/grid) is visible, not just implied by whitespace
- [ ] Shadows are hard-edged and offset, never blurred
- [ ] One signature moment carries the boldness; everything else is disciplined
- [ ] React Bits used for ambience/showpieces; Motion used for functional feedback
- [ ] The payment step specifically is calmer and lower-motion than the rest
- [ ] Reduced-motion fallback exists and was actually tested
- [ ] Focus states are visible and thick
- [ ] Checked on a mobile viewport and a throttled connection