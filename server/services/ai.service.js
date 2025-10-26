const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

// Initialize Ollama client with online API
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://ollama.com';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gpt-oss:120b-cloud';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text content
 */
async function extractPDFText(filePath) {
  try {
    console.log('📄 Extracting text from PDF:', filePath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`PDF file not found: ${filePath}`);
    }
    
    // Read PDF file
    const dataBuffer = await fs.readFile(filePath);
    
    // Parse PDF
    const data = await pdfParse(dataBuffer);
    
    console.log(`✅ Extracted ${data.text.length} characters from PDF`);
    return data.text;
  } catch (error) {
    console.error('❌ Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Generate AI summary for video content using Ollama
 * @param {string} title - Video title
 * @param {string} content - Video content/description
 * @returns {Promise<string>} Generated summary
 */
async function generateVideoSummary(title, content) {
  try {
    console.log('🤖 Generating video summary with Ollama');
    console.log('  Ollama Host:', OLLAMA_HOST);
    console.log('  Model:', OLLAMA_MODEL);
    console.log('  Video title:', title);
    console.log('  Content length:', content.length, 'characters');
    
    // Create summary prompt
    const prompt = `
    You are an expert educator creating concise summaries of educational video content.
    
    Video Title: ${title}
    
    Video Content/Description:
    ${content}
    
    Please provide a clear, concise summary (2-3 paragraphs) that includes:
    1. The main topic or concept covered
    2. Key points or learning objectives
    3. Important details or examples mentioned
    4. Practical applications if relevant
    
    Keep the summary educational and informative, suitable for students reviewing the material.
    Do not include any markdown formatting or special characters.
    `;

    console.log('📤 Sending request to Ollama API');
    
    // Generate content using Ollama API directly with fetch
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add API key if provided (Ollama Cloud requires Bearer token)
    if (OLLAMA_API_KEY) {
      headers['Authorization'] = `Bearer ${OLLAMA_API_KEY}`;
    }
    
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API request failed with status ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    const summary = data.response;
    
    console.log('📥 Received response from Ollama API');
    console.log('✅ AI summary generated successfully');
    
    return summary.trim();
  } catch (error) {
    console.error('❌ Error generating video summary with Ollama:', error);
    
    // Fallback response if API fails
    return "Unable to generate summary at this time. Please try again later.";
  }
}

/**
 * Grade assignment content using Ollama
 * @param {string} content - Assignment content to grade
 * @param {object} assignment - Assignment details
 * @returns {Promise<object>} Grading result with score and feedback
 */
async function gradeAssignmentWithAI(content, assignment) {
  try {
    console.log('🤖 Grading assignment with Ollama');
    console.log('  Ollama Host:', OLLAMA_HOST);
    console.log('  Model:', OLLAMA_MODEL);
    console.log('  Content length:', content.length, 'characters');
    console.log('  Assignment:', assignment.title);
    
    // Create grading prompt
    const prompt = `
    You are an expert educator grading a student assignment.
    
    Assignment Title: ${assignment.title}
    Assignment Description: ${assignment.description}
    Total Points: ${assignment.totalPoints}
    Passing Score: ${assignment.passingScore}
    
    Student Submission:
    ${content}
    
    Please provide:
    1. A numerical score out of ${assignment.totalPoints} points
    2. Detailed feedback explaining the score
    3. 3 specific suggestions for improvement
    
    Format your response as JSON:
    {
      "score": number,
      "feedback": string,
      "suggestions": string[]
    }
    
    Ensure the score is realistic and based on the content quality.
    Only return the JSON object, nothing else.
    `;

    console.log('📤 Sending request to Ollama API');
    
    // Generate content using Ollama API directly with fetch
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add API key if provided
    if (OLLAMA_API_KEY) {
      headers['Authorization'] = `Bearer ${OLLAMA_API_KEY}`;
    }
    
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API request failed with status ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    const text = data.response;
    console.log('📥 Received response from Ollama API');
    
    // Extract JSON from response
    let gradingResult;
    try {
      // Try to parse as JSON directly
      gradingResult = JSON.parse(text);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from the response
      // Look for JSON object in the response
      const jsonMatch = text.match(/\{[^]*\}/);
      if (jsonMatch) {
        try {
          gradingResult = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          throw new Error('Could not extract valid JSON from AI response');
        }
      } else {
        throw new Error('Could not extract JSON from AI response');
      }
    }
    
    // Validate the result
    if (!gradingResult || typeof gradingResult.score !== 'number' || !gradingResult.feedback) {
      throw new Error('Invalid grading result format from AI');
    }
    
    // Ensure score is within valid range
    gradingResult.score = Math.max(0, Math.min(assignment.totalPoints, Math.round(gradingResult.score)));
    
    console.log('✅ AI grading completed successfully');
    return gradingResult;
  } catch (error) {
    console.error('❌ Error grading assignment with Ollama:', error);
    throw new Error(`AI grading failed: ${error.message}`);
  }
}

/**
 * Process PDF submission and grade it
 * @param {object} submission - Submission object with PDF attachments
 * @param {object} assignment - Assignment details
 * @returns {Promise<object>} Grading result
 */
async function processAndGradePDFSubmission(submission, assignment) {
  try {
    console.log('📄 Processing PDF submission for grading');
    console.log('  Submission ID:', submission._id);
    console.log('  Attachments:', submission.attachments.length);
    
    // Check if there are PDF attachments
    const pdfAttachments = submission.attachments.filter(att => 
      att.type === 'application/pdf' || att.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfAttachments.length === 0) {
      throw new Error('No PDF attachments found in submission');
    }
    
    // For now, process only the first PDF attachment
    const pdfAttachment = pdfAttachments[0];
    
    // Fix the file path - the URL starts with /uploads/, so we need to construct the correct path
    // The URL is like "/uploads/filename.pdf", we need to join it with the server root
    const serverRoot = path.join(__dirname, '..');
    const filePath = path.join(serverRoot, pdfAttachment.url);
    
    console.log('  Processing PDF:', pdfAttachment.name);
    console.log('  File path:', filePath);
    
    // Extract text from PDF
    const pdfContent = await extractPDFText(filePath);
    
    // If PDF is empty, use a placeholder
    const contentToGrade = pdfContent.trim() || `[Note: PDF file "${pdfAttachment.name}" appears to be empty or contains no extractable text]`;
    
    // Grade the content
    const gradingResult = await gradeAssignmentWithAI(contentToGrade, assignment);
    
    return {
      ...gradingResult,
      pdfProcessed: true,
      pdfName: pdfAttachment.name,
      contentLength: pdfContent.length
    };
  } catch (error) {
    console.error('❌ Error processing PDF submission:', error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

module.exports = {
  extractPDFText,
  generateVideoSummary,
  gradeAssignmentWithAI,
  processAndGradePDFSubmission
};