import gsap from "gsap";

/**
 * Picking a sticker up off the collage, putting it somewhere else — or throwing
 * it off the page.
 *
 * Written against pointer events and `gsap.set` rather than against GSAP's
 * Draggable, for two reasons that are both about this particular page:
 *
 *   the canvas is scaled   `DesignCanvas` renders the 1280px collage at
 *                          whatever fraction of it fits the viewport, so a
 *                          pointer that has travelled 100 screen pixels has
 *                          travelled rather more than 100 layout pixels. Every
 *                          delta here is multiplied back out by `unscale`,
 *                          which is the same figure `PageMotion` hands the
 *                          marquees.
 *   groups are not boxes   Figma's grouping wrappers are `display: contents`,
 *                          so "the taped VINHACK label" is three sibling boxes
 *                          with no parent to move. They are moved together, by
 *                          the same delta, which is exactly what `drift`
 *                          already does to the same kind of group.
 *
 * The x/y written here are the element's own, and they are the reason the
 * draggable stickers no longer carry a scroll-linked `drift`: a scrubbed tween
 * re-renders from its recorded start on every scroll tick, and would drag the
 * sticker back out from under the visitor's finger a frame after they let go.
 * A piece is either the scrollbar's to move or the visitor's. These are theirs.
 *
 * Deliberately *not* behind `prefers-reduced-motion`. Everything else on this
 * page moves without being asked; this only ever moves because a hand moved it,
 * and taking it away from someone who asked for less animation would be taking
 * away a control rather than an effect.
 */

/**
 * A sticker can also be got rid of, by throwing it.
 *
 * The bounds are no longer a wall: past them the group keeps moving at
 * `RUBBER` of the pointer's rate, which is the give a thing being pulled
 * against its edge has. Let go inside the bounds and it stays where it was put;
 * let go having pulled hard against them — fast, or a long way out — and it
 * carries on the way it was going and off the page.
 *
 * `THROW_SPEED` is screen px per millisecond, sampled over the tail of the
 * gesture rather than the whole of it: a slow drag that ends in a flick is a
 * flick, and averaging over the whole travel would swallow it. `THROW_SLACK` is
 * the other way in — a deliberate haul out past the edge, at any speed.
 */
const RUBBER = 0.42;
const THROW_SPEED = 0.9;
const THROW_SLACK = 96;
/** How much of the tail of the gesture the release speed is read off. */
const SAMPLE_MS = 90;

