import type { Metadata, Viewport } from "next";
import {
  Anek_Bangla,
  Anek_Devanagari,
  Anek_Gujarati,
  Anek_Kannada,
  Anek_Malayalam,
  Anek_Tamil,
  Anek_Telugu,
  Noto_Nastaliq_Urdu,
} from "next/font/google";
import "./globals.css";

const devanagari = Anek_Devanagari({
  weight: "700",
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-devanagari",
});
const bengali = Anek_Bangla({
  weight: "700",
  subsets: ["bengali"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-bengali",
});
const gujarati = Anek_Gujarati({
  weight: "700",
  subsets: ["gujarati"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-gujarati",
});
const tamil = Anek_Tamil({
  weight: "700",
  subsets: ["tamil"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-tamil",
});
const telugu = Anek_Telugu({
  weight: "700",
  subsets: ["telugu"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-telugu",
});
const kannada = Anek_Kannada({
  weight: "700",
  subsets: ["kannada"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-kannada",
});
const malayalam = Anek_Malayalam({
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "VinHack 2026 — VinnovateIT",
  description:
    "VinHack is a 36-hour hybrid hackathon by VinnovateIT at Vellore Institute of Technology, bringing together creative minds to build impactful solutions for real-world problems.",
  // Served from public/ as a static asset. As src/app/icon.svg it became a Next route handler, so
  // every page load ran the Worker (and burned CPU) just to return a 180 KB file.
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${SCRIPTS}`}>
      <body className="flex min-h-full flex-col bg-black">
        <noscript>
          <style
            /* Both are held at zero for an entrance that GSAP runs — the
               collage, and the navigation sticker dealt on with it. Without
               JavaScript there is no deal, so neither may stay hidden. */
            dangerouslySetInnerHTML={{
              __html: ".hero-motion,.nav-dock{opacity:1}",
            }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
