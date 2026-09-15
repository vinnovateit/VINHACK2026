import { HERO } from "@/content/site";

export default function NoteArt() {
  return (
    <>
      {/* Visual Tab */}
      <div className="absolute top-[153.84px] left-[35.59px] flex h-[75.214px] w-[61.123px] items-center justify-center pointer-events-none" data-node-id="343:1553">
        <div className="flex-none rotate-[-19.9deg] pointer-events-none">
          <div className="relative h-[64.969px] w-[41.491px] pointer-events-none">
            <img alt="" className="absolute inset-0 block size-full max-w-none pointer-events-none" src="/figma/vector30.svg" />
          </div>
        </div>
      </div>

      {/* Visual Card */}
      <div className="absolute top-0 left-[0.15px] flex h-[287.712px] w-[275.017px] items-center justify-center pointer-events-none" data-node-id="343:1554">
        <div className="flex-none rotate-[-20.16deg] pointer-events-none">
          <div className="relative h-[229.918px] w-[208.546px] pointer-events-none">
            <img alt="" className="absolute inset-0 block size-full max-w-none pointer-events-none" src="/figma/vector31.svg" />
          </div>
        </div>
      </div>

      {/* Visual Text */}
      <div className="absolute top-[76px] left-[75px] flex h-[70px] w-[125px] items-center justify-center pointer-events-none" data-node-id="343:1555">
        <div className="flex-none rotate-[13.5deg] pointer-events-none">
          <div className="relative font-rotonto text-[28.8px] leading-[0] whitespace-nowrap text-black pointer-events-none">
            <p className="mb-0 leading-[normal]">{HERO.note[0]}</p>
            {HERO.note[1] ? <p className="leading-[normal]">{HERO.note[1]}</p> : null}
          </div>
        </div>
      </div>

      {/* Visual Button Circle with Arrow */}
      <div className="absolute top-[156px] left-[120px] flex size-[35px] items-center justify-center pointer-events-none" data-node-id="343:1556">
        <div className="flex-none rotate-[13.5deg] pointer-events-none">
          <div className="relative size-[32px] rounded-[27.2px] bg-[#ff4337] flex items-center justify-center pointer-events-none">
            <svg
              className="size-[18px] text-black stroke-[2.5] -translate-x-[0.5px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>

      {/* Precise Vector Hit Area - ONLY the card polygon and red tab */}
      <svg
        preserveAspectRatio="none"
        overflow="visible"
        viewBox="0 0 275.16 287.765"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 block size-full max-w-none pointer-events-none"
      >
        <g
          data-hero="note-hit"
          className="pointer-events-auto cursor-pointer"
          style={{ pointerEvents: "auto" }}
        >
          {/* Card path with exact rotated placement */}
          <g transform="translate(137.66, 143.86) rotate(-20.16) translate(-104.273, -114.959)">
            <path
              d="M71.6991 0L208.546 94.566L112.826 229.918L19.7056 166.068L19.6536 166.032L40.7629 146.902L0 102.146L0.253354 101.785L71.6991 0Z"
              fill="#000"
              opacity="0"
              style={{ pointerEvents: "all" }}
            />
          </g>
          {/* Tab path with exact rotated placement */}
          <g transform="translate(66.15, 191.45) rotate(-19.9) translate(-20.745, -32.485)">
            <path
              d="M41.4908 45.2927L0 0L20.375 64.969L41.4908 45.2927Z"
              fill="#000"
              opacity="0"
              style={{ pointerEvents: "all" }}
            />
          </g>
        </g>
      </svg>
    </>
  );
}
