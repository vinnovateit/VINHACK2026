import DesignCanvas from "@/components/DesignCanvas";
import HeroMotion from "@/components/HeroMotion";
import MobileMotion from "@/components/mobile/MobileMotion";
import MobileSite from "@/components/mobile/MobileSite";
import PageMotion from "@/components/PageMotion";
import HeroSection from "@/components/sections/Hero";
import AboutSection from "@/components/sections/About";
import WhoAreWeSection from "@/components/sections/WhoAreWe";
import ProjectsSection from "@/components/sections/Projects";
import TracksSection from "@/components/sections/Tracks";
import TimelineSection from "@/components/sections/Timeline";
import RulesSection from "@/components/sections/Rules";
import GuidelinesSection from "@/components/sections/Guidelines";
import RegisterSection from "@/components/sections/Register";
import SiteFooter from "@/components/sections/SiteFooter";

/**
 * The page is drawn two ways, and which one you get is a media query.
 *
 * The design is a fixed 1280 x 8834 collage with no reflow in it, so at and
 * above `md` it is scaled whole — that is `DesignCanvas`, and it is the design
 * exactly as it was drawn. Below `md` that scaling puts 21px body copy at 6px
 * on a phone, so `MobileSite` takes over with the same content and artwork
 * reflowed into one column.
 *
 * The swap is CSS rather than a hook: this is a static export, so a JS-side
 * width check would have to pick one to prerender and then correct itself on
 * the client — a flash of the wrong layout on whichever half guessed wrong.
 * With `md:` classes the server-rendered HTML is already right at every width,
 * and rotating the phone re-lays out with no JavaScript at all.
 *
 * The cost is that both trees are in the document. It is the reason the two
 * layouts share `content/site.ts` rather than each holding its own copy of the
 * words, and the reason every motion module gates on the breakpoint: `HeroMotion`
 * and `PageMotion` on `DESKTOP`, `MobileMotion` on `MOBILE` (both in
 * motion/recipes.ts) — GSAP must not measure the tree that is `display: none`.
 */
export default function Home() {
  return (
    <main className="bg-black">
      <div className="hidden md:block">
        <DesignCanvas
          hero={
            <HeroMotion>
              <HeroSection />
            </HeroMotion>
          }
        >
          <PageMotion>
            <AboutSection />
            <WhoAreWeSection />
            <ProjectsSection />
            <TracksSection />
            <TimelineSection />
            <RulesSection />
            <GuidelinesSection />
            <RegisterSection />
            <SiteFooter />
          </PageMotion>
        </DesignCanvas>
      </div>

      <MobileMotion>
        <MobileSite />
      </MobileMotion>
    </main>
  );
}
