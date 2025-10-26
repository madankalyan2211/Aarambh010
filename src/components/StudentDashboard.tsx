import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import { BookOpen, Clock, Award, TrendingUp, Flame, Bot, Loader2, ChevronDown, ChevronUp, Brain, Users, Search } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCourseById, getTeacherById } from '../data/mockData';
import { generateStudentQuote, getCachedQuote, cacheQuote } from '../services/ai.service';
import { getEnrolledCourses, getAnnouncements, getStudentAssignments, getStudentGrades, getCurrentUser, getAnnouncement, getAllTeachers, getPublicCoursesAPI } from '../services/api.service';
import { useState, useEffect } from 'react';

interface StudentDashboardProps {
  onNavigate: (page: Page) => void;
  userName?: string; // Add userName prop
  userEmail?: string; // Add userEmail prop for filtering assignments
}

interface Course {
  id: number;
  title: string;
  progress: number;
  image: string;
  nextLesson: string;
  difficulty?: string;
  name?: string;
  totalLessons?: number;
  instructor?: {
    name: string;
  };
}

interface Announcement {
  id: string;
  title: string;
  content?: string;
  time: string;
  author?: string;
}

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  teacherId: string;
  dueDate: string;
  daysLeft: number;
  urgent: boolean;
  description: string;
  createdAt: string;
  course?: {
    name: string;
  };
  teacher?: {
    name: string;
  };
}

interface Grade {
  assignment: string;
  score: string;
  grade: string;
  percentage?: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  studentCount: number;
  courseCount: number;
  teachingCourses: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    tags: string[];
  }>;
}

