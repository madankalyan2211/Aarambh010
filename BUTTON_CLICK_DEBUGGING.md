# Button Click Debugging Guide

## Issue
The "Export Report" button is not working when clicked in the UI. The HTML shows the button exists but doesn't have an onClick handler attached.

## Current Implementation
The button in GradesPage.tsx is implemented as:
```jsx
<Button 
  variant="outline" 
  className="gap-2" 
  onClick={(e) => {
    console.log('GradesPage: Export PDF button clicked, event:', e);
    handleExportPDF();
  }}
  disabled={exporting || !gradeData}
>
  {exporting ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Download className="h-4 w-4" />
  )}
  Export PDF
</Button>
```

## Debugging Steps

### 1. Check Browser Console
Open the browser's developer tools and check the Console tab:
- Click the Export button
- Look for these messages:
  - "GradesPage: Export PDF button clicked, event:"
  - "GradesPage: Export PDF button handler called"

### 2. Verify Button Exists in DOM
In the browser console, run:
```javascript
// Check if button exists
const button = document.querySelector('button.gap-2');
console.log('Button found:', button);

// Check button properties
if (button) {
  console.log('Button disabled:', button.disabled);
  console.log('Button onclick:', button.onclick);
  console.log('Button event listeners:', getEventListeners ? getEventListeners(button) : 'Not available in this browser');
}
```

### 3. Test Direct DOM Manipulation
Try clicking the button programmatically:
```javascript
const button = document.querySelector('button.gap-2');
if (button) {
  console.log('Triggering button click');
  button.click();
}
```

### 4. Add Direct Event Listener
We've added a direct DOM event listener in the component:
```javascript
useEffect(() => {
  const handleButtonClick = () => {
    console.log('GradesPage: Button clicked via direct DOM listener');
    handleExportPDF();
  };
  
  // Add event listener to the button
  const button = document.querySelector('button.gap-2');
  if (button) {
    console.log('GradesPage: Adding direct DOM event listener to button');
    button.addEventListener('click', handleButtonClick);
  }
  
  // Cleanup
  return () => {
    if (button) {
      button.removeEventListener('click', handleButtonClick);
    }
  };
}, [gradeData, exporting]);
```

## Possible Issues

### 1. Button Disabled
The button is disabled if `exporting` is true or `gradeData` is null/undefined:
```jsx
disabled={exporting || !gradeData}
```

Check in console:
```javascript
const button = document.querySelector('button.gap-2');
console.log('Button disabled:', button?.disabled);
```

### 2. React Event Not Binding
The onClick handler might not be properly bound due to:
- Component not rendering correctly
- React reconciliation issues
- CSS overlay blocking clicks

### 3. CSS Issues
Check if there's another element overlaying the button:
```javascript
// Get element at button position
const button = document.querySelector('button.gap-2');
if (button) {
  const rect = button.getBoundingClientRect();
  const element = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
  console.log('Element at button position:', element);
}
```

## Testing the Fix

### 1. Manual Function Call
Test the export function directly:
```javascript
// If you can access the React component methods
// This depends on how the app is structured
```

### 2. Test with Simple PDF Service
We're now using the simple PDF service for debugging:
```javascript
await simpleDownloadPDF(gradeData, studentName, 'my-grades-report.pdf');
```

## Verification Steps

1. Open browser console
2. Click the Export button
3. Check for log messages
4. If no messages, try programmatic click
5. Check if button is disabled
6. Verify gradeData is available

## Emergency Workaround

If the button still doesn't work, you can manually trigger the export in the console:
```javascript
// Get grade data from localStorage or make API call
// Then call the simple PDF service directly
import('/src/services/simple-pdf.service.ts').then(module => {
  // Mock data if needed
  const mockData = {
    grades: [{ assignment: 'Test', percentage: 85, letterGrade: 'B' }],
    statistics: { overallPercentage: 85, overallLetterGrade: 'B' }
  };
  
  module.simpleDownloadPDF(mockData, 'Test Student', 'emergency-report.pdf')
    .then(() => console.log('PDF downloaded!'))
    .catch(err => console.error('Error:', err));
});
```

This should help identify why the button click is not working.