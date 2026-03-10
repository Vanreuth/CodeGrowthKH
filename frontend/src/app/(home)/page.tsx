import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { WhySection } from "@/components/home/WhySection";
import { LearningFocusSection } from "@/components/home/LearningFocusSection";
import { TechMarquee } from "@/components/home/TechMarquee";
import { DemoCodeSection } from "@/components/home/DemoCodeSection";
import { FeaturedCoursesSection } from "@/components/home/FeaturedCoursesSection";
import { CommingCourseSection } from "@/components/home/CommingCourseSection";
import { RoadmapSection } from "@/components/home/RoadmapSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { CTASection } from "@/components/home/CTASection";

const HomePage = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <StatsBar />
      <FeaturedCoursesSection />
      <CommingCourseSection />
      <WhySection />
      <LearningFocusSection />
      <TechMarquee />
      <RoadmapSection />
      <DemoCodeSection />
      <TestimonialsSection />
      <LearningFocusSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
