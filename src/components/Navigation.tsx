import { Page, UserRole } from '../App';
import { Button } from './ui/button';
import { Bell, Home, BookOpen, ClipboardList, Award, MessageSquare, Settings, LogOut, Users, Moon, Sun, Brain, Code, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { VoiceAssistant } from './VoiceAssistant';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useEffect, useState, useRef } from 'react';
import { getUnreadMessagesCount, getUnreadNotificationsCount, markAllNotificationsAsRead } from '../services/api.service';
import { io, Socket } from 'socket.io-client';

interface NavigationProps {
  userRole: UserRole;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
  isDark: boolean;
  onToggleDark: () => void;
  userId?: string;
}

export function Navigation({ userRole, onNavigate, onLogout, currentPage, isDark, onToggleDark, userId }: NavigationProps) {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);
  
  // Separate items that need dropdowns
  const regularNavItems = {
    student: [
      { page: 'student-dashboard' as Page, label: 'Dashboard', icon: Home },
      { page: 'my-teachers' as Page, label: 'My Teachers', icon: Users },
      { page: 'course' as Page, label: 'Courses', icon: BookOpen },
      { page: 'quiz' as Page, label: 'Quizzes', icon: Brain },
      { page: 'code-lab' as Page, label: 'Code Lab', icon: Code },
      { page: 'assignment' as Page, label: 'Assignments', icon: ClipboardList },
      { page: 'grades' as Page, label: 'Grades', icon: Award },
      { page: 'discussion' as Page, label: 'Discussion', icon: MessageSquare },
      { page: 'tech-updates' as Page, label: 'Tech Updates', icon: Brain },
    ],
    teacher: [
      { page: 'teacher-dashboard' as Page, label: 'Dashboard', icon: Home },
      { page: 'my-students' as Page, label: 'My Students', icon: Users },
      // Removed course items since they're handled with a dropdown
      { page: 'assignment' as Page, label: 'Assignments', icon: ClipboardList },
      { page: 'grades' as Page, label: 'Grades', icon: Award },
      { page: 'discussion' as Page, label: 'Discussion', icon: MessageSquare },
      { page: 'tech-updates' as Page, label: 'Tech Updates', icon: Brain },
    ],
    admin: [
      { page: 'admin' as Page, label: 'Admin Panel', icon: Settings },
      { page: 'course' as Page, label: 'Courses', icon: BookOpen },
      { page: 'discussion' as Page, label: 'Discussion', icon: MessageSquare },
      { page: 'tech-updates' as Page, label: 'Tech Updates', icon: Brain },
      { page: 'test-firebase' as Page, label: 'Test Firebase', icon: Settings },
    ],
  };

  const items = regularNavItems[userRole as 'student' | 'teacher' | 'admin'] || [];

  // Initialize WebSocket connection
  useEffect(() => {
    if (!userId) return;

    // Create socket connection
    const socket = io('', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    
    socketRef.current = socket;
    
    // Register user with socket server
    socket.emit('register-user', userId);
    
    // Listen for unread notifications count updates
    socket.on('unread-notifications-count', (data: { count: number }) => {
      setUnreadNotificationsCount(data.count);
    });
    
    // Listen for new notifications
    socket.on('new-notification', () => {
      // When a new notification arrives, fetch the updated count
      fetchUnreadNotificationsCount();
    });
    
    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, [userId]);

  // Listen for custom event from NotificationsPage
  useEffect(() => {
    const handleUnreadNotificationsUpdated = (event: CustomEvent) => {
      setUnreadNotificationsCount(event.detail.count);
    };
    
    window.addEventListener('unread-notifications-updated', handleUnreadNotificationsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('unread-notifications-updated', handleUnreadNotificationsUpdated as EventListener);
    };
  }, []);

  // Fetch unread counts
  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await getUnreadMessagesCount();
      if (response.success && response.data) {
        setUnreadMessagesCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
  };

  const fetchUnreadNotificationsCount = async () => {
    try {
      const response = await getUnreadNotificationsCount();
      if (response.success && response.data) {
        setUnreadNotificationsCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  };

  useEffect(() => {
    // Fetch initial counts
    fetchUnreadMessagesCount();
    fetchUnreadNotificationsCount();
    
    // Refresh counts every 30 seconds (fallback for WebSocket)
    const interval = setInterval(() => {
      fetchUnreadMessagesCount();
      fetchUnreadNotificationsCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to open messages in a new window
  const openMessagesWindow = () => {
    // Get the auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    
    // Open messages page in a new window/tab
    const messagesUrl = window.location.origin + '/#messages';
    const messagesWindow = window.open(
      messagesUrl, 
      'Messages', 
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );
    
    // Pass the auth token to the new window once it's loaded
    if (messagesWindow && authToken) {
      const sendToken = () => {
        messagesWindow.postMessage({
          type: 'AUTH_TOKEN',
          token: authToken
        }, window.location.origin);
      };
      
      // Try to send the token immediately and after delays
      sendToken();
      setTimeout(sendToken, 500);
      setTimeout(sendToken, 1500);
      setTimeout(sendToken, 3000);
    }
    
    // Focus the new window
    if (messagesWindow) {
      messagesWindow.focus();
    }
  };

  return (
    <nav className="bg-card border-b-4 border-primary sticky top-0 z-50 shadow-lg text-foreground">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl app-logo">Aarambh</h1>
            <div className="flex items-center gap-2">
              {userRole === 'teacher' ? (
                <>
                  {regularNavItems.teacher.map(({ page, label, icon: Icon }, index) => (
                    <>
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onNavigate(page)}
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                      {/* Insert Courses dropdown right after My Students */}
                      {page === 'my-students' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant={currentPage === 'teacher-courses' || currentPage === 'course' ? 'default' : 'ghost'}
                              size="sm"
                              className="gap-2"
                            >
                              <BookOpen className="h-4 w-4" />
                              Courses
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => onNavigate('teacher-courses')}
                              className={currentPage === 'teacher-courses' ? 'bg-primary/10' : ''}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              My Courses
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onNavigate('course')}
                              className={currentPage === 'course' ? 'bg-primary/10' : ''}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              All Courses
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  ))}
                </>
              ) : (
                items.map(({ page, label, icon: Icon }) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onNavigate(page)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <VoiceAssistant userRole={userRole || undefined} />
            
            {/* DM Button - opens in new window */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openMessagesWindow}
              title="Direct Messages"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessagesCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                  {unreadMessagesCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => onNavigate('notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                  {unreadNotificationsCount}
                </Badge>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="icon" type="button">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 z-[100]"
                sideOffset={8}
              >
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleDark} className="cursor-pointer">
                  {isDark ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </nav>
  );
}