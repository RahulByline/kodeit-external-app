import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, School, BookOpen, TrendingUp, Settings, UserCheck, Database, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: "Total Schools", value: "245", icon: School, trend: "+12%" },
    { title: "Active Users", value: "15,432", icon: Users, trend: "+8%" },
    { title: "Total Courses", value: "1,847", icon: BookOpen, trend: "+15%" },
    { title: "System Uptime", value: "99.9%", icon: TrendingUp, trend: "Stable" }
  ];

  const managementTools = [
    { title: "User Management", icon: UserCheck, description: "Manage all system users and permissions" },
    { title: "System Settings", icon: Settings, description: "Configure global system settings" },
    { title: "Database Management", icon: Database, description: "Monitor and maintain database health" },
    { title: "Analytics Center", icon: BarChart3, description: "Comprehensive system analytics and reporting" }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Complete system administration and comprehensive analytics
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboards')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Selection
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card-gradient border-border/20 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-green-400">{stat.trend}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {managementTools.map((tool, index) => (
            <Card key={index} className="bg-card-gradient border-border/20 hover:border-primary/50 transition-all hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <tool.icon className="w-5 h-5 mr-2 text-primary" />
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-card-gradient border-border/20">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/20">
                <span className="text-foreground">New school registered: "Tech Academy"</span>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/20">
                <span className="text-foreground">System backup completed successfully</span>
                <span className="text-sm text-muted-foreground">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/20">
                <span className="text-foreground">Database optimization performed</span>
                <span className="text-sm text-muted-foreground">6 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-foreground">Security update deployed</span>
                <span className="text-sm text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;