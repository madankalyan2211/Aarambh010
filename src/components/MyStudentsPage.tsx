import { useState, useEffect } from 'react';
import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Users, BookOpen, ClipboardList, Mail, CheckCircle2, GraduationCap, TrendingUp, Loader2 } from 'lucide-react';
import { getMyStudents } from '../services/api.service';

interface MyStudentsPageProps {
  onNavigate: (page: Page) => void;
  userEmail: string;
}

export function MyStudentsPage({ onNavigate, userEmail }: MyStudentsPageProps) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [myStudents, setMyStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch students who enrolled with this teacher
  useEffect(() => {
    fetchMyStudents();
  }, []);

  const fetchMyStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyStudents();
      console.log('My Students API response:', response);
      
      if (response.success && response.data) {
        setMyStudents(response.data);
      } else {
        setError('Failed to load students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
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
          <h1>My Students 👨‍🎓</h1>
          <p className="text-muted-foreground">
            View your class sections and enrolled students
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{myStudents.length}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">
                    {loading ? '...' : myStudents.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Enrolled Students</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your students...</p>
          </Card>
        ) : error ? (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2 text-accent">Error Loading Students</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={fetchMyStudents}
              className="bg-primary hover:bg-accent"
            >
              Try Again
            </Button>
          </Card>
        ) : myStudents.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2>Your Students ({myStudents.length})</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myStudents.map((student, index) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className="p-4 hover:shadow-lg transition-all border-secondary hover:border-primary/50">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {student.avatar || '👨‍🎓'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </p>
                        {student.bio && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {student.bio}
                          </p>
                        )}
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs border border-primary text-primary">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Student
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No Students Yet</h3>
            <p className="text-muted-foreground">
              Students who enroll with you as their teacher will appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
