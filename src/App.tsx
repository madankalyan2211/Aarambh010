import { useState, useEffect } from 'react';
import { LoginRegistration } from './components/LoginRegistration';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { CoursePage } from './components/CoursePage';
import { AssignmentPage } from './components/AssignmentPage';
import { GradesPage } from './components/GradesPage';
import { GlobalDiscussionForum } from './components/GlobalDiscussionForum';
import { NotificationsPage } from './components/NotificationsPage';
import { AdminPanel } from './components/AdminPanel';
import { Navigation } from './components/Navigation';
import { MyTeachersPage } from './components/MyTeachersPage';
import { MyStudentsPage } from './components/MyStudentsPage';
import { TeacherCoursesPage } from './components/TeacherCoursesPage';
import { CourseContentViewer } from './components/CourseContentViewer';
import { Landing } from './components/Landing';
import { PageTransition } from './components/PageTransition';
import { ToastProvider } from './components/ui/toast';
import { TeacherGradesPage } from './components/TeacherGradesPage';
import { MessagesPage } from './components/MessagesPage';
import { TeacherCourseContentPage } from './components/TeacherCourseContentPage';
import { QuizPage } from './components/QuizPage';
import { CodeLabPage } from './components/CodeLabPage';
import { TechUpdatesPage } from './components/TechUpdatesPage';
import { CourseManagement } from './components/CourseManagement';
import { GoogleOAuthCallback } from './components/GoogleOAuthCallback';
import TestFirebasePage from './test-firebase-page';

import { getCurrentUser } from './services/api.service';
import { useAuth0 } from '@auth0/auth0-react';

