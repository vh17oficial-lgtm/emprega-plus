import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Renders a resume DOM element to PDF and triggers download.
 * @param {HTMLElement} element - The DOM node containing the rendered resume
 * @param {string} fileName - Output file name (without .pdf)
 */
export async function downloadResumePDF(element, fileName = 'Curriculo') {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  const imgW = canvas.width;
  const imgH = canvas.height;
  const ratio = pdfW / imgW;
  const scaledH = imgH * ratio;

  if (scaledH <= pdfH + 1) {
    // Snap to full A4 page height to avoid rounding gaps
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
  } else {
    // Multi-page: slice the canvas
    let yOffset = 0;
    const pageHeightPx = pdfH / ratio;

    while (yOffset < imgH) {
      const sliceH = Math.min(pageHeightPx, imgH - yOffset);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgW;
      pageCanvas.height = sliceH;
      const ctx = pageCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, yOffset, imgW, sliceH, 0, 0, imgW, sliceH);
      const pageImg = pageCanvas.toDataURL('image/png');
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(pageImg, 'PNG', 0, 0, pdfW, sliceH * ratio);
      yOffset += sliceH;
    }
  }

  const safeName = fileName
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_ -]/g, '_')
    .replace(/_+/g, '_')
    .trim() || 'Curriculo';

  pdf.save(`${safeName}.pdf`);
}
