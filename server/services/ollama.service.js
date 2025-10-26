const { OLLAMA_API_URL, OLLAMA_MODEL, OLLAMA_API_KEY } = require('../config/database');

/**
 * Generate quiz questions using Ollama AI
 * @param {string} courseContent - The course content to generate questions from
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} - Array of generated questions
 */
async function generateQuizQuestions(courseContent, numQuestions = 5) {
  try {
    console.log('🤖 Ollama - Generating quiz questions for course content...');
    
    // Prepare the prompt for Ollama
    const prompt = `
    Based on the following course content, generate ${numQuestions} multiple-choice quiz questions.
    
    Course Content:
    ${courseContent}
    
    For each question, provide:
    1. The question text
    2. Four answer options (A, B, C, D)
    3. The correct answer (A, B, C, or D)
    4. A brief explanation
    
    Format your response as JSON array with the following structure:
    [
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Explanation text here"
      }
    ]
    
    Only return the JSON array, nothing else.
    `;
    
    // Call Ollama API
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if provided
    if (OLLAMA_API_KEY) {
      headers['Authorization'] = `Bearer ${OLLAMA_API_KEY}`;
    } else {
      console.warn('⚠️  No OLLAMA_API_KEY provided - Ollama API requests may fail with 401 Unauthorized');
    }
    
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Ollama API authentication failed (401 Unauthorized)');
        console.error('To use Ollama cloud service, you need to:');
        console.error('1. Create an account at https://ollama.com');
        console.error('2. Generate an API key from your account settings at https://ollama.com/settings/keys');
        console.error('3. Update the OLLAMA_API_KEY in your .env file with your actual API key');
      }
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Try to parse the response as JSON
    try {
      // Extract JSON from the response text
      const jsonStart = data.response.indexOf('[');
      const jsonEnd = data.response.lastIndexOf(']') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = data.response.substring(jsonStart, jsonEnd);
        const questions = JSON.parse(jsonString);
        console.log(`✅ Ollama - Generated ${questions.length} questions`);
        return questions;
      } else {
        throw new Error('Could not extract JSON from Ollama response');
      }
    } catch (parseError) {
      console.error('Error parsing Ollama response:', parseError);
      console.log('Raw response:', data.response);
      // Return fallback questions
      return generateFallbackQuestions(courseContent, numQuestions);
    }
  } catch (error) {
    console.error('Error generating quiz questions with Ollama:', error);
    // Return fallback questions
    return generateFallbackQuestions(courseContent, numQuestions);
  }
}

/**
 * Generate fallback questions when Ollama fails
 * @param {string} courseContent - The course content
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Array} - Array of fallback questions
 */
function generateFallbackQuestions(courseContent, numQuestions) {
  console.log('⚠️ Using fallback question generation');
  
  const fallbackQuestions = [];
  const topics = extractTopicsFromContent(courseContent);
  
  for (let i = 0; i < Math.min(numQuestions, topics.length); i++) {
    const topic = topics[i] || `Course Content ${i + 1}`;
    
    fallbackQuestions.push({
      question: `What is the main focus of "${topic}"?`,
      options: [
        `Understanding ${topic}`,
        `Advanced ${topic}`,
        `Introduction to ${topic}`,
        `History of ${topic}`
      ],
      correctAnswer: 0,
      explanation: `This topic focuses on ${topic}.`
    });
  }
  
  // Fill remaining slots with generic questions
  while (fallbackQuestions.length < numQuestions) {
    fallbackQuestions.push({
      question: `What is the primary learning objective of this course?`,
      options: [
        'Knowledge acquisition',
        'Skill development',
        'Certification',
        'Career advancement'
      ],
      correctAnswer: 0,
      explanation: 'The primary goal of most courses is knowledge acquisition.'
    });
  }
  
  return fallbackQuestions;
}

/**
 * Extract topics from course content
 * @param {string} content - The course content
 * @returns {Array} - Array of extracted topics
 */
function extractTopicsFromContent(content) {
  // Simple topic extraction - in a real implementation, this would be more sophisticated
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const topics = [];
  
  // Extract potential topics from the beginning of sentences
  sentences.forEach(sentence => {
    const words = sentence.trim().split(/\s+/);
    if (words.length > 2) {
      // Take the first 2-3 words as a potential topic
      const topic = words.slice(0, Math.min(3, words.length)).join(' ');
      if (topic.length > 10 && !topics.includes(topic)) {
        topics.push(topic);
      }
    }
  });
  
  return topics.slice(0, 10); // Return up to 10 topics
}

module.exports = {
  generateQuizQuestions
};