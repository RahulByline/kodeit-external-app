import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, GraduationCap, BookOpen, TrendingUp, UserPlus, Calendar, MessageSquare, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();

  const schoolStats = [
    { title: "Total Teachers", value: "45", icon: Users, trend: "+3 this month" },
    { title: "Total Students", value: "1,247", icon: GraduationCap, trend: "+67 this semester" },
    { title: "Active Courses", value: "23", icon: BookOpen, trend: "+2 new courses" },
    { title: "Completion Rate", value: "87%", icon: TrendingUp, trend: "+5% improvement" }
  ];

  const quickActions = [
    { title: "Enroll New Teacher", icon: UserPlus, description: "Add teachers to your school" },
    { title: "Schedule Training", icon: Calendar, description: "Plan development sessions" },
    { title: "Communication Hub", icon: MessageSquare, description: "School announcements" },
    { title: "Progress Reports", icon: FileText, description: "Generate performance reports" }
  ];

  const recentTeachers = [
    { name: "Sarah Johnson", subject: "Mathematics", status: "Active", progress: "92%" },
    { name: "Michael Chen", subject: "Science", status: "Training", progress: "78%" },
    { name: "Emily Davis", subject: "English", status: "Active", progress: "89%" },
    { name: "Robert Wilson", subject: "History", status: "Pending", progress: "45%" }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              School Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor school-wide progress and manage teacher development
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboards')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Selection
          </Button>
        </div>

        {/* School Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {schoolStats.map((stat, index) => (
            <Card key={index} className="bg-card-gradient border-border/20 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-blue-400">{stat.trend}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="bg-card-gradient border-border/20 hover:border-primary/50 transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <action.icon className="w-5 h-5 mr-2 text-primary" />
                    <h3 className="font-semibold">{action.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Teacher Performance Chart */}
          <Card className="bg-card-gradient border-border/20">
            <CardHeader>
              <CardTitle>Teacher Development Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTeachers.map((teacher, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{teacher.progress}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        teacher.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        teacher.status === 'Training' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {teacher.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Analytics */}
        <Card className="bg-card-gradient border-border/20">
          <CardHeader>
            <CardTitle>Course Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">23</p>
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">87%</p>
                <p className="text-sm text-muted-foreground">Average Completion</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">4.2</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;