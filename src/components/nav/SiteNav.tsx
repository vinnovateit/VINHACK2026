"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import NavLogo from "@/components/nav/NavLogo";
import { FEATURES } from "@/content/features";
import { NAV } from "@/content/site";

/**
 * The site's navigation: a sticky logo sticker, and a shelf of books that pulls
 * in from the right edge and covers the screen when it is pressed.
 *
 * It sits *outside* `DesignCanvas` on purpose. The collage is a fixed 1280px
 * frame scaled whole by a CSS transform (see the note in `DesignCanvas`), and a
 * transformed ancestor is a containing block for `position: fixed` — put the
 * button inside it and "fixed" would mean "fixed to the canvas", which scrolls.
 * Out here it is fixed to the viewport, at a size chosen for the screen rather
 * than the design's scale factor times a size chosen for a 1280px frame.
 *
 * It is also the one piece of chrome that is drawn once for both layouts. The
 * rest of the page is drawn twice — collage above `md`, reflowed column below
 * (again, see `app/page.tsx`) — but a drawer is a drawer at either width. It
 * covers the screen at both, and the only thing that changes is the shelf
 * inside it: `.nav-shelf` in globals.css runs it long down a phone and wide
 * across a monitor.
 */

/**
 * The shelf as it will actually render. `PROJECTS` is behind a switch, and the
 * numbers printed on the spines are counted off *this* list rather than the
 * one in `content/site.ts`, so a shelf with Projects switched off still reads
 * 01 02 03 04 rather than skipping a number in the middle.
 */
const BOOKS = NAV.items.filter((item) => !item.flag || FEATURES[item.flag]);

/** How much later each book lands than the one before it. */
const TUMBLE_STEP = 52;

/** The pause before the first one, so the panel is most of the way in first. */
const TUMBLE_LEAD = 180;

/**
 * The arc the button's word is set along: left to right over the mark, bulging
 * up to a sagitta of 30 over a 104-wide chord, which puts the radius at
 * (52² + 30²) / (2 × 30). The box is cropped to just below the chord's ends, so
 * the word sits right down on the mark the way it does on the gamepad rather
 * than floating a sticker's height above it.
 *
 * Computed rather than transcribed, unlike the hero's scroll cue: that curve is
 * twenty glyphs the design file placed and turned by hand, and this is one word
 * on a circle, which `textPath` draws exactly and re-draws for free when the
 * word changes from EXPLORE to CLOSE.
 */
const ARC = "M8,38 A60.07,60.07 0 0 1 112,38";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scrolls to the section a spine names.
 *
 * The label is matched rather than an id because both layouts are in the
 * document at once and only one of them is laid out — so `Tracks` matches
 * twice, and the copy inside the `display: none` half has no boxes at all.
 * `getClientRects()` is exactly that test, and it also means this needs to know
 * nothing about the breakpoint the swap happens at.
 *
 * The offset is read from `getBoundingClientRect()` rather than `offsetTop`:
 * the desktop half sits inside a scaled plate, and only the former reports
 * where the section actually is on screen.
 */
