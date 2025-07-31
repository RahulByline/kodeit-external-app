import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, BookOpen, BarChart3 } from "lucide-react";
import kidsImage from "@/assets/kids-computers.jpg";
import teachersImage from "@/assets/teachers-robotics.jpg";
import analyticsImage from "@/assets/data-analytics.jpg";

const features = [
  {
    title: "Make Your Classes More Memorable",
    description: "Engage students with interactive content and gamified learning experiences that make education fun and effective.",
    image: kidsImage,
    icon: Users,
    gradient: "from-blue-500 to-purple-600"
  },
  {
    title: "Transforming Teacher Preparation",
    description: "Equip educators with cutting-edge tools and robotics integration to prepare them for the future of teaching.",
    image: teachersImage,
    icon: BookOpen,
    gradient: "from-purple-500 to-pink-600"
  },
  {
    title: "Curious About Data Analytics / Websites / Blockchain",
    description: "Explore the future of education technology with advanced analytics, web development, and blockchain integration.",
    image: analyticsImage,
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-600"
  }
];

const FeatureSection = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-primary-gradient bg-clip-text text-transparent">
              Revolutionizing Education
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our platform transforms learning experiences for students, teachers, and educational institutions worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group overflow-hidden bg-white border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                <Button variant="outline" className="w-full group/btn hover:bg-gray-50">
                  Learn More
                  <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-sm">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
              Ready to Transform Your Educational Experience?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of schools and educators already using our platform to create engaging, effective learning environments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta" size="xl" onClick={() => window.location.href = '/dashboards'}>
                Access Dashboards
              </Button>
              <Button variant="hero" size="xl">
                Request a Demo
              </Button>
              <Button variant="hero" size="xl">
                Partner with Us
              </Button>
              <Button variant="glass" size="xl">
                Join as a School
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;