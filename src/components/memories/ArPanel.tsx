"use client";

import { useEffect, useRef } from "react";
import PropArt from "@/components/memories/PropArt";
import { PROPS, PROP_GROUPS, type PropGroup } from "@/components/memories/ar";
import { BACKDROPS, PLAIN, type Backdrop } from "@/components/memories/backdrops";
import { MEMORIES } from "@/content/site";

/**
 * The props and the backdrops, on a shelf that slides up over the bottom of the
 * card.
 *
 * A panel rather than two more rows under the tray, and that is a decision about
 * the one thing this page is short of. The studio is a locked window height with
 * no scroll — the card takes what the title and the bar leave over — so every
 * row added to the bar is height taken off the picture, and there were already
 * three. Sunglasses are also not something you reach for on the way past: you
 * open the drawer, you put a hat on, you shut it. So it opens over the card,
 * where you can see what you are choosing landing on your own face, and it gets
 * out of the way again.
 *
 * One piece per group. Nobody wears two pairs of sunglasses, and a tray that let
 * them would need a way to say which was on top; picking a second hat swaps the
 * first, and picking the one you are wearing takes it off. So there is always a
 * way back to a bare face, the way `STRAIGHT` is always in the filter row.
 *
 * Nothing here loads anything. The panel opening is what tells the studio a
 * model is wanted, and the notice is what the studio makes of how that went —
 * so this component is the same on a laptop with a fast line and on a phone that
 * cannot reach the CDN at all.
 */

export default function ArPanel({
  open,
  onClose,
  worn,
  onWear,
  backdrop,
  onBackdrop,
  notice,
}: {
  open: boolean;
  onClose: () => void;
  worn: Partial<Record<PropGroup, string>>;
  onWear: (group: PropGroup, id: string | null) => void;
  backdrop: string;
  onBackdrop: (id: string) => void;
  /** What the studio has to say about the models, or nothing when there is
   *  nothing to say. */
  notice: string | null;
}) {
  return (
    <div
      // Kept mounted and slid out of the way, so opening it does not rebuild
      // eleven canvases every time. Which is exactly why it has to be made
      // inert as well as hidden: a drawer that is off the bottom of the card
      // is still in the document, and without this every prop in it stays in
      // the tab order, so the key after SAVE lands on a button nobody can see.
      aria-hidden={!open}
      inert={!open}
      onPointerDown={(event) => event.stopPropagation()}
      className={`absolute inset-x-0 bottom-0 z-20 flex max-h-[78%] flex-col rounded-t-[14px] border-[#2a2a2a] border-t bg-black/92 backdrop-blur-[6px] transition-transform duration-300 ${
        open ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between px-[14px] pt-[10px] pb-[6px]">
        <h2 className="text-[12px] tracking-[2px] text-[#bfea88]">
          {MEMORIES.ar.label}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={MEMORIES.ar.close}
          className="rounded-full border border-[#3a3a3a] px-[10px] py-[3px] text-[11px] text-[#a8a2a2] transition-colors hover:border-[#bfea88] hover:text-[#bfea88]"
        >
          {MEMORIES.ar.close}
        </button>
      </div>

      {notice ? (
        <p
          aria-live="polite"
          className="shrink-0 px-[14px] pb-[6px] text-[11px] leading-[15px] text-[#a8a2a2]"
        >
          {notice}
        </p>
      ) : null}

      <div className="min-h-0 grow overflow-y-auto overscroll-contain px-[14px] pb-[12px]">
        {PROP_GROUPS.map((group) => (
          <section key={group.id} className="mt-[4px]">
            <h3 className="text-[10px] tracking-[1.5px] text-[#6f6f6f]">
              {group.label}
            </h3>
            <div className="mt-[4px] flex gap-[7px] overflow-x-auto pb-[3px] [scrollbar-width:none] md:flex-wrap md:overflow-x-visible [&::-webkit-scrollbar]:hidden">
              {PROPS.filter((prop) => prop.group === group.id).map((prop) => {
                const on = worn[group.id] === prop.id;
                return (
                  <button
                    key={prop.id}
                    type="button"
                    aria-pressed={on}
                    title={prop.label}
                    onClick={() => onWear(group.id, on ? null : prop.id)}
                    className={`flex size-[52px] shrink-0 items-center justify-center rounded-[10px] border transition-colors ${
                      on
                        ? "border-[#bfea88] bg-[#bfea88]/10"
                        : "border-[#2a2a2a] bg-[#0d0d0d] hover:border-[#5c5c5c]"
                    }`}
                  >
                    <PropArt prop={prop} width={38} />
                    <span className="sr-only">{prop.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <section className="mt-[10px]">
          <h3 className="text-[10px] tracking-[1.5px] text-[#6f6f6f]">
            {MEMORIES.ar.backdrops}
          </h3>
          <div className="mt-[4px] flex gap-[7px] overflow-x-auto pb-[3px] [scrollbar-width:none] md:flex-wrap md:overflow-x-visible [&::-webkit-scrollbar]:hidden">
            <Swatch
              label={MEMORIES.ar.plain}
              on={backdrop === PLAIN}
              onPick={() => onBackdrop(PLAIN)}
            />
            {BACKDROPS.map((art) => (
              <Swatch
                key={art.id}
                label={art.label}
                art={art}
                on={backdrop === art.id}
                onPick={() => onBackdrop(art.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const SWATCH = { w: 62, h: 44 };

/**
 * A backdrop, drawn at thumbnail size by the function that draws it full size.
 *
 * So a frame's swatch has the frame's own tape on it and a scene's swatch is
 * the scene, rather than a colour somebody picked to stand for one — the same
 * rule the filter chips follow. A scene draws opaque and a frame draws over the
 * grey behind it, which reads correctly as the difference between the two:
 * one replaces the picture behind you and one goes round it.
 */
function Swatch({
  label,
  art,
  on,
  onPick,
}: {
  label: string;
  art?: Backdrop;
  on: boolean;
  onPick: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    el.width = SWATCH.w * 2;
    el.height = SWATCH.h * 2;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, el.width, el.height);
    art?.draw(ctx, el.width, el.height);
  }, [art]);

  return (
    <button
      type="button"
      aria-pressed={on}
      title={label}
      onClick={onPick}
      className="shrink-0"
    >
      <span
        className={`block overflow-hidden rounded-[8px] border transition-colors ${
          on ? "border-[#bfea88]" : "border-[#2a2a2a] hover:border-[#5c5c5c]"
        }`}
      >
        <canvas
          ref={canvas}
          aria-hidden
          className="block"
          style={{ width: SWATCH.w, height: SWATCH.h }}
        />
      </span>
      <span
        className={`mt-[3px] block text-center text-[9px] tracking-[1px] ${
          on ? "text-[#bfea88]" : "text-[#a8a2a2]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
