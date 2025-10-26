import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import { BookOpen, Users, ClipboardList, TrendingUp, BarChart3, LineChart, Bot, AlertTriangle, CheckCircle, Loader2, Send } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generateTeacherQuote, getCachedQuote, cacheQuote } from '../services/ai.service';
import { useState, useEffect } from 'react';
import { getTeacherGrades, getTeachingCourses, createAnnouncement } from '../services/api.service';
import { useToast } from './ui/toast';

interface TeacherDashboardProps {
  onNavigate: (page: Page) => void;
  userName?: string; // Add userName prop
  userEmail?: string; // Add userEmail prop
}

interface AssignmentGrade {
  id: string;
  title: string;
  course: {
    id: string;
    name: string;
  } | null;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  averageScore: number;
  submissions: {
    id: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
    score: number | null;
    status: string;
    submittedAt: string;
    gradedAt: string | null;
  }[];
}

interface StudentScore {
  total: number;
  count: number;
}

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  averageScore: number;
}

interface PerformanceMetrics {
  predictedPassRate: number;
  atRiskStudents: number;
  highPerformers: number;
  averageScore: number;
  submissionRate: number;
  trendingUp: boolean;
}

interface StudentPerformanceData {
  name: string;
  value: number;
  color: string;
}

export function TeacherDashboard({ onNavigate, userName = 'Professor', userEmail = '' }: TeacherDashboardProps) {
  const { showToast } = useToast();
  const [motivationalQuote, setMotivationalQuote] = useState(
    "Great teachers inspire! 🌟 Your impact is immeasurable."
  );
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
  const [studentPerformanceData, setStudentPerformanceData] = useState<StudentPerformanceData[]>([]);
  const [loadingPerformance, setLoadingPerformance] = useState(true);
  const [atRiskStudents, setAtRiskStudents] = useState<StudentDetail[]>([]);
  const [onTrackStudents, setOnTrackStudents] = useState<StudentDetail[]>([]);
  const [gradeData, setGradeData] = useState<{ assignments: AssignmentGrade[] } | null>(null);

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);

  // Generate AI-powered motivational quote on mount
  useEffect(() => {
    const loadQuote = async () => {
      // Check if we have a cached quote for this session
      const cached = getCachedQuote('teacher');
      if (cached) {
        setMotivationalQuote(cached);
        return;
      }

      // Generate new quote
      setIsLoadingQuote(true);
      try {
        const quote = await generateTeacherQuote(userName);
        setMotivationalQuote(quote);
        cacheQuote('teacher', quote);
      } catch (error) {
        console.error('Error loading quote:', error);
        // Keep default quote on error
      } finally {
        setIsLoadingQuote(false);
      }
    };

    loadQuote();
  }, [userName]); // Re-generate when userName changes

  // Fetch performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoadingPerformance(true);
      try {
        const response = await getTeacherGrades();
        
        if (response.success) {
          const data = { assignments: response.data };
          setGradeData(data);
          
          // Calculate performance metrics
          let totalSubmissions = 0;
          let gradedSubmissions = 0;
          let totalScore = 0;
          let gradedCount = 0;
          const studentScores: Record<string, StudentScore & { name: string; email: string }> = {};
          
          data.assignments.forEach((assignment: AssignmentGrade) => {
            totalSubmissions += assignment.totalSubmissions;
            gradedSubmissions += assignment.gradedSubmissions;
            
            assignment.submissions.forEach((submission: AssignmentGrade['submissions'][0]) => {
              if (submission.score !== null) {
                totalScore += submission.score;
                gradedCount++;
                
                // Track student performance
                const studentId = submission.student.id;
                if (!studentScores[studentId]) {
                  studentScores[studentId] = { 
                    total: 0, 
                    count: 0,
                    name: submission.student.name,
                    email: submission.student.email
                  };
                }
                studentScores[studentId].total += submission.score;
                studentScores[studentId].count += 1;
              }
            });
          });
          
          // Calculate at-risk and high-performing students
          let atRiskStudentsList: StudentDetail[] = [];
          let onTrackStudentsList: StudentDetail[] = [];
          
          Object.entries(studentScores).forEach(([studentId, studentData]) => {
            const average = studentData.total / studentData.count;
            const studentDetail: StudentDetail = {
              id: studentId,
              name: studentData.name,
              email: studentData.email,
              averageScore: Math.round(average)
            };
            
            if (average < 60) {
              atRiskStudentsList.push(studentDetail);
            } else if (average >= 75) {
              onTrackStudentsList.push(studentDetail);
            }
          });
          
          // Sort students by average score
          atRiskStudentsList.sort((a, b) => a.averageScore - b.averageScore);
          onTrackStudentsList.sort((a, b) => b.averageScore - a.averageScore);
          
          // Limit to top 5 students in each category for display
          setAtRiskStudents(atRiskStudentsList.slice(0, 5));
          setOnTrackStudents(onTrackStudentsList.slice(0, 5));
          
          // Calculate performance metrics
          const atRiskCount = atRiskStudentsList.length;
          const highPerformersCount = onTrackStudentsList.length;
          
          // Prepare performance data
          const performanceMetrics: PerformanceMetrics = {
            predictedPassRate: gradedCount > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0,
            atRiskStudents: atRiskCount,
            highPerformers: highPerformersCount,
            averageScore: gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0,
            submissionRate: totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0,
            trendingUp: true // Simplified for now
          };
          
          setPerformanceData(performanceMetrics);
          
          // Prepare student performance distribution data
          const distributionData: StudentPerformanceData[] = [
            { name: 'Excellent (90-100)', value: onTrackStudentsList.filter(s => s.averageScore >= 90).length, color: '#10B981' },
            { name: 'Good (75-89)', value: onTrackStudentsList.filter(s => s.averageScore >= 75 && s.averageScore < 90).length, color: '#3B82F6' },
            { name: 'Average (60-74)', value: Object.values(studentScores).filter(s => {
              const avg = s.total / s.count;
              return avg >= 60 && avg < 75;
            }).length, color: '#F59E0B' },
            { name: 'Needs Help (<60)', value: atRiskCount, color: '#EF4444' },
          ];
          
          setStudentPerformanceData(distributionData);
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoadingPerformance(false);
      }
    };

    fetchPerformanceData();
  }, []);

  // Fetch teacher's courses
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await getTeachingCourses();
        if (response.success) {
          setTeacherCourses(response.data);
        }
      } catch (error) {
        console.error('Error fetching teacher courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchTeacherCourses();
  }, []);

  // Handle announcement submission
  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      showToast('error', 'Validation Error', 'Please provide both title and content for the announcement');
      return;
    }

    setIsSendingAnnouncement(true);
    try {
      // For now, we'll send to all students of this teacher
      // In a more advanced implementation, we could allow selecting specific courses
      const response = await createAnnouncement({
        title: announcementTitle,
        content: announcementContent,
        targetAudience: 'students',
        priority: 'medium',
      });

      if (response.success) {
        showToast('success', 'Success', 'Announcement sent successfully');
        setAnnouncementTitle('');
        setAnnouncementContent('');
      } else {
        showToast('error', 'Error', response.message || 'Failed to send announcement');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      showToast('error', 'Error', 'Failed to send announcement');
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  // Mock data for engagement chart (in a real app, this would come from the backend)
  const engagementData = [
    { name: 'Mon', engagement: 75 },
    { name: 'Tue', engagement: 82 },
    { name: 'Wed', engagement: 68 },
    { name: 'Thu', engagement: 88 },
    { name: 'Fri', engagement: 91 },
    { name: 'Sat', engagement: 45 },
    { name: 'Sun', engagement: 38 },
  ];

  // Mock data for performance trend chart (in a real app, this would come from the backend)
  const performanceTrendData = [
    { name: 'Week 1', score: 72 },
    { name: 'Week 2', score: 78 },
    { name: 'Week 3', score: 75 },
    { name: 'Week 4', score: 85 },
    { name: 'Week 5', score: 88 },
    { name: 'Week 6', score: 92 },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1>Welcome, {userName}! 👨‍🏫</h1>
          <p className="text-muted-foreground">Manage your courses and track student progress</p>
        </div>

        {/* Motivational Quote - AI Generated */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30 relative overflow-hidden">
            {isLoadingQuote && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
            <div className="flex items-center gap-2 justify-center">
              <Bot className="h-4 w-4 text-primary" />
              <p className="text-center text-lg">{motivationalQuote}</p>
            </div>
          </Card>
        </motion.div>

        {/* Performance Predictor */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 h-full">
              <div className="flex items-start justify-between h-full flex-col">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3>Performance Predictor</h3>
                  </div>
                  
                  {loadingPerformance ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading performance data...</span>
                    </div>
                  ) : performanceData ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/10 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{performanceData.predictedPassRate}%</div>
                          <div className="text-xs text-muted-foreground">Predicted Pass Rate</div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-green-500 flex items-center">
                              {performanceData.trendingUp ? '↑' : '↓'} 5% from last month
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-white/10 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-500">{performanceData.atRiskStudents}</div>
                          <div className="text-xs text-muted-foreground">At-Risk Students</div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-red-500 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Requires attention
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Assignment Submission Rate</span>
                          <Badge className="bg-primary text-white">{performanceData.submissionRate}%</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average Assignment Score</span>
                          <Badge variant="outline" className="border-accent text-accent">{performanceData.averageScore}%</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">High Performers</span>
                          <Badge className="bg-green-500 text-white">{performanceData.highPerformers}</Badge>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-4 bg-primary hover:bg-accent"
                        onClick={() => onNavigate('grades')}
                      >
                        View Detailed Analytics
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No performance data available</p>
                      <Button 
                        className="mt-4 bg-primary hover:bg-accent"
                        onClick={() => onNavigate('assignment')}
                      >
                        Create Assignment
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 h-full">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3>Student Performance Distribution</h3>
              </div>
              
              {loadingPerformance ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : studentPerformanceData.length > 0 ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentPerformanceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name }) => name}
                        >
                          {studentPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} students`, 'Count']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Student Details Section */}
                  <div className="mt-4 space-y-4">
                    {/* At-Risk Students */}
                    <div>
                      <div className="flex items-center text-sm mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="font-medium">Needs Support ({atRiskStudents.length})</span>
                      </div>
                      {atRiskStudents.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {atRiskStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between text-xs p-2 bg-red-500/10 rounded">
                              <span className="truncate">{student.name}</span>
                              <Badge variant="destructive" className="text-xs">
                                {student.averageScore}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No at-risk students</p>
                      )}
                    </div>
                    
                    {/* On Track Students */}
                    <div>
                      <div className="flex items-center text-sm mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="font-medium">On Track ({onTrackStudents.length})</span>
                      </div>
                      {onTrackStudents.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {onTrackStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between text-xs p-2 bg-green-500/10 rounded">
                              <span className="truncate">{student.name}</span>
                              <Badge className="bg-green-500 text-white text-xs">
                                {student.averageScore}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No students on track</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No student performance data available</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Courses & Announcements */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2>My Courses</h2>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('course')}>
                  View All
                </Button>
              </div>
              <div className="grid gap-4">
                {loadingCourses ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading courses...</span>
                  </div>
                ) : teacherCourses.length > 0 ? (
                  teacherCourses.map((course: any, index: number) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        className="p-4 cursor-pointer hover:shadow-lg transition-all border-secondary"
                        onClick={() => onNavigate('course')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-sm">{course.name}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {course.enrolledCount} students
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="mb-2">No Courses Found</h3>
                    <p className="text-muted-foreground mb-4">
                      You are not currently teaching any courses.
                    </p>
                    <Button onClick={() => onNavigate('course')}>
                      Browse Courses
                    </Button>
                  </Card>
                )}
              </div>
            </motion.div>

            {/* Insights Board */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="mb-4">Insights Board</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Assignment Submission Rate */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="text-sm">Submission Rate</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={gradeData ? gradeData.assignments.map(assignment => ({
                      name: assignment.title.length > 15 ? assignment.title.substring(0, 15) + '...' : assignment.title,
                      rate: assignment.totalSubmissions > 0 
                        ? Math.round((assignment.gradedSubmissions / assignment.totalSubmissions) * 100) 
                        : 0
                    })) : []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Rate']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="rate" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Student Performance Trend */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <LineChart className="h-5 w-5 text-primary" />
                    <h3 className="text-sm">Class Performance</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsLine data={performanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Score']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-chart-1)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-chart-1)', r: 4 }}
                      />
                    </RechartsLine>
                  </ResponsiveContainer>
                </Card>

                {/* Course Enrollment Distribution */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-sm">Students per Course</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={teacherCourses.map(course => ({
                      name: course.name.length > 15 ? course.name.substring(0, 15) + '...' : course.name,
                      students: course.enrolledCount
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        formatter={(value) => [value, 'Students']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="students" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Assignment Grading Progress */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h3 className="text-sm">Grading Progress</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={gradeData ? gradeData.assignments.map(assignment => ({
                      name: assignment.title.length > 15 ? assignment.title.substring(0, 15) + '...' : assignment.title,
                      pending: assignment.pendingSubmissions,
                      completed: assignment.gradedSubmissions
                    })).slice(0, 5) : []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} name="Graded" />
                      <Bar dataKey="pending" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Announcements Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="mb-4">Create Announcement</h2>
            <Card className="p-4">
              <div className="space-y-4">
                <Input
                  placeholder="Announcement title..."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full"
                />
                <Textarea
                  placeholder="Share updates with your students..."
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-primary hover:bg-accent flex items-center gap-2"
                    onClick={handleSendAnnouncement}
                    disabled={isSendingAnnouncement || !announcementTitle.trim() || !announcementContent.trim()}
                  >
                    {isSendingAnnouncement ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSendingAnnouncement ? 'Sending...' : 'Send Announcement'}
                  </Button>
                  <Button variant="outline" disabled={isSendingAnnouncement}>
                    Save Draft
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-4 mt-6">
              <h3 className="mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Students</span>
                  <span className="text-xl">
                    {gradeData ? gradeData.assignments.reduce((total, assignment) => 
                      total + assignment.submissions.filter(s => s.status === 'graded').length, 0) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Courses</span>
                  <span className="text-xl">{teacherCourses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Reviews</span>
                  <Badge className="bg-accent text-white">
                    {gradeData ? gradeData.assignments.reduce((total, assignment) => 
                      total + assignment.pendingSubmissions, 0) : 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Score</span>
                  <span className="text-xl text-primary">
                    {performanceData ? `${performanceData.averageScore}%` : '0%'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}