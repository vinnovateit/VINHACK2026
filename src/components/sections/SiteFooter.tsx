import type { CSSProperties } from "react";
import { FOOTER } from "@/content/site";

export default function SiteFooter() {
  return (
    <>
      {/* Desktop Layout (1280px DesignCanvas layout) */}
      <footer
        className="hidden md:block -translate-x-1/2 absolute bg-black h-[740px] left-1/2 overflow-clip top-[9924px] w-[1280px]"
        data-node-id="297:3"
        data-name="FOOTER"
      >
        <div className="absolute contents left-0 top-[111px]" data-node-id="297:4">
          <div className="absolute flex h-[363px] items-center justify-center left-0 top-[111px] w-[1280px]" data-tab-part="email" data-node-id="297:5">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="h-[363px] relative w-[1280px]" data-name="Union">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union.svg" />
              </div>
            </div>
          </div>
          <div className="absolute h-[362px] left-0 top-[147px] w-[1280px]" data-tab-part="github" data-node-id="297:8" data-name="Union">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union1.svg" />
          </div>
          <div className="absolute h-[362px] left-0 top-[183px] w-[1280px]" data-tab-part="instagram" data-node-id="297:11" data-name="Union">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union2.svg" />
          </div>
          <div className="absolute flex h-[363px] items-center justify-center left-0 top-[220px] w-[1280px]" data-tab-part="linkedin" data-node-id="297:14">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="h-[363px] relative w-[1280px]" data-name="Union">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union3.svg" />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[362px] items-center justify-center left-0 top-[260px] w-[1280px]" data-tab-part="medium" data-node-id="297:17">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="h-[362px] relative w-[1280px]" data-name="Union">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union4.svg" />
              </div>
            </div>
          </div>
          <div className="absolute h-[450px] left-0 top-[290px] w-[1280px]" data-node-id="297:20" data-name="Union">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union5.svg" />
          </div>
          {/* Interactive folder tab links with hover top-right arrow and underline */}
          {FOOTER.tabs.map((tab) => {
            const cfg = {
              EMAIL: { id: "297:25", left: 826, top: 111, w: 292, h: 72, pt: 24, slug: "email" },
              GITHUB: { id: "297:27", left: 105.5, top: 147, w: 292, h: 72, pt: 24, slug: "github" },
              INSTAGRAM: { id: "297:23", left: 511, top: 183, w: 292, h: 72, pt: 24, slug: "instagram" },
              LINKEDIN: { id: "297:24", left: 945.5, top: 220, w: 292, h: 72, pt: 24, slug: "linkedin" },
              MEDIUM: { id: "297:26", left: 211.5, top: 260, w: 292, h: 64, pt: 22, slug: "medium" },
            }[tab.name];

            if (!cfg) return null;
            const isExternal = tab.href.startsWith("http");

            return (
              <a
                key={tab.name}
                href={tab.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group pointer-events-auto absolute flex justify-center items-start no-underline cursor-pointer"
                style={{
                  left: cfg.left,
                  top: cfg.top,
                  width: cfg.w,
                  height: cfg.h,
                  paddingTop: cfg.pt,
                  color: tab.color,
                }}
                data-tab={cfg.slug}
                data-tab-part={cfg.slug}
                data-node-id={cfg.id}
              >
                <span className="relative inline-flex items-center font-rotonto text-[28px] leading-none whitespace-nowrap">
                  <span>{tab.name}</span>
                  <svg
                    aria-hidden="true"
                    className="absolute left-full ml-2 -top-1 size-5 shrink-0 opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                  <span
                    aria-hidden="true"
                    className="absolute left-0 -bottom-1 h-[2px] w-0 bg-current transition-all duration-200 group-hover:w-full"
                  />
                </span>
              </a>
            );
          })}
        </div>
        <div className="absolute content-stretch flex items-center justify-center left-[-382px] p-[10px] top-[355px]" data-marquee="footer" data-node-id="297:28">
          <p className="[word-break:break-word] scripts leading-[normal] not-italic relative shrink-0 text-[99.84px] text-black w-max whitespace-nowrap" dir="auto" data-node-id="297:29">{FOOTER.marquee}</p>
          <p className="[word-break:break-word] scripts leading-[normal] not-italic relative shrink-0 text-[99.84px] text-black w-max whitespace-nowrap" dir="auto" aria-hidden>{FOOTER.marquee}</p>
        </div>
        <div className="-translate-x-1/2 absolute content-stretch flex gap-[10.4px] items-center left-[calc(50%-380px)] top-[640px]" data-node-id="297:30">
          <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[28.8px] text-black text-center whitespace-nowrap" data-node-id="297:31">{FOOTER.madeWith[0]}</p>
          <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[28.8px] text-black text-center whitespace-nowrap" data-node-id="297:32">
            {FOOTER.madeWith[1]}
          </p>
          <div className="h-[34.196px] relative shrink-0 w-[38.4px]" data-node-id="297:33" data-name="Vector">
            <img alt="love" className="absolute block inset-0 max-w-none size-full" src="/figma/vector.svg" />
          </div>
          <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[28.8px] text-black text-center whitespace-nowrap" data-node-id="297:34">
            {FOOTER.madeWith[2]}
          </p>
          <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[28.8px] text-black text-center whitespace-nowrap" data-node-id="297:35">
            {FOOTER.madeWith[3]}
          </p>
        </div>
        <div className="absolute content-stretch flex gap-[6.912px] items-center left-[55px] top-[690px]" data-node-id="297:36">
          <div className="relative shrink-0 size-[14.4px]" data-node-id="297:37" data-name="Vector">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector1.svg" />
          </div>
          <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[17.28px] text-black whitespace-nowrap" data-node-id="297:38">
            {FOOTER.copyright}
          </p>
        </div>
        {/* The society's mark, filed bottom-right on the red panel. */}
        <div className="absolute h-[53.568px] left-[1058px] top-[670px] w-[163.19px]" data-node-id="297:39" data-name="VIIT 3">
          <img alt="VinnovateIT" className="absolute block inset-0 max-w-none size-full" src="/figma/vinnovate-black.svg" />
        </div>
      </footer>

      {/* Mobile Layout (Responsive single-column layout) */}
      <footer className="md:hidden pt-0 overflow-x-clip bg-black text-[#fcfcfc] w-full">
        {/* Five folder tabs */}
        <div>
          {FOOTER.tabs.map((tab) => {
            const isExternal = tab.href.startsWith("http");
            return (
              <a
                key={tab.name}
                href={tab.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group relative -mb-[20px] sm:-mb-[24px] flex items-center justify-between rounded-t-[20px] px-6 pt-5 pb-11 sm:pt-6 sm:pb-13 text-[22px] sm:text-[24px] no-underline cursor-pointer transition-transform duration-200 active:scale-[0.99]"
                style={{ background: tab.band, color: tab.color }}
              >
                <span className="relative font-rotonto inline-flex items-center">
                  <span>{tab.name}</span>
                  <span
                    aria-hidden="true"
                    className="absolute left-0 -bottom-1 h-[2px] w-0 bg-current transition-all duration-200 group-hover:w-full group-focus-visible:w-full"
                  />
                </span>
                <svg
                  aria-hidden="true"
                  className="size-6 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            );
          })}
        </div>

        {/* Red Base Panel */}
        <div className="relative -mt-[20px] sm:-mt-[24px] rounded-t-[20px] pt-6 pb-8 w-full" style={{ background: FOOTER.base }}>
          <div className="overflow-clip">
            <div
              className="marquee"
              style={{ "--marquee-duration": "30s" } as CSSProperties}
            >
              <p dir="auto" className="scripts shrink-0 text-[36px] sm:text-[44px] whitespace-nowrap text-black">
                {FOOTER.marquee}
              </p>
              <p aria-hidden dir="auto" className="scripts shrink-0 text-[36px] sm:text-[44px] whitespace-nowrap text-black">
                {FOOTER.marquee}
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-[560px] w-full px-5 flex flex-col items-center justify-center text-center">
            {/* Line 1: Made with love by [VinnovateIT Logo] */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-[18px] sm:text-[22px] text-black font-rotonto leading-none">
              <span className="inline-flex items-center">{FOOTER.madeWith[0]}</span>
              <span className="inline-flex items-center">{FOOTER.madeWith[1]}</span>
              <img
                alt="love"
                className="block h-[22px] w-[25px] sm:h-[26px] sm:w-[29px] shrink-0 self-center"
                src="/figma/vector.svg"
              />
              <span className="inline-flex items-center">{FOOTER.madeWith[2]}</span>
              <img
                alt="VinnovateIT"
                className="block h-[38px] sm:h-[44px] w-auto max-w-[160px] sm:max-w-[190px] object-contain shrink-0 self-center translate-y-[6px] sm:translate-y-[8px]"
                src="/figma/vinnovate-black.svg"
              />
            </div>

            {/* Line 2: Copyright */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 text-[12px] sm:text-[13px] text-black font-rotonto leading-normal">
              <img
                alt=""
                aria-hidden="true"
                className="inline-block size-[12px] sm:size-[14px] shrink-0"
                src="/figma/vector1.svg"
              />
              <p className="text-center">{FOOTER.copyright}</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
