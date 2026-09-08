"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { countTick, shutterClack } from "@/components/motion/camera";
import { MEMORIES } from "@/content/site";

/**
 * The camera, as a hook rather than a panel.
 *
 * It used to be a component with the picture, the shutter and the filters
 * inside it, on a screen of its own. It is a hook now because the camera and
 * the card are the same screen: the live feed sits *in the card's photo window*
 * and the shutter sits under it, which means the two are in different corners of
 * a layout neither of them owns. Nothing about running a camera cares where the
 * <video> ends up, so all of that stays here and the studio does the drawing.
 *
 * The camera is never opened on load. `getUserMedia` runs from an explicit
 * press and from nothing else, `stop` is offered so the panel can be an off
 * switch as well as an on one, and every track is stopped on unmount —
 * including when the permission prompt resolves after the component has already
 * gone. That is the same contract the pass's `CameraFeed` keeps, for the same
 * reason.
 *
 * The frame comes back mirrored *when it is the front camera*, because that is
 * the frame you posed against: you raised the hand that appeared on the left of
 * the panel, and a card that flipped it back would be a picture of a moment
 * that did not happen. The rear camera is the opposite — nobody has ever posed
 * against a rear camera, it is pointed at a thing, and mirroring that thing
 * would put the writing on it backwards. So `mirror` follows the lens rather
 * than being a property of the booth.
 *
 * ---------------------------------------------------------------------- zoom
 *
 * Digital, and deliberately so. `applyConstraints({ zoom })` is real optical
 * zoom and it exists on perhaps a third of the phones that will open this page
 * and almost no laptop, so building the feature on it would mean building a
 * feature most people cannot see. Cropping the frame works on everything, and
 * at the sizes the card is posted at — a 936-unit window off a 1280-wide feed —
 * there is real detail to spend before anybody can tell.
 *
 * The crop is centred and the preview scales about its own centre, which are
 * the same operation seen from two sides: what the transform shows on screen is
 * exactly the rectangle `grab` cuts out. Nothing is framed twice.
 *
 * ------------------------------------------------------------------- the shot
 *
 * Nothing is baked in. The stored frame is what the camera gave us at the crop
 * the viewer chose, and the filter travels beside it as a string, so a treatment
 * picked before the shot is still yours to change after it. What the shot does
 * carry is where it came from — the source frame's size, the rectangle taken out
 * of it and whether it was mirrored — because the AR props were placed against
 * that frame and have to be moved into this one. See `rebase` in `ar.ts`.
 */

export type Facing = "user" | "environment";

export type Shot = {
  url: string;
  w: number;
  h: number;
  /** The frame the camera was giving us, in pixels. */
  source: { w: number; h: number };
  /** The top-left of the rectangle taken out of it, in that frame's pixels. */
  crop: { x: number; y: number };
  /** Whether the picture was flipped on the way out — front camera, yes. */
  mirrored: boolean;
  /**
   * The cut-out, as a PNG the same size as the photo: opaque over the person,
   * clear over the room. Present only when a scene backdrop was chosen before
   * the shutter went, because it is the only thing that needs one and the
   * segmenter is not run otherwise.
   */
  mask?: string;
};

export type CameraStatus =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "live" }
  | { kind: "error"; message: string };

const COUNT_FROM = 3;

export const ZOOM = { min: 1, max: 4, step: 0.05 } as const;

/** What the shutter asks for at the moment it fires, beyond the frame itself:
 *  the cut-out, if a scene wanted one. Handed in by the studio, because the
 *  thing that has it is the layer doing the detecting. */
export type Extras = { mask: HTMLCanvasElement | null };

