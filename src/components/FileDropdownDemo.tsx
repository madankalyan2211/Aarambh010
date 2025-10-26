"use client";

import * as React from "react";
import { FileDropdown } from "./ui/file-dropdown";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FileText, Upload, X } from "lucide-react";
import { motion } from "motion/react";

export function FileDropdownDemo() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate file upload with progress
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileId = `${file.name}-${file.size}`;
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }
    }
    
    // Reset after upload
    setTimeout(() => {
      setSelectedFiles([]);
      setUploadProgress({});
      setIsUploading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>File Dropdown Component</CardTitle>
          <CardDescription>
            A dropdown component that allows users to select files from their local device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <FileDropdown 
              onFileSelect={handleFileSelect}
              multiple
              accept="*/*"
            />
            
            <FileDropdown 
              onFileSelect={handleFileSelect}
              multiple
              accept="image/*"
            >
              <Button variant="secondary">
                <Upload className="mr-2 h-4 w-4" />
                Upload Images
              </Button>
            </FileDropdown>
            
            <FileDropdown 
              onFileSelect={handleFileSelect}
              accept=".pdf,application/pdf"
            >
              <Button variant="outline">
                Select PDF
              </Button>
            </FileDropdown>
          </div>
          
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h3>
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                  size="sm"
                >
                  {isUploading ? "Uploading..." : "Upload All"}
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                {selectedFiles.map((file, index) => {
                  const fileId = `${file.name}-${file.size}`;
                  const progress = uploadProgress[fileId] || 0;
                  const isUploaded = progress === 100;
                  
                  return (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isUploading && progress > 0 && progress < 100 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                        ) : isUploaded ? (
                          <span className="text-xs text-green-500">Uploaded</span>
                        ) : null}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Implementation</CardTitle>
          <CardDescription>
            How to use the FileDropdown component in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            {`import { FileDropdown } from "@/components/ui/file-dropdown";

function MyComponent() {
  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      // Process selected files
      console.log("Selected files:", Array.from(files));
    }
  };

  return (
    <FileDropdown 
      onFileSelect={handleFileSelect}
      accept="image/*"  // Optional: restrict file types
      multiple         // Optional: allow multiple files
    />
  );
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}