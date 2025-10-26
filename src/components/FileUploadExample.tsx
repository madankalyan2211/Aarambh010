"use client";

import * as React from "react";
import { FileDropdown } from "./ui/file-dropdown";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FileText, Upload, X, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export function FileUploadExample() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<Record<string, { progress: number; uploaded: boolean; error?: string }>>({});

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Initialize upload status for new files
      const newStatus: Record<string, { progress: number; uploaded: boolean }> = {};
      newFiles.forEach(file => {
        const fileId = `${file.name}-${file.size}`;
        newStatus[fileId] = { progress: 0, uploaded: false };
      });
      
      setUploadStatus(prev => ({ ...prev, ...newStatus }));
    }
  };

  const removeFile = (index: number) => {
    const file = selectedFiles[index];
    const fileId = `${file.name}-${file.size}`;
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileId];
      return newStatus;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate uploading each file
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileId = `${file.name}-${file.size}`;
      
      try {
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadStatus(prev => ({
            ...prev,
            [fileId]: { progress, uploaded: progress === 100 }
          }));
        }
      } catch (error) {
        setUploadStatus(prev => ({
          ...prev,
          [fileId]: { progress: 0, uploaded: false, error: "Upload failed" }
        }));
      }
    }
    
    setIsUploading(false);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setUploadStatus({});
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Demo</CardTitle>
          <CardDescription>
            Select files using the dropdown menu and upload them to see progress indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <FileDropdown 
              onFileSelect={handleFileSelect}
              multiple
              accept="*/*"
            >
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Select Files
              </Button>
            </FileDropdown>
            
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? "Uploading..." : "Upload All"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearAll}
              disabled={selectedFiles.length === 0}
            >
              Clear All
            </Button>
          </div>
          
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </h3>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
                {selectedFiles.map((file, index) => {
                  const fileId = `${file.name}-${file.size}`;
                  const status = uploadStatus[fileId];
                  const progress = status?.progress || 0;
                  const isUploaded = status?.uploaded || false;
                  const hasError = status?.error;
                  
                  return (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isUploading && progress > 0 && progress < 100 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                          </div>
                        ) : isUploaded ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : hasError ? (
                          <span className="text-xs text-red-500">Failed</span>
                        ) : null}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Click the "Select Files" button to open the dropdown</li>
              <li>Choose an option to browse files from your device</li>
              <li>Select one or more files to upload</li>
              <li>Click "Upload All" to simulate the upload process</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}