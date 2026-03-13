// import * as htmlToImage from 'html-to-image';
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePDF(id: string, fileName = "esg-report.pdf") {
  const element = document.getElementById(id);
  if (!element) return;
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    filter: (domNode) => !domNode.classList?.contains("no-export"),
  });

  //   const dataUrl = await toPng(element, {
  //   cacheBust: true,
  //   filter: (domNode) => !domNode.closest(".no-export"),
  // });

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(dataUrl);
  const imgWidth = pageWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}

export async function exportPNG(id: string, fileName = "esg-report.png") {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 3, // Increased for sharper, high-resolution image
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

export async function exportPNGs(id: string, fileName = "esg-report") {
  const element = document.getElementById(id);
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 3, useCORS: true });
  const pageHeight = 1000; // pixels per "page"
  let y = 0;
  let page = 1;

  while (y < canvas.height) {
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.min(pageHeight, canvas.height - y);

    const ctx = slice.getContext("2d");
    ctx?.drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);

    const dataUrl = slice.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${fileName}-page${page}.png`;
    link.href = dataUrl;
    link.click();

    y += pageHeight;
    page++;
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
