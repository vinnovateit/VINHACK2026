"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import SponsorEdition, { EditionMasthead } from "./SponsorEdition";
import { SPONSOR_HEADING } from "./copy";
import { DESKTOP } from "@/components/motion/recipes";
import { paperUnfold } from "@/components/motion/paper";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The sponsor sheet as a folded newspaper that opens as you scroll to it.
 *
 * The reader arrives at a paper folded once across the middle — all you get is
 * the top of the nameplate, cut clean through the waist of the letters, the way
 * a broadsheet looks lying on a table. Under it, the section's own headline.
 * Scroll on and the fold splits down the centre and both halves swing out
 * toward you, the headline rides up into the space the masthead vacated, and
 * the full sheet unfolds from the crease.
 *
 * Everything here is transform and clip only. The collage this sits in is a
 * fixed 1280 x 9250 frame where every section holds an exact `top` (see
 * `DesignCanvas`), so an animation that changed its own height would push six
 * sections down the page. The closed sheet is absolutely placed so that the
 * open one lands exactly where `SponsorEdition` has always sat, and the section
 * measures the same 840px at every point in the movement.
 *
 * Coordinates below are in the sheet's own 1184 x 758.4 Figma units, which is
 * also the size it is printed at — `Sponsors` gives it a column of exactly
 * that, so there is no fitting scale between the two and nothing in here has
 * to know about one.
 */

/** The sheet, at the size it was drawn. */
const SHEET_W = 1184;
const SHEET_H = 758.4;

/**
 * Where the fold is cut.
 *
 * `EditionMasthead` sets THE HACKSTREET JOURNAL at 70px on a leading of 1 from
 * y94, so the letters run y94 to y164 and their waist is y129. Cutting a few
 * pixels below that leaves recognisably the tops of the letters — enough to
 * read the name, not enough to mistake it for a whole page.
 */
const COVER_H = 133;

/** Where the folded sheet lies in the box, so the closed state sits high and
 *  the headline has somewhere to be underneath it. */
const COVER_Y = 186;

/** The crease itself: the line the open sheet grows out of in both directions. */
const CREASE = COVER_Y + COVER_H;

/** Half the sheet: where the fold splits. */
const GUTTER = SHEET_W / 2;

/**
 * How far the panels swing, in degrees.
 *
 * Deliberately short of 90. The panels are `backface-visibility: hidden`,
 * because the reverse of a sheet of newsprint is not the same sheet mirrored,
 * and a panel that crosses 90 degrees is therefore switched off between one
 * frame and the next. Stopping at 88 and taking the opacity to zero by then
 * means the paper is gone because it faded, not because it flipped.
 */
const SWING = 88;

/** The headline's two positions: under the folded paper, and up in the band the
 *  masthead used to occupy once the sheet is open. */
const HEADLINE_CLOSED_Y = 352;
const HEADLINE_OPEN_Y = 30;

