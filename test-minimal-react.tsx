import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('🔧 Minimal React test loading...');

function TestComponent() {
  console.log('🔧 Test component rendering...');
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#ff69b4' }}>Aarambh LMS - Test</h1>
      <p>React is working correctly!</p>
    </div>
  );
}

// Add a simple test element to verify React is working
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element found');
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <TestComponent />
      </React.StrictMode>,
    );
    console.log('✅ React app rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
    // Show a simple error message in the UI
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1 style="color: #ff69b4;">Aarambh LMS</h1>
        <p style="color: red;">Error loading application. Please check the console for details.</p>
        <p style="color: #666;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `;
  }
} else {
  console.error('❌ Root element not found');
  // Create a simple error message
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1 style="color: #ff69b4;">Aarambh LMS</h1>
      <p style="color: red;">Error: Root element not found in DOM</p>
    </div>
  `;
}