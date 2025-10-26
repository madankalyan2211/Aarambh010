import { useState, useEffect } from 'react';
import { Page } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Flame, Bot, TrendingUp, Users, BookOpen, Award, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingProps {
  onNavigate: (page: Page) => void;
}

const courses = [
  {
    id: 1,
    title: 'AI & Machine Learning Basics',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwZGVzaWdufGVufDF8fHx8MTc2MDQ2NDk0NHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Master the fundamentals of artificial intelligence',
    students: 2543,
  },
  {
    id: 2,
    title: 'Web Development Masterclass',
    image: 'https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NjAzOTQxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Build modern web applications from scratch',
    students: 3891,
  },
  {
    id: 3,
    title: 'Digital Marketing Strategy',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2MDQxNzY0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Learn to create winning marketing campaigns',
    students: 1876,
  },
];

const leaderboard = [
  { name: 'Sarah Chen', points: 8540, avatar: '👩‍💻' },
  { name: 'Alex Rivera', points: 7892, avatar: '👨‍🎓' },
  { name: 'Emma Wilson', points: 7234, avatar: '👩‍🎓' },
  { name: 'Michael Brown', points: 6891, avatar: '👨‍💼' },
  { name: 'Lisa Anderson', points: 6543, avatar: '👩‍🏫' },
];

const communityFeed = [
  { user: 'John Doe', action: 'completed AI Basics Module 5', time: '2m ago', avatar: '👨‍💻' },
  { user: 'Jane Smith', action: 'earned 7-Day Streak Badge 🔥', time: '15m ago', avatar: '👩‍🎓' },
  { user: 'Mike Johnson', action: 'started discussion on React Hooks', time: '1h ago', avatar: '👨‍🎓' },
  { user: 'Sarah Lee', action: 'achieved top score in Quiz #12', time: '2h ago', avatar: '👩‍💻' },
];

export function Landing({ onNavigate }: LandingProps) {
  const [typedText, setTypedText] = useState('');
  const [currentCourse, setCurrentCourse] = useState(0);
  const fullText = 'Learn. Connect. Grow.';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCourse((prev) => (prev + 1) % courses.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-primary/10 via-secondary/20 to-background py-20 px-4 overflow-hidden"
      >
        <div className="container mx-auto text-center relative z-10">
          <motion.h1
            className="text-5xl md:text-7xl mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {typedText}
            <span className="animate-pulse">|</span>
          </motion.h1>
          
          <motion.p
            className="text-xl mb-8 text-muted-foreground"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            AI-Powered Learning Management System
          </motion.p>
          
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              className="gap-2 bg-primary hover:bg-accent transition-all transform hover:scale-105"
              onClick={() => onNavigate('login')}
            >
              👩‍🎓 I'm a Student
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-105"
              onClick={() => onNavigate('login')}
            >
              👨‍🏫 I'm a Teacher
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-12">
        {/* Course Highlights & Leaderboard */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Course Carousel */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2>Trending Courses</h2>
            </div>
            <motion.div
              key={currentCourse}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden bg-secondary/30 border-primary/20">
                <div className="relative h-64">
                  <ImageWithFallback
                    src={courses[currentCourse].image}
                    alt={courses[currentCourse].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-accent text-white">Trending</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2">{courses[currentCourse].title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {courses[currentCourse].description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {courses[currentCourse].students} students
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
            <div className="flex justify-center gap-2 mt-4">
              {courses.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCourse(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentCourse ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <h2>Top Learners</h2>
            </div>
            <Card className="p-4 border-accent">
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="text-2xl">{user.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.points} XP</p>
                    </div>
                    <Badge variant="outline" className="text-accent border-accent">
                      #{index + 1}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Learning Streaks & AI Buddy */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Learning Streaks */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl"
                >
                  <Flame className="h-16 w-16 text-accent" />
                </motion.div>
                <div>
                  <h3>Keep Your Streak Going!</h3>
                  <p className="text-muted-foreground">
                    Join thousands of learners maintaining daily streaks
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-accent text-white">🔥 7-Day Streak</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* AI Learning Buddy */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
              <div className="flex items-center gap-4">
                <div className="text-6xl">
                  <Bot className="h-16 w-16 text-primary" />
                </div>
                <div>
                  <h3>AI Learning Buddy</h3>
                  <p className="text-muted-foreground">
                    Get personalized course recommendations powered by AI
                  </p>
                  <Button size="sm" className="mt-2 bg-primary hover:bg-accent">
                    Try It Now
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Community Pulse */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2>Community Pulse</h2>
          </div>
          <Card className="p-4 bg-muted/30">
            <div className="space-y-3">
              {communityFeed.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card hover:bg-secondary/20 transition-colors"
                >
                  <div className="text-2xl">{item.avatar}</div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{item.user}</span> {item.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
