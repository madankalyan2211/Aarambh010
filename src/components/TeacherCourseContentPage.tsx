import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Edit, 
  FileText, 
  Loader2, 
  Play, 
  Plus, 
  Trash2,
  Upload,
  Download,
  ExternalLink,
  PlayCircle,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { 
  getCourseContentAPI,
  updateCourseContent,
  addModule,
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson
} from '../services/api.service';
import { useToast } from './ui/toast';
import { motion } from 'motion/react';

interface Module {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  _id?: string;
  id?: string;
  title: string;
  videoUrl?: string;
  duration: number;
  order: number;
  type: 'video' | 'pdf';
}

interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  maxStudents: number;
  isPublished: boolean;
  modules: Module[];
}

interface TeacherCourseContentPageProps {
  courseId: string;
  onBack: () => void;
}

// Module Form Component
const ModuleForm = ({ 
  module, 
  onSave, 
  onCancel,
  saving
}: { 
  module?: Module; 
  onSave: (data: Omit<Module, '_id' | 'id' | 'lessons'>) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [title, setTitle] = useState(module?.title || '');
  const [description, setDescription] = useState(module?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      order: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Module Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter module title"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter module description"
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </form>
  );
};

// Lesson Form Component
const LessonForm = ({ 
  lesson, 
  onSave, 
  onCancel,
  saving
}: { 
  lesson?: Lesson; 
  onSave: (data: Omit<Lesson, '_id' | 'id'>) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [title, setTitle] = useState(lesson?.title || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || '');
  const [duration, setDuration] = useState(lesson?.duration?.toString() || '');
  const [type, setType] = useState<Lesson['type']>(lesson?.type || 'video');

  // Helper functions for video handling
  const isYouTubeVideo = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isVimeoVideo = (url: string) => {
    return url.includes('vimeo.com');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    // Handle different YouTube URL formats
    let videoId = '';
    if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtube.com/embed')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getVimeoEmbedUrl = (url: string) => {
    // Extract Vimeo video ID
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      videoUrl: type === 'video' ? videoUrl : undefined,
      duration: parseInt(duration) || 0,
      order: 0, // Set default order value instead of removing it
      type,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="lesson-title">Lesson Title</Label>
        <Input
          id="lesson-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter lesson title"
          required
        />
      </div>
      <div>
        <Label htmlFor="lesson-type">Lesson Type</Label>
        <Select value={type} onValueChange={(value: string) => setType(value as Lesson['type'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
      </div>
    
      {type === 'video' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter YouTube or Vimeo URL"
            />
          </div>
          
          {/* Video Preview */}
          {videoUrl && (
            <div className="space-y-2">
              <Label>Video Preview</Label>
              <div className="w-full bg-secondary/20 rounded-lg overflow-hidden" style={{ minHeight: '500px' }}>
                {isYouTubeVideo(videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(videoUrl)}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{ minHeight: '500px' }}
                  />
                ) : isVimeoVideo(videoUrl) ? (
                  <iframe
                    src={getVimeoEmbedUrl(videoUrl)}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Preview"
                    allow="autoplay; fullscreen; picture-in-picture"
                    style={{ minHeight: '500px' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <video 
                      src={videoUrl} 
                      className="max-h-full max-w-full object-contain"
                      controls
                      controlsList="nodownload"
                      style={{ maxHeight: '500px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export function TeacherCourseContentPage({ courseId, onBack }: TeacherCourseContentPageProps) {
  const { showToast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  
  // State for managing forms
  const [editingModule, setEditingModule] = useState<{ moduleId: string; module: Module } | null>(null);
  const [addingModule, setAddingModule] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lessonId: string; lesson: Lesson } | null>(null);
  const [addingLesson, setAddingLesson] = useState<{ moduleId: string } | null>(null);

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  const fetchCourseContent = async () => {
    setLoading(true);
    try {
      const response = await getCourseContentAPI(courseId);
      if (response.success) {
        setCourse(response.data);
        // Expand the first module by default
        if (response.data.modules && response.data.modules.length > 0) {
          const firstModuleId = response.data.modules[0]._id || response.data.modules[0].id;
          if (firstModuleId) {
            setExpandedModules(new Set([firstModuleId]));
          }
        }
      } else {
        showToast('error', 'Error', response.message || 'Failed to load course content');
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      showToast('error', 'Error', 'Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleUpdateCourse = async (courseData: Partial<Course>) => {
    setSaving(true);
    try {
      const response = await updateCourseContent(courseId, courseData);
      if (response.success) {
        showToast('success', 'Success', 'Course updated successfully');
        fetchCourseContent();
      } else {
        showToast('error', 'Error', response.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      showToast('error', 'Error', 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = async (moduleData: Omit<Module, '_id' | 'id' | 'lessons'>) => {
    setSaving(true);
    try {
      const response = await addModule(courseId, moduleData);
      if (response.success) {
        showToast('success', 'Success', 'Module added successfully');
        fetchCourseContent();
        setAddingModule(false);
      } else {
        showToast('error', 'Error', response.message || 'Failed to add module');
      }
    } catch (error) {
      console.error('Error adding module:', error);
      showToast('error', 'Error', 'Failed to add module');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateModule = async (moduleId: string, moduleData: Partial<Module>) => {
    setSaving(true);
    try {
      const response = await updateModule(courseId, moduleId, moduleData);
      if (response.success) {
        showToast('success', 'Success', 'Module updated successfully');
        fetchCourseContent();
        setEditingModule(null);
      } else {
        showToast('error', 'Error', response.message || 'Failed to update module');
      }
    } catch (error) {
      console.error('Error updating module:', error);
      showToast('error', 'Error', 'Failed to update module');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this module? This will also delete all lessons in this module.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await deleteModule(courseId, moduleId);
      if (response.success) {
        showToast('success', 'Success', 'Module deleted successfully');
        fetchCourseContent();
      } else {
        showToast('error', 'Error', response.message || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      showToast('error', 'Error', 'Failed to delete module');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (moduleId: string, lessonData: Omit<Lesson, '_id' | 'id'>) => {
    setSaving(true);
    try {
      const response = await addLesson(courseId, moduleId, lessonData);
      if (response.success) {
        showToast('success', 'Success', 'Lesson added successfully');
        fetchCourseContent();
        setAddingLesson(null);
      } else {
        showToast('error', 'Error', response.message || 'Failed to add lesson');
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      showToast('error', 'Error', 'Failed to add lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLesson = async (moduleId: string, lessonId: string, lessonData: Partial<Lesson>) => {
    setSaving(true);
    try {
      const response = await updateLesson(courseId, moduleId, lessonId, lessonData);
      if (response.success) {
        showToast('success', 'Success', 'Lesson updated successfully');
        fetchCourseContent();
        setEditingLesson(null);
      } else {
        showToast('error', 'Error', response.message || 'Failed to update lesson');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      showToast('error', 'Error', 'Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await deleteLesson(courseId, moduleId, lessonId);
      if (response.success) {
        showToast('success', 'Success', 'Lesson deleted successfully');
        fetchCourseContent();
      } else {
        showToast('error', 'Error', response.message || 'Failed to delete lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showToast('error', 'Error', 'Failed to delete lesson');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested course could not be loaded.</p>
          <Button onClick={onBack}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={onBack} 
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{course.name}</h1>
                <p className="text-sm text-muted-foreground">Manage course content</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('content')}
                className={activeTab === 'content' ? 'bg-primary text-primary-foreground' : ''}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Content
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('settings')}
                className={activeTab === 'settings' ? 'bg-primary text-primary-foreground' : ''}
              >
                <Edit className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleUpdateCourse({ isPublished: !course.isPublished })}
                className={course.isPublished ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {course.isPublished ? 'Published' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === 'content' ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Course Modules and Lessons */}
            <div>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Course Content</h2>
                  <Button 
                    onClick={() => setAddingModule(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </div>

                {/* Add Module Form */}
                {addingModule && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 border rounded-lg"
                  >
                    <h3 className="font-semibold mb-4">Add New Module</h3>
                    <ModuleForm 
                      onSave={handleAddModule}
                      onCancel={() => setAddingModule(false)}
                      saving={saving}
                    />
                  </motion.div>
                )}

                {/* Edit Module Form */}
                {editingModule && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 border rounded-lg"
                  >
                    <h3 className="font-semibold mb-4">Edit Module</h3>
                    <ModuleForm 
                      module={editingModule.module}
                      onSave={(data) => handleUpdateModule(editingModule.moduleId, data)}
                      onCancel={() => setEditingModule(null)}
                      saving={saving}
                    />
                  </motion.div>
                )}

                {course.modules.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No modules yet</h3>
                    <p className="text-muted-foreground mb-4">Add your first module to get started</p>
                    <Button 
                      onClick={() => setAddingModule(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.modules
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((module) => {
                        const moduleId = module._id || module.id || '';
                        const isExpanded = expandedModules.has(moduleId);
                        
                        return (
                          <motion.div
                            key={moduleId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border rounded-lg overflow-hidden"
                          >
                            {/* Module Header */}
                            <div 
                              className="flex items-center justify-between p-4 bg-muted cursor-pointer hover:bg-muted/80"
                              onClick={() => toggleModule(moduleId)}
                            >
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                                <h3 className="font-semibold">{module.title}</h3>
                                <span className="text-sm text-muted-foreground">
                                  ({module.lessons.length} lessons)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingModule({ moduleId, module });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteModule(moduleId);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Module Content (Lessons) */}
                            {isExpanded && (
                              <div className="p-4 bg-background">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium">Lessons</h4>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setAddingLesson({ moduleId })}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Lesson
                                  </Button>
                                </div>

                                {/* Add Lesson Form */}
                                {addingLesson && addingLesson.moduleId === moduleId && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 border rounded-lg"
                                  >
                                    <h5 className="font-semibold mb-3">Add New Lesson</h5>
                                    <LessonForm 
                                      onSave={(data) => handleAddLesson(moduleId, data)}
                                      onCancel={() => setAddingLesson(null)}
                                      saving={saving}
                                    />
                                  </motion.div>
                                )}

                                {/* Edit Lesson Form */}
                                {editingLesson && editingLesson.moduleId === moduleId && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 border rounded-lg"
                                  >
                                    <h5 className="font-semibold mb-3">Edit Lesson</h5>
                                    <LessonForm 
                                      lesson={editingLesson.lesson}
                                      onSave={(data) => handleUpdateLesson(moduleId, editingLesson.lessonId, data)}
                                      onCancel={() => setEditingLesson(null)}
                                      saving={saving}
                                    />
                                  </motion.div>
                                )}

                                {module.lessons.length === 0 ? (
                                  <div className="text-center py-6 border rounded-lg">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">No lessons in this module</p>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="mt-2"
                                      onClick={() => setAddingLesson({ moduleId })}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Lesson
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {module.lessons
                                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                                      .map((lesson) => {
                                        const lessonId = lesson._id || lesson.id || '';
                                        return (
                                          <div 
                                            key={lessonId} 
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                          >
                                            <div className="flex items-center gap-3">
                                              {lesson.type === 'video' ? (
                                                <PlayCircle className="h-5 w-5 text-primary" />
                                              ) : lesson.type === 'pdf' ? (
                                                <FileText className="h-5 w-5 text-primary" />
                                              ) : (
                                                <FileText className="h-5 w-5 text-primary" />
                                              )}
                                              <div>
                                                <p className="font-medium">{lesson.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                  <span className="capitalize">{lesson.type}</span>
                                                  {lesson.duration > 0 && (
                                                    <>
                                                      <span>•</span>
                                                      <span>{lesson.duration} min</span>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => setEditingLesson({ moduleId, lessonId, lesson })}
                                              >
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => handleDeleteLesson(moduleId, lessonId)}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </Card>
            </div>


          </div>
        ) : (
          /* Settings Tab */
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Course Settings</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input 
                    id="courseName" 
                    value={course.name} 
                    onChange={(e) => setCourse({...course, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="courseDescription">Description</Label>
                  <Textarea 
                    id="courseDescription" 
                    value={course.description} 
                    onChange={(e) => setCourse({...course, description: e.target.value})}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courseCategory">Category</Label>
                    <Select 
                      value={course.category} 
                      onValueChange={(value: string) => setCourse({...course, category: value})}
                    >
                      <SelectTrigger id="courseCategory" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Programming">Programming</SelectItem>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="courseDifficulty">Difficulty</Label>
                    <Select 
                      value={course.difficulty} 
                      onValueChange={(value: string) => setCourse({...course, difficulty: value as any})}
                    >
                      <SelectTrigger id="courseDifficulty" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="maxStudents">Maximum Students</Label>
                  <Input 
                    id="maxStudents" 
                    type="number" 
                    value={course.maxStudents} 
                    onChange={(e) => setCourse({...course, maxStudents: parseInt(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={onBack}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleUpdateCourse({
                      name: course.name,
                      description: course.description,
                      category: course.category,
                      difficulty: course.difficulty,
                      maxStudents: course.maxStudents
                    })}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}