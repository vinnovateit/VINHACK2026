"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * The attendee pass's arrival: it tumbles in.
 *
 * This sits exactly where each pass's tilt wrapper sat — the `flex-none
 * rotate-…` div between the Figma box and `PassCard` — and takes the tilt over
 * as an animated value rather than a Tailwind class. That matters twice:
 *
 *   - the class and the animation would otherwise fight over one `transform`,
 *     and the animation, re-writing it every frame, would flatten the tilt;
 *   - the wrapper is not a `data-node-id` box, so `PageMotion` never resolves a
 *     move onto it. The drift and the idle lean stay on the group above,
 *     the tumble is on this div, and neither can cancel the other.
 *
 * The rotation runs on its own spring while everything else eases, which is
 * what makes it read as a card thrown onto a table rather than a box sliding
 * to a stop: the drop lands, the angle keeps wobbling past its rest for a beat.
 *
 * `once: true` — this is an entrance. It plays when the pass first comes up and
 * is not re-armed on the way back, so scrubbing the section does not have the
 * two passes flinging themselves in over and over.
 */
export default function PassTumble({
  /** Resting angle in degrees — the tilt the design draws the pass at. */
  tilt,
  /** Seconds to hold before the pass drops, so a pair deals in one at a time. */
  delay = 0,
  className,
  children,
}: {
  tilt: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const still = useReducedMotion();

  // Reduced motion gets the pass as drawn: at its angle, already landed.
  if (still) {
    return (
      <div className={className} style={{ transform: `rotate(${tilt}deg)` }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -170, rotate: tilt - 24, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.85,
        delay,
        ease: [0.22, 1, 0.36, 1],
        rotate: { type: "spring", stiffness: 48, damping: 8.5, mass: 1, delay },
        opacity: { duration: 0.35, delay },
      }}
    >
      {children}
    </motion.div>
  );
}
