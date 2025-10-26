import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceAssistantProps {
  userRole?: string;
}

export function VoiceAssistant({ userRole }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const recognitionRef = useRef(null as any);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        handleVoiceCommand(speechResult);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!showDialog) {
      // Open dialog if closed
      setShowDialog(true);
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    try {
      // Generate AI response based on the command
      const aiResponse = await getAIResponse(command, userRole);
      setResponse(aiResponse);
      
      // Speak the response
      speakResponse(aiResponse);
    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorMsg = 'Sorry, I encountered an error processing your request.';
      setResponse(errorMsg);
      speakResponse(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAIResponse = async (command: string, role?: string): Promise<string> => {
    const lowerCommand = command.toLowerCase();

    // Educational context-aware responses
    const responses: { [key: string]: string } = {
      // Greetings
      'hello': `Hello! I'm your Aarambh learning assistant. How can I help you today?`,
      'hi': `Hi there! I'm here to help you with your learning journey. What would you like to know?`,
      'hey': `Hey! Ready to assist you with your studies. What can I do for you?`,
      
      // Navigation
      'dashboard': `Navigating to your dashboard. You can view your courses, assignments, and progress there.`,
      'courses': `Opening your courses page where you can browse all available learning materials.`,
      'assignments': `Taking you to assignments. You can view pending tasks and submit your work there.`,
      'grades': `Showing your grades page where you can track your academic performance.`,
      'discussion': `Opening the discussion forum where you can interact with peers and teachers.`,
      
      // Help and information
      'help': `I can help you navigate the platform, answer questions about your courses, assignments, and provide study tips. What do you need help with?`,
      'what can you do': `I can help you navigate Aarambh, answer questions about courses and assignments, provide study tips, check your progress, and more. Just ask!`,
      'how are you': `I'm functioning perfectly and ready to help you learn! How are your studies going?`,
      
      // Study tips
      'study tips': `Here are some effective study tips: Use active recall, space out your learning sessions, teach concepts to others, take regular breaks, and stay consistent. Would you like specific tips for a subject?`,
      'how to study': `Effective studying involves active engagement, regular practice, and spaced repetition. Break topics into smaller chunks, use flashcards, and test yourself frequently. What subject are you studying?`,
      'motivation': `Remember, every expert was once a beginner. Stay focused on your goals, celebrate small wins, and don't be afraid to ask for help. You're doing great by being here!`,
      
      // Time management
      'time': new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      'date': new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      
      // Course-specific
      'ai course': `The AI course covers machine learning fundamentals, neural networks, and practical applications. Would you like to know about specific modules?`,
      'machine learning': `Machine learning is about teaching computers to learn from data. Our course covers supervised learning, unsupervised learning, and deep learning techniques.`,
      'assignments due': `Let me check your upcoming assignments. You have assignments in AI Basics and Neural Networks due this week. Would you like more details?`,
      
      // Progress
      'progress': `Your learning streak is at 14 days - fantastic! You've completed 75% of your current courses. Keep up the excellent work!`,
      'streak': `You're on a 14-day learning streak! That's amazing commitment. Keep it up to maintain your momentum!`,
      
      // General knowledge
      'who created you': `I was created by the Aarambh team to help students like you succeed in their learning journey.`,
      'what is aarambh': `Aarambh is an AI-powered Learning Management System designed to make education interactive, engaging, and personalized. The name Aarambh means "beginning" in Hindi.`,
      
      // Encouragement
      'thank you': `You're very welcome! I'm always here to help you succeed. Happy learning!`,
      'thanks': `My pleasure! Feel free to ask me anything anytime you need help.`,
    };

    // Check for exact matches first
    for (const [key, value] of Object.entries(responses)) {
      if (lowerCommand.includes(key)) {
        return value;
      }
    }

    // Role-specific responses
    if (role === 'student') {
      if (lowerCommand.includes('next class') || lowerCommand.includes('schedule')) {
        return `Your next class is Machine Learning at 2:00 PM today. Don't forget to review the previous lecture notes!`;
      }
      if (lowerCommand.includes('quiz') || lowerCommand.includes('test')) {
        return `You have a quiz scheduled for next Monday in AI Fundamentals. I recommend reviewing chapters 3 and 4.`;
      }
    } else if (role === 'teacher') {
      if (lowerCommand.includes('students') || lowerCommand.includes('class')) {
        return `You have 45 active students across your courses. 12 students have pending assignment submissions.`;
      }
      if (lowerCommand.includes('grade') || lowerCommand.includes('grading')) {
        return `You have 8 assignments waiting to be graded. Would you like me to take you to the grading page?`;
      }
    }

    // Default AI-powered response
    return `I heard you say: "${command}". I'm here to help with navigation, study tips, course information, and general questions about Aarambh. Could you please rephrase or ask something specific?`;
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleListening}
        className={`relative ${isListening ? 'bg-primary/10 text-primary' : ''}`}
        title="Voice Assistant"
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Mic className="h-5 w-5" />
          </motion.div>
        ) : (
          <Mic className="h-5 w-5" />
        )}
        {isListening && (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </Button>

      <AnimatePresence>
        {showDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => {
                setShowDialog(false);
                if (isListening) {
                  recognitionRef.current?.stop();
                  setIsListening(false);
                }
              }}
            />
            
            {/* Siri-style Dialog */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-4 right-4 z-50 max-w-2xl"
              style={{ top: 'calc(8rem + 10px)' }}
            >
              <div className="bg-card/95 backdrop-blur-xl border-4 border-primary shadow-2xl rounded-3xl overflow-hidden">
                {/* Header with animated orb */}
                <div className="flex items-center justify-center p-6 pb-4 relative">
                  {isListening ? (
                    <motion.div
                      className="relative flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {/* Animated background orb */}
                      <motion.div
                        className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-primary/30 via-purple-500/30 to-pink-500/30"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ repeat: Infinity, duration: 3 }}
                      />
                      <motion.div
                        className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-pink-500/40"
                        animate={{ 
                          scale: [1.2, 1, 1.2],
                          rotate: [360, 180, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                      <div className="relative p-4 rounded-full bg-primary/20">
                        <Mic className="h-8 w-8 text-primary" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-4 rounded-full bg-secondary/50">
                      <Mic className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowDialog(false);
                      if (isListening) {
                        recognitionRef.current?.stop();
                        setIsListening(false);
                      }
                    }}
                    className="absolute top-4 right-4 h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status text */}
                <div className="text-center px-6 pb-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'How can I help you?'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {!transcript && !response && 'Click the microphone to speak'}
                  </p>
                </div>

                {/* Content Area - Expands based on content */}
                <AnimatePresence>
                  {(transcript || response) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 space-y-3 max-h-[40vh] overflow-y-auto">
                        {/* User's Speech */}
                        {transcript && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="max-w-[85%] p-3 bg-secondary/70 rounded-2xl rounded-tl-sm">
                              <p className="text-xs text-muted-foreground mb-1 font-medium">You said:</p>
                              <p className="text-sm">{transcript}</p>
                            </div>
                          </motion.div>
                        )}

                        {/* Processing Indicator */}
                        {isProcessing && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-end"
                          >
                            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-2xl rounded-tr-sm">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                              />
                              <p className="text-sm text-muted-foreground">Thinking...</p>
                            </div>
                          </motion.div>
                        )}

                        {/* Assistant Response */}
                        {response && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-end"
                          >
                            <div className="max-w-[85%] p-3 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl rounded-tr-sm border border-primary/20">
                              <div className="flex items-start gap-2">
                                <Volume2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-primary mb-1 font-medium">Assistant:</p>
                                  <p className="text-sm">{response}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggestions - Only show when no conversation */}
                {!transcript && !response && (
                  <div className="px-6 pb-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Hello', 'Help', 'Study tips', 'Courses', 'Progress'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            if (!isListening) {
                              setTranscript(suggestion);
                              handleVoiceCommand(suggestion);
                            }
                          }}
                          className="px-4 py-2 text-sm bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer - Microphone button */}
                <div className="p-6 pt-4 border-t border-border/50">
                  <Button
                    onClick={toggleListening}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-full py-6 font-semibold text-foreground dark:text-white"
                    size="lg"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-5 w-5" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5" />
                        Tap to Speak
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
