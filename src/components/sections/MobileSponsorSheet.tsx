import Image from "next/image";
import { TITLE_SPONSOR, SUPPORTERS } from "./sponsors/copy";

export default function MobileSponsorSheet() {
  return (
    <section aria-label="Sponsors" className="w-full bg-black py-10 px-4 flex flex-col items-center">
      <div className="relative w-full max-w-[420px]">
        {/* Stacked paper shadows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[4px]"
          style={{ transform: "translate(5px, -10px) rotate(2.5deg)", backgroundColor: "#d0d0cb", boxShadow: "0 8px 22px rgba(0,0,0,0.18)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[4px]"
          style={{ transform: "translate(5px, 12px) rotate(-2.5deg)", backgroundColor: "#dedede", boxShadow: "0 10px 26px rgba(0,0,0,0.22)" }}
        />

        <div className="relative z-10 bg-[#ebebe9] font-rotonto text-black shadow-[0_16px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.2)] overflow-hidden select-none">
          {/* Masthead — logo with PARTNERS at bottom right */}
          <div className="px-4 pt-4 pb-0">
            <div className="border-t-[2px] border-black mb-1" />
            <div className="py-2.5 sm:py-3 flex items-center justify-center">
              <div className="relative inline-flex items-end">
                <img
                  src="/figma/vinhack-fill.svg"
                  alt="VinHack"
                  className="h-[50px] sm:h-[58px] w-auto object-contain block"
                />
                <span className="absolute -bottom-1 right-0 text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.22em] uppercase text-black leading-none select-none">
                  PARTNERS
                </span>
              </div>
            </div>
            <div className="border-t-[2px] border-black mt-2" />
          </div>

          {/* Title Partner */}
          <a
            href={TITLE_SPONSOR.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center py-6 px-4 border-b border-black transition-opacity duration-200 hover:opacity-80"
          >
            <p className="text-[#fa1a1d] text-[9px] font-bold tracking-[0.18em] uppercase mb-3">
              {TITLE_SPONSOR.header}
            </p>
            <Image
              src="/sponsors/fateh.webp"
              alt="Fateh Education"
              width={280}
              height={90}
              className="h-[70px] sm:h-[80px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
            {TITLE_SPONSOR.tagline && (
              <p className="mt-3 text-[10px] font-medium text-[#333] tracking-[0.03em] text-center">
                {TITLE_SPONSOR.tagline}
              </p>
            )}
          </a>

          {/* 2×2 Partner grid */}
          <div className="grid grid-cols-2">
            {SUPPORTERS.slice(0, 4).map((partner, i) => (
              <a
                key={i}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center justify-between py-5 px-3 text-center transition-opacity duration-200 hover:opacity-80 ${i % 2 === 0 ? "border-r border-black" : ""} ${i < 2 ? "border-b border-black" : ""}`}
              >
                <p className="text-[#fa1a1d] text-[7.5px] font-bold tracking-[0.06em] uppercase leading-[1.3] min-h-[24px] flex items-center justify-center text-center">
                  {partner.header}
                </p>

                <div className="flex items-center justify-center py-3 transition-transform duration-200 group-hover:scale-[1.04]">
                  {partner.name.toLowerCase().includes("abhi") ? (
                    <Image src="/sponsors/abhibus.webp" alt="AbhiBus" width={120} height={38} className="h-[34px] w-auto object-contain" />
                  ) : partner.name.toLowerCase().includes("aha") ? (
                    <div className="flex flex-col items-center gap-1">
                      <Image src="/sponsors/aha.webp" alt="Aha Therapy" width={90} height={46} className="h-[38px] w-auto object-contain" />
                      <span className="font-rotonto text-[8px] font-bold tracking-[0.16em] text-[#2d6a4f] uppercase">Therapy</span>
                    </div>
                  ) : partner.name.toLowerCase().includes("saavn") ? (
                    <Image src="/sponsors/jiosaavn.webp" alt="JioSaavn" width={110} height={36} className="h-[32px] w-auto object-contain" />
                  ) : (
                    <Image src="/sponsors/ola_cv.webp" alt="ola.cv" width={90} height={44} className="h-[38px] w-auto object-contain" />
                  )}
                </div>

                <p className="text-[8.5px] font-medium text-[#333] leading-[1.35] max-w-[140px]">
                  {partner.tagline}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