type Grab = {
  pointer: number;
  /** Where the pointer went down, in screen px. */
  x: number;
  y: number;
  /** Each box's x/y before the grab, in layout px. */
  start: { x: number; y: number }[];
  /** How far the pointer may travel before the group leaves `bounds`, screen
   *  px, measured once at the grab. */
  limit: { minX: number; maxX: number; minY: number; maxY: number };
  /** The tail of the gesture — position and time — for reading a release
   *  speed off. Trimmed on every move, so it never grows. */
  trail: { x: number; y: number; t: number }[];
  /** The last delta actually applied, so a throw knows which way to go. */
  at: { x: number; y: number };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Clamped, but with give: past the limit the travel continues at `RUBBER` of
 *  its rate rather than stopping dead. */
const rubber = (value: number, min: number, max: number) => {
  if (value > max) return max + (value - max) * RUBBER;
  if (value < min) return min + (value - min) * RUBBER;
  return value;
};

/** Whatever GSAP is currently holding for one transform axis, as a number.
 *  It answers with a bare number for a transform it has set and a unit string
 *  for one it has only read off the element, so both are handled. */
const axis = (box: HTMLElement, name: "x" | "y") => {
  const held = parseFloat(String(gsap.getProperty(box, name)));
  return Number.isFinite(held) ? held : 0;
};

/**
 * Makes one sticker draggable within `bounds`. Returns its own teardown, in the
 * shape `PageMotion` collects cleanups in.
 *
 * `onGrab` and `onDrop` are where the sticker's idle loop is paused and let go
 * again — a badge still turning under the cursor feels like it is trying to get
 * away, and one that never turns again feels broken.
 */
export function draggable(
  boxes: HTMLElement[],
  {
    bounds,
    unscale = 1,
    onGrab,
    onDrop,
    onThrown,
  }: {
    /** The element the sticker is held inside — until it is thrown out of it. */
    bounds: Element;
    /** Layout px per rendered px. */
    unscale?: number;
    onGrab?: () => void;
    onDrop?: () => void;
    /** Called once the sticker has left the page for good, so its idle loop
     *  can be killed rather than left turning something nobody can see. */
    onThrown?: () => void;
  },
): () => void {
  if (!boxes.length) return () => {};

  let grab: Grab | null = null;
  let gone = false;

  /** The sticker leaving: it keeps going the way it was thrown, turning as it
   *  flies, and is taken out of the layout once it is off. `power2.out` is a
   *  thrown object running out of momentum, not something being animated away.
   *
   *  `pointer-events: none` goes on immediately rather than at the end — the
   *  sticker is already gone as far as the visitor is concerned, and something
   *  still catching the cursor on its way out is a piece of the page that
   *  cannot be reached past. */
  const throwOut = (dx: number, dy: number) => {
    gone = true;
    const reach = Math.hypot(dx, dy) || 1;
    const spin = dx > 0 ? 40 : -40;
    for (const box of boxes) {
      box.style.pointerEvents = "none";
      box.style.cursor = "";
    }
    gsap.to(boxes, {
      x: `+=${(dx / reach) * 900 * unscale}`,
      y: `+=${(dy / reach) * 900 * unscale}`,
      rotation: `+=${spin}`,
      opacity: 0,
      duration: 0.75,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        // `visibility` rather than `display`: on the phone the stickers sit in
        // a flow row, and taking one out of the layout would shunt the ones
        // beside it sideways a beat after it left. This takes it off the screen
        // and out of the accessibility tree without moving anything else.
        for (const box of boxes) box.style.visibility = "hidden";
      },
    });
    onThrown?.();
  };

  const down = (event: PointerEvent) => {
    if (grab || gone || event.button !== 0) return;
    const target = event.currentTarget as HTMLElement;

    // The room left on each side, measured now rather than kept: the sticker
    // has usually been moved before, and both it and the section it is bounded
    // by are somewhere different on every scroll tick.
    const frame = bounds.getBoundingClientRect();
    const rects = boxes.map((box) => box.getBoundingClientRect());
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));

    grab = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: boxes.map((box) => ({ x: axis(box, "x"), y: axis(box, "y") })),
      limit: {
        minX: frame.left - left,
        maxX: frame.right - right,
        minY: frame.top - top,
        maxY: frame.bottom - bottom,
      },
      trail: [{ x: event.clientX, y: event.clientY, t: event.timeStamp }],
      at: { x: 0, y: 0 },
    };

    target.setPointerCapture?.(event.pointerId);
    target.style.cursor = "grabbing";
    onGrab?.();
    event.preventDefault();
  };

  const move = (event: PointerEvent) => {
    if (!grab || event.pointerId !== grab.pointer) return;
    const { limit } = grab;
    const dx = rubber(event.clientX - grab.x, limit.minX, limit.maxX);
    const dy = rubber(event.clientY - grab.y, limit.minY, limit.maxY);
    grab.at = { x: dx, y: dy };
    grab.trail.push({ x: event.clientX, y: event.clientY, t: event.timeStamp });
    while (
      grab.trail.length > 2 &&
      event.timeStamp - grab.trail[0].t > SAMPLE_MS
    ) {
      grab.trail.shift();
    }
    boxes.forEach((box, i) => {
      gsap.set(box, {
        x: grab!.start[i].x + dx * unscale,
        y: grab!.start[i].y + dy * unscale,
      });
    });
  };

  const up = (event: PointerEvent) => {
    if (!grab || event.pointerId !== grab.pointer) return;
    const target = event.currentTarget as HTMLElement;
    const { limit, at, trail, start } = grab;
    target.releasePointerCapture?.(event.pointerId);
    target.style.cursor = "grab";

    // How fast it was moving when it was let go, and how far past the edge it
    // had been hauled. Either is enough to throw it: a flick, or a shove.
    const first = trail[0];
    const span = Math.max(1, event.timeStamp - first.t);
    const vx = (event.clientX - first.x) / span;
    const vy = (event.clientY - first.y) / span;
    const slack = Math.max(
      limit.minX - at.x,
      at.x - limit.maxX,
      limit.minY - at.y,
      at.y - limit.maxY,
      0,
    );

    grab = null;

    if (Math.hypot(vx, vy) > THROW_SPEED || slack > THROW_SLACK) {
      // Thrown the way it was travelling — off the pointer's own direction
      // rather than off where it happens to be, so a flick straight down does
      // not fly sideways because the sticker started near an edge.
      const reach = Math.hypot(vx, vy);
      throwOut(reach ? vx : at.x, reach ? vy : at.y);
      return;
    }

    // Not thrown, but possibly hanging over the edge on the rubber. Put it
    // back inside the bounds it is allowed to live in.
    const home = {
      x: clamp(at.x, limit.minX, limit.maxX),
      y: clamp(at.y, limit.minY, limit.maxY),
    };
    if (home.x !== at.x || home.y !== at.y) {
      boxes.forEach((box, i) => {
        gsap.to(box, {
          x: start[i].x + home.x * unscale,
          y: start[i].y + home.y * unscale,
          duration: 0.32,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    }
    onDrop?.();
  };

  for (const box of boxes) {
    box.style.cursor = "grab";
    // Without this a drag on a touchscreen scrolls the page instead.
    box.style.touchAction = "none";
    box.style.userSelect = "none";
    box.addEventListener("pointerdown", down);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
  }

  return () => {
    for (const box of boxes) {
      box.removeEventListener("pointerdown", down);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerup", up);
      box.removeEventListener("pointercancel", up);
      box.style.cursor = "";
      box.style.touchAction = "";
      box.style.userSelect = "";
      // A sticker thrown off the page is gone for the life of the layout, not
      // for the life of the document: this only runs when the tree is being
      // taken down or the breakpoint has swapped it for the other one, and
      // arriving at a section with a hole in it is worse than getting the
      // sticker back.
      box.style.pointerEvents = "";
      box.style.visibility = "";
    }
    grab = null;
    gone = false;
  };
}
