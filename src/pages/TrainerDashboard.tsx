import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Calendar, Star, TrendingUp, Plus, MessageCircle, FileText, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrainerDashboard = () => {
  const navigate = useNavigate();

  const trainerStats = [
    { title: "Active Trainees", value: "28", icon: Users, trend: "+4 this week" },
    { title: "Sessions This Month", value: "12", icon: Calendar, trend: "3 upcoming" },
    { title: "Average Rating", value: "4.8", icon: Star, trend: "+0.2 improvement" },
    { title: "Completion Rate", value: "94%", icon: TrendingUp, trend: "+7% this month" }
  ];

  const quickActions = [
    { title: "Create Session", icon: Plus, description: "Schedule new training session" },
    { title: "Message Trainees", icon: MessageCircle, description: "Send updates and feedback" },
    { title: "Generate Reports", icon: FileText, description: "Performance analytics" },
    { title: "Start Live Session", icon: PlayCircle, description: "Begin interactive training" }
  ];

  const upcomingSessions = [
    { title: "Advanced Moodle Integration", date: "Today, 2:00 PM", trainees: 8, duration: "2 hours" },
    { title: "Data Analytics Workshop", date: "Tomorrow, 10:00 AM", trainees: 12, duration: "3 hours" },
    { title: "Assessment Strategies", date: "Dec 15, 3:00 PM", trainees: 6, duration: "1.5 hours" },
    { title: "Digital Teaching Tools", date: "Dec 18, 1:00 PM", trainees: 15, duration: "2 hours" }
  ];

  const traineeProgress = [
    { name: "Alice Cooper", progress: 85, lastActivity: "2 hours ago", status: "On Track" },
    { name: "Bob Martinez", progress: 92, lastActivity: "1 day ago", status: "Excellent" },
    { name: "Carol Zhang", progress: 67, lastActivity: "3 days ago", status: "Needs Support" },
    { name: "David Kim", progress: 78, lastActivity: "1 hour ago", status: "Good Progress" }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Trainer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage training sessions and track trainee performance
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboards')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Selection
          </Button>
        </div>

        {/* Trainer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {trainerStats.map((stat, index) => (
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

          {/* Upcoming Sessions */}
          <Card className="bg-card-gradient border-border/20">
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div key={index} className="p-3 bg-background/20 rounded-lg border border-border/10">
                    <h4 className="font-medium">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">{session.date}</p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{session.trainees} trainees</span>
                      <span>{session.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainee Progress */}
        <Card className="bg-card-gradient border-border/20">
          <CardHeader>
            <CardTitle>Trainee Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {traineeProgress.map((trainee, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background/20 rounded-lg">
                  <div>
                    <p className="font-medium">{trainee.name}</p>
                    <p className="text-sm text-muted-foreground">Last activity: {trainee.lastActivity}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      <div className="w-20 h-2 bg-background/40 rounded-full mr-2">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${trainee.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{trainee.progress}%</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      trainee.status === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                      trainee.status === 'On Track' || trainee.status === 'Good Progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {trainee.status}
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

export default TrainerDashboard;