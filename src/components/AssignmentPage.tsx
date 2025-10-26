import { useState, useEffect, useRef } from 'react';
import { Page, UserRole } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useToast } from './ui/toast';
import { motion } from 'motion/react';
import { Upload, File, Clock, CheckCircle, AlertCircle, FileText, Loader2, BookOpen, Bot, Users, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { PDFViewer } from './PDFViewer';
import { Leaderboard } from './Leaderboard';

import { 
  getStudentAssignments, 
  getTeacherAssignments, 
  createAssignment,
  submitAssignment,
  submitAssignmentWithFiles,
  getTeachingCourses,
  getAssignmentSubmissions,
  aiGradeSubmission,
  gradeSubmission
} from '../services/api.service';

interface Assignment {
  id: string;
  title: string;
  description: string;
  course: {
    id: string;
    name: string;
    category: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  dueDate: string;
  daysLeft: number;
  isUrgent: boolean;
  isOverdue: boolean;
  totalPoints: number;
  passingScore: number;
  instructions: string;
  attachments: any[];
  submission?: {
    id: string;
    status: string;
    score: number | null;
    submittedAt: string;
    isLate: boolean;
  };
  hasSubmitted: boolean;
}

interface TeacherAssignment {
  id: string;
  title: string;
  description: string;
  course: {
    id: string;
    name: string;
    category: string;
    enrolledStudents: number;
  };
  dueDate: string;
  totalPoints: number;
  passingScore: number;
  isPublished: boolean;
  createdAt: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  submissionRate: number;
}

interface Submission {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  content: string;
  attachments: any[];
  submittedAt: string;
  score: number | null;
  feedback: string;
  status: string;
  isLate: boolean;
}

interface AIFeedback {
  score: number;
  feedback: string;
  suggestions?: string[];
  pdfProcessed?: boolean;
  pdfName?: string;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface AssignmentPageProps {
  onNavigate: (page: Page) => void;
  userRole: UserRole;
}

export function AssignmentPage({ onNavigate, userRole }: AssignmentPageProps) {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({}); // Track progress for each file
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({}); // Track which files are uploaded
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [plagiarismCheck, setPlagiarismCheck] = useState(0);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedTeacherAssignment, setSelectedTeacherAssignment] = useState<TeacherAssignment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [aiGrading, setAiGrading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<Attachment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission & { aiFeedback?: AIFeedback } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [passingScore, setPassingScore] = useState(60);
  const [instructions, setInstructions] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  const isTeacher = userRole === 'teacher' || userRole === 'admin';
  
  useEffect(() => {
    fetchAssignments();
    if (isTeacher) {
      fetchTeachingCourses();
    }
  }, [isTeacher]);
  
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = isTeacher 
        ? await getTeacherAssignments()
        : await getStudentAssignments();
      
      if (response.success) {
        if (isTeacher) {
          setTeacherAssignments(response.data || []);
        } else {
          setAssignments(response.data || []);
        }
      } else {
        showToast('error', 'Failed to load assignments', response.message);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showToast('error', 'Error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTeachingCourses = async () => {
    try {
      const response = await getTeachingCourses();
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  
  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const response = await getAssignmentSubmissions(assignmentId);
      if (response.success) {
        setSubmissions(response.data || []);
      } else {
        showToast('error', 'Failed to load submissions', response.message);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showToast('error', 'Error', 'Failed to load submissions');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !courseId || !dueDate) {
      showToast('warning', 'Missing Fields', 'Please fill in all required fields');
      return;
    }
    
    try {
      const assignmentData = {
        title,
        description,
        courseId,
        dueDate,
        totalPoints,
        passingScore,
        instructions,
      };
      
      const response = await createAssignment(assignmentData);
      
      if (response.success) {
        showToast('success', 'Assignment Created', 'Assignment has been created successfully');
        setIsCreating(false);
        resetForm();
        fetchAssignments();
      } else {
        showToast('error', 'Failed to Create', response.message);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      showToast('error', 'Error', 'Failed to create assignment');
    }
  };
  
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasContent = content && content.trim().length > 0;
    const hasFiles = files.length > 0;
    
    if (!selectedAssignment || (!hasContent && !hasFiles)) {
      showToast('warning', 'Missing Content', 'Please provide assignment content or attach a file');
      return;
    }
    
    setSubmitting(true);
    
    try {
      let response;
      if (files.length > 0) {
        // Submit with file attachments and track progress
        response = await submitAssignmentWithFiles(
          selectedAssignment.id, 
          content, 
          files,
          (fileName, progress) => {
            // Update progress for each file
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: progress
            }));
          },
          (fileName) => {
            // Mark file as uploaded
            setUploadedFiles(prev => ({
              ...prev,
              [fileName]: true
            }));
          }
        );
      } else {
        // Submit text only
        const submissionData = {
          assignmentId: selectedAssignment.id,
          content,
        };
        response = await submitAssignment(submissionData);
      }
      
      if (response.success) {
        showToast('success', 'Assignment Submitted', 'Your assignment has been submitted successfully');
        setSelectedAssignment(null);
        setContent('');
        setFiles([]);
        setUploadProgress({});
        setUploadedFiles({});
        setFileUploadStatus({});
        fetchAssignments();
      } else {
        showToast('error', 'Failed to Submit', response.message || 'Failed to submit assignment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showToast('error', 'Error', 'Failed to submit assignment: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleAIAssist = async (submission: Submission) => {
    setAiGrading(true);
    try {
      const response = await aiGradeSubmission(submission.id);
      if (response.success) {
        setAiFeedback(response.data);
        // If this is for grading a specific submission, set the AI feedback for that submission
        if (gradingSubmission && gradingSubmission.id === submission.id) {
          setGradingSubmission({
            ...gradingSubmission,
            aiFeedback: response.data
          } as Submission & { aiFeedback?: AIFeedback });
        } else {
          setShowAIFeedback(true);
        }
        showToast('success', 'AI Analysis Complete', 'AI grading assistance is ready');
      } else {
        showToast('error', 'AI Analysis Failed', response.message || 'Failed to get AI grading assistance');
      }
    } catch (error) {
      console.error('Error with AI grading:', error);
      showToast('error', 'Error', 'Failed to get AI grading assistance');
    } finally {
      setAiGrading(false);
    }
  };
  
  const handleViewPDF = (submission: Submission, pdfAttachment: Attachment) => {
    setSelectedSubmission(submission);
    setSelectedPDF(pdfAttachment);
    setShowPDFViewer(true);
  };
  
  const handleGradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    try {
      const response = await gradeSubmission(submissionId, { score, feedback });
      if (response.success) {
        showToast('success', 'Grade Submitted', 'The submission has been graded successfully');
        // Refresh submissions
        if (selectedTeacherAssignment) {
          fetchSubmissions(selectedTeacherAssignment.id);
        }
        return response;
      } else {
        showToast('error', 'Grading Failed', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      showToast('error', 'Error', 'Failed to grade submission');
      throw error;
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCourseId('');
    setDueDate('');
    setTotalPoints(100);
    setPassingScore(60);
    setInstructions('');
  };
  
  const [fileUploadStatus, setFileUploadStatus] = useState<Record<string, { progress: number; uploaded: boolean; error?: string }>>({});

  // Function to upload a single file
  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${file.size}-${file.lastModified}`;
    
    // Initialize upload status
    setFileUploadStatus(prev => ({
      ...prev,
      [fileId]: { progress: 0, uploaded: false }
    }));
    
    const formData = new FormData();
    formData.append('file', file);
    
    return new Promise<{ success: boolean; url?: string; error?: string }>((resolve) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setFileUploadStatus(prev => ({
            ...prev,
            [fileId]: { progress: percentComplete, uploaded: false }
          }));
        }
      });
      
      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            setFileUploadStatus(prev => ({
              ...prev,
              [fileId]: { progress: 100, uploaded: true }
            }));
            resolve({ success: true, url: data.url });
          } catch (parseError) {
            setFileUploadStatus(prev => ({
              ...prev,
              [fileId]: { progress: 0, uploaded: false, error: 'Failed to parse response' }
            }));
            resolve({ success: false, error: 'Failed to parse server response' });
          }
        } else {
          try {
            const responseText = xhr.responseText;
            // Check if this is a rate limiting error
            if (xhr.status === 429 && responseText.includes('Too many requests')) {
              setFileUploadStatus(prev => ({
                ...prev,
                [fileId]: { progress: 0, uploaded: false, error: 'Too many requests from this IP, please try again later.' }
              }));
              resolve({ success: false, error: 'Too many requests from this IP, please try again later.' });
              return;
            }
            
            const errorData = JSON.parse(responseText);
            setFileUploadStatus(prev => ({
              ...prev,
              [fileId]: { progress: 0, uploaded: false, error: errorData.message || 'Upload failed' }
            }));
            resolve({ success: false, error: errorData.message || 'Upload failed' });
          } catch (parseError) {
            setFileUploadStatus(prev => ({
              ...prev,
              [fileId]: { progress: 0, uploaded: false, error: 'Upload failed' }
            }));
            resolve({ success: false, error: 'Upload failed' });
          }
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        setFileUploadStatus(prev => ({
          ...prev,
          [fileId]: { progress: 0, uploaded: false, error: 'Network error' }
        }));
        resolve({ success: false, error: 'Network error during upload' });
      });
      
      // Set up the request
      xhr.open('POST', '/api/upload'); // This would be handled by the backend
      const token = localStorage.getItem('authToken');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // Initialize upload status for new files
      newFiles.forEach(file => {
        const fileId = `${file.name}-${file.size}-${file.lastModified}`;
        setFileUploadStatus(prev => ({
          ...prev,
          [fileId]: { progress: 0, uploaded: false }
        }));
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      return newFiles;
    });
  };
  
  const getGradeColor = (status: string, score: number | null) => {
    if (status === 'graded' && score !== null) {
      if (score >= 90) return 'bg-green-500';
      if (score >= 80) return 'bg-blue-500';
      if (score >= 70) return 'bg-yellow-500';
      if (score >= 60) return 'bg-orange-500';
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge className="bg-green-500 text-white">Graded</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
      case 'pending':
        return <Badge className="bg-gray-500 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1>{isTeacher ? 'Manage Assignments' : 'My Assignments'}</h1>
          <p className="text-muted-foreground">
            {isTeacher ? 'Create and review student submissions' : 'View and submit your assignments'}
          </p>
        </motion.div>

        {/* Teacher View - Create Assignment */}
        {isTeacher && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {!isCreating ? (
              <Card className="p-6">
                <Button 
                  className="w-full bg-primary hover:bg-accent"
                  onClick={() => setIsCreating(true)}
                >
                  + Create New Assignment
                </Button>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="mb-4">Create Assignment</h2>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Neural Networks Implementation" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed instructions..."
                      className="min-h-[120px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course">Course *</Label>
                      <select
                        id="course"
                        className="w-full p-2 border rounded-md bg-background"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map((course: any) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Deadline *</Label>
                      <Input 
                        id="dueDate" 
                        type="datetime-local" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="points">Total Points</Label>
                      <Input 
                        id="points" 
                        type="number" 
                        placeholder="100" 
                        value={totalPoints}
                        onChange={(e) => setTotalPoints(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score</Label>
                      <Input 
                        id="passingScore" 
                        type="number" 
                        placeholder="60" 
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Additional instructions or guidelines..."
                      className="min-h-[100px]"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-accent"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Assignment'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreating(false);
                        resetForm();
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </motion.div>
        )}

        {/* Student View - Assignment List */}
        {!isTeacher && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="mb-4">Available Assignments ({assignments.length})</h2>
            
            {assignments.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Assignments Available</h3>
                <p className="text-muted-foreground">
                  You don't have any assignments yet. Check back later!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-all border-secondary hover:border-[#3B82F6]/50">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg">{assignment.title}</h3>
                            {assignment.isUrgent && (
                              <Badge className="bg-accent text-white animate-pulse">Urgent</Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{assignment.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                            <span className="flex items-center gap-1 min-w-0">
                              <BookOpen className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{assignment.course.name}</span>
                            </span>
                            <span className="flex items-center gap-1 min-w-0">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </span>
                            <span className="truncate">
                              {assignment.daysLeft > 0 
                                ? `${assignment.daysLeft} days left`
                                : assignment.daysLeft === 0 
                                  ? 'Due today'
                                  : `${Math.abs(assignment.daysLeft)} days overdue`
                              }
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{assignment.course.category}</Badge>
                            <Badge variant="outline">{assignment.totalPoints} pts</Badge>
                            {assignment.teacher && (
                              <Badge variant="outline">{assignment.teacher.name}</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {assignment.submission ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getGradeColor(assignment.submission.status, assignment.submission.score)}`} />
                              <span className="text-sm">
                                {assignment.submission.status === 'graded' && assignment.submission.score !== null
                                  ? `${assignment.submission.score}/${assignment.totalPoints} pts`
                                  : assignment.submission.status.charAt(0).toUpperCase() + assignment.submission.status.slice(1)
                                }
                              </span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-orange-500 border-orange-500">
                              Not Submitted
                            </Badge>
                          )}
                          
                          <Button 
                            size="sm"
                            className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                            onClick={() => setSelectedAssignment(assignment)}
                            disabled={assignment.submission?.status === 'submitted' || assignment.submission?.status === 'graded'}
                          >
                            {assignment.submission?.status === 'graded' ? 'View Feedback' : 'Submit'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Teacher View - Assignment List */}
        {isTeacher && !showSubmissions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="mb-4">Your Assignments ({teacherAssignments.length})</h2>
            
            {teacherAssignments.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Assignments Created</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any assignments yet.
                </p>
                <Button 
                  className="bg-primary hover:bg-accent"
                  onClick={() => setIsCreating(true)}
                >
                  + Create First Assignment
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {teacherAssignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-all border-secondary hover:border-[#3B82F6]/50">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{assignment.title}</h3>
                          <p className="text-muted-foreground mb-3">{assignment.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                            <span className="flex items-center gap-1 min-w-0">
                              <BookOpen className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{assignment.course.name}</span>
                            </span>
                            <span className="flex items-center gap-1 min-w-0">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </span>
                            <span className="truncate">
                              {assignment.totalSubmissions} / {assignment.course.enrolledStudents} submissions
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{assignment.course.category}</Badge>
                            <Badge variant="outline">{assignment.totalPoints} pts</Badge>
                            <Badge 
                              variant="outline" 
                              className={assignment.submissionRate >= 80 ? 'text-green-500' : 'text-orange-500'}
                            >
                              {assignment.submissionRate}% submitted
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right text-sm min-w-0">
                            <p className="truncate">{assignment.gradedSubmissions} / {assignment.totalSubmissions} graded</p>
                            <p className="truncate">{assignment.pendingSubmissions} pending</p>
                          </div>
                          
                          <Button 
                            size="sm"
                            className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                            onClick={() => {
                              setSelectedTeacherAssignment(assignment);
                              setShowSubmissions(true);
                              fetchSubmissions(assignment.id);
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            View Submissions
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Teacher View - Submission List */}
        {isTeacher && showSubmissions && selectedTeacherAssignment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedTeacherAssignment.title}</h2>
                <p className="text-muted-foreground">Student Submissions</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowSubmissions(false)}
              >
                Back to Assignments
              </Button>
            </div>
            
            {submissions.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Submissions Yet</h3>
                <p className="text-muted-foreground">
                  No students have submitted this assignment yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Leaderboard Section */}
                <Leaderboard 
                  submissions={submissions.map(sub => ({
                    id: sub.id,
                    studentName: sub.student.name,
                    studentEmail: sub.student.email,
                    score: sub.score || 0,
                    maxScore: selectedTeacherAssignment.totalPoints,
                    percentage: sub.score ? Math.round((sub.score / selectedTeacherAssignment.totalPoints) * 100) : 0,
                    rank: 0, // Will be calculated in the component
                    assignmentId: selectedTeacherAssignment.id,
                    submittedAt: sub.submittedAt
                  }))}
                  assignmentTitle={selectedTeacherAssignment.title}
                />
                
                {/* Individual Submissions */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Individual Submissions</h3>
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold">{submission.student.name}</h3>
                              {submission.isLate && (
                                <Badge variant="destructive">Late</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3 min-w-0">
                              <span className="truncate">Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                            </p>
                            
                            {submission.content && (
                              <div className="bg-secondary/10 p-3 rounded-lg mb-3">
                                <p className="text-sm">{submission.content.substring(0, 100)}{submission.content.length > 100 ? '...' : ''}</p>
                              </div>
                            )}
                            
                            {submission.attachments && submission.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {submission.attachments.map((attachment, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="flex items-center gap-1 cursor-pointer hover:bg-accent"
                                    onClick={() => {
                                      if (attachment.type === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf')) {
                                        handleViewPDF(submission, attachment);
                                      }
                                    }}
                                  >
                                    <FileText className="h-3 w-3" />
                                    {attachment.name}
                                    {(attachment.type === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf')) && (
                                      <Eye className="h-3 w-3 ml-1" />
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {submission.status === 'graded' && (
                              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                <p className="text-sm">
                                  <strong>Grade:</strong> {submission.score} pts
                                </p>
                                {submission.feedback && (
                                  <p className="text-sm mt-1">
                                    <strong>Feedback:</strong> {submission.feedback}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(submission.status)}
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleAIAssist(submission)}
                                disabled={aiGrading}
                              >
                                {aiGrading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Bot className="h-4 w-4 mr-2" />
                                    AI Assist
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-black dark:text-white"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  // Find first PDF attachment if exists
                                  const pdfAttachment = submission.attachments.find(att => 
                                    att.type === 'application/pdf' || att.name.toLowerCase().endsWith('.pdf')
                                  );
                                  if (pdfAttachment) {
                                    handleViewPDF(submission, pdfAttachment);
                                  } else {
                                    // For non-PDF submissions, open a simplified grading interface
                                    setGradingSubmission(submission);
                                    setShowPDFViewer(true);
                                  }
                                }}
                              >
                                Grade
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Submit Assignment Dialog */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => {
        setSelectedAssignment(null);
        setUploadProgress({});
        setUploadedFiles({});
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="bg-secondary/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Instructions</h4>
                <p className="text-sm">{selectedAssignment.instructions || selectedAssignment.description}</p>
              </div>
              
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Your Response</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your response here..."
                    className="min-h-[200px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Attachments (PDF files only)</Label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const newFiles = Array.from(e.dataTransfer.files).filter(file => 
                          (file as File).type === 'application/pdf' || (file as File).name.toLowerCase().endsWith('.pdf')
                        );
                        setFiles(prev => [...prev, ...newFiles]);
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="mb-2">Drag and drop PDF files here</p>
                    <p className="text-sm text-muted-foreground mb-4">or</p>
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,application/pdf"
                      multiple
                      onChange={handleFileUpload}
                    />
                  </div>
                  
                  {/* File list with progress indicators */}
                  {files.length > 0 && (
                    <div className="mt-2 space-y-3">
                      <p className="text-sm font-medium">Selected files:</p>
                      {files.map((file, index) => {
                        const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                        const progress = uploadProgress[fileId] || 0;
                        const isUploaded = uploadedFiles[fileId] || false;
                        
                        return (
                          <div key={index} className="bg-secondary/10 p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {file.name}
                              </span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeFile(index)}
                              >
                                Remove
                              </Button>
                            </div>
                            
                            {/* Progress indicator */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>
                                  {isUploaded ? (
                                    <span className="text-green-600 flex items-center gap-1 font-medium">
                                      <CheckCircle className="h-3 w-3" />
                                      Upload complete (100%)
                                    </span>
                                  ) : progress > 0 ? (
                                    <span className="text-blue-600 font-medium">Uploading... {progress}%</span>
                                  ) : (
                                    <span className="text-gray-500">Ready to upload</span>
                                  )}
                                </span>
                                <span>{(file.size / 1024).toFixed(1)} KB</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              {isUploaded && (
                                <div className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  File successfully uploaded and ready for submission
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setSelectedAssignment(null);
                      setUploadProgress({});
                      setUploadedFiles({});
                      setFiles([]);
                      setFileUploadStatus({});
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-accent"
                    disabled={submitting || (!content.trim() && files.length === 0)}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                        'Submit Assignment'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Feedback Dialog */}
      <Dialog open={showAIFeedback} onOpenChange={setShowAIFeedback}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>🤖 AI Grading Assistance</DialogTitle>
            <DialogDescription>
              Automated feedback and suggestions for this submission
            </DialogDescription>
          </DialogHeader>
          {aiFeedback ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <h4 className="font-semibold mb-2">Suggested Score: {aiFeedback.score}/100</h4>
                <p className="text-sm">{aiFeedback.feedback}</p>
                {aiFeedback.pdfProcessed && (
                  <p className="text-xs mt-2 text-blue-600 dark:text-blue-400">
                    📄 Processed PDF: {aiFeedback.pdfName}
                  </p>
                )}
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <h4 className="font-semibold mb-2">Suggestions for Improvement</h4>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {aiFeedback.suggestions && aiFeedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <h4 className="font-semibold mb-2">💡 How to Use This Feedback</h4>
                <p className="text-sm">
                  This AI analysis provides automated suggestions to help you grade this assignment. 
                  Review the feedback and adjust the final score as needed based on your own assessment.
                  {aiFeedback.pdfProcessed && " The AI has processed and analyzed the content of the attached PDF file."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Generating AI feedback...</p>
            </div>
          )}
          <Button onClick={() => setShowAIFeedback(false)} className="w-full">
            Got it, thanks!
          </Button>
        </DialogContent>
      </Dialog>
      {/* PDF Viewer Dialog */}
      <PDFViewer
        fileUrl={selectedPDF?.url || ''}
        fileName={selectedPDF?.name || 'Submission'}
        isOpen={showPDFViewer}
        onClose={() => {
          setShowPDFViewer(false);
          setSelectedPDF(null);
          setSelectedSubmission(null);
          setGradingSubmission(null);
          setAiFeedback(null);
        }}
        onGradeSubmit={(score: number, feedback: string) => {
          if (gradingSubmission) {
            return handleGradeSubmission(gradingSubmission.id, score, feedback);
          }
        }}
        onAIAssist={() => selectedSubmission && handleAIAssist(selectedSubmission)}
        totalPoints={selectedTeacherAssignment?.totalPoints || 100}
        initialScore={gradingSubmission?.score || null}
        initialFeedback={gradingSubmission?.feedback || ''}
        aiGrading={aiGrading}
        aiFeedback={aiFeedback}
      />
    </div>
  );
}
