import { HERO } from "@/content/site";

export default function GitArt() {
  return (
    <>
      <div className="absolute top-0 left-0 flex h-[207.988px] w-[411.659px] items-center justify-center" data-node-id="343:1254">
        <div className="flex-none rotate-[-7.85deg]">
          <div className="relative h-[155.601px] w-[394.094px]" data-name="image 205">
            <img alt="" className="absolute inset-0 size-full max-w-none object-cover pointer-events-none" src="/figma/image205.png" />
          </div>
        </div>
      </div>
      <div className="absolute top-[21.19px] left-[25.46px] flex h-[162.336px] w-[359.724px] items-center justify-center" data-node-id="343:1255">
        <div className="flex-none rotate-[-7.85deg]">
          <div className="relative h-[115.993px] w-[347.131px]">
            <img alt="" className="absolute block inset-0 size-full max-w-none" src="/figma/ellipse50.svg" />
          </div>
        </div>
      </div>
      <div className="absolute top-[68.06px] left-[60.48px] flex h-[67.097px] w-[290.935px] items-center justify-center" data-node-id="343:1256">
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
    </>
  );
}
