import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";

const slides = [
  {
    title: "Transform Education with Technology",
    subtitle: "Empowering schools, teachers, and students with cutting-edge edtech solutions",
    image: heroImage,
    cta: "Get Started Today"
  },
  {
    title: "Integrate Seamlessly with Moodle",
    subtitle: "Connect your existing LMS with our powerful analytics and management tools",
    image: heroImage,
    cta: "Learn More"
  },
  {
    title: "Data-Driven Insights",
    subtitle: "Make informed decisions with comprehensive analytics and reporting",
    image: heroImage,
    cta: "Request Demo"
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Background Image with Light Overlay */}
      <div className="absolute inset-0">
        <img
          src={slides[currentSlide].image}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className="max-w-4xl mx-auto text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            <span className="bg-primary-gradient bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-8 animate-slide-in">
            {slides[currentSlide].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button variant="hero" size="xl">
              <Play className="mr-2" size={20} />
              {slides[currentSlide].cta}
            </Button>
            <Button variant="glass" size="xl">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 shadow-md hover:bg-white transition-all"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 shadow-md hover:bg-white transition-all"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide ? 'bg-primary scale-150' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;