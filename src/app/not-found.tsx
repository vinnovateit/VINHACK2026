import Image from "next/image";
import SiteNav from "@/components/nav/SiteNav";
import KeyButton from "@/components/ui/KeyButton";

export default function NotFound() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-black flex flex-col items-center justify-center px-6 py-10 select-none font-rotonto text-[#2849cb]">
      {/* Right side Play Along nav button */}
      <SiteNav standalone />

      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-center text-center my-auto w-full max-w-4xl">
        {/* 404 Visual Graphic Cluster with stickers */}
        <div className="relative flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6">
          {/* Digit 4 (left) */}
          <Image
            width={170}
            height={217}
            src="/404/digit-4-left.svg"
            alt="4"
            className="w-[86px] sm:w-[125px] md:w-[170px] h-auto pointer-events-none"
            priority
          />

          {/* Digit 0 (middle) */}
          <Image
            width={195}
            height={231}
            src="/404/digit-0.svg"
            alt="0"
            className="w-[98px] sm:w-[143px] md:w-[195px] h-auto pointer-events-none"
            priority
          />

          {/* Digit 4 (right) */}
          <Image
            width={170}
            height={217}
            src="/404/digit-4-right.svg"
            alt="4"
            className="w-[86px] sm:w-[125px] md:w-[170px] h-auto pointer-events-none"
            priority
          />

          {/* Left Sticker: DAMN WHAT HAPPENED ? */}
          <div className="absolute -top-3.5 sm:-top-4 md:-top-5 -left-3 sm:-left-4 md:-left-6 px-3.5 sm:px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-[#d9d9d9] rotate-[13.6deg] shadow-lg pointer-events-none whitespace-nowrap">
            <span className="text-[#2849cb] font-rotonto font-light text-[10px] sm:text-xs md:text-base tracking-wider">
              DAMN WHAT HAPPENED ?
            </span>
          </div>

          {/* Right Sticker: SOME ERROR OR SOMETHING? */}
          <div className="absolute -bottom-3 sm:-bottom-3.5 md:-bottom-4 -right-3 sm:-right-4 md:-right-6 px-3.5 sm:px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-[#d9d9d9] -rotate-[18deg] shadow-lg pointer-events-none whitespace-nowrap">
            <span className="text-[#2849cb] font-rotonto font-light text-[10px] sm:text-xs md:text-base tracking-wider">
              SOME ERROR OR SOMETHING?
            </span>
          </div>
        </div>

        {/* Subtitle Message */}
        <p className="mt-8 md:mt-10 text-center text-[#d9d9d9] font-rotonto font-light text-sm sm:text-base md:text-xl leading-relaxed max-w-[340px] sm:max-w-[460px] md:max-w-[580px]">
          Wrong route. Right energy.
          <br />
          Even the best hackers get lost sometimes.
        </p>

        {/* Go Back Home Action Button */}
        <div className="mt-7 md:mt-8 flex justify-center">
          <KeyButton
            href="/"
            color="blue"
            size="compact"
            className="w-[200px] sm:w-[220px] md:w-[240px]"
            content="GO BACK HOME"
          />
        </div>
      </div>
    </main>
  );
}
