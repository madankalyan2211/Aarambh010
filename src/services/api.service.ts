/**
 * API Service for backend communication
 */

import { refreshFirebaseToken } from './firebaseAuth.service';

// Use the API base URL from environment variables, with fallback to relative URLs for development
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

console.log('🔧 API Base URL:', API_BASE_URL || 'Using relative URLs (will be proxied)');

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Generic API request handler
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Construct the full URL
    // If API_BASE_URL is set, use absolute URLs
    // If not set, use relative URLs that will be proxied
    const fullUrl = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : `/api${endpoint}`;
    
    console.log('🚀 API Request:', {
      endpoint,
      fullUrl,
      method: options.method,
      headers,
      body: options.body,
    });
    
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Check if response is empty
    const responseText = await response.text();
    console.log('🚀 API Response:', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      responseText: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
    });
    
    // If response is empty, return appropriate error
    if (!responseText) {
      throw new Error(`Empty response from server (${response.status})`);
    }
    
    // Check if the response is a rate limiting error (plain text)
    if (responseText.includes('Too many requests') || responseText.includes('rate limit')) {
      throw new Error('Too many requests from this IP, please try again later.');
    }
    
    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // If parsing fails and it's not a rate limit error, return the text as error message
      throw new Error(responseText || `Invalid response from server (${response.status})`);
    }

    if (!response.ok) {
      // Extract error details from the response
      const errorMessage = data.message || data.error || `API request failed with status ${response.status}`;
      const errorDetails = {
        message: errorMessage,
        status: response.status,
        statusText: response.statusText,
        data: data
      };
      throw new Error(JSON.stringify(errorDetails));
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Parse error details if it's a JSON string (from our custom error above)
    let errorMessage = 'Unknown error occurred';
    let errorDetail = 'Unknown error';
    
    if (error instanceof Error) {
      // Check if it's a rate limiting error
      if (error.message.includes('Too many requests') || error.message.includes('rate limit')) {
        errorMessage = 'Too many requests from this IP, please try again later.';
        errorDetail = 'Rate limit exceeded. Please wait a few minutes before trying again.';
      } else {
        try {
          const errorDetails = JSON.parse(error.message);
          errorMessage = errorDetails.message;
          errorDetail = `${errorDetails.message} (${errorDetails.status}: ${errorDetails.statusText})`;
        } catch (parseError) {
          // If parsing fails, use the original error message
          errorMessage = error.message;
          errorDetail = error.message;
        }
      }
    }
    
    return {
      success: false,
      message: errorMessage,
      error: errorDetail,
    };
  }
};

/**
 * Enhanced API request handler with automatic token refresh for Firebase users
 */
export const apiRequestWithTokenRefresh = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    // Try the request with the current token
    let response = await apiRequest<T>(endpoint, options);
    
    // If we get a 401 Unauthorized error, try to refresh the token
    if (!response.success && (
      response.message.includes('Invalid token') || 
      response.message.includes('Not authorized') ||
      response.message.includes('Unauthorized Request')
    )) {
      console.log('Token might be expired, attempting to refresh...');
      
      // Try to refresh the Firebase token
      const newToken = await refreshFirebaseToken();
      
      if (newToken) {
        console.log('Token refreshed successfully, retrying request...');
        // Retry the request with the new token
        const retryOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`
          }
        };
        response = await apiRequest<T>(endpoint, retryOptions);
      } else {
        console.log('Token refresh failed, returning original error');
        // If token refresh failed, return the original error
        return response;
      }
    }
    
    return response;
  } catch (error) {
    console.error('API Error with token refresh:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send OTP to email
 */
export const sendOTP = async (email: string, name?: string): Promise<ApiResponse> => {
  return apiRequest('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
};

/**
 * Verify OTP
 */
export const verifyOTP = async (email: string, otp: string): Promise<ApiResponse> => {
  return apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
};

/**
 * Resend OTP
 */
export const resendOTP = async (email: string, name?: string): Promise<ApiResponse> => {
  return apiRequest('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email: string, name: string): Promise<ApiResponse> => {
  return apiRequest('/auth/send-welcome', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  console.log('🔍 getCurrentUser called with token:', token ? 'Token exists' : 'No token');
  if (!token) {
    return {
      success: false,
      message: 'No authentication token found',
    };
  }
  return apiRequest('/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Search users by email or name
 */
export const searchUsers = async (query: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/users/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export default {
  sendOTP,
  verifyOTP,
  resendOTP,
  sendWelcomeEmail,
  getCurrentUser,
  searchUsers,
};

/**
 * Enrollment API - Teacher-Student relationships
 */

/**
 * Get all available teachers (PUBLIC - no authentication required)
 */
export const getPublicTeachers = async (): Promise<ApiResponse> => {
  return apiRequest('/enrollment/teachers/public', {
    method: 'GET',
  });
};

/**
 * Get all available teachers
 */
export const getAllTeachers = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/enrollment/teachers', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get student's enrolled teachers
 */
export const getMyTeachers = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/enrollment/my-teachers', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Enroll with a teacher
 */
export const enrollWithTeacher = async (teacherId: string): Promise<ApiResponse> => {
  console.log('📚 enrollWithTeacher called with:', teacherId);
  console.log('📚 teacherId type:', typeof teacherId);
  console.log('📚 teacherId stringified:', JSON.stringify({ teacherId }));
  
  const token = localStorage.getItem('authToken');
  const body = JSON.stringify({ teacherId });
  console.log('📚 Request body:', body);
  
  return apiRequest('/enrollment/enroll-teacher', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: body,
  });
};

/**
 * Unenroll from a teacher
 */
export const unenrollFromTeacher = async (teacherId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/enrollment/unenroll-teacher', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ teacherId }),
  });
};

/**
 * Get teacher's students
 */
export const getMyStudents = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/enrollment/my-students', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Course Management API - For teachers to manage courses
 */

/**
 * Get all available courses (PUBLIC - no authentication required)
 */
export const getPublicCoursesAPI = async (): Promise<ApiResponse> => {
  return apiRequest('/courses/public', {
    method: 'GET',
  });
};

/**
 * Get all available courses
 */
export const getAllCoursesAPI = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/courses', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get teacher's teaching courses
 */
/**
 * Get course content with modules and lessons
 */
export const getTeachingCourses = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/courses/teaching', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Add course to teacher's teaching list
 */
export const addTeachingCourse = async (courseId: string): Promise<ApiResponse> => {
  console.log('📚 addTeachingCourse called with:', courseId);
  const token = localStorage.getItem('authToken');
  const body = JSON.stringify({ courseId });
  console.log('📚 Request body:', body);
  
  return apiRequest('/courses/add-teaching', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: body,
  });
};

/**
 * Remove course from teacher's teaching list
 */
export const removeTeachingCourse = async (courseId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/courses/remove-teaching', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId }),
  });
};

/**
 * Get course content with modules and lessons
 */
export const getCourseContentAPI = async (courseId: string): Promise<ApiResponse> => {
  console.log('🔍 API Call - getCourseContentAPI for courseId:', courseId);
  const token = localStorage.getItem('authToken');
  console.log('🔑 Auth token exists:', !!token);
  return apiRequest(`/courses/${courseId}/content`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Generate AI summary for a lesson
 */
export const generateLessonSummary = async (courseId: string, moduleId: string, lessonId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/summary`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};


/**
 * Grade API - For students and teachers
 */

/**
 * Get student's grades
 */
export const getStudentGrades = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/grades/student', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get teacher's grades overview
 */
export const getTeacherGrades = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/grades/teacher', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get detailed grade report for a student in a course
 */
export const getStudentGradeReport = async (studentId: string, courseId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/grades/student/${studentId}/course/${courseId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get student's enrolled courses
 */
export const getEnrolledCourses = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/courses/enrolled', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Enroll in a course
 */
export const enrollInCourse = async (courseId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/courses/enroll', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId }),
  });
};

/**
 * Enroll in a course with teacher selection
 */
export const enrollInCourseWithTeacher = async (courseId: string, teacherId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/enrollment/enroll-course', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId, teacherId }),
  });
};

/**
 * Unenroll from a course
 */
export const unenrollFromCourseNew = async (courseId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/enrollment/unenroll-course', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId }),
  });
};

/**
 * Assignment API - For teachers and students
 */

/**
 * Create a new assignment (Teacher only)
 */
export const createAssignment = async (assignmentData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/assignments/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(assignmentData),
  });
};

/**
 * Get assignments for student (from enrolled teachers)
 */
export const getStudentAssignments = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/assignments/student', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get assignments created by teacher
 */
export const getTeacherAssignments = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/assignments/teacher', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Submit an assignment (Student only) - for text-only submissions
 */
export const submitAssignment = async (submissionData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('/api/assignments/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    const responseText = await response.text();
    
    // If response is empty, return appropriate error
    if (!responseText) {
      throw new Error(`Empty response from server (${response.status})`);
    }
    
    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // Check if this is a rate limiting error
      if (response.status === 429 && responseText.includes('Too many requests')) {
        throw new Error(JSON.stringify({
          message: responseText,
          status: 429,
          statusText: 'Too Many Requests'
        }));
      }
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }

    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Submit an assignment with file attachments (Student only)
 */
export const submitAssignmentWithFiles = async (
  assignmentId: string, 
  content: string, 
  files: File[],
  onProgress?: (fileName: string, progress: number) => void,
  onFileComplete?: (fileName: string) => void
): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  
  // Create FormData for multipart submission
  const formData = new FormData();
  formData.append('assignmentId', assignmentId);
  formData.append('content', content || ''); // Ensure content is always a string
  
  files.forEach((file) => {
    console.log('Appending file to form data:', file.name, file.type);
    formData.append('attachments', file);
  });
  
  try {
    console.log('Submitting assignment with files:', { assignmentId, content, fileCount: files.length });
    
    // Use XMLHttpRequest for real progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          // Report progress for all files (simplified - showing overall progress)
          files.forEach(file => {
            onProgress(file.name, percentComplete);
          });
        }
      });
      
      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseText = xhr.responseText;
            if (!responseText) {
              reject(new Error('Empty response from server'));
              return;
            }
            
            const data = JSON.parse(responseText);
            // Mark all files as completely uploaded
            if (onFileComplete) {
              files.forEach(file => {
                onFileComplete(file.name);
              });
            }
            resolve(data);
          } catch (parseError) {
            reject(new Error('Failed to parse server response: ' + (parseError as Error).message));
          }
        } else {
          try {
            const responseText = xhr.responseText;
            if (responseText) {
              // Check if this is a rate limiting error
              if (xhr.status === 429 && responseText.includes('Too many requests')) {
                reject(new Error('Too many requests from this IP, please try again later.'));
                return;
              }
              
              const errorData = JSON.parse(responseText);
              reject(new Error(errorData.message || `Upload failed with status ${xhr.status}`));
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          } catch (parseError) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });
      
      // Set up the request
      xhr.open('POST', '/api/assignments/submit');
      // Note: Don't set Content-Type header when using FormData - browser will set it with boundary
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get submissions for a specific assignment (Teacher only)
 */
export const getAssignmentSubmissions = async (assignmentId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/assignments/${assignmentId}/submissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Grade a submission (Teacher only)
 */
export const gradeSubmission = async (submissionId: string, gradeData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/assignments/grade/${submissionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(gradeData),
  });
};

/**
 * AI Grade a submission (Teacher only)
 */
export const aiGradeSubmission = async (submissionId: string, aiPrompt?: string): Promise<ApiResponse> => {
  console.log('🚀 API Call - aiGradeSubmission for submissionId:', submissionId);
  const token = localStorage.getItem('authToken');
  return apiRequest(`/assignments/ai-grade/${submissionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ aiPrompt }),
  });
};

/**
 * Discussion API
 */

/**
 * Get all discussions for a course
 */
export const getCourseDiscussions = async (courseId: string, category?: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  const queryParams = category ? `?category=${category}` : '';
  return apiRequest(`/discussions/course/${courseId}${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Create a new discussion
 */
export const createDiscussion = async (discussionData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/discussions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(discussionData),
  });
};

/**
 * Get a single discussion
 */
export const getDiscussion = async (discussionId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/discussions/${discussionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Add a reply to a discussion
 */
export const addReply = async (discussionId: string, content: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/discussions/${discussionId}/reply`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
};

/**
 * Like/unlike a discussion
 */
export const likeDiscussion = async (discussionId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/discussions/${discussionId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get top contributors based on discussion activity
 */
export const getTopContributors = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/discussions/contributors/top', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get all global discussions (visible to all users)
 */
export const getAllDiscussions = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/discussions/global', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Create a new global discussion (visible to all users)
 */
export const createGlobalDiscussion = async (discussionData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/discussions/global', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(discussionData),
  });
};

/**
 * Message API
 */

/**
 * Get user's conversations
 */
export const getConversations = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/messages/conversations', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/messages/conversation/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Send a new message
 */
export const sendMessage = async (messageData: { receiverId: string; content: string; conversationId?: string }): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(messageData),
  });
};

/**
 * Create a new conversation
 */
export const createConversation = async (participantIds: string[]): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/messages/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ participantIds }),
  });
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (conversationId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/messages/conversation/${conversationId}/read`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get unread messages count
 */
export const getUnreadMessagesCount = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/messages/unread-count', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get the API base URL for external use
 * Always returns empty string to use relative URLs with proxying
 */
export const getApiBaseUrl = (): string => {
  return '';
};

/**
 * Admin Dashboard API
 */

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/stats', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get daily active users data
 */
export const getDailyActiveUsers = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/analytics/daily-active-users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get course enrollment trend data
 */
export const getEnrollmentTrend = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/analytics/enrollment-trend', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get all users for admin management
 */
export const getAdminUsers = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get all courses for admin management
 */
export const getAdminCourses = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/courses', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get system health information
 */
export const getSystemHealth = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/system-health', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (userId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Delete a course by ID
 */
export const deleteCourse = async (courseId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/admin/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Create a new user
 */
export const createUser = async (userData: { name: string; email: string; password: string; role: string }): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
};

/**
 * Create a new course
 */
export const createCourse = async (courseData: { name: string; description: string; category?: string; difficulty?: string; maxStudents?: number }): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/courses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });
};

/**
 * Get flagged submissions for cheat detection
 */
export const getFlaggedSubmissions = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/admin/flagged-submissions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get all notifications for current user
 */
export const getNotifications = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/notifications', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationsCount = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/notifications/unread-count', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/notifications/mark-all-read', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Create a new announcement
 */
export const createAnnouncement = async (announcementData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/announcements', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(announcementData),
  });
};

/**
 * Get announcements for current user
 */
export const getAnnouncements = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/announcements', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get a specific announcement
 */
export const getAnnouncement = async (announcementId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/announcements/${announcementId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Course Content Management APIs (for teachers)

/**
 * Update course content (teacher only)
 */
export const updateCourseContent = async (courseId: string, courseData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/courses/${courseId}/content`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });
};

/**
 * Add module to course (teacher only)
 */
export const addModule = async (courseId: string, moduleData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/courses/${courseId}/modules`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(moduleData),
  });
};

/**
 * Update module (teacher only)
 */
export const updateModule = async (courseId: string, moduleId: string, moduleData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/courses/${courseId}/modules/${moduleId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(moduleData),
  });
};

/**
 * Delete module (teacher only)
 */
export const deleteModule = async (courseId: string, moduleId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/courses/${courseId}/modules/${moduleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Add lesson to module (teacher only)
 */
export const addLesson = async (courseId: string, moduleId: string, lessonData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  // Remove content field from lessonData if it exists
  const filteredLessonData = { ...lessonData };
  delete filteredLessonData.content;
  return apiRequest(`/courses/${courseId}/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(filteredLessonData),
  });
};

/**
 * Update lesson (teacher only)
 */
export const updateLesson = async (courseId: string, moduleId: string, lessonId: string, lessonData: any): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  // Remove content field from lessonData if it exists
  const filteredLessonData = { ...lessonData };
  delete filteredLessonData.content;
  return apiRequest(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(filteredLessonData),
  });
};

/**
 * Delete lesson (teacher only)
 */
export const deleteLesson = async (courseId: string, moduleId: string, lessonId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Upload lesson video (teacher only)
 */
export const uploadLessonVideo = async (courseId: string, moduleId: string, lessonId: string, videoFile: File): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('video', videoFile);
  
  try {
    const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/upload-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await response.text();
    
    // If response is empty, return appropriate error
    if (!responseText) {
      throw new Error(`Empty response from server (${response.status})`);
    }
    
    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }

    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Upload lesson PDF (teacher only)
 */
export const uploadLessonPDF = async (courseId: string, moduleId: string, lessonId: string, pdfFile: File): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('pdf', pdfFile);
  
  try {
    const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/upload-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await response.text();
    
    // If response is empty, return appropriate error
    if (!responseText) {
      throw new Error(`Empty response from server (${response.status})`);
    }
    
    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }

    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Quiz API
 */

/**
 * Get quizzes for student based on enrolled courses
 */
export const getStudentQuizzes = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/quizzes/student', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get a specific quiz by ID
 */
export const getQuizById = async (quizId: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/quizzes/${quizId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Submit a quiz (Student only)
 */
export const submitQuiz = async (quizId: string, answers: number[]): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest(`/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });
};

/**
 * Get quiz submissions for a student
 */
export const getStudentQuizSubmissions = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/quizzes/submissions/student', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get quiz submissions for a teacher
 */
export const getTeacherQuizSubmissions = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('authToken');
  return apiRequest('/quizzes/submissions/teacher', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};
