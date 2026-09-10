import type { FC } from "react";

const SNEAK_PEEK_BLOCK = (
  <>
    <div>SNEAK PEEK</div>
    <div>VINHACK `26</div>
    <div>SNEAK PEEK</div>
    <div>VINHACK `26</div>
    <div>SNEAK PEEK</div>
    <div>VINHACK `26</div>
  </>
);

const MEMORIES: FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 size-full overflow-hidden text-left font-rotonto font-light text-[118px] leading-[132px] text-[#041a21] whitespace-nowrap pointer-events-none select-none z-0 bg-transparent"
    >
      <div className="absolute top-[20px] left-[20px] shrink-0">
        {SNEAK_PEEK_BLOCK}
      </div>
      <div className="absolute top-[20px] left-[780px] shrink-0">
        {SNEAK_PEEK_BLOCK}
      </div>
    </div>
  );
};

export default MEMORIES;
