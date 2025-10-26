import { useState, useEffect } from 'react';
import { Page, UserRole } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, Reply, Loader2, X } from 'lucide-react';
import { useToast } from './ui/toast';
import { getAllDiscussions, createGlobalDiscussion, getTopContributors, addReply } from '../services/api.service';

interface GlobalDiscussionForumProps {
  onNavigate: (page: Page) => void;
  userRole: UserRole;
  userName: string;
}

interface DiscussionReply {
  id: string;
  author: {
    name: string;
    email: string;
    role: string;
  };
  content: string;
  createdAt: string;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
    role: string;
  };
  college?: string;
  tags?: string[];
  replies: DiscussionReply[];
  upvotes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface Contributor {
  _id: string;
  name: string;
  email: string;
  role: string;
  totalPosts: number;
}

export function GlobalDiscussionForum({ onNavigate, userRole, userName }: GlobalDiscussionForumProps) {
  const { showToast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributorsLoading, setContributorsLoading] = useState(true);
  
  // Reply state
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({});
  const [showReplyForm, setShowReplyForm] = useState<{[key: string]: boolean}>({});
  const [sendingReply, setSendingReply] = useState<{[key: string]: boolean}>({});
  
  // Modal state for creating discussions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [newDiscussionCollege, setNewDiscussionCollege] = useState('');
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);

  useEffect(() => {
    fetchAllDiscussions();
    fetchTopContributors();
  }, []);

  const fetchAllDiscussions = async () => {
    setLoading(true);
    try {
      const response = await getAllDiscussions();
      
      if (response.success) {
        // Transform the data to match our Discussion interface
        const transformedDiscussions = response.data.map((discussion: any) => ({
          id: discussion._id,
          title: discussion.title,
          content: discussion.content,
          author: discussion.author || { name: 'Unknown User', email: '', role: 'student' }, // Add fallback for null author
          college: discussion.college,
          tags: discussion.tags,
          replies: Array.isArray(discussion.replies) 
            ? discussion.replies.map((reply: any) => ({
                id: reply._id || reply.id,
                author: reply.author || { name: 'Unknown User', email: '', role: 'student' }, // Add fallback for null author
                content: reply.content,
                createdAt: reply.createdAt,
              }))
            : [],
          upvotes: discussion.likes ? discussion.likes.length : 0,
          views: discussion.views || 0,
          createdAt: discussion.createdAt,
          updatedAt: discussion.updatedAt,
        })).filter((discussion: any) => discussion.author !== null); // Filter out discussions with null authors
        setDiscussions(transformedDiscussions);
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

  const fetchTopContributors = async () => {
    setContributorsLoading(true);
    try {
      const response = await getTopContributors();
      
      if (response.success) {
        // Sort by totalPosts descending and take top 3
        const sortedContributors = response.data
          .sort((a: Contributor, b: Contributor) => b.totalPosts - a.totalPosts)
          .slice(0, 3);
        setContributors(sortedContributors);
      } else {
        console.error('Failed to load contributors:', response.message);
        // Fallback to mock data if API fails
        setContributors([
          { _id: '1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'teacher', totalPosts: 127 },
          { _id: '2', name: 'Alex Rivera', email: 'alex@example.com', role: 'student', totalPosts: 98 },
          { _id: '3', name: 'Emma Wilson', email: 'emma@example.com', role: 'teacher', totalPosts: 84 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
      // Fallback to mock data if API fails
      setContributors([
        { _id: '1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'teacher', totalPosts: 127 },
        { _id: '2', name: 'Alex Rivera', email: 'alex@example.com', role: 'student', totalPosts: 98 },
        { _id: '3', name: 'Emma Wilson', email: 'emma@example.com', role: 'teacher', totalPosts: 84 },
      ]);
    } finally {
      setContributorsLoading(false);
    }
  };

  const handleOpenModal = () => {
    // Reset form fields
    setNewDiscussionTitle('');
    setNewDiscussionContent('');
    setNewDiscussionCollege('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) {
      showToast('error', 'Error', 'Please fill in both title and content');
      return;
    }

    setCreatingDiscussion(true);
    try {
      // Prepare discussion data
      const discussionData: any = {
        title: newDiscussionTitle,
        content: newDiscussionContent,
        college: newDiscussionCollege.trim() || undefined,
      };
      
      // Add college to tags if provided
      if (newDiscussionCollege.trim()) {
        discussionData.tags = [newDiscussionCollege.trim()];
      }

      const response = await createGlobalDiscussion(discussionData);

      if (response.success) {
        showToast('success', 'Success', 'Discussion created successfully');
        setNewDiscussionTitle('');
        setNewDiscussionContent('');
        setNewDiscussionCollege('');
        setIsModalOpen(false);
        fetchAllDiscussions(); // Refresh the list
      } else {
        showToast('error', 'Failed to create discussion', response.message);
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      showToast('error', 'Error', 'Failed to create discussion');
    } finally {
      setCreatingDiscussion(false);
    }
  };

  const handleReplyClick = (discussionId: string) => {
    setShowReplyForm(prev => ({
      ...prev,
      [discussionId]: true
    }));
    setReplyContent(prev => ({
      ...prev,
      [discussionId]: ''
    }));
  };

  const handleReplyChange = (discussionId: string, content: string) => {
    setReplyContent(prev => ({
      ...prev,
      [discussionId]: content
    }));
  };

  const handleCancelReply = (discussionId: string) => {
    setShowReplyForm(prev => ({
      ...prev,
      [discussionId]: false
    }));
    setReplyContent(prev => ({
      ...prev,
      [discussionId]: ''
    }));
  };

  const handleSendReply = async (discussionId: string) => {
    const content = replyContent[discussionId];
    
    if (!content?.trim()) {
      showToast('error', 'Error', 'Please enter a reply');
      return;
    }

    setSendingReply(prev => ({
      ...prev,
      [discussionId]: true
    }));

    try {
      const response = await addReply(discussionId, content);
      
      if (response.success) {
        showToast('success', 'Success', 'Reply added successfully');
        handleCancelReply(discussionId);
        fetchAllDiscussions(); // Refresh the list to show the new reply
      } else {
        showToast('error', 'Failed to add reply', response.message);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      showToast('error', 'Error', 'Failed to add reply');
    } finally {
      setSendingReply(prev => ({
        ...prev,
        [discussionId]: false
      }));
    }
  };

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
              <h1 className="text-3xl font-bold">Global Discussion Forum</h1>
              <p className="text-muted-foreground">Connect, collaborate, and learn together</p>
            </div>
            <Button 
              className="bg-primary hover:bg-accent"
              onClick={handleOpenModal}
            >
              Start Discussion
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary text-primary">
              {discussions.length} Active Discussions
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Discussions */}
          <div className="lg:col-span-2 space-y-4">
            {discussions.length > 0 ? (
              discussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="p-5 hover:shadow-lg transition-all border-secondary cursor-pointer">
                    {/* Discussion Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold">
                          {discussion.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{discussion.title}</h3>
                            <div className="text-xs text-muted-foreground">
                              <div>
                                {discussion.author?.name || 'Unknown User'} • {new Date(discussion.createdAt).toLocaleDateString()}
                              </div>
                              {(discussion.college || (discussion.tags && discussion.tags.length > 0 && discussion.tags.some(tag => tag !== 'global'))) && (
                                <div className="mt-1">
                                  🏫 {discussion.college || (discussion.tags && discussion.tags.find(tag => tag !== 'global'))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {discussion.author?.role === 'teacher' ? 'Teacher' : 'Student'}
                          </Badge>
                        </div>

                        {/* Discussion Content Preview */}
                        <p className="text-muted-foreground mb-3">
                          {discussion.content.substring(0, 150)}...
                        </p>

                        {/* Discussion Stats */}
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            {discussion.upvotes}
                          </button>
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            {discussion.replies.length} {discussion.replies.length === 1 ? 'reply' : 'replies'}
                          </button>
                          <span className="text-sm text-muted-foreground">
                            {discussion.views} views
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reply Button */}
                    <div className="mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleReplyClick(discussion.id)}
                        className="gap-2"
                      >
                        <Reply className="h-4 w-4" />
                        Reply
                      </Button>
                    </div>

                    {/* Reply Form */}
                    {showReplyForm[discussion.id] && (
                      <div className="mt-4 p-4 border rounded-lg bg-secondary/10">
                        <Textarea
                          value={replyContent[discussion.id] || ''}
                          onChange={(e) => handleReplyChange(discussion.id, e.target.value)}
                          placeholder="Write your reply..."
                          className="mb-3"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCancelReply(discussion.id)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSendReply(discussion.id)}
                            disabled={sendingReply[discussion.id]}
                            className="bg-primary hover:bg-accent"
                          >
                            {sendingReply[discussion.id] ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              'Send Reply'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {discussion.replies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {discussion.replies.map((reply) => (
                          <div key={reply.id} className="p-3 border-l-2 border-primary/20 bg-secondary/5 rounded-r">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary text-xs font-bold">
                                  {reply.author?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{reply.author?.name || 'Unknown User'}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {reply.author?.role === 'teacher' ? 'Teacher' : 'Student'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Discussions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion!
                </p>
                <Button 
                  className="bg-primary hover:bg-accent"
                  onClick={handleOpenModal}
                >
                  Start Discussion
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-2">Welcome, {userName}!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This is a global discussion forum where all teachers and students can interact.
                </p>
              </Card>
            </motion.div>

            {/* Top Contributors */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Top Contributors</h2>
              </div>
              <Card className="p-4">
                {contributorsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#FF69B4' }} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contributors.map((contributor, index) => (
                      <div
                        key={contributor._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold">
                            {contributor.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{contributor.name || 'Unknown User'}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{contributor.totalPosts} posts</p>
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
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Discussion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Start a New Discussion</h2>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    type="text"
                    value={newDiscussionTitle}
                    onChange={(e) => setNewDiscussionTitle(e.target.value)}
                    className="w-full"
                    placeholder="Enter discussion title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">College (Optional)</label>
                  <Input
                    type="text"
                    value={newDiscussionCollege}
                    onChange={(e) => setNewDiscussionCollege(e.target.value)}
                    className="w-full"
                    placeholder="Enter your college name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={newDiscussionContent}
                    onChange={(e) => setNewDiscussionContent(e.target.value)}
                    className="min-h-[150px]"
                    placeholder="Share your thoughts..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-accent"
                  onClick={handleCreateDiscussion}
                  disabled={creatingDiscussion}
                >
                  {creatingDiscussion ? (
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
          </motion.div>
        </div>
      )}
    </div>
  );
}