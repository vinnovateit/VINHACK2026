import { HERO } from "@/content/site";

export default function NoteArt() {
  return (
    <>
      <div className="absolute top-[153.84px] left-[35.59px] flex h-[75.214px] w-[61.123px] items-center justify-center" data-node-id="343:1553">
        <div className="flex-none rotate-[-19.9deg]">
          <div className="relative h-[64.969px] w-[41.491px]">
            <img alt="" className="absolute inset-0 block size-full max-w-none" src="/figma/vector30.svg" />
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-[0.15px] flex h-[287.712px] w-[275.017px] items-center justify-center" data-node-id="343:1554">
        <div className="flex-none rotate-[-20.16deg]">
          <div className="relative h-[229.918px] w-[208.546px]">
            <img alt="" className="absolute inset-0 block size-full max-w-none" src="/figma/vector31.svg" />
          </div>
        </div>
      </div>
      <div className="absolute top-[89.89px] left-[68.55px] flex h-[94.214px] w-[125.248px] items-center justify-center" data-node-id="343:1555">
        <div className="flex-none rotate-[13.5deg]">
          <div className="relative font-rotonto text-[28.8px] leading-[0] whitespace-nowrap text-black">
            <p className="mb-0 leading-[normal]">{HERO.note[0]}</p>
            <p className="leading-[normal]">{HERO.note[1]}</p>
          </div>
        </div>
      </div>
      <div className="absolute top-[146.14px] left-[142.82px] flex size-[34.438px] items-center justify-center" data-node-id="343:1556">
        <div className="flex-none rotate-[-4.55deg]">
          <div className="relative size-[32px] rounded-[27.2px] bg-[#ff4337]" />
        </div>
      </div>
      <div className="absolute top-[148.7px] left-[149.9px] flex h-[26.333px] w-[21.899px] items-center justify-center" data-node-id="343:1557">
        <div className="flex-none rotate-[13.5deg]">
          <p className="relative font-rotonto text-[19.2px] whitespace-nowrap text-black">→</p>
        </div>
      </div>
    </>
  );
}
