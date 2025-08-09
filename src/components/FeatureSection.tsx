import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, BookOpen, BarChart3 } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";

const features = [
  {
    title: "Innovative ICT Curricula",
    description: "KODEIT introduces an ICT curriculum that's tech-forward...",
    image: "/card1.webp",
    icon: Users,
    gradient: "from-blue-500 to-purple-600",
    link: "https://www.kodeit.com/ict_curriculum.html"
  },
  {
    title: "Kodeit for Schools",
    description: "KODEIT provides a unique and innovative ICT curriculum...",
    image: "/card2.webp",
    icon: BookOpen,
    gradient: "from-purple-500 to-pink-600",
    link: "https://www.kodeit.com/kodeit_schools.html"
  },
  {
    title: "Cutting Edge Technology Leading The Way",
    description: "With top-notch multimedia resources...",
    image: "/card3.webp",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-600",
    link: "https://www.kodeit.com/technology.html"
  }
];

const FeatureSection = () => {
  // Duplicate features array for seamless looping
  const duplicatedFeatures = [...features, ...features];
  
  return (
    <section id="features" className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-primary-gradient bg-clip-text text-transparent">
            FUTURE IS NOW
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our platform transforms learning experiences for students, teachers, and educational institutions worldwide.
          </p>
        </div>
        
        {/* Animated container */}
        <div className="relative">
          <div className="flex animate-scroll-left pause-on-hover">
            {duplicatedFeatures.map((feature, index) => (
              <div key={index} className="flex-shrink-0 w-full lg:w-1/3 px-4">
                <Card className="group overflow-hidden bg-white border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full">
                  <div className="relative h-64 overflow-hidden">
                    <OptimizedImage
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-30 group-hover:opacity-20 transition-opacity duration-300`} />
                    <div className="absolute top-4 left-4 p-3 rounded-full bg-white/90">
                      <feature.icon size={24} className={feature.gradient.includes('blue') ? 'text-blue-600' : feature.gradient.includes('purple') ? 'text-purple-600' : 'text-cyan-600'} />
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {feature.description}
                    </p>
                    <a href={feature.link} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full group/btn hover:bg-gray-50">
                        Learn More
                        <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Custom styles for animation */}
      <style>
        {`
          @keyframes scroll-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .animate-scroll-left {
            animation: scroll-left 30s linear infinite;
          }
          
          .pause-on-hover:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </section>
  );
};

export default FeatureSection;