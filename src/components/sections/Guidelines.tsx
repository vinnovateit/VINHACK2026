import { Fragment } from "react";

import { GUIDELINES } from "@/content/site";

export default function GuidelinesSection() {
  return (
    <section aria-label="Guidelines" className="-translate-x-1/2 absolute bg-black h-[832px] left-1/2 overflow-clip top-[7680px] w-[1280px]" data-node-id="343:751" data-name="GUIDELINES">
      <div className="absolute contents h-[1674.302px] left-[-178px] top-[-421px] w-[1686.703px]" data-node-id="343:752">
        <div className="absolute flex h-[1590.388px] items-center justify-center left-[-134.38px] top-[-379.04px] w-[1599.46px]" data-node-id="343:753">
          <div className="-scale-y-100 flex-none rotate-[-143.32deg]">
            <div className="h-[1117.603px] relative w-[1161.941px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group48095560.svg" />
            </div>
          </div>
        </div>
        <div className="absolute flex h-[96.566px] items-center justify-center left-[540.9px] top-[119.84px] w-[374.375px]" data-node-id="343:756">
          <div className="flex-none rotate-[3.99deg]">
            <h2 className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative text-[#2849cb] text-[58.852px] w-[370.336px]">{GUIDELINES.heading}</h2>
          </div>
        </div>
        <div className="absolute contents h-[518.161px] left-[234.67px] top-[186.67px] w-[910.496px]" data-node-id="343:757">
          <div className="absolute flex h-[411.364px] items-center justify-center left-[calc(50%-397.89px)] top-[186.67px] w-[903.056px]" data-node-id="343:758">
            <div className="flex-none rotate-[3.99deg]">
              {/* One paragraph in the design file, its four blocks separated by
                  a blank line rather than by being separate boxes — so the
                  breaks go between them and not after the last. */}
              <p className="[word-break:break-word] font-rotonto leading-[26.932px] not-italic relative text-[19.95px] text-white w-[880.792px] whitespace-pre-wrap">
                {GUIDELINES.paragraphs.map((para, i) => (
                  <Fragment key={para}>
                    {i > 0 && (
                      <>
                        <br aria-hidden />
                        <br aria-hidden />
                      </>
                    )}
                    {para}
                  </Fragment>
                ))}
              </p>
            </div>
          </div>
          <div className="absolute flex h-[127.32px] items-center justify-center left-[234.67px] top-[562.81px] w-[673.333px]" data-node-id="343:759">
            <div className="flex-none rotate-[3.99deg]">
              <p className="[word-break:break-word] font-rotonto leading-[26.932px] not-italic relative text-[19.95px] text-white w-[669.323px]">{GUIDELINES.tldr}</p>
            </div>
          </div>
        </div>
        <div className="absolute h-[138.948px] left-[1068.59px] top-[85.92px] w-[76.978px]" data-node-id="343:760" data-name="PIN">
          <div className="absolute inset-[-2.27%_-4.08%_-0.79%_3.34%]">
            <img alt="" className="block max-w-none size-full" src="/figma/pin1.svg" />
          </div>
        </div>
      </div>
      <div className="absolute contents h-[273.695px] left-[16px] top-[584px] w-[286.925px]" data-node-id="343:761" data-name="sticker">
        <div className="absolute flex h-[273.695px] items-center justify-center left-[16px] top-[584px] w-[286.925px]" data-node-id="343:762">
          <div className="flex-none rotate-[-28.31deg]">
            <div className="h-[190.642px] relative w-[223.214px]">
              <div className="absolute inset-[-2.24%_-1.65%_-1.92%_-2.07%]">
                <img alt="" className="block max-w-none size-full" src="/figma/vector49.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex h-[79.064px] items-center justify-center left-[87.85px] top-[682.14px] w-[155.588px]" data-node-id="343:763">
          <div className="flex-none rotate-[-13.31deg]">
            <div className="[word-break:break-word] font-rotonto leading-[0] not-italic relative text-[#74d4f0] text-[21.076px] whitespace-nowrap">
              <p className="leading-[22.992px] mb-0 whitespace-pre">{GUIDELINES.sticker[0]}</p>
              <p className="leading-[22.992px] whitespace-pre">{GUIDELINES.sticker[1]}</p>
            </div>
          </div>
        </div>
        <div className="absolute flex h-[21.996px] items-center justify-center left-[142.07px] top-[670.63px] w-[20.829px]" data-node-id="343:764">
          <div className="flex-none rotate-[-28.31deg]">
            <div className="h-[17.244px] relative w-[14.37px]">
              <div className="absolute inset-[-13.89%_-16.67%]">
                <img alt="" className="block max-w-none size-full" src="/figma/vector51.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex h-[25.835px] items-center justify-center left-[161.33px] top-[751.75px] w-[19.892px]" data-node-id="343:765">
          <div className="flex-none rotate-[-13.31deg]">
            <p className="[word-break:break-word] font-rotonto leading-[22.992px] not-italic relative text-[21.076px] text-white tracking-[4.2152px] whitespace-nowrap">!!</p>
          </div>
        </div>
      </div>
    </section>
  );
}
