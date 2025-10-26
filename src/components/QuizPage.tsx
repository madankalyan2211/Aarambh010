import { useState, useEffect } from 'react';
import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle, XCircle, Trophy, Play, RotateCcw, Brain } from 'lucide-react';
import { getStudentQuizzes, getQuizById, submitQuiz } from '../services/api.service';

interface QuizPageProps {
  onNavigate: (page: Page) => void;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName?: string;
  questions: Question[];
  duration: number;
  attemptsAllowed: number;
  passingScore: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export function QuizPage({ onNavigate }: QuizPageProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (quizStarted && !showResults && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResults && quizStarted) {
      handleFinishQuiz();
    }
  }, [quizStarted, showResults, timeLeft]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await getStudentQuizzes();
      if (response.success && response.data) {
        // Transform the data to match our interface
        const transformedQuizzes = response.data.map((quiz: any) => ({
          id: quiz.id || quiz._id,
          title: quiz.title,
          description: quiz.description,
          courseId: quiz.courseId,
          courseName: quiz.courseName,
          questions: quiz.questions || [],
          duration: quiz.duration || 10,
          attemptsAllowed: quiz.attemptsAllowed || 3,
          passingScore: quiz.passingScore || 70,
          published: quiz.published !== undefined ? quiz.published : true,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
        }));
        setQuizzes(transformedQuizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setSelectedAnswer(null);
    setShowResults(false);
    setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    
    if (currentQuestion < (selectedQuiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1]);
    }
  };

  const handlePrevious = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    
    setCurrentQuestion(currentQuestion - 1);
    setSelectedAnswer(answers[currentQuestion - 1]);
  };

  const handleFinishQuiz = async () => {
    if (!selectedQuiz) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    
    // Convert null answers to -1 (or another default value)
    const cleanAnswers = newAnswers.map(answer => answer === null ? -1 : answer);
    
    setSubmitting(true);
    
    try {
      const response = await submitQuiz(selectedQuiz.id, cleanAnswers);
      if (response.success && response.data) {
        setSubmissionResult(response.data);
        setShowResults(true);
      } else {
        console.error('Error submitting quiz:', response.message);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
    setSubmissionResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (!quizStarted && !selectedQuiz) {
    // Quiz Selection Screen
    return (
      <div className="min-h-screen p-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h1>Knowledge Quiz</h1>
            </div>
            <p className="text-muted-foreground">Test your knowledge and track your progress</p>
          </motion.div>

          {quizzes.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Quizzes Available</h3>
              <p className="text-muted-foreground">
                You're not enrolled in any courses yet. Enroll in courses to take quizzes.
              </p>
              <Button 
                className="mt-4 bg-primary hover:bg-accent"
                onClick={() => onNavigate('my-teachers')}
              >
                Find Courses
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all border-secondary cursor-pointer h-full flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="border-primary text-primary">
                          {quiz.courseName}
                        </Badge>
                        <Badge className="bg-primary text-white">
                          {quiz.questions.length} Questions
                        </Badge>
                      </div>
                      <h3 className="mb-3">{quiz.title}</h3>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {quiz.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{quiz.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🎯 Pass: {quiz.passingScore}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🔄 {quiz.attemptsAllowed} attempts</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 bg-primary hover:bg-accent"
                      onClick={() => startQuiz(quiz)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showResults && submissionResult) {
    // Results Screen
    const percentage = submissionResult.percentage;
    const score = submissionResult.score;
    const totalQuestions = submissionResult.totalQuestions;

    return (
      <div className="min-h-screen p-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
            <h1 className="mb-2">Quiz Complete!</h1>
            <p className="text-muted-foreground">Great job completing the quiz</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{percentage}%</div>
                <p className="text-xl mb-2">
                  {score} out of {totalQuestions} correct
                </p>
                <Badge className="bg-primary text-white text-lg px-4 py-1">
                  {percentage >= 90 ? 'Excellent!' : percentage >= 70 ? 'Good Job!' : percentage >= 50 ? 'Keep Practicing!' : 'Need More Study'}
                </Badge>
                <p className="mt-4 text-muted-foreground">
                  {submissionResult.passed ? '🎉 You passed the quiz!' : '📚 Keep studying and try again!'}
                </p>
              </div>
              <Progress value={percentage} className="h-3" />
            </Card>
          </motion.div>

          <div className="flex gap-3 mt-8 justify-center">
            <Button variant="outline" onClick={resetQuiz}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Take Another Quiz
            </Button>
            <Button className="bg-primary hover:bg-accent" onClick={() => onNavigate('student-dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking Screen
  if (!selectedQuiz) return null;
  
  const currentQ = selectedQuiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header with Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{selectedQuiz.title}</h3>
                <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {selectedQuiz.questions.length}</p>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Clock className={`h-5 w-5 ${timeLeft < 60 ? 'text-accent' : 'text-primary'}`} />
                <span className={timeLeft < 60 ? 'text-accent' : ''}>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </Card>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 mb-6">
              <h2 className="mb-6">{currentQ.question}</h2>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedAnswer === index
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary">
                      {selectedAnswer === index && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 cursor-pointer">
                      {option}
                    </div>
                  </div>
                ))}
              </div>
              {currentQ.explanation && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Explanation:</strong> {currentQ.explanation}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {selectedQuiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = selectedAnswer;
                  setAnswers(newAnswers);
                  setCurrentQuestion(index);
                  setSelectedAnswer(answers[index]);
                }}
                className={`w-8 h-8 rounded-full text-sm transition-all ${
                  index === currentQuestion
                    ? 'bg-primary text-white'
                    : answers[index] !== null
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === selectedQuiz.questions.length - 1 ? (
            <Button
              className="bg-accent hover:bg-accent/90"
              onClick={handleFinishQuiz}
              disabled={selectedAnswer === null || submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Finish Quiz'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="bg-primary hover:bg-accent"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}