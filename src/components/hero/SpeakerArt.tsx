/**
 * The speaker sticker's drawing — the horn, its two arcs, and the cross struck
 * where the arcs are when the page is muted.
 *
 * Figma exported this as one flat purple rectangle masked by a single
 * hand-drawn PNG, which cannot say anything about state: the horn and both arcs
 * are one shape, so the arcs cannot leave without the horn leaving with them.
 * The mask has been split along its own drawn strokes into the three pieces it
 * always had — `speaker-cone`, `speaker-wave-inner`, `speaker-wave-outer` — at
 * the same size and registration as the original, so the layers below stack
 * back to exactly the export while each one can now be lit, coloured and moved
 * on its own.
 *
 * Lifted out of `sections/Hero.tsx` so the phone's hero draws the same switch.
 * It is artwork only: the hit target, the `role="switch"` and the aria state
 * belong to whichever layout places it, and the behaviour is `motion/speaker.ts`
 * — one wiring, wherever the sticker is drawn.
 *
 * The box it fills is the sticker's own 128.981 x 109.634.
 */
export default function SpeakerArt() {
  return (
    /* Everything the sticker draws rides on this layer, a notch up from the
       Figma size and scaled about the sticker's own centre so it grows in
       place. The hit target is the box outside it and stays where the design
       puts it. */
    <div className="absolute inset-0 scale-110">
      <div className="-top-[49.013px] -left-[50.304px] absolute h-[208.949px] w-[192.182px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[50.304px_49.013px] mask-size-[128.981px_109.634px]" data-node-id="343:1192" data-speaker="cone" data-name="Group" style={{ maskImage: "url('/figma/speaker-cone.png')", backgroundColor: "#db9eef" }} />
      {/* The arcs live in their own box so the two of them can pulse on their
          own transforms while this one carries the single on/off fade — a fade
          and a pulse on the same element would be two tweens fighting over one
          opacity. */}
      <div className="absolute inset-0" data-speaker="waves">
        <div className="-top-[49.013px] -left-[50.304px] absolute h-[208.949px] w-[192.182px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[50.304px_49.013px] mask-size-[128.981px_109.634px]" data-speaker="wave" style={{ maskImage: "url('/figma/speaker-wave-inner.png')", backgroundColor: "#bfea88", transformOrigin: "130.68px 105.67px" }} />
        <div className="-top-[49.013px] -left-[50.304px] absolute h-[208.949px] w-[192.182px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[50.304px_49.013px] mask-size-[128.981px_109.634px]" data-speaker="wave" style={{ maskImage: "url('/figma/speaker-wave-outer.png')", backgroundColor: "#bfea88", transformOrigin: "130.68px 105.67px" }} />
      </div>
      {/* Drawn rather than exported: nothing in the design file has a cross in
          it. It sits exactly where the arcs sit and is the same size as them, so
          muting reads as the signal being struck out rather than as a mark laid
          over the whole sticker — which is what a diagonal slash here did, and
          it looked like a browser icon dropped on the collage. The bow and the
          round caps are there to sit next to strokes that were drawn by hand.

          The markup ships both strokes fully retracted, so the state the server
          renders is the state the module defaults to. */}
      <svg aria-hidden className="absolute inset-0 size-full overflow-visible" data-speaker="cross" fill="none" viewBox="0 0 128.981 109.634">
        <path d="M84 39 Q 103 57 121 75" stroke="#fa1a1d" strokeWidth="9" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="60" />
        <path d="M121 39 Q 103 57 84 75" stroke="#fa1a1d" strokeWidth="9" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="60" />
      </svg>
    </div>
  );
}
