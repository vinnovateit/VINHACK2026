"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import {
  SPONSOR_HEADING,
  SUPPORTERS,
  TITLE_SPONSOR,
} from "@/components/sections/sponsors/copy";
import { MOBILE } from "@/components/motion/recipes";
import { paperTurn } from "@/components/motion/paper";
import { useInView } from "@/components/useInView";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const NEWSPRINT = "#ebebe9";
const INK_RED = "#fa1a1d";

const CARD_WIDTH = 320;
const CARD_HEIGHT = 480;

/** Scroll travel per card */
const TRAVEL_PER_CARD = 220;
const DWELL = 0.28;

const STAGE_MIN = CARD_HEIGHT + 32;
const STAGE_HEIGHT = `max(${STAGE_MIN}px, 100svh)`;

/** Waiting its turn: back in the pile, up and to the right. */
const PILE = { x: 44, y: -28, rotate: 13, skew: 12, scale: 0.9 };
/** Done: gone down and to the left, the way a read page is set aside. */
const EXIT = { x: -172, y: 92, rotate: 14, skew: 13, scale: 0.88 };

function smooth(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-[13px] font-normal uppercase tracking-wider leading-none"
      style={{ color: INK_RED }}
    >
      {children}
    </div>
  );
}

function Rule({ heavy = false }: { heavy?: boolean }) {
  return (
    <div
      aria-hidden
      className="w-full shrink-0"
      style={{ borderTop: (heavy ? 2 : 1) + "px solid #000" }}
    />
  );
}

