import React, { useState } from 'react';

const TestLessonForm = () => {
  const [type, setType] = useState<'text' | 'video' | 'pdf'>('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a video file');
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('File size exceeds 100MB limit');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setVideoUrl('http://localhost:31002/uploads/sample-video.mp4');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Lesson Form</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Lesson Type</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as any)}
          style={{ padding: '8px', width: '100%' }}
        >
          <option value="text">Text</option>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      
      {type === 'video' && (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <label>Upload Video File</label>
            <span style={{ fontSize: '12px', color: '#666' }}>Max 100MB</span>
          </div>
          
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Select a video file from your computer to upload directly to the lesson.
          </p>
        
          {uploadError && (
            <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{uploadError}</div>
          )}
        
          {isUploading ? (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '4px', height: '8px' }}>
                <div 
                  style={{ 
                    backgroundColor: '#007bff', 
                    height: '8px', 
                    borderRadius: '4px', 
                    width: `${uploadProgress}%`,
                    transition: 'width 0.3s'
                  }}
                ></div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '14px' }}>{uploadProgress}% uploaded</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ display: 'none' }}
                id="video-upload"
                disabled={isUploading}
              />
              <label 
                htmlFor="video-upload" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  fontWeight: 'medium',
                  textAlign: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Select Video from Computer
              </label>
              <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                {videoUrl ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Video uploaded successfully</span>
                ) : (
                  'No file chosen'
                )}
              </p>
            </div>
          )}
        
          {videoUrl && !isUploading && (
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Uploaded Video</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <span style={{ fontSize: '12px' }}>{videoUrl.split('/').pop()}</span>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
            <p style={{ fontWeight: 'bold' }}>Note:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
              <li style={{ marginBottom: '3px' }}>Supported formats: MP4, MOV, AVI, WMV, FLV</li>
              <li style={{ marginBottom: '3px' }}>Maximum file size: 100MB</li>
              <li>Save the lesson after uploading to make it available to students</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestLessonForm;