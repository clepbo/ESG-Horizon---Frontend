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
 * Threshold of 240 accommodates light gray card backgrounds.
 */
function isWhiteRow(ctx: CanvasRenderingContext2D, y: number, width: number, threshold = 240): boolean {
  const step = 10;
  const samples = Math.ceil(width / step);
  const data = ctx.getImageData(0, y, width, 1).data;
  for (let i = 0; i < samples; i++) {
    const px = i * step * 4;
    if (data[px] < threshold || data[px + 1] < threshold || data[px + 2] < threshold) return false;
  }
  return true;
}

/**
 * Checks if there's a horizontal band of consecutive white rows (not just a single row).
 * A band of at least `minRows` white rows indicates a real gap between content blocks.
 */
function isWhiteBand(
  ctx: CanvasRenderingContext2D,
  y: number,
  width: number,
  height: number,
  minRows = 3
): boolean {
  for (let r = 0; r < minRows; r++) {
    if (y + r >= height) return false;
    if (!isWhiteRow(ctx, y + r, width)) return false;
  }
  return true;
}

/**
 * Finds the nearest white band at or above `idealY`.
 * Only searches upward so every slice is guaranteed ≤ one page tall.
 * Falls back to idealY if no gap is found within searchRange.
 */
function findWhiteBand(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  idealY: number,
  searchRange = 300
): number {
  for (let offset = 0; offset <= searchRange; offset++) {
    const y = idealY - offset;
    if (y > 0 && isWhiteBand(ctx, y, width, height)) return y;
  }
  // No gap found — cut at idealY (worst case: content clipped, but page won't overflow)
  return idealY;
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
    const marginTop = 15;
    const marginSide = 14;
    const footerSpace = 22;
    const usableHeight = pageHeight - marginTop - footerSpace;
    const usableWidth = pageWidth - marginSide * 2;

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
    const sectionGap = 8; // mm gap between sections
    let cursorY = usableHeight + 1; // force first slice onto a new page
    let isFirstContentPage = true;

    for (const name of sectionNames) {
      const imageDataUrl = images.get(name);
      if (!imageDataUrl) continue;

      // Appendix always starts on its own page
      if (name === "evidence-appendix") {
        pdf.addPage();
        cursorY = marginTop;
        isFirstContentPage = false;
      }

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
          cursorY = marginTop;
          isFirstContentPage = false;
        } else {
          cursorY += gapNeeded;
        }

        pdf.addImage(sliceDataUrl, "PNG", marginSide, cursorY, sliceDrawW, sliceDrawH);
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
 * Draws a cover page section onto the PNG canvas.
 * Returns the height consumed by the cover page.
 */
async function drawPngCoverPage(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  data: CoverPageData
): Promise<number> {
  const centerX = canvasWidth / 2;
  const padding = 60;
  let y = padding;

  // Top accent bar
  ctx.fillStyle = "#0F4C81";
  ctx.fillRect(0, 0, canvasWidth, 12);
  y = 60;

  // Platform logo
  try {
    const platformLogoDataUrl = await fetchImageAsDataUrl(
      `${window.location.origin}${PLATFORM_LOGO_PATH}`
    );
    if (platformLogoDataUrl) {
      const logoImg = await loadImage(platformLogoDataUrl);
      const logoW = 200;
      const logoH = 160;
      ctx.drawImage(logoImg, centerX - logoW / 2, y, logoW, logoH);
      y += logoH + 20;
    }
  } catch {
    y += 40;
  }

  // Title
  ctx.fillStyle = "#0F4C81";
  ctx.font = "bold 48px Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ESG Performance Report", centerX, y);
  y += 20;

  // Platform address
  ctx.fillStyle = "#828282";
  ctx.font = "18px Helvetica, Arial, sans-serif";
  ctx.fillText("43 Oghosa Crescent, Off Ihama Road, GRA, Benin City, 300001", centerX, y);
  y += 16;
  ctx.fillText("support@esghorizon.africa", centerX, y);
  y += 30;

  // Divider
  ctx.strokeStyle = "#C8C8C8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, y);
  ctx.lineTo(canvasWidth - 120, y);
  ctx.stroke();
  y += 40;

  // Company logo
  if (data.companyLogoUrl) {
    try {
      const companyLogoDataUrl = await fetchImageAsDataUrl(data.companyLogoUrl);
      if (companyLogoDataUrl) {
        const logoImg = await loadImage(companyLogoDataUrl);
        const logoSize = 100;
        ctx.drawImage(logoImg, centerX - logoSize / 2, y, logoSize, logoSize);
        y += logoSize + 20;
      }
    } catch {
      // skip
    }
  }

  // Company name
  ctx.fillStyle = "#1E1E1E";
  ctx.font = "bold 52px Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(data.companyName || "Company", centerX, y);
  y += 28;

  // Address
  ctx.fillStyle = "#646464";
  ctx.font = "24px Helvetica, Arial, sans-serif";
  if (data.companyAddress || data.companyCountry) {
    const addressLine = [data.companyAddress, data.companyCountry].filter(Boolean).join(", ");
    ctx.fillText(addressLine, centerX, y);
  }
  y += 30;

  // Subsidiary
  if (data.subsidiary) {
    ctx.fillStyle = "#505050";
    ctx.font = "28px Helvetica, Arial, sans-serif";
    ctx.fillText(`Subsidiary: ${data.subsidiary}`, centerX, y);
    y += 28;
  }

  // Reporting period
  ctx.fillStyle = "#505050";
  ctx.font = "26px Helvetica, Arial, sans-serif";
  ctx.fillText(`Reporting Period: ${data.reportingPeriod}`, centerX, y);
  y += 28;

  // Status
  if (data.status) {
    ctx.fillStyle = "#646464";
    ctx.font = "22px Helvetica, Arial, sans-serif";
    ctx.fillText(`Status: ${data.status}`, centerX, y);
    y += 24;
  }

  y += 30;

  // Generation date
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  ctx.fillStyle = "#8C8C8C";
  ctx.font = "20px Helvetica, Arial, sans-serif";
  ctx.fillText(`Generated on ${today}`, centerX, y);
  y += 24;

  // "Generated with ESG Horizon"
  ctx.fillStyle = "#787878";
  ctx.font = "18px Helvetica, Arial, sans-serif";
  ctx.fillText("Generated with ESG Horizon", centerX, y);
  y += 20;

  // Bottom accent bar
  ctx.fillStyle = "#0F4C81";
  ctx.fillRect(0, y, canvasWidth, 12);
  y += 12 + padding;

  // Reset text alignment
  ctx.textAlign = "start";

  return y;
}

