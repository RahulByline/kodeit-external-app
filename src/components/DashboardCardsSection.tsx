import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, School, Users, GraduationCap } from "lucide-react";
import { dashboardRoles as sharedDashboardRoles } from "@/data/dashboardRoles";
import { useNavigate } from "react-router-dom";

const dashboardRoles = sharedDashboardRoles;

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

        {/* Cards styled like the provided design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {dashboardRoles.map((role, index) => (
            <Card
              key={role.id}
              className={`relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-b ${role.gradient} h-[520px] w-full flex flex-col items-center text-white`}
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              <CardContent className="flex flex-col items-center text-center h-full w-full px-6 pt-10 pb-6">
                {/* Top white icon circle */}
                <div className="w-28 h-28 rounded-full bg-white shadow-2xl flex items-center justify-center mx-auto mb-8">
                  <role.icon className={`${role.iconColor} w-12 h-12`} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-semibold tracking-wide mb-2">
                  {role.title}
                </h3>

                {/* Description */}
                <p className="text-white/85 text-sm leading-relaxed px-2 mb-8">
                  {role.description}
                </p>

                {/* Spacer to push CTA to bottom */}
                <div className="flex-1" />

                {/* White pill CTA button */}
                <Button
                  variant="default"
                  className="bg-white text-gray-800 hover:bg-white hover:text-gray-900 rounded-full px-8 py-2 shadow-md hover:shadow-lg transition-all"
                  onClick={() => handleAccessDashboard(role.id)}
                >
                  Access Dashboard
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