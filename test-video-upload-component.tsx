import React, { useState } from 'react';

const TestVideoUpload = () => {
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
          setVideoUrl('http://localhost:31002/uploads/' + file.name);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Test Video Upload Component</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Video URL</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube or Vimeo URL"
            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: 'none' }}
            id="test-video-upload"
            disabled={isUploading}
          />
          <label 
            htmlFor="test-video-upload" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload
          </label>
        </div>
        {uploadError && (
          <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>{uploadError}</p>
        )}
        {videoUrl && !isUploading && (
          <p style={{ color: '#28a745', fontSize: '14px', marginTop: '5px' }}>✓ Video uploaded successfully</p>
        )}
        {isUploading && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ width: '100%', backgroundColor: '#e9ecef', borderRadius: '4px', height: '8px' }}>
              <div 
                style={{ 
                  backgroundColor: '#007bff', 
                  height: '100%', 
                  borderRadius: '4px', 
                  width: `${uploadProgress}%`,
                  transition: 'width 0.3s'
                }}
              ></div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {uploadProgress}%
            </div>
          </div>
        )}
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <label>Upload Video File</label>
          <span style={{ fontSize: '12px', color: '#666' }}>Max 100MB</span>
        </div>
        
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Or select a video file from your computer to upload directly.
        </p>
      
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: 'none' }}
            id="test-video-upload-alt"
            disabled={isUploading}
          />
          <label 
            htmlFor="test-video-upload-alt" 
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
              fontWeight: '500',
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
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Video uploaded: {videoUrl.split('/').pop()}</span>
            ) : (
              'No file chosen'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestVideoUpload;