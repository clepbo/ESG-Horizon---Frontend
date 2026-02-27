import React from "react";
import ReactDOM from "react-dom/client";
import jsPDF from "jspdf";
import ExportReportContent from "./ExportReportContent";
import { sectionNames } from "./ExportReportContent";
import { drawCoverPage, CoverPageData } from "./coverPage";
import { waitForCharts, captureSection, addFooter, loadImage, fetchImageAsDataUrl } from "./pdfUtils";
import { ReportResponse } from "@/types/report/reportResponse";
import { formatStatus } from "@/lib/utils";

const PLATFORM_LOGO_PATH = "/logo-new.png";

export interface ExportParams {
  reportData: ReportResponse;
  company: {
    name: string;
    logoUrl: string | null;
    address: string;
    country: string;
  };
}

/**
 * Creates a hidden offscreen container, renders all tab content into it,
 * waits for charts, then captures each section as a PNG data URL.
 * Returns the captured images and cleans up the container.
 */
async function renderAndCaptureSections(
  reportData: ReportResponse
): Promise<{ images: Map<string, string>; cleanup: () => void }> {
  // Create hidden offscreen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1200px";
  container.style.zIndex = "-9999";
  container.style.background = "#fff";
  document.body.appendChild(container);

  // Render all tabs simultaneously
  const root = ReactDOM.createRoot(container);
  root.render(
    React.createElement(ExportReportContent, { reportData })
  );

  // Wait for charts to paint
  await waitForCharts(container);

  // Capture each section
  const images = new Map<string, string>();
  for (const name of sectionNames) {
    const sectionEl = container.querySelector(
      `[data-export-section="${name}"]`
    ) as HTMLElement | null;
    if (sectionEl) {
      try {
        const dataUrl = await captureSection(sectionEl);
        images.set(name, dataUrl);
      } catch (err) {
        console.warn(`Failed to capture section "${name}":`, err);
      }
    }
  }

  const cleanup = () => {
    root.unmount();
    document.body.removeChild(container);
  };

  return { images, cleanup };
}

/**
 * Slices a tall image into page-sized chunks so each chunk fits within the
 * usable area of an A4 page (above the footer). Returns an array of PNG data URLs.
 */
async function sliceImageForPages(
  imageDataUrl: string,
  usableWidthMm: number,
  usableHeightMm: number,
  _marginMm: number
): Promise<string[]> {
  const img = await loadImage(imageDataUrl);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  // Calculate how many source pixels correspond to one page of usable height
  const scaledHeight = (srcH * usableWidthMm) / (srcW > 0 ? srcW : 1);
  const pagesNeeded = Math.ceil(scaledHeight / usableHeightMm);

  if (pagesNeeded <= 1) {
    // Image fits on one page — return as-is (it will be scaled by addImage)
    return [imageDataUrl];
  }

  // How many source pixels per page slice
  const srcPixelsPerPage = Math.floor(srcH / pagesNeeded);
  const slices: string[] = [];

  // Determine output canvas size: match source width, height = pixels per page
  for (let i = 0; i < pagesNeeded; i++) {
    const sy = i * srcPixelsPerPage;
    const sliceH = Math.min(srcPixelsPerPage, srcH - sy);
    if (sliceH <= 0) break;

    const canvas = document.createElement("canvas");
    canvas.width = srcW;
    canvas.height = sliceH;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    // White background so transparent areas don't show as black
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw just this slice of the source image
    ctx.drawImage(img, 0, sy, srcW, sliceH, 0, 0, srcW, sliceH);
    slices.push(canvas.toDataURL("image/png"));
  }

  return slices;
}

/**
 * Generates a multi-page PDF with cover page, all ESG pillar sections, and footers.
 */
export async function generateReportPDF(params: ExportParams) {
  const { reportData, company } = params;
  const { images, cleanup } = await renderAndCaptureSections(reportData);

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const footerSpace = 16;
    const usableHeight = pageHeight - margin - footerSpace;
    const usableWidth = pageWidth - margin * 2;

    // Draw cover page
    const period = `${reportData.startMonth ?? ""} ${reportData.startYear ?? ""} - ${reportData.endMonth ?? ""} ${reportData.endYear ?? ""}`;
    const coverData: CoverPageData = {
      companyName: company.name,
      companyLogoUrl: company.logoUrl,
      companyAddress: company.address,
      companyCountry: company.country,
      subsidiary: reportData.subsidiary ?? "",
      reportingPeriod: period,
      status: formatStatus(reportData.status ?? ""),
    };
    await drawCoverPage(pdf, coverData);

    // Add each section as subsequent pages (sliced to avoid footer overlap)
    for (const name of sectionNames) {
      const imageDataUrl = images.get(name);
      if (!imageDataUrl) continue;

      const slices = await sliceImageForPages(imageDataUrl, usableWidth, usableHeight, margin);
      for (const sliceDataUrl of slices) {
        pdf.addPage();
        // Calculate the actual height of this slice to avoid stretching
        const sliceProps = pdf.getImageProperties(sliceDataUrl);
        const sliceDrawW = usableWidth;
        const sliceDrawH = (sliceProps.height * sliceDrawW) / sliceProps.width;
        pdf.addImage(sliceDataUrl, "PNG", margin, margin, sliceDrawW, sliceDrawH);
      }
    }

    // Pre-fetch platform logo for footers
    let footerLogoDataUrl: string | null = null;
    try {
      footerLogoDataUrl = await fetchImageAsDataUrl(
        `${window.location.origin}${PLATFORM_LOGO_PATH}`
      );
    } catch {
      // Footer will render without logo
    }

    // Add footers to all pages (skip cover page)
    const totalPages = pdf.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i - 1, totalPages - 1, footerLogoDataUrl);
    }

    const subsidiary = reportData.subsidiary ?? "ESG";
    const fileName = `${subsidiary}-Report-${reportData.startYear ?? ""}.pdf`;
    pdf.save(fileName);
  } finally {
    cleanup();
  }
}

/**
 * Generates a full PNG of all sections stitched vertically.
 */
export async function generateReportPNG(params: ExportParams) {
  const { reportData } = params;
  const { images, cleanup } = await renderAndCaptureSections(reportData);

  try {
    // Load all section images to get dimensions
    const loadedImages: HTMLImageElement[] = [];
    for (const name of sectionNames) {
      const dataUrl = images.get(name);
      if (dataUrl) {
        const img = await loadImage(dataUrl);
        loadedImages.push(img);
      }
    }

    if (loadedImages.length === 0) return;

    // Calculate total canvas dimensions
    const maxWidth = Math.max(...loadedImages.map((img) => img.naturalWidth));
    const totalHeight = loadedImages.reduce((sum, img) => sum + img.naturalHeight, 0);

    // Create a stitching canvas
    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each section image sequentially
    let y = 0;
    for (const img of loadedImages) {
      ctx.drawImage(img, 0, y, img.naturalWidth, img.naturalHeight);
      y += img.naturalHeight;
    }

    // Export and download
    const pngDataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const subsidiary = reportData.subsidiary ?? "ESG";
    link.download = `${subsidiary}-Report-${reportData.startYear ?? ""}.png`;
    link.href = pngDataUrl;
    link.click();
  } finally {
    cleanup();
  }
}
