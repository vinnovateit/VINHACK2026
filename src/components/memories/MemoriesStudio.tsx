"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
import GlitchField from "@/components/GlitchField";
import ArPanel from "@/components/memories/ArPanel";
import ArStage, { type Sample } from "@/components/memories/ArStage";
import FeedFx from "@/components/memories/FeedFx";
import FilterTray from "@/components/memories/FilterTray";
import MemoriesMark from "@/components/memories/MemoriesMark";
import PropArt from "@/components/memories/PropArt";
import Scatter from "@/components/memories/Scatter";
import StickerArt from "@/components/memories/StickerArt";
import {
  PROP_BY_ID,
  PROP_GROUPS,
  photoMap,
  placeProp,
  propAt,
  propFrom,
  rebase,
  type PlacedProp,
  type PropGroup,
} from "@/components/memories/ar";
import { PLAIN, needsMask } from "@/components/memories/backdrops";
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
import { SCAN, STRAIGHT, feedOf, overlaysOf } from "@/components/memories/filters";
import { paintCard } from "@/components/memories/paint";
import { BY_ID, STICKERS, boxOf, type Sticker } from "@/components/memories/stickers";
import {
  ZOOM,
  useCamera,
  usePinchZoom,
  type Shot,
} from "@/components/memories/useCamera";
import { MEMORIES } from "@/content/site";

gsap.registerPlugin(useGSAP);

/**
 * The memory-card studio: the preview half of the pair described in `card.ts`,
 * and both of the page's screens.
 *
 * There are two, and the split is only between reading and doing. `intro` is
 * the title, a couple of lines about what this is for and the stickers the card
 * is made of, loose on the wall — nothing on it switches a camera on. `studio`
 * is everything else, on one page: the camera *inside the card's own photo
 * window*, the filter row, the sticker tray and the line, all at once.
 *
 * That the camera is in the window rather than on a screen of its own is the
 * thing to understand about this file. There is no separate booth: what you
 * frame yourself in is the card, at the shape and in the treatment it will be
 * saved at, with the stickers you have already put on it sitting over the live
 * feed. The shutter hangs on the seam between the photo and the strip below it,
 * where a polaroid's edge is. So nothing is composed twice and nothing is a
 * surprise after the countdown.
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
 * The chrome — the shape switch, the shutter, the retake, the countdown — is
 * drawn *outside* that scaled box, in CSS pixels, positioned by percentages of
 * the card. It has to be: it is furniture the viewer works with and not ink the
 * card carries, and a shutter that shrank with the card would be unusable on a
 * phone. Percentages rather than card units so it follows the square / story
 * switch without a second table of numbers.
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
 * The overlay treatments sit *over* the filtered picture rather than inside it,
 * and that is a decision the canvas made: `ctx.filter` treats each draw as it is
 * made, so there is no way to put a gradient underneath one and have it come out
 * treated. The saved PNG therefore lays its scanlines on the finished photo, and
 * the preview lays its own on top too — otherwise INVERT plus CRT would be black
 * lines here and white lines in the file.
 *
 * What the preview deliberately does not draw is the branding. The saved image
 * gets a black bar across the top with the two marks in it (see `paintCard`),
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

/** The longest side a sticker is drawn at inside its tile in the tray, in CSS
 *  pixels — the 58px tile with a margin either side. */
const TILE_ART = 44;

type Stage = "intro" | "studio";

/**
 * What is selected. The message is a piece too, and the one that is not in
 * `placed`, so it is named rather than numbered.
 *
 * A prop is a third kind rather than a sticker with a different picture in it,
 * because it is stored in a different space: a sticker's position is a fraction
 * of the card and a prop's is a fraction of the *photograph*, so that the square
 * / story switch re-crops the picture and takes everybody's sunglasses with it.
 * The drag maths below speaks card fractions and knows nothing about that —
 * `update` converts on the way in, which is the whole of the difference.
 */
type Target =
  | { kind: "text" }
  | { kind: "sticker"; id: number }
  | { kind: "prop"; id: number };

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
  (a.kind === "text" || (b.kind !== "text" && a.id === b.id));

