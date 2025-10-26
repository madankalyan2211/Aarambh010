import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Lock,
  Clock,
  ChevronRight,
  ChevronDown,
  Award,
  Download,
  ExternalLink,
  Upload,
  Sparkles
} from 'lucide-react';
import { getCourseContentAPI, generateLessonSummary } from '../services/api.service';
import { OllamaLogo } from './ui/ollama-logo';

// Define TypeScript interfaces for our data structures
interface Lesson {
  id?: string;
  _id?: string;
  title: string;
  videoUrl?: string;
  pdfUrl?: string;
  duration: number;
  order: number;
  type: 'video' | 'pdf';
  isPreview?: boolean;
  resources?: Array<{ title: string; url: string }>;
  aiSummary?: string; // Add AI summary field
}

interface Module {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

// Add a new interface for lesson with module info
interface LessonWithModuleInfo extends Lesson {
  moduleId: string;
}

interface Course {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  enrolledCount: number;
  maxStudents: number;
  instructor: {
    name: string;
    email: string;
  } | null;
  modules: Module[];
  image?: string;
}

interface CourseContentViewerProps {
  courseId: string;
  onBack: () => void;
}

export function CourseContentViewer({ courseId, onBack }: CourseContentViewerProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({}); // Store AI summaries
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryProgress, setSummaryProgress] = useState(0);

  useEffect(() => {
    fetchCourseContent();
    // Load completed lessons from localStorage
    const saved = localStorage.getItem(`course_${courseId}_progress`);
    if (saved) {
      setCompletedLessons(new Set(JSON.parse(saved)));
    }
  }, [courseId]);

  const fetchCourseContent = async () => {
    if (!courseId) {
      setError('No course ID provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Fetch from actual API
      const response = await getCourseContentAPI(courseId);
      
      if (response.success && response.data) {
        setCourse(response.data);
        // Auto-select first lesson if modules exist
        if (response.data.modules && response.data.modules.length > 0) {
          const firstModule = response.data.modules[0];
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            const firstLesson = firstModule.lessons[0];
            setSelectedLesson(firstLesson);
          }
        }
      } else {
        setError(response.message || 'Failed to load course content');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while loading the course');
    } finally {
      setLoading(false);
    }
  };

  // Function to generate AI summary for a lesson
  const generateAISummary = async (lesson: Lesson) => {
    const lessonId = lesson.id || lesson._id || '';
    
    // Check if we already have a summary
    if (aiSummaries[lessonId]) {
      return aiSummaries[lessonId];
    }
    
    // Find the module ID for this lesson
    let moduleId = '';
    if (course) {
      for (const module of course.modules) {
        if (module.lessons.some(l => (l.id || l._id) === lessonId)) {
          moduleId = module.id || module._id || '';
          break;
        }
      }
    }
    
    if (!moduleId) {
      console.error('Could not find module ID for lesson');
      return "Unable to generate summary at this time.";
    }
    
    // Set loading state
    setIsGeneratingSummary(true);
    setSummaryProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setSummaryProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      // Call the API to generate AI summary
      const response = await generateLessonSummary(courseId, moduleId, lessonId);
      
      // Complete the progress
      clearInterval(progressInterval);
      setSummaryProgress(100);
      
      if (response.success && response.data?.summary) {
        // Store the summary
        setAiSummaries(prev => ({
          ...prev,
          [lessonId]: response.data.summary
        }));
        
        return response.data.summary;
      } else {
        throw new Error(response.message || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      clearInterval(progressInterval);
      return "Unable to generate summary at this time.";
    } finally {
      setTimeout(() => {
        setIsGeneratingSummary(false);
        setSummaryProgress(0);
      }, 500);
    }
  };

  const toggleModuleExpand = (moduleId: number) => {
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

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      // Save to localStorage
      localStorage.setItem(`course_${courseId}_progress`, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const getTotalLessons = () => {
    if (!course || !course.modules) return 0;
    return course.modules.reduce((total: number, module: Module) => 
      total + (module.lessons?.length || 0), 0
    );
  };

  const getProgress = () => {
    const total = getTotalLessons();
    if (total === 0) return 0;
    return Math.round((completedLessons.size / total) * 100);
  };

  const renderLessonContent = () => {
    if (!selectedLesson) {
      return (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Select a Lesson</h3>
          <p className="text-muted-foreground">
            Choose a lesson from the sidebar to start learning
          </p>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Lesson Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {selectedLesson.type === 'video' && <PlayCircle className="h-5 w-5" style={{ color: '#3B82F6' }} />}
            {selectedLesson.type === 'pdf' && <Download className="h-5 w-5" style={{ color: '#3B82F6' }} />}
            <h2 className="text-2xl font-bold">{selectedLesson.title || 'Lesson'}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{selectedLesson.duration || 0} min</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {selectedLesson.type ? selectedLesson.type.toUpperCase() : 'LESSON'}
            </Badge>
            {selectedLesson.isPreview && (
              <Badge variant="outline" className="text-xs" style={{ borderColor: '#3B82F6', color: '#3B82F6' }}>
                Free Preview
              </Badge>
            )}
          </div>
        </div>

        {/* Video Player - Only for video lessons */}
        {selectedLesson.type === 'video' && (
          <Card className="p-0 overflow-hidden">
            {selectedLesson.videoUrl ? (
              <>
                {isYouTubeVideo(selectedLesson.videoUrl) ? (
                  <div className="w-full bg-secondary/20" style={{ minHeight: '650px' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(selectedLesson.videoUrl)}
                      className="w-full h-full"
                      allowFullScreen
                      title={selectedLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{ minHeight: '650px' }}
                    />
                  </div>
                ) : isVimeoVideo(selectedLesson.videoUrl) ? (
                  <div className="w-full bg-secondary/20" style={{ minHeight: '650px' }}>
                    <iframe
                      src={getVimeoEmbedUrl(selectedLesson.videoUrl)}
                      className="w-full h-full"
                      allowFullScreen
                      title={selectedLesson.title}
                      allow="autoplay; fullscreen; picture-in-picture"
                      style={{ minHeight: '650px' }}
                    />
                  </div>
                ) : (
                  // For uploaded videos, we'll use a video player
                  <div className="w-full bg-secondary/20 flex items-center justify-center" style={{ minHeight: '650px' }}>
                    <video 
                      src={selectedLesson.videoUrl} 
                      className="w-full h-full object-contain"
                      controls
                      controlsList="nodownload"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full bg-secondary/20 flex items-center justify-center" style={{ minHeight: '650px' }}>
                <div className="text-center">
                  <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No video available for this lesson</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* AI-Generated Summary - Only for video lessons */}
        {selectedLesson.type === 'video' && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" style={{ color: '#3B82F6' }} />
              <h3 className="font-bold">AI-Generated Summary</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {aiSummaries[selectedLesson.id || selectedLesson._id || ''] ? (
                <p className="text-foreground leading-relaxed">
                  {aiSummaries[selectedLesson.id || selectedLesson._id || '']}
                </p>
              ) : (
                <div className="text-center py-4">
                  {isGeneratingSummary ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <OllamaLogo className="animate-pulse" style={{ color: '#3B82F6' }} />
                        <span className="text-sm font-medium">Ollama is analyzing your video content...</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div 
                          className="bg-[#3B82F6] h-2.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${summaryProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {summaryProgress < 30 && 'Analyzing video content...'}
                        {summaryProgress >= 30 && summaryProgress < 60 && 'Extracting key concepts...'}
                        {summaryProgress >= 60 && summaryProgress < 90 && 'Generating summary...'}
                        {summaryProgress >= 90 && 'Almost done...'}
                      </p>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => generateAISummary(selectedLesson)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Summary
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* PDF Viewer - Only for PDF lessons */}
        {selectedLesson.type === 'pdf' && selectedLesson.pdfUrl && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">PDF Document</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(selectedLesson.pdfUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(selectedLesson.pdfUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </Card>
        )}

        {/* Mark as Complete Button */}
        <Card className="p-4">
          <Button
            className="w-full"
            variant={completedLessons.has(selectedLesson.id || selectedLesson._id || '') ? 'outline' : 'default'}
            style={!completedLessons.has(selectedLesson.id || selectedLesson._id || '') ? { 
              backgroundColor: '#3B82F6',
              color: 'white'
            } : {}}
            onClick={() => toggleLessonComplete(selectedLesson.id || selectedLesson._id || '')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {completedLessons.has(selectedLesson.id || selectedLesson._id || '') ? 'Completed ✓' : 'Mark as Complete'}
          </Button>
        </Card>
      </div>
    );
  };

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

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 animate-pulse mx-auto mb-4" style={{ color: '#3B82F6' }} />
          <p className="text-muted-foreground">Loading course content...</p>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <p className="text-lg text-muted-foreground mb-2">
            {error || 'Course not found'}
          </p>
          {error && (
            <p className="text-sm text-muted-foreground mb-4">
              Please make sure you are logged in and try again.
            </p>
          )}
          <Button className="mt-4" onClick={onBack}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
              <p className="text-muted-foreground mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline" style={{ borderColor: '#3B82F6', color: '#3B82F6' }}>
                  {course.difficulty}
                </Badge>
                {course.tags?.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Progress Card */}
            <Card className="p-6 w-64">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-2 flex items-center justify-center">
                  <svg className="absolute transform -rotate-90" width="128" height="128" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="11"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#3B82F6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - getProgress() / 100)}`}
                      className="transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="relative z-10 flex items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: '#3B82F6' }}>
                      {getProgress()}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedLessons.size} of {getTotalLessons()} lessons completed
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar - Course Modules */}
          <div className="space-y-2">
            <Card className="p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" style={{ color: '#3B82F6' }} />
                Course Content
              </h3>
              <div className="space-y-1">
                {(course.modules || []).map((module: Module, moduleIdx: number) => (
                  <div key={module.id || module._id || `module-${moduleIdx}`}>
                    {/* Module Header */}
                    <button
                      className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={() => toggleModuleExpand(moduleIdx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Module {moduleIdx + 1}</p>
                          <p className="text-xs text-muted-foreground truncate">{module.title}</p>
                        </div>
                        {expandedModules.has(moduleIdx) ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </div>
                    </button>

                    {/* Lessons List */}
                    <AnimatePresence>
                      {expandedModules.has(moduleIdx) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-2 space-y-1 overflow-hidden"
                        >
                          {module.lessons?.map((lesson: Lesson, lessonIdx: number) => (
                            <button
                              key={lesson.id || lesson._id || `lesson-${moduleIdx}-${lessonIdx}`}
                              className={`w-full text-left p-2 rounded-lg transition-colors ${
                                (selectedLesson?.id || selectedLesson?._id) === (lesson.id || lesson._id)
                                  ? 'bg-[#3B82F6]/10 border-l-2 border-[#3B82F6]'
                                  : 'hover:bg-secondary/30'
                              }`}
                              onClick={() => setSelectedLesson(lesson)}
                            >
                              <div className="flex items-center gap-2">
                                {completedLessons.has(lesson.id || lesson._id || '') ? (
                                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#3B82F6' }} />
                                ) : lesson.type === 'video' ? (
                                  <PlayCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                ) : lesson.type === 'pdf' ? (
                                  <Download className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                ) : (
                                  <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{lesson.title}</p>
                                  <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {(!course.modules || course.modules.length === 0) && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No modules available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div>
            {renderLessonContent()}
          </div>
        </div>
      </div>
    </div>
  );
}