/** Zero velocity at both ends, so no stage of the movement starts with a jolt. */
function smooth(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

/** `p` remapped onto [from, to] and eased — the one thing every stage below is
 *  built from, so the stages can overlap without any of them knowing it. */
function stage(p: number, from: number, to: number): number {
  return smooth((p - from) / (to - from));
}

function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * One half of the fold.
 *
 * Both halves print the *whole* nameplate and then show a different 592px of
 * it, rather than each holding half the words — the masthead is centred type
 * with a red word in the middle of it, and splitting it any other way would put
 * a seam through HACKSTREET. The clip is what makes two panels out of one
 * drawing, and it is also what cuts the letters at the crease.
 */
function FoldPanel({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div
      data-fold-panel={side}
      className="absolute top-0 h-full w-1/2 overflow-hidden bg-[#ebebe9]"
      style={{
        left: left ? 0 : GUTTER,
        // The outer edge is the hinge: the paper is held at its spine and the
        // inner edges are the ones that come up toward the reader.
        transformOrigin: left ? "left center" : "right center",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        className="absolute top-0 h-[758.4px] w-[1184px] text-left text-[18px] text-black [font-family:var(--font-rotonto),_Rotonto,_sans-serif]"
        style={{ left: left ? 0 : -GUTTER }}
      >
        <EditionMasthead />
      </div>

      {/* The shading a sheet picks up as it turns away from the light. Flat at
          rest, so the closed paper is a clean printed surface; the tween below
          brings it up as the panel swings. */}
      <div
        data-fold-shade
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background: left
            ? "linear-gradient(90deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)"
            : "linear-gradient(270deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

export default function FoldedEdition() {
  const stageRef = useRef<HTMLDivElement>(null);
  /** Latches the rustle to one per opening, and re-arms if you scroll back up
   *  past the closed state — a scrubbed trigger crosses a threshold many times
   *  while a trackpad settles, and the sound is an event, not a position. */
  const soundedRef = useRef(false);

  useGSAP(
    () => {
      const root = stageRef.current;
      if (!root) return;

      const q = gsap.utils.selector(root);
      const panels = q("[data-fold-panel]") as HTMLElement[];
      const shades = q("[data-fold-shade]") as HTMLElement[];
      const dressing = q("[data-fold-dressing]") as HTMLElement[];
      const [sheet] = q("[data-sheet]") as HTMLElement[];
      const [headline] = q("[data-headline]") as HTMLElement[];
      const [rule] = q("[data-headline-rule]") as HTMLElement[];

      const mm = gsap.matchMedia();

      const render = (p: number) => {
        // The paper is held closed for the first stretch, so a reader who has
        // only just brought it on screen gets to see that it *is* a folded
        // paper before it stops being one.
        const swing = stage(p, 0.18, 0.62);
        const travel = stage(p, 0.3, 0.82);
        const open = stage(p, 0.42, 1);

        for (const panel of panels) {
          const left = panel.dataset.foldPanel === "left";
          gsap.set(panel, {
            rotateY: (left ? -1 : 1) * SWING * swing,
            // A little outward drift on top of the hinge, so the halves read as
            // being pulled apart rather than merely pivoting.
            x: (left ? -1 : 1) * 34 * swing,
            // Solid for the first half of the movement, so the sheet is never
            // seen through the paper still covering it, then all the way out by
            // the end of the swing — see `SWING`.
            opacity: 1 - smooth(Math.max(0, (swing - 0.5) / 0.5)),
          });
        }
        for (const shade of shades) gsap.set(shade, { opacity: 0.9 * swing });

        // The loose sheets and the crease shadow go with the fold. They fade
        // rather than `[data-fold]` itself doing so: opacity below 1 forces
        // `transform-style: flat` on the element it is set on, which would
        // collapse the panels' perspective part-way through the swing.
        for (const bit of dressing) {
          gsap.set(bit, {
            opacity: 1 - smooth(Math.max(0, (swing - 0.34) / 0.4)),
          });
        }

        if (headline) {
          gsap.set(headline, {
            y: mix(HEADLINE_CLOSED_Y, HEADLINE_OPEN_Y, travel),
            // Big while it is the cover's title, settling to the size the band
            // wants once it is furniture on the page.
            scale: mix(1.14, 1, travel),
          });
        }
        if (rule) gsap.set(rule, { opacity: travel });

        if (sheet) {
          // The sheet grows out of the crease in both directions, which is the
          // fold undoing itself rather than a page fading up.
          const top = mix((COVER_Y / SHEET_H) * 100, 0, open).toFixed(3);
          const bottom = mix((1 - CREASE / SHEET_H) * 100, 0, open).toFixed(3);
          gsap.set(sheet, {
            opacity: open,
            clipPath: "inset(" + top + "% 0% " + bottom + "% 0%)",
          });
        }

        // One rustle, on the way in, as the crease actually gives.
        if (p > 0.2 && !soundedRef.current) {
          soundedRef.current = true;
          paperUnfold();
        } else if (p < 0.06) {
          soundedRef.current = false;
        }
      };

      // The fold is not at the top of this box — it is `COVER_Y` down it, and
      // on a wide screen the plate's scale turns those 186 drawn pixels into
      // most of a screenful. Triggering on the box therefore ran the whole
      // opening while the paper itself was still below the fold of the window:
      // by the time the crease was actually on screen it had already given.
      // `[data-fold-anchor]` is a zero-size marker sitting exactly on the
      // crease and carrying no transform of its own, so the movement is timed
      // against the thing the reader is watching.
      const [anchor] = q("[data-fold-anchor]") as HTMLElement[];

      mm.add(DESKTOP + " and (prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: anchor ?? root,
          // Opens as the crease comes up off the bottom of the window and is
          // done with it a little above the middle, so the sheet it unfolds
          // into has the rest of the section to be read in.
          start: "top 92%",
          end: "top 38%",
          scrub: 0.5,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => render(self.progress),
        });
        // Not `render(0)`: a reader who lands already scrolled past this
        // section should be given the opened sheet, and `st.progress` is
        // already 1 for them.
        render(st.progress);
        return () => st.kill();
      });

      // Reduced motion is handed the opened paper: the fold is a flourish, and
      // the sponsors are the content. Nothing moves and nothing makes a noise.
      mm.add(DESKTOP + " and (prefers-reduced-motion: reduce)", () => {
        render(1);
        return () => undefined;
      });

      return () => mm.revert();
    },
    { scope: stageRef },
  );

  return (
    <div
      ref={stageRef}
      className="relative select-none"
      style={{
        width: SHEET_W,
        height: SHEET_H,
        perspective: 1900,
        perspectiveOrigin: "50% " + CREASE + "px",
      }}
    >
      {/* The opened page. Held at zero until the fold gives; `header` is empty
          because on this version of the sheet the nameplate is printed on the
          cover, and what stands in its place is the travelling headline below —
          kept out here, over the top, so the clip that unfolds the sheet does
          not cut through it on the way. */}
      <div data-sheet className="absolute inset-0 opacity-0">
        <SponsorEdition header={<></>} />
      </div>

      {/* What the opening is timed against — see the note by the trigger. Zero
          size, on the crease, and never moved by any of this. */}
      <div
        aria-hidden
        data-fold-anchor
        className="pointer-events-none absolute left-0 h-0 w-full"
        style={{ top: CREASE }}
      />

      {/* The folded paper: a stack of loose sheets, and the nameplate across
          them cut through at the crease. */}
      <div
        data-fold
        className="absolute left-0"
        style={{
          top: COVER_Y,
          width: SHEET_W,
          height: COVER_H,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          aria-hidden
          data-fold-dressing
          className="pointer-events-none absolute inset-0 translate-x-[5px] translate-y-[-9px] rotate-[2deg] rounded-[2px] border border-black/10 bg-[#d0d0cb] shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
        />
        <div
          aria-hidden
          data-fold-dressing
          className="pointer-events-none absolute inset-0 translate-x-[5px] translate-y-[9px] rotate-[-2deg] rounded-[2px] border border-black/10 bg-[#dedede] shadow-[0_14px_34px_rgba(0,0,0,0.26)]"
        />

        {/* The folded paper's own shadow, on a box of its own behind the two
            panels rather than on the box carrying them.

            It used to sit on that carrier, which never fades — only the panels
            inside it do — so once the paper had swung away and gone, its
            shadow stayed: a hard black band lying across the middle of the
            open sheet for the rest of the section. Out here it is dressing
            like the loose sheets and the crease, and it leaves when they do.
            It also cannot take `preserve-3d` with it, which is the other half
            of why it belongs on its own element: fading the carrier would
            force `transform-style: flat` and collapse the panels' perspective
            part-way through the swing. */}
        <div
          aria-hidden
          data-fold-dressing
          className="pointer-events-none absolute inset-0 shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
        />

        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          <FoldPanel side="left" />
          <FoldPanel side="right" />
        </div>

        {/* The crease. A hard line with the paper's own shadow banked above it,
            so the cut edge reads as thickness rather than as a border. */}
        <div
          aria-hidden
          data-fold-dressing
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[26px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.16)_78%,rgba(0,0,0,0.5)_100%)]"
        />
      </div>

      {/* The section's headline. Under the folded paper to begin with, up in
          the sheet's own top band by the end. */}
      <div data-headline className="absolute inset-x-0 top-0 origin-top">
        <div className="relative h-[200px]">
          <div className="absolute top-[46px] left-[32.59px] w-[520px] font-rotonto text-[32px] font-light leading-[1.12] tracking-wide text-[#fa1a1d]">
            {SPONSOR_HEADING.tagline}
          </div>
          <div className="absolute top-[34px] right-[32.59px] text-right font-rotonto text-[62px] font-normal leading-[0.9] tracking-tight text-[#fa1a1d]">
            OUR
            <br />
            SPONSORS
          </div>
        </div>
        <div
          data-headline-rule
          aria-hidden
          className="absolute top-[199.73px] left-[29.11px] h-[2.2px] w-[1125.4px] border-t-[2.2px] border-black opacity-0"
        />
      </div>
    </div>
  );
}
