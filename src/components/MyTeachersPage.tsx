import { useState, useEffect } from 'react';
import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from './ui/toast';
import { motion } from 'motion/react';
import { Users, BookOpen, Mail, CheckCircle2, XCircle, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { getAllTeachers, getMyTeachers, enrollWithTeacher, unenrollFromTeacher, enrollInCourseWithTeacher } from '../services/api.service';

interface Course {
  id: string;
  _id?: string;
  name: string;
  description: string;
  image: string;
  difficulty?: string;
  category?: string;
  tags?: string[];
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio: string;
  teachingCourses: Course[];
  createdAt: string;
  studentCount?: number;
  courseCount?: number;
}

interface MyTeachersPageProps {
  onNavigate: (page: Page) => void;
  userEmail: string;
}

export function MyTeachersPage({ onNavigate, userEmail }: MyTeachersPageProps) {
  const { showToast } = useToast();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [myTeachers, setMyTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  
  // Course selection dialog state
  const [showCoursesDialog, setShowCoursesDialog] = useState(false);
  const [selectedTeacherForEnrollment, setSelectedTeacherForEnrollment] = useState<Teacher | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set<string>());

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const [allTeachersRes, myTeachersRes] = await Promise.all([
        getAllTeachers(),
        getMyTeachers(),
      ]);

      if (allTeachersRes.success) {
        setAllTeachers(allTeachersRes.data || []);
      }

      if (myTeachersRes.success) {
        setMyTeachers(myTeachersRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollToggle = async (teacherId: string, showCourses = false) => {
    const isEnrolled = myTeachers.some(t => t.id === teacherId);
    
    // If enrolling and showCourses is true, show courses dialog first
    if (!isEnrolled && showCourses) {
      const teacher = allTeachers.find(t => t.id === teacherId);
      if (teacher && teacher.teachingCourses && teacher.teachingCourses.length > 0) {
        setSelectedTeacherForEnrollment(teacher);
        setSelectedCourses(new Set()); // Reset selections
        setShowCoursesDialog(true);
        return;
      }
    }
    
    // Otherwise proceed with enrollment/unenrollment
    setEnrolling(teacherId);

    try {
      const result = isEnrolled 
        ? await unenrollFromTeacher(teacherId)
        : await enrollWithTeacher(teacherId);

      if (result.success) {
        // Refresh the lists
        await fetchTeachers();
        
        // Show success message
        if (isEnrolled) {
          const coursesRemoved = result.data?.unenrolledCourses || 0;
          showToast(
            'success', 
            'Unenrolled Successfully', 
            `You have been unenrolled from the teacher${coursesRemoved > 0 ? ` and ${coursesRemoved} course${coursesRemoved !== 1 ? 's' : ''}` : ''}.`
          );
        } else {
          showToast('success', 'Enrolled Successfully', 'You have been enrolled with the teacher.');
        }
      } else {
        showToast('error', isEnrolled ? 'Unenrollment Failed' : 'Enrollment Failed', result.message || 'Please try again.');
      }
    } catch (error) {
      console.error('Error toggling enrollment:', error);
      showToast('error', 'Error', 'An error occurred. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedTeacherForEnrollment) return;
    
    if (selectedCourses.size === 0) {
      alert('Please select at least one course to enroll in.');
      return;
    }
    
    setEnrolling(selectedTeacherForEnrollment.id);
    
    try {
      // Enroll in each selected course with this teacher
      const courseIds = Array.from(selectedCourses) as string[];
      const enrollmentPromises = courseIds.map((courseId) => 
        enrollInCourseWithTeacher(courseId, selectedTeacherForEnrollment.id)
      );
      
      const results = await Promise.all(enrollmentPromises);
      
      // Check if all enrollments were successful
      const allSuccessful = results.every(r => r.success);
      
      if (allSuccessful) {
        // Refresh the teachers list
        await fetchTeachers();
        showToast(
          'success', 
          'Enrollment Successful', 
          `You have been enrolled in ${selectedCourses.size} course${selectedCourses.size !== 1 ? 's' : ''}!`
        );
      } else {
        console.error('Some enrollments failed:', results);
        showToast('error', 'Enrollment Failed', 'Some courses could not be enrolled. Please try again.');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      showToast('error', 'Enrollment Error', 'An error occurred during enrollment. Please try again.');
    } finally {
      setEnrolling(null);
      setShowCoursesDialog(false);
      setSelectedTeacherForEnrollment(null);
      setSelectedCourses(new Set());
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1>My Teachers 👨‍🏫</h1>
          <p className="text-muted-foreground">
            View your teachers and the courses they teach
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - My Teachers */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h2>My Teachers ({myTeachers.length})</h2>
              </div>

              {loading ? (
                <Card className="p-6 text-center">
                  <Loader2 className="h-8 w-8 text-primary mx-auto mb-3 animate-spin" />
                  <p className="text-muted-foreground">Loading teachers...</p>
                </Card>
              ) : myTeachers.length > 0 ? (
                <div className="space-y-3">
                  {myTeachers.map((teacher, index) => {
                    const teacherId = teacher.id;
                    const isSelected = selectedTeacher?.id === teacherId;

                    return (
                      <motion.div
                        key={teacherId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card
                          className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                            isSelected 
                              ? 'border-2 border-primary bg-primary/5' 
                              : 'border-secondary hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedTeacher(isSelected ? null : teacher)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                  👨‍🏫
                                </div>
                                <div>
                                  <p className="font-semibold">{teacher.name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {teacher.email}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="outline" className="text-xs">
                                  {teacher.studentCount || 0} Students
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {teacher.courseCount || 0} Courses
                                </Badge>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">
                    You haven't enrolled with any teachers yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Browse available teachers below to get started!
                  </p>
                </Card>
              )}
            </motion.div>

            {/* Available Teachers Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-accent" />
                <h2>Available Teachers ({allTeachers.length})</h2>
              </div>

              {loading ? (
                <Card className="p-6 text-center">
                  <Loader2 className="h-8 w-8 text-primary mx-auto mb-3 animate-spin" />
                  <p className="text-muted-foreground">Loading...</p>
                </Card>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allTeachers.map((teacher, index) => {
                    const teacherId = teacher.id;
                    const isEnrolled = myTeachers.some(t => t.id === teacherId);
                    const isProcessing = enrolling === teacherId;

                    return (
                      <motion.div
                        key={teacherId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <Card className="p-3 hover:shadow-md transition-all border-secondary">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-lg">
                                👨‍🏫
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{teacher.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isEnrolled ? "outline" : "default"}
                              className={isEnrolled ? "" : "bg-primary hover:bg-accent"}
                              onClick={() => handleEnrollToggle(teacherId, true)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isEnrolled ? (
                                <><UserMinus className="h-4 w-4 mr-1" /> Unenroll</>
                              ) : (
                                <><UserPlus className="h-4 w-4 mr-1" /> Enroll</>
                              )}
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Teacher Details */}
          <div className="lg:col-span-2">
            {selectedTeacher ? (
              <motion.div
                key={selectedTeacher.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Teacher Info Card */}
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
                      👨‍🏫
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-1">{selectedTeacher.name}</h2>
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedTeacher.email}
                      </p>
                      {selectedTeacher.bio && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedTeacher.bio}
                        </p>
                      )}
                      <div className="flex gap-4">
                        <div>
                          <p className="text-2xl font-bold text-primary">{selectedTeacher.studentCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-accent">{selectedTeacher.courseCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Courses</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEnrollToggle(selectedTeacher.id, false)}
                      disabled={enrolling === selectedTeacher.id}
                      className="shrink-0"
                    >
                      {enrolling === selectedTeacher.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><UserMinus className="h-4 w-4 mr-1" /> Unenroll</>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Additional Info */}
                <Card className="p-6">
                  <h3 className="mb-4">Teaching Courses ({selectedTeacher.teachingCourses?.length || 0})</h3>
                  {selectedTeacher.teachingCourses && selectedTeacher.teachingCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedTeacher.teachingCourses.map((course, idx) => (
                        <Card key={idx} className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FF69B4]/10 flex items-center justify-center shrink-0">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm mb-1">{course.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {course.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs" style={{ borderColor: '#FF69B4', color: '#FF69B4' }}>
                                  {course.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {course.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        This teacher hasn't been assigned any courses yet.
                      </p>
                    </div>
                  )}
                </Card>

                {/* About This Teacher */}
                <Card className="p-6">
                  <h3 className="mb-4">About This Teacher</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Teaching Experience</p>
                      <p className="text-sm text-muted-foreground">
                        Currently teaching {selectedTeacher.courseCount || 0} courses with {selectedTeacher.studentCount || 0} enrolled students.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Courses & Assignments</p>
                      <p className="text-sm text-muted-foreground">
                        View courses and assignments on the Courses page.
                      </p>
                    </div>
                    <Button
                      className="bg-primary hover:bg-accent w-full"
                      onClick={() => onNavigate('course')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">Select a Teacher</h3>
                <p className="text-muted-foreground">
                  Click on a teacher from your enrolled list to view their details
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Teacher Courses Dialog */}
        <Dialog open={showCoursesDialog} onOpenChange={setShowCoursesDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary">
                Select Courses from {selectedTeacherForEnrollment?.name}
              </DialogTitle>
              <DialogDescription>
                Choose which courses you want to enroll in. You can select multiple courses.
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-[400px] overflow-y-auto py-4">
              {selectedTeacherForEnrollment?.teachingCourses && selectedTeacherForEnrollment.teachingCourses.length > 0 ? (
                <div className="grid gap-3">
                  {selectedTeacherForEnrollment.teachingCourses.map((course, idx) => {
                    const courseId = course.id || course._id;
                    // Skip courses without a valid ID
                    if (!courseId) return null;
                    
                    const isSelected = selectedCourses.has(courseId);
                    
                    return (
                      <Card 
                        key={courseId} 
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-[#FF69B4]/20 hover:border-primary/50'
                        }`}
                        onClick={() => toggleCourseSelection(courseId)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[#FF69B4]/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold mb-1">{course.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {course.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {course.difficulty && (
                                <Badge variant="outline" className="text-xs" style={{ borderColor: '#FF69B4', color: '#FF69B4' }}>
                                  {course.difficulty}
                                </Badge>
                              )}
                              {course.category && (
                                <Badge variant="outline" className="text-xs">
                                  {course.category}
                                </Badge>
                              )}
                              {course.tags && course.tags.slice(0, 2).map((tag, tagIdx) => (
                                <Badge key={tagIdx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div 
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected ? 'border-[#FF69B4]' : 'border-gray-400'
                            }`}
                            style={{ 
                              backgroundColor: isSelected ? 'var(--primary)' : 'transparent'
                            }}
                          >
                            {isSelected && (
                              <svg 
                                className="w-4 h-4" 
                                viewBox="0 0 16 16" 
                                fill="none" 
                                stroke="white" 
                                strokeWidth="2.5"
                              >
                                <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    This teacher hasn't been assigned any courses yet.
                  </p>
                </div>
              )}
            </div>
            
            {selectedCourses.size > 0 && (
              <div className="px-1 py-2 bg-[#FF69B4]/10 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  {selectedCourses.size} course{selectedCourses.size !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCoursesDialog(false);
                  setSelectedTeacherForEnrollment(null);
                  setSelectedCourses(new Set());
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary text-white"
                onClick={handleConfirmEnrollment}
                disabled={enrolling !== null || selectedCourses.size === 0}
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Enroll in {selectedCourses.size} Course{selectedCourses.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
