import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Users, BarChart3 } from "lucide-react";

const slides = [
  {
    title: "Customized and Innovative ICT Courses for Schools",
    subtitle: "Empowering schools, teachers, and students with cutting-edge edtech solutions that transform learning experiences",
    image: "/home-carousel-for-schools.jpg",
    cta: "Explore",
    icon: BookOpen,
    gradient: "from-blue-500 to-purple-600"
  },
  {
    title: "Aligned with International Educational Standards",
    subtitle: "Connect your existing LMS with our powerful analytics and management tools for seamless integration",
    image: "/home-carousal-for-teachers.jpg",
    cta: "Explore",
    icon: Users,
    gradient: "from-purple-500 to-pink-600"
  },
  {
    title: "Empower Students to Achieve Their Maximum Potential",
    subtitle: "Make informed decisions with comprehensive analytics and reporting that drive student success",
    image: "/Innovative-ICT-Curricula.jpeg",
    cta: "Explore",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-600"
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000); // Changed to 10 seconds
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
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient} opacity-20`} />
        <div className="absolute inset-0 bg-white/20" />
      </div>

             {/* Content */}
       <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
         <div className="max-w-4xl mx-auto text-center">
           <div className="mb-6 flex justify-center animate-bounce-in">
             <div className={`p-4 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transform hover:scale-110 transition-all duration-500`}>
               {React.createElement(slides[currentSlide].icon, { size: 32, className: "text-gray-800" })}
             </div>
           </div>
           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up text-white drop-shadow-lg leading-tight">
             {slides[currentSlide].title}
           </h1>
           <p className="text-xl sm:text-2xl text-white/90 mb-8 animate-slide-up-delayed max-w-3xl mx-auto leading-relaxed drop-shadow-md">
             {slides[currentSlide].subtitle}
           </p>
           <div className="flex justify-center animate-fade-in-delayed">
             <Button 
               variant="glass" 
               size="xl" 
               className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300 animate-pulse-slow"
               onClick={() => window.open('https://www.kodeit.com/', '_blank')}
             >
               Know More 
             </Button>
           </div>
         </div>
       </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 shadow-md hover:bg-white transition-all hover:scale-110"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 shadow-md hover:bg-white transition-all hover:scale-110"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </section>
  );
};

export default HeroSection;