/**
 * Draws a footer band at the bottom of the PNG canvas.
 */
function drawPngFooter(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  y: number
): number {
  const footerHeight = 60;
  const centerX = canvasWidth / 2;

  // Light gray background
  ctx.fillStyle = "#F5F5F5";
  ctx.fillRect(0, y, canvasWidth, footerHeight);

  // Divider line at top
  ctx.strokeStyle = "#D0D0D0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(canvasWidth, y);
  ctx.stroke();

  // Footer text
  ctx.fillStyle = "#787878";
  ctx.font = "16px Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Generated with ESG Horizon  |  43 Oghosa Crescent, Off Ihama Road, GRA, Benin City  |  support@esghorizon.africa",
    centerX,
    y + footerHeight / 2 + 5
  );
  ctx.textAlign = "start";

  return footerHeight;
}

/**
 * Generates a full PNG of all sections stitched vertically, with cover page and footer.
 */
export async function generateReportPNG(params: ExportParams) {
  const { reportData, company } = params;
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

    const maxWidth = Math.max(...loadedImages.map((img) => img.naturalWidth));
    const sectionsHeight = loadedImages.reduce((sum, img) => sum + img.naturalHeight, 0);

    // Pre-calculate cover page height with a temporary canvas
    const coverPageHeight = 700; // approximate height for cover
    const footerHeight = 60;
    const totalHeight = coverPageHeight + sectionsHeight + footerHeight;

    // Create the stitching canvas
    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    const actualCoverHeight = await drawPngCoverPage(ctx, maxWidth, coverData);

    // Draw each section image sequentially after the cover
    let y = actualCoverHeight;
    for (const img of loadedImages) {
      ctx.drawImage(img, 0, y, img.naturalWidth, img.naturalHeight);
      y += img.naturalHeight;
    }

    // Draw footer
    const actualFooterHeight = drawPngFooter(ctx, maxWidth, y);

    // Trim canvas to actual content height
    const finalHeight = y + actualFooterHeight;
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = maxWidth;
    finalCanvas.height = finalHeight;
    const finalCtx = finalCanvas.getContext("2d");
    if (!finalCtx) return;
    finalCtx.drawImage(canvas, 0, 0);

    // Export and download
    const pngDataUrl = finalCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    const subsidiary = reportData.subsidiary ?? "ESG";
    link.download = `${subsidiary}-Report-${reportData.startYear ?? ""}.png`;
    link.href = pngDataUrl;
    link.click();
  } finally {
    cleanup();
  }
}
