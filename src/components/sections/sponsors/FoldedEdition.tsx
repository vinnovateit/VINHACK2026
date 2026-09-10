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
 * The sponsor sheet as a cover that opens, the way a book does.
 *
 * The reader arrives at a closed edition: one cover, the nameplate across the
 * top of it, the section's headline printed underneath. Scroll on and the cover
 * lifts on a spine down its left edge and swings away from the page, and the
 * sheet under it is uncovered by the cover's own edge travelling across it. The
 * headline rides up into the band the nameplate vacates as it goes.
 *
 * It used to be a pamphlet: the paper split down the middle and both halves
 * swung out on their outer edges at once. Two hinges going opposite ways is a
 * gatefold or a greetings card, not a book — and it was reading as one.
 *
 * The uncovering is not a fade. A cover on a hinge hides exactly the strip its
 * own projection still covers, so the sheet is clipped at `cos(angle)` of its
 * width and the paper appears from the right edge inward at the rate the cover
 * actually leaves — see `render`. Nothing is timed against anything else, which
 * is why the two never drift apart.
 *
 * Everything here is transform and clip only. The collage this sits in is a
 * fixed 1280 x 12818 frame where every section holds an exact `top` (see
 * `DesignCanvas`), so an animation that changed its own height would push six
 * sections down the page. The closed cover is absolutely placed so that the
 * open sheet lands exactly where `SponsorEdition` has always sat, and the
 * section measures the same 840px at every point in the movement.
 *
 * Coordinates below are in the sheet's own 1184 x 758.4 Figma units, which is
 * also the size it is printed at — `Sponsors` gives it a column of exactly
 * that, so there is no fitting scale between the two and nothing in here has
 * to know about one.
 */

/** The sheet, at the size it was drawn. The cover is the same box: a book's
 *  cover is its page, not a band across the top of one. */
const SHEET_W = 1184;
const SHEET_H = 758.4;

/** How much of the window's height the sheet is allowed at most.
 *
 * The section has no scroll runway reserved to hold it on screen (unlike the
 * track deck, which is drawn taller for exactly that), so the only lever
 * available is size: on a short window the sheet at its drawn size is taller
 * than the viewport and the reveal is never on screen whole at once. Scaling
 * it down to fit means there is at least one point in the scroll where the
 * whole opened sheet is visible together, which a fixed size can't promise.
 * Kept close to 1 rather than a smaller safety margin — the sheet reads as
 * a broadsheet and wants to fill the window, not sit in the middle of it. */
const VIEWPORT_FIT = 0.94;

/**
 * How far the cover swings, in degrees.
 *
 * Deliberately short of 90. The cover is `backface-visibility: hidden`, because
 * the reverse of a printed cover is not the same cover mirrored, and a panel
 * that crosses 90 degrees is therefore switched off between one frame and the
 * next. Stopping at 88 and taking the opacity to zero by then means the cover
 * is gone because it went edge-on and faded, not because it flipped.
 *
 * It is also as far as there is room for. Past 90 the cover swings out beyond
 * the spine and over the page's left margin, and the plate is only 48px wider
 * than the sheet either side — it would be cut off against the frame's clip.
 */
const SWING = 88;

/** The headline's two positions: centred in the blank lower two-thirds of the
 *  closed cover, and up in the band the nameplate used to occupy once the
 *  sheet is open. */
const HEADLINE_CLOSED_Y = 360;
const HEADLINE_OPEN_Y = 30;

/** How much bigger the headline reads on the closed cover than once it has
 *  settled into the open sheet's header band. */
const HEADLINE_CLOSED_SCALE = 1.3;

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
 * The cover, hinged on its left edge.
 *
 * One panel, not two. The spine is the outer edge it is held at, so the free
 * edge is the far one and it is that edge which travels across the page — the
 * whole reason the sheet underneath can be uncovered geometrically rather than
 * faded in on a guess.
 */
function BookCover() {
  return (
    <div
      data-cover
      className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
      style={{
        transformOrigin: "left center",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="absolute inset-0 text-left text-[18px] text-black [font-family:var(--font-rotonto),_Rotonto,_sans-serif]">
        <EditionMasthead />
      </div>

      {/* The spine. A book is thicker at the fold than across the page, and the
          band of shadow gathered there is most of what says so — it is on the
          cover rather than under it, so it goes when the cover does. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[34px] bg-[linear-gradient(90deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0)_100%)]"
      />

      {/* The shading a cover picks up as it turns away from the light. Flat at
          rest, so the closed edition is a clean printed surface; `render`
          brings it up as the cover swings, darkest at the spine, which is the
          part that ends up facing away. */}
      <div
        data-cover-shade
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0) 100%)",
        }}
      />
    </div>
  );
}

