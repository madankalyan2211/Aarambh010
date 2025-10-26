// Token test utility
export const testAuthToken = () => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  console.log('Token Test:');
  console.log('- Auth Token Present:', !!token);
  console.log('- Token Length:', token ? token.length : 'N/A');
  console.log('- User Data Present:', !!userData);
  
  if (userData) {
    try {
      const parsedUserData = JSON.parse(userData);
      console.log('- User Data:', parsedUserData);
    } catch (e) {
      console.log('- User Data Parse Error:', e);
    }
  }
  
  return token;
};

// Run the test
testAuthToken();