import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VinHack 2026 — VinnovateIT",
  description:
    "VinHack is a 36-hour hybrid hackathon by VinnovateIT at Vellore Institute of Technology, bringing together creative minds to build impactful solutions for real-world problems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
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
