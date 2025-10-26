import { useState, useEffect, useRef } from 'react';
import { Page, UserRole } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Search, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentUser, searchUsers, getConversations, getMessages, sendMessage, createConversation } from '../services/api.service';

interface MessagesPageProps {
  onNavigate: (page: Page) => void;
  userRole: UserRole;
  userName: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function MessagesPage({ onNavigate, userRole, userName }: MessagesPageProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const tokenReceivedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the props to satisfy TypeScript
  console.log('Navigation function:', onNavigate);
  console.log('User role:', userRole);
  console.log('User name:', userName);

  // Listen for auth token message from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data && event.data.type === 'AUTH_TOKEN') {
        // Set the auth token in localStorage
        localStorage.setItem('authToken', event.data.token);
        tokenReceivedRef.current = true;
        // Reload user data after receiving token
        loadCurrentUser();
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Load current user data
  const loadCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        // The user data is in response.data, not response.data.user
        const userData = response.data;
        
        setCurrentUser({
          id: userData.id || userData._id || '',
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'student',
          avatar: userData.avatar || '',
          bio: userData.bio || '',
        });
        setAuthError(null);
      } else {
        // Check if we have a token
        const token = localStorage.getItem('authToken');
        if (!token) {
          setAuthError('Authentication token not found. Please log in again.');
        } else {
          setAuthError(response.message || 'Failed to load user data. Your session may have expired.');
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      setAuthError('Error loading user data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Load user's conversations
  const loadConversations = async () => {
    if (!currentUser) return;
    
    try {
      const response = await getConversations();
      if (response.success) {
        // Transform API response to match Conversation interface
        const transformedConversations = response.data.map((conv: any) => ({
          id: conv._id || conv.id,
          participants: conv.participants.map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            email: p.email,
            role: p.role,
            avatar: p.avatar,
            bio: p.bio,
          })),
          messages: [], // Will be loaded when conversation is selected
          lastMessage: conv.lastMessage || '',
          lastMessageTime: conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleString() : 'Just now',
          unreadCount: conv.unreadCount || 0,
        }));
        setConversations(transformedConversations);
      } else {
        console.error('Error loading conversations:', response.message);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const response = await getMessages(conversationId);
      if (response.success) {
        // Transform API response to match Message interface
        const transformedMessages = response.data.messages?.map((msg: any) => ({
          id: msg._id || msg.id,
          senderId: msg.sender._id || msg.senderId,
          receiverId: msg.receiver._id || msg.receiverId,
          content: msg.content,
          timestamp: msg.createdAt || msg.timestamp,
          read: msg.read || false,
        })) || response.data.map((msg: any) => ({
          id: msg._id || msg.id,
          senderId: msg.sender._id || msg.senderId,
          receiverId: msg.receiver._id || msg.receiverId,
          content: msg.content,
          timestamp: msg.createdAt || msg.timestamp,
          read: msg.read || false,
        }));
        
        // Update the active conversation with messages
        if (activeConversation) {
          const updatedConversation = {
            ...activeConversation,
            messages: transformedMessages,
          };
          setActiveConversation(updatedConversation);
          
          // Update conversations list
          const updatedConversations = conversations.map(conv => 
            conv.id === activeConversation.id ? updatedConversation : conv
          );
          setConversations(updatedConversations);
        }
      } else {
        console.error('Error loading messages:', response.message);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Load conversations when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  // Load messages when activeConversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation || !currentUser) return;

    try {
      const response = await sendMessage({
        receiverId: activeConversation.participants.find(p => p.id !== currentUser.id)?.id || '',
        content: message,
        conversationId: activeConversation.id,
      });

      if (response.success) {
        // Add the new message to the conversation
        const newMessage = {
          id: response.data._id || response.data.id,
          senderId: currentUser.id,
          receiverId: activeConversation.participants.find(p => p.id !== currentUser.id)?.id || '',
          content: message,
          timestamp: new Date().toISOString(),
          read: false,
        };

        // Update the active conversation with the new message
        const updatedConversation = {
          ...activeConversation,
          messages: [...activeConversation.messages, newMessage],
          lastMessage: message,
          lastMessageTime: 'Just now',
        };

        // Update conversations list
        const updatedConversations = conversations.map(conv => 
          conv.id === activeConversation.id ? updatedConversation : conv
        );

        setConversations(updatedConversations);
        setActiveConversation(updatedConversation);
        setMessage('');
      } else {
        console.error('Error sending message:', response.message);
        // Display a more descriptive error message
        let errorMessage = response.message || 'Failed to send message';
        if (response.error) {
          errorMessage += `: ${response.error}`;
        }
        alert(`Error sending message: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Display a more descriptive error message
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      alert(`Error sending message: ${errorMessage}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    // Set the conversation as active first
    setActiveConversation(conversation);
    
    // If the conversation doesn't have messages loaded yet, load them
    if (conversation.messages.length === 0) {
      await loadMessages(conversation.id);
    }
  };

  const handleStartConversation = async (user: User) => {
    // Ensure currentUser exists
    if (!currentUser) return;
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.some(p => p.id === user.id)
    );
    
    if (existingConversation) {
      handleSelectConversation(existingConversation);
    } else {
      // Create new conversation through API
      try {
        const response = await createConversation([user.id]);
        if (response.success) {
          // Transform API response to match Conversation interface
          const newConversation: Conversation = {
            id: response.data._id || response.data.id,
            participants: response.data.participants.map((p: any) => ({
              id: p._id || p.id,
              name: p.name,
              email: p.email,
              role: p.role,
              avatar: p.avatar,
              bio: p.bio,
            })),
            messages: [],
            lastMessage: '',
            lastMessageTime: 'Just now',
            unreadCount: 0
          };
          
          setConversations(prev => [...prev, newConversation]);
          handleSelectConversation(newConversation);
        } else {
          console.error('Error creating conversation:', response.message);
          alert(`Error creating conversation: ${response.message}`);
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        alert('Error creating conversation. Please try again.');
      }
    }
    
    // Clear search
    setSearchQuery('');
    setUsers([]);
  };

  const handleGoBack = () => {
    // Close the popup window
    window.close();
  };

  // Search users when query changes
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsersInDatabase();
      } else {
        setUsers([]);
      }
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const searchUsersInDatabase = async () => {
    if (!searchQuery.trim()) return;
    
    // Check if user is authenticated before searching
    const token = localStorage.getItem('authToken');
    if (!token) {
      setAuthError('You must be logged in to search users');
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await searchUsers(searchQuery);
      if (response.success) {
        // Transform API response to match User interface
        const transformedUsers = response.data.map((user: any) => ({
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
        }));
        setUsers(transformedUsers);
      } else {
        // Handle authentication errors specifically
        if (response.message.includes('Not authorized') || response.message.includes('Invalid token')) {
          setAuthError('Your session has expired. Please log in again.');
        } else {
          console.error('Error searching users:', response.message);
          // Show a user-friendly error message
          alert(`Error searching users: ${response.message}`);
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an authentication error
  if (authError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Authentication Error</h3>
          <p className="text-muted-foreground mb-4">{authError}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem('authToken');
                window.close();
              }}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if currentUser is not loaded and no specific auth error
  if (!currentUser && !authError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Authentication Error</h3>
          <p className="text-muted-foreground mb-4">Unable to load user data. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b p-4 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack}
          className="md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      
      <div className="container mx-auto max-w-6xl p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-muted-foreground">Direct messages with your teachers and classmates</p>
        </motion.div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="w-1/3 flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Input
                  placeholder="Search by email or name..."
                  className=""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Search Results */}
              {(users.length > 0 || searchLoading) && (
                <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-3 text-center text-muted-foreground">Searching...</div>
                  ) : (
                    users.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-secondary/30 transition-colors last:border-b-0"
                        onClick={() => handleStartConversation(user)}
                      >
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{user.name || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground truncate">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1">
              {conversations.length > 0 && currentUser ? (
                conversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-secondary/30 transition-colors ${
                        activeConversation?.id === conversation.id ? 'bg-secondary/50' : ''
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback>{otherParticipant?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        {otherParticipant?.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{otherParticipant?.name || 'Unknown User'}</h3>
                          <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage || 'No messages yet'}</p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet. Search for users to start messaging.
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col">
            {activeConversation && currentUser ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={activeConversation.participants.find(p => p.id !== currentUser.id)?.avatar} />
                      <AvatarFallback>
                        {activeConversation.participants.find(p => p.id !== currentUser.id)?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {activeConversation.participants.find(p => p.id !== currentUser.id)?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {activeConversation.participants.find(p => p.id !== currentUser.id)?.email || 'unknown@example.com'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">

                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {activeConversation.messages && activeConversation.messages.length > 0 ? (
                      activeConversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              msg.senderId === currentUser.id
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-secondary rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.senderId === currentUser.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground">Select a conversation from the list or search for users to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}