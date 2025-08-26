import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Code, 
  Play, 
  Target, 
  Users, 
  Award,
  BarChart3,
  FileText,
  Calendar,
  Settings,
  Zap,
  Star,
  Heart,
  Shield,
  Lightbulb
} from 'lucide-react';

interface DashboardComparisonProps {
  currentGrade?: number;
  currentDashboardType?: string;
  detectedCohort?: string;
}

const DashboardComparison: React.FC<DashboardComparisonProps> = ({
  currentGrade,
  currentDashboardType,
  detectedCohort
}) => {
  const dashboardTypes = [
    {
      type: 'G1_G3',
      name: 'Early Elementary (G1-G3)',
      ageRange: '6-9 years',
      description: 'Simplified, visual, interactive learning',
      features: [
        { icon: Heart, text: 'Large, colorful buttons', color: 'text-pink-600' },
        { icon: Star, text: 'Visual progress tracking', color: 'text-yellow-600' },
        { icon: Play, text: 'Simple games and activities', color: 'text-green-600' },
        { icon: Shield, text: 'No complex programming', color: 'text-blue-600' },
        { icon: Lightbulb, text: 'Basic digital literacy', color: 'text-purple-600' }
      ],
      content: [
        'Simple drag-and-drop activities',
        'Picture-based learning materials',
        'Basic computer skills',
        'Creative storytelling',
        'Simple math and logic games'
      ],
      restrictions: [
        'No advanced programming concepts',
        'No complex algorithms',
        'No database or API content',
        'No debugging tools'
      ]
    },
    {
      type: 'G4_G7',
      name: 'Upper Elementary (G4-G7)',
      ageRange: '10-13 years',
      description: 'Intermediate learning with programming basics',
      features: [
        { icon: Code, text: 'Basic programming concepts', color: 'text-blue-600' },
        { icon: Target, text: 'Structured learning paths', color: 'text-green-600' },
        { icon: BarChart3, text: 'Progress analytics', color: 'text-purple-600' },
        { icon: FileText, text: 'Mixed content types', color: 'text-orange-600' },
        { icon: Users, text: 'Collaborative learning', color: 'text-indigo-600' }
      ],
      content: [
        'Introduction to coding blocks',
        'Simple programming projects',
        'Basic web development',
        'Digital citizenship',
        'Problem-solving activities'
      ],
      restrictions: [
        'No very advanced programming',
        'No complex system design',
        'No professional development tools'
      ]
    },
    {
      type: 'G8_PLUS',
      name: 'High School & Above (G8+)',
      ageRange: '14+ years',
      description: 'Full-featured learning environment',
      features: [
        { icon: Zap, text: 'Advanced programming tools', color: 'text-red-600' },
        { icon: Settings, text: 'Professional development', color: 'text-gray-600' },
        { icon: Award, text: 'Complex projects', color: 'text-yellow-600' },
        { icon: Calendar, text: 'Advanced scheduling', color: 'text-blue-600' },
        { icon: BookOpen, text: 'Comprehensive curriculum', color: 'text-green-600' }
      ],
      content: [
        'Advanced programming languages',
        'Database and API development',
        'System architecture',
        'Professional tools and frameworks',
        'Real-world project development'
      ],
      restrictions: [
        'No content restrictions',
        'Full access to all features',
        'Professional development tools'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Current Dashboard Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                Grade {currentGrade || 'Unknown'}
              </Badge>
              <p className="text-xs text-gray-600 mt-1">Detected Grade</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                {currentDashboardType || 'Unknown'}
              </Badge>
              <p className="text-xs text-gray-600 mt-1">Dashboard Type</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                {detectedCohort || 'Unknown'}
              </Badge>
              <p className="text-xs text-gray-600 mt-1">Cohort</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {dashboardTypes.map((dashboard) => (
          <Card 
            key={dashboard.type}
            className={`${
              currentDashboardType === dashboard.type 
                ? 'border-2 border-green-500 bg-green-50' 
                : 'border border-gray-200'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                {currentDashboardType === dashboard.type && (
                  <Badge className="bg-green-600">Current</Badge>
                )}
              </div>
              <CardDescription>
                {dashboard.ageRange} • {dashboard.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Key Features:</h4>
                <div className="space-y-2">
                  {dashboard.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <feature.icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Content Includes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {dashboard.content.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Restrictions */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Content Restrictions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {dashboard.restrictions.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Testing Instructions */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span>Testing Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">To test different grade levels:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-700">G1-G3 Students:</p>
                  <p className="text-gray-600">user1, user2, user3, student1</p>
                </div>
                <div>
                  <p className="font-medium text-blue-700">G4-G7 Students:</p>
                  <p className="text-gray-600">user4, user5, user6, user7</p>
                </div>
                <div>
                  <p className="font-medium text-purple-700">G8+ Students:</p>
                  <p className="text-gray-600">user8, user9, user10, user11</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Expected Behavior:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• G1-G3 students should see simplified, visual dashboard</li>
                <li>• G4-G7 students should see intermediate dashboard with basic programming</li>
                <li>• G8+ students should see full-featured dashboard with advanced tools</li>
                <li>• Content should be filtered based on grade level</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardComparison;