export type UserRole = 'student' | 'teacher' | 'admin' | null;
export type Page = 'login' | 'landing' | 'student-dashboard' | 'teacher-dashboard' | 'course' | 'assignment' | 'grades' | 'discussion' | 'notifications' | 'admin' | 'my-teachers' | 'my-students' | 'teacher-courses' | 'course-content' | 'messages' | 'teacher-course-content' | 'quiz' | 'code-lab' | 'tech-updates' | 'course-management' | 'google-oauth-callback' | 'test-firebase';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState(''); // Store user's name
  const [userEmail, setUserEmail] = useState(''); // Store user's email for data filtering
  const [userId, setUserId] = useState(''); // Store user's ID
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDiscussionId, setSelectedDiscussionId] = useState('');
  const [selectedDiscussionCourseId, setSelectedDiscussionCourseId] = useState(''); // Add this for discussion context
  const [isDark, setIsDark] = useState(false); // Add dark mode state
  const [showTransition, setShowTransition] = useState(false); // Page transition state
  const [pendingRole, setPendingRole] = useState<UserRole>(null); // Store role during transition

  // Add effect to listen for course discussion events
  useEffect(() => {
    const handleViewCourseDiscussions = (event: CustomEvent) => {
      const courseId = event.detail;
      if (courseId) {
        setSelectedDiscussionCourseId(courseId);
        setCurrentPage('discussion');
      }
    };

    window.addEventListener('viewCourseDiscussions', handleViewCourseDiscussions as EventListener);
    return () => {
      window.removeEventListener('viewCourseDiscussions', handleViewCourseDiscussions as EventListener);
    };
  }, []);

  // Load user data from localStorage on app mount
  useEffect(() => {
    console.log('🔍 App mount - checking authentication state');
    const storedUserData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    // If we have both user data and auth token, try to auto-login
    if (storedUserData && authToken) {
      console.log('🔍 Found stored user data and auth token, validating...');
      try {
        const userData = JSON.parse(storedUserData);
        console.log('🔍 Stored user data:', userData);
        setUserEmail(userData.email || ''); // Load email
        setUserName(userData.name || 'User'); // Load name
        setUserId(userData.id || userData._id || ''); // Load user ID (consistent with handleLogin)
        
        // Validate the auth token by making a request to the server
        console.log('🔍 Validating auth token...');
        getCurrentUser().then(response => {
          console.log('🔍 Token validation response:', response);
          if (response.success && response.data) {
            console.log('🔍 Token is valid, setting user role:', response.data.role);
            setUserRole(response.data.role);
            if (response.data.role === 'student') {
              setCurrentPage('student-dashboard');
            } else if (response.data.role === 'teacher') {
              setCurrentPage('teacher-dashboard');
            } else if (response.data.role === 'admin') {
              setCurrentPage('admin');
            }
          } else {
            console.log('🔍 Token is invalid or user not found, clearing data and showing login page');
            console.log('🔍 Error message:', response.message);
            // Token is invalid or user not found, clear data and show login page
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            setCurrentPage('login');
          }
        }).catch((error) => {
          // Error validating token, clear data and show login page
          console.error('🔍 Token validation error:', error);
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
          setCurrentPage('login');
        });
      } catch (error) {
        console.error('🔍 Error parsing stored user data:', error);
        // If there's an error parsing, start with login page
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        setCurrentPage('login');
      }
    } else {
      console.log('🔍 No stored user data or auth token, showing login page');
      // No stored user data or auth token, start with login page
      setCurrentPage('login');
    }
  }, []); // Empty dependency array to ensure this only runs once on mount

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle hash changes for popup routing
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#messages') {
        setCurrentPage('messages');
      }
    };

    // Check initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLogin = (role: UserRole, name?: string, email?: string) => {
    console.log('🔍 handleLogin called with:', { role, name, email });
    
    // If name or email is not provided, try to get it from localStorage
    let displayName = name;
    let userEmailAddress = email;
    let userIdValue = '';
    
    if (!displayName || !userEmailAddress) {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          displayName = displayName || userData.name;
          userEmailAddress = userEmailAddress || userData.email;
          userIdValue = userData.id || userData._id || ''; // Use id or _id
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
    }
    
    setUserName(displayName || 'User'); // Store the name, default to 'User' if not provided
    setUserEmail(userEmailAddress || ''); // Store the email
    setUserId(userIdValue || ''); // Store the user ID
    
    // Show transition animation
    setPendingRole(role);
    setShowTransition(true);
  };
  
  // Handle transition completion
  const handleTransitionComplete = () => {
    setShowTransition(false);
    setUserRole(pendingRole);
    
    if (pendingRole === 'student') {
      setCurrentPage('student-dashboard');
    } else if (pendingRole === 'teacher') {
      setCurrentPage('teacher-dashboard');
    } else if (pendingRole === 'admin') {
      setCurrentPage('admin');
    }
    
    setPendingRole(null);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName(''); // Clear the name on logout
    setUserEmail(''); // Clear the email on logout
    setUserId(''); // Clear the user ID on logout
    // Optionally clear localStorage if you want to remove user data
    // localStorage.removeItem('userData');
    setCurrentPage('login');
  };

  const handleViewCourse = (courseId: string) => {
    if (!courseId) {
      return;
    }
    
    setSelectedCourseId(courseId);
    setCurrentPage('course-content');
  };

  // Add a function to navigate to discussions with course context
  const handleViewCourseDiscussions = (courseId: string) => {
    if (!courseId) {
      return;
    }
    
    setSelectedDiscussionCourseId(courseId);
    setCurrentPage('discussion');
  };

  const handleBackToCourses = () => {
    setSelectedCourseId('');
    setCurrentPage('course');
  };

  const handleViewDiscussion = (discussionId: string) => {
    setSelectedDiscussionId(discussionId);
    setCurrentPage('discussion'); // We'll handle the thread view within the DiscussionForum
  };

  // Wrapper function to match the expected signature
  const handleNavigate = (page: string) => {
    console.log('🔍 handleNavigate called with page:', page);
    // If navigating to messages, update the hash
    if (page === 'messages') {
      window.location.hash = 'messages';
    } else {
      // Clear hash for other pages
      if (window.location.hash) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    }
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {

      case 'landing':
        return <Landing onNavigate={handleNavigate} />;
      case 'login':
        return <LoginRegistration onLogin={handleLogin} />;
      case 'student-dashboard':
        return <StudentDashboard onNavigate={handleNavigate} userName={userName} userEmail={userEmail} />;
      case 'teacher-dashboard':
        return <TeacherDashboard onNavigate={handleNavigate} userName={userName} userEmail={userEmail} />;
      case 'course':
        return <CoursePage userRole={userRole} onNavigate={handleNavigate} onViewCourse={handleViewCourse} />;
      case 'assignment':
        return <AssignmentPage onNavigate={handleNavigate} userRole={userRole} />;
      case 'grades':
        return userRole === 'teacher' ? 
          <TeacherGradesPage onNavigate={handleNavigate} /> : 
          <GradesPage onNavigate={handleNavigate} />;
      case 'discussion':
        return <GlobalDiscussionForum 
          onNavigate={handleNavigate} 
          userRole={userRole}
          userName={userName}
        />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPanel onNavigate={handleNavigate} />;
      case 'my-teachers':
        return <MyTeachersPage onNavigate={handleNavigate} userEmail={userEmail} />;
      case 'my-students':
        return <MyStudentsPage onNavigate={handleNavigate} userEmail={userEmail} />;
      case 'teacher-courses':
        return <TeacherCoursesPage onNavigate={handleNavigate} />;
      case 'course-content':
        return <CourseContentViewer 
          courseId={selectedCourseId} 
          onBack={handleBackToCourses}
        />;
      case 'messages':
        return <MessagesPage onNavigate={handleNavigate} userRole={userRole} userName={userName} />;
      case 'teacher-course-content':
        return <TeacherCourseContentPage 
          courseId={selectedCourseId} 
          onBack={() => handleNavigate('teacher-courses')}
        />;
      case 'quiz':
        return <QuizPage onNavigate={handleNavigate} />;
      case 'code-lab':
        return <CodeLabPage onNavigate={handleNavigate} />;
      case 'tech-updates':
        return <TechUpdatesPage />;
      case 'course-management':
        return <CourseManagement onNavigate={handleNavigate} />;
      case 'google-oauth-callback':
        return <GoogleOAuthCallback onLogin={handleLogin} />;
      case 'test-firebase':
        return <TestFirebasePage />;
      default:
        return <LoginRegistration onLogin={handleLogin} />;
    }
  };

  // Check if this is a popup window for messages
  const isMessagesPopup = window.name === 'Messages';

  const { isAuthenticated, user, isLoading } = useAuth0();

  // Handle Auth0 authentication
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      // Check if this is an Auth0 login
      const authMethod = localStorage.getItem('authMethod');
      
      if (authMethod === 'auth0') {
        // Get user data from localStorage
        const storedUserData = localStorage.getItem('userData');
        
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            // Determine the dashboard page based on user role
            if (userData.role === 'student') {
              setCurrentPage('student-dashboard');
            } else if (userData.role === 'teacher') {
              setCurrentPage('teacher-dashboard');
            } else if (userData.role === 'admin') {
              setCurrentPage('admin');
            } else {
              // Default to student dashboard
              setCurrentPage('student-dashboard');
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            setCurrentPage('login');
          }
        } else {
          // Set default user data for Auth0 users
          const userData = {
            email: user.email || '',
            name: user.name || user.email?.split('@')[0] || 'User',
            role: 'student' // Default role
          };
          
          localStorage.setItem('userData', JSON.stringify(userData));
          setCurrentPage('student-dashboard');
        }
      }
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {/* Show page transition */}
        {showTransition && (
          <PageTransition onComplete={handleTransitionComplete} />
        )}
        
        {/* Hide content during transition */}
        {!showTransition && (
          <>
            {!isMessagesPopup && userRole && (
              <Navigation
                userRole={userRole}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                currentPage={currentPage}
                isDark={isDark}
                onToggleDark={() => setIsDark(!isDark)}
                userId={userId}
              />
            )}

            {isMessagesPopup ? (
              <div className="min-h-screen bg-background">
                <MessagesPage 
                  onNavigate={handleNavigate} 
                  userRole={userRole} 
                  userName={userName}
                />
              </div>
            ) : (
              renderPage()
            )}
          </>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
