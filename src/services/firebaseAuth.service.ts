import { auth, googleProvider } from '../config/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { apiRequest } from './api.service';

// User type that matches our backend
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  token: string;
}

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  try {
    const firebaseConfig = {
      apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
      authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
    };
    
    // Check if all required configuration values are present
    return firebaseConfig.apiKey && 
           firebaseConfig.apiKey.startsWith('AIzaSy') && 
           firebaseConfig.apiKey.length > 30 &&
           firebaseConfig.authDomain &&
           firebaseConfig.projectId &&
           firebaseConfig.storageBucket &&
           firebaseConfig.messagingSenderId &&
           firebaseConfig.appId;
  } catch (error) {
    return false;
  }
};

// Firebase user converter
const convertFirebaseUser = (firebaseUser: FirebaseUser): AuthUser => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    role: 'student', // Default role, will be updated from backend
    token: '' // Will be set after backend verification
  };
};

// Register user with email and password
export const registerWithEmail = async (email: string, password: string, name: string): Promise<AuthUser | null> => {
  // Check if Firebase is configured
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase authentication is not properly configured. Please contact the administrator.');
  }
  
  try {
    console.log('Registering user with email:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update user profile with name
    await updateProfile(firebaseUser, { displayName: name });
    
    // Send email verification
    console.log('Sending email verification to:', email);
    await sendEmailVerification(firebaseUser);
    
    // Don't sync with backend immediately - user needs to verify email first
    // Return null to indicate that verification is needed
    return null;
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    throw error;
  }
};

// Login with email and password (using direct MongoDB authentication)
export const loginWithEmail = async (email: string, password: string, role?: 'student' | 'teacher' | 'admin'): Promise<AuthUser | null> => {
  try {
    // Directly call the backend API for authentication (bypassing Firebase)
    const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.success) {
      return {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
        token: data.data.token
      };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error: any) {
    console.error('Direct login error:', error);
    throw error;
  }
};

// Hybrid login - tries Firebase first, falls back to MongoDB if user exists there
export const hybridLogin = async (email: string, password: string, role?: 'student' | 'teacher' | 'admin'): Promise<AuthUser | null> => {
  // For your specific requirement, we'll use direct MongoDB login
  return await loginWithEmail(email, password, role);
};

// Google sign-in
export const signInWithGoogle = async (role?: 'student' | 'teacher' | 'admin'): Promise<AuthUser | null> => {
  // Check if Firebase is configured
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase authentication is not properly configured. Please contact the administrator.');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Sync with backend
    const backendUser = await syncUserWithBackend(firebaseUser, undefined, role);
    return backendUser;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    // Provide more user-friendly error messages
    if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Firebase authentication is not properly configured. Please contact the administrator.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else {
      throw error;
    }
  }
};

// Sync Firebase user with backend
const syncUserWithBackend = async (firebaseUser: FirebaseUser, name?: string, role?: 'student' | 'teacher' | 'admin'): Promise<AuthUser | null> => {
  try {
    // Get Firebase ID token
    const idToken = await firebaseUser.getIdToken();
    
    // Send to backend to create/update user and get JWT
    const response = await apiRequest('/auth/firebase/callback', {
      method: 'POST',
      body: JSON.stringify({
        idToken,
        name: name || firebaseUser.displayName,
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        role: role // Pass the selected role to the backend
      }),
    });
    
    if (response.success) {
      return {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        token: response.data.token
      };
    } else {
      throw new Error(response.message || 'Failed to sync user with backend');
    }
  } catch (error: any) {
    console.error('Backend sync error:', error);
    throw error;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase logout error:', error);
    throw error;
  }
};

// Listen for auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  // Check if Firebase is configured
  if (!isFirebaseConfigured()) {
    // Call callback with null to indicate no user
    callback(null);
    // Return a no-op unsubscribe function
    return () => {};
  }
  
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await syncUserWithBackend(firebaseUser);
        callback(user);
      } catch (error) {
        console.error('Auth state change error:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Refresh Firebase token
export const refreshFirebaseToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Get a fresh ID token
      const idToken = await currentUser.getIdToken(true); // Force refresh
      // Sync with backend to get a new JWT
      const backendUser = await syncUserWithBackend(currentUser);
      return backendUser ? backendUser.token : null;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing Firebase token:', error);
    return null;
  }
};
