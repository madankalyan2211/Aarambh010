// Simplified PDF service for debugging
import { jsPDF } from 'jspdf';

interface Grade {
  assignment: string;
  percentage: number;
  letterGrade: string;
}

interface GradeData {
  grades: Grade[];
  statistics: {
    overallPercentage: number;
    overallLetterGrade: string;
  };
}

/**
 * Simple PDF generation function for debugging
 */
export const simpleGeneratePDF = async (
  gradeData: GradeData,
  studentName?: string
): Promise<Blob> => {
  console.log('Simple PDF: Starting generation');
  
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add simple content
    doc.setFont('helvetica');
    doc.setFontSize(22);
    doc.setTextColor(255, 105, 180); // Pink color
    doc.text('Grade Report', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Student: ${studentName || 'N/A'}`, 20, 30);
    
    // Add overall grade
    doc.setFontSize(14);
    doc.text(`Overall Grade: ${gradeData.statistics.overallPercentage}% (${gradeData.statistics.overallLetterGrade})`, 20, 40);
    
    // Add a simple message
    doc.setFontSize(12);
    doc.text('This is a test PDF generated for debugging purposes.', 20, 50);
    
    // Return the PDF as a Blob
    const pdfBlob = doc.output('blob');
    console.log('Simple PDF: Generated successfully');
    return pdfBlob;
  } catch (error) {
    console.error('Simple PDF: Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * Simple download function for debugging
 */
export const simpleDownloadPDF = async (
  gradeData: GradeData,
  studentName?: string,
  filename: string = 'grade-report.pdf'
): Promise<void> => {
  try {
    console.log('Simple PDF: Starting download process');
    
    // Generate the PDF
    const pdfBlob = await simpleGeneratePDF(gradeData, studentName);
    console.log('Simple PDF: PDF blob created');
    
    // Create download URL
    const url = URL.createObjectURL(pdfBlob);
    console.log('Simple PDF: Object URL created');
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
    console.log('Simple PDF: Download completed');
  } catch (error) {
    console.error('Simple PDF: Error in download process:', error);
    throw new Error('Failed to download PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
};