export function useCamera(
  onCapture: (shot: Shot) => void,
  extras?: () => Extras,
) {
  const video = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<CameraStatus>({ kind: "idle" });
  /** `null` when nothing is counting; 3, 2, 1, then 0 for the beep. */
  const [count, setCount] = useState<number | null>(null);
  const [facing, setFacing] = useState<Facing>("user");
  const [zoom, setZoom] = useState<number>(ZOOM.min);
  /** False until a stream has come back and the device list says there is
   *  more than one camera to come back from. No point offering a flip on a
   *  laptop with one lens. */
  const [canFlip, setCanFlip] = useState(false);
  /**
   * Bumped every time a stream is attached. The effect below cannot key off
   * `live` alone: flipping the lens swaps the stream without ever leaving the
   * live state, and without this the <video> would keep pointing at the tracks
   * we had just stopped.
   */
  const [generation, setGeneration] = useState(0);

  const mirror = facing === "user";

  const release = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    release();
    setStatus({ kind: "idle" });
    setCount(null);
  }, [release]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  // Attach the stream once React has actually put the <video> in the DOM. The
  // studio mounts it only when there is a stream to put in it, so this cannot
  // run before there is an element.
  const live = status.kind === "live";
  useEffect(() => {
    const el = video.current;
    const stream = streamRef.current;
    if (!el || !stream || !live) return;
    el.srcObject = stream;
    el.play().catch(() => {});
    return () => {
      el.srcObject = null;
    };
  }, [live, generation]);

  const open = useCallback(
    async (which: Facing) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus({
          kind: "error",
          message: globalThis.isSecureContext
            ? MEMORIES.booth.unsupported
            : MEMORIES.booth.insecure,
        });
        return;
      }

      setStatus({ kind: "starting" });
      try {
        const next = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: which,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        // The prompt can resolve after the studio is gone — don't leak a live
        // camera in that case.
        if (!mounted.current) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }

        release();
        streamRef.current = next;
        setFacing(which);
        setStatus({ kind: "live" });
        setGeneration((n) => n + 1);

        // Only worth asking once there is permission: before the prompt is
        // answered the labels are blank and the list is often a single
        // placeholder, so a flip button decided from it would be wrong.
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            if (!mounted.current) return;
            const cameras = devices.filter((d) => d.kind === "videoinput");
            setCanFlip(cameras.length > 1);
          })
          .catch(() => {});
      } catch (error) {
        if (!mounted.current) return;
        const name = error instanceof DOMException ? error.name : "";
        setStatus({
          kind: "error",
          message:
            name === "NotAllowedError"
              ? MEMORIES.booth.blocked
              : name === "NotFoundError" || name === "OverconstrainedError"
                ? MEMORIES.booth.missing
                : MEMORIES.booth.unavailable,
        });
      }
    },
    [release],
  );

  const start = useCallback(() => open(facing), [facing, open]);

  /** The other lens. The zoom goes back to 1 with it: a crop chosen against
   *  one field of view means nothing against the other. */
  const flip = useCallback(() => {
    setZoom(ZOOM.min);
    void open(facing === "user" ? "environment" : "user");
  }, [facing, open]);

  const grab = useCallback(() => {
    const el = video.current;
    if (!el || !el.videoWidth) return;
    const source = { w: el.videoWidth, h: el.videoHeight };
    // The visible rectangle: the whole frame at zoom 1, and a centred fraction
    // of it above that — the same rectangle the preview's transform is showing.
    const scale = Math.max(ZOOM.min, zoom);
    const w = Math.round(source.w / scale);
    const h = Math.round(source.h / scale);
    const crop = {
      x: Math.round((source.w - w) / 2),
      y: Math.round((source.h - h) / 2),
    };

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    if (mirror) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(el, crop.x, crop.y, w, h, 0, 0, w, h);
    ctx.restore();

    // The cut-out, cropped and flipped to sit exactly on the photo. Drawn from
    // the model's own small square up to the source frame's size and then
    // shifted by the crop, which is the same journey the pixels took.
    let mask: string | undefined;
    const found = extras?.().mask;
    if (found) {
      const sheet = document.createElement("canvas");
      sheet.width = w;
      sheet.height = h;
      const maskCtx = sheet.getContext("2d");
      if (maskCtx) {
        if (mirror) {
          maskCtx.translate(w, 0);
          maskCtx.scale(-1, 1);
        }
        maskCtx.drawImage(found, -crop.x, -crop.y, source.w, source.h);
        mask = sheet.toDataURL("image/png");
      }
    }

    shutterClack();
    stop();
    onCapture({
      url: canvas.toDataURL("image/jpeg", 0.92),
      w,
      h,
      source,
      crop,
      mirrored: mirror,
      mask,
    });
  }, [extras, mirror, onCapture, stop, zoom]);

  /** Three ticks, a beep, a frame. Each step schedules the next, so cancelling
   *  is one `clearTimeout` wherever the run is interrupted. */
  const shoot = useCallback(() => {
    if (count !== null) return;
    const step = (n: number) => {
      setCount(n);
      countTick(n === 0);
      if (n === 0) {
        timer.current = setTimeout(grab, 180);
        return;
      }
      timer.current = setTimeout(() => step(n - 1), 800);
    };
    step(COUNT_FROM);
  }, [count, grab]);

  return {
    video,
    status,
    count,
    live,
    facing,
    mirror,
    canFlip,
    zoom,
    setZoom,
    flip,
    start,
    stop,
    shoot,
  };
}

/**
 * Two fingers on the picture, as a zoom.
 *
 * Kept here rather than in the studio because it is the camera's gesture and
 * not the card's: it is the same crop the slider moves, reached the way anybody
 * holding a phone would reach for it. One pointer does nothing — the card
 * beneath is full of things that are dragged with one finger, and a pinch that
 * started on the first touch would fight every one of them.
 *
 * Distances are compared against the distance the pinch *started* at, and the
 * zoom against the zoom it started at, so a pinch is one continuous gesture
 * rather than an accumulation of frames that drifts.
 */
export function usePinchZoom(
  zoom: number,
  setZoom: (value: number) => void,
  enabled: boolean,
) {
  const points = useRef(new Map<number, { x: number; y: number }>());
  const origin = useRef<{ gap: number; zoom: number } | null>(null);

  const gapOf = () => {
    const [a, b] = [...points.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (!enabled) return;
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.current.size === 2) origin.current = { gap: gapOf(), zoom };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!enabled || !points.current.has(event.pointerId)) return;
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const from = origin.current;
    if (points.current.size !== 2 || !from || !from.gap) return;
    event.preventDefault();
    const next = (from.zoom * gapOf()) / from.gap;
    setZoom(Math.min(ZOOM.max, Math.max(ZOOM.min, next)));
  };

  const onPointerUp = (event: React.PointerEvent) => {
    points.current.delete(event.pointerId);
    if (points.current.size < 2) origin.current = null;
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    /** Two fingers must be able to land without the browser panning the page
     *  out from under them. */
    style: enabled ? ({ touchAction: "none" } as const) : undefined,
  };
}
