import QrArt from "@/components/hero/QrArt";
import ScrollCue from "@/components/hero/ScrollCue";
import SpeakerArt from "@/components/hero/SpeakerArt";
import WordmarkArt from "@/components/hero/WordmarkArt";
import { HERO } from "@/content/site";

export default function HeroSection() {
  return (
    <section aria-label="VinHack" className="-translate-x-1/2 absolute bg-black h-[832px] left-1/2 overflow-visible top-0 w-[1280px]" data-node-id="343:1172" data-name="HERO FINAL">
      {/* The HOME / EXPLORE pair used to sit across the top of the plate and
          took the first ~90px of it with them. With the pair gone that strip is
          dead black above the wordmark, so the whole collage is lifted by
          exactly its height.

          A wrapper rather than 40 edited `top` values: `inset-0` makes this box
          the section's own frame, so it becomes the containing block every
          child already resolved against and every Figma offset below stays
          true to the design file. The section uses `overflow-visible` so
          stickers sweep in cleanly from edges while `.canvas-frame` manages
          viewport clipping. */}
      <div className="absolute inset-0 -translate-y-[90px]">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute contents left-[calc(50%+36.87px)] top-[calc(50%+60.18px)]" data-node-id="343:1175">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute contents left-[calc(50%+36.87px)] top-[calc(50%+63.37px)]" data-node-id="343:1176">
            <div className="absolute contents left-[104.87px] top-[150.38px]" data-node-id="343:1177">
              <h1 aria-label="VinHack" className="absolute h-[356.181px] left-[106.44px] top-[238.42px] w-[1020.951px] pointer-events-none" data-hero="wordmark" data-node-id="343:1178">
                <WordmarkArt />
              </h1>
            <div className="absolute contents left-[104.87px] top-[150.38px]" data-node-id="343:1182">
              <div className="absolute contents h-[280.357px] left-[765px] top-[528px] w-[463.743px]" data-hero="lede" data-node-id="343:1187">
                <div className="-translate-x-1/2 absolute flex h-[195.473px] items-center justify-center left-[996.87px] top-[570.44px] w-[435.054px]" data-node-id="343:1188">
                  <div className="flex-none rotate-[7.48deg]">
                    <p className="[word-break:break-word] font-rotonto leading-[28.35px] not-italic relative text-[#a8a2a2] text-[21px] text-center w-[420.147px]">{HERO.lede}</p>
                  </div>
                </div>
              </div>
              {/* The speaker sticker is the page's sound switch. The drawing —
                  the horn, its arcs and the cross struck through them — is
                  `hero/SpeakerArt`, because the phone's hero has the same
                  switch on it; the behaviour is `motion/speaker.ts`, for the
                  same reason.

                  This box is what stays here: the hit target, the focus ring,
                  and what the entrance deals in. Its rect is the Figma one —
                  1003.52, 172.56, 128.981 x 109.634 against the 1280 x 832
                  plate. */}
              <div className="absolute cursor-pointer h-[109.634px] left-[1003.52px] top-[172.56px] w-[128.981px]" data-hero="speaker" data-node-id="343:1189" data-name="Mask group" role="switch" aria-checked="true" aria-label={HERO.sound.label} tabIndex={0}>
                <SpeakerArt />
              </div>
              {/* Real box, not `display: contents` — the pieces of this sticker
                  have to turn as one, and only a box can be transformed. Child
                  offsets below are relative to it. See `motion/recipes.ts`. */}
              <div className="absolute h-[207.988px] left-[104.87px] top-[150.38px] w-[411.659px]" data-hero="git" data-node-id="343:1253">
                {/* The artwork layer. Scaled about the sticker's own centre so
                    the piece grows in place, and kept inside the tagged box so
                    the entrance still deals the box rather than fighting this
                    transform for the matrix. */}
                <div className="absolute inset-0 scale-110">
                <div className="absolute flex h-[207.988px] items-center justify-center left-0 top-0 w-[411.659px]" data-node-id="343:1254">
                  <div className="flex-none rotate-[-7.85deg]">
                    <div className="h-[155.601px] relative w-[394.094px]" data-name="image 205">
                      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src="/figma/image205.png" />
                    </div>
                  </div>
                </div>
                <div className="absolute flex h-[162.336px] items-center justify-center left-[25.46px] top-[21.19px] w-[359.724px]" data-node-id="343:1255">
                  <div className="flex-none rotate-[-7.85deg]">
                    <div className="h-[115.993px] relative w-[347.131px]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/ellipse50.svg" />
                    </div>
                  </div>
                </div>
                <div className="absolute flex h-[67.097px] items-center justify-center left-[60.48px] top-[68.06px] w-[290.935px]" data-node-id="343:1256">
                  <div className="-rotate-8 relative inline-flex items-center">
                    <span
                      aria-hidden="true"
                      className="font-rotonto leading-none not-italic text-[21.35px] whitespace-nowrap invisible select-none pointer-events-none"
                      data-hero="commit-ghost"
                    >
                      {HERO.commits[0]}
                    </span>
                    <div className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap">
                      <span
                        className="font-rotonto leading-none not-italic text-[#bfea88] text-[21.35px] whitespace-nowrap"
                        data-hero="commit-line"
                      >
                        {HERO.commits[0]}
                      </span>
                      <span
                        aria-hidden="true"
                        className="bg-[#bfea88] h-[18px] inline-block ml-[3px] shrink-0 w-[9px]"
                        data-hero="commit-caret"
                      />
                    </div>
                  </div>
                </div>
                </div>
              </div>
              {/* The QR sticker, on a layer of its own so it can be scaled up
                  with the rest of the collage.

                  This was a `display: contents` wrapper and every piece under
                  it is positioned in the plate's own 1280x832 coordinates —
                  several of them in percentages of it, and two in container
                  query units. Re-basing all of that onto a box the size of the
                  sticker would rewrite every one of those numbers, so the box
                  is the plate instead: same coordinate space, nothing under it
                  touched, and the scale is taken about the sticker's own centre
                  (971.73 + 351.677/2, 340.95 + 350.644/2) so it grows in place
                  rather than sliding out from the middle of the page.

                  `pointer-events-none` because it now covers the whole plate,
                  and a transparent sheet over the collage would swallow the
                  hover on the wordmark and the press on the keycap. Nothing in
                  the QR is interactive. */}
              <div className="absolute inset-0 pointer-events-none scale-110" data-hero="qr" data-node-id="343:1257" style={{ transformOrigin: "1147.57px 516.27px" }}>
                <QrArt />
              </div>
            </div>
          </div>
          {/* The scroll cue — the LED disc with the arrow falling through it
              and "scroll down for more" curving underneath. Drawn in
              `hero/ScrollCue`, in its own coordinates, because the phone's
              hero has the same one; this is only where the collage puts it.

              A real box rather than the `display: contents` wrapper it was:
              the cue is placed once and its contents are local to it now. The
              box overlaps the bottom of the wordmark, so it is transparent to
              the pointer and the disc inside takes its own events back. */}
          <div className="absolute h-[223px] left-[548px] pointer-events-none top-[550px] w-[220.512px]" data-node-id="435:2">
            <ScrollCue />
          </div>
          {/* Real box — see the note on `git`. The sticker is drawn as a key
              already: a wide plate at 75% opacity with a smaller, brighter cap
              sitting up and to the left of it, which is the parallax of a cap
              standing above its well. So it presses. HeroMotion drives the cap
              and its two glyphs down that same offset and back — the plate and
              the spark lines are the well, and stay put. */}
          <div className="absolute cursor-pointer h-[105.868px] left-[30.33px] top-[499.01px] w-[102.721px]" data-hero="key" data-node-id="343:1544" data-name="key">
            {/* The artwork layer, scaled about the key's centre. The cap's own
                travel is driven inside this, so it is scaled with everything
                else and the press keeps its proportion to the key. */}
            <div className="absolute inset-0 scale-110">
            <div className="absolute flex h-[100.797px] items-center justify-center left-[1.47px] top-[5.07px] w-[101.247px]" data-node-id="343:1545">
              <div className="flex-none rotate-[-16.21deg]">
                <div className="bg-[#2b24fc] border-[#74d4f0] border-[1.32px] border-solid h-[81.18px] opacity-75 relative rounded-[15.84px] w-[81.84px]" />
              </div>
            </div>
            <div className="absolute flex h-[85.705px] items-center justify-center left-[6.52px] top-[2.48px] w-[85.256px]" data-node-id="343:1546">
              <div className="flex-none rotate-[-16.21deg]">
                <div className="bg-[#2b24fc] border-[#74d4f0] border-[1.32px] border-solid h-[69.3px] opacity-95 relative rounded-[15.84px] w-[68.64px]" />
              </div>
            </div>
            <div className="absolute flex h-[9.713px] items-center justify-center left-[27.44px] top-[86.26px] w-[2.675px]" data-node-id="343:1547">
              <div className="flex-none rotate-[105.4deg]">
                <div className="h-0 relative w-[10.074px]">
                  <div className="absolute inset-[-1.32px_0_0_0]">
                    <img alt="" className="block max-w-none size-full" src="/figma/line20.svg" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex h-[6.765px] items-center justify-center left-[87.61px] top-[68.86px] w-[7.465px]" data-node-id="343:1548">
              <div className="-scale-y-100 flex-none rotate-[42.18deg]">
                <div className="h-0 relative w-[10.074px]">
                  <div className="absolute inset-[-1.32px_0_0_0]">
                    <img alt="" className="block max-w-none size-full" src="/figma/line21.svg" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute contents h-[55.853px] left-[37.39px] top-[10.3px] w-[21.51px]" data-node-id="343:1549">
              <div className="-translate-y-1/2 absolute flex h-[32.403px] items-center justify-center left-[37.39px] top-[26.5px] w-[14.694px]" data-node-id="343:1550">
                <div className="flex-none rotate-[-16.21deg]">
                  <div className="[word-break:break-word] flex flex-col font-rotonto justify-center leading-[0] not-italic relative text-[#74d4f0] text-[26.4px] whitespace-nowrap">
                    <p className="leading-[normal]">:</p>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute flex h-[32.403px] items-center justify-center left-[44.21px] top-[49.95px] w-[14.694px]" data-node-id="343:1551">
                <div className="flex-none rotate-[-16.21deg]">
                  <div className="[word-break:break-word] flex flex-col font-rotonto justify-center leading-[0] not-italic relative text-[#74d4f0] text-[26.4px] whitespace-nowrap">
                    <p className="leading-[normal]">;</p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
        {/* Real box — see the note on `git`. The card no longer loops, but it
            still scales under the cursor, and the red tab and arrow badge have
            to stay attached to it when it does. */}
        <div className="absolute h-[287.765px] left-[128.43px] top-[454.03px] w-[275.16px]" data-hero="note" data-node-id="343:1552">
          {/* The artwork layer, scaled about the note's centre. The hover lift
              stays on the box outside it, so the two scales compose instead of
              overwriting each other. */}
          <div className="absolute inset-0 scale-110">
          <div className="absolute flex h-[75.214px] items-center justify-center left-[35.59px] top-[153.84px] w-[61.123px]" data-node-id="343:1553">
            <div className="flex-none rotate-[-19.9deg]">
              <div className="h-[64.969px] relative w-[41.491px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector30.svg" />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[287.712px] items-center justify-center left-[0.15px] top-0 w-[275.017px]" data-node-id="343:1554">
            <div className="flex-none rotate-[-20.16deg]">
              <div className="h-[229.918px] relative w-[208.546px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector31.svg" />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[94.214px] items-center justify-center left-[68.55px] top-[89.89px] w-[125.248px]" data-node-id="343:1555">
            <div className="flex-none rotate-[13.5deg]">
              <div className="[word-break:break-word] font-rotonto leading-[0] not-italic relative text-[28.8px] text-black whitespace-nowrap">
                <p className="leading-[normal] mb-0">{HERO.note[0]}</p>
                <p className="leading-[normal]">{HERO.note[1]}</p>
              </div>
            </div>
          </div>
          <div className="absolute flex items-center justify-center left-[142.82px] size-[34.438px] top-[146.14px]" data-node-id="343:1556">
            <div className="flex-none rotate-[-4.55deg]">
              <div className="bg-[#ff4337] relative rounded-[27.2px] size-[32px]" />
            </div>
          </div>
          <div className="absolute flex h-[26.333px] items-center justify-center left-[149.9px] top-[148.7px] w-[21.899px]" data-node-id="343:1557">
            <div className="flex-none rotate-[13.5deg]">
              <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative text-[19.2px] text-black whitespace-nowrap">→</p>
            </div>
          </div>
          </div>
        </div>
        {/* The "Idea Found ! / Submit your Magic!" folder stood here (Figma
            343:1558, at 706.85, 144). It has been taken off the collage: it
            named no destination, carried no state and duplicated the call to
            action the "Register Now" note already makes, so it was a third
            sticker competing for the same glance. Its artwork —
            group48095562/48095565.svg and polygon20.svg — is still in
            public/figma, unreferenced. */}
      </div>
      </div>
    </section>
  );
}
