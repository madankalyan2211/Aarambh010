import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { Users, BookOpen, Activity, AlertTriangle, Server, TrendingUp, Trash2, Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { getAdminStats, getAdminUsers, getAdminCourses, getSystemHealth, getDailyActiveUsers, getEnrollmentTrend, deleteUser, deleteCourse, createUser, createCourse, searchUsers } from '../services/api.service';
import { useToast } from './ui/toast';

interface AdminPanelProps {
  onNavigate: (page: Page) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  enrolled: string | number;
  courses: string | number;
  createdAt: string;
  lastLogin: string;
}

interface Course {
  id: string;
  name: string;
  students: number;
  teacher: string;
  status: string;
  createdAt: string;
}

interface Stats {
  userCount: number;
  courseCount: number;
  assignmentCount: number;
  engagementRate: number;
  flaggedSubmissions: number;
}

interface SystemHealth {
  uptime: number;
  dbStats: any;
  activeSessions: number;
  serverTime: string;
}

interface DailyActiveUsersData {
  date: string;
  users: number;
}

interface EnrollmentTrendData {
  month: string;
  enrolled: number;
}

// FlaggedSubmission interface removed as security tab is no longer used

// Form data interfaces
interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface CreateCourseFormData {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  maxStudents: number;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Store all users for search
  const [courses, setCourses] = useState<Course[]>([]);
  // flaggedSubmissions state removed as security tab is no longer used
  const [stats, setStats] = useState<Stats>({
    userCount: 0,
    courseCount: 0,
    assignmentCount: 0,
    engagementRate: 0,
    flaggedSubmissions: 0
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    uptime: 0,
    dbStats: {},
    activeSessions: 0,
    serverTime: ''
  });
  const [dailyActiveUsersData, setDailyActiveUsersData] = useState<DailyActiveUsersData[]>([]);
  const [enrollmentTrendData, setEnrollmentTrendData] = useState<EnrollmentTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const [createUserFormData, setCreateUserFormData] = useState<CreateUserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [createCourseFormData, setCreateCourseFormData] = useState<CreateCourseFormData>({
    name: '',
    description: '',
    category: 'General',
    difficulty: 'Beginner',
    maxStudents: 100
  });

  // Add state for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{type: 'user' | 'course', id: string, name: string} | null>(null);

  // Update the getUsers function to fetch course counts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await getAdminStats();
        if (statsResponse.success && statsResponse.data) {
          setStats({
            userCount: statsResponse.data.userCount || 0,
            courseCount: statsResponse.data.courseCount || 0,
            assignmentCount: statsResponse.data.assignmentCount || 0,
            engagementRate: statsResponse.data.engagementRate || 0,
            flaggedSubmissions: statsResponse.data.flaggedSubmissions || 0
          });
        }

        // Fetch users with course counts
        const usersResponse = await getAdminUsers();
        if (usersResponse.success && usersResponse.data) {
          // Fetch course data to calculate enrolled courses
          const coursesResponse = await getAdminCourses();
          const courseData = coursesResponse.success ? coursesResponse.data : [];
          
          const usersWithCourseCounts = usersResponse.data.map((user: User) => {
            let enrolledCount = 0;
            let teachingCount = 0;
            
            if (user.role === 'student') {
              // Count courses where this student is enrolled
              enrolledCount = courseData.filter((course: Course) => 
                course.students && Array.isArray(course.students) 
                  ? course.students.includes(user.id)
                  : course.students > 0 && courseData.some((c: Course) => c.id === course.id)
              ).length;
            } else if (user.role === 'teacher') {
              // Count courses where this teacher is teaching
              teachingCount = courseData.filter((course: Course) => 
                course.teacher && typeof course.teacher === 'string' && course.teacher.includes(user.name)
              ).length;
            }
            
            return {
              ...user,
              enrolled: user.role === 'student' ? enrolledCount : 'N/A',
              courses: user.role === 'teacher' ? teachingCount : 'N/A'
            };
          });
          
          setUsers(usersWithCourseCounts);
          setAllUsers(usersWithCourseCounts); // Store all users for search
        }

        // Fetch courses
        const coursesResponse = await getAdminCourses();
        if (coursesResponse.success && coursesResponse.data) {
          setCourses(coursesResponse.data);
        }

        // Fetch flagged submissions - removed as security tab is no longer used

        // Fetch system health
        const healthResponse = await getSystemHealth();
        if (healthResponse.success && healthResponse.data) {
          setSystemHealth(healthResponse.data);
        }

        // Fetch daily active users data
        const dailyActiveUsersResponse = await getDailyActiveUsers();
        if (dailyActiveUsersResponse.success && dailyActiveUsersResponse.data) {
          setDailyActiveUsersData(dailyActiveUsersResponse.data);
        }

        // Fetch enrollment trend data
        const enrollmentTrendResponse = await getEnrollmentTrend();
        if (enrollmentTrendResponse.success && enrollmentTrendResponse.data) {
          setEnrollmentTrendData(enrollmentTrendResponse.data);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // If search query is empty, show all users
      setUsers(allUsers);
      return;
    }
    
    try {
      const response = await searchUsers(searchQuery);
      if (response.success && response.data) {
        // Map the search results to match our User interface
        const searchResults = response.data.map((user: any) => ({
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: 'Active', // Default status for search results
          enrolled: 'N/A', // We don't have this data in search results
          courses: 'N/A', // We don't have this data in search results
          createdAt: '', // We don't have this data in search results
          lastLogin: '' // We don't have this data in search results
        }));
        setUsers(searchResults);
      } else {
        setUsers([]);
        showToast('warning', 'No Results', 'No users found matching your search query');
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast('error', 'Error', 'An error occurred while searching for users');
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // If the search box is cleared, show all users
    if (!e.target.value.trim()) {
      setUsers(allUsers);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeleteConfirmation({ type: 'user', id: userId, name: userName });
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    setDeleteConfirmation({ type: 'course', id: courseId, name: courseName });
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    try {
      let response;
      
      if (deleteConfirmation.type === 'user') {
        response = await deleteUser(deleteConfirmation.id);
        if (response.success) {
          // Remove user from state
          setUsers(users.filter(user => user.id !== deleteConfirmation.id));
          // Update user count in stats
          setStats({
            ...stats,
            userCount: stats.userCount - 1
          });
        }
      } else if (deleteConfirmation.type === 'course') {
        response = await deleteCourse(deleteConfirmation.id);
        if (response.success) {
          // Remove course from state
          setCourses(courses.filter(course => course.id !== deleteConfirmation.id));
          // Update course count in stats
          setStats({
            ...stats,
            courseCount: stats.courseCount - 1
          });
        }
      }
      
      if (response?.success) {
        setDeleteConfirmation(null);
        showToast('success', 'Success', `${deleteConfirmation.type === 'user' ? 'User' : 'Course'} deleted successfully`);
      } else {
        showToast('error', 'Error', response?.message || `Failed to delete ${deleteConfirmation.type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${deleteConfirmation.type}:`, error);
      showToast('error', 'Error', `An error occurred while deleting the ${deleteConfirmation.type}`);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Handle create user form input changes
  const handleCreateUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create course form input changes
  const handleCreateCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateCourseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create user form submission
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await createUser(createUserFormData);
      
      if (response.success) {
        showToast('success', 'Success', 'User created successfully');
        setShowCreateUserForm(false);
        setCreateUserFormData({
          name: '',
          email: '',
          password: '',
          role: 'student'
        });
        // Refresh users list
        const usersResponse = await getAdminUsers();
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data);
          // Update user count in stats
          setStats(prev => ({
            ...prev,
            userCount: usersResponse.data.length
          }));
        }
      } else {
        showToast('error', 'Error', response.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('error', 'Error', 'An error occurred while creating the user');
    }
  };

  // Handle create course form submission
  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await createCourse(createCourseFormData);
      
      if (response.success) {
        showToast('success', 'Success', 'Course created successfully');
        setShowCreateCourseForm(false);
        setCreateCourseFormData({
          name: '',
          description: '',
          category: 'General',
          difficulty: 'Beginner',
          maxStudents: 100
        });
        // Refresh courses list
        const coursesResponse = await getAdminCourses();
        if (coursesResponse.success && coursesResponse.data) {
          setCourses(coursesResponse.data);
          // Update course count in stats
          setStats(prev => ({
            ...prev,
            courseCount: coursesResponse.data.length
          }));
        }
      } else {
        showToast('error', 'Error', response.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      showToast('error', 'Error', 'An error occurred while creating the course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-chart-1)' }} />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1>Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, courses, and monitor system health</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="border-primary text-primary">+12%</Badge>
              </div>
              <p className="text-2xl mb-1">{stats.userCount}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-5 w-5 text-accent" />
                <Badge variant="outline" className="border-accent text-accent">+3</Badge>
              </div>
              <p className="text-2xl mb-1">{stats.courseCount}</p>
              <p className="text-sm text-muted-foreground">Active Courses</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="border-primary text-primary">+8%</Badge>
              </div>
              <p className="text-2xl mb-1">{stats.engagementRate}%</p>
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-accent/10 border-accent/30">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                <Badge className="bg-accent text-white">{stats.flaggedSubmissions}</Badge>
              </div>
              <p className="text-2xl mb-1">Alerts</p>
              <p className="text-sm text-muted-foreground">Flagged Items</p>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* User Management */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2>Users</h2>
                <div className="flex gap-2">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input 
                      placeholder="Search users..." 
                      className="w-64" 
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                    />
                    <Button type="submit">Search</Button>
                  </form>
                  <Button className="bg-primary hover:bg-accent" onClick={() => setShowCreateUserForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrolled/Courses</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.status === 'Active'
                                ? 'bg-primary text-white'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === 'Student' || user.role === 'student'
                            ? `${user.enrolled} courses`
                            : user.role === 'Teacher' || user.role === 'teacher'
                            ? `${user.courses} courses`
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Course Management */}
          <TabsContent value="courses">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2>Courses</h2>
                <Button className="bg-primary hover:bg-accent" onClick={() => setShowCreateCourseForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.students}</TableCell>
                        <TableCell>{course.teacher}</TableCell>
                        <TableCell>
                          <Badge className="bg-primary text-white">{course.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteCourse(course.id, course.name)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3>Daily Active Users</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dailyActiveUsersData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="users" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3>Course Enrollment Trend</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={enrollmentTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="enrolled"
                        stroke="var(--color-chart-1)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-chart-1)', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* System Health */}
          <TabsContent value="system">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-primary" />
                <h2>Server Health Dashboard</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <h3 className="mb-4">Server Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <Badge className="bg-primary text-white">
                        {systemHealth.uptime > 0 
                          ? `${(systemHealth.uptime / 3600).toFixed(1)}h` 
                          : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <span className="text-sm">45ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Sessions</span>
                      <span className="text-sm">{systemHealth.activeSessions}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4">Database Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className="bg-primary text-white">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Query Time</span>
                      <span className="text-sm">12ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Storage Used</span>
                      <span className="text-sm">
                        {systemHealth.dbStats && systemHealth.dbStats.dataSize 
                          ? `${(systemHealth.dbStats.dataSize / (1024 * 1024)).toFixed(1)}MB` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-accent/10 border-accent/30">
                  <h3 className="mb-4">Anomaly Detection</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">AI-Generated</span>
                      <Badge variant="outline" className="border-accent text-accent">
                        {stats.flaggedSubmissions}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Suspicious Activity</span>
                      <Badge variant="outline" className="border-accent text-accent">1</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Scan</span>
                      <span className="text-sm">
                        {systemHealth.serverTime 
                          ? new Date(systemHealth.serverTime).toLocaleTimeString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Create User Form Modal */}
        {showCreateUserForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create New User</h3>
              <form onSubmit={handleCreateUserSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      name="name"
                      value={createUserFormData.name}
                      onChange={handleCreateUserInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={createUserFormData.email}
                      onChange={handleCreateUserInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <Input
                      type="password"
                      name="password"
                      value={createUserFormData.password}
                      onChange={handleCreateUserInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      name="role"
                      value={createUserFormData.role}
                      onChange={handleCreateUserInputChange}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateUserForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-accent">
                    Create User
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Course Form Modal */}
        {showCreateCourseForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
              <form onSubmit={handleCreateCourseSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Course Name</label>
                    <Input
                      name="name"
                      value={createCourseFormData.name}
                      onChange={handleCreateCourseInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      value={createCourseFormData.description}
                      onChange={handleCreateCourseInputChange}
                      className="w-full p-2 border rounded-md bg-background min-h-[100px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Input
                      name="category"
                      value={createCourseFormData.category}
                      onChange={handleCreateCourseInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                      name="difficulty"
                      value={createCourseFormData.difficulty}
                      onChange={handleCreateCourseInputChange}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Students</label>
                    <Input
                      type="number"
                      name="maxStudents"
                      value={createCourseFormData.maxStudents}
                      onChange={handleCreateCourseInputChange}
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateCourseForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-accent">
                    Create Course
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete the {deleteConfirmation.type} "{deleteConfirmation.name}"? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={cancelDelete}>
                  Cancel
                </Button>
                <Button 
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}