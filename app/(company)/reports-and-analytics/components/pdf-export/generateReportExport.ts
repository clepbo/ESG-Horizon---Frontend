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
 * Checks if a row of pixels in the image is a white/near-white gap.
 * Samples every 10th pixel for performance.
 */
function isWhiteRow(ctx: CanvasRenderingContext2D, y: number, width: number): boolean {
  const step = 10;
  const samples = Math.ceil(width / step);
  const data = ctx.getImageData(0, y, width, 1).data;
  for (let i = 0; i < samples; i++) {
    const px = i * step * 4;
    if (data[px] < 245 || data[px + 1] < 245 || data[px + 2] < 245) return false;
  }
  return true;
}

/**
 * Finds the nearest white row to `idealY`, searching ±searchRange pixels.
 * Prefers the closest match. Falls back to idealY if none found.
 */
function findWhiteBand(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  idealY: number,
  searchRange = 100
): number {
  for (let offset = 0; offset <= searchRange; offset++) {
    // Search downward first (prefer keeping more content on current page)
    const down = idealY + offset;
    if (down < height && isWhiteRow(ctx, down, width)) return down;
    // Then upward
    const up = idealY - offset;
    if (up > 0 && isWhiteRow(ctx, up, width)) return up;
  }
  return idealY; // fallback — no worse than before
}

/**
 * Slices a tall image into page-sized chunks using content-aware break points.
 * Scans for white horizontal bands near each ideal cut point so slices happen
 * at natural gaps between cards/charts instead of cutting through content.
 */
async function sliceImageForPages(
  imageDataUrl: string,
  usableWidthMm: number,
  usableHeightMm: number
): Promise<string[]> {
  const img = await loadImage(imageDataUrl);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  // How many source pixels fit one usable page height
  const pxPerMm = srcW / usableWidthMm;
  const srcPixelsPerPage = Math.floor(usableHeightMm * pxPerMm);

  const scaledHeight = (srcH * usableWidthMm) / (srcW > 0 ? srcW : 1);
  if (scaledHeight <= usableHeightMm) {
    return [imageDataUrl];
  }

  // Draw full image onto a canvas for pixel inspection
  const scanCanvas = document.createElement("canvas");
  scanCanvas.width = srcW;
  scanCanvas.height = srcH;
  const scanCtx = scanCanvas.getContext("2d");
  if (!scanCtx) return [imageDataUrl];
  scanCtx.drawImage(img, 0, 0);

  // Find content-aware cut points
  const cutPoints: number[] = [0];
  let cursor = 0;
  while (cursor + srcPixelsPerPage < srcH) {
    const idealCut = cursor + srcPixelsPerPage;
    const actualCut = findWhiteBand(scanCtx, srcW, srcH, idealCut);
    cutPoints.push(actualCut);
    cursor = actualCut;
  }
  cutPoints.push(srcH);

  // Slice at the cut points
  const slices: string[] = [];
  for (let i = 0; i < cutPoints.length - 1; i++) {
    const sy = cutPoints[i];
    const sliceH = cutPoints[i + 1] - sy;
    if (sliceH <= 0) continue;

    const canvas = document.createElement("canvas");
    canvas.width = srcW;
    canvas.height = sliceH;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    // Flow all section slices continuously across pages using a Y cursor
    const sectionGap = 6; // mm gap between sections
    let cursorY = usableHeight + 1; // force first slice onto a new page
    let isFirstContentPage = true;

    for (const name of sectionNames) {
      const imageDataUrl = images.get(name);
      if (!imageDataUrl) continue;

      const slices = await sliceImageForPages(imageDataUrl, usableWidth, usableHeight);

      for (let i = 0; i < slices.length; i++) {
        const sliceDataUrl = slices[i];
        const sliceProps = pdf.getImageProperties(sliceDataUrl);
        const sliceDrawW = usableWidth;
        const sliceDrawH = (sliceProps.height * sliceDrawW) / sliceProps.width;

        // Add gap before first slice of a section (except the very first section)
        const gapNeeded = i === 0 && !isFirstContentPage ? sectionGap : 0;

        // Check if this slice fits on the current page
        if (cursorY + gapNeeded + sliceDrawH > usableHeight) {
          pdf.addPage();
          cursorY = margin;
          isFirstContentPage = false;
        } else {
          cursorY += gapNeeded;
        }

        pdf.addImage(sliceDataUrl, "PNG", margin, cursorY, sliceDrawW, sliceDrawH);
        cursorY += sliceDrawH;
      }

      isFirstContentPage = false;
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
