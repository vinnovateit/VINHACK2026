"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GlitchField from "@/components/GlitchField";

type Status =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "live"; stream: MediaStream }
  | { kind: "error"; message: string };

/**
 * The attendee pass's "LIVE CAMERA FEED" panel, wired to the real webcam.
 *
 * The camera opens as soon as the panel mounts — `getUserMedia` fires on the
 * first render rather than waiting for a click — and the panel doubles as the
 * off switch so the camera can be released without leaving the page. Tracks
 * are stopped on unmount, including when the permission prompt resolves after
 * the component has already gone.
 *
 * The <video> is mounted only once there is a stream to put in it. Besides
 * keeping a dead media element out of the initial HTML, this avoids a
 * hydration mismatch: browser extensions that manage video playback tag every
 * <video> on the page (`data-video="0"` and friends) as soon as it parses,
 * which React then reports as server/client markup drift.
 *
 * Requires a secure context: this works on localhost and over HTTPS, and
 * degrades to a message everywhere else.
 */
export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  // Attach the stream once React has actually put the <video> in the DOM.
  const stream = status.kind === "live" ? status.stream : null;
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => {});
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus({
        kind: "error",
        message: window.isSecureContext ? "CAMERA UNSUPPORTED" : "HTTPS REQUIRED",
      });
      return;
    }

    setStatus({ kind: "starting" });
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      // The prompt can resolve after this component is gone — don't leak a
      // live camera in that case.
      if (!mountedRef.current) {
        next.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = next;
      setStatus({ kind: "live", stream: next });
    } catch (error) {
      if (!mountedRef.current) return;
      const name = error instanceof DOMException ? error.name : "";
      setStatus({
        kind: "error",
        message:
          name === "NotAllowedError"
            ? "CAMERA BLOCKED"
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "NO CAMERA FOUND"
              : "CAMERA UNAVAILABLE",
      });
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus({ kind: "idle" });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    // Runs once on mount only — `start` is stable (empty deps) and re-running
    // it on every render would re-request permission after the user hits stop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const live = status.kind === "live";

  return (
    <button
      type="button"
      // The pass this panel sits in recolours on a click anywhere that is not
      // a control, so the camera's own click has to stop there. See `PassCard`.
      onClick={(event) => {
        event.stopPropagation();
        (live ? stop : start)();
      }}
      disabled={status.kind === "starting"}
      aria-label={live ? "Turn the camera off" : "Turn the camera on"}
      className="absolute inset-0 block cursor-pointer bg-[#fcfcfc] text-[#2849cb]"
    >
      {live ? (
        <>
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="absolute inset-0 size-full -scale-x-100 object-cover"
          />
          <span className="absolute left-[10px] top-[8px] flex items-center gap-[6px] font-rotonto text-[13px] text-[#fa1a1d]">
            <span className="size-[8px] rounded-full bg-[#fa1a1d]" />
            LIVE
          </span>
        </>
      ) : (
        <>
          {/* The panel that is not yet a picture. It sits under the lettering
              and inside the colourway's filter, so the noise is drained,
              inverted or tinted exactly like the feed it stands in for. */}
          <GlitchField />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-[2px] font-rotonto text-[21.12px] leading-[normal]">
            {status.kind === "error" ? (
              <>
                <span className="text-[#fa1a1d]">{status.message}</span>
                <span className="mt-[4px] text-[13px] opacity-70">CLICK TO RETRY</span>
              </>
            ) : (
              <>
                <span>LIVE</span>
                <span>CAMERA</span>
                <span>FEED</span>
                <span className="mt-[4px] text-[13px] opacity-70">
                  {status.kind === "starting" ? "REQUESTING…" : "CLICK TO ENABLE"}
                </span>
              </>
            )}
          </span>
        </>
      )}
    </button>
  );
}
