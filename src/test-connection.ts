// Simple test to verify connection between frontend and backend
import { sendOTP } from './services/api.service';

// Test function to verify API connection
export const testApiConnection = async () => {
  console.log('Testing API connection...');
  
  try {
    // Test sending OTP (doesn't require authentication)
    const response = await sendOTP('test@example.com', 'Test User');
    console.log('API Response:', response);
    
    if (response.success) {
      console.log('✅ Connection successful!');
      return true;
    } else {
      console.log('❌ API returned error:', response.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
};

// Run the test if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  testApiConnection();
}