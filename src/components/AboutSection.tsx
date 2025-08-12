import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import AOS from 'aos';
import 'aos/dist/aos.css'; // Make sure to import the CSS

const AboutSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize AOS library on component mount
  useEffect(() => {
    AOS.init({
      duration: 800, // Animation duration
      once: true,     // Whether animation should happen only once
      offset: 100,    // Offset (in px) from the original trigger point
    });
  }, []);
  
  const shortContent = `Founded with a mission to inspire and educate the next generation of tech innovators, KODEIT is at the forefront of developing comprehensive, accessible, and innovative educational resources, that are aligned to top education standards.`;
  
  const fullContent = `Our journey began with a simple yet powerful vision: to make learning ICT skills engaging, practical, and relevant to the evolving landscape of the digital world. Our team of experts bring together decades of experience in education, technology, and curriculum development to create books, digital resources, and learning tools that cater to the diverse needs of students and educators alike. At KODEIT we believe in the power of technology to change lives. Through our publications, we aim to empower students with the knowledge and skills they need to succeed in a rapidly evolving technological landscape.`;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const stats = [
    { number: "10+", label: "Years Experience" },
    { number: "50+", label: "Countries Reached" },
    { number: "1000+", label: "Schools Partnered" },
    { number: "100K+", label: "Students Empowered" }
  ];

  return (
    <section id="about" className="relative w-full py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-x-16 -translate-y-16 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full translate-x-20 translate-y-20 blur-2xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-5">
            <span className="bg-primary-gradient bg-clip-text text-transparent">
              About KODEIT
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Pioneering the future of technology education with passion and innovation.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mt-6"></div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Image */}
          <div data-aos="fade-right" data-aos-delay="200">
            <div className="relative p-4">
              {/* THIS IS THE CHANGED DIV with the animation class */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl animate-slow-rotate"></div>
              <OptimizedImage 
                src="/about/img3.webp" // Replace with a primary "About Us" image
                alt="A vibrant and collaborative workspace at KODEIT" 
                className="relative w-full h-auto object-cover rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          
          {/* Right Column - Content */}
          <div className="flex flex-col h-full" data-aos="fade-left" data-aos-delay="400">
            {/* Content Text */}
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed text-xl">
                {shortContent}
              </p>
              {isExpanded && (
                <div className="mt-4 space-y-4 text-gray-600 animate-fade-in">
                  <p>{fullContent}</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Button
                variant="outline"
                onClick={toggleExpanded}
                className="group flex items-center gap-2 hover:bg-gray-50 transition-all duration-300"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} className="transition-transform" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="transition-transform" />
                    Learn More
                  </>
                )}
              </Button>
              <Button
                variant="hero"
                onClick={() => window.open('https://www.kodeit.com/about.html', '_blank')}
                className="group flex items-center gap-2 hover:scale-105 transition-transform duration-300"
              >
                Our Journey
                <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section - Placed below the main grid */}
        <div className="mt-20 lg:mt-28">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div 
                    key={index} 
                    className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                    data-aos="fade-up"
                    data-aos-delay={100 * index}
                >
                <div className="text-3xl lg:text-4xl font-bold bg-primary-gradient bg-clip-text text-transparent mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium tracking-wide">{stat.label}</div>
                </div>
            ))}
            </div>
        </div>

      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; max-height: 0; }
            to { opacity: 1; max-height: 500px; /* Adjust as needed */ }
          }
          
          .animate-fade-in {
            overflow: hidden;
            animation: fadeIn 0.8s ease-in-out forwards;
          }

          /* THIS IS THE NEW ANIMATION FOR THE ROTATING CONTAINER */
          @keyframes slow-rotate {
            0%, 100% {
              transform: rotate(-20deg);
            }
            50% {
              transform: rotate(20deg);
            }
          }

          .animate-slow-rotate {
            animation: slow-rotate 15s ease-in-out infinite;
          }
        `}
      </style>
    </section>
  );
};

export default AboutSection;