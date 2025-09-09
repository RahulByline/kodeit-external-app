import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle,
  BarChart3,
  Search,
  Filter,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  Star,
  FileText,
  Target,
  GraduationCap
} from 'lucide-react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import { moodleService } from '../../services/moodleApi';
import { useAuth } from '../../context/AuthContext';

interface CertificationStats {
  totalCertifications: number;
  activeCertifications: number;
  completedCertifications: number;
  completionRate: number;
  averageCompletionTime: number;
  newCertificationsThisMonth: number;
  certificationValue: number;
  topCertification: string;
}

interface CertificationProgram {
  programId: string;
  programName: string;
  category: string;
  totalEnrollments: number;
  completedCertifications: number;
  completionRate: number;
  averageScore: number;
  duration: number; // in days
  lastIssued: string;
}

interface IssuedCertificate {
  certificateId: string;
  recipientName: string;
  recipientRole: string;
  programName: string;
  issueDate: string;
  expiryDate: string;
  score: number;
  status: 'active' | 'expired' | 'pending';
  certificateUrl?: string;
}

const Certifications: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<CertificationStats>({
    totalCertifications: 0,
    activeCertifications: 0,
    completedCertifications: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    newCertificationsThisMonth: 0,
    certificationValue: 0,
    topCertification: ''
  });
  const [certificationPrograms, setCertificationPrograms] = useState<CertificationProgram[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');

  useEffect(() => {
    fetchCertificationData();
  }, []);

  const fetchCertificationData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Fetching real IOMAD certification data...');

      // Fetch real certification data from IOMAD Moodle
      const realCertificationData = await moodleService.getRealCertificationData();
      
      const { certificationPrograms: certificationProgramsData, issuedCertificates: issuedCertificatesData } = realCertificationData;

      console.log('📊 Real certification programs found:', certificationProgramsData.length);
      console.log('📊 Real issued certificates found:', issuedCertificatesData.length);

      // Calculate overall statistics from real data
      const totalCertifications = issuedCertificatesData.length;
      const activeCertifications = issuedCertificatesData.filter(cert => cert.status === 'active').length;
      const completedCertifications = issuedCertificatesData.filter(cert => cert.status === 'active').length;
      const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const newCertificationsThisMonth = issuedCertificatesData.filter(cert => 
        new Date(cert.issueDate).getTime() > oneMonthAgo
      ).length;

      // Find top certification program from real data
      const topProgram = certificationProgramsData.length > 0 ? 
        certificationProgramsData.reduce((prev, current) => 
          prev.completedCertifications > current.completedCertifications ? prev : current
        ) : { programName: 'No Programs Available' };

      // Calculate average completion time from real data
      const completionTimes = issuedCertificatesData.map(cert => {
        const issueDate = new Date(cert.issueDate);
        const now = new Date();
        return Math.floor((now.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      });
      
      const averageCompletionTime = completionTimes.length > 0 ? 
        Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length) : 60;

      setStats({
        totalCertifications,
        activeCertifications,
        completedCertifications,
        completionRate: totalCertifications > 0 ? Math.round((completedCertifications / totalCertifications) * 100) : 0,
        averageCompletionTime,
        newCertificationsThisMonth,
        certificationValue: Math.floor(totalCertifications * 150), // $150 per certification
        topCertification: topProgram.programName
      });

      setCertificationPrograms(certificationProgramsData);
      setIssuedCertificates(issuedCertificatesData.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));

    } catch (error) {
      console.error('Error fetching certification data from IOMAD API:', error);
      setError(`Failed to load certification data from IOMAD API: ${error.message || error}`);
      
      // Set empty data instead of mock data
      setStats({
        totalCertifications: 0,
        activeCertifications: 0,
        completedCertifications: 0,
        completionRate: 0,
        averageCompletionTime: 0,
        newCertificationsThisMonth: 0,
        certificationValue: 0,
        topCertification: 'No Certifications Available'
      });

      setCertificationPrograms([]);
      setIssuedCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = issuedCertificates.filter(certificate => {
    const matchesSearch = certificate.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certificate.programName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || certificate.status === filterStatus;
    const matchesProgram = filterProgram === 'all' || certificate.programName === filterProgram;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <AdminDashboardLayout userName={currentUser?.fullname || "Admin User"}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="text-gray-600">Loading certification data...</span>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout userName={currentUser?.fullname || "Admin User"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certification Management</h1>
            <p className="text-gray-600 mt-1">Track certification programs and issued certificates</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Certification Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Certifications</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCertifications.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+{stats.newCertificationsThisMonth}</span>
                  <span className="text-gray-500 text-sm ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Certifications</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeCertifications.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">{stats.completionRate}%</span>
                  <span className="text-gray-500 text-sm ml-1">completion rate</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Certification Value</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">${stats.certificationValue.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 text-sm font-medium">$150 each</span>
                  <span className="text-gray-500 text-sm ml-1">average value</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg Completion Time</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.averageCompletionTime} days</h3>
                <div className="flex items-center mt-2">
                  <Target className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600 text-sm font-medium">Top: {stats.topCertification}</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Certification Programs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Certification Programs</h2>
              <GraduationCap className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {certificationPrograms.map((program, index) => (
                <div key={program.programId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{program.programName}</h3>
                      <p className="text-xs text-gray-500">{program.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{program.completionRate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span>{program.totalEnrollments} enrolled</span>
                    <span>{program.completedCertifications} completed</span>
                    <span className={`font-medium ${getScoreColor(program.averageScore)}`}>
                      {program.averageScore}% avg score
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${program.completionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Duration: {program.duration} days</p>
                </div>
              ))}
            </div>
          </div>

          {/* Issued Certificates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Issued Certificates</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search recipients or programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredCertificates.slice(0, 10).map((certificate, index) => (
                <div key={certificate.certificateId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(certificate.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{certificate.recipientName}</p>
                      <p className="text-xs text-gray-500">{certificate.programName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                        {certificate.status}
                      </span>
                      <span className={`text-sm font-semibold ${getScoreColor(certificate.score)}`}>
                        {certificate.score}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Issued: {formatDate(certificate.issueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certification Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Certification Insights</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{certificationPrograms.length}</div>
              <div className="text-sm text-gray-600">Active Programs</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(stats.averageCompletionTime / 30)}</div>
              <div className="text-sm text-gray-600">Avg Months to Complete</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalCertifications / certificationPrograms.length)}</div>
              <div className="text-sm text-gray-600">Avg Certificates per Program</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">92%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default Certifications; 