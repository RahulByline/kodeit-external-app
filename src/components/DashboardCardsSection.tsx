import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, School, Users, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const dashboardRoles = [
  {
    id: "admin",
    title: "Admin",
    description: "Complete system administration and comprehensive analytics dashboard",
    icon: Shield,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/20",
    features: [
      "System Management",
      "Advanced Analytics", 
      "User Administration"
    ],
    gradient: "from-red-500/20 to-red-600/10"
  },
  {
    id: "school-admin", 
    title: "School Admin",
    description: "Monitor school-wide progress and manage teacher development programs",
    icon: School,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/20",
    features: [
      "School Analytics",
      "Teacher Reports",
      "Progress Monitoring"
    ],
    gradient: "from-purple-500/20 to-purple-600/10"
  },
  {
    id: "teacher",
    title: "Teacher", 
    description: "Manage courses, track student progress, and create assignments",
    icon: Users,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/20",
    features: [
      "Course Management",
      "Student Analytics",
      "Assignment Tools"
    ],
    gradient: "from-green-500/20 to-green-600/10"
  },
  {
    id: "student",
    title: "Student",
    description: "Access your courses, track progress, and submit assignments",
    icon: GraduationCap,
    iconColor: "text-blue-400", 
    iconBg: "bg-blue-500/20",
    features: [
      "Course Access",
      "Progress Tracking",
      "Assignment Submission"
    ],
    gradient: "from-blue-500/20 to-blue-600/10"
  }
];

const DashboardCardsSection = () => {
  const navigate = useNavigate();

  const handleAccessDashboard = (roleId: string) => {
    // Navigate to role-specific login page
    if (roleId === 'admin') {
      navigate('/login/admin');
    } else if (roleId === 'school-admin') {
      navigate('/login/school-admin');
    } else if (roleId === 'teacher') {
      navigate('/login/teacher');
    } else if (roleId === 'student') {
      navigate('/login/student');
    } else {
      navigate('/login');
    }
  };

  return (
    <section id="dashboard-section" className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-500/5 rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-primary-gradient bg-clip-text text-transparent animate-gradient">
              Access Your Dashboard
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your role and access your personalized dashboard to start your journey with KODEIT.
          </p>
        </div>

        {/* Dashboard Cards in Horizontal Row */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
          {dashboardRoles.map((role, index) => (
            <Card 
              key={role.id} 
              className="group bg-white flex-1 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 overflow-hidden border border-gray-100 min-h-[400px] relative"
              data-aos="fade-up"
              data-aos-delay={index * 200}
            >
              {/* Animated Border */}
              <div className={`h-1.5 bg-gradient-to-r ${role.gradient} animate-pulse`} />
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full animate-bounce"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-primary/30 rounded-full animate-ping"></div>
              
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  <div className={`p-3 rounded-lg ${role.iconBg} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <role.icon className={`${role.iconColor} w-6 h-6 group-hover:rotate-12 transition-transform duration-300`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                    {role.title}
                  </h3>
                </div>

                <p className="text-gray-600 mb-6 flex-grow group-hover:text-gray-700 transition-colors">
                  {role.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {role.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors"
                      style={{ animationDelay: `${featureIndex * 100}ms` }}
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 group-hover:scale-150 transition-transform duration-300" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="hero"
                  className="w-full group/btn mt-auto hover:scale-105 transition-all duration-300"
                  onClick={() => handleAccessDashboard(role.id)}
                >
                  Access Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-12" data-aos="fade-up" data-aos-delay="800">
          <Button 
            variant="glass" 
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:scale-105 transition-transform duration-300 animate-pulse"
          >
            Learn More About KODEIT
          </Button>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default DashboardCardsSection; 