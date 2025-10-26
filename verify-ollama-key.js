const dotenv = require('dotenv');
dotenv.config();

async function verifyOllamaApiKey() {
  console.log('Verifying Ollama API Key...');
  
  const apiKey = process.env.OLLAMA_API_KEY;
  const apiUrl = process.env.OLLAMA_API_URL || 'https://ollama.com';
  
  if (!apiKey || apiKey === 'your-ollama-api-key-here') {
    console.log('❌ No valid API key found in environment variables');
    console.log('Please set a valid OLLAMA_API_KEY in your .env file');
    return;
  }
  
  try {
    console.log(`Testing API key with endpoint: ${apiUrl}/api/tags`);
    
    const response = await fetch(`${apiUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ API key is valid!');
      console.log('You can now use Ollama cloud services.');
      
      // Try to get model information
      const data = await response.json();
      if (data.models && data.models.length > 0) {
        console.log(`Available models: ${data.models.length}`);
        data.models.slice(0, 3).forEach(model => {
          console.log(`  - ${model.name}`);
        });
      }
    } else if (response.status === 401) {
      console.log('❌ API key is invalid or expired (401 Unauthorized)');
      console.log('Please check your API key at https://ollama.com/settings/keys');
    } else {
      console.log(`❌ API request failed with status ${response.status}`);
      console.log(await response.text());
    }
  } catch (error) {
    console.error('❌ Error verifying API key:', error.message);
  }
}

verifyOllamaApiKey();