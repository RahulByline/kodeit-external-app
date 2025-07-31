import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, School, Users, GraduationCap, GitBranch } from "lucide-react";
import { useNavigate } from "react-router-dom";

const dashboardRoles = [
  {
    id: "super-admin",
    title: "Super Admin",
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
    id: "trainer",
    title: "Trainer", 
    description: "Manage training sessions, track performance, and engage with trainees",
    icon: Users,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/20",
    features: [
      "Session Management",
      "Performance Analytics",
      "Feedback Tools"
    ],
    gradient: "from-green-500/20 to-green-600/10"
  },
  {
    id: "trainee-teacher",
    title: "Trainee Teacher",
    description: "Access personalized learning pathways and track your professional development",
    icon: GraduationCap,
    iconColor: "text-blue-400", 
    iconBg: "bg-blue-500/20",
    features: [
      "Personal Dashboard",
      "Course Progress",
      "Certificates"
    ],
    gradient: "from-blue-500/20 to-blue-600/10"
  },
  {
    id: "cluster-lead",
    title: "Cluster Lead",
    description: "Oversee multiple schools and coordinate regional training initiatives",
    icon: GitBranch,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/20", 
    features: [
      "Regional Overview",
      "Multi-School Analytics",
      "Resource Allocation"
    ],
    gradient: "from-orange-500/20 to-orange-600/10"
  }
];

const DashboardSelection = () => {
  const navigate = useNavigate();

  const handleAccessDashboard = (roleId: string) => {
    navigate(`/dashboard/${roleId}`);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-primary-gradient bg-clip-text text-transparent">
              Access Your Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Select your role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {dashboardRoles.map((role) => (
            <Card key={role.id} className="group bg-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden border border-gray-100">
              <div className={`h-1.5 bg-gradient-to-r ${role.gradient}`} />
              
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${role.iconBg} mr-4`}>
                    <role.icon className={`${role.iconColor} w-6 h-6`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                    {role.title}
                  </h3>
                </div>

                <p className="text-gray-600 mb-6">
                  {role.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="hero"
                  className="w-full group/btn"
                  onClick={() => handleAccessDashboard(role.id)}
                >
                  Access Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="glass" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelection;