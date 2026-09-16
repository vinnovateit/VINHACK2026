"use client";

import Link from "next/link";
import { PASS } from "@/content/site";

/**
 * The shutter on the attendee pass, and the only door into `/memories`.
 *
 * It sits in the gap the design already leaves between the two field columns —
 * "Type / Participant" ends around x 108 and "Duration / 30 Hours" starts
 * around x 264 in the card's own 374.669 x 546.48 drawing, so a 62px button
 * centred on (176.64, 349) lands between them without moving a single thing the
 * design placed. Those are card units, and the card is scaled as a whole by
 * `DesignCanvas` on the collage and by `Piece` on the phone, so one set of
 * numbers serves all three passes.
 *
 * The press is drawn the way a shutter behaves: the aperture closes down rather
 * than the button growing. `stopPropagation` is what keeps the card underneath
 * from recolouring on the way past — see the note in `PassCard`.
 */
export default function ShutterButton() {
  return (
    <Link
      href="/memories"
      aria-label={PASS.shutter}
      title={PASS.shutter}
      onClick={(event) => event.stopPropagation()}
      className="group absolute top-[318px] left-[145.64px] z-10 flex size-[62px] items-center justify-center rounded-full border-[3px] border-(--pass-ink) bg-(--pass-bg) transition-transform duration-200 hover:scale-105 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-(--pass-ink) active:scale-95"
    >
      <span className="size-[38px] rounded-full bg-(--pass-ink) transition-[width,height] duration-200 group-hover:size-[24px] group-active:size-[18px]" />
    </Link>
  );
}
