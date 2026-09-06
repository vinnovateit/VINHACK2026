"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GlitchField from "@/components/GlitchField";
import { WINDOW, type Aspect } from "@/components/memories/card";
import { countTick, shutterClack } from "@/components/motion/camera";
import { PASS_VARIANTS } from "@/components/pass/variants";
import { MEMORIES } from "@/content/site";

/**
 * The first half of `/memories`: the camera you take the shot with.
 *
 * The camera is never opened on load. `getUserMedia` runs from an explicit
 * press and from nothing else, the panel is the off switch as well as the on
 * one, and every track is stopped on unmount — including when the permission
 * prompt resolves after this component has already gone. That is the same
 * contract the pass's `CameraFeed` keeps, for the same reason.
 *
 * Two things it does that the pass's panel does not:
 *
 *   filters      the five colourways' `feed` filters, offered by treatment
 *                rather than by colour. Nothing is baked into the capture —
 *                the frame is stored exactly as the camera gave it and the
 *                filter travels beside it as a string, so it is still yours to
 *                change after the shot.
 *   a countdown  three ticks and a go-ahead beep, then the frame. Long enough
 *                to get an arm around someone.
 *
 * The frame is stored mirrored, because that is the frame you posed against:
 * you raised the hand that appears on the left of the panel, and a card that
 * flipped it back would be a picture of a moment that did not happen.
 *
 * The <video> is mounted only once there is a stream to put in it. Besides
 * keeping a dead media element out of the initial HTML, this avoids a hydration
 * mismatch: extensions that manage video playback tag every <video> on the page
 * as soon as it parses, which React then reports as markup drift.
 */

export type Shot = { url: string; w: number; h: number };

type Status =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "live" }
  | { kind: "error"; message: string };

const COUNT_FROM = 3;

export default function Booth({
  aspect,
  filter,
  onFilter,
  onCapture,
  onSkip,
}: {
  aspect: Aspect;
  /** Index into `PASS_VARIANTS`. */
  filter: number;
  onFilter: (index: number) => void;
  onCapture: (shot: Shot) => void;
  onSkip: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [count, setCount] = useState<number | null>(null);

  const feed = PASS_VARIANTS[filter % PASS_VARIANTS.length].feed;
  const window_ = WINDOW[aspect];

  const stopEverything = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopEverything();
    };
  }, [stopEverything]);

  // Attach the stream once React has actually put the <video> in the DOM.
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
  }, [live]);

  const start = useCallback(async () => {
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
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });

      // The prompt can resolve after this component is gone — don't leak a
      // live camera in that case.
      if (!mounted.current) {
        next.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = next;
      setStatus({ kind: "live" });
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
  }, []);

  /** The frame, mirrored, as a data URL. Same-origin by construction, so the
   *  card's canvas stays readable when it draws this back in. */
  const grab = useCallback(() => {
    const el = video.current;
    if (!el || !el.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = el.videoWidth;
    canvas.height = el.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
    shutterClack();
    stopEverything();
    setStatus({ kind: "idle" });
    setCount(null);
    onCapture({
      url: canvas.toDataURL("image/jpeg", 0.92),
      w: canvas.width,
      h: canvas.height,
    });
  }, [onCapture, stopEverything]);

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

  const panel = status.kind === "live";

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-[18px]">
      <div
        className="relative w-full overflow-hidden rounded-[8px] bg-[#050505]"
        style={{ aspectRatio: `${window_.w} / ${window_.h}` }}
      >
        <button
          type="button"
          onClick={() => {
            if (panel) shoot();
            else if (status.kind !== "starting") start();
          }}
          disabled={status.kind === "starting"}
          aria-label={panel ? MEMORIES.booth.shoot : MEMORIES.booth.enable}
          className="absolute inset-0 block cursor-pointer bg-[#fcfcfc] text-[#2849cb]"
          style={{ filter: feed }}
        >
          {panel ? (
            <video
              ref={video}
              muted
              playsInline
              autoPlay
              className="absolute inset-0 size-full -scale-x-100 object-cover"
            />
          ) : (
            <>
              {/* The panel that is not yet a picture. It sits inside the
                  filter with everything else, so the dead signal is drained,
                  inverted or tinted exactly like the feed it stands in for. */}
              <GlitchField />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-[2px] font-rotonto text-[clamp(18px,4.4vw,26px)] leading-[normal]">
                {status.kind === "error" ? (
                  <>
                    <span className="text-[#fa1a1d]">{status.message}</span>
                    <span className="mt-[6px] text-[13px] opacity-70">
                      {MEMORIES.booth.retry}
                    </span>
                  </>
                ) : (
                  <>
                    {MEMORIES.booth.idle.map((word) => (
                      <span key={word}>{word}</span>
                    ))}
                    <span className="mt-[6px] text-[13px] opacity-70">
                      {status.kind === "starting"
                        ? MEMORIES.booth.requesting
                        : MEMORIES.booth.enable}
                    </span>
                  </>
                )}
              </span>
            </>
          )}
        </button>

        {count !== null ? (
          <span
            aria-live="assertive"
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 font-rotonto text-[clamp(64px,18vw,150px)] text-[#bfea88]"
          >
            {count > 0 ? MEMORIES.booth.countdown(count) : ""}
          </span>
        ) : null}
      </div>

      {/* The five treatments. Live on the preview and kept beside the frame
          afterwards, so this is a choice rather than a commitment. */}
      <div className="w-full">
        <h2 className="text-center text-[12px] tracking-[1.4px] text-[#6f6f6f]">
          {MEMORIES.booth.filter}
        </h2>
        <div className="mt-[8px] flex flex-wrap justify-center gap-[8px]">
          {PASS_VARIANTS.map((variant, index) => (
            <button
              key={variant.name}
              type="button"
              aria-pressed={index === filter}
              onClick={() => onFilter(index)}
              className={`rounded-full border px-[14px] py-[7px] text-[12px] tracking-[1px] transition-colors ${
                index === filter
                  ? "border-[#bfea88] bg-[#bfea88] text-black"
                  : "border-[#3a3a3a] text-[#a8a2a2] hover:border-[#bfea88] hover:text-[#bfea88]"
              }`}
            >
              {variant.treatment}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-[12px]">
        {/* The shutter, drawn the way the pass's is: the aperture closes down
            rather than the button growing. */}
        <button
          type="button"
          onClick={shoot}
          disabled={!panel || count !== null}
          aria-label={MEMORIES.booth.shoot}
          className="group flex size-[72px] items-center justify-center rounded-full border-[3px] border-[#bfea88] transition-transform duration-200 enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-35"
        >
          <span className="size-[46px] rounded-full bg-[#bfea88] transition-[width,height] duration-200 group-hover:size-[30px] group-active:size-[22px]" />
        </button>
        <p className="text-[13px] text-[#6f6f6f]">
          {count !== null
            ? MEMORIES.booth.counting
            : panel
              ? MEMORIES.booth.shoot
              : MEMORIES.booth.enable}
        </p>
        <button
          type="button"
          onClick={() => {
            stopEverything();
            onSkip();
          }}
          className="text-[13px] text-[#a8a2a2] underline-offset-[4px] hover:text-[#bfea88] hover:underline"
        >
          {MEMORIES.booth.skip}
        </button>
      </div>
    </div>
  );
}
