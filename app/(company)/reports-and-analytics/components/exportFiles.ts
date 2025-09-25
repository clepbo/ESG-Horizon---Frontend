// import * as htmlToImage from 'html-to-image';
import { toPng } from 'html-to-image';
import jsPDF from "jspdf"


export async function generatePDF (id: string, fileName = "esg-report") {
  const element = document.getElementById(id);
  if (!element) return;


  const pdf = new jsPDF("p", "mm", "a5");
  const dataUrl = await toPng(element);
  const pageWidth = pdf.internal.pageSize.getWidth();  // 210
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297
  pdf.addImage(dataUrl, "PNG", 5, 5, pageWidth - 10, pageHeight - 10);
  pdf.save(fileName);
};



export async function exportPNG(id: string, fileName = "esg-report.png") {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 1.5 }); // pixelRatio=2 → sharper image
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("PNG export failed", err);
  }
}
