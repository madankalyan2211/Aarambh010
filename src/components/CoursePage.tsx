import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useToast } from './ui/toast';
import { RefreshCw, BookOpen, GraduationCap, Award, Loader2, CheckCircle, User } from 'lucide-react';
import { getPublicCoursesAPI, getAllCoursesAPI, getAllTeachers, getEnrolledCourses, enrollInCourseWithTeacher, unenrollFromCourseNew, getPublicTeachers } from '../services/api.service';
import { UserRole } from '../App';

interface TeacherInfo {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  maxStudents: number;
  enrolledCount: number;
  image: string;
  isEnrolled?: boolean;
  teacher?: TeacherInfo | null;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  teachingCourses: string[];
}

interface CoursePageProps {
  userRole: UserRole;
  onNavigate: (page: string) => void;
  onViewCourse?: (courseId: string) => void;
}

export function CoursePage({ userRole, onNavigate, onViewCourse }: CoursePageProps) {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  const [courseToUnenroll, setCourseToUnenroll] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch data
  const fetchData = async (isManualRefresh = false) => {
    if (!isManualRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      let coursesResponse;
      let teachersResponse;
      
      // Use public courses endpoint for unauthenticated users, authenticated endpoint for logged-in users
      if (!userRole) {
        coursesResponse = await getPublicCoursesAPI();
        teachersResponse = await getPublicTeachers();
      } else {
        // Fetch courses and teachers for authenticated users
        const [coursesRes, teachersRes] = await Promise.all([
          getAllCoursesAPI(),
          getAllTeachers(),
        ]);
        
        coursesResponse = coursesRes;
        teachersResponse = teachersRes;
      }

      if (coursesResponse.success) {
        const coursesData = coursesResponse.data || [];
        setCourses(coursesData);
        
        // For students, extract enrolled course IDs from the isEnrolled flag
        if (userRole === 'student') {
          const enrolledIds = new Set<string>(
            coursesData
              .filter((course: Course) => {
                return course.isEnrolled === true;
              })
              .map((course: Course) => course.id)
          );
          setEnrolledCourseIds(enrolledIds);
        }
      }
      
      if (teachersResponse.success) {
        setTeachers(teachersResponse.data || []);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle enrollment button click
  const handleEnrollClick = (course: Course) => {
    // Use the teacher information directly from the course
    const courseTeachers = course.teacher ? [course.teacher] : [];
    
    if (courseTeachers.length === 0) {
      // No teachers available
      showToast('warning', 'No Teachers Available', 'No teachers have been assigned to this course yet. Please check back later.');
      return;
    }
    
    if (courseTeachers.length === 1) {
      // Auto-enroll with the only teacher
      handleEnrollWithTeacher(course.id, courseTeachers[0].id);
      return;
    }
    
    // Multiple teachers - show dialog (this shouldn't happen with our current implementation)
    setSelectedCourse(course);
    setAvailableTeachers(courseTeachers as unknown as Teacher[]);
    setSelectedTeacherId(null); // Reset selection
    setShowTeacherDialog(true);
  };

  // Handle enrollment with selected teacher
  const handleEnrollWithTeacher = async (courseId: string, teacherId: string) => {
    setEnrolling(true);
    try {
      const response = await enrollInCourseWithTeacher(courseId, teacherId);
      
      if (response.success) {
        // Refresh data to update enrollment status
        await fetchData(true);
        setShowTeacherDialog(false);
        setSelectedTeacherId(null);
        showToast('success', 'Enrollment Successful', 'You have been successfully enrolled in the course!');
      } else {
        showToast('error', 'Enrollment Failed', response.message || 'Unable to enroll in this course.');
      }
    } catch (error) {
      console.error('❌ Enrollment error:', error);
      showToast('error', 'Enrollment Error', 'An error occurred during enrollment. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  // Handle Done button click in teacher selection dialog
  const handleDoneSelection = () => {
    if (!selectedTeacherId) {
      showToast('warning', 'Select a Teacher', 'Please select a teacher to continue.');
      return;
    }
    handleEnrollWithTeacher(selectedCourse?.id || '', selectedTeacherId);
  };

  // Handle unenrollment
  const handleUnenrollClick = (courseId: string) => {
    setCourseToUnenroll(courseId);
    setShowUnenrollDialog(true);
  };

  const confirmUnenroll = async () => {
    if (!courseToUnenroll) return;
    
    setEnrolling(true);
    try {
      const response = await unenrollFromCourseNew(courseToUnenroll);
      
      if (response.success) {
        // Refresh data to update enrollment status
        await fetchData(true);
        showToast('success', 'Unenrolled Successfully', 'You have been unenrolled from the course.');
      } else {
        showToast('error', 'Unenrollment Failed', response.message || 'Unable to unenroll from this course.');
      }
    } catch (error) {
      console.error('Unenrollment error:', error);
      showToast('error', 'Unenrollment Error', 'An error occurred during unenrollment. Please try again.');
    } finally {
      setEnrolling(false);
      setShowUnenrollDialog(false);
      setCourseToUnenroll(null);
    }
  };

  const categories = ['All', ...new Set(courses.map(course => course.category))];
  const filteredCourses = selectedCategory === 'All' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return '#10b981'; // green
      case 'Intermediate':
        return 'var(--color-chart-1)'; // blue (previously pink)
      case 'Advanced':
        return '#3B82F6'; // blue
      case 'Expert':
        return 'var(--color-chart-1)'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1>All Courses 📚</h1>
            <p className="text-muted-foreground">
              Browse and explore all available courses
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-primary hover:bg-accent' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading courses...</p>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course: Course) => {
                const isEnrolled = userRole === 'student' 
                  ? course.isEnrolled 
                  : enrolledCourseIds.has(course.id);
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col">
                      <div className="relative">
                        {course.image ? (
                          <img 
                            src={course.image} 
                            alt={course.name} 
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-white" />
                          </div>
                        )}
                        <Badge 
                          className="absolute top-2 right-2" 
                          style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
                        >
                          {course.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-2">{course.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 flex-1">
                          {course.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {course.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {course.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{course.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mb-4">
                          {/* Show enrolled teachers for the course */}
                          <div className="flex flex-wrap gap-1">
                            {course.teacher ? (
                              <Badge variant="secondary" className="text-xs">
                                👨‍🏫 {course.teacher.name}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                No teachers assigned
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{course.enrolledCount}/{course.maxStudents}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-auto">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewCourse && onViewCourse(course.id)}
                            disabled={!isEnrolled && userRole === 'student'}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            {isEnrolled ? 'View' : 'Preview'}
                          </Button>
                          
                          {userRole === 'student' && (
                            isEnrolled ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUnenrollClick(course.id)}
                                className="border-red-500 text-red-500 hover:bg-red-500/10"
                              >
                                Unenroll
                              </Button>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => handleEnrollClick(course)}
                                className="bg-primary hover:bg-accent"
                              >
                                Enroll
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory === 'All' 
                    ? 'There are currently no courses available.' 
                    : `No courses found in the ${selectedCategory} category.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teacher Selection Dialog */}
      <Dialog open={showTeacherDialog} onOpenChange={setShowTeacherDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Teacher</DialogTitle>
            <DialogDescription>
              This course is taught by multiple teachers. Please select one to enroll with.
            </DialogDescription>
          </DialogHeader>
          
          <RadioGroup 
            value={selectedTeacherId || undefined} 
            onValueChange={setSelectedTeacherId}
          >
            {availableTeachers.map(teacher => (
              <div key={teacher.id} className="flex items-center space-x-2">
                <RadioGroupItem value={teacher.id} id={teacher.id} />
                <Label htmlFor={teacher.id} className="flex items-center gap-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowTeacherDialog(false)} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDoneSelection}
              disabled={!selectedTeacherId || enrolling}
              className="bg-primary hover:bg-accent"
            >
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Enroll'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unenroll Confirmation Dialog */}
      <Dialog open={showUnenrollDialog} onOpenChange={setShowUnenrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Unenrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll from this course? All your progress will be lost.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowUnenrollDialog(false)} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmUnenroll}
              disabled={enrolling}
              className="bg-red-500 hover:bg-red-600"
            >
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Unenrolling...
                </>
              ) : (
                'Confirm Unenroll'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}