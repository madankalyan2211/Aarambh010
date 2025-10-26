import { useState, useRef, useEffect } from 'react';
import { Page } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Play, Save, Download, Copy, Terminal, BookOpen, Code, Zap, AlertCircle } from 'lucide-react';
import { apiRequestWithTokenRefresh } from '../services/api.service';

interface CodeLabPageProps {
  onNavigate: (page: Page) => void;
}

// JDoodle API configuration
const JDoodle_CLIENT_ID = '970044049584274a32d76fcdcc6a6d2f';
const JDoodle_CLIENT_SECRET = '16ebe3988f39f7e72d03476f0dcf54487a3e84d8a1b1b20d3d5cdee791f625dd';

const LANGUAGES = [
  { 
    id: 'python3', 
    name: 'Python 3', 
    version: '3.6', 
    defaultCode: `# Python 3 example
print("Hello, World!")

# Try this exercise:
# Create a function that calculates the factorial of a number

def factorial(n):
    # Your code here
    pass

# Test your function
print(factorial(5))`,
    scriptLanguage: 'python3'
  },
  { 
    id: 'java', 
    name: 'Java', 
    version: '11.0.2', 
    defaultCode: `// Java example
class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Try this exercise:
        // Create a method that checks if a number is prime
        
        // Your code here
    }
}`,
    scriptLanguage: 'java'
  },
  { 
    id: 'cpp', 
    name: 'C++', 
    version: '17', 
    defaultCode: `// C++ example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Try this exercise:
    // Create a function that reverses a string
    
    // Your code here
    
    return 0;
}`,
    scriptLanguage: 'cpp17'
  },
  { 
    id: 'javascript', 
    name: 'JavaScript', 
    version: 'node', 
    defaultCode: `// JavaScript example
console.log("Hello, World!");

// Try this exercise:
// Create a function that finds the maximum element in an array

function findMax(arr) {
    // Your code here
}

// Test your function
console.log(findMax([1, 5, 3, 9, 2]));`,
    scriptLanguage: 'nodejs'
  },
  { 
    id: 'c', 
    name: 'C', 
    version: 'gcc 9.2.0', 
    defaultCode: `// C example
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    
    // Try this exercise:
    // Create a function that calculates the sum of digits of a number
    
    // Your code here
    
    return 0;
}`,
    scriptLanguage: 'c'
  }
];

const EXERCISES = [
  {
    id: 'intro',
    title: 'Introduction to Programming',
    description: 'Learn the basics of programming with simple exercises',
    languages: ['python3', 'javascript'],
    difficulty: 'Beginner',
    content: `# Introduction to Programming
This exercise will help you get familiar with basic programming concepts.

## Task 1: Hello World
Write a program that prints "Hello, World!" to the console.

## Task 2: Variables and Operations
Create variables to store your name and age, then print a message using these variables.

## Task 3: Simple Functions
Write a function that takes two numbers as parameters and returns their sum.`
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Practice implementing common data structures',
    languages: ['python3', 'java', 'cpp'],
    difficulty: 'Intermediate',
    content: `# Data Structures
In this exercise, you'll implement basic data structures.

## Task 1: Arrays/List
Create an array/list and perform basic operations like adding, removing, and searching elements.

## Task 2: Stack Implementation
Implement a stack with push, pop, and peek operations.

## Task 3: Queue Implementation
Implement a queue with enqueue, dequeue, and front operations.`
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Implement and test classic algorithms',
    languages: ['python3', 'java', 'cpp', 'javascript'],
    difficulty: 'Advanced',
    content: `# Algorithms
This exercise focuses on implementing classic algorithms.

## Task 1: Sorting
Implement a sorting algorithm like bubble sort or quick sort.

## Task 2: Searching
Implement binary search for a sorted array.

## Task 3: Recursion
Solve a problem using recursion, such as calculating Fibonacci numbers.`
  }
];

