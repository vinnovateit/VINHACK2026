import type { Metadata } from "next";
import {
  Noto_Nastaliq_Urdu,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from "next/font/google";
import "./globals.css";

/**
 * The eight faces the footer's wordmark marquee needs, and nothing else on the
 * site uses.
 *
 * Rotonto is a Latin-only face, so the marquee's Tamil, Devanagari, Bengali,
 * Gujarati, Telugu, Kannada, Malayalam and Urdu were falling through to
 * whatever the browser had lying around — a different, usually thin, usually
 * default face per script, which is exactly why the line read as unset.
 *
 * Each is pulled at 700 only. The marquee is display-sized black-on-red and
 * has one weight in it; shipping a range would be seven more files for a line
 * that never changes weight. Everything else about them is chosen to keep them
 * off the critical path, since they are at the very bottom of a 8800px page:
 *
 *   subsets              one script each, not the whole Noto coverage.
 *   preload: false       the marquee is not what the first paint is waiting on.
 *   display: "swap"      the line shows in the fallback and re-sets when the
 *                        face lands, rather than being invisible until then.
 *   adjustFontFallback   off. Next would otherwise emit a metric-matched
 *                        `local("Arial")` face per family, and eight of those
 *                        stacked ahead of each other is eight chances for a
 *                        Latin fallback to answer for a script it cannot draw.
 *
 * They are exposed as CSS variables and composed into one stack in
 * `globals.css` — see `.scripts` there, which is what the two marquees wear.
 *
 * The four options are repeated on each of the eight rather than spread from
 * one object: `next/font` is a compile-time transform and reads its arguments
 * out of the source, so it will only take a literal.
 */
const devanagari = Noto_Sans_Devanagari({
  weight: "700",
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-devanagari",
});
const bengali = Noto_Sans_Bengali({
  weight: "700",
  subsets: ["bengali"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-bengali",
});
const gujarati = Noto_Sans_Gujarati({
  weight: "700",
  subsets: ["gujarati"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-gujarati",
});
const tamil = Noto_Sans_Tamil({
  weight: "700",
  subsets: ["tamil"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-tamil",
});
const telugu = Noto_Sans_Telugu({
  weight: "700",
  subsets: ["telugu"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-telugu",
});
const kannada = Noto_Sans_Kannada({
  weight: "700",
  subsets: ["kannada"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-kannada",
});
const malayalam = Noto_Sans_Malayalam({
  weight: "700",
  subsets: ["malayalam"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-malayalam",
});
const urdu = Noto_Nastaliq_Urdu({
  weight: "700",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-urdu",
});

const SCRIPTS = [
  devanagari,
  bengali,
  gujarati,
  tamil,
  telugu,
  kannada,
  malayalam,
  urdu,
]
  .map((face) => face.variable)
  .join(" ");

export const metadata: Metadata = {
  title: "VinHack 2026 — VinnovateIT",
  description:
    "VinHack is a 36-hour hybrid hackathon by VinnovateIT at Vellore Institute of Technology, bringing together creative minds to build impactful solutions for real-world problems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${SCRIPTS}`}>
      <body className="flex min-h-full flex-col bg-black">
        <noscript>
          <style
            dangerouslySetInnerHTML={{ __html: ".hero-motion{opacity:1}" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
