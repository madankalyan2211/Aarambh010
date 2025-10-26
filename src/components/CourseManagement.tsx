import { useState, useEffect } from 'react';
import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  FileText, 
  Trash2, 
  FolderOpen,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getTeachingCourses, 
  getCourseContentAPI, 
  addModule, 
  addLesson,
  deleteModule,
  deleteLesson,
  updateCourseContent,
  uploadLessonVideo,
  uploadLessonPDF
} from '../services/api.service';

interface CourseManagementProps {
  onNavigate: (page: Page) => void;
}

interface Lesson {
  _id?: string;
  id?: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  duration?: string;
  order?: number;
}

interface Module {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  lessons: Lesson[];
  expanded?: boolean;
  order?: number;
}

interface Course {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category?: string;
  difficulty?: string;
  modules?: Module[];
}

// Helper function to get consistent ID
const getCourseId = (course: Course | null): string => {
  if (!course) return '';
  return course._id || course.id || '';
};

const getModuleId = (module: Module): string => {
  return module._id || module.id || '';
};

const getLessonId = (lesson: Lesson): string => {
  return lesson._id || lesson.id || '';
};

export function CourseManagement({ onNavigate }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewCourseDialog, setShowNewCourseDialog] = useState(false);
  const [showNewModuleDialog, setShowNewModuleDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'pdf'>('video');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // New Course Form
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');

  // New Module Form
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');

  // Upload Form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [videoUploadMethod, setVideoUploadMethod] = useState<'url' | 'file'>('url');

  // Fetch teacher's courses on component mount
  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    setLoading(true);
    try {
      const response = await getTeachingCourses();
      console.log('Teacher courses response:', response);
      
      if (response.success && response.data) {
        // Fetch module count for each course
        const coursesWithModules = await Promise.all(
          response.data.map(async (course: Course) => {
            const courseId = getCourseId(course);
            if (courseId) {
              try {
                const contentResponse = await getCourseContentAPI(courseId);
                if (contentResponse.success && contentResponse.data) {
                  return {
                    ...course,
                    modules: contentResponse.data.modules || []
                  };
                }
              } catch (error) {
                console.error(`Error fetching content for course ${courseId}:`, error);
              }
            }
            return course;
          })
        );
        
        setCourses(coursesWithModules);
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error loading courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch course content when a course is selected
  const loadCourseContent = async (course: Course) => {
    const courseId = getCourseId(course);
    if (!courseId) return;

    try {
      const response = await getCourseContentAPI(courseId);
      console.log('Course content response:', response);
      
      if (response.success && response.data) {
        const courseWithContent = {
          ...course,
          modules: response.data.modules || []
        };
        setSelectedCourse(courseWithContent);
      } else {
        setSelectedCourse(course);
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      setSelectedCourse(course);
    }
  };

  const handleCreateCourse = () => {
    if (!newCourseName.trim()) {
      toast.error('Please enter a course name');
      return;
    }

    const newCourse: Course = {
      id: Date.now(),
      name: newCourseName,
      description: newCourseDescription,
      modules: []
    };

    setCourses([...courses, newCourse]);
    setNewCourseName('');
    setNewCourseDescription('');
    setShowNewCourseDialog(false);
    toast.success('Course created successfully!');
  };

  const handleCreateModule = async () => {
    if (!selectedCourse || !newModuleName.trim()) {
      toast.error('Please enter a module name');
      return;
    }

    const courseId = getCourseId(selectedCourse);
    if (!courseId) {
      toast.error('Invalid course selected');
      return;
    }

    try {
      const moduleData = {
        name: newModuleName,
        description: newModuleDescription,
        order: (selectedCourse.modules?.length || 0) + 1
      };

      const response = await addModule(courseId, moduleData);
      console.log('Add module response:', response);

      if (response.success) {
        // Reload course content to get the updated modules
        await loadCourseContent(selectedCourse);
        setNewModuleName('');
        setNewModuleDescription('');
        setShowNewModuleDialog(false);
        toast.success('Module created successfully!');
      } else {
        toast.error(response.message || 'Failed to create module');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Error creating module');
    }
  };

  const handleUploadContent = async () => {
    if (!selectedModule || !uploadTitle.trim() || !selectedCourse) {
      toast.error('Please enter a title');
      return;
    }

    if (uploadType === 'video') {
      if (videoUploadMethod === 'url' && !uploadUrl.trim()) {
        toast.error('Please enter a video URL');
        return;
      }
      if (videoUploadMethod === 'file' && !uploadFile) {
        toast.error('Please select a video file');
        return;
      }
    }

    if (uploadType === 'pdf' && !uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const courseId = getCourseId(selectedCourse);
    const moduleId = getModuleId(selectedModule);
    
    if (!courseId || !moduleId) {
      toast.error('Invalid course or module');
      return;
    }

    try {
      const lessonData: any = {
        title: uploadTitle,
        type: uploadType,
        order: (selectedModule.lessons?.length || 0) + 1
      };

      // First, create the lesson
      if (uploadType === 'video' && videoUploadMethod === 'url') {
        lessonData.videoUrl = uploadUrl;
      }

      const response = await addLesson(courseId, moduleId, lessonData);
      console.log('Add lesson response:', response);

      if (response.success && response.data) {
        const lessonId = response.data._id || response.data.id;
        
        // If file upload is needed, upload the file after creating the lesson
        if (uploadType === 'video' && videoUploadMethod === 'file' && uploadFile) {
          toast.info('Uploading video file...');
          const uploadResponse = await uploadLessonVideo(courseId, moduleId, lessonId, uploadFile);
          
          if (!uploadResponse.success) {
            toast.error('Video uploaded but file upload failed');
          }
        } else if (uploadType === 'pdf' && uploadFile) {
          toast.info('Uploading PDF file...');
          const uploadResponse = await uploadLessonPDF(courseId, moduleId, lessonId, uploadFile);
          
          if (!uploadResponse.success) {
            toast.error('Lesson created but file upload failed');
          }
        }

        // Reload course content to get the updated lessons
        await loadCourseContent(selectedCourse);
        setUploadTitle('');
        setUploadUrl('');
        setUploadFile(null);
        setVideoUploadMethod('url');
        setShowUploadDialog(false);
        toast.success(`${uploadType === 'video' ? 'Video' : 'PDF'} added successfully!`);
      } else {
        toast.error(response.message || 'Failed to add content');
      }
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error('Error adding content');
    }
  };

  const toggleModuleExpansion = (moduleId: string | undefined) => {
    if (!selectedCourse || !moduleId) return;

    const updatedModules = selectedCourse.modules?.map(m => 
      getModuleId(m) === moduleId ? { ...m, expanded: !m.expanded } : m
    );

    setSelectedCourse({
      ...selectedCourse,
      modules: updatedModules
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (uploadType === 'pdf' && file.type === 'application/pdf') {
        setUploadFile(file);
        setUploadTitle(file.name.replace('.pdf', ''));
      } else if (uploadType === 'video' && videoUploadMethod === 'file' && file.type.startsWith('video/')) {
        setUploadFile(file);
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      } else {
        toast.error(`Please upload a valid ${uploadType === 'video' ? 'video' : 'PDF'} file`);
      }
    }
  };

  const handleDeleteCourse = (courseId: string | undefined) => {
    // Teachers cannot delete courses, only manage content
    toast.info('Please contact admin to remove courses');
  };

  const handleDeleteModule = async (moduleId: string | undefined) => {
    if (!selectedCourse || !moduleId) return;

    const courseId = getCourseId(selectedCourse);
    if (!courseId) {
      toast.error('Invalid course');
      return;
    }

    try {
      const response = await deleteModule(courseId, moduleId);
      console.log('Delete module response:', response);

      if (response.success) {
        // Reload course content to get updated modules
        await loadCourseContent(selectedCourse);
        toast.success('Module deleted successfully!');
      } else {
        toast.error(response.message || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Error deleting module');
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
          <Button
            variant="ghost"
            onClick={() => onNavigate('teacher-courses')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1>Course Management</h1>
              <p className="text-muted-foreground">Create and manage your courses, modules, and learning materials</p>
            </div>
            <Button
              onClick={() => setShowNewCourseDialog(true)}
              className="bg-primary hover:bg-accent gap-2"
            >
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="p-4">
              <h3 className="mb-4">My Teaching Courses ({courses.length})</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <motion.div
                    key={getCourseId(course)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      getCourseId(selectedCourse) === getCourseId(course)
                        ? 'bg-primary text-white'
                        : 'bg-secondary/20 hover:bg-secondary/40'
                    }`}
                    onClick={() => loadCourseContent(course)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <BookOpen className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{course.name}</p>
                          <p className={`text-xs mt-1 ${
                            getCourseId(selectedCourse) === getCourseId(course)
                              ? 'text-white/80' 
                              : 'text-muted-foreground'
                          }`}>
                            {course.modules?.length || 0} modules
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-6 w-6 p-0 ${
                          getCourseId(selectedCourse) === getCourseId(course)
                            ? 'hover:bg-white/20 text-white' 
                            : 'hover:bg-destructive/20 text-destructive'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(getCourseId(course));
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {courses.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No courses assigned</p>
                    <p className="text-xs">You need to be assigned to courses to manage their content</p>
                  </div>
                )}
              </div>
              )}
            </Card>
          </motion.div>

          {/* Course Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {selectedCourse ? (
              <div className="space-y-6">
                {/* Course Info */}
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2>{selectedCourse.name}</h2>
                      <p className="text-muted-foreground mt-1">{selectedCourse.description}</p>
                    </div>
                    <Badge className="bg-primary text-white">
                      {selectedCourse.modules?.length || 0} Modules
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setShowNewModuleDialog(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Module
                  </Button>
                </Card>

                {/* Modules List */}
                <Card className="p-6">
                  <h3 className="mb-4">Course Modules</h3>
                  <div className="space-y-4">
                    {selectedCourse.modules?.map((module, index) => (
                      <motion.div
                        key={getModuleId(module)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 bg-secondary/20 border-secondary">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1">
                              <FolderOpen className="h-5 w-5 text-primary mt-1" />
                              <div className="flex-1">
                                <h4 className="text-sm">{module.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {module.lessons?.length || 0} lessons
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {module.lessons?.filter(l => l.type === 'video').length || 0} videos
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {module.lessons?.filter(l => l.type === 'pdf').length || 0} PDFs
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleModuleExpansion(getModuleId(module))}
                              >
                                {module.expanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/20"
                                onClick={() => handleDeleteModule(getModuleId(module))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {module.expanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 space-y-4"
                            >
                              {/* Lessons */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm">Lessons</p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedModule(module);
                                        setUploadType('video');
                                        setShowUploadDialog(true);
                                      }}
                                      className="gap-1 h-7"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Add Video
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedModule(module);
                                        setUploadType('pdf');
                                        setShowUploadDialog(true);
                                      }}
                                      className="gap-1 h-7"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Add PDF
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {module.lessons?.map((lesson) => (
                                    <div
                                      key={getLessonId(lesson)}
                                      className="flex items-center justify-between p-2 bg-card rounded border border-border"
                                    >
                                      <div className="flex items-center gap-2">
                                        {lesson.type === 'video' ? (
                                          <PlayCircle className="h-4 w-4 text-primary" />
                                        ) : (
                                          <FileText className="h-4 w-4 text-primary" />
                                        )}
                                        <div>
                                          <p className="text-xs">{lesson.title}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {lesson.type === 'video' ? (lesson.duration || 'Video') : 'PDF'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {(!module.lessons || module.lessons.length === 0) && (
                                    <p className="text-xs text-muted-foreground text-center py-2">No lessons yet</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                    {(!selectedCourse.modules || selectedCourse.modules.length === 0) && (
                      <div className="text-center py-12 text-muted-foreground">
                        <FolderOpen className="h-16 w-16 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No modules yet</p>
                        <p className="text-xs">Add your first module to organize course content</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-20 w-20 mx-auto mb-4 opacity-50" />
                  <h3 className="mb-2">No Course Selected</h3>
                  <p className="text-sm">Select a course from the list to manage its content</p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* New Course Dialog */}
      <Dialog open={showNewCourseDialog} onOpenChange={setShowNewCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to your teaching portfolio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Course Name</Label>
              <Input
                placeholder="e.g., Introduction to Data Science"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of the course..."
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewCourseDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse} className="bg-primary hover:bg-accent">
                Create Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Module Dialog */}
      <Dialog open={showNewModuleDialog} onOpenChange={setShowNewModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Create a new module for {selectedCourse?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Module Name</Label>
              <Input
                placeholder="e.g., Week 1: Introduction"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="What will students learn in this module?"
                value={newModuleDescription}
                onChange={(e) => setNewModuleDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewModuleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateModule} className="bg-primary hover:bg-accent">
                Create Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Content Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {uploadType === 'video' ? 'Add Video' : 'Add PDF'}
            </DialogTitle>
            <DialogDescription>
              Upload {uploadType === 'video' ? 'a video' : 'a PDF'} to {selectedModule?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                placeholder={uploadType === 'video' ? 'e.g., Lecture 1: Introduction' : 'e.g., Study Guide Chapter 1'}
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>
            
            {uploadType === 'video' ? (
              <div>
                <Label>Upload Method</Label>
                <Tabs value={videoUploadMethod} onValueChange={(value) => setVideoUploadMethod(value as 'url' | 'file')} className="mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">Video URL</TabsTrigger>
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="mt-4">
                    <div>
                      <Label>Video URL</Label>
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={uploadUrl}
                        onChange={(e) => setUploadUrl(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports YouTube, Vimeo, and direct video URLs
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="file" className="mt-4">
                    <div>
                      <Label>Video File</Label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mt-2 ${
                          dragActive 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        {uploadFile ? (
                          <div>
                            <p className="text-sm mb-1">{uploadFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUploadFile(null)}
                              className="mt-2"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm mb-2">Drag and drop your video here</p>
                            <p className="text-xs text-muted-foreground mb-4">or</p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'video/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    setUploadFile(file);
                                    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
                                  }
                                };
                                input.click();
                              }}
                            >
                              Choose File
                            </Button>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports MP4, WebM, AVI, and other video formats
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div>
                <Label>PDF File</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  {uploadFile ? (
                    <div>
                      <p className="text-sm mb-1">{uploadFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadFile(null)}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mb-2">Drag and drop your PDF here</p>
                      <p className="text-xs text-muted-foreground mb-4">or</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              setUploadFile(file);
                              setUploadTitle(file.name.replace('.pdf', ''));
                            }
                          };
                          input.click();
                        }}
                      >
                        Choose File
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUploadDialog(false);
                  setUploadTitle('');
                  setUploadUrl('');
                  setUploadFile(null);
                  setVideoUploadMethod('url');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUploadContent} className="bg-primary hover:bg-accent gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