const CARDS: { label: string; body: ReactNode }[] = [
  {
    label: SPONSOR_HEADING.title,
    body: (
      <div className="flex h-full flex-col justify-between py-2 text-center">
        <Rule heavy />
        <div className="my-auto flex flex-col gap-4">
          <div
            className="text-[44px] font-normal leading-[0.92] tracking-tight"
            style={{ color: INK_RED }}
          >
            OUR
            <br />
            SPONSORS
          </div>
          <div
            className="text-[18px] font-normal leading-[1.2] tracking-wide"
            style={{ color: INK_RED }}
          >
            {SPONSOR_HEADING.tagline}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Rule heavy />
          <div className="flex items-center justify-between text-[11px] font-normal uppercase tracking-wider text-[#555]">
            <span>VOL. 26 · SPECIAL EDITION</span>
            <span>30H ∞ BUILD</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Title sponsor",
    body: (
      <div className="flex h-full flex-col justify-between py-2 text-center">
        <Rule heavy />
        <div className="my-auto flex flex-col items-center gap-4">
          <Kicker>{TITLE_SPONSOR.header}</Kicker>
          <a
            href={TITLE_SPONSOR.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 active:opacity-75 transition-opacity cursor-pointer px-2"
          >
            <Image
              src="/sponsors/fateh.webp"
              alt="Fateh Education"
              width={260}
              height={90}
              className="h-[68px] w-auto object-contain my-1"
            />
            <p className="text-[14px] font-normal text-[#333] leading-[1.35] max-w-[260px]">
              {TITLE_SPONSOR.tagline}
            </p>
          </a>
        </div>
        <Rule heavy />
      </div>
    ),
  },
  {
    label: "Travel & Wellness Partners",
    body: (
      <div className="flex h-full flex-col justify-between py-2">
        <Rule heavy />
        {/* AbhiBus */}
        <a
          href={SUPPORTERS[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-2 text-center px-2 py-1 active:opacity-75 transition-opacity cursor-pointer"
        >
          <Kicker>{SUPPORTERS[0].header}</Kicker>
          <div className="h-[46px] flex items-center justify-center">
            <Image
              src={SUPPORTERS[0].logo || "/sponsors/abhibus.webp"}
              alt={SUPPORTERS[0].name}
              width={160}
              height={46}
              className="max-h-[42px] w-auto object-contain"
            />
          </div>
          <p className="text-[13px] font-normal text-[#333] leading-snug max-w-[250px]">
            {SUPPORTERS[0].tagline}
          </p>
        </a>

        <div className="w-full border-t border-dashed border-black/30 my-1" />

        {/* Aha Therapy */}
        <a
          href={SUPPORTERS[1].url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-2 text-center px-2 py-1 active:opacity-75 transition-opacity cursor-pointer"
        >
          <Kicker>{SUPPORTERS[1].header}</Kicker>
          <div className="h-[46px] flex flex-col items-center justify-center">
            <Image
              src={SUPPORTERS[1].logo || "/sponsors/aha.webp"}
              alt={SUPPORTERS[1].name}
              width={130}
              height={46}
              className="max-h-[38px] w-auto object-contain"
            />
            <span className="font-rotonto text-[11px] font-medium tracking-[0.16em] text-[#2d6a4f] uppercase leading-none mt-0.5">
              Therapy
            </span>
          </div>
          <p className="text-[13px] font-normal text-[#333] leading-snug max-w-[250px]">
            {SUPPORTERS[1].tagline}
          </p>
        </a>
        <Rule heavy />
      </div>
    ),
  },
  {
    label: "Streaming & Portfolio Partners",
    body: (
      <div className="flex h-full flex-col justify-between py-2">
        <Rule heavy />
        {/* JioSaavn */}
        <a
          href={SUPPORTERS[2].url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-2 text-center px-2 py-1 active:opacity-75 transition-opacity cursor-pointer"
        >
          <Kicker>{SUPPORTERS[2].header}</Kicker>
          <div className="h-[46px] flex items-center justify-center">
            <Image
              src={SUPPORTERS[2].logo || "/sponsors/jiosaavn.webp"}
              alt={SUPPORTERS[2].name}
              width={160}
              height={46}
              className="max-h-[44px] w-auto object-contain"
            />
          </div>
          <p className="text-[13px] font-normal text-[#333] leading-snug max-w-[250px]">
            {SUPPORTERS[2].tagline}
          </p>
        </a>

        <div className="w-full border-t border-dashed border-black/30 my-1" />

        {/* Ola.cv */}
        <a
          href={SUPPORTERS[3].url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-2 text-center px-2 py-1 active:opacity-75 transition-opacity cursor-pointer"
        >
          <Kicker>{SUPPORTERS[3].header}</Kicker>
          <div className="h-[46px] flex items-center justify-center">
            <Image
              src={SUPPORTERS[3].logo || "/sponsors/ola_cv.webp"}
              alt={SUPPORTERS[3].name}
              width={130}
              height={46}
              className="max-h-[46px] w-auto object-contain"
            />
          </div>
          <p className="text-[13px] font-normal text-[#333] leading-snug max-w-[250px]">
            {SUPPORTERS[3].tagline}
          </p>
        </a>
        <Rule heavy />
      </div>
    ),
  },
];

const COUNT = CARDS.length;

export default function MobileSponsors() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const contentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const activeRef = useRef(-1);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const mm = gsap.matchMedia();

      const render = (p: number, sound: boolean) => {
        for (let i = 0; i < COUNT; i++) {
          const el = cardRefs.current.get(i);
          const content = contentRefs.current.get(i);
          if (!el) continue;

          const raw = p - i;
          const d = gsap.utils.clamp(-1, 1, raw);
          const behind = Math.min(3, Math.max(0, -raw - 1));

          const away = Math.max(0, (Math.abs(d) - DWELL) / (1 - DWELL));
          const t = smooth(1 - away);
          const from = d <= 0 ? PILE : EXIT;

          gsap.set(el, {
            x: mix(from.x, 0, t) + behind * 14,
            y: mix(from.y, 0, t) - behind * 8,
            rotate: mix(from.rotate, 0, t),
            skewX: mix(from.skew, 0, t),
            scale: mix(from.scale, 1, t),
            opacity: d <= 0 ? 1 : smooth(1 - Math.min(1, away * 1.8)),
          });

          if (content) {
            gsap.set(content, { opacity: smooth(1 - Math.min(1, away * 1.9)) });
          }
        }

        const active = Math.min(COUNT - 1, Math.max(0, Math.round(p)));

        if (sound && active !== activeRef.current) {
          if (activeRef.current !== -1) paperTurn();
          activeRef.current = active;
        }
      };

      mm.add(MOBILE + " and (prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "+=" + COUNT * TRAVEL_PER_CARD,
          scrub: true,
          onUpdate: (self) => render(self.progress * (COUNT - 1), true),
          onRefresh: (self) => render(self.progress * (COUNT - 1), false),
        });
        render(0, false);
        return () => st.kill();
      });

      mm.add(MOBILE + " and (prefers-reduced-motion: reduce)", () => {
        const stage = wrap.querySelector<HTMLElement>("[data-deck-stage]");
        const rail = wrap.querySelector<HTMLElement>("[data-deck-rail]");
        const touched: HTMLElement[] = [];

        const lay = (
          el: HTMLElement | null,
          css: Partial<CSSStyleDeclaration>,
        ) => {
          if (!el) return;
          Object.assign(el.style, css);
          touched.push(el);
        };

        lay(wrap, { height: "auto" });
        lay(stage, { position: "static", height: "auto", display: "block" });
        lay(rail, { width: "auto", height: "auto" });

        for (let i = 0; i < COUNT; i++) {
          const el = cardRefs.current.get(i);
          const content = contentRefs.current.get(i);
          lay(el ?? null, { position: "relative", marginBottom: "18px" });
          if (el) {
            gsap.set(el, {
              x: 0,
              y: 0,
              rotate: 0,
              skewX: 0,
              scale: 1,
              opacity: 1,
            });
          }
          if (content) gsap.set(content, { opacity: 1 });
        }

        return () => touched.forEach((el) => el.removeAttribute("style"));
      });

      return () => mm.revert();
    },
    { scope: wrapRef },
  );

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Sponsors"
      className="relative mx-auto w-full max-w-[560px] px-4 py-10"
    >
      <h2 className="sr-only">
        {SPONSOR_HEADING.title} — {SPONSOR_HEADING.tagline}
      </h2>

      <div
        ref={wrapRef}
        className="relative"
        style={{
          height: `calc(${COUNT * TRAVEL_PER_CARD}px + ${STAGE_HEIGHT})`,
        }}
      >
        <ul className="sr-only">
          {CARDS.map((card) => (
            <li key={card.label}>{card.label}</li>
          ))}
        </ul>

        <div
          data-deck-stage
          className="sticky top-0 flex items-center justify-center"
          style={{ height: STAGE_HEIGHT }}
          aria-hidden
        >
          <div
            data-deck-rail
            className="relative"
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          >
            {CARDS.map((card, i) => (
              <div
                key={card.label}
                ref={(el) => {
                  if (el) cardRefs.current.set(i, el);
                  else cardRefs.current.delete(i);
                }}
                className="absolute inset-0 origin-center will-change-transform"
                style={
                  {
                    zIndex: COUNT - i,
                    backgroundColor: NEWSPRINT,
                    boxShadow:
                      "0 18px 40px rgba(0,0,0,0.42), 0 3px 10px rgba(0,0,0,0.24)",
                    border: "1px solid rgba(0,0,0,0.14)",
                  } as CSSProperties
                }
              >
                <div
                  ref={(el) => {
                    if (el) contentRefs.current.set(i, el);
                    else contentRefs.current.delete(i);
                  }}
                  className="h-full w-full overflow-hidden px-4 py-4 text-left text-black [font-family:var(--font-rotonto),_Rotonto,_sans-serif]"
                >
                  {card.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