export function StudentDashboard({ onNavigate, userName = 'Student', userEmail = '' }: StudentDashboardProps) {
  const [motivationalQuote, setMotivationalQuote] = useState(
    "Every expert was once a beginner. Keep learning! 📚"
  );
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [learningStreak, setLearningStreak] = useState(0);
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loadingCoursesPublic, setLoadingCoursesPublic] = useState(true);

  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());

  // Fetch enrolled courses from backend
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await getEnrolledCourses();
        console.log('📚 Enrolled courses response:', response);
        
        if (response.success && response.data) {
          setEnrolledCourses(response.data);
        } else {
          console.error('❌ Failed to fetch enrolled courses:', response.message);
          // Handle rate limiting error specifically
          if (response.message.includes('Too many requests') || response.message.includes('rate limit')) {
            console.log('Rate limit exceeded for courses');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching enrolled courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoadingAnnouncements(true);
      try {
        const response = await getAnnouncements();
        console.log('📢 Announcements response:', response);
        
        if (response.success && response.data) {
          // Format announcements for display
          const formattedAnnouncements = response.data.map((announcement: any) => ({
            id: announcement._id,
            title: announcement.title,
            content: announcement.content,
            time: new Date(announcement.createdAt).toLocaleDateString(),
            author: announcement.author?.name || 'Unknown Author',
          }));
          setAnnouncements(formattedAnnouncements);
        } else {
          console.error('❌ Failed to fetch announcements:', response.message);
          // Handle rate limiting error specifically
          if (response.message.includes('Too many requests') || response.message.includes('rate limit')) {
            console.log('Rate limit exceeded for announcements');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching announcements:', error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Fetch assignments from backend
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const response = await getStudentAssignments();
        console.log('📝 Assignments response:', response);
        
        if (response.success && response.data) {
          setAssignments(response.data);
        } else {
          console.error('❌ Failed to fetch assignments:', response.message);
          // Handle rate limiting error specifically
          if (response.message.includes('Too many requests') || response.message.includes('rate limit')) {
            console.log('Rate limit exceeded for assignments');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching assignments:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, []);

  // Fetch grades from backend
  useEffect(() => {
    const fetchGrades = async () => {
      setLoadingGrades(true);
      try {
        const response = await getStudentGrades();
        console.log('📊 Grades response:', response);
        
        if (response.success && response.data) {
          // Format grades for display
          const formattedGrades = response.data.grades.slice(0, 3).map((grade: any) => ({
            assignment: grade.assignment.title,
            score: `${grade.percentage}%`,
            grade: grade.letterGrade,
            percentage: grade.percentage,
          }));
          setGrades(formattedGrades);
          
          // Set learning streak from user data
          // For now, we'll use a placeholder value
          // In a real implementation, this would come from the user's profile
          setLearningStreak(14);
        } else {
          console.error('❌ Failed to fetch grades:', response.message);
          // Handle rate limiting error specifically
          if (response.message.includes('Too many requests') || response.message.includes('rate limit')) {
            // We could show a specific message to the user about rate limiting
            console.log('Rate limit exceeded, using default values');
          }
          // Still set a default streak value even on error
          setLearningStreak(14);
        }
      } catch (error) {
        console.error('❌ Error fetching grades:', error);
        // Set default streak value on error
        setLearningStreak(14);
      } finally {
        setLoadingGrades(false);
      }
    };

    fetchGrades();
  }, []);

  // Handle learning streak loading state
  useEffect(() => {
    // Fetch learning streak data from user profile
    const fetchLearningStreak = async () => {
      setLoadingStreak(true);
      try {
        const response = await getCurrentUser();
        console.log('👤 User profile response:', response);
        
        if (response.success && response.data) {
          // Set learning streak from user profile
          setLearningStreak(response.data.learningStreak || 0);
        } else {
          console.error('❌ Failed to fetch user profile:', response.message);
          // Handle rate limiting error specifically
          if (response.message.includes('Too many requests') || response.message.includes('rate limit')) {
            console.log('Rate limit exceeded for user profile');
          }
          // Still set a default streak value even on error
          setLearningStreak(0);
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        // Set default streak value on error
        setLearningStreak(0);
      } finally {
        setLoadingStreak(false);
      }
    };

    fetchLearningStreak();
  }, []);

  // Fetch available teachers for new students
  useEffect(() => {
    const fetchAvailableTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const response = await getAllTeachers();
        console.log('👨‍🏫 Available teachers response:', response);
        
        if (response.success && response.data) {
          setAvailableTeachers(response.data);
        } else {
          console.error('❌ Failed to fetch available teachers:', response.message);
        }
      } catch (error) {
        console.error('❌ Error fetching available teachers:', error);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchAvailableTeachers();
  }, []);

  // Fetch available courses for new students
  useEffect(() => {
    const fetchAvailableCourses = async () => {
      setLoadingCoursesPublic(true);
      try {
        const response = await getPublicCoursesAPI();
        console.log('📚 Available courses response:', response);
        
        if (response.success && response.data) {
          setAvailableCourses(response.data);
        } else {
          console.error('❌ Failed to fetch available courses:', response.message);
        }
      } catch (error) {
        console.error('❌ Error fetching available courses:', error);
      } finally {
        setLoadingCoursesPublic(false);
      }
    };

    fetchAvailableCourses();
  }, []);

  // Generate AI-powered motivational quote on mount
  useEffect(() => {
    const loadQuote = async () => {
      console.log('🤖 AI Quote: Starting generation...');
      console.log('🤖 AI Quote: User name:', userName);
      
      // Check if we have a cached quote for this session
      const cached = getCachedQuote('student');
      if (cached) {
        console.log('✅ AI Quote: Using cached quote:', cached);
        setMotivationalQuote(cached);
        return;
      }

      console.log('🔄 AI Quote: No cache, generating new quote...');
      // Generate new quote
      setIsLoadingQuote(true);
      try {
        const quote = await generateStudentQuote(userName);
        console.log('✅ AI Quote: Generated:', quote);
        setMotivationalQuote(quote);
        cacheQuote('student', quote);
      } catch (error) {
        console.error('❌ AI Quote: Error loading quote:', error);
        // Keep default quote on error
      } finally {
        setIsLoadingQuote(false);
      }
    };

    loadQuote();
  }, [userName]); // Re-generate when userName changes

  const toggleAnnouncement = (announcementId: string) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  // Get the most urgent upcoming assignment from student's courses
  const nextAssignment = assignments.length > 0 ? {
    ...assignments[0],
    course: assignments[0].course?.name || getCourseById(assignments[0].courseId)?.name || 'Unknown Course',
    teacher: assignments[0].teacher?.name || getTeacherById(assignments[0].teacherId)?.name || 'Unknown Teacher',
  } : null;

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1>Welcome back, {userName}! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your learning journey</p>
        </div>

        {/* Top Row - Smart Next Step & Voice Command */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h3>Smart Next Step</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Based on your progress, we recommend completing this assignment
                  </p>
                  {nextAssignment ? (
                    <div className="space-y-3">
                      <div className="bg-card p-4 rounded-lg border-2 border-primary/40">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-base mb-1">{nextAssignment.title}</p>
                            <p className="text-sm text-muted-foreground mb-2">
                              📚 {nextAssignment.course}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-accent" />
                                <span className={nextAssignment.urgent ? 'text-accent font-semibold' : 'text-muted-foreground'}>
                                  Due: {nextAssignment.dueDate}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                👨‍🏫 {nextAssignment.teacher}
                              </span>
                            </div>
                          </div>
                          {nextAssignment.urgent && (
                            <Badge className="bg-accent text-white shrink-0">Urgent</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-accent"
                        onClick={() => onNavigate('assignment')}
                      >
                        Start Now →
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">🎉 No pending assignments! Great job!</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full flex flex-col justify-between bg-secondary/30">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-accent" />
                    <h3>Learning Streak</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={async () => {
                      setLoadingStreak(true);
                      try {
                        const response = await getCurrentUser();
                        console.log('👤 User profile response (refresh):', response);
                        
                        if (response.success && response.data) {
                          // Set learning streak from user profile
                          setLearningStreak(response.data.learningStreak || 0);
                        } else {
                          console.error('❌ Failed to fetch user profile:', response.message);
                          // Handle rate limiting error specifically
                          if (response.message.includes('Too many requests') || response.message.includes('rate limit')) {
                            console.log('Rate limit exceeded for user profile');
                          }
                          // Still set a default streak value even on error
                          setLearningStreak(0);
                        }
                      } catch (error) {
                        console.error('❌ Error fetching user profile:', error);
                        // Set default streak value on error
                        setLearningStreak(0);
                      } finally {
                        setLoadingStreak(false);
                      }
                    }}
                    disabled={loadingStreak}
                    className="h-6 w-6 p-0"
                  >
                    <Loader2 className={`h-4 w-4 ${loadingStreak ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {loadingStreak ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">{learningStreak} 🔥</div>
                    <p className="text-sm text-muted-foreground">Keep it going!</p>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Motivational Quote - AI Generated */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Courses & Deadlines */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Courses */}
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
              
              {loadingCourses ? (
                <Card className="p-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading your courses...</p>
                </Card>
              ) : enrolledCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {enrolledCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all border-secondary hover:border-primary/50"
                        onClick={() => onNavigate('course')}
                      >
                        <div className="relative h-32">
                          <ImageWithFallback
                            src={course.image}
                            alt={course.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <p className="absolute bottom-2 left-2 text-white text-sm font-medium">{course.name}</p>
                          {course.difficulty && (
                            <Badge 
                              className="absolute top-2 right-2 text-xs"
                              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                            >
                              {course.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-primary">{course.progress}%</span>
                          </div>
                          <Progress 
                            value={course.progress} 
                            className="h-2 mb-3"
                          />
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-muted-foreground truncate">
                              📖 Next: {course.nextLesson}
                            </span>
                            {course.totalLessons && course.totalLessons > 0 && (
                              <span className="text-muted-foreground ml-2 shrink-0">
                                {course.totalLessons} lessons
                              </span>
                            )}
                          </div>
                          {course.instructor && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">👨‍🏫</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {course.instructor.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Courses Available Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Enroll with a teacher to see their courses here!
                  </p>
                  <div className="flex flex-col gap-4">
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => onNavigate('my-teachers')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Find Teachers
                    </Button>
                    {loadingTeachers || loadingCoursesPublic ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Available Teachers: {availableTeachers.length}</p>
                        <p className="text-sm text-muted-foreground">Available Courses: {availableCourses.length}</p>
                        <Button 
                          variant="outline"
                          onClick={() => onNavigate('my-teachers')}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Browse All
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </motion.div>

            {/* Grades Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2>Recent Grades</h2>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('grades')}>
                  View All
                </Button>
              </div>
              <Card>
                {loadingGrades ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Loading grades...</p>
                  </div>
                ) : grades.length > 0 ? (
                  <div className="divide-y divide-border">
                    {grades.map((grade, index) => (
                      <div key={index} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                        <div>
                          <p>{grade.assignment}</p>
                          <p className="text-sm text-muted-foreground">Score: {grade.score}</p>
                        </div>
                        <Badge className="bg-primary text-white">{grade.grade}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No grades available yet</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Deadlines & Announcements */}
          <div className="space-y-6">
            {/* Deadlines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h2>Upcoming Deadlines</h2>
              </div>
              <Card>
                {loadingAssignments ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Loading assignments...</p>
                  </div>
                ) : assignments.length > 0 ? (
                  <div className="divide-y divide-border">
                    {assignments.map((assignment) => {
                      const courseName = assignment.course?.name || getCourseById(assignment.courseId)?.name || 'Unknown Course';
                      const teacherName = assignment.teacher?.name || getTeacherById(assignment.teacherId)?.name || 'Unknown Teacher';
                      
                      return (
                        <div key={assignment.id} className="p-4 hover:bg-secondary/10 transition-colors cursor-pointer" onClick={() => onNavigate('assignment')}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1">{assignment.title}</p>
                              <p className="text-xs text-muted-foreground mb-1">
                                📚 {courseName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                👨‍🏫 {teacherName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {assignment.urgent && (
                                <Badge className="bg-accent text-white text-xs">Urgent</Badge>
                              )}
                              <span className={`text-xs ${assignment.urgent ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>
                                {assignment.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    🎉 No pending assignments!
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2>Announcements</h2>
              </div>
              <Card>
                {loadingAnnouncements ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Loading announcements...</p>
                  </div>
                ) : announcements.length > 0 ? (
                  <div className="divide-y divide-border">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="hover:bg-secondary/20 transition-colors">
                        <div 
                          className="p-4 cursor-pointer flex justify-between items-start"
                          onClick={() => toggleAnnouncement(announcement.id)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{announcement.title}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-muted-foreground">{announcement.time}</p>
                              {announcement.author && (
                                <p className="text-xs text-muted-foreground">by {announcement.author}</p>
                              )}
                            </div>
                          </div>
                          <div className="ml-2">
                            {expandedAnnouncements.has(announcement.id) ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        {expandedAnnouncements.has(announcement.id) && (
                          <div className="px-4 pb-4">
                            <div className="pt-2 border-t border-border">
                              <p className="text-sm text-muted-foreground">
                                {announcement.content || 'No content available'}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <Badge variant="outline" className="text-xs">
                                  Medium priority
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  {announcement.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No announcements yet</p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Radial Progress Graph */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6">
                <h3 className="mb-4">Overall Progress</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.64)}`}
                        className="text-primary transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">64%</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  You're doing great! Keep pushing forward.
                </p>
                <div className="mt-4 flex justify-center">
                  <Button onClick={() => onNavigate('quiz')} className="gap-2">
                    <Brain className="h-4 w-4" />
                    Take a Quiz
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}