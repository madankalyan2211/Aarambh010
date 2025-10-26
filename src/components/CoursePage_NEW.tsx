import { useState, useEffect } from 'react';
import { Page, UserRole } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { BookOpen, Users, Loader2, GraduationCap, Award } from 'lucide-react';
import { getAllCoursesAPI } from '../services/api.service';

// Define the course interface
interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  enrolledCount?: number;
  maxStudents?: number;
  tags?: string[];
}

interface CoursePageProps {
  onNavigate: (page: Page) => void;
  userRole: UserRole;
}

export function CoursePage({ onNavigate, userRole }: CoursePageProps) {
  // Mark parameters as used to avoid TypeScript warnings
  void onNavigate;
  void userRole;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getAllCoursesAPI();
      console.log('Courses response:', response);

      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
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
        return '#3B82F6'; // blue
      case 'Advanced':
        return '#3B82F6'; // blue
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
          className="mb-8"
        >
          <h1>All Courses 📚</h1>
          <p className="text-muted-foreground">
            Browse and explore all available courses
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-[#3B82F6]/10 to-secondary/10 border-[#3B82F6]/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6" style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>{courses.length}</p>
                <p className="text-xs text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-accent/10 to-[#3B82F6]/10 border-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">
                  {categories.length - 1}
                </p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                <Award className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter(c => c.difficulty === 'Beginner').length}
                </p>
                <p className="text-xs text-muted-foreground">Beginner Friendly</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-[#3B82F6] hover:bg-accent' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#3B82F6' }} />
            <p className="text-muted-foreground">Loading courses...</p>
          </Card>
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className="p-6 h-full flex flex-col hover:shadow-xl transition-all border-secondary hover:border-[#3B82F6]/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6" style={{ color: '#3B82F6' }} />
                    </div>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        borderColor: getDifficultyColor(course.difficulty),
                        color: getDifficultyColor(course.difficulty)
                      }}
                    >
                      {course.difficulty}
                    </Badge>
                  </div>

                  <h3 className="font-bold mb-2">{course.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {course.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      {course.tags && course.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.enrolledCount || 0}/{course.maxStudents || 50}</span>
                      </div>
                      <span className="text-muted-foreground">{course.maxStudents || 50} seats</span>
                    </div>

                    <Button 
                      className="w-full" 
                      style={{ backgroundColor: '#3B82F6', color: 'white' }}
                    >
                      Enroll Now
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No Courses Found</h3>
            <p className="text-muted-foreground">
              {selectedCategory !== 'All' 
                ? `No courses available in ${selectedCategory} category`
                : 'No courses available at the moment'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}