/**
 * AI Service for generating personalized content
 * Uses Hugging Face's free inference API for text generation
 */

// @ts-ignore - Vite env types
const getEnv = (key: string, defaultValue: string = ''): string => {
  // @ts-ignore
  return import.meta.env[key] || defaultValue;
};

const HF_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const HF_API_KEY = getEnv('VITE_HUGGINGFACE_API_KEY', ''); // Free tier available

interface AIResponse {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Generate a personalized motivational quote for students
 */
export const generateStudentQuote = async (userName?: string): Promise<string> => {
  const fallbackQuotes = [
    "You're on fire! 🔥 Keep up the great work!",
    "Every expert was once a beginner. Keep learning! 📚",
    "Your dedication is inspiring! 💪",
    "Learning today, leading tomorrow! 🌟",
  ];

  console.log('🤖 AI Service: Generating student quote for:', userName || 'Student');
  console.log('🔑 AI Service: API Key exists?', !!HF_API_KEY);

  try {
    const prompt = userName 
      ? `Generate a short, inspiring motivational quote (max 15 words) for a student named ${userName} about learning and growth. Include one relevant emoji. Be encouraging and positive.`
      : `Generate a short, inspiring motivational quote (max 15 words) for a student about learning and growth. Include one relevant emoji. Be encouraging and positive.`;

    console.log('📤 AI Service: Sending request to Hugging Face...');

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.8,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    console.log('📥 AI Service: Response status:', response.status);

    if (!response.ok) {
      console.warn('⚠️ AI Service: API unavailable, using fallback');
      const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      console.log('✅ AI Service: Fallback quote:', fallback);
      return fallback;
    }

    const data = await response.json();
    console.log('📊 AI Service: API response:', data);
    
    let generatedText = '';

    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text.trim();
    } else if (data.generated_text) {
      generatedText = data.generated_text.trim();
    }

    // Clean up the generated text
    generatedText = generatedText
      .split('\n')[0] // Take first line
      .replace(/^["']|["']$/g, '') // Remove quotes
      .trim();

    console.log('✨ AI Service: Cleaned text:', generatedText);

    // Validate the generated text
    if (generatedText && generatedText.length > 10 && generatedText.length < 200) {
      console.log('✅ AI Service: Using AI-generated quote');
      return generatedText;
    }

    // Fallback if generation fails
    console.log('⚠️ AI Service: Generated text invalid, using fallback');
    const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    return fallback;
  } catch (error) {
    console.error('❌ AI Service: Error generating quote:', error);
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
};

/**
 * Generate a personalized motivational quote for teachers
 */
export const generateTeacherQuote = async (userName?: string): Promise<string> => {
  const fallbackQuotes = [
    "Great teachers inspire! 🌟 Your impact is immeasurable.",
    "Teaching is the profession that creates all others. 📚",
    "You're shaping futures, one lesson at a time! 💡",
    "Your dedication makes a difference every day! 🎓",
  ];

  try {
    const prompt = userName
      ? `Generate a short, inspiring motivational quote (max 15 words) for a teacher named ${userName} about teaching and inspiring students. Include one relevant emoji. Be uplifting and appreciative.`
      : `Generate a short, inspiring motivational quote (max 15 words) for a teacher about teaching and inspiring students. Include one relevant emoji. Be uplifting and appreciative.`;

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.8,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      console.warn('AI API unavailable, using fallback');
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }

    const data = await response.json();
    let generatedText = '';

    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text.trim();
    } else if (data.generated_text) {
      generatedText = data.generated_text.trim();
    }

    // Clean up the generated text
    generatedText = generatedText
      .split('\n')[0]
      .replace(/^["']|["']$/g, '')
      .trim();

    // Validate the generated text
    if (generatedText && generatedText.length > 10 && generatedText.length < 200) {
      return generatedText;
    }

    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  } catch (error) {
    console.error('Error generating quote:', error);
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
};

/**
 * Alternative: Use OpenAI API (if available)
 */
export const generateQuoteWithOpenAI = async (role: 'student' | 'teacher', userName?: string): Promise<string> => {
  const OPENAI_API_KEY = getEnv('VITE_OPENAI_API_KEY');
  
  if (!OPENAI_API_KEY) {
    // Fall back to Hugging Face
    return role === 'student' ? generateStudentQuote(userName) : generateTeacherQuote(userName);
  }

  try {
    const prompt = role === 'student'
      ? `Create a short, inspiring motivational quote (under 15 words) for ${userName || 'a student'} about learning and growth. Include one emoji.`
      : `Create a short, inspiring motivational quote (under 15 words) for ${userName || 'a teacher'} about teaching and inspiring others. Include one emoji.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a motivational coach who creates brief, inspiring quotes.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 
      (role === 'student' ? await generateStudentQuote(userName) : await generateTeacherQuote(userName));
  } catch (error) {
    console.error('OpenAI error, falling back:', error);
    return role === 'student' ? generateStudentQuote(userName) : generateTeacherQuote(userName);
  }
};

/**
 * Cache quote for session to avoid multiple API calls
 */
export const getCachedQuote = (role: 'student' | 'teacher'): string | null => {
  const key = `motivational_quote_${role}`;
  const cached = sessionStorage.getItem(key);
  
  if (cached) {
    try {
      const { quote, timestamp } = JSON.parse(cached);
      // Cache expires after 1 hour
      if (Date.now() - timestamp < 3600000) {
        return quote;
      }
    } catch (e) {
      console.error('Error reading cached quote:', e);
    }
  }
  
  return null;
};

/**
 * Save quote to session cache
 */
export const cacheQuote = (role: 'student' | 'teacher', quote: string): void => {
  const key = `motivational_quote_${role}`;
  sessionStorage.setItem(key, JSON.stringify({
    quote,
    timestamp: Date.now(),
  }));
};
