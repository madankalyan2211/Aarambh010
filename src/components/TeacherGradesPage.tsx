import { useState, useEffect } from 'react';
import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from './ui/toast';
import { motion } from 'motion/react';
import { Download, TrendingUp, Award, Loader2, Trophy, Users, BookOpen, Calendar, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getTeacherGrades } from '../services/api.service';
import { Leaderboard } from './Leaderboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TeacherGradesPageProps {
  onNavigate: (page: Page) => void;
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

interface GradeData {
  assignments: AssignmentGrade[];
}

interface StudentLeaderboardEntry {
  id: string;
  name: string;
  email: string;
  totalScore: number;
  maxScore: number;
  averagePercentage: number;
  assignmentCount: number;
  rank: number;
}

export function TeacherGradesPage({ onNavigate }: TeacherGradesPageProps) {
  const { showToast } = useToast();
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchGrades();
  }, []);
  
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await getTeacherGrades();
      
      if (response.success) {
        setGradeData({ assignments: response.data });
      } else {
        showToast('error', 'Failed to load grades', response.message);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      showToast('error', 'Error', 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate student leaderboard data
  const generateStudentLeaderboard = (): StudentLeaderboardEntry[] => {
    if (!gradeData) return [];
    
    // Create a map of students with their scores
    const studentMap: Record<string, {
      id: string;
      name: string;
      email: string;
      totalScore: number;
      maxScore: number;
      assignmentCount: number;
    }> = {};
    
    // Process all submissions
    gradeData.assignments.forEach(assignment => {
      assignment.submissions.forEach(submission => {
        if (submission.status === 'graded' && submission.score !== null) {
          const studentId = submission.student.id;
          
          if (!studentMap[studentId]) {
            studentMap[studentId] = {
              id: studentId,
              name: submission.student.name,
              email: submission.student.email,
              totalScore: 0,
              maxScore: 0,
              assignmentCount: 0
            };
          }
          
          studentMap[studentId].totalScore += submission.score;
          studentMap[studentId].maxScore += 100; // Assuming 100 points per assignment
          studentMap[studentId].assignmentCount += 1;
        }
      });
    });
    
    // Convert to array and calculate percentages
    const leaderboard: StudentLeaderboardEntry[] = Object.values(studentMap)
      .map(student => ({
        ...student,
        averagePercentage: student.maxScore > 0 
          ? Math.round((student.totalScore / student.maxScore) * 100)
          : 0,
        rank: 0 // Will be set after sorting
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));
    
    return leaderboard;
  };
  
  const studentLeaderboard = generateStudentLeaderboard();
  
  // Prepare data for charts
  const assignmentData = gradeData?.assignments.map(assignment => ({
    name: assignment.title.length > 20 ? assignment.title.substring(0, 20) + '...' : assignment.title,
    submissions: assignment.totalSubmissions,
    graded: assignment.gradedSubmissions,
    averageScore: assignment.averageScore
  })) || [];
  
  const gradeDistributionData = [
    { name: 'A (90-100)', value: studentLeaderboard.filter(s => s.averagePercentage >= 90).length },
    { name: 'B (80-89)', value: studentLeaderboard.filter(s => s.averagePercentage >= 80 && s.averagePercentage < 90).length },
    { name: 'C (70-79)', value: studentLeaderboard.filter(s => s.averagePercentage >= 70 && s.averagePercentage < 80).length },
    { name: 'D (60-69)', value: studentLeaderboard.filter(s => s.averagePercentage >= 60 && s.averagePercentage < 70).length },
    { name: 'F (<60)', value: studentLeaderboard.filter(s => s.averagePercentage < 60).length },
  ];
  
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];
  
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading grades data...</p>
        </div>
      </div>
    );
  }
  
  if (!gradeData || gradeData.assignments.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="mb-2">No Grades Data Available</h3>
          <p className="text-muted-foreground">
            You don't have any assignments or submissions yet.
          </p>
          <Button 
            className="mt-4 bg-primary hover:bg-accent"
            onClick={() => onNavigate('assignment')}
          >
            Create Assignment
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1>Classroom Grades Dashboard</h1>
              <p className="text-muted-foreground">Track and analyze your students' performance</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assignments</p>
                <p className="text-xl font-bold">{gradeData.assignments.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-xl font-bold">{studentLeaderboard.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-xl font-bold">
                  {gradeData.assignments.length > 0 
                    ? Math.round(gradeData.assignments.reduce((sum, a) => sum + a.averageScore, 0) / gradeData.assignments.length)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Top Student</p>
                <p className="text-xl font-bold truncate">
                  {studentLeaderboard.length > 0 ? studentLeaderboard[0].name : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-4">🏆 Student Leaderboard</h2>
              <Card className="p-4">
                {studentLeaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {studentLeaderboard.slice(0, 10).map((student) => (
                      <div 
                        key={student.id} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            student.rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                            student.rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' :
                            student.rank === 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' :
                            'bg-secondary'
                          }`}>
                            {student.rank <= 3 ? (
                              student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'
                            ) : (
                              student.rank
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge 
                            className={
                              student.averagePercentage >= 90 ? 'bg-green-500' : 
                              student.averagePercentage >= 80 ? 'bg-blue-500' : 
                              student.averagePercentage >= 70 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }
                          >
                            {student.averagePercentage >= 90 ? 'A' : 
                             student.averagePercentage >= 80 ? 'B' : 
                             student.averagePercentage >= 70 ? 'C' : 'D'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No student data available for leaderboard</p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Assignments Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="mb-4">📝 Assignments Overview</h2>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead className="text-right">Submissions</TableHead>
                      <TableHead className="text-right">Graded</TableHead>
                      <TableHead className="text-right">Avg. Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradeData.assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="min-w-0">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{assignment.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {assignment.course?.name || 'No Course'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right min-w-0">
                          <span className="truncate">{assignment.totalSubmissions}</span>
                        </TableCell>
                        <TableCell className="text-right min-w-0">
                          <span className="truncate">{assignment.gradedSubmissions}</span>
                        </TableCell>
                        <TableCell className="text-right min-w-0">
                          <span className="truncate">{assignment.averageScore}%</span>
                        </TableCell>
                        <TableCell className="text-right min-w-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                              >
                                View Details
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                              <DropdownMenuItem className="flex flex-col items-start p-3">
                                <div className="flex justify-between w-full mb-2">
                                  <span className="text-muted-foreground">Submitted:</span>
                                  <span className="font-bold">{assignment.totalSubmissions}</span>
                                </div>
                                <div className="flex justify-between w-full mb-2">
                                  <span className="text-muted-foreground">Graded:</span>
                                  <span className="font-bold">{assignment.gradedSubmissions}</span>
                                </div>
                                <div className="flex justify-between w-full">
                                  <span className="text-muted-foreground">Pending:</span>
                                  <span className="font-bold">{assignment.pendingSubmissions}</span>
                                </div>
                                <div className="flex justify-between w-full mt-2 pt-2 border-t">
                                  <span className="text-muted-foreground">Avg Score:</span>
                                  <span className="font-bold">{assignment.averageScore}%</span>
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            {/* Grade Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="mb-4">📊 Grade Distribution</h2>
              <Card className="p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={gradeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={false}
                    >
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Assignment Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="mb-4">📈 Assignment Performance</h2>
              <Card className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assignmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      tickMargin={10}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      position={{ x: 0, y: 0 }}
                      offset={20}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Bar dataKey="averageScore" fill="var(--color-chart-1)" name="Average Score (%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Quick Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="mb-4">💡 Quick Insights</h2>
              <Card className="p-4 space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ <strong>High Performers:</strong> {studentLeaderboard.filter(s => s.averagePercentage >= 90).length} students scoring 90%+
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    📚 <strong>Assignment Completion:</strong> {gradeData.assignments.length > 0 
                      ? Math.round((gradeData.assignments.reduce((sum, a) => sum + a.gradedSubmissions, 0) / 
                         gradeData.assignments.reduce((sum, a) => sum + a.totalSubmissions, 0)) * 100)
                      : 0}% submission rate
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    🎯 <strong>Class Average:</strong> {studentLeaderboard.length > 0 
                      ? Math.round(studentLeaderboard.reduce((sum, s) => sum + s.averagePercentage, 0) / studentLeaderboard.length)
                      : 0}% overall performance
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      

    </div>
  );
}
