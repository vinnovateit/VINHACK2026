"use client";

import gsap from "gsap";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Booth, { type Shot } from "@/components/memories/Booth";
import StickerArt from "@/components/memories/StickerArt";
import {
  CARD,
  GROUND,
  HEADLINE,
  MESSAGE,
  WINDOW,
  fitMessage,
  font,
  measurer,
  textHome,
  type Aspect,
  type Line,
  type Placed,
  type PlacedText,
} from "@/components/memories/card";
import { paintCard } from "@/components/memories/paint";
import { BY_ID, STICKERS, boxOf, type Sticker } from "@/components/memories/stickers";
import { PASS_VARIANTS } from "@/components/pass/variants";
import { MEMORIES } from "@/content/site";

/**
 * The memory-card studio: the preview half of the pair described in `card.ts`,
 * and the second of the page's two stages — `Booth` takes the picture, this
 * puts things on it.
 *
 * The card is laid out at its full 1080-unit size inside a box that has been
 * scaled down with one transform, rather than in CSS units worked out from the
 * viewport. That is the whole trick: every figure in this file is a card unit,
 * which is a pixel of the saved PNG, so what is on screen and what `paint.ts`
 * draws cannot drift apart. `unit` — the scale that box is at — is only ever
 * used for two things: turning a pointer position back into card units, and
 * keeping the selection handles a constant size on screen while everything
 * around them shrinks.
 *
 * Sticker and text positions are fractions of the card rather than card units,
 * so the square / story switch keeps an arrangement instead of stranding half
 * of it off the bottom of the taller card.
 *
 * The message is a movable piece like any other. It is the only one that is not
 * a sticker, so it gets its own bit of state rather than a place in `placed` —
 * there is one of it, it cannot be deleted, and what it says is chosen from a
 * list rather than picked up from a tray.
 *
 * What the preview deliberately does not draw is the branding. The saved image
 * gets a black bar top and bottom with the two marks in it (see `paintCard`),
 * and none of that is furniture the viewer should have to compose around.
 *
 * There is no share button. This is a static export with no server behind it,
 * so it cannot hand a file to Instagram or LinkedIn — it says where to post the
 * picture instead of offering a button that would not actually post it.
 */

const MIN_SCALE = 0.25;
const MAX_SCALE = 3.5;
/** On-screen size of a selection handle, in CSS pixels, held constant however
 *  far the card or the piece under it has been scaled. */
const HANDLE = 40;

/** What is selected. The message is a piece too, and the one that is not in
 *  `placed`, so it is named rather than numbered. */
type Target = { kind: "text" } | { kind: "sticker"; id: number };

type Drag =
  | { kind: "move"; target: Target; dx: number; dy: number }
  | {
      kind: "turn";
      target: Target;
      cx: number;
      cy: number;
      angle: number;
      distance: number;
      rotation: number;
      scale: number;
    };

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

const same = (a: Target | null, b: Target) =>
  !!a &&
  a.kind === b.kind &&
  (a.kind === "text" || (b.kind === "sticker" && a.id === b.id));

