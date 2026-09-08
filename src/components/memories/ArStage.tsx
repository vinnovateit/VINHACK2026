"use client";

import { useEffect, useRef, type RefObject } from "react";
import FeedFx from "@/components/memories/FeedFx";
import { WINDOW, cover, type Aspect } from "@/components/memories/card";
import { SCAN, type FeedOverlay } from "@/components/memories/filters";
import { PROP_BY_ID, drawProp, placeProp } from "@/components/memories/ar";
import { backdropOf, needsMask } from "@/components/memories/backdrops";
import {
  loadFaces,
  loadSegmenter,
  mirrorFace,
  readFaces,
  segment,
  type Face,
  type FaceLandmarkerLike,
  type SegmenterLike,
} from "@/components/memories/vision";
import type { Shot } from "@/components/memories/useCamera";

/**
 * The layer between the picture and the card: what is drawn behind you, what is
 * hung on your face while the camera is running, and the frame round the lot.
 *
 * One canvas, sitting exactly on the photo window, in card units — so a figure
 * here is a figure in `card.ts` is a pixel of the saved PNG, the same contract
 * the rest of the studio keeps. Everything it draws, `paint.ts` draws again
 * from the same functions in `ar.ts` and `backdrops.ts`, so the file and the
 * screen cannot come apart.
 *
 * ------------------------------------------------------------- what it covers
 *
 * Usually nothing: the <video> shows the picture, this is transparent over the
 * top, and it draws props and a frame. A *scene* backdrop changes that — you
 * cannot put a hall behind somebody without holding the picture yourself — so
 * when one is chosen this canvas becomes the picture: it draws the scene, then
 * the person cut out of the frame, then the props, then the frame. The studio
 * hides the video and the still underneath it for exactly as long as that is
 * true. If the segmenter never arrives the picture is still drawn, just without
 * a scene behind it, which is a plain photograph rather than a broken one.
 *
 * ----------------------------------------------------------- what it hands on
 *
 * The detection loop is here, so the last faces and the last cut-out are here,
 * and the shutter needs both at the instant it fires. They are written into a
 * ref the studio owns rather than pushed through state: sixty setStates a
 * second to move a pair of sunglasses two pixels is not a thing to do to a
 * React tree that also holds a card, a sticker tray and a filter row.
 *
 * Detection is skipped on any frame the camera has not actually advanced.
 * `detectForVideo` wants timestamps that go forwards and a repeated frame is
 * work for an answer we already have, so `currentTime` is the gate — which on
 * a 30fps camera in a 60fps rAF loop halves the work for nothing lost.
 */

export type Sample = { faces: Face[]; mask: HTMLCanvasElement | null };

