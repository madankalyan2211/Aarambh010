# How to Clear AI Quote Cache

If you want to see a new AI-generated quote immediately, you have several options:

## Option 1: Clear Browser Cache (Easiest)

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the "Application" or "Storage" tab
3. Find "Session Storage" in the left sidebar
4. Click on your domain (http://localhost:3000)
5. Find and delete the keys:
   - `motivational_quote_student`
   - `motivational_quote_teacher`
6. Refresh the page

## Option 2: Use Browser Console

1. Open Developer Tools (F12)
2. Go to "Console" tab
3. Type and run:
   ```javascript
   sessionStorage.clear()
   ```
4. Refresh the page

## Option 3: Incognito/Private Window

1. Open a new Incognito/Private browsing window
2. Navigate to http://localhost:3000
3. Login - you'll get a fresh quote!

## Option 4: Wait 1 Hour

The cache automatically expires after 1 hour, and a new quote will be generated.

## Checking What's in Cache

To see what quote is currently cached:

```javascript
// In browser console
const cached = sessionStorage.getItem('motivational_quote_student');
if (cached) {
  const data = JSON.parse(cached);
  console.log('Cached Quote:', data.quote);
  console.log('Cached At:', new Date(data.timestamp));
} else {
  console.log('No cached quote');
}
```

## Debugging the AI Service

Check the browser console for these messages:

- 🤖 AI Quote: Starting generation...
- 🔑 AI Service: API Key exists? true
- 📤 AI Service: Sending request to Hugging Face...
- 📥 AI Service: Response status: 200
- ✅ AI Service: Using AI-generated quote

If you see errors, the API key might not be loaded correctly.
