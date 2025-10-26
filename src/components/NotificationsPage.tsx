import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { motion } from 'motion/react';
import { Bell, CheckCircle, Award, MessageSquare, BookOpen, AlertCircle, Mic, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api.service';
import { io, Socket } from 'socket.io-client';

interface NotificationsPageProps {
  onNavigate: (page: Page) => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  urgent: boolean;
  read: boolean;
  icon: any;
}

const notificationIcons = {
  grade: Award,
  assignment: AlertCircle,
  discussion: MessageSquare,
  course: BookOpen,
  achievement: Award,
  message: MessageSquare,
  announcement: Bell,
  system: Bell,
};

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize WebSocket connection
  useEffect(() => {
    // Create socket connection
    const newSocket = io('', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    
    setSocket(newSocket);
    
    // Register user with socket server (you'll need to get the user ID from context or props)
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        newSocket.emit('register-user', user._id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Listen for new notifications
    newSocket.on('new-notification', (data: { notification: any }) => {
      // Add the new notification to the list
      const newNotification: Notification = {
        id: data.notification._id,
        type: data.notification.type,
        title: data.notification.title,
        message: data.notification.message,
        time: 'Just now',
        urgent: data.notification.priority === 'high' || data.notification.priority === 'urgent',
        read: data.notification.isRead,
        icon: notificationIcons[data.notification.type as keyof typeof notificationIcons] || Bell,
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    // Listen for unread count updates
    newSocket.on('unread-notifications-count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });
    
    // Clean up on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch notifications and unread count on component mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      if (response.success && response.data) {
        // Transform API response to match Notification interface
        const transformedNotifications: Notification[] = response.data.map((notification: any) => ({
          id: notification._id || notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: formatTime(notification.createdAt),
          urgent: notification.priority === 'high' || notification.priority === 'urgent',
          read: notification.isRead,
          icon: notificationIcons[notification.type as keyof typeof notificationIcons] || Bell,
        }));
        
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationsCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await markNotificationAsRead(id);
      if (response.success) {
        // Update the notification in the list
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
        
        // Update unread count
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        
        // Emit event to update navigation component
        window.dispatchEvent(new CustomEvent('unread-notifications-updated', { detail: { count: newUnreadCount } }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.success) {
        // Mark all notifications as read
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        
        // Update unread count
        setUnreadCount(0);
        
        // Emit event to update navigation component
        window.dispatchEvent(new CustomEvent('unread-notifications-updated', { detail: { count: 0 } }));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const weeklyDigest = [
    { label: 'Assignments Completed', value: '5' },
    { label: 'Discussions Participated', value: '12' },
    { label: 'New Grades', value: '3' },
    { label: 'Learning Streak', value: '14 days 🔥' },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1>Notifications</h1>
              <p className="text-muted-foreground">Stay updated with your learning journey</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
              <Button variant="outline" size="icon">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Notifications */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Bell className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification, index) => {
                  const Icon = notification.icon;
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          !notification.read ? 'border-l-4 border-l-primary bg-secondary/20' : ''
                        } ${notification.urgent ? 'animate-pulse-slow' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              notification.urgent
                                ? 'bg-accent/20'
                                : notification.read
                                ? 'bg-muted'
                                : 'bg-primary/20'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                notification.urgent
                                  ? 'text-accent'
                                  : notification.read
                                  ? 'text-muted-foreground'
                                  : 'text-primary'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="text-sm">{notification.title}</h3>
                              {notification.urgent && (
                                <Badge className="bg-accent text-white text-xs">Urgent</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">
                  You'll see important updates and alerts here when they arrive.
                </p>
              </div>
            )}

            {/* Load More */}
            {!loading && notifications.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline">Load More Notifications</Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Digest */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h2>Weekly Digest</h2>
              </div>
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                <div className="space-y-3">
                  {weeklyDigest.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-lg">{item.value}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground text-center">
                  Oct 7 - Oct 14, 2025
                </p>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="mb-4">Notification Settings</h2>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notif" className="cursor-pointer">
                        Email Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch id="email-notif" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="voice-notif" className="cursor-pointer">
                        Voice Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Enable audio alerts
                      </p>
                    </div>
                    <Switch id="voice-notif" />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="grade-notif" className="cursor-pointer">
                        Grade Updates
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified of new grades
                      </p>
                    </div>
                    <Switch id="grade-notif" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="assignment-notif" className="cursor-pointer">
                        Assignment Reminders
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Deadline notifications
                      </p>
                    </div>
                    <Switch id="assignment-notif" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="discussion-notif" className="cursor-pointer">
                        Discussion Updates
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Replies and mentions
                      </p>
                    </div>
                    <Switch id="discussion-notif" defaultChecked />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Smart Priority Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 bg-accent/10 border-accent/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm mb-1">Smart Priority System</h3>
                    <p className="text-xs text-muted-foreground">
                      Urgent notifications are highlighted and will glow until viewed. This
                      helps you never miss important deadlines and updates.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}