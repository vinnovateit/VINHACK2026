<a id="readme-top"></a>


<!-- Club Logo -->
<br />
<div align="center">
  <a href="https://github.com/vinnovateit/VINHACK2026">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/vinnovateit/.github/main/assets/whiteLogoViit.svg">
      <img alt="VinnovateIT Logo" src="https://raw.githubusercontent.com/vinnovateit/.github/main/assets/blackLogoViit.svg" width="200">
    </picture>
  </a>

<h3 align="center">VinHack 2026</h3>

  <p align="center">
    The landing page for VinHack — a 36-hour hybrid hackathon by VinnovateIT at VIT.
    <br />
    <a href="https://github.com/vinnovateit/VINHACK2026"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://vinhack.vinnovateit.com">Visit</a>
    &middot;
    <a href="https://github.com/vinnovateit/VINHACK2026/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/vinnovateit/VINHACK2026/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project

A direct implementation of the Figma frame
[`Website` → `FINAL` (node `297:2`)](https://www.figma.com/design/zwAsz0RViYGWjgOyecSiMa/Website?node-id=297-2).

The design is a fixed-width **1280 × 8834** scrapbook collage: sections overlap,
and effectively every element is absolutely positioned at an exact pixel offset.
There is no reflow rule in the design to derive a fluid layout from, so the
implementation mirrors the canvas rather than inventing one.

### Built With

[![Next][Next.js]][Next-url]
[![React][React.js]][React-url]
[![TypeScript][TypeScript]][TypeScript-url]
[![Tailwind][Tailwind]][Tailwind-url]
[![GSAP][GSAP]][GSAP-url]


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* Node.js 20+
* npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/vinnovateit/VINHACK2026.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Run the dev server
   ```sh
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). No API keys or environment
variables are needed.


## Architecture

- [`DesignCanvas`](src/components/DesignCanvas.tsx) renders the 1280 × 8834 frame
  and scales it uniformly to the viewport width — up as well as down. Many
  sections bleed off both edges by design (the footer bands, the "Who are we?"
  marquee, the track card stacks), so pinning the canvas at its native 1280px
  would leave black gutters and visibly chop those elements at the boundary.
  The scaling is pure CSS (`.canvas-frame` in `globals.css`), so it is already
  correct in the server-rendered HTML, with no resize handler and no hydration
  step.

  The trade-off is that everything grows on large monitors (at 1920px the design
  renders at 1.5×). To cap it, clamp the scale in `.canvas-frame`:
  `tan(atan2(min(100cqw, 1.5 * var(--canvas-width)), var(--canvas-width)))`.
- Each Figma section is one component in
  [`src/components/sections/`](src/components/sections), positioned at its Figma
  `top` offset inside that canvas. Components are listed in
  [`page.tsx`](src/app/page.tsx) in visual top-to-bottom order.
- Every node keeps its `data-node-id`, so any element can be traced back to the
  Figma node it came from when the design changes.

| Section | Figma node | Canvas top |
| --- | --- | --- |
| Hero | `343:1172` | 0 |
| About VinHack | `297:328` | 832 |
| Who are we | `297:312` | 1664 |
| Projects | `297:300` | 2496 |
| Tracks | `594:33` | 3342 |
| Timeline | `343:2038` | 4680 |
| Rules | `343:709` | 5512 |
| Guidelines | `343:751` | 6344 |
| Register now | `297:166` | 7176 |
| Footer | `297:3` | 8008 |


## Motion

Two client components own all the animation; everything else stays a static
server-rendered translation of the Figma frame.

| | |
| --- | --- |
| [`HeroMotion`](src/components/HeroMotion.tsx) | the hero's load entrance, idle float, scroll parallax, hover |
| [`PageMotion`](src/components/PageMotion.tsx) | scroll reveals for sections 2–10, the two marquees, footer tab hover, project-card hover |

Targets are tagged in the section components with `data-hero`, `data-marquee`,
`data-tab` / `data-tab-part`, and `data-card` — the only hand-edits to those
generated files. Several tags sit on Figma grouping wrappers, which are emitted
as `display: contents` and generate no box at all; both components descend past
them to the real boxes underneath.

**One property, one tween.** Concurrent tweens must never share a property or
they fight over the single transform matrix GSAP composes. The budget is:

| layer | owns |
| --- | --- |
| entrance / scroll reveal (one-shot) | `x` `y` `scale` `opacity` |
| idle float (endless) | `y` on hero stickers |
| marquee (endless) | `x` on marquee rows |
| scroll parallax | `yPercent` |
| hover | `y` `scale`, with `overwrite: "auto"` |

This is why the hero disc has no idle `sway` (its slow spin already owns
`rotation`) and why the hero's note hover is scale-only.

`prefers-reduced-motion: reduce` skips all of it, marquees included, and leaves
the markup untouched.

### Marquees

The footer's multilingual strip and the "Who are we?" lettering both scroll
right-to-left forever. Both were already built for it in Figma — the heading
ships as two copies with a 97px gap, which only reads as intentional once it
moves.

Copies are rendered declaratively (2 for the footer, 3 for the heading) and
`PageMotion` clones more at runtime if the measured width doesn't cover the
frame plus one loop step. The loop distance is measured from the live DOM rather
than hardcoded, because it changes with the webfont: the footer strip is 4466px
wide on the fallback stack versus the 4109px box Figma gave it. That box was
actually clipping — the strip was silently wrapping. Marquee copies use
`w-max whitespace-nowrap` so the box hugs the text exactly and the seam is
pixel-perfect. Marquees pause via `ScrollTrigger` when their section is
off-screen.

### Footer tabs

The five social tabs raise 10px on hover. Each tab's artwork is a *full-width*
1280px band with only its lip exposed, so hovering the band itself is
meaningless — `SiteFooter.tsx` carries a hit area over each visible lip
(geometry measured off the rendered bands), and `data-tab-part` pairs each band
with its label so the two lift together.

### Hero detail

The hero's entrance runs on load rather than on scroll: the wordmark lands
first, then the seven stickers slap on one at a time with a rotation overshoot,
then the lede and the arc lettering. Afterwards every sticker floats on its own
period, the pixel disc turns slowly, and a wave runs letter-by-letter through
"scroll down for more".

`.hero-motion` starts at `opacity: 0` in CSS so the collage never flashes in
before the animation arms, and `HeroMotion` clears that with a **synchronous**
`gsap.set` rather than as the timeline's first frame. GSAP's ticker is driven by
`requestAnimationFrame`, which does not run in a background tab — revealing on
the first frame leaves the hero blank until the tab is focused. `layout.tsx`
carries a `<noscript>` fallback.


## Attendee pass camera

The pass's "LIVE CAMERA FEED" panel is a real webcam view —
[`CameraFeed`](src/components/CameraFeed.tsx), rendered into the front ticket's
white panel (Figma node `297:393`).

- **Never opens on load.** `getUserMedia` runs only from a click. The panel
  starts as the design's placeholder with a "CLICK TO ENABLE" hint.
- **The panel is also the off switch.** Clicking a live feed stops every track.
- **No leaked cameras.** Tracks stop on unmount, including the race where the
  permission prompt resolves *after* the component is gone.
- **Fails legibly.** Denied, no device, and unsupported each render a message
  plus "CLICK TO RETRY".
- **The `<video>` mounts only once there is a stream to put in it.** Besides
  keeping a dead media element out of the initial HTML, this avoids a hydration
  mismatch: extensions that manage video playback tag every `<video>` on the
  page (`data-video="0"` and friends) the moment it parses, and React — which
  hydrates against the live DOM, not the HTTP response — reports that as
  server/client markup drift.

`getUserMedia` needs a secure context — fine on localhost and over HTTPS, and
the panel says `HTTPS REQUIRED` anywhere else. The video is mirrored, muted and
`playsInline`. Audio is never requested, and nothing is recorded or uploaded.


## Assets and fonts

The 124 icons and images in `public/figma/` are the exact bytes exported from
Figma, committed so nothing depends on a running Figma session. To update one,
re-export it from the same node and overwrite the file in place — the filenames
match the Figma layer names.

Because these are overwhelmingly SVGs rendered into boxes whose pixel size comes
from the design, they use plain `<img>` rather than `next/image`; the
`@next/next/no-img-element` rule is turned off for `src/components/sections/**`
in [`eslint.config.mjs`](eslint.config.mjs).

The design uses a single typeface, **Rotonto Light**. It is licensed and is not
committed here. Drop `Rotonto-Light.woff2` into `public/fonts/` and the
`@font-face` in [`globals.css`](src/app/globals.css) picks it up automatically.


<!-- ROADMAP -->
## Roadmap

- [ ] Add `Rotonto-Light.woff2` — all type currently renders in the fallback sans
- [ ] A real small-screen layout (below 1280px the whole canvas just scales down,
      so phone type is proportionally tiny — this needs a mobile frame in Figma)
- [ ] Wire up destinations: `HOME` / `EXPLORE`, the footer social tabs and the
      project cards are all inert, as the Figma file supplies no links
- [ ] Trim `public/figma/image205.png` (437 KB, in the hero) if LCP matters

See the [open issues](https://github.com/vinnovateit/VINHACK2026/issues) for a
full list of proposed features (and known issues).


### Top contributors:

<a href="https://github.com/vinnovateit/VINHACK2026/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vinnovateit/VINHACK2026" alt="contrib.rocks image" />
</a>


<p align="center">
	Made with :heart: by <a href="https://vinnovateit.com">VinnovateIT</a>
</p>


<!-- MARKDOWN LINKS & IMAGES -->
[Next.js]: https://img.shields.io/badge/next.js-000000?&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-06B6D4?&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[GSAP]: https://img.shields.io/badge/GSAP-88CE02?&logo=greensock&logoColor=white
[GSAP-url]: https://gsap.com/
