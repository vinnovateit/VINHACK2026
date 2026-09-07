import { Fragment } from "react";

import { RULES } from "@/content/site";

export default function RulesSection() {
  return (
    <section aria-label="Rules" className="-translate-x-1/2 absolute bg-black h-[832px] left-1/2 overflow-clip top-[5512px] w-[1280px]" data-node-id="343:709" data-name="RULES">
      <div className="-translate-x-1/2 absolute contents left-[calc(50%-0.09px)] top-[61.87px]" data-node-id="343:710">
        <div className="absolute flex h-[735.314px] items-center justify-center left-[52px] top-[61.87px] w-[1139.407px]" data-node-id="343:711">
          <div className="-rotate-5 flex-none">
            <div className="bg-[#bfea88] h-[642.978px] opacity-80 relative w-[1087.506px]" />
          </div>
        </div>
        <div
          className="absolute h-[642.978px] left-[80.77px] top-[108.51px] w-[1087.506px] bg-[#bfea88]"
          data-node-id="343:712"
          style={{
            boxShadow:
              "0 15px 4px rgba(0,0,0,0.25), 0 -15px 4px rgba(0,0,0,0.25), -15px 4px 4px rgba(0,0,0,0.25), 15px 4px 4px rgba(0,0,0,0.25)",
          }}
        />
        <div className="absolute h-[587.412px] left-[108.56px] top-[138.28px] w-[1031.94px]" data-node-id="343:713">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/rectangle169.svg" />
        </div>
        <h2 className="[word-break:break-word] absolute font-rotonto leading-[normal] left-[503.47px] not-italic text-[#1c563c] text-[58.543px] top-[153.16px] w-[724.342px]" data-node-id="343:714">
          {RULES.heading}
        </h2>
        <div className="[word-break:break-word] absolute font-rotonto h-[545.737px] leading-[0] left-[134.36px] not-italic text-[#1c563c] text-[19.845px] top-[226.58px] w-[953.552px]" data-node-id="343:715">
          {/* Figma emits each bullet as its own single-item list with a
              zero-width-space paragraph between, which is what opens the gap
              between them — the rules are one list, so the spacer is only ever
              *between* two of them and the last bullet carries neither it nor
              the bottom margin. */}
          {RULES.items.map((item, i) => (
            <Fragment key={item}>
              <ul className={i === RULES.items.length - 1 ? undefined : "mb-0"}>
                <li className="list-disc ms-[29.7675px] whitespace-pre-wrap">
                  <span className="leading-[20.837px]">{item}</span>
                </li>
              </ul>
              {i < RULES.items.length - 1 && (
                <p className="leading-[20.837px] mb-0 whitespace-pre-wrap">
                  {"​"}
                </p>
              )}
            </Fragment>
          ))}
        </div>
        <div className="absolute h-[75.412px] left-[576.9px] top-[86.68px] w-[58.543px]" data-node-id="343:716" data-name="PIN">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/pin.svg" />
        </div>
        <div className="absolute contents left-[896.4px] top-[574.86px]" data-node-id="343:719" data-name="STICKER">
          <div className="absolute flex h-[195.34px] items-center justify-center left-[896.4px] top-[574.86px] w-[226.452px]" data-node-id="343:720">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="h-[195.34px] relative w-[226.452px]">
                {/* The badge ships as two files rather than the one Figma
                    exported. The asterisk beside the globe pulses on its own
                    clock, and a group inside a flat `<img>` cannot be reached
                    to animate — so it is lifted out into its own file and laid
                    back over the globe at the same size, which puts it exactly
                    where the single file had it. `transform-origin` is the
                    asterisk's own centre in the shared 226.452 x 195.34
                    viewBox, so it swells about its middle instead of about the
                    badge's. */}
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group48095564-globe.svg" />
                <img
                  alt=""
                  aria-hidden
                  className="asterisk absolute block inset-0 max-w-none size-full"
                  src="/figma/group48095566-asterisk.svg"
                />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[67.648px] items-center justify-center left-[919.18px] top-[643.33px] w-[182.2px]" data-node-id="343:734">
            <div className="flex-none rotate-15">
              <p className="[word-break:break-word] font-rotonto leading-[20.837px] not-italic relative text-[21.829px] text-white whitespace-nowrap">{RULES.sticker}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