export default function MemoriesStudio() {
  const [stage, setStage] = useState<"booth" | "card">("booth");
  const [aspect, setAspect] = useState<Aspect>("square");
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [textAt, setTextAt] = useState<PlacedText>(() => textHome("square"));
  const [moved, setMoved] = useState(false);
  const [selected, setSelected] = useState<Target | null>(null);
  const [unit, setUnit] = useState(0);
  const [saving, setSaving] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [filter, setFilter] = useState(0);

  const nextId = useRef(1);
  const frame = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const deal = useRef<gsap.core.Timeline | null>(null);

  const card = CARD[aspect];
  const message = MEMORIES.messages[index];
  const feed = PASS_VARIANTS[filter % PASS_VARIANTS.length].feed;

  // A line the viewer has not moved belongs to the card, not to them: it sits
  // at whichever home the current aspect gives it rather than keeping a
  // fraction that was measured against a card of another shape. One they have
  // moved is theirs, and the square / story switch leaves it alone. Derived
  // rather than corrected in an effect — the aspect is already the answer.
  const text = moved ? textAt : textHome(aspect);

  /**
   * The fitted size and the finished lines — every word and mark, and where it
   * sits along its line. Measured rather than guessed, and measured only once
   * the webfont is in: Rotonto is wider than the fallback sans, so fitting
   * against the fallback would set the type too large and then let it overflow
   * when the real face arrives.
   *
   * It starts empty rather than at some server-rendered guess. The page opens
   * on the camera, so there is no card in the first paint to disagree with.
   */
  const [fit, setFit] = useState<{ size: number; lines: Line[] }>({
    size: MESSAGE.min,
    lines: [],
  });
  /** False until there is both a canvas to measure with and the real face
   *  loaded in it. Everything that breaks a line waits on this. */
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    let alive = true;
    const measure = () => {
      const ctx = measurer();
      if (!ctx || !alive) return;
      setFit(fitMessage(ctx, message));
      setMeasured(true);
    };
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts
        .load(font(MESSAGE.max))
        .then(() => document.fonts.ready)
        .then(measure)
        .catch(measure);
    } else {
      measure();
    }
    return () => {
      alive = false;
    };
  }, [message]);

  // What the card is scaled to on screen. Watched rather than read once: the
  // column is fluid, and the square / story switch changes it too.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setUnit(entry.contentRect.width / card.w);
    });
    observer.observe(el);
    setUnit(el.getBoundingClientRect().width / card.w);
    return () => observer.disconnect();
  }, [card.w, stage]);

  useEffect(
    () => () => {
      deal.current?.kill();
    },
    [],
  );

  /**
   * The next line, dealt rather than swapped.
   *
   * The old line is thrown off in the direction of travel and the new one drops
   * in from the other side — the same gesture the pass makes when it recolours,
   * because they are the same action: another one off the top of the deck. The
   * animation runs on a wrapper inside the block, so it composes with the
   * placement transform instead of fighting it.
   */
  const step = useCallback((by: number) => {
    const advance = () =>
      setIndex((n) => (n + by + MEMORIES.messages.length) % MEMORIES.messages.length);
    const el = block.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      advance();
      return;
    }
    deal.current?.kill();
    deal.current = gsap
      .timeline()
      .to(el, {
        x: by * 90,
        rotation: by * 8,
        opacity: 0,
        duration: 0.16,
        ease: "power2.in",
      })
      .add(advance)
      .fromTo(
        el,
        { x: -by * 90, rotation: -by * 8, opacity: 0 },
        { x: 0, rotation: 0, opacity: 1, duration: 0.36, ease: "back.out(1.5)" },
      )
      .set(el, { clearProps: "transform,opacity" });
  }, []);

  const add = useCallback((sticker: Sticker) => {
    setPlaced((current) => {
      const id = nextId.current++;
      const n = current.length;
      // A fixed scatter rather than a random one: two people who add the same
      // stickers in the same order get the same card, and nothing about the
      // arrangement changes under a re-render.
      setSelected({ kind: "sticker", id });
      return [
        ...current,
        {
          id,
          sticker: sticker.id,
          xf: clamp(0.5 + ((n % 3) - 1) * 0.15, 0.1, 0.9),
          yf: clamp(0.34 + (Math.floor(n / 3) % 3) * 0.09, 0.1, 0.92),
          scale: 1,
          rotation: ((n * 37) % 26) - 13,
        },
      ];
    });
  }, []);

  const update = useCallback(
    (target: Target, change: Partial<Placed>) => {
      if (target.kind === "text") {
        // From `text` rather than from the setter's own argument, because
        // until it has been moved the stored value is not the one on screen.
        setTextAt({ ...text, ...change });
        setMoved(true);
        return;
      }
      setPlaced((current) =>
        current.map((item) => (item.id === target.id ? { ...item, ...change } : item)),
      );
    },
    [text],
  );

  const remove = useCallback((id: number) => {
    setPlaced((current) => current.filter((item) => item.id !== id));
    setSelected((current) =>
      current && current.kind === "sticker" && current.id === id ? null : current,
    );
  }, []);

  /** A client point in card units. */
  const toCard = useCallback(
    (clientX: number, clientY: number) => {
      const rect = frame.current?.getBoundingClientRect();
      if (!rect || !unit) return { x: 0, y: 0 };
      return { x: (clientX - rect.left) / unit, y: (clientY - rect.top) / unit };
    },
    [unit],
  );

  const startMove = (
    event: ReactPointerEvent<HTMLElement>,
    target: Target,
    at: { xf: number; yf: number },
  ) => {
    event.stopPropagation();
    setSelected(target);
    const point = toCard(event.clientX, event.clientY);
    drag.current = {
      kind: "move",
      target,
      dx: at.xf * card.w - point.x,
      dy: at.yf * card.h - point.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const startTurn = (
    event: ReactPointerEvent<HTMLElement>,
    target: Target,
    at: { xf: number; yf: number; rotation: number; scale: number },
  ) => {
    event.stopPropagation();
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + at.xf * card.w * unit;
    const cy = rect.top + at.yf * card.h * unit;
    drag.current = {
      kind: "turn",
      target,
      cx,
      cy,
      angle: Math.atan2(event.clientY - cy, event.clientX - cx),
      distance: Math.hypot(event.clientX - cx, event.clientY - cy) || 1,
      rotation: at.rotation,
      scale: at.scale,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onMove = (event: ReactPointerEvent<HTMLElement>) => {
    const active = drag.current;
    if (!active) return;
    if (active.kind === "move") {
      const point = toCard(event.clientX, event.clientY);
      update(active.target, {
        xf: clamp((point.x + active.dx) / card.w, 0, 1),
        yf: clamp((point.y + active.dy) / card.h, 0, 1),
      });
      return;
    }
    const angle = Math.atan2(event.clientY - active.cy, event.clientX - active.cx);
    const distance = Math.hypot(event.clientX - active.cx, event.clientY - active.cy);
    update(active.target, {
      rotation: active.rotation + ((angle - active.angle) * 180) / Math.PI,
      scale: clamp((active.scale * distance) / active.distance, MIN_SCALE, MAX_SCALE),
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (drag.current) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      drag.current = null;
    }
  };

  /** Everything the pointer does, for a keyboard. */
  const onPieceKey = (
    event: React.KeyboardEvent,
    target: Target,
    at: { xf: number; yf: number; rotation: number; scale: number },
  ) => {
    const nudge = event.shiftKey ? 0.05 : 0.01;
    const moves: Record<string, Partial<Placed>> = {
      ArrowLeft: { xf: clamp(at.xf - nudge, 0, 1) },
      ArrowRight: { xf: clamp(at.xf + nudge, 0, 1) },
      ArrowUp: { yf: clamp(at.yf - nudge, 0, 1) },
      ArrowDown: { yf: clamp(at.yf + nudge, 0, 1) },
      "[": { rotation: at.rotation - 5 },
      "]": { rotation: at.rotation + 5 },
      "-": { scale: clamp(at.scale - 0.1, MIN_SCALE, MAX_SCALE) },
      "+": { scale: clamp(at.scale + 0.1, MIN_SCALE, MAX_SCALE) },
      "=": { scale: clamp(at.scale + 0.1, MIN_SCALE, MAX_SCALE) },
    };
    if (target.kind === "sticker" && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      remove(target.id);
      return;
    }
    const change = moves[event.key];
    if (!change) return;
    event.preventDefault();
    update(target, change);
  };

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const canvas = await paintCard({
        aspect,
        lines: fit.lines,
        size: fit.size,
        text,
        placed,
        photo: shot,
        filter: feed,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vinhack-memory-${aspect}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  }, [aspect, feed, fit, placed, shot, text]);

  const chromeFor = useMemo(
    () => (scale: number) => (unit ? HANDLE / (unit * scale) : HANDLE),
    [unit],
  );

  /** The message block's own box, in card units — what the selection ring is
   *  drawn round and what the turn handle hangs off. */
  const bounds = useMemo(() => {
    const width = fit.lines.reduce((widest, line) => Math.max(widest, line.width), 0);
    return {
      w: width,
      h: Math.max(1, fit.lines.length) * fit.size * MESSAGE.lineHeight,
    };
  }, [fit]);

  const window_ = WINDOW[aspect];
  const textChrome = chromeFor(text.scale);
  const textOn = same(selected, { kind: "text" });

  // Wide enough to work on, short enough to clear the bar underneath it. The
  // height term is what keeps a story card whole on a laptop.
  const cardWidth = `min(100%, ${aspect === "square" ? 560 : 400}px, max(240px, calc((100dvh - 330px) * ${card.w / card.h})))`;

  return (
    <main className="min-h-full grow bg-black font-rotonto text-[#fcfcfc]">
      <div
        className={`mx-auto w-full max-w-[1180px] px-[20px] pt-[26px] ${
          stage === "card" ? "pb-[230px]" : "pb-[64px]"
        }`}
      >
        <Link
          href="/"
          className="inline-block text-[15px] text-[#a8a2a2] underline-offset-[4px] hover:text-[#bfea88] hover:underline"
        >
          ← {MEMORIES.back}
        </Link>

        <h1 className="mt-[16px] text-center text-[clamp(34px,6vw,64px)] leading-[1.05] text-[#fa1a1d]">
          {MEMORIES.heading}
        </h1>
        <p className="mx-auto mt-[8px] max-w-[560px] text-center text-[16px] text-[#a8a2a2]">
          {MEMORIES.lede}
        </p>

        {stage === "booth" ? (
          <div className="mt-[26px]">
            <Booth
              aspect={aspect}
              filter={filter}
              onFilter={setFilter}
              onCapture={(next) => {
                setShot(next);
                setStage("card");
              }}
              onSkip={() => setStage("card")}
            />
          </div>
        ) : (
          <section className="mt-[24px]">
            <div className="mx-auto" style={{ width: cardWidth }}>
              <div
                ref={frame}
                className="relative w-full overflow-hidden rounded-[8px]"
                style={{ aspectRatio: `${card.w} / ${card.h}`, backgroundColor: GROUND }}
                onPointerDown={() => setSelected(null)}
              >
                <div
                  className="absolute top-0 left-0 origin-top-left"
                  style={{
                    width: card.w,
                    height: card.h,
                    transform: `scale(${unit})`,
                    backgroundColor: GROUND,
                  }}
                >
                  {/* The photo, in its window. No rule around it: the black of
                      the frame is the black of the card, and the picture is
                      where the card stops being black. */}
                  {shot ? (
                    <img
                      alt=""
                      src={shot.url}
                      draggable={false}
                      className="absolute block object-cover"
                      style={{
                        left: window_.x,
                        top: window_.y,
                        width: window_.w,
                        height: window_.h,
                        filter: feed,
                      }}
                    />
                  ) : null}

                  {/* The message. Placed by the same handles a sticker gets,
                      and laid out by `fitMessage` — every word and mark sits
                      where the canvas will put it, not where the browser would
                      break the line. */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={MEMORIES.textLabel}
                    onPointerDown={(event) => startMove(event, { kind: "text" }, text)}
                    onPointerMove={onMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onFocus={() => setSelected({ kind: "text" })}
                    onKeyDown={(event) => onPieceKey(event, { kind: "text" }, text)}
                    style={{
                      position: "absolute",
                      left: text.xf * card.w,
                      top: text.yf * card.h,
                      width: 0,
                      height: 0,
                      transform: `rotate(${text.rotation}deg) scale(${text.scale})`,
                      touchAction: "none",
                      cursor: "grab",
                      outline: "none",
                    }}
                  >
                    <div ref={block}>
                      {/* The block itself is a point — every line hangs off it
                          absolutely — so without this there is nothing to grab
                          but the glyphs, and the gaps between the words drop
                          the drag onto the card behind. */}
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: -bounds.w / 2,
                          top: -bounds.h / 2,
                          width: bounds.w,
                          height: bounds.h,
                        }}
                      />
                      {fit.lines.map((line, row) => {
                        const y =
                          (row - (fit.lines.length - 1) / 2) *
                          fit.size *
                          MESSAGE.lineHeight;
                        return (
                          <div key={row}>
                            {line.items.map((item, i) =>
                              item.kind === "word" ? (
                                <span
                                  key={i}
                                  style={{
                                    position: "absolute",
                                    left: item.x - line.width / 2,
                                    top: y,
                                    transform: "translateY(-50%)",
                                    color: HEADLINE,
                                    fontSize: fit.size,
                                    lineHeight: 1,
                                    whiteSpace: "pre",
                                  }}
                                >
                                  {item.text}
                                </span>
                              ) : (
                                <img
                                  key={i}
                                  alt="VinHack"
                                  src="/figma/logo-red.svg"
                                  draggable={false}
                                  className="block max-w-none"
                                  style={{
                                    position: "absolute",
                                    left: item.x - line.width / 2,
                                    top: y - item.h / 2,
                                    width: item.w,
                                    height: item.h,
                                  }}
                                />
                              ),
                            )}
                          </div>
                        );
                      })}

                      {textOn && bounds.w ? (
                        <>
                          <span
                            aria-hidden
                            style={{
                              position: "absolute",
                              left: -bounds.w / 2 - textChrome * 0.2,
                              top: -bounds.h / 2 - textChrome * 0.2,
                              width: bounds.w + textChrome * 0.4,
                              height: bounds.h + textChrome * 0.4,
                              border: `${textChrome / 16}px dashed ${HEADLINE}`,
                              borderRadius: textChrome / 6,
                              pointerEvents: "none",
                            }}
                          />
                          <span
                            role="button"
                            tabIndex={-1}
                            aria-label={MEMORIES.textLabel}
                            onPointerDown={(event) =>
                              startTurn(event, { kind: "text" }, text)
                            }
                            onPointerMove={onMove}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                            style={{
                              ...handleStyle(textChrome),
                              left: bounds.w / 2,
                              top: bounds.h / 2,
                              background: HEADLINE,
                              color: "#000000",
                              cursor: "grab",
                            }}
                          >
                            ⤡
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {placed.map((item) => {
                    const sticker = BY_ID.get(item.sticker);
                    if (!sticker) return null;
                    const box = boxOf(sticker);
                    const target: Target = { kind: "sticker", id: item.id };
                    const on = same(selected, target);
                    const chrome = chromeFor(item.scale);
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-label={sticker.label}
                        onPointerDown={(event) => startMove(event, target, item)}
                        onPointerMove={onMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        onFocus={() => setSelected(target)}
                        onKeyDown={(event) => onPieceKey(event, target, item)}
                        style={{
                          position: "absolute",
                          left: item.xf * card.w,
                          top: item.yf * card.h,
                          width: box.w,
                          height: box.h,
                          transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                          touchAction: "none",
                          cursor: "grab",
                          outline: "none",
                        }}
                      >
                        <StickerArt sticker={sticker} width={box.w} measured={measured} />
                        {on ? (
                          <>
                            <span
                              aria-hidden
                              style={{
                                position: "absolute",
                                inset: -chrome * 0.15,
                                border: `${chrome / 16}px dashed ${HEADLINE}`,
                                borderRadius: chrome / 6,
                                pointerEvents: "none",
                              }}
                            />
                            <button
                              type="button"
                              aria-label={`Remove ${sticker.label}`}
                              onPointerDown={(event) => event.stopPropagation()}
                              onClick={(event) => {
                                event.stopPropagation();
                                remove(item.id);
                              }}
                              style={{
                                ...handleStyle(chrome),
                                left: box.w,
                                top: 0,
                                background: "#fa1a1d",
                                color: "#fcfcfc",
                              }}
                            >
                              ×
                            </button>
                            <span
                              role="button"
                              tabIndex={-1}
                              aria-label={`Turn and resize ${sticker.label}`}
                              onPointerDown={(event) => startTurn(event, target, item)}
                              onPointerMove={onMove}
                              onPointerUp={endDrag}
                              onPointerCancel={endDrag}
                              style={{
                                ...handleStyle(chrome),
                                left: box.w,
                                top: box.h,
                                background: HEADLINE,
                                color: "#000000",
                                cursor: "grab",
                              }}
                            >
                              ⤡
                            </span>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="mt-[12px] text-center text-[13px] leading-[18px] text-[#6f6f6f]">
                {placed.length ? MEMORIES.hint : MEMORIES.empty}
              </p>
              <p className="mt-[6px] text-center text-[13px] tracking-[1px] text-[#fa1a1d]">
                {MEMORIES.tag}
              </p>
            </div>
          </section>
        )}
      </div>

      {/* --------------------------------------------------- the bottom bar */}
      {stage === "card" ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-[#1f1f1f] border-t bg-black/92 backdrop-blur-[6px]">
          <div className="mx-auto w-full max-w-[1180px] px-[20px] py-[12px]">
            <h2 className="sr-only">{MEMORIES.tray}</h2>
            {/* The carousel. A scroller rather than a grid, so a phone gets the
                whole tray in one thumb-length of travel. */}
            <div className="-mx-[20px] flex gap-[10px] overflow-x-auto px-[20px] pb-[8px] [scrollbar-width:thin]">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  title={sticker.label}
                  onClick={() => add(sticker)}
                  className="flex size-[76px] shrink-0 items-center justify-center rounded-[10px] border border-[#2a2a2a] bg-[#0d0d0d] p-[8px] transition-colors hover:border-[#bfea88]"
                >
                  <StickerArt sticker={sticker} width={54} measured={measured} />
                  <span className="sr-only">{sticker.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-[10px] flex flex-wrap items-center justify-center gap-[10px]">
              <div className="flex gap-[6px]">
                {(["square", "story"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={aspect === key}
                    onClick={() => setAspect(key)}
                    className={`rounded-[8px] border px-[12px] py-[8px] text-[13px] transition-colors ${
                      aspect === key
                        ? "border-[#bfea88] bg-[#bfea88] text-black"
                        : "border-[#3a3a3a] text-[#a8a2a2] hover:border-[#bfea88] hover:text-[#bfea88]"
                    }`}
                  >
                    {MEMORIES.aspects[key]}
                  </button>
                ))}
              </div>

              <div className="flex min-w-0 grow items-center justify-center gap-[10px]">
                <button
                  type="button"
                  aria-label={MEMORIES.prev}
                  onClick={() => step(-1)}
                  className="size-[38px] shrink-0 rounded-full border border-[#3a3a3a] text-[16px] text-[#fcfcfc] transition-colors hover:border-[#bfea88] hover:text-[#bfea88]"
                >
                  ←
                </button>
                <p
                  aria-live="polite"
                  className="min-w-0 truncate text-center text-[14px] text-[#a8a2a2]"
                >
                  {message}
                </p>
                <button
                  type="button"
                  aria-label={MEMORIES.next}
                  onClick={() => step(1)}
                  className="size-[38px] shrink-0 rounded-full border border-[#3a3a3a] text-[16px] text-[#fcfcfc] transition-colors hover:border-[#bfea88] hover:text-[#bfea88]"
                >
                  →
                </button>
              </div>

              <div className="flex gap-[8px]">
                <button
                  type="button"
                  onClick={() => setStage("booth")}
                  className="rounded-[8px] border border-[#3a3a3a] px-[14px] py-[10px] text-[13px] text-[#a8a2a2] transition-colors hover:border-[#bfea88] hover:text-[#bfea88]"
                >
                  {MEMORIES.booth.retake}
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-[8px] bg-[#bfea88] px-[18px] py-[10px] text-[15px] text-black transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? MEMORIES.saving : MEMORIES.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

/** Both handles are the same disc, held at a constant size on screen. */
function handleStyle(size: number): CSSProperties {
  return {
    position: "absolute",
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontSize: size * 0.55,
    lineHeight: 1,
    touchAction: "none",
    userSelect: "none",
  };
}
