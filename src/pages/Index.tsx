import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import DashboardCardsSection from "@/components/DashboardCardsSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeatureSection />
      <DashboardCardsSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
