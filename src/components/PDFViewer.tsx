import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { FileText, Download, Bot, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from './ui/toast';

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
  onGradeSubmit: (score: number, feedback: string) => void;
  onAIAssist: () => void;
  totalPoints: number;
  initialScore?: number | null;
  initialFeedback?: string;
  aiGrading: boolean;
  aiFeedback?: any;
}

export function PDFViewer({
  fileUrl,
  fileName,
  isOpen,
  onClose,
  onGradeSubmit,
  onAIAssist,
  totalPoints,
  initialScore,
  initialFeedback,
  aiGrading,
  aiFeedback
}: PDFViewerProps) {
  const { showToast } = useToast();
  const [score, setScore] = useState(initialScore || 0);
  const [feedback, setFeedback] = useState(initialFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  // Construct the full URL for the PDF with proper backend URL
  const fullPdfUrl = fileUrl ? 
    (fileUrl.startsWith('http') ? fileUrl : `http://localhost:31001${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`) : 
    '';

  useEffect(() => {
    // Reset loading state when fileUrl changes
    if (fileUrl) {
      setLoading(true);
      setError(null);
      setFileType(null);
      
      // Check file type before attempting to load
      checkFileType();
    }
  }, [fileUrl]);

  const checkFileType = async () => {
    if (!fullPdfUrl) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(fullPdfUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      setFileType(contentType);
      setLoading(false);
      
      // If it's not a PDF, show appropriate message
      if (contentType && !contentType.includes('application/pdf')) {
        setError(`File is not a PDF document. Detected type: ${contentType}`);
      }
    } catch (err) {
      console.warn('Could not determine file type:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (score < 0 || score > totalPoints) {
      showToast('error', 'Invalid Score', `Score must be between 0 and ${totalPoints}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onGradeSubmit(score, feedback);
      onClose();
    } catch (error) {
      console.error('Error submitting grade:', error);
      showToast('error', 'Error', 'Failed to submit grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!fullPdfUrl) {
      showToast('error', 'Error', 'No file URL provided');
      return;
    }
    
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = fullPdfUrl;
    link.download = fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {fileName}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Document Info Section */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Information
              </h3>
              <Card className="p-6">
                <div className="flex flex-col items-center justify-center h-[300px]">
                  {loading && (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Checking document...</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                      <p className="text-red-500 mb-2 font-semibold">Document Issue</p>
                      <p className="text-sm text-muted-foreground mb-4">{error}</p>
                      <Button size="sm" variant="outline" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  )}
                  
                  {!loading && !error && (
                    <div className="flex flex-col items-center justify-center text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h4 className="font-semibold mb-2">{fileName}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {fileType && fileType.includes('application/pdf') 
                          ? 'PDF Document' 
                          : 'Document File'}
                      </p>
                      <Button size="sm" variant="outline" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Grading Panel */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Grade Assignment</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Score Input */}
                <div className="space-y-2">
                  <Label htmlFor="score">Score (0-{totalPoints} points)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max={totalPoints}
                    value={score}
                    onChange={(e) => setScore(Math.min(totalPoints, Math.max(0, Number(e.target.value))))}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0 points</span>
                    <span>{totalPoints} points</span>
                  </div>
                </div>

                {/* Feedback Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide detailed feedback on the submission..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>

              {/* AI Assistance */}
              <div className="mt-6 space-y-2">
                <Button
                  onClick={onAIAssist}
                  disabled={aiGrading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {aiGrading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Get AI Assistance
                    </>
                  )}
                </Button>

                {aiFeedback && (
                  <Card className="p-3 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-semibold text-sm mb-1">AI Suggested Score: {aiFeedback.score}</h4>
                    <p className="text-xs">{aiFeedback.feedback}</p>
                    {aiFeedback.suggestions && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Suggestions:</p>
                        <ul className="text-xs list-disc pl-4 space-y-1">
                          {aiFeedback.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Grade'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}