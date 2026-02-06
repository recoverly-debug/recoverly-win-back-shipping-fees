import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import RecoveryTypes from "@/components/landing/RecoveryTypes";
import Testimonial from "@/components/landing/Testimonial";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="pt-16">
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <RecoveryTypes />
        <Testimonial />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