export function CodeLabPage({ onNavigate }: CodeLabPageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [memoryUsed, setMemoryUsed] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0].id);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update code when language changes
  useEffect(() => {
    const language = LANGUAGES.find(lang => lang.id === selectedLanguage);
    if (language) {
      setCode(language.defaultCode);
    }
  }, [selectedLanguage]);

  const handleExecuteCode = async (retryCount = 0) => {
    setIsExecuting(true);
    setOutput('');
    setExecutionTime(null);
    setMemoryUsed(null);
    setError(null);
    
    try {
      const language = LANGUAGES.find(lang => lang.id === selectedLanguage);
      if (!language) {
        throw new Error('Selected language not found');
      }
      
      // Prepare the request payload
      const payload = {
        script: code,
        language: language.scriptLanguage,
        versionIndex: "0"
      };
      
      console.log('Executing code with payload:', payload);
      
      // Get the auth token
      const token = localStorage.getItem('authToken');
      
      // Make the API request to our backend proxy using the enhanced api service
      const result = await apiRequestWithTokenRefresh('/code-lab/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Backend proxy response:', result);
      
      if (!result.success) {
        // Handle specific error cases
        if (result.message && result.message.includes('SSL connection issues') && retryCount < 2) {
          // Retry for SSL connection issues (max 2 retries with delay)
          setTimeout(() => handleExecuteCode(retryCount + 1), 3000);
          return;
        } else if (result.message && result.message.includes('SSL connection issues')) {
          setError('The code execution service is temporarily unavailable due to SSL connection issues. Our team is working to resolve this. Please try again in a few minutes.');
        }
        // Check for timeout errors
        else if (result.message && result.message.includes('timed out')) {
          setError('Code execution timed out. Please try with a simpler program.');
        }
        // Check for rate limiting errors
        else if (result.message && result.message.includes('quota exceeded')) {
          setError('The code execution service has reached its usage limit. Please try again later.');
        }
        // Check for service unavailability
        else if (result.message && result.message.includes('temporarily unavailable')) {
          setError('The code execution service is temporarily unavailable. Please try again in a few minutes.');
        }
        // Check if this is a specific JDoodle error
        else if (result.message && result.message.includes('JDoodle')) {
          setError(`Code execution service error: ${result.message}`);
        } else {
          setError(result.message || 'Failed to execute code');
        }
        setOutput('');
      } else if (result.data && result.data.error) {
        setError(result.data.error);
        setOutput('');
      } else {
        setOutput(result.data?.output || '');
        // Ensure we're setting numeric values
        setExecutionTime(typeof result.data?.cpuTime === 'number' ? result.data.cpuTime : parseFloat(result.data?.cpuTime) || null);
        setMemoryUsed(typeof result.data?.memory === 'number' ? result.data.memory : parseFloat(result.data?.memory) || null);
      }
    } catch (err) {
      console.error('Error executing code:', err);
      setError('Failed to execute code. Please check your internet connection and try again.');
      setOutput('');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteButtonClick = () => {
    handleExecuteCode(0);
  };

  const handleSaveCode = () => {
    // Create a Blob with the code content
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-${selectedLanguage}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand('copy');
    }
  };

  const currentLanguage = LANGUAGES.find(lang => lang.id === selectedLanguage);
  const currentExercise = EXERCISES.find(ex => ex.id === selectedExercise);

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Code Lab</h1>
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
              <Zap className="h-3 w-3 mr-1" />
              Powered by JDoodle
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Practice programming with interactive coding exercises
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Exercises */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-full">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Coding Exercises
              </h2>
              
              <div className="space-y-4">
                {EXERCISES.map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedExercise === exercise.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedExercise(exercise.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{exercise.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={
                          exercise.difficulty === 'Beginner' 
                            ? 'border-green-500 text-green-500' 
                            : exercise.difficulty === 'Intermediate' 
                            ? 'border-yellow-500 text-yellow-500' 
                            : 'border-red-500 text-red-500'
                        }
                      >
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {exercise.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {exercise.languages.map((langId) => {
                        const lang = LANGUAGES.find(l => l.id === langId);
                        return (
                          <Badge key={langId} variant="secondary" className="text-xs">
                            {lang?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
                <h3 className="font-medium mb-2">Exercise Details</h3>
                <div className="text-sm prose prose-sm max-w-none">
                  {currentExercise?.content.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) {
                      return <h4 key={i} className="font-semibold mt-3 mb-1">{line.substring(2)}</h4>;
                    } else if (line.startsWith('## ')) {
                      return <h5 key={i} className="font-medium mt-2 mb-1">{line.substring(3)}</h5>;
                    } else {
                      return <p key={i} className="mb-1">{line}</p>;
                    }
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Middle Panel - Code Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="language-select">Language</Label>
                  <Select 
                    value={selectedLanguage} 
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger id="language-select" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name} ({language.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSaveCode}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    onClick={handleExecuteButtonClick} 
                    disabled={isExecuting}
                    className="bg-primary hover:bg-accent"
                  >
                    {isExecuting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>

                </div>
              </div>
              
              <Textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm min-h-[400px] p-4"
                placeholder="Write your code here..."
              />
            </Card>
            
            {/* Output Panel */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Output
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-red-500">Execution Error</p>
                    <p className="text-sm text-red-400">{error}</p>
                    {error.includes('SSL connection issues') && (
                      <div className="mt-2 text-sm">
                        <p className="text-yellow-500 font-medium">Temporary Service Issue</p>
                        <p className="text-yellow-400">
                          This is a known issue with our code execution service. Our team is working to resolve it. 
                          Please try again in a few minutes or contact support if the problem persists.
                        </p>
                        <Button 
                          onClick={handleExecuteButtonClick} 
                          disabled={isExecuting}
                          className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                          size="sm"
                        >
                          {isExecuting ? 'Retrying...' : 'Retry Now'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {executionTime !== null && memoryUsed !== null && (
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>Execution Time: {typeof executionTime === 'number' ? executionTime.toFixed(3) : 'N/A'}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💾</span>
                    <span>Memory: {typeof memoryUsed === 'number' ? memoryUsed : 'N/A'}KB</span>
                  </div>
                </div>
              )}
              
              <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg min-h-[150px] whitespace-pre-wrap">
                {output || (isExecuting ? 'Running code...\n' : 'Run your code to see the output here.')}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}