import { useState } from 'react';
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
  Video, 
  FileText, 
  Edit, 
  Trash2, 
  FolderOpen,
  PlayCircle,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CourseManagementProps {
  onNavigate: (page: Page) => void;
}

interface Module {
  id: number;
  name: string;
  description: string;
  videos: Video[];
  pdfs: PDF[];
  expanded: boolean;
}

interface Video {
  id: number;
  title: string;
  url: string;
  duration: string;
}

interface PDF {
  id: number;
  title: string;
  size: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  modules: Module[];
}

const initialCourses: Course[] = [
  {
    id: 1,
    name: 'AI & Machine Learning',
    description: 'Comprehensive course on artificial intelligence and machine learning fundamentals',
    modules: [
      {
        id: 1,
        name: 'Introduction to AI',
        description: 'Overview of AI concepts and history',
        videos: [
          { id: 1, title: 'What is AI?', url: 'https://example.com/video1', duration: '12:30' },
          { id: 2, title: 'AI History', url: 'https://example.com/video2', duration: '8:45' }
        ],
        pdfs: [
          { id: 1, title: 'Introduction Slides', size: '2.4 MB' },
          { id: 2, title: 'Reading Material', size: '1.8 MB' }
        ],
        expanded: false
      },
      {
        id: 2,
        name: 'Neural Networks',
        description: 'Deep dive into neural network architectures',
        videos: [
          { id: 3, title: 'Perceptrons', url: 'https://example.com/video3', duration: '15:20' }
        ],
        pdfs: [
          { id: 3, title: 'Neural Networks Guide', size: '3.2 MB' }
        ],
        expanded: false
      }
    ]
  },
  {
    id: 2,
    name: 'Web Development',
    description: 'Full-stack web development with modern frameworks',
    modules: [
      {
        id: 3,
        name: 'HTML & CSS Basics',
        description: 'Foundation of web development',
        videos: [],
        pdfs: [],
        expanded: false
      }
    ]
  }
];

export function CourseManagement({ onNavigate }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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

  const handleCreateModule = () => {
    if (!selectedCourse || !newModuleName.trim()) {
      toast.error('Please enter a module name');
      return;
    }

    const newModule: Module = {
      id: Date.now(),
      name: newModuleName,
      description: newModuleDescription,
      videos: [],
      pdfs: [],
      expanded: false
    };

    const updatedCourses = courses.map(course => 
      course.id === selectedCourse.id 
        ? { ...course, modules: [...course.modules, newModule] }
        : course
    );

    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find(c => c.id === selectedCourse.id) || null);
    setNewModuleName('');
    setNewModuleDescription('');
    setShowNewModuleDialog(false);
    toast.success('Module created successfully!');
  };

  const handleUploadContent = () => {
    if (!selectedModule || !uploadTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (uploadType === 'video' && !uploadUrl.trim()) {
      toast.error('Please enter a video URL');
      return;
    }

    if (uploadType === 'pdf' && !uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const updatedCourses = courses.map(course => ({
      ...course,
      modules: course.modules.map(module => {
        if (module.id === selectedModule.id) {
          if (uploadType === 'video') {
            return {
              ...module,
              videos: [...module.videos, {
                id: Date.now(),
                title: uploadTitle,
                url: uploadUrl,
                duration: '0:00'
              }]
            };
          } else {
            return {
              ...module,
              pdfs: [...module.pdfs, {
                id: Date.now(),
                title: uploadTitle,
                size: uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB` : '0 MB'
              }]
            };
          }
        }
        return module;
      })
    }));

    setCourses(updatedCourses);
    if (selectedCourse) {
      setSelectedCourse(updatedCourses.find(c => c.id === selectedCourse.id) || null);
    }
    setUploadTitle('');
    setUploadUrl('');
    setUploadFile(null);
    setShowUploadDialog(false);
    toast.success(`${uploadType === 'video' ? 'Video' : 'PDF'} uploaded successfully!`);
  };

  const toggleModuleExpansion = (moduleId: number) => {
    if (!selectedCourse) return;

    const updatedCourses = courses.map(course => 
      course.id === selectedCourse.id
        ? {
            ...course,
            modules: course.modules.map(m => 
              m.id === moduleId ? { ...m, expanded: !m.expanded } : m
            )
          }
        : course
    );

    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find(c => c.id === selectedCourse.id) || null);
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
      } else if (uploadType === 'video' && file.type.startsWith('video/')) {
        setUploadFile(file);
        setUploadTitle(file.name);
      } else {
        toast.error(`Please upload a valid ${uploadType === 'video' ? 'video' : 'PDF'} file`);
      }
    }
  };

  const handleDeleteCourse = (courseId: number) => {
    setCourses(courses.filter(c => c.id !== courseId));
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null);
    }
    toast.success('Course deleted successfully!');
  };

  const handleDeleteModule = (moduleId: number) => {
    if (!selectedCourse) return;

    const updatedCourses = courses.map(course =>
      course.id === selectedCourse.id
        ? { ...course, modules: course.modules.filter(m => m.id !== moduleId) }
        : course
    );

    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find(c => c.id === selectedCourse.id) || null);
    toast.success('Module deleted successfully!');
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
              <h3 className="mb-4">My Courses ({courses.length})</h3>
              <div className="space-y-2">
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCourse?.id === course.id
                        ? 'bg-primary text-white'
                        : 'bg-secondary/20 hover:bg-secondary/40'
                    }`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <BookOpen className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{course.name}</p>
                          <p className={`text-xs mt-1 ${
                            selectedCourse?.id === course.id 
                              ? 'text-white/80' 
                              : 'text-muted-foreground'
                          }`}>
                            {course.modules.length} modules
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-6 w-6 p-0 ${
                          selectedCourse?.id === course.id 
                            ? 'hover:bg-white/20 text-white' 
                            : 'hover:bg-destructive/20 text-destructive'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No courses yet</p>
                    <p className="text-xs">Create your first course to get started</p>
                  </div>
                )}
              </div>
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
                      {selectedCourse.modules.length} Modules
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
                    {selectedCourse.modules.map((module, index) => (
                      <motion.div
                        key={module.id}
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
                                    {module.videos.length} videos
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {module.pdfs.length} PDFs
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleModuleExpansion(module.id)}
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
                                onClick={() => handleDeleteModule(module.id)}
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
                              {/* Videos */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm">Videos</p>
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
                                </div>
                                <div className="space-y-2">
                                  {module.videos.map((video) => (
                                    <div
                                      key={video.id}
                                      className="flex items-center justify-between p-2 bg-card rounded border border-border"
                                    >
                                      <div className="flex items-center gap-2">
                                        <PlayCircle className="h-4 w-4 text-primary" />
                                        <div>
                                          <p className="text-xs">{video.title}</p>
                                          <p className="text-xs text-muted-foreground">{video.duration}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {module.videos.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-2">No videos yet</p>
                                  )}
                                </div>
                              </div>

                              {/* PDFs */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm">PDF Materials</p>
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
                                <div className="space-y-2">
                                  {module.pdfs.map((pdf) => (
                                    <div
                                      key={pdf.id}
                                      className="flex items-center justify-between p-2 bg-card rounded border border-border"
                                    >
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <div>
                                          <p className="text-xs">{pdf.title}</p>
                                          <p className="text-xs text-muted-foreground">{pdf.size}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {module.pdfs.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-2">No PDFs yet</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                    {selectedCourse.modules.length === 0 && (
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
                <Label>Video URL</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports YouTube, Vimeo, and direct video URLs
                </p>
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
