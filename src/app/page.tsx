import DesignCanvas from "@/components/DesignCanvas";
import HeroMotion from "@/components/HeroMotion";
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

export default function Home() {
  return (
    <main className="bg-black">
      <DesignCanvas>
        <HeroMotion>
          <HeroSection />
        </HeroMotion>
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
    </main>
  );
}
