import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Trophy, Clock, TrendingUp, Play, MessageSquare, Download, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TraineeTeacherDashboard = () => {
  const navigate = useNavigate();

  const learnerStats = [
    { title: "Courses Enrolled", value: "8", icon: BookOpen, trend: "2 new this month" },
    { title: "Certificates Earned", value: "5", icon: Trophy, trend: "1 pending review" },
    { title: "Study Hours", value: "47", icon: Clock, trend: "12 hours this week" },
    { title: "Progress Score", value: "84%", icon: TrendingUp, trend: "+8% this month" }
  ];

  const quickActions = [
    { title: "Continue Learning", icon: Play, description: "Resume current course" },
    { title: "Ask Trainer", icon: MessageSquare, description: "Get help and feedback" },
    { title: "Download Resources", icon: Download, description: "Access course materials" },
    { title: "Schedule Session", icon: Calendar, description: "Book one-on-one time" }
  ];

  const currentCourses = [
    { title: "Advanced Moodle Administration", progress: 85, nextDeadline: "Dec 15", status: "In Progress" },
    { title: "Data Analytics for Education", progress: 67, nextDeadline: "Dec 20", status: "In Progress" },
    { title: "Digital Assessment Techniques", progress: 92, nextDeadline: "Completed", status: "Completed" },
    { title: "Classroom Technology Integration", progress: 45, nextDeadline: "Jan 10", status: "Started" }
  ];

  const recentAchievements = [
    { title: "Moodle Expert Certificate", date: "Dec 1, 2024", type: "Certificate" },
    { title: "Course Completion: Digital Teaching", date: "Nov 28, 2024", type: "Course" },
    { title: "Assessment Mastery Badge", date: "Nov 20, 2024", type: "Badge" },
    { title: "Perfect Attendance Award", date: "Nov 15, 2024", type: "Award" }
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-primary-gradient bg-clip-text text-transparent">
              Trainee Teacher Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your professional development and learning journey
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboards')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Selection
          </Button>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {learnerStats.map((stat, index) => (
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
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="bg-card-gradient border-border/20 hover:border-primary/50 transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <action.icon className="w-5 h-5 mr-2 text-primary" />
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Achievements */}
          <Card className="bg-card-gradient border-border/20">
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/20 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      achievement.type === 'Certificate' ? 'bg-yellow-500/20 text-yellow-400' :
                      achievement.type === 'Course' ? 'bg-green-500/20 text-green-400' :
                      achievement.type === 'Badge' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {achievement.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Courses */}
        <Card className="bg-card-gradient border-border/20">
          <CardHeader>
            <CardTitle>My Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentCourses.map((course, index) => (
                <div key={index} className="p-4 bg-background/20 rounded-lg border border-border/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{course.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      course.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                      course.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-background/40 rounded-full mr-3">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Due: {course.nextDeadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TraineeTeacherDashboard;