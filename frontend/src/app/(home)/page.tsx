import { HeroSection } from "@/components/home/HeroSection";
import { TechBar } from "@/components/home/TechBar";
import { WhySection } from "@/components/home/WhySection";
import { LearningFocusSection } from "@/components/home/LearningFocusSection";
import { DemoCodeSection } from "@/components/home/DemoCodeSection";
import { FeaturedCoursesSection } from "@/components/home/FeaturedCoursesSection";
import { CommingCourseSection } from "@/components/home/CommingCourseSection";
import { RoadmapSection } from "@/components/home/RoadmapSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FounderSpotlightSection } from "@/components/home/FounderSpotlightSection";
import { FAQSection } from "@/components/home/FAQSection";
import { CTASection } from "@/components/home/CTASection";

const HomePage = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <FeaturedCoursesSection />
      <CommingCourseSection />
      <WhySection />
      <LearningFocusSection />
      <TechBar />
      <DemoCodeSection />
      <RoadmapSection />
      <TestimonialsSection />
      <LearningFocusSection />
      <FAQSection />
      <CTASection />
      <FounderSpotlightSection />
    </div>
  );
};

export default HomePage;