export default function ArStage({
  video,
  live,
  mirror,
  zoom,
  shot,
  aspect,
  props,
  backdrop,
  filter,
  overlays,
  sample,
  onVisionState,
}: {
  video: RefObject<HTMLVideoElement | null>;
  live: boolean;
  mirror: boolean;
  zoom: number;
  shot: Shot | null;
  aspect: Aspect;
  /** The props being worn, as ids. Live only — once the shutter goes they
   *  become pieces on the card and this stops drawing them. */
  props: readonly string[];
  backdrop: string;
  /** The chosen treatment, as a CSS `filter`. It goes on the plate and not on
   *  the overlay, because a filter treats the *picture* — the props and the
   *  frame are card furniture and are no more filtered than a sticker is. */
  filter: string;
  /** The treatment's painted half, laid between the two canvases below. */
  overlays: readonly FeedOverlay[];
  sample: RefObject<Sample>;
  /** Told when a model lands, or fails to. One call per kind, so the panel can
   *  say which of the two it is still waiting on. */
  onVisionState?: (kind: "faces" | "scenes", ok: boolean) => void;
}) {
  /** The picture, when this layer is holding it — see the note above. Filtered.
   *  Empty and invisible the rest of the time. */
  const plate = useRef<HTMLCanvasElement>(null);
  /** The props and the frame, over whatever the picture turned out to be. */
  const over = useRef<HTMLCanvasElement>(null);
  const work = useRef<HTMLCanvasElement | null>(null);
  const still = useRef<HTMLImageElement | null>(null);
  const stillMask = useRef<HTMLImageElement | null>(null);
  const landmarker = useRef<FaceLandmarkerLike | null>(null);
  const segmenter = useRef<SegmenterLike | null>(null);
  const lastFrame = useRef(-1);

  const window_ = WINDOW[aspect];
  const wantsProps = props.length > 0;
  const scene = needsMask(backdrop);

  // The models, asked for only once something on screen needs them, and never
  // waited on by anything that can be drawn without them.
  useEffect(() => {
    if (!wantsProps) return;
    let alive = true;
    loadFaces().then((found) => {
      if (!alive) return;
      landmarker.current = found;
      onVisionState?.("faces", !!found);
    });
    return () => {
      alive = false;
    };
  }, [wantsProps, onVisionState]);

  useEffect(() => {
    if (!scene) return;
    let alive = true;
    loadSegmenter().then((found) => {
      if (!alive) return;
      segmenter.current = found;
      onVisionState?.("scenes", !!found);
    });
    return () => {
      alive = false;
    };
  }, [scene, onVisionState]);

  // The still and its cut-out, held as images so the draw below is synchronous.
  useEffect(() => {
    if (!shot) {
      still.current = null;
      stillMask.current = null;
      return;
    }
    let alive = true;
    const photo = new Image();
    photo.onload = () => {
      if (alive) still.current = photo;
    };
    photo.src = shot.url;
    if (shot.mask) {
      const mask = new Image();
      mask.onload = () => {
        if (alive) stillMask.current = mask;
      };
      mask.src = shot.mask;
    } else {
      stillMask.current = null;
    }
    return () => {
      alive = false;
    };
  }, [shot]);

  useEffect(() => {
    const back = plate.current;
    const front = over.current;
    if (!back || !front) return;
    const under = back.getContext("2d");
    const ctx = front.getContext("2d");
    if (!under || !ctx) return;

    let raf = 0;
    const box = { w: window_.w, h: window_.h };

    /** The scratch the person is cut out on. One canvas for the life of the
     *  layer: allocating a 936-unit surface sixty times a second is the one
     *  thing in here that would actually show up as jank. */
    const scratch = () => {
      let sheet = work.current;
      if (!sheet) {
        sheet = document.createElement("canvas");
        work.current = sheet;
      }
      if (sheet.width !== box.w || sheet.height !== box.h) {
        sheet.width = box.w;
        sheet.height = box.h;
      }
      return sheet;
    };

    /** The rectangle of the source the window is showing: `cover` decides the
     *  shape of it and the zoom decides how much, always about the centre. */
    const visible = (source: { w: number; h: number }, times: number) => {
      const base = cover(source, box);
      const w = base.w / times;
      const h = base.h / times;
      return { x: (source.w - w) / 2, y: (source.h - h) / 2, w, h };
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      for (const surface of [back, front]) {
        if (surface.width !== box.w || surface.height !== box.h) {
          surface.width = box.w;
          surface.height = box.h;
        }
      }
      ctx.clearRect(0, 0, box.w, box.h);
      under.clearRect(0, 0, box.w, box.h);

      const feed = video.current;
      const running = live && feed && feed.videoWidth > 0;
      const source = running
        ? { w: feed.videoWidth, h: feed.videoHeight }
        : shot
          ? { w: shot.w, h: shot.h }
          : null;
      if (!source) return;

      const crop = visible(source, running ? zoom : 1);
      const k = box.w / crop.w;

      /* ------------------------------------------------------ the detecting */

      let faces: Face[] = sample.current.faces;
      if (running) {
        const moved = feed.currentTime !== lastFrame.current;
        if (moved) {
          lastFrame.current = feed.currentTime;
          const stamp = performance.now();
          if (wantsProps && landmarker.current) {
            faces = readFaces(landmarker.current, feed, stamp, source);
            sample.current.faces = faces;
          } else if (!wantsProps) {
            faces = [];
            sample.current.faces = faces;
          }
          if (scene && segmenter.current) {
            const cut = segment(segmenter.current, feed, stamp);
            if (cut) sample.current.mask = cut;
          } else if (!scene) {
            sample.current.mask = null;
          }
        }
      }

      /* ------------------------------------------------------ the backdrop */

      const art = backdropOf(backdrop);
      const cut = running ? sample.current.mask : stillMask.current;
      const picture: CanvasImageSource | null = running ? feed : still.current;

      if (scene && picture) {
        // The plate is the picture now. Scene first, then whoever was in
        // front of it, cut out and dropped back on top.
        if (art) art.draw(under, box.w, box.h);
        const sheet = scratch();
        const paint = sheet.getContext("2d");
        if (paint) {
          paint.clearRect(0, 0, box.w, box.h);
          paint.save();
          if (running && mirror) {
            paint.translate(box.w, 0);
            paint.scale(-1, 1);
          }
          paint.drawImage(picture, crop.x, crop.y, crop.w, crop.h, 0, 0, box.w, box.h);
          if (cut) {
            // The cut-out is in its own resolution — the model's small square
            // live, the photo's own size on a still — so the crop is converted
            // into its pixels rather than assumed to be in them.
            const mx = cut.width / source.w;
            const my = cut.height / source.h;
            paint.globalCompositeOperation = "destination-in";
            paint.drawImage(
              cut,
              crop.x * mx,
              crop.y * my,
              crop.w * mx,
              crop.h * my,
              0,
              0,
              box.w,
              box.h,
            );
            paint.globalCompositeOperation = "source-over";
          }
          paint.restore();
          under.drawImage(sheet, 0, 0);
        }
      }

      /* --------------------------------------------------------- the props */

      // Live only. After the shutter they are pieces on the card, with handles
      // round them, drawn by the studio — see `PropArt`.
      if (running && wantsProps) {
        for (const face of faces) {
          const seen = mirror ? mirrorFace(face) : face;
          for (const id of props) {
            const prop = PROP_BY_ID.get(id);
            if (!prop) continue;
            const spot = placeProp(prop, seen);
            drawProp(
              ctx,
              prop,
              (spot.at.x * source.w - crop.x) * k,
              (spot.at.y * source.w - crop.y) * k,
              spot.span * source.w * k,
              spot.roll,
            );
          }
        }
      }

      /* --------------------------------------------------------- the frame */

      if (art && art.kind === "frame") art.draw(ctx, box.w, box.h);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [
    backdrop,
    live,
    mirror,
    props,
    sample,
    scene,
    shot,
    video,
    wantsProps,
    window_.h,
    window_.w,
    zoom,
  ]);

  return (
    <>
      <canvas
        ref={plate}
        aria-hidden
        className="pointer-events-none absolute inset-0 block size-full"
        style={{
          filter: filter === "none" ? undefined : filter,
          // Only ever in front of the picture when it *is* the picture. Left
          // mounted either way so the loop above never has to reattach.
          visibility: scene ? undefined : "hidden",
        }}
      />
      {/* Between the two on purpose. The treatments are the half of a filter a
          filter cannot do, so they belong to the picture and go over whichever
          of the two layers is currently holding it — but under the props and
          the frame, which are furniture and no more scanlined than a sticker
          is. Same order `paint.ts` draws in, for the same reason. */}
      <FeedFx overlays={overlays} period={SCAN.period} />
      <canvas
        ref={over}
        aria-hidden
        className="pointer-events-none absolute inset-0 block size-full"
      />
    </>
  );
}
