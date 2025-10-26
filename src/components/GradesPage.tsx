import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from './ui/toast';
import { motion } from 'motion/react';
import { Download, TrendingUp, Award, Loader2 } from 'lucide-react';
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getStudentGrades } from '../services/api.service';

interface GradesPageProps {
  onNavigate: (page: Page) => void;
}

interface Grade {
  id: string;
  assignment: string;
  course: {
    id: string;
    name: string;
    category: string;
  };
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
  letterGrade: string;
  feedback: string;
  gradedAt: string;
  assignmentId: string;
}

interface GradeStatistics {
  totalAssignments: number;
  totalPoints: number;
  maxPoints: number;
  overallPercentage: number;
  overallLetterGrade: string;
  gradeDistribution: {
    'A+': number;
    'A': number;
    'A-': number;
    'B+': number;
    'B': number;
    'B-': number;
    'C+': number;
    'C': number;
    'C-': number;
    'D': number;
    'F': number;
  };
}

interface GradeData {
  grades: Grade[];
  statistics: GradeStatistics;
}

export function GradesPage({ onNavigate }: GradesPageProps) {
  const { showToast } = useToast();
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatIfScores, setWhatIfScores] = useState<Record<string, number>>({});
  
  useEffect(() => {
    fetchGrades();
  }, []);
  
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await getStudentGrades();
      
      if (response.success) {
        setGradeData(response.data);
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
  
  const calculateWeightedAverage = () => {
    if (!gradeData) return '0';
    
    let totalScore = 0;
    let totalWeight = 0;
    
    gradeData.grades.forEach((grade) => {
      const score = whatIfScores[grade.assignment] || grade.percentage;
      totalScore += score * grade.weight;
      totalWeight += grade.weight;
    });
    
    return totalWeight > 0 ? (totalScore / totalWeight).toFixed(1) : '0';
  };
  
  const currentAverage = calculateWeightedAverage();
  
  // Prepare data for charts
  const scoreData = gradeData?.grades.map(grade => ({
    name: grade.assignment.length > 15 ? grade.assignment.substring(0, 15) + '...' : grade.assignment,
    score: grade.percentage
  })) || [];
  
  const skillsData = [
    { skill: 'Theory', score: 90 },
    { skill: 'Coding', score: 85 },
    { skill: 'Analysis', score: 88 },
    { skill: 'Documentation', score: 82 },
    { skill: 'Creativity', score: 91 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your grades...</p>
        </div>
      </div>
    );
  }
  
  if (!gradeData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="mb-2">No Grades Available</h3>
          <p className="text-muted-foreground">
            You don't have any graded assignments yet.
          </p>
        </div>
      </div>
    );
  }
  
  const overallPercentage = gradeData.statistics.overallPercentage;
  const overallLetterGrade = gradeData.statistics.overallLetterGrade;

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1>My Grades</h1>
              <p className="text-muted-foreground">Track your academic performance</p>
            </div>
          </div>
        </motion.div>

        {/* Current Grade Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-6 w-6 text-primary flex-shrink-0" />
                <h2 className="flex-shrink-0">Current Grade</h2>
              </div>
              <div className="text-6xl mb-2 font-bold">{currentAverage}%</div>
              <Badge className="bg-primary text-white text-lg px-4 py-1">
                {parseFloat(currentAverage) >= 90 ? 'A' : parseFloat(currentAverage) >= 80 ? 'B' : 'C'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-4">
                You're performing excellently! Keep up the great work.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Grades Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grades Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-4">Assignment Grades</h2>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead className="text-right">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradeData?.grades.map((grade, index) => (
                      <TableRow key={grade.id}>
                        <TableCell className="min-w-0">
                          <span className="truncate">{grade.assignment}</span>
                        </TableCell>
                        <TableCell className="text-right min-w-0">
                          <span className="truncate">{grade.percentage}%</span>
                        </TableCell>
                        <TableCell className="text-right min-w-0">
                          <span className="truncate">{grade.weight}</span>
                        </TableCell>
                        <TableCell className="text-right min-w-0">
                          <Badge className="bg-primary text-white truncate">{grade.letterGrade}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>

            {/* Score Analytics - Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="mb-4">Score Breakdown</h2>
              <Card className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreData}>
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
                    <Bar dataKey="score" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Analytics & What-If */}
          <div className="space-y-6">
            {/* Skills Radar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="mb-4">Skills Analysis</h2>
              <Card className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={skillsData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="var(--color-chart-1)"
                      fill="var(--color-chart-1)"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Smart Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2>Smart Insights</h2>
              </div>
              <Card className="p-4 space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ <strong>Strong Performance:</strong> You excel in Creativity and Theory
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    💡 <strong>Growth Area:</strong> Focus on improving Documentation skills
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    📈 <strong>Trend:</strong> Your scores have improved by 8% this month
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* What-If Analyzer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="mb-4">What-If Analyzer</h2>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Simulate grade changes to see their impact on your overall score
                </p>
                <div className="space-y-3">
                  {gradeData?.grades.slice(0, 3).map((grade) => (
                    <div key={grade.id} className="space-y-1">
                      <Label className="text-xs">{grade.assignment}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder={grade.percentage.toString()}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            setWhatIfScores((prev) => ({
                              ...prev,
                              [grade.assignment]: value,
                            }));
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm min-w-0 truncate">Projected Grade:</span>
                    <span className="text-lg text-primary font-bold">{calculateWeightedAverage()}%</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setWhatIfScores({})}
                >
                  Reset
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
