import { jsPDF } from 'jspdf';
import { generateStudentQuote } from './ai.service';

// Function to convert SVG to data URL
const svgToDataURL = (svg: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('PDF Service: Starting SVG to Data URL conversion');
      const img = new Image();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      console.log('PDF Service: Blob URL created:', url.substring(0, 50) + '...');
      
      img.onload = () => {
        try {
          console.log('PDF Service: Image loaded successfully');
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          console.log('PDF Service: Canvas created with dimensions:', canvas.width, 'x', canvas.height);
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            console.log('PDF Service: Canvas to Data URL conversion successful');
            resolve(dataURL);
          } else {
            console.warn('PDF Service: Failed to get canvas context');
            resolve('');
          }
          URL.revokeObjectURL(url);
        } catch (canvasError) {
          console.error('PDF Service: Error drawing image on canvas:', canvasError);
          URL.revokeObjectURL(url);
          resolve('');
        }
      };
      
      img.onerror = (error) => {
        console.error('PDF Service: Failed to load logo image:', error);
        URL.revokeObjectURL(url);
        resolve(''); // Resolve with empty string if image fails to load
      };
      
      img.src = url;
    } catch (error) {
      console.error('PDF Service: Error in svgToDataURL:', error);
      reject(error);
    }
  });
};

// App logo as SVG string
const appLogoSVG = `
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="32" fill="url(#blueGradient)"/>
  <path d="M32 12L48 50H42L38.5 41H25.5L22 50H16L32 12ZM32 21L27 35H37L32 21Z" fill="white"/>
  <defs>
    <linearGradient id="blueGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>
`;

interface Grade {
  id: string;
  assignment: string;
  course: {
    id: string;
    name: string;
    category: string;
  };
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
  letterGrade: string;
  feedback: string;
  gradedAt: string;
  assignmentId: string;
}

interface GradeStatistics {
  totalAssignments: number;
  totalPoints: number;
  maxPoints: number;
  overallPercentage: number;
  overallLetterGrade: string;
  gradeDistribution: {
    'A+': number;
    'A': number;
    'A-': number;
    'B+': number;
    'B': number;
    'B-': number;
    'C+': number;
    'C': number;
    'C-': number;
    'D': number;
    'F': number;
  };
}

interface GradeData {
  grades: Grade[];
  statistics: GradeStatistics;
}

/**
 * Generate a detailed PDF report with grades information, app logo, and AI-generated insights
 * @param gradeData - The grade data to include in the report
 * @param studentName - The name of the student (optional)
 * @returns Promise<Blob> - The generated PDF as a Blob
 */
