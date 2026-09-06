"use client";

import { useState } from "react";

import { printRun } from "@/components/motion/machine";
import { TIMELINE } from "@/content/site";

/**
 * The timeline receipt, reflowed.
 *
 * The collage prints this out of a slot with GSAP, feeding the paper a line at
 * a time; that motion is driven by `PageMotion`, which does not run below `md`.
 * What has to survive the reflow is the part that carries meaning — the day
 * switch, and the fact that this is a printed bill rather than a table — so the
 * printer body and the torn edge are kept, the schedule is laid out as rows
 * instead of at fixed offsets, and the paper feeds out on a CSS animation that
 * re-runs whenever the day changes. `key` on the paper is what re-runs it: a
 * new key is a new element, so the animation starts again from nothing.
 *
 * It is also audible, but only from the day switch. The sound is scheduled to
 * match `.receipt-feed` exactly — thirteen line feeds over 0.9s and then the
 * tear — and it is fired from the press rather than from the animation because
 * a browser will not start audio until the visitor has touched the page: the
 * first print, on arrival, has nobody's permission to make a noise yet.
 */

/** Matches `.receipt-feed` in globals.css: `0.9s steps(13)`. */
const FEED = { steps: 13, duration: 0.9 };

export default function MobileTimeline() {
  const [dayIndex, setDayIndex] = useState(0);
  const day = TIMELINE.days[dayIndex];

  const pick = (index: number) => {
    if (index === dayIndex) return;
    setDayIndex(index);
    printRun(FEED);
  };

  return (
    <div>
      {/* The day switch. Two real buttons — on the collage this is a pill
          sliding under whichever half was tapped, and the pill is kept, but a
          thing you press to change what is shown should be a button. */}
      <div
        className="relative mx-auto flex w-full max-w-[300px] rounded-[13.5px] border-[1.8px] border-[#2849cb] bg-[#74d4f0] p-[2px]"
        role="group"
        aria-label="Schedule day"
      >
        {/* The filled pill, sliding to the selected half. */}
        <div
          aria-hidden
          className="absolute inset-y-[2px] left-[2px] w-[calc(50%-2px)] rounded-[11.7px] border-[1.8px] border-[#74d4f0] bg-[#2849cb] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(${dayIndex * 100}%)` }}
        />
        {TIMELINE.days.map((option, i) => (
          <button
            key={option.name}
            type="button"
            onClick={() => pick(i)}
            aria-pressed={i === dayIndex}
            className={`relative z-1 flex-1 cursor-pointer py-[11px] text-center text-[17px] transition-colors duration-300 ${
              i === dayIndex ? "text-[#74d4f0]" : "text-[#2849cb]"
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>

      {/* The printer: the red body with its black slot, exactly as the collage
          draws it, with the paper hanging out below. */}
      <div className="mt-9">
        <div className="relative mx-auto h-[62px] w-full max-w-[340px] rounded-[19.747px] bg-[#fa1a1d]">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[12px] w-[86%] bg-black" />
        </div>

        <div
          key={day.name}
          className="receipt-feed -mt-[6px] relative mx-auto w-full max-w-[300px] bg-[#f1f0f0] px-[22px] pt-[26px] pb-[30px] text-black"
        >
          <img
            alt=""
            className="mx-auto block w-[170px] max-w-none"
            src="/figma/logo.svg"
          />

          <p className="mt-[18px] text-center text-[26px] leading-none">
            {day.name}
          </p>
          <p className="mt-[8px] text-center text-[14px]">{TIMELINE.masthead}</p>

          <div className="mt-[18px] border-t-2 border-dashed border-black/60" />

          <div className="flex justify-between py-[10px] text-[15px]">
            <span>{TIMELINE.dateLabel}</span>
            <span>{day.date}</span>
          </div>

          <div className="border-t-2 border-dashed border-black/60" />

          <ul className="mt-[6px]">
            {day.entries.map((entry) =>
              entry.kind === "row" ? (
                <li
                  key={entry.label}
                  className="flex items-baseline justify-between gap-3 py-[7px] text-[15px]"
                >
                  <span>{entry.label}</span>
                  <span className="whitespace-nowrap">{entry.time}</span>
                </li>
              ) : (
                // A checkpoint spans the paper rather than sitting in the two
                // columns, bracketed by rules — which is how the design marks
                // it out from the rows either side.
                <li key={entry.label} className="my-[6px]">
                  <div className="border-t-2 border-dashed border-black/60" />
                  <p className="py-[9px] text-center text-[15px]">
                    {entry.label}
                  </p>
                  <div className="border-t-2 border-dashed border-black/60" />
                </li>
              ),
            )}
          </ul>

          <div className="mt-[10px] border-t-2 border-dashed border-black/60" />

          <div className="flex justify-between gap-2 pt-[8px] text-[9px]">
            <span>{TIMELINE.site}</span>
            <span>{TIMELINE.email}</span>
          </div>

          {/* The torn edge, which is the paper's own artwork. */}
          <img
            alt=""
            aria-hidden
            className="absolute inset-x-0 bottom-0 block h-[14px] w-full max-w-none rotate-180"
            src="/figma/group48095503.svg"
          />
        </div>
      </div>
    </div>
  );
}