const TRAVEL_PLATE = 700;

export default function FoldedEdition() {
  const parkRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  /** Latches the rustle to one per opening, and re-arms if you scroll back up
   *  past the closed state — a scrubbed trigger crosses a threshold many times
   *  while a trackpad settles, and the sound is an event, not a position. */
  const soundedRef = useRef(false);

  useGSAP(
    () => {
      const root = stageRef.current;
      const parkEl = parkRef.current;
      const fit = fitRef.current;
      if (!root || !parkEl || !fit) return;

      const q = gsap.utils.selector(root);
      const [cover] = q("[data-cover]") as HTMLElement[];
      const [shade] = q("[data-cover-shade]") as HTMLElement[];
      const dressing = q("[data-cover-dressing]") as HTMLElement[];
      const [sheet] = q("[data-sheet]") as HTMLElement[];
      const [headline] = q("[data-headline]") as HTMLElement[];
      const [rule] = q("[data-headline-rule]") as HTMLElement[];

      const desktop = window.matchMedia(DESKTOP);
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

      let canvasScale = 1;
      let parkStart = 0;
      let travelPx = TRAVEL_PLATE;
      let armed = false;
      let drawn = Number.NaN;

      /**
       * Scales the whole sheet down so it fits inside the window's height at
       * `VIEWPORT_FIT`, on a short window where the sheet at its drawn size
       * would otherwise be taller than the viewport and never on screen whole
       * at once.
       */
      const fitToViewport = () => {
        fit.style.transform = "";
        const rendered = root.getBoundingClientRect().height;
        const s =
          rendered > 0
            ? Math.min(1, (window.innerHeight * VIEWPORT_FIT) / rendered)
            : 1;
        fit.style.transform = s < 1 ? `scale(${s})` : "";
        return s;
      };

      const park = (plateY: number) => {
        parkEl.style.transform = `translate3d(0, ${plateY}px, 0)`;
      };

      const render = (p: number) => {
        // Generous scroll distance and smooth staging so the unfold animation
        // feels paced, deliberate and rock-solid while screen locked.
        const swing = stage(p, 0.05, 0.92);
        const travel = stage(p, 0.15, 0.94);

        const angle = SWING * swing;

        if (cover) {
          gsap.set(cover, {
            rotateY: -angle,
            opacity: 1 - smooth(Math.max(0, (swing - 0.58) / 0.36)),
          });
        }
        if (shade) gsap.set(shade, { opacity: swing });

        for (const bit of dressing) {
          gsap.set(bit, {
            opacity: 1 - smooth(Math.max(0, (swing - 0.1) / 0.35)),
          });
        }

        if (headline) {
          gsap.set(headline, {
            y: mix(HEADLINE_CLOSED_Y, HEADLINE_OPEN_Y, travel),
            scale: mix(HEADLINE_CLOSED_SCALE, 1, travel),
          });
        }
        if (rule) gsap.set(rule, { opacity: travel });

        if (sheet) {
          const covered = Math.cos((90 * swing * Math.PI) / 180) * 100;
          gsap.set(sheet, {
            clipPath: `inset(0% 0% 0% ${covered.toFixed(3)}%)`,
          });
        }

        // One rustle, on the way in, as the cover actually gives.
        if (p > 0.18 && !soundedRef.current) {
          soundedRef.current = true;
          paperUnfold();
        } else if (p < 0.05) {
          soundedRef.current = false;
        }
      };

      const measure = () => {
        if (!desktop.matches) {
          armed = false;
          park(0);
          return;
        }

        const container = parkEl.parentElement;
        if (!container) {
          armed = false;
          return;
        }

        const fitScale = fitToViewport();
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          armed = false;
          return;
        }
        armed = true;

        canvasScale = rect.width / SHEET_W || 1;
        const renderedHeight = SHEET_H * fitScale * canvasScale;
        const targetTop = Math.max(0, (window.innerHeight - renderedHeight) / 2);
        const containerTopDoc = window.scrollY + rect.top;
        parkStart = containerTopDoc - targetTop;
        travelPx = TRAVEL_PLATE * canvasScale;
      };

      // Cache scrollY from the scroll event so the rAF tick always reads the
      // freshest value. window.scrollY inside rAF can be one composited frame
      // behind the browser's actual scroll position, which is what causes the
      // visible bob. The scroll event fires synchronously before paint on the
      // same frame the position changes, so caching it here gives rAF the
      // correct value with no lag — exactly as TracksCardDeck does.
      let cachedScrollY = window.scrollY;
      const onScroll = () => {
        cachedScrollY = window.scrollY;
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const update = () => {
        if (!armed) return;
        if (calm.matches) {
          park(0);
          render(1);
          return;
        }

        const stuck = gsap.utils.clamp(0, travelPx, cachedScrollY - parkStart);
        park(stuck / canvasScale);

        const p = stuck / travelPx;
        if (p !== drawn) {
          drawn = p;
          render(p);
        }
      };

      let rafId = 0;
      const tick = () => {
        update();
        rafId = requestAnimationFrame(tick);
      };

      const onLayout = () => {
        measure();
        drawn = Number.NaN;
        update();
      };

      onLayout();
      rafId = requestAnimationFrame(tick);

      window.addEventListener("resize", onLayout);
      desktop.addEventListener("change", onLayout);
      calm.addEventListener("change", onLayout);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onLayout);
        desktop.removeEventListener("change", onLayout);
        calm.removeEventListener("change", onLayout);
      };
    },
    { scope: stageRef },
  );

  return (
    <div ref={parkRef} className="relative">
      <div
        ref={fitRef}
        style={{ width: SHEET_W, height: SHEET_H, transformOrigin: "top center" }}
      >
      <div
        ref={stageRef}
        className="relative select-none"
        style={{
          width: SHEET_W,
          height: SHEET_H,
          perspective: 1900,
          // Toward the spine, so the swing is read as a cover coming up off the
          // page rather than as a panel sliding sideways.
          perspectiveOrigin: "22% 50%",
        }}
      >
        {/* The opened page. Clipped to nothing until the cover starts to lift;
            `header` is empty because on this edition the nameplate is printed on
            the cover, and what stands in its place is the travelling headline
            below — kept out here, over the top, so the clip that uncovers the
            sheet does not cut through it on the way. */}
        {/* Clipped shut in the markup, not by the first frame of the animation:
            the page is statically exported, so without it the whole sheet is in
            the HTML uncovered and shows for as long as it takes the script to
            arrive. */}
        <div
          data-sheet
          className="absolute inset-0"
          style={{ clipPath: "inset(0% 0% 0% 100%)" }}
        >
          <SponsorEdition header={<></>} />
        </div>

        {/* What the opening is timed against. Zero size, in the middle of the
            cover, and never moved by any of this. */}
        <div
          aria-hidden
          data-cover-anchor
          className="pointer-events-none absolute left-0 h-0 w-full"
          style={{ top: SHEET_H / 2 }}
        />

        {/* The closed edition: the pages stacked under it, and the cover itself
            with the nameplate across the top. */}
        <div
          data-book
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            aria-hidden
            data-cover-dressing
            className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[-9px] rotate-[0.7deg] rounded-[2px] border border-black/10 bg-[#d0d0cb] shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
          />
          <div
            aria-hidden
            data-cover-dressing
            className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[9px] rotate-[-0.7deg] rounded-[2px] border border-black/10 bg-[#dedede] shadow-[0_14px_34px_rgba(0,0,0,0.26)]"
          />

          {/* The closed edition's own shadow, on a box of its own behind the
              cover rather than on the cover itself.

              It cannot go on the cover, which rotates: a box-shadow rotates with
              its box, and the shadow of a lifting cover does not swing off the
              page with it. Out here it is dressing like the stacked pages, and it
              leaves when they do — which is also what stopped it being left
              behind as a hard black band lying across the open sheet. */}
          <div
            aria-hidden
            data-cover-dressing
            className="pointer-events-none absolute inset-0 shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
          />

          <BookCover />
        </div>

        {/* The section's headline. Printed centred on the closed cover to begin
            with, settling into the sheet's own top band by the end.
            Centred rather than split left/right (the tagline where the
            masthead's kicker line sits, "OUR SPONSORS" opposite it) because
            `data-headline` is scaled up whole from a top-centre origin while
            closed (see `HEADLINE_CLOSED_SCALE`): anything held off that centre
            line is pushed further from it as the scale grows, and at 1.3x a
            block sitting near either edge of the 1184px cover was carried
            straight off it. Content centred on that same axis has nowhere to
            drift to, at any scale. */}
        <div data-headline className="absolute inset-x-0 top-0 origin-top text-center">
          <div className="relative flex flex-col items-center gap-3 px-16 pt-2 pb-3">
            <div className="max-w-[640px] font-rotonto text-[26px] font-light leading-[1.2] tracking-wide text-[#fa1a1d]">
              {SPONSOR_HEADING.tagline}
            </div>
            <div className="font-rotonto text-[58px] font-normal leading-[0.9] tracking-tight text-[#fa1a1d]">
              OUR SPONSORS
            </div>
          </div>
          <div
            data-headline-rule
            aria-hidden
            className="absolute top-[199.73px] left-[29.11px] h-[2.2px] w-[1125.4px] border-t-[2.2px] border-black opacity-0"
          />
        </div>
      </div>
    </div>
  </div>
  );
}