export const generateGradeReportPDF = async (
  gradeData: GradeData,
  studentName?: string
): Promise<Blob> => {
  try {
    console.log('PDF Service: Starting PDF generation');
    console.log('PDF Service: Grade data received:', gradeData);
    
    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    console.log('PDF Service: jsPDF instance created');

    // Set font styles
    doc.setFont('helvetica');
    
    // Add app logo
    try {
      console.log('PDF Service: Adding logo to PDF');
      const logoDataURL = await svgToDataURL(appLogoSVG);
      console.log('PDF Service: Logo data URL obtained:', logoDataURL ? 'Success' : 'Empty/Failed');
      if (logoDataURL) {
        doc.addImage(logoDataURL, 'PNG', 15, 15, 20, 20);
        console.log('PDF Service: Logo added to PDF');
      } else {
        console.warn('PDF Service: Logo data URL is empty');
      }
    } catch (error) {
      console.error('PDF Service: Failed to add logo to PDF:', error);
    }

    // Add title
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Blue color (#3B82F6)
    doc.text('Aarambh Learning Platform', 40, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Grade Report', 40, 35);
    
    // Add student info
    doc.setFontSize(12);
    doc.setTextColor(64, 64, 64);
    doc.text(`Student: ${studentName || 'N/A'}`, 15, 50);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 15, 57);
    
    // Add overall grade
    const overallPercentage = gradeData.statistics.overallPercentage;
    const overallLetterGrade = gradeData.statistics.overallLetterGrade;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 65, 180, 25, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Overall Grade:', 20, 75);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${overallPercentage.toFixed(1)}% (${overallLetterGrade})`, 20, 85);
    
    doc.setFont('helvetica', 'normal');
    
    // Add grade distribution table header
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Grade Distribution:', 15, 105);
    
    // Draw table header
    doc.setFillColor(230, 230, 230);
    doc.rect(15, 110, 180, 10, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Assignment', 17, 117);
    doc.text('Score', 85, 117);
    doc.text('Weight', 120, 117);
    doc.text('Grade', 155, 117);
    
    // Add grade data
    let yPos = 125;
    gradeData.grades.forEach((grade, index) => {
      if (yPos > 270) { // If we're near the bottom of the page, add a new page
        doc.addPage();
        yPos = 20;
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(15, yPos - 5, 180, 10, 'F');
      }
      
      doc.setFontSize(9);
      doc.text(grade.assignment.length > 25 ? grade.assignment.substring(0, 25) + '...' : grade.assignment, 17, yPos);
      doc.text(`${grade.percentage}%`, 85, yPos);
      doc.text(`${grade.weight}`, 120, yPos);
      doc.text(grade.letterGrade, 155, yPos);
      
      yPos += 10;
    });
    
    // Add AI-generated insights section
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 10;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('AI-Powered Insights:', 15, yPos);
    
    yPos += 10;
    
    try {
      console.log('PDF Service: Generating AI insights');
      // Generate AI insights
      const aiQuote = await generateStudentQuote(studentName);
      console.log('PDF Service: AI quote generated:', aiQuote);
      
      doc.setFontSize(11);
      doc.setTextColor(64, 64, 64);
      // Split quote into lines that fit the page width
      const splitText = doc.splitTextToSize(aiQuote, 180);
      doc.text(splitText, 15, yPos);
      
      yPos += splitText.length * 6;
    } catch (error) {
      console.error('PDF Service: Failed to generate AI insights:', error);
      doc.setFontSize(11);
      doc.setTextColor(64, 64, 64);
      doc.text('Keep up the great work!', 15, yPos);
      yPos += 6;
    }
    
    // Add footer
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos = 280; // Position at bottom of page
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Aarambh Learning Platform', 15, yPos);
    doc.text(`Page ${doc.getNumberOfPages()}`, 180, yPos, { align: 'right' });
    
    // Return the PDF as a Blob
    const pdfBlob = doc.output('blob');
    console.log('PDF Service: PDF generated successfully, blob size:', pdfBlob.size);
    return pdfBlob;
  } catch (error) {
    console.error('PDF Service: Error generating PDF:', error);
    throw new Error('Failed to generate PDF report: ' + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * Download the grade report PDF
 * @param gradeData - The grade data to include in the report
 * @param studentName - The name of the student (optional)
 * @param filename - The filename for the downloaded PDF
 */
export const downloadGradeReportPDF = async (
  gradeData: GradeData,
  studentName?: string,
  filename: string = 'grade-report.pdf'
): Promise<void> => {
  try {
    console.log('PDF Service: Starting PDF download process');
    console.log('PDF Service: Grade data:', gradeData);
    console.log('PDF Service: Student name:', studentName);
    console.log('PDF Service: Filename:', filename);
    
    const pdfBlob = await generateGradeReportPDF(gradeData, studentName);
    console.log('PDF Service: PDF blob created, creating download link');
    
    const url = URL.createObjectURL(pdfBlob);
    console.log('PDF Service: Object URL created:', url.substring(0, 50) + '...');
    
    // Create a temporary link to download the PDF
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    console.log('PDF Service: Download link created with href and download attributes');
    
    document.body.appendChild(a);
    console.log('PDF Service: Link appended to document body');
    
    // Trigger the download
    console.log('PDF Service: Triggering download');
    a.click();
    console.log('PDF Service: Download triggered');
    
    // Clean up
    document.body.removeChild(a);
    console.log('PDF Service: Link removed from document body');
    
    URL.revokeObjectURL(url);
    console.log('PDF Service: Object URL revoked');
    
    console.log('PDF Service: Download process completed');
  } catch (error) {
    console.error('PDF Service: Error generating or downloading PDF:', error);
    throw new Error('Failed to generate PDF report: ' + (error instanceof Error ? error.message : String(error)));
  }
};