// import * as htmlToImage from 'html-to-image';
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function generatePDF(id: string, fileName = "esg-report.pdf") {
  const element = document.getElementById(id);
  if (!element) return;

  const dataUrl = await toPng(element, {
    cacheBust: true,
    filter: (domNode) => !domNode.classList?.contains("no-export"),
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth(); // 210
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297

  pdf.addImage(dataUrl, "PNG", 5, 5, pageWidth - 10, pageHeight - 10);
  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}

export async function exportPNG(id: string, fileName = "esg-report.png") {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 1.5, // increase for sharper image
      filter: (domNode) => !domNode.classList?.contains("no-export"),
    });

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("PNG export failed", err);
  }
}

export function exportToCSV(data: any[], fileName = "table-data.csv") {
  if (!data || !data.length) return;

  // Get headers (keys from the first row)
  const headers = Object.keys(data[0]);

  // Build CSV content
  const csvRows = [
    headers.join(","), // header row
    ...data.map((row) =>
      headers
        .map((field) => {
          const value = row[field] ?? "";
          // Escape quotes and commas
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  const csvString = csvRows.join("\n");

  // Trigger download
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.click();
}