export default function MemoriesStudio({
  fromDashboard = false,
}: {
  fromDashboard?: boolean;
}) {
  const [isFromDashboard, setIsFromDashboard] = useState(fromDashboard);

  useEffect(() => {
    if (fromDashboard) {
      try {
        sessionStorage.setItem("memories_from_dashboard", "true");
      } catch {}
      setIsFromDashboard(true);
    } else {
      try {
        const stored = sessionStorage.getItem("memories_from_dashboard");
        const urlParam =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("from")
            : null;
        if (stored === "true" || urlParam === "dashboard") {
          setIsFromDashboard(true);
        }
      } catch {}
    }
  }, [fromDashboard]);

  const handleReturnToDashboard = () => {
    try {
      sessionStorage.removeItem("memories_from_dashboard");
    } catch {}
  };

  const [stage, setStage] = useState<Stage>("intro");
  const [aspect, setAspect] = useState<Aspect>("square");
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [textAt, setTextAt] = useState<PlacedText>(() => textHome("square"));
  const [moved, setMoved] = useState(false);
  const [selected, setSelected] = useState<Target | null>(null);
  const [unit, setUnit] = useState(0);
  const [saving, setSaving] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  /** The treatment on the picture, as an id — see `filters.ts`. One at a time,
   *  and `STRAIGHT` is one of them rather than the absence of one. */
  const [fx, setFx] = useState<string>(STRAIGHT);
  /** What is being worn, one piece per group — see `ArPanel`. */
  const [worn, setWorn] = useState<Partial<Record<PropGroup, string>>>({});
  /** What is behind and around the picture: a `Backdrop.id`, or `PLAIN`. */
  const [backdrop, setBackdrop] = useState<string>(PLAIN);
  /** The props as the shutter left them. Empty until there is a photograph,
   *  and thrown away with it on a retake. */
  const [props, setProps] = useState<PlacedProp[]>([]);
  const [panel, setPanel] = useState(false);
  /** What the models did when they were asked for. `undefined` is still
   *  waiting; the panel says which of the two states it is in. */
  const [ready, setReady] = useState<{ faces?: boolean; scenes?: boolean }>({});
  const nextId = useRef(1);
  const intro = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const deal = useRef<gsap.core.Timeline | null>(null);
  /**
   * The last thing the camera was looked at and found — faces, and a cut-out if
   * a scene wanted one. Written by `ArStage` every frame and read by the
   * shutter at the instant it fires, which is why it is a ref: sixty setStates
   * a second to move a pair of sunglasses two pixels is not a thing to do to a
   * tree that also holds a card, a sticker tray and a filter row.
   */
  const sample = useRef<Sample>({ faces: [], mask: null });

  const card = CARD[aspect];
  const message = MEMORIES.messages[index];
  const feed = feedOf(fx);
  const overlays = overlaysOf(fx);
  /** In tray order, so two people wearing the same things get them stacked the
   *  same way round. */
  const wornIds = useMemo(
    () => PROP_GROUPS.map((group) => worn[group.id]).filter((id): id is string => !!id),
    [worn],
  );
  /** True while the AR layer is holding the picture rather than sitting over
   *  it — a scene cannot be put behind somebody without doing that. */
  const covered = needsMask(backdrop);

  /**
   * The shutter, and the one moment detection matters.
   *
   * Every prop being worn is placed against every face that was in the frame,
   * moved out of the camera's coordinates into the photograph's, and from then
   * on it is a piece on the card. Nothing tracks a still. A new photograph gets
   * a new set — the old ones were hung on a face that is no longer in the
   * picture — so this replaces rather than appends.
   */
  const takeShot = useCallback(
    (next: Shot) => {
      setShot(next);
      const faces = sample.current.faces;
      if (!faces.length || !wornIds.length) {
        setProps([]);
        return;
      }
      const made: PlacedProp[] = [];
      for (const face of faces) {
        const seen = rebase(face, next);
        for (const id of wornIds) {
          const prop = PROP_BY_ID.get(id);
          if (!prop) continue;
          const spot = placeProp(prop, seen);
          made.push({
            id: nextId.current++,
            prop: id,
            px: spot.at.x,
            py: spot.at.y,
            span: spot.span,
            scale: 1,
            rotation: spot.roll,
          });
        }
      }
      setProps(made);
    },
    [wornIds],
  );

  const {
    video: cameraEl,
    status: cameraStatus,
    count,
    live,
    mirror,
    canFlip,
    zoom,
    setZoom,
    flip,
    start: startCamera,
    stop: stopCamera,
    shoot,
  } = useCamera(
    takeShot,
    useCallback(() => ({ mask: sample.current.mask }), []),
  );

  const pinch = usePinchZoom(zoom, setZoom, live);

  const onVisionState = useCallback((kind: "faces" | "scenes", ok: boolean) => {
    setReady((current) => ({ ...current, [kind]: ok }));
  }, []);

  /** What the panel has to say about the models, or nothing. */
  const notice = useMemo(() => {
    if (wornIds.length && ready.faces === undefined) return MEMORIES.ar.loading;
    if (wornIds.length && ready.faces === false) return MEMORIES.ar.blocked;
    if (covered && shot && !shot.mask) return MEMORIES.ar.sceneLate;
    if (covered && ready.scenes === undefined) return MEMORIES.ar.loadingScene;
    if (covered && ready.scenes === false) return MEMORIES.ar.sceneBlocked;
    return null;
  }, [covered, ready.faces, ready.scenes, shot, wornIds.length]);

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
   * on the title, so there is no card in the first paint to disagree with.
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

  // What the card is scaled to on screen. The art does not need this — CSS
  // scales that itself — but the pointer maths and the selection handles do:
  // one turns a client point back into card units, the other holds a handle at
  // a constant size while everything under it shrinks. Watched rather than read
  // once, because the column is fluid and the shape switch changes it too.
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

  // The wordmark owns its pen-drawn entrance in `MemoriesMark`. Everything
  // around it arrives separately, so the title stays the page's one still
  // point while the wall of stickers and the invitation settle into place.
  useGSAP(
    () => {
      if (stage !== "intro" || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;

      const scope = intro.current;
      if (!scope) return;

      const back = scope.querySelector<HTMLElement>('[data-memories-appear="back"]');
      const scatter = gsap.utils.toArray<HTMLElement>(
        '[data-memories-appear="scatter"]',
        scope,
      );
      const copy = gsap.utils.toArray<HTMLElement>('[data-memories-appear="copy"]', scope);

      const reveal = gsap.timeline();

      if (back) {
        reveal.from(back, {
          autoAlpha: 0,
          x: -18,
          duration: 0.38,
          ease: "power3.out",
        });
      }

      if (scatter.length) {
        reveal.from(
          scatter,
          {
            autoAlpha: 0,
            y: 28,
            scale: 0.45,
            duration: 0.58,
            stagger: { each: 0.055, from: "random" },
            ease: "back.out(1.45)",
          },
          0.1,
        );
      }

      if (copy.length) {
        reveal.from(
          copy,
          {
            autoAlpha: 0,
            y: 18,
            duration: 0.5,
            stagger: 0.11,
            ease: "power3.out",
          },
          0.42,
        );
      }
    },
    { scope: intro, dependencies: [stage], revertOnUpdate: true },
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

  /**
   * The photograph's coordinates in card units, and back.
   *
   * Only the props need it, and only once there is a photograph for them to be
   * on — a prop cannot exist without one. It is rebuilt on the shape switch,
   * which is exactly the point: the same stored fraction lands somewhere else
   * on a story card because the window crops the picture differently, and the
   * sunglasses go where the face went.
   */
  const map = useMemo(() => (shot ? photoMap(shot, aspect) : null), [shot, aspect]);

  const update = useCallback(
    (target: Target, change: Partial<Placed>) => {
      if (target.kind === "text") {
        // From `text` rather than from the setter's own argument, because
        // until it has been moved the stored value is not the one on screen.
        setTextAt({ ...text, ...change });
        setMoved(true);
        return;
      }
      if (target.kind === "prop") {
        setProps((current) =>
          current.map((item) => {
            if (item.id !== target.id) return item;
            const next = { ...item };
            if (change.rotation !== undefined) next.rotation = change.rotation;
            if (change.scale !== undefined) next.scale = change.scale;
            // The drag arrives in card fractions like everything else's does;
            // a prop is the one piece that is not stored in them.
            if (map && (change.xf !== undefined || change.yf !== undefined)) {
              const here = propAt(item, map, aspect);
              const point = propFrom(
                change.xf ?? here.xf,
                change.yf ?? here.yf,
                map,
                aspect,
              );
              next.px = point.px;
              next.py = point.py;
            }
            return next;
          }),
        );
        return;
      }
      setPlaced((current) =>
        current.map((item) => (item.id === target.id ? { ...item, ...change } : item)),
      );
    },
    [aspect, map, text],
  );

  const remove = useCallback((target: Target) => {
    if (target.kind === "text") return;
    if (target.kind === "prop") {
      setProps((current) => current.filter((item) => item.id !== target.id));
    } else {
      setPlaced((current) => current.filter((item) => item.id !== target.id));
    }
    setSelected((current) => (same(current, target) ? null : current));
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
    if (target.kind !== "text" && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      remove(target);
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
        props,
        photo: shot,
        backdrop,
        filter: feed,
        overlays,
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
  }, [aspect, backdrop, feed, fit, overlays, placed, props, shot, text]);

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

  /** The seam between the photo and the strip, as a percentage of the card —
   *  where the shutter hangs. */
  const seam = ((window_.y + window_.h) / card.h) * 100;

  /** The widest the card is worth drawing at. Everything else about its size
   *  is CSS: the studio is one column the height of the window, the card's row
   *  is what the title and the bar leave over, and the card is the narrowest of
   *  this cap, the row's width and what the row's height allows at this shape. */
  const cardCap = aspect === "square" ? 560 : 400;

  return (
    <main
      className={`grow bg-black font-rotonto text-[#fcfcfc] ${
        stage === "studio" ? "flex h-dvh flex-col overflow-hidden" : "min-h-full"
      }`}
    >
      <div
        ref={intro}
        className={`mx-auto w-full max-w-[1180px] shrink-0 px-[20px] pt-[18px] ${
          stage === "intro" ? "flex min-h-dvh flex-col pb-[22px]" : ""
        }`}
      >
        {stage === "intro" ? (
          <Link
            href={isFromDashboard ? "/dashboard" : "/"}
            onClick={handleReturnToDashboard}
            data-memories-appear="back"
            className="relative z-10 inline-block shrink-0 self-start text-[15px] text-[#a8a2a2] underline-offset-[4px] hover:text-[#bfea88] hover:underline"
          >
            ← {isFromDashboard ? "back to dashboard" : MEMORIES.back}
          </Link>
        ) : (
          <div className="relative z-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setStage("intro");
              }}
              className="inline-block text-[15px] text-[#a8a2a2] underline-offset-[4px] hover:text-[#bfea88] hover:underline"
            >
              ← {MEMORIES.booth.back}
            </button>
            {isFromDashboard && (
              <Link
                href="/dashboard"
                onClick={() => {
                  stopCamera();
                  handleReturnToDashboard();
                }}
                className="inline-block text-[13px] sm:text-[14px] text-[#fa1a1d] underline-offset-[4px] hover:underline uppercase tracking-wider font-light"
              >
                Back to Dashboard →
              </Link>
            )}
          </div>
        )}

        {/* The title, and on the way in everything around it. The slots below
            are fixed — a screen that does not want the scatter or the words
            renders `null` in its place rather than a shorter list — because the
            mark between them is a three-second animation and React would redraw
            it from scratch if it ever moved. */}
        <div
          className={`relative ${
            stage === "intro" ? "flex grow flex-col justify-center py-[16px]" : ""
          }`}
        >
          {stage === "intro" ? <Scatter measured={measured} /> : null}

          {/* Pen-drawn artwork, like "register now" on the home page:
              "memories @" in the green hand, then the VinHack mark in red. The
              h1 keeps the words for anything that cannot see it. Written large
              on the title screen and smaller once there is a card to look at,
              which is a class change and not a remount. */}
          <h1
            className={`relative mx-auto max-w-full transition-[width] duration-500 ${
              stage === "intro"
                ? "w-[clamp(280px,62vw,660px)]"
                : "mt-[6px] w-[clamp(180px,26vw,320px)]"
            }`}
          >
            <MemoriesMark className="block h-auto w-full" />
          </h1>

          {stage === "intro" ? (
            <div className="relative mx-auto mt-[20px] flex max-w-[620px] flex-col items-center text-center">
              <h2 className="sr-only">{MEMORIES.intro.scatter}</h2>
              <p
                data-memories-appear="copy"
                className="text-[clamp(19px,3.4vw,28px)] leading-[1.2] text-[#fcfcfc]"
              >
                {MEMORIES.intro.lines[0]}
              </p>
              <p
                data-memories-appear="copy"
                className="mt-[10px] text-[15px] leading-[22px] text-[#a8a2a2]"
              >
                {MEMORIES.intro.lines[1]}
              </p>
              <button
                type="button"
                onClick={() => setStage("studio")}
                data-memories-appear="copy"
                className="mt-[24px] rounded-full bg-[#bfea88] px-[28px] py-[13px] text-[16px] tracking-[1px] text-black transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                {MEMORIES.intro.start}
              </button>
              <p
                data-memories-appear="copy"
                className="mt-[34px] text-[13px] tracking-[1px] text-[#fa1a1d]"
              >
                {MEMORIES.tag}
              </p>
            </div>
          ) : null}
        </div>

      </div>

      {/* ------------------------------------------------------ the card */}
      {/* The one row that stretches. `min-h-0` is what makes it a row rather
          than a push: without it a flex item refuses to shrink below its
          content and the card would shove the bar off the bottom of the
          window instead of fitting between it and the title. */}
      {stage === "studio" ? (
        <section className="flex min-h-0 w-full flex-1 flex-col items-center gap-[6px] px-[20px] pt-[10px] pb-[8px]">
          {/* A size container, so the card can be told in CSS how tall the row
              it sits in is — `100cqh` — and be re-sized by the browser the
              moment that changes. Measuring it in JavaScript instead meant a
              number that was right at first paint and stale by the time the
              webfont had shifted the bar under it. */}
          <div className="min-h-0 w-full flex-1 [container-type:size]">
            <div
              ref={frame}
              className="relative mx-auto overflow-hidden rounded-[8px] [container-type:inline-size]"
              style={{
                width: `min(100%, ${cardCap}px, calc(100cqh * ${card.w / card.h}))`,
                aspectRatio: `${card.w} / ${card.h}`,
                backgroundColor: GROUND,
              }}
              onPointerDown={() => setSelected(null)}
            >
              {/* The card at its full 1080 units, scaled down to the frame. The
                  scale is CSS rather than the measured `unit`: tan(atan2(a, b))
                  is this codebase's idiom for dividing two lengths into a plain
                  number — see `--canvas-fit` in `globals.css` — and `100cqw` is
                  the frame's own width. So the art is re-scaled by the browser
                  in the same frame the box changes size in, instead of a paint
                  later when a ResizeObserver has been round React. */}
              <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                  width: card.w,
                  height: card.h,
                  transform: `scale(tan(atan2(100cqw, ${card.w}px)))`,
                  backgroundColor: GROUND,
                }}
              >
                {/* The photo window — the camera, then the picture it took.
                    No rule around it: the black of the frame is the black of
                    the card, and the window is where the card stops being
                    black. The filter goes on the picture and the overlay
                    goes over the treated picture, which is the order
                    `paint.ts` is forced into and therefore the order here. */}
                <span
                  className="absolute block overflow-hidden"
                  // Two fingers on the picture are the zoom. Only while the
                  // camera is running — a still has nothing left to crop —
                  // and only on the second pointer, so the one-finger drags
                  // the card is full of are untouched.
                  {...pinch}
                  style={{
                    left: window_.x,
                    top: window_.y,
                    width: window_.w,
                    height: window_.h,
                    ...pinch.style,
                  }}
                >
                  {live ? (
                    <video
                      ref={cameraEl}
                      muted
                      playsInline
                      autoPlay
                      className="absolute inset-0 size-full object-cover"
                      style={{
                        filter: feed === "none" ? undefined : feed,
                        // The mirror follows the lens rather than the booth —
                        // see `useCamera` — and the zoom is a scale about the
                        // centre, which is the same rectangle the shutter cuts
                        // out. `object-cover` has already fitted the frame to
                        // the window, so this scales what is fitted.
                        transform: `${mirror ? "scaleX(-1) " : ""}scale(${zoom})`,
                        // Still playing, still the source the AR layer reads,
                        // simply not the thing on screen: a scene backdrop
                        // means the canvas over it is holding the picture.
                        visibility: covered ? "hidden" : undefined,
                      }}
                    />
                  ) : shot ? (
                    <img
                      alt=""
                      src={shot.url}
                      draggable={false}
                      className="absolute inset-0 block size-full object-cover"
                      style={{
                        filter: feed === "none" ? undefined : feed,
                        visibility: covered ? "hidden" : undefined,
                      }}
                    />
                  ) : (
                    // The panel that is not yet a picture, and the only way
                    // the camera is ever switched on. It sits inside the
                    // filter with everything else, so the dead signal is
                    // drained, inverted or tinted exactly like the feed it
                    // stands in for. Everything in it is in card units.
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={cameraStatus.kind === "starting"}
                      aria-label={MEMORIES.booth.enable}
                      className="absolute inset-0 block cursor-pointer bg-[#fcfcfc] text-[#2849cb]"
                      style={{ filter: feed === "none" ? undefined : feed }}
                    >
                      <GlitchField />
                      <span
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ fontSize: 62, lineHeight: 1.1 }}
                      >
                        {cameraStatus.kind === "error" ? (
                          <>
                            <span style={{ color: "#fa1a1d" }}>
                              {cameraStatus.message}
                            </span>
                            <span style={{ fontSize: 30, marginTop: 14, opacity: 0.7 }}>
                              {MEMORIES.booth.retry}
                            </span>
                          </>
                        ) : (
                          <>
                            {MEMORIES.booth.idle.map((word) => (
                              <span key={word}>{word}</span>
                            ))}
                            <span style={{ fontSize: 30, marginTop: 14, opacity: 0.7 }}>
                              {cameraStatus.kind === "starting"
                                ? MEMORIES.booth.requesting
                                : MEMORIES.booth.enable}
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                  )}
                  {/* The scene behind, the props on the faces, the frame
                      round it and — sandwiched between its two canvases —
                      the treatment's painted half. It carries the overlays
                      because they have to sit between the picture and the
                      furniture, and only this component knows where the
                      seam between those two is. */}
                  <ArStage
                    video={cameraEl}
                    live={live}
                    mirror={mirror}
                    zoom={zoom}
                    shot={shot}
                    aspect={aspect}
                    props={wornIds}
                    backdrop={backdrop}
                    filter={feed}
                    overlays={overlays}
                    sample={sample}
                    onVisionState={onVisionState}
                  />
                  {count !== null ? (
                    <span
                      aria-live="assertive"
                      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35"
                      style={{ fontSize: 280, lineHeight: 1, color: HEADLINE }}
                    >
                      {count > 0 ? MEMORIES.booth.countdown(count) : ""}
                    </span>
                  ) : null}
                </span>

                {/* The props, frozen where the shutter found them.
                    Positioned off the *photograph* and mapped back into card
                    units on the way out, which is what keeps them on the face
                    when the square / story switch re-crops the picture —
                    everything else on the card is stored in card fractions and
                    would not. Deliberately not clipped to the window: they are
                    pieces on the card now, and one dragged onto the black
                    strip is somewhere somebody put it. */}
                {map
                  ? props.map((item) => {
                      const prop = PROP_BY_ID.get(item.prop);
                      if (!prop) return null;
                      const at = propAt(item, map, aspect);
                      const width = map.size(item.span);
                      const target: Target = { kind: "prop", id: item.id };
                      const on = same(selected, target);
                      const chrome = chromeFor(item.scale);
                      const handle = { ...at, rotation: item.rotation, scale: item.scale };
                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          aria-label={prop.label}
                          onPointerDown={(event) => startMove(event, target, at)}
                          onPointerMove={onMove}
                          onPointerUp={endDrag}
                          onPointerCancel={endDrag}
                          onFocus={() => setSelected(target)}
                          onKeyDown={(event) => onPieceKey(event, target, handle)}
                          style={{
                            position: "absolute",
                            left: at.xf * card.w,
                            top: at.yf * card.h,
                            width,
                            height: width * prop.ratio,
                            transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                            touchAction: "none",
                            cursor: "grab",
                            outline: "none",
                          }}
                        >
                          <PropArt prop={prop} width={width} />
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
                                aria-label={`Remove ${prop.label}`}
                                onPointerDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  remove(target);
                                }}
                                style={{
                                  ...handleStyle(chrome),
                                  left: width,
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
                                aria-label={`Turn and resize ${prop.label}`}
                                onPointerDown={(event) => startTurn(event, target, handle)}
                                onPointerMove={onMove}
                                onPointerUp={endDrag}
                                onPointerCancel={endDrag}
                                style={{
                                  ...handleStyle(chrome),
                                  left: width,
                                  top: width * prop.ratio,
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
                    })
                  : null}

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
                              remove(target);
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

              {/* ------------------------------------------- the chrome */}
              {/* Outside the scaled box and in CSS pixels: none of this is on
                  the card, and none of it may shrink with it. */}

              {/* The shape switch, on the picture. */}
              <div
                className="absolute top-[10px] right-[10px] flex gap-[3px] rounded-full bg-black/55 p-[3px] backdrop-blur-[4px]"
                role="group"
                aria-label={MEMORIES.aspectLabel}
                onPointerDown={(event) => event.stopPropagation()}
              >
                {(["square", "story"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={aspect === key}
                    onClick={() => setAspect(key)}
                    className={`rounded-full px-[11px] py-[5px] text-[11px] tracking-[1px] transition-colors ${
                      aspect === key
                        ? "bg-[#bfea88] text-black"
                        : "text-[#d8d8d8] hover:text-[#bfea88]"
                    }`}
                  >
                    {MEMORIES.aspects[key]}
                  </button>
                ))}
              </div>

              {/* The shutter, on the seam between the photo and the strip —
                  where a polaroid's edge is. Only while the camera is on:
                  before that the panel itself is the switch, and after it the
                  picture is taken and RETAKE is the only thing left to
                  offer. Drawn the way the pass's is, with the aperture
                  closing down rather than the button growing. */}
              {live ? (
                <button
                  type="button"
                  onClick={shoot}
                  disabled={count !== null}
                  aria-label={MEMORIES.booth.shoot}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="group absolute left-1/2 flex size-[64px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#bfea88] bg-black/45 backdrop-blur-[4px] transition-transform duration-200 enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-40"
                  style={{ top: `${seam}%` }}
                >
                  <span className="size-[40px] rounded-full bg-[#bfea88] transition-[width,height] duration-200 group-hover:size-[26px] group-active:size-[20px]" />
                </button>
              ) : shot ? (
                <button
                  type="button"
                  onClick={() => {
                    setShot(null);
                    // The props went on a face that is about to stop being in
                    // the picture. They are not a setting, they are where
                    // somebody's sunglasses were.
                    setProps([]);
                    setSelected(null);
                    startCamera();
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="absolute top-[10px] left-[10px] rounded-full bg-black/55 px-[12px] py-[6px] text-[11px] tracking-[1px] text-[#d8d8d8] backdrop-blur-[4px] transition-colors hover:text-[#bfea88]"
                >
                  {MEMORIES.booth.retake}
                </button>
              ) : null}

              {/* The other lens, where there is one. Asked of the device only
                  after permission has been given — before that the list is
                  blank and a flip decided from it would be a guess. It sits
                  where RETAKE sits because the two are never both true. */}
              {live && canFlip ? (
                <button
                  type="button"
                  onClick={flip}
                  aria-label={MEMORIES.flip}
                  title={MEMORIES.flip}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="absolute top-[10px] left-[10px] flex size-[32px] items-center justify-center rounded-full bg-black/55 text-[14px] text-[#d8d8d8] backdrop-blur-[4px] transition-colors hover:text-[#bfea88]"
                >
                  ⟲
                </button>
              ) : null}

              {/* The zoom, under the shutter rather than beside it: the
                  shutter is centred on the seam and this is the only place on
                  the card wide enough to take a slider that is neither under
                  the picture's chin nor on top of the line. Two fingers on the
                  picture do the same thing — see `usePinchZoom`. */}
              {live ? (
                <div
                  className="absolute left-1/2 flex -translate-x-1/2 items-center gap-[8px] rounded-full bg-black/55 px-[12px] py-[6px] backdrop-blur-[4px]"
                  style={{ top: `${seam}%`, marginTop: 44 }}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <span aria-hidden className="text-[12px] text-[#a8a2a2]">
                    −
                  </span>
                  <input
                    type="range"
                    className="zoom-range w-[104px]"
                    aria-label={MEMORIES.zoom}
                    min={ZOOM.min}
                    max={ZOOM.max}
                    step={ZOOM.step}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                  />
                  <span aria-hidden className="text-[12px] text-[#a8a2a2]">
                    +
                  </span>
                  <span className="w-[30px] text-right text-[10px] tracking-[0.5px] text-[#bfea88] tabular-nums">
                    {zoom.toFixed(1)}×
                  </span>
                </div>
              ) : null}

              {/* The drawer, and the save. Both are on the card rather than in
                  the bar under it, and for the same reason: the bar is three
                  rows deep already and the studio is a locked window height,
                  so anything added down there comes off the picture. Putting
                  SAVE here also gives the line under it the whole width back,
                  which is the only way it is centred on the card rather than
                  centred on whatever the button left over. */}
              <button
                type="button"
                onClick={() => setPanel((open) => !open)}
                aria-expanded={panel}
                onPointerDown={(event) => event.stopPropagation()}
                className={`absolute bottom-[10px] left-[10px] rounded-full px-[12px] py-[6px] text-[11px] tracking-[1px] backdrop-blur-[4px] transition-colors ${
                  wornIds.length || backdrop !== PLAIN
                    ? "bg-[#bfea88] text-black"
                    : "bg-black/55 text-[#d8d8d8] hover:text-[#bfea88]"
                }`}
              >
                {MEMORIES.ar.open}
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                onPointerDown={(event) => event.stopPropagation()}
                className="absolute right-[10px] bottom-[10px] rounded-full bg-[#bfea88] px-[14px] py-[6px] text-[11px] tracking-[1px] text-black backdrop-blur-[4px] transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? MEMORIES.saving : MEMORIES.save}
              </button>

              <ArPanel
                open={panel}
                onClose={() => setPanel(false)}
                worn={worn}
                onWear={(group, id) =>
                  setWorn((current) => ({ ...current, [group]: id ?? undefined }))
                }
                backdrop={backdrop}
                onBackdrop={setBackdrop}
                notice={notice}
              />
            </div>

          </div>

        <p className="shrink-0 text-center text-[13px] leading-[18px] text-[#6f6f6f]">
          {count !== null
            ? MEMORIES.booth.counting
            : live
              ? MEMORIES.booth.shoot
              : props.length
                ? MEMORIES.ar.hint
                : placed.length
                  ? MEMORIES.hint
                  : MEMORIES.empty}
        </p>
        </section>
      ) : null}

      {/* --------------------------------------------------- the bottom bar */}
      {/* Filters, stickers and the line, in that order — the three things you
          reach for, all on the one screen as the card sits above them. Each row
          lies flat and scrolls under a thumb on a phone, and wraps to fit at
          `md`, because a desktop has no thumb: a wheel scrolls the page rather
          than the row, and anything past the right edge would simply be
          unreachable. */}
      {stage === "studio" ? (
        <div className="shrink-0 border-[#1f1f1f] border-t bg-black/92">
          <div className="mx-auto w-full max-w-[1180px] px-[20px] py-[8px]">
            <h2 className="sr-only">{MEMORIES.fx.label}</h2>
            <FilterTray active={fx} onPick={setFx} className="-mx-[20px]" />

            <h2 className="sr-only">{MEMORIES.tray}</h2>
            <div className="-mx-[20px] mt-[6px] flex gap-[8px] overflow-x-auto px-[20px] [scrollbar-width:none] md:flex-wrap md:justify-center md:overflow-x-visible [&::-webkit-scrollbar]:hidden">
              {STICKERS.map((sticker) => {
                // Fitted to the tile on whichever side is the longer. Given a
                // width alone, the push pin — nearly twice as tall as it is
                // wide — hangs out of the bottom of its own chip.
                const box = boxOf(sticker);
                const drawn = TILE_ART * Math.min(1, box.w / box.h);
                return (
                  <button
                    key={sticker.id}
                    type="button"
                    title={sticker.label}
                    onClick={() => add(sticker)}
                    className="flex size-[58px] shrink-0 items-center justify-center rounded-[10px] border border-[#2a2a2a] bg-[#0d0d0d] transition-colors hover:border-[#bfea88]"
                  >
                    <StickerArt sticker={sticker} width={drawn} measured={measured} />
                    <span className="sr-only">{sticker.label}</span>
                  </button>
                );
              })}
            </div>

            {/* The line, and nothing beside it. SAVE used to sit on the end of
                this row, which meant the caption was centred in the space the
                button left over rather than on the card — off to the left by
                half a button, and further on a wide screen where the row is
                wider and the button is not. It is chrome on the card now, so
                this row is only ever one thing and centring it is honest. */}
            <div className="mt-[6px] flex items-center justify-center gap-[10px]">
              <div className="flex min-w-0 max-w-[560px] grow items-center justify-center gap-[10px]">
                <button
                  type="button"
                  aria-label={MEMORIES.prev}
                  onClick={() => step(-1)}
                  className="size-[34px] shrink-0 rounded-full border border-[#3a3a3a] text-[15px] text-[#fcfcfc] transition-colors hover:border-[#bfea88] hover:text-[#bfea88]"
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
                  className="size-[34px] shrink-0 rounded-full border border-[#3a3a3a] text-[15px] text-[#fcfcfc] transition-colors hover:border-[#bfea88] hover:text-[#bfea88]"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* The whole window on a bad signal, behind the title screen and over
          nothing that can be clicked. The scanlines and the chroma split, and
          deliberately not the tear: a bar sweeping down the page every few
          seconds is a thing to watch rather than a thing to read past. */}
      {stage === "intro" ? (
        <div className="pointer-events-none fixed inset-0 z-20 opacity-30">
          <FeedFx overlays={["scan", "chroma"]} period={SCAN.booth} />
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
