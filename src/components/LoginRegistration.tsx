import { useState, useEffect } from 'react';
import { UserRole } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Mail, AlertCircle, Sparkles, Trophy, Users, BookOpen, Zap, Award, Chrome } from 'lucide-react';
import { Auth0Login } from './Auth0Login';
import { FirebaseGoogleLoginButton } from './FirebaseGoogleLoginButton';
import { signInWithGoogle, loginWithEmail } from '../services/firebaseAuth.service';

interface LoginRegistrationProps {
  onLogin: (role: UserRole, name?: string, email?: string) => void;
}

export function LoginRegistration({ onLogin }: LoginRegistrationProps) {
  const [role, setRole] = useState('student' as 'student' | 'teacher' | 'admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  // Email verification states
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Firebase states
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoginError('');
    
    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter email and password.');
      return;
    }
    
    try {
      // Pass the selected role to the login function
      const user = await loginWithEmail(email, password, role);
      if (user) {
        localStorage.setItem('authToken', user.token);
        localStorage.setItem('userData', JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role,
        }));
        onLogin(user.role as UserRole, user.name, user.email);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Login failed. Please try again.');
    }
  };

  // Handle Firebase Google Sign-In
  const handleFirebaseGoogleSignIn = async () => {
    if (!isFirebaseConfigured()) {
      alert('Firebase authentication is not properly configured. Please contact the administrator.');
      return;
    }
    
    setIsFirebaseLoading(true);
    try {
      // For Google sign-in, we'll default to student role as requested
      const user = await signInWithGoogle('student');
      if (user) {
        localStorage.setItem('authToken', user.token);
        localStorage.setItem('userData', JSON.stringify({
          id: user.id, // Include the user ID
          email: user.email,
          name: user.name,
          role: user.role,
        }));
        // Pass all user data to the onLogin callback
        onLogin(user.role as UserRole, user.name, user.email);
      }
    } catch (error: any) {
      console.error('Firebase Google sign-in error:', error);
      if (error.code === 'auth/api-key-not-valid') {
        alert('Firebase authentication is not properly configured. Please contact the administrator.');
      } else {
        alert('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  // Fireworks state
  const [showFireworks, setShowFireworks] = useState(true);
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; targetY: number; color: string }>>([]);
  
  // Create exploding fireworks effect
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    const createFirework = () => {
      const newFirework = {
        id: Date.now() + Math.random(),
        x: 20 + Math.random() * 60,
        targetY: 20 + Math.random() * 40,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`
      };
      setFireworks(prev => [...prev, newFirework]);
      
      setTimeout(() => {
        setFireworks(prev => prev.filter(fw => fw.id !== newFirework.id));
      }, 2200);
    };
    
    const interval = setInterval(createFirework, isMobile ? 2500 : 1800);
    return () => clearInterval(interval);
  }, []);

  const tourSlides = [
    {
      title: 'Welcome to Aarambh! 🎉',
      description: 'Your AI-powered learning companion is ready to help you succeed.',
    },
    {
      title: 'Track Your Progress 📊',
      description: 'Monitor your learning journey with detailed analytics and insights.',
    },
    {
      title: 'Engage with Community 💬',
      description: 'Connect with peers, join discussions, and learn together.',
    },
    {
      title: 'Gamified Learning 🎮',
      description: 'Earn badges, maintain streaks, and climb the leaderboard!',
    },
  ];

  // State for showing Auth0 login
  const [showAuth0Login, setShowAuth0Login] = useState(false);

  // Handle successful Auth0 login
  const handleAuth0Login = (role: 'student' | 'teacher' | 'admin', name: string, email: string) => {
    onLogin(role, name, email);
    setShowAuth0Login(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {showAuth0Login ? (
        <Auth0Login onLogin={handleAuth0Login} />
      ) : (
        <div className="relative z-10 flex items-center justify-center px-4 pb-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md relative"
          >
            <Card className="p-8 backdrop-blur-sm bg-card/95 shadow-2xl border-2 border-primary/10">
              {/* Show Email Verification if needed */}
              {showEmailVerification ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-primary mb-2">Verify Your Email</h2>
                    <p className="text-muted-foreground text-sm">
                      We've sent a verification link to your email.
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Please check your email and click the verification link to complete registration.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Didn't receive the email?
                      </p>
                      <Button
                        variant="link"
                        className="text-primary p-0 h-auto"
                        onClick={() => alert('Please check your spam folder or contact support.')}
                      >
                        Resend Verification Email
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setShowEmailVerification(false);
                        setVerificationSent(false);
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-primary mb-2">Welcome to Aarambh!</h2>
                    <p className="text-muted-foreground">
                      Sign in to continue learning
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Selection moved to the top as requested */}
                    <div className="space-y-2">
                      <Label htmlFor="role-select" className="text-left block mb-2">Select Your Role</Label>
                      <Select value={role} onValueChange={(value: string) => setRole(value as typeof role)}>
                        <SelectTrigger id="role-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">👩‍🎓 Student</SelectItem>
                          <SelectItem value="teacher">👨‍🏫 Teacher</SelectItem>
                          <SelectItem value="admin">⚙️ Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked: boolean) => setRememberMe(checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-accent">
                      Sign In
                    </Button>

                    {loginError && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{loginError}</span>
                      </div>
                    )}
                  </form>

                  {/* Social Login Options */}
                  <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground mb-4">Or continue with</p>
                    
                    {/* Firebase Google Sign In Button - Only for new student users */}
                    {role === 'student' && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          New student users: Sign up with Google
                        </p>
                        <FirebaseGoogleLoginButton 
                          onClick={handleFirebaseGoogleSignIn}
                          isLoading={isFirebaseLoading}
                          isDisabled={!isFirebaseConfigured()}
                        />
                      </div>
                    )}
                    
                    {role !== 'student' && (
                      <p className="text-xs text-muted-foreground">
                        Google Sign-In is only available for student accounts
                      </p>
                    )}
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      )}

      {/* Micro Tour Dialog */}
      <Dialog open={showTour} onOpenChange={setShowTour}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tourSlides[tourStep].title}</DialogTitle>
            <DialogDescription>{tourSlides[tourStep].description}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              {tourSlides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === tourStep ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {tourStep < tourSlides.length - 1 ? (
                <>
                  <Button variant="ghost" onClick={() => setShowTour(false)}>
                    Skip
                  </Button>
                  <Button onClick={() => setTourStep(tourStep + 1)}>Next</Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setShowTour(false);
                  }}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}