function scrollToSection(target: string) {
  const section = Array.from(
    document.querySelectorAll<HTMLElement>(`section[aria-label="${target}"]`),
  ).find((el) => el.getClientRects().length > 0);
  if (!section) {
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.href = "/";
    }
    return;
  }

  window.scrollTo({
    top: Math.max(0, section.getBoundingClientRect().top + window.scrollY),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function SpineBody({ name, index }: { name: string; index: number }) {
  return (
    <span className="nav-spine-body">
      <span className="nav-cap" aria-hidden />
      <span className="nav-spine-label">{name}</span>
      {/* Printed on the board, at the foot of the spine. The order is already in
          the list for a screen reader; here it is part of the drawing. */}
      <span className="nav-spine-index" aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </span>
    </span>
  );
}

export default function SiteNav({ standalone }: { standalone?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  /**
   * The section a press picked, held until the drawer has let go of the page.
   * Scrolling is what the press is *for*, but the drawer locks body scroll
   * while it is open, so calling `window.scrollTo` from the click handler would
   * be a scroll against a locked page — a no-op, and the press would do nothing
   * at all. Parked here instead and spent once the lock is off.
   *
   * A ref rather than state because nothing renders it: it is a note passed
   * from the click to the effect below, and holding it in state would mean an
   * extra render on every press to put it there and another to clear it.
   */
  const pending = useRef<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  /* Hold the page still under the drawer. The padding makes up for the
     scrollbar the lock removes — without it the whole full-bleed collage jumps
     sideways by its width the moment the shelf opens, and back again on
     close. */
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
    };
  }, [open]);

  /* The parked scroll. Every cleanup in a commit runs before every setup, and
     the lock above is declared first — so by the time this runs the page can
     be scrolled again. */
  useEffect(() => {
    if (open) return;
    const target = pending.current;
    if (!target) return;
    pending.current = null;
    scrollToSection(target);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      {/* The sticker, in the corner the design gives the hero gamepad and
          drawn the same way it is: a word curving over the mark, no box round
          either of them. It outranks the drawer, so once the shelf is out this
          is still the thing in the corner — and it is what closes it.

          The dock is what holds that corner, and it is a separate box from the
          button for the same reason a book on the shelf is: two things move
          this sticker and a box has one transform. The dock is thrown onto the
          page with the hero's other stickers — `data-hero="nav"` is what
          `HeroMotion` deals, and `.nav-dock` in globals.css is the phone's
          half of the same arrival — while the button underneath keeps the turn
          it rests at, the turn it takes under the pointer, and the one it
          swings to when the shelf is out. */}
      <div className={`nav-dock ${standalone ? "!opacity-100 !animate-none" : ""}`} data-hero="nav">
        <button
          ref={buttonRef}
          type="button"
          className="nav-button"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? NAV.close : NAV.open}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <svg className="nav-button-arc" viewBox="0 0 120 40" aria-hidden>
            <path id="nav-button-arc" d={ARC} fill="none" />
            <text>
              <textPath href="#nav-button-arc" startOffset="50%" textAnchor="middle">
                {open ? NAV.badge.open : NAV.badge.closed}
              </textPath>
            </text>
          </svg>
          <NavLogo className="nav-button-mark" />
        </button>
      </div>

      <nav
        ref={panelRef}
        id="site-nav"
        className="nav-panel"
        aria-label={NAV.title}
        data-open={open}
        /* Closed, the shelf is off-screen and its ten buttons must not be
           tab stops sitting in front of the page's own. */
        inert={!open}
        tabIndex={-1}
      >
        <p className="nav-eyebrow">{NAV.label}</p>

        <ul className="nav-shelf">
          {BOOKS.map((book, i) => (
            /* Three layers, because two different things move this book and a
               box can only hold one transform at a time:

                 li      the tumble, on the way in
                 button  nothing — the hit area, which must not move
                 body    the pull, under the pointer

               The middle one is the fix for a shelf that used to flicker. When
               the book itself was the button, pulling it 26px clear of the
               pointer on `:hover` took it out from under that pointer, which
               un-hovered it, which put it back — several times a second for as
               long as you rested near its edge. The button holds still now and
               only what is drawn inside it moves. */
            <li
              key={book.name}
              className="nav-book"
              style={
                {
                  "--spine": book.spine,
                  "--cap": book.cap,
                  "--ink": book.ink,
                  "--book": book.book,
                  "--tumble-delay": `${TUMBLE_LEAD + i * TUMBLE_STEP}ms`,
                } as CSSProperties
              }
            >
              {book.href ? (
                /* A book that opens another page (LOGIN) is a real link, so it
                   can be opened in a new tab and reads as a link to a screen
                   reader; the rest scroll this page and stay buttons. */
                <Link href={book.href} className="nav-spine" onClick={() => setOpen(false)}>
                  <SpineBody name={book.name} index={i} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="nav-spine"
                  onClick={() => {
                    pending.current = book.target ?? null;
                    close();
                  }}
                >
                  <SpineBody name={book.name} index={i} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
