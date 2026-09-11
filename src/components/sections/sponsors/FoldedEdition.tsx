"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import SponsorEdition from "./SponsorEdition";
import SealedCover from "./SealedCover";
import { SPONSOR_HEADING } from "./copy";
import { DESKTOP } from "@/components/motion/recipes";
import { paperUnfold } from "@/components/motion/paper";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The sponsor sheet as a cover that opens, the way a book does.
 *
 * The reader arrives at a closed edition — a sealed one, see `SealedCover`.
 * Scroll on and the cover lifts on a spine down its left edge and swings away
 * from the page, and the sheet under it is uncovered by the cover's own edge
 * travelling across it, leaving THE HACKSTREET JOURNAL where it has always
 * been printed.
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
 * The section's own title and standfirst are set in red on the black *above*
 * the paper, and they do not move. They used to be printed on the cover and
 * flown up into the sheet's top band as it opened, which meant that what the
 * reader ended up looking at was a broadsheet with OUR SPONSORS where its
 * nameplate should be, and a hand's width of empty newsprint under it. The
 * paper prints its own masthead; the section says what the section is, from
 * outside the paper. See `SPONSOR_HEADING`.
 *
 * Everything here is transform and clip only. The collage this sits in is a
 * fixed 1280 x 12818 frame where every section holds an exact `top` (see
 * `DesignCanvas`), so an animation that changed its own height would push six
 * sections down the page. The closed cover is absolutely placed so that the
 * open sheet lands exactly where `SponsorEdition` has always sat, and the
 * section measures the same at every point in the movement.
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

/** The heading band above the paper: how tall it is, and the air between it
 *  and the sheet's top edge. Both in the sheet's own units, because the two are
 *  scaled to the window as one block — the heading has to shrink with the paper
 *  or it would end up larger than the masthead it is standing next to. */
const HEAD_H = 72;
const HEAD_GAP = 26;
/**
 * How far the two heading blocks are held in from the sheet's edges.
 *
 * 29.11 is where the paper's own rules start and stop — the heavy one under
 * the nameplate and every column rule below it — so the standfirst lines up
 * with the left end of them and the title with the right, and the heading
 * reads as part of the same setting rather than floating over the corners.
 *
 * It also buys the clearance the title needs. The nav sticker is fixed to the
 * top-right of the *viewport*, outside the collage entirely (see `SiteNav`),
 * so it lands on whatever this section puts in that corner; set flush to the
 * sheet's edge, SPONSORS ran into it.
 */
const HEAD_INSET = 29.11;

/** The whole block — the heading, the gap, and the sheet. `Sponsors` reserves
 *  exactly this so the section's layout matches what is drawn in it. */
export const EDITION_BLOCK_HEIGHT = HEAD_H + HEAD_GAP + SHEET_H;

/** How much of the window's height the block is allowed at most.
 *
 * The section has no scroll runway reserved to hold it on screen (unlike the
 * track deck, which is drawn taller for exactly that), so the only lever
 * available is size: on a short window the block at its drawn size is taller
 * than the viewport and the reveal is never on screen whole at once. Scaling
 * it down to fit means there is at least one point in the scroll where the
 * whole opened sheet is visible together, which a fixed size can't promise.
 * Kept close to 1 rather than a smaller safety margin — the sheet reads as
 * a broadsheet and wants to fill the window, not sit in the middle of it. */
const VIEWPORT_FIT = 0.95;

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

