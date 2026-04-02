import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const useExportPDF = () => {
  const exportToPDF = async (elementId: string, filename: string = 'export.pdf') => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width
      const pageHeight = 295; // A4 height
      let heightLeft = canvas.height * (imgWidth / canvas.width);
      let position = 0;

      // Add image to PDF (with pagination if needed)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft2 = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft2 -= pageHeight;

      while (heightLeft2 >= 0) {
        position = heightLeft2 - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft2 -= pageHeight;
      }

      // Save PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  };

  return { exportToPDF };
};
