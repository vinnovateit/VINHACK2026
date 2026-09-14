export default function SponsorSideProps() {
  return (
    <>
      {/* 1. Blue Sticky Note with Cyan Burst Marks (Top-Left, in black free space) */}
      <div
        data-prop-left
        data-rotate="-7.5"
        className="pointer-events-none absolute -left-[175px] top-[140px] z-20 flex flex-col items-center select-none will-change-transform"
        style={{
          transform: "rotate(-7.5deg)",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {/* Cyan 3-ray burst */}
        <svg
          width="36"
          height="20"
          viewBox="0 0 36 20"
          fill="none"
          className="mb-[-2px] overflow-visible"
        >
          <line
            x1="6"
            y1="18"
            x2="1"
            y2="3"
            stroke="#00e5ff"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <line
            x1="18"
            y1="18"
            x2="18"
            y2="1"
            stroke="#00e5ff"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <line
            x1="30"
            y1="18"
            x2="35"
            y2="3"
            stroke="#00e5ff"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>

        {/* Post-it Note Body */}
        <div
          className="relative flex h-[138px] w-[124px] flex-col items-center justify-center rounded-[3px] p-3 text-center"
          style={{
            backgroundColor: "#42a5f5",
            boxShadow:
              "0 10px 24px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.3)",
            backgroundImage:
              "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.06) 100%)",
          }}
        >
          {/* Top Tape Tab */}
          <div
            className="absolute -top-[7px] left-1/2 h-[15px] w-[44px] -translate-x-1/2 rounded-[1px] bg-white/35 backdrop-blur-[1px]"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
          />

          <div className="font-rotonto text-[15px] font-bold tracking-[0.06em] leading-[1.22] text-[#061e38]">
            IDEAS
            <br />
            NEED
            <br />
            PEOPLE.
            <br />
            <span className="text-[16px] font-normal tracking-normal">:)</span>
          </div>
        </div>
      </div>

      {/* 2. Adhesive Tape Label: BUILD TOGETHER. BRIGHTER. (Mid-Left, in black free space) */}
      <div
        data-prop-left
        data-rotate="4.5"
        className="pointer-events-none absolute -left-[168px] top-[340px] z-20 flex w-[142px] flex-col items-center rounded-[2px] bg-[#facc15] px-2.5 py-2 select-none shadow-[0_12px_26px_rgba(0,0,0,0.6)] will-change-transform"
        style={{
          transform: "rotate(4.5deg)",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {/* Top Mini Tape */}
        <div
          className="absolute -top-[6px] left-1/2 h-[13px] w-[36px] -translate-x-1/2 rounded-[1px] bg-white/40 backdrop-blur-[1px]"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
        />
        <div className="font-rotonto text-[12.5px] font-bold tracking-[0.05em] text-black leading-[1.2] text-center">
          BUILD TOGETHER.
          <br />
          <span className="text-[#b45309]">BRIGHTER.</span>
        </div>
      </div>

      {/* 3. Circular Pin Badge: SOLVE WHAT MATTERS (Lower-Left, 3rd Position) */}
      <div
        data-prop-left
        data-rotate="-8"
        className="pointer-events-none absolute -left-[160px] top-[460px] z-20 flex flex-col items-center select-none will-change-transform"
        style={{
          transform: "rotate(-8deg)",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {/* Top Metallic Safety Pin */}
        <div className="relative mb-[-8px] z-10">
          <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
            <path
              d="M3 11C3 7 7 3 16 3C25 3 29 7 29 11"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="16" cy="3" r="3" fill="#64748b" />
          </svg>
        </div>

        {/* Badge Body */}
        <div
          className="relative flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full p-2 text-center overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, #4f46e5 0%, #312e81 70%, #1e1b4b 100%)",
            boxShadow:
              "0 12px 28px rgba(0, 0, 0, 0.65), 0 2px 6px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.6)",
            border: "2px solid rgba(255, 255, 255, 0.18)",
          }}
        >
          {/* Gloss overlay reflection */}
          <div
            className="pointer-events-none absolute -top-[10px] -left-[10px] h-[58px] w-[90px] rounded-full bg-gradient-to-b from-white/25 to-transparent opacity-80"
            style={{ transform: "rotate(-25deg)" }}
          />

          {/* Badge Inner Dashed Accent Ring */}
          <div className="pointer-events-none absolute inset-[5px] rounded-full border border-dashed border-white/25" />

          {/* Badge Content */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[8.5px] font-mono font-semibold tracking-[0.14em] text-[#38bdf8] uppercase">
              VINHACK &apos;26
            </span>
            <div className="my-0.5 font-rotonto text-[13px] font-bold tracking-[0.04em] leading-[1.1] text-white">
              SOLVE
              <br />
              WHAT
              <br />
              <span className="text-[#a5b4fc]">MATTERS</span>
            </div>
            <span className="text-[8px] font-mono text-white/70 tracking-widest">
              ✦ 30H ✦
            </span>
          </div>
        </div>
      </div>

      {/* 4. 3D Isometric Striped Cube (Bottom-Left, in black free space) */}
      <div
        data-prop-left
        data-rotate="-2"
        className="pointer-events-none absolute -left-[165px] bottom-[25px] z-20 select-none will-change-transform"
        style={{
          filter: "drop-shadow(0 14px 24px rgba(0, 0, 0, 0.6))",
          transform: "rotate(-2deg)",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        <svg width="112" height="98" viewBox="0 0 112 98" fill="none">
          {/* Top Face */}
          <g>
            <polygon points="4,38 56,8 108,38 56,68" fill="#5c6bc0" />
            <polygon
              points="17,30.5 56,8 95,30.5 56,53"
              fill="#ec407a"
              opacity="0.92"
            />
            <polygon
              points="30,23 56,8 82,23 56,38"
              fill="#3b82f6"
              opacity="0.92"
            />
            <polygon
              points="43,15.5 56,8 69,15.5 56,23"
              fill="#8b5cf6"
              opacity="0.95"
            />
          </g>

          {/* Left Face */}
          <g>
            <polygon points="4,38 56,68 56,96 4,66" fill="#e11d48" />
            <polygon points="4,38 17,45.5 17,73.5 4,66" fill="#ec4899" />
            <polygon points="17,45.5 30,53 30,81 17,73.5" fill="#e11d48" />
            <polygon points="30,53 43,60.5 43,88.5 30,81" fill="#be185d" />
            <polygon points="43,60.5 56,68 56,96 43,88.5" fill="#701a75" />
          </g>

          {/* Right Face */}
          <g>
            <polygon points="56,68 108,38 108,66 56,96" fill="#2563eb" />
            <polygon points="56,68 69,60.5 69,88.5 56,96" fill="#38bdf8" />
            <polygon points="69,60.5 82,53 82,81 69,88.5" fill="#60a5fa" />
            <polygon points="82,53 95,45.5 95,73.5 82,81" fill="#2563eb" />
            <polygon points="95,45.5 108,38 108,66 95,73.5" fill="#1d4ed8" />
          </g>
        </svg>
      </div>

      {/* 4. Courier Stamp Note: THANK YOU FOR BELIEVING IN VINHACK. (Top-Right, in black free space) */}
      <div
        data-prop-right
        data-rotate="-6"
        className="pointer-events-none absolute -right-[175px] top-[115px] z-20 flex w-[150px] flex-col rounded-[3px] bg-[#f8f7f2] p-2.5 shadow-[0_12px_26px_rgba(0,0,0,0.6)] border border-black/15 select-none will-change-transform"
        style={{
          transform: "rotate(-6deg)",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {/* Top Tape Tab */}
        <div
          className="absolute -top-[6px] left-1/2 h-[12px] w-[38px] -translate-x-1/2 rounded-[1px] bg-white/40"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
        />
        <div className="text-center font-mono text-[10px] font-semibold tracking-[0.04em] text-[#18181b] leading-[1.35] uppercase">
          THANK YOU FOR
          <br />
          BELIEVING IN
          <br />
          <span className="font-bold text-[#fa1a1d]">VINHACK.</span>
        </div>
      </div>

      {/* 5. Barcode Ticket with Globe (Middle-Right, in black free space) */}
      <div
        data-prop-right
        data-rotate="13"
        className="pointer-events-none absolute -right-[168px] top-[235px] z-20 flex w-[110px] flex-col rounded-[5px] bg-[#f8f7f2] p-2.5 shadow-[0_14px_30px_rgba(0,0,0,0.6)] border border-black/15 select-none will-change-transform"
        style={{
          transform: "rotate(13deg)",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {/* Barcode bars */}
        <div className="flex h-[44px] w-full items-stretch justify-between overflow-hidden bg-black/5 p-1 rounded-[2px]">
          {[
            2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3,
          ].map((w, i) => (
            <div
              key={i}
              className="h-full bg-black shrink-0"
              style={{ width: `${w * 1.5}px` }}
            />
          ))}
        </div>

        {/* Text & Globe icon */}
        <div className="mt-2 flex items-center justify-between font-rotonto">
          <div className="flex flex-col text-[12px] font-bold tracking-tight text-black leading-[1.05]">
            <span>VINHACK</span>
            <span>2026</span>
          </div>

          {/* Wireframe Globe Icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-black"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
      </div>

      {/* 6. Slanted Red Text: SAME PEOPLE. BIGGER IDEAS. (Lower-Right, in black free space) */}
      <div
        data-prop-right
        data-rotate="-14"
        className="pointer-events-none absolute -right-[175px] top-[430px] z-20 select-none font-rotonto font-normal text-[#fa1a1d] text-[22px] leading-[0.98] tracking-tight text-left will-change-transform"
        style={{
          transform: "rotate(-14deg)",
          textShadow: "0.5px 0 0 #fa1a1d, 0 0.5px 0 #fa1a1d",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        SAME
        <br />
        PEOPLE.
        <br />
        BIGGER
        <br />
        IDEAS.
      </div>

      {/* 7. Neon Green Smiley Face Sticker (Bottom-Right, in black free space) */}
      <div
        data-prop-right
        data-rotate="6"
        className="pointer-events-none absolute -right-[125px] bottom-[25px] z-20 select-none will-change-transform"
        style={{
          filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.6))",
          transform: "rotate(6deg)",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
          {/* Green circle base */}
          <circle
            cx="34"
            cy="34"
            r="31"
            fill="#22c55e"
            stroke="#000000"
            strokeWidth="4.5"
          />

          {/* Left Eye */}
          <ellipse cx="25.5" cy="28.5" rx="3.5" ry="5.5" fill="#000000" />

          {/* Right Eye */}
          <ellipse cx="42.5" cy="28.5" rx="3.5" ry="5.5" fill="#000000" />

          {/* Smile */}
          <path
            d="M21.5 39.5C23.5 47 31 50 34 50C37 50 44.5 47 46.5 39.5"
            stroke="#000000"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}