/**
 * The cover, hinged on its left edge.
 *
 * One panel, not two. The spine is the outer edge it is held at, so the free
 * edge is the far one and it is that edge which travels across the page — the
 * whole reason the sheet underneath can be uncovered geometrically rather than
 * faded in on a guess. It is also the edge `SealedCover` marks with its
 * perforation, so the cue and the hinge are on the same side.
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
      <SealedCover />

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

      const desktop = window.matchMedia(DESKTOP);
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

      let canvasScale = 1;
      let parkStart = 0;
      let travelPx = TRAVEL_PLATE;
      let armed = false;
      let drawn = Number.NaN;

      /**
       * Scales the whole block — heading and sheet together — so it fits inside
       * the window's height at `VIEWPORT_FIT`, on a short window where it would
       * otherwise be taller than the viewport and never on screen whole at once.
       *
       * Measured on `fit` rather than on the sheet alone: the heading is part of
       * what has to be on screen with the paper, so it is part of what is being
       * fitted, and scaling the two by different amounts would leave the section
       * title floating at a size the paper's own masthead never agreed to.
       */
      const fitToViewport = () => {
        fit.style.transform = "";
        const rendered = fit.getBoundingClientRect().height;
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
        const renderedHeight = EDITION_BLOCK_HEIGHT * fitScale * canvasScale;
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
    /* `overflow-anchor: none` for the same reason the track deck carries it:
       this element is counter-translated against the scroll, and Chrome's
       scroll anchoring will re-scroll the page to hold something inside it
       still if it is allowed to pick an anchor in here. */
    <div ref={parkRef} className="relative" style={{ overflowAnchor: "none" }}>
      <div
        ref={fitRef}
        style={{ width: SHEET_W, transformOrigin: "top center" }}
      >
        {/* The section's own heading, on the black above the paper: the
            standfirst in the left corner, the title in the right. Part of the
            parked, fitted block rather than a row above it — it has to stay
            with the paper while the paper is held on screen, and it has to
            shrink with it so the two are set at one size. */}
        <div
          className="flex items-start justify-between font-rotonto text-[#fa1a1d]"
          style={{
            height: HEAD_H,
            marginBottom: HEAD_GAP,
            paddingLeft: HEAD_INSET,
            paddingRight: HEAD_INSET,
          }}
        >
          <p className="flex items-end gap-[14px] text-[25px] font-light leading-[1.16] tracking-wide">
            <span>
              {SPONSOR_HEADING.taglineLines[0]}
              <br />
              {SPONSOR_HEADING.taglineLines[1]}
            </span>
            <img
              alt=""
              aria-hidden
              src="/figma/star2.svg"
              className="mb-[6px] block h-[22px] w-[20px] shrink-0"
            />
          </p>
          <p className="text-right text-[40px] font-normal leading-[0.88] tracking-tight">
            {SPONSOR_HEADING.titleLines[0]}
            <br />
            {SPONSOR_HEADING.titleLines[1]}
          </p>
        </div>

        <div
          ref={stageRef}
          className="relative select-none"
          style={{
            width: SHEET_W,
            height: SHEET_H,
            perspective: 1900,
            // Toward the spine, so the swing is read as a cover coming up off
            // the page rather than as a panel sliding sideways.
            perspectiveOrigin: "22% 50%",
          }}
        >
          {/* The opened page, nameplate and all — this is the edition the
              reader was promised, so it prints its own masthead.

              Clipped shut in the markup, not by the first frame of the
              animation: the page is statically exported, so without it the
              whole sheet is in the HTML uncovered and shows for as long as it
              takes the script to arrive. */}
          <div
            data-sheet
            className="absolute inset-0"
            style={{ clipPath: "inset(0% 0% 0% 100%)" }}
          >
            <SponsorEdition />
          </div>

          {/* The closed edition: the pages stacked under it, and the sealed
              cover itself. */}
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

                It cannot go on the cover, which rotates: a box-shadow rotates
                with its box, and the shadow of a lifting cover does not swing
                off the page with it. Out here it is dressing like the stacked
                pages, and it leaves when they do — which is also what stopped
                it being left behind as a hard black band lying across the open
                sheet. */}
            <div
              aria-hidden
              data-cover-dressing
              className="pointer-events-none absolute inset-0 shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
            />

            <BookCover />
          </div>
        </div>
      </div>
    </div>
  );
}
