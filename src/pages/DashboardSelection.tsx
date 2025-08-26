import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, School, Users, GraduationCap, Sparkles, CheckCircle } from "lucide-react";
import { dashboardRoles as sharedDashboardRoles } from "@/data/dashboardRoles";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const dashboardRoles = sharedDashboardRoles;
// Intensify gradients only for this screen without touching shared data
const strongGradients: Record<string, string> = {
  'admin': 'from-rose-300 to-pink-400',
  'school-admin': 'from-violet-300 to-indigo-400',
  'teacher': 'from-emerald-300 to-teal-400',
  'student': 'from-sky-300 to-blue-400',
};
const enhancedRoles = dashboardRoles.map(r => ({
  ...r,
  gradient: strongGradients[r.id] ?? r.gradient,
}));

const DashboardCardsSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleAccessDashboard = (roleId: string) => {
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

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
    id="dashboard-section"
    className="py-12 bg-gray-100 relative overflow-hidden" // reduced padding top and bottom
    ref={sectionRef}
  >
    {/* Animated Background with Parallax Effect */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div 
        className="absolute w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" // reduced circle sizes
        style={{
          left: `${mousePosition.x * 0.05}px`,
          top: `${mousePosition.y * 0.05}px`,
          transition: 'left 0.5s ease, top 0.5s ease'
        }}
      />
      <div 
        className="absolute w-24 h-24 bg-purple-500/10 rounded-full blur-3xl"
        style={{
          right: `${(window.innerWidth - mousePosition.x) * 0.05}px`,
          bottom: `${(window.innerHeight - mousePosition.y) * 0.05}px`,
          transition: 'right 0.5s ease, bottom 0.5s ease'
        }}
      />
      <div 
        className="absolute w-20 h-20 bg-green-500/10 rounded-full blur-3xl"
        style={{
          left: `${mousePosition.x * 0.03}px`,
          bottom: `${(window.innerHeight - mousePosition.y) * 0.03}px`,
          transition: 'left 0.7s ease, bottom 0.7s ease'
        }}
      />
    </div>
    {/* Floating Geometric Shapes */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-20 left-10 w-24 h-24 bg-blue-500/5 rounded-full animate-float"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-500/5 rounded-full animate-float animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-green-500/5 rounded-full animate-float animation-delay-4000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-red-500/5 rounded-full animate-float animation-delay-6000"></div>
    </div>
    
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Section Header */}
      <div className="text-center mb-10" data-aos="fade-up"> {/* reduced margin-bottom */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-4"> {/* smaller heading */}
          <span className="bg-primary-gradient bg-clip-text text-transparent animate-gradient">
            Access Your Dashboard
          </span>
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto"> {/* slightly smaller paragraph */}
          Choose your role and access your personalized dashboard to start your journey with KODEIT.
        </p>
      </div>
      
      {/* Cards styled like the provided design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Enhanced Grades 3-7 Dashboard */}
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">Enhanced Grades 3-7</CardTitle>
                      <CardDescription className="text-gray-600">
                        Modern, interactive dashboard designed specifically for elementary to middle school students
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Interactive course cards</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Quick tools sidebar</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Progress tracking</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Study streak tracking</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => navigate('/dashboard/student/enhanced')}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Launch Enhanced Dashboard
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing dashboards... */}
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-200">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">Grades 1-3 Dashboard</CardTitle>
                      <CardDescription className="text-gray-600">
                        Colorful and engaging interface for early elementary students
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Rainbow learning theme</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Simple navigation</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Visual progress indicators</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Kid-friendly interface</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                        onClick={() => navigate('/dashboards/grades1-3')}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Launch Grades 1-3
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Regular Role-based Dashboards */}
                  {enhancedRoles.map((role, index) => (
                    <Card
                      key={role.id}
                      className={`relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-b ${role.gradient} h-[100px] w-full flex flex-col items-center text-white`}
                      data-aos="fade-up"
                      data-aos-delay={index * 150}
                    >
                      <CardContent className="flex flex-col items-center text-center w-full px-4 pt-3 pb-2 gap-y-2">
                        <div className="w-16 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center mx-auto mb-3">
                          <role.icon className={`${role.iconColor} w-6 h-6`} />
                        </div>
                        <h3 className="text-base font-semibold tracking-wide mb-1">
                          {role.title}
                        </h3>
                        <p className="text-white/90 text-xs leading-relaxed px-1 mb-0">
                          {role.description}
                        </p>
                        <Button
                          variant="default"
                          className="mt-2 bg-white text-gray-800 hover:bg-gray-100 rounded-full px-4 py-1 shadow-md hover:shadow-lg transition-all text-xs"
                          onClick={() => handleAccessDashboard(role.id)}
                        >
                          Access Dashboard
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          );
        };
        
        export default DashboardCardsSection;