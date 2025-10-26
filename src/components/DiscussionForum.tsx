import { useState, useEffect } from 'react';
import { Page, UserRole } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, Reply, Bot, BarChart3, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useToast } from './ui/toast';
import { getCourseDiscussions, createDiscussion, getDiscussion, addReply, likeDiscussion } from '../services/api.service';

interface DiscussionForumProps {
  onNavigate: (page: Page) => void;
  userRole: UserRole;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
    role: string;
  };
  course: string;
  category: string;
  college?: string;
  tags?: string[];
  replies: number;
  upvotes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface Reply {
  id: string;
  author: {
    name: string;
    email: string;
    role: string;
  };
  content: string;
  createdAt: string;
  likes: string[];
}

export function DiscussionForum({ onNavigate, userRole }: DiscussionForumProps) {
  const { showToast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [threadReplies, setThreadReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [filter, setFilter] = useState('most-active');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadCollege, setNewThreadCollege] = useState('');
  const [creatingThread, setCreatingThread] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  // For demo purposes, we'll use a mock course ID
  // In a real app, this would come from the current course context
  const courseId = 'C001'; // Mock course ID

  useEffect(() => {
    if (!currentThread) {
      fetchDiscussions();
    }
  }, [courseId, currentThread]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await getCourseDiscussions(courseId);
      
      if (response.success) {
        // Transform the data to match our Thread interface
        const transformedThreads = response.data.map((discussion: any) => ({
          id: discussion._id,
          title: discussion.title,
          content: discussion.content,
          author: discussion.author,
          course: discussion.course,
          category: discussion.category,
          college: discussion.college,
          tags: discussion.tags,
          replies: discussion.replies.length,
          upvotes: discussion.likes.length,
          views: discussion.views,
          createdAt: discussion.createdAt,
          updatedAt: discussion.updatedAt,
        }));
        setThreads(transformedThreads);
      } else {
        showToast('error', 'Failed to load discussions', response.message);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      showToast('error', 'Error', 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussion = async (discussionId: string) => {
    setThreadLoading(true);
    try {
      const response = await getDiscussion(discussionId);
      
      if (response.success) {
        // Transform the data
        const data = response.data;
        const transformedDiscussion: Thread = {
          id: data._id,
          title: data.title,
          content: data.content,
          author: data.author,
          course: data.course,
          category: data.category,
          college: data.college,
          tags: data.tags,
          replies: data.replies.length,
          upvotes: data.likes.length,
          views: data.views,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        
        setCurrentThread(transformedDiscussion);
        setThreadReplies(data.replies.map((reply: any) => ({
          id: reply._id,
          author: reply.author,
          content: reply.content,
          createdAt: reply.createdAt,
          likes: reply.likes || [],
        })));
      } else {
        showToast('error', 'Failed to load discussion', response.message);
      }
    } catch (error) {
      console.error('Error fetching discussion:', error);
      showToast('error', 'Error', 'Failed to load discussion');
    } finally {
      setThreadLoading(false);
    }
  };

  const handleViewThread = (thread: Thread) => {
    fetchDiscussion(thread.id);
  };

  const handleBackToDiscussions = () => {
    setCurrentThread(null);
    setThreadReplies([]);
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      showToast('error', 'Error', 'Please fill in both title and content');
      return;
    }

    setCreatingThread(true);
    try {
      // Prepare discussion data
      const discussionData: any = {
        title: newThreadTitle,
        content: newThreadContent,
        courseId: courseId,
        category: 'discussion',
        college: newThreadCollege.trim() || undefined,
      };
      
      // Add college to tags if provided
      if (newThreadCollege.trim()) {
        discussionData.tags = [newThreadCollege.trim()];
      }

      const response = await createDiscussion(discussionData);

      if (response.success) {
        showToast('success', 'Success', 'Discussion created successfully');
        setNewThreadTitle('');
        setNewThreadContent('');
        setNewThreadCollege('');
        fetchDiscussions(); // Refresh the list
        // Close modal using the proper function
        handleCloseCreateThreadModal();
      } else {
        showToast('error', 'Failed to create discussion', response.message);
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      showToast('error', 'Error', 'Failed to create discussion');
    } finally {
      setCreatingThread(false);
    }
  };

  const handleAddReply = async () => {
    if (!replyContent.trim() || !currentThread) {
      showToast('error', 'Error', 'Please enter a reply');
      return;
    }

    setReplying(true);
    try {
      const response = await addReply(currentThread.id, replyContent);
      
      if (response.success) {
        showToast('success', 'Success', 'Reply added successfully');
        setReplyContent('');
        fetchDiscussion(currentThread.id); // Refresh the discussion
      } else {
        showToast('error', 'Failed to add reply', response.message);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      showToast('error', 'Error', 'Failed to add reply');
    } finally {
      setReplying(false);
    }
  };

  const handleOpenCreateThreadModal = () => {
    // Reset form fields
    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadCollege('');
    // Show the modal
    const modal = document.getElementById('create-thread-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  };

  const handleCloseCreateThreadModal = () => {
    // Hide the modal
    const modal = document.getElementById('create-thread-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  };

  if (threadLoading && currentThread) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (currentThread) {
    return (
      <div className="min-h-screen p-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="outline" 
            className="mb-6 gap-2"
            onClick={handleBackToDiscussions}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discussions
          </Button>

          {/* Discussion Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl">{currentThread.title}</h1>
                  <Badge variant="outline">{currentThread.category}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {currentThread.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{currentThread.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(currentThread.createdAt).toLocaleDateString()} • {currentThread.author.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{currentThread.views} views</span>
                    <span>•</span>
                    <span>{currentThread.replies} replies</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                {currentThread.upvotes}
              </Button>
            </div>

            {/* Discussion Content */}
            <Card className="p-6 mb-6">
              <p className="text-muted-foreground whitespace-pre-wrap">{currentThread.content}</p>
              
              {currentThread.tags && currentThread.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentThread.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">#{tag}</Badge>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Replies */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Replies ({threadReplies.length})
            </h2>
            
            {threadReplies.length > 0 ? (
              <div className="space-y-4">
                {threadReplies.map((reply, index) => (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-sm">
                            {reply.author.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{reply.author.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {reply.author.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-muted-foreground whitespace-pre-wrap">{reply.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <ThumbsUp className="h-4 w-4" />
                              {reply.likes.length}
                            </button>
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <Reply className="h-4 w-4" />
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Replies Yet</h3>
                <p className="text-muted-foreground">
                  Be the first to reply to this discussion.
                </p>
              </Card>
            )}
          </div>

          {/* Reply Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl flex items-center gap-2 mb-4">
              <Reply className="h-5 w-5" />
              Add a Reply
            </h2>
            <Card className="p-6">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[120px] mb-4"
              />
              <div className="flex justify-end">
                <Button 
                  className="bg-primary hover:bg-accent gap-2"
                  onClick={handleAddReply}
                  disabled={replying}
                >
                  {replying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Reply'
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1>Discussion Forum</h1>
              <p className="text-muted-foreground">Connect, collaborate, and learn together</p>
            </div>
            <Button 
              className="bg-primary hover:bg-accent"
              onClick={handleOpenCreateThreadModal}
            >
              Start Discussion
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most-active">Most Active</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
                <SelectItem value="top-rated">Top Rated</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="border-primary text-primary">
              {threads.length} Active Threads
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Threads */}
          <div className="lg:col-span-2 space-y-4">
            {threads.length > 0 ? (
              threads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.01 }}
                  // Add click handler to view thread
                  onClick={() => handleViewThread(thread)}
                >
                  <Card className="p-5 hover:shadow-lg transition-all border-secondary cursor-pointer">
                    {/* Thread Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold">
                          {thread.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm mb-1">{thread.title}</h3>
                            <div className="text-xs text-muted-foreground">
                              <div>
                                {thread.author.name} • {new Date(thread.createdAt).toLocaleDateString()}
                              </div>
                              {(thread.college || (thread.tags && thread.tags.length > 0 && thread.tags.some(tag => tag !== 'global'))) && (
                                <div className="mt-1">
                                  🏫 {thread.college || (thread.tags && thread.tags.find(tag => tag !== 'global'))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {thread.category}
                          </Badge>
                        </div>

                        {/* Thread Content Preview */}
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {thread.content.substring(0, 100)}...
                        </p>

                        {/* Thread Stats */}
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            {thread.upvotes}
                          </button>
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            {thread.replies} {thread.replies === 0 ? 'reply' : 'replies'}
                          </button>
                          <span className="text-sm text-muted-foreground">
                            {thread.views} views
                          </span>
                          
                          {/* Role Badge */}
                          <Badge variant="outline" className="text-xs ml-auto">
                            {thread.author.role === 'teacher' ? 'Teacher' : 'Student'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Discussions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion in this course!
                </p>
                <Button 
                  className="bg-primary hover:bg-accent"
                  onClick={handleOpenCreateThreadModal}
                >
                  Start Discussion
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - Quick Reply Form */}
          <div className="space-y-6">
            {/* Create Thread Modal */}
            <div id="create-thread-modal" className="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Start a New Discussion</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title</label>
                      <input
                        type="text"
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        className="w-full p-3 border rounded-lg bg-background"
                        placeholder="Enter discussion title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">College (Optional)</label>
                      <input
                        type="text"
                        value={newThreadCollege}
                        onChange={(e) => setNewThreadCollege(e.target.value)}
                        className="w-full p-3 border rounded-lg bg-background"
                        placeholder="Enter your college name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content</label>
                      <Textarea
                        value={newThreadContent}
                        onChange={(e) => setNewThreadContent(e.target.value)}
                        className="min-h-[150px]"
                        placeholder="Share your thoughts..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleCloseCreateThreadModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary hover:bg-accent"
                      onClick={handleCreateThread}
                      disabled={creatingThread}
                    >
                      {creatingThread ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Discussion'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Reply Form */}
            {userRole !== 'admin' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Reply className="h-5 w-5 text-primary" />
                  <h2>Quick Reply</h2>
                </div>
                <Card className="p-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    className="min-h-[120px] mb-3"
                  />
                  <Button className="w-full bg-primary hover:bg-accent">Post Reply</Button>
                </Card>
              </motion.div>
            )}

            {/* Top Contributors */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2>Top Contributors</h2>
              </div>
              <Card className="p-4">
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Chen', posts: 127, role: 'teacher' },
                    { name: 'Alex Rivera', posts: 98, role: 'student' },
                    { name: 'Emma Wilson', posts: 84, role: 'teacher' },
                  ].map((contributor, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold">
                          {contributor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{contributor.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{contributor.posts} posts</p>
                          <Badge variant="outline" className="text-xs">
                            {contributor.role === 'teacher' ? 'Teacher' : 'Student'}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-accent text-accent">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}