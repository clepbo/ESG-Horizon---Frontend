import React from "react";
import ReactDOM from "react-dom/client";
import jsPDF from "jspdf";
import ExportReportContent from "./ExportReportContent";
import { sectionNames, sectionLabels } from "./ExportReportContent";
import { drawCoverPage, CoverPageData } from "./coverPage";
import {
  waitForCharts,
  captureSection,
  addFooter,
  loadImage,
  fetchImageAsDataUrl,
} from "./pdfUtils";
import { ReportResponse, ReportEvidence } from "@/types/report/reportResponse";
import { formatStatus } from "@/lib/utils";

const PLATFORM_LOGO_PATH = "/logo-new.png";

export interface ExportProgress {
  /** 0–100 */
  percent: number;
  /** Human-readable stage label */
  stage: string;
}

export interface ExportParams {
  reportData: ReportResponse;
  company: {
    name: string;
    logoUrl: string | null;
    address: string;
    country: string;
  };
  onProgress?: (progress: ExportProgress) => void;
}

/** A captured pillar section + any forced page-break y-offsets within it. */
interface SectionCapture {
  /** Base64 PNG data URL */
  image: string;
  /** y-offsets (in source / captured-image pixels, NOT CSS pixels) where
   *  the slicer must force a page break. Comes from any descendant
   *  marked with `data-pdf-page-break-before="true"` in the section's DOM. */
  forcedBreaks: number[];
}

/** Pixel ratio used by captureSection() — keep in sync with pdfUtils.captureSection. */
const CAPTURE_PIXEL_RATIO = 1.5;

/**
 * Creates a hidden offscreen container, renders all tab content into it,
 * waits for charts, then captures each section as a PNG data URL.
 * Returns the captures (image + forced-break offsets) and cleans up.
 */
async function renderAndCaptureSections(
  reportData: ReportResponse,
  onProgress?: (progress: ExportProgress) => void
): Promise<{ captures: Map<string, SectionCapture>; cleanup: () => void }> {
  // Create hidden offscreen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1200px";
  container.style.zIndex = "-9999";
  container.style.background = "#fff";
  document.body.appendChild(container);

  onProgress?.({ percent: 5, stage: "Rendering report content…" });

  // Render all tabs simultaneously
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(ExportReportContent, { reportData }));

  // Wait for charts to paint
  onProgress?.({ percent: 10, stage: "Waiting for charts to render…" });
  await waitForCharts(container);

  // Capture each section — progress spans 15% to 75%
  const captures = new Map<string, SectionCapture>();
  const progressStart = 15;
  const progressEnd = 75;
  const step = (progressEnd - progressStart) / sectionNames.length;

  for (let i = 0; i < sectionNames.length; i++) {
    const name = sectionNames[i];
    const label = sectionLabels[name] ?? name;
    onProgress?.({ percent: Math.round(progressStart + step * i), stage: `Capturing ${label}…` });

    const sectionEl = container.querySelector(
      `[data-export-section="${name}"]`
    ) as HTMLElement | null;
    if (!sectionEl) continue;

    // Measure any forced page-break markers BEFORE capturing — bounding
    // rects are read off the live layout, not the rasterised image.
    // Multiply by the capture pixel ratio so the y values match the
    // source dimensions of the PNG that captureSection() produces.
    const sectionRect = sectionEl.getBoundingClientRect();
    const markers = sectionEl.querySelectorAll<HTMLElement>('[data-pdf-page-break-before="true"]');
    const forcedBreaks: number[] = [];
    for (const marker of Array.from(markers)) {
      const markerRect = marker.getBoundingClientRect();
      const yOffsetCss = markerRect.top - sectionRect.top;
      const yOffsetSrc = Math.round(yOffsetCss * CAPTURE_PIXEL_RATIO);
      if (yOffsetSrc > 0) forcedBreaks.push(yOffsetSrc);
    }

    const dataUrl = await captureSection(sectionEl);
    if (dataUrl) {
      captures.set(name, { image: dataUrl, forcedBreaks });
    } else {
      console.warn(`Section "${name}" produced no image — skipping.`);
    }
  }

  onProgress?.({ percent: 75, stage: "All sections captured" });

  const cleanup = () => {
    root.unmount();
    document.body.removeChild(container);
  };

  return { captures, cleanup };
}

/**
 * Checks if a row of pixels in the image is a white/near-white gap.
 * Samples every 10th pixel for performance.
 * Threshold of 250 accommodates faded card backgrounds and subtle borders
 * (gray-50/50, etc.) so they still register as gaps, while pure content
 * (text, charts, coloured cards) is below 250 and disqualifies the row.
 */
// Note: callers must create the source canvas with
// `getContext("2d", { willReadFrequently: true })` so the repeated
// getImageData() calls below don't trip Chrome's GPU readback warning.
function isWhiteRow(
  ctx: CanvasRenderingContext2D,
  y: number,
  width: number,
  threshold = 250
): boolean {
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
 * 2 consecutive white rows is enough to count as a real gap — narrower
 * gaps (single-pixel anti-aliasing artefacts) are ignored.
 */
function isWhiteBand(
  ctx: CanvasRenderingContext2D,
  y: number,
  width: number,
  height: number,
  minRows = 2
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
 *
 * searchRange is generous (800px ≈ 65% of an A4 page at 1200px content
 * width) so the scanner can find a gap even when a single chart is taller
 * than 300px. Trade-off: slices may stop further from the page bottom
 * (more whitespace at the bottom of some pages) — but no mid-chart cuts.
 *
 * Falls back to idealY if no gap is found within searchRange (rare:
 * implies a single content block taller than 800px with no internal gap).
 */
function findWhiteBand(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  idealY: number,
  searchRange = 800
): number {
  for (let offset = 0; offset <= searchRange; offset++) {
    const y = idealY - offset;
    if (y > 0 && isWhiteBand(ctx, y, width, height)) return y;
  }
  // No gap found — cut at idealY (worst case: content clipped, but page won't overflow)
  return idealY;
}

/**
 * A single sliced page-sized chunk + flag indicating whether the slice was
 * forced onto a new page (i.e. its top boundary came from a
 * data-pdf-page-break-before marker rather than a natural white-band cut).
 */
interface PageSlice {
  image: string;
  /** True when the PDF flow MUST start a new page before drawing this slice
   *  (regardless of whether the previous slice's bottom is still in usable
   *  space on the current page). Used to honour explicit page-break hints
   *  the source DOM marked with data-pdf-page-break-before="true". */
  forceNewPage: boolean;
}

/**
 * Slices a tall image into page-sized chunks using content-aware break points.
 * Scans for white horizontal bands near each ideal cut point so slices happen
 * at natural gaps between cards/charts instead of cutting through content.
 *
 * Forced breaks (from data-pdf-page-break-before markers) take priority
 * over the white-band scan: if a forced break y-offset falls within the
 * next ideal-cut window, that y becomes the cut point and the resulting
 * slice is flagged so the PDF flow can start a fresh page for it.
 */
async function sliceImageForPages(
  imageDataUrl: string,
  usableWidthMm: number,
  usableHeightMm: number,
  forcedBreaks: number[] = []
): Promise<PageSlice[]> {
  const img = await loadImage(imageDataUrl);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  // How many source pixels fit one usable page height
  const pxPerMm = srcW / usableWidthMm;
  const srcPixelsPerPage = Math.floor(usableHeightMm * pxPerMm);

  // Sort + dedupe + clamp forced breaks to the valid range
  const sortedForced = Array.from(new Set(forcedBreaks))
    .filter((b) => b > 0 && b < srcH)
    .sort((a, b) => a - b);

  const scaledHeight = (srcH * usableWidthMm) / (srcW > 0 ? srcW : 1);
  if (scaledHeight <= usableHeightMm && sortedForced.length === 0) {
    return [{ image: imageDataUrl, forceNewPage: false }];
  }

  // Draw full image onto a canvas for pixel inspection.
  // willReadFrequently: true keeps the buffer on the CPU side so the many
  // getImageData() calls below stay fast and don't spam the console.
  const scanCanvas = document.createElement("canvas");
  scanCanvas.width = srcW;
  scanCanvas.height = srcH;
  const scanCtx = scanCanvas.getContext("2d", { willReadFrequently: true });
  if (!scanCtx) return [{ image: imageDataUrl, forceNewPage: false }];
  scanCtx.drawImage(img, 0, 0);

  // Build cut points + per-cut "force new page" flags. Cut[i] is the top of
  // slice[i]; the flag at index i indicates whether slice i should land on
  // a fresh page. Slice 0 is implicitly on the first page (no force).
  const cutPoints: number[] = [0];
  const forceFlags: boolean[] = [false];
  let cursor = 0;
  let forcedIdx = 0;

  // Skip any forced breaks that are at/before the start
  while (forcedIdx < sortedForced.length && sortedForced[forcedIdx] <= cursor) {
    forcedIdx++;
  }

  while (cursor < srcH) {
    const naturalIdeal = cursor + srcPixelsPerPage;

    // If a forced break falls within the next page window (or beyond it
    // doesn't matter — we still honour it), use it as the cut point.
    const nextForced = forcedIdx < sortedForced.length ? sortedForced[forcedIdx] : null;
    const useForced = nextForced !== null && nextForced > cursor && nextForced <= naturalIdeal;

    if (useForced) {
      cutPoints.push(nextForced!);
      forceFlags.push(true);
      cursor = nextForced!;
      forcedIdx++;
      continue;
    }

    // No forced break within this window — check if remaining content fits
    if (naturalIdeal >= srcH) break;

    const actualCut = findWhiteBand(scanCtx, srcW, srcH, naturalIdeal);
    // Safety: if findWhiteBand can't move forward (degenerate), bail to avoid infinite loop
    if (actualCut <= cursor) {
      cutPoints.push(naturalIdeal);
      forceFlags.push(false);
      cursor = naturalIdeal;
    } else {
      cutPoints.push(actualCut);
      forceFlags.push(false);
      cursor = actualCut;
    }
  }
  cutPoints.push(srcH);

  // Slice at the cut points
  const slices: PageSlice[] = [];
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
    slices.push({
      image: canvas.toDataURL("image/png"),
      forceNewPage: forceFlags[i] ?? false,
    });
  }

  return slices;
}

/**
 * Renders the Supporting Evidence appendix directly into the PDF using
 * jsPDF's native text + line + link APIs (NOT as a captured image).
 *
 * This gives us three things the image-capture approach couldn't:
 *   1. **Clickable URLs** — pdf.link(x, y, w, h, { url }) attaches a real
 *      hyperlink rect to each row's "Open" cell. When the PDF is opened
 *      in any reader, the links are live.
 *   2. **Perfect pagination** — auto-flows row-by-row, adding pages on
 *      demand instead of slicing a raster image (which can cut a row).
 *   3. **Crisp vector text** — no raster pixelation at zoom.
 *
 * Layout mirrors the on-screen EvidenceAppendix component (title,
 * description, then per-pillar sections each with a # / File Name /
 * Category / Link table).
 */
function drawAppendixPdf(
  pdf: jsPDF,
  evidence: ReportEvidence | undefined,
  layout: {
    marginTop: number;
    marginSide: number;
    pageWidth: number;
    pageHeight: number;
    usableWidth: number;
    usableHeight: number;
  }
): void {
  if (!evidence) return;

  const pillars = [
    { key: "environmental" as const, label: "Environmental" },
    { key: "socialCapital" as const, label: "Social Capital" },
    { key: "humanCapital" as const, label: "Human Capital" },
    { key: "businessModel" as const, label: "Business Model & Innovation" },
    { key: "leadershipAndGovernance" as const, label: "Leadership & Governance" },
  ];

  const hasAny = pillars.some((p) => (evidence[p.key]?.length ?? 0) > 0);
  if (!hasAny) return;

  // Column widths (mm) — sum to layout.usableWidth.
  // Rebalanced to give the Link column the largest share now that the
  // full URL is rendered there (not a generic "Open" label).
  const COL_NUM_W = 8;
  const COL_NAME_W = 60;
  const COL_SECTION_W = 40;
  const COL_LINK_W = layout.usableWidth - COL_NUM_W - COL_NAME_W - COL_SECTION_W;

  const ROW_H = 7;
  const PILLAR_HEADER_H = 12;
  const TABLE_HEADER_H = 8;
  const PILLAR_GAP = 6;

  // Helper: ensure there's room for `needed` mm; new page if not.
  let cursorY = layout.marginTop;
  const ensureRoom = (needed: number) => {
    if (cursorY + needed > layout.usableHeight) {
      pdf.addPage();
      cursorY = layout.marginTop;
    }
  };

  // ─── Title block ──────────────────────────────────────────────────
  pdf.addPage();
  cursorY = layout.marginTop;

  pdf.setFontSize(18);
  pdf.setTextColor(33, 33, 33);
  pdf.setFont("helvetica", "bold");
  pdf.text("Appendix: Supporting Evidence", layout.marginSide, cursorY + 5);
  cursorY += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "Documents and evidence uploaded during the assessment process",
    layout.marginSide,
    cursorY + 4
  );
  cursorY += 6;

  // Title underline
  pdf.setDrawColor(40, 40, 40);
  pdf.setLineWidth(0.5);
  pdf.line(layout.marginSide, cursorY, layout.pageWidth - layout.marginSide, cursorY);
  cursorY += 8;

  // ─── Per-pillar tables ────────────────────────────────────────────
  for (const pillar of pillars) {
    const files = evidence[pillar.key];
    if (!files || files.length === 0) continue;

    // Pillar header (label + thin underline)
    ensureRoom(PILLAR_HEADER_H + TABLE_HEADER_H + ROW_H);
    pdf.setFontSize(13);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont("helvetica", "bold");
    pdf.text(pillar.label, layout.marginSide, cursorY + 4);
    cursorY += 6;

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(layout.marginSide, cursorY, layout.pageWidth - layout.marginSide, cursorY);
    cursorY += 4;

    // Table column headers
    pdf.setFontSize(8);
    pdf.setTextColor(140, 140, 140);
    pdf.setFont("helvetica", "bold");
    const headerY = cursorY + 3;
    pdf.text("#", layout.marginSide, headerY);
    pdf.text("FILE NAME", layout.marginSide + COL_NUM_W, headerY);
    pdf.text("CATEGORY", layout.marginSide + COL_NUM_W + COL_NAME_W, headerY);
    pdf.text("LINK", layout.marginSide + COL_NUM_W + COL_NAME_W + COL_SECTION_W, headerY);
    cursorY += 5;

    pdf.setDrawColor(230, 230, 230);
    pdf.line(layout.marginSide, cursorY, layout.pageWidth - layout.marginSide, cursorY);
    cursorY += 3;

    // Rows
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    files.forEach((file, i) => {
      ensureRoom(ROW_H);

      const baselineY = cursorY + 4;

      // # column
      pdf.setTextColor(160, 160, 160);
      pdf.text(String(i + 1), layout.marginSide, baselineY);

      // File name (truncate to fit column)
      pdf.setTextColor(40, 40, 40);
      const nameLines = pdf.splitTextToSize(file.name || "File", COL_NAME_W - 2);
      pdf.text(nameLines[0] || "File", layout.marginSide + COL_NUM_W, baselineY);

      // Section / category
      pdf.setTextColor(100, 100, 100);
      const sectionLines = pdf.splitTextToSize(file.section || "", COL_SECTION_W - 2);
      pdf.text(sectionLines[0] || "", layout.marginSide + COL_NUM_W + COL_NAME_W, baselineY);

      // Clickable link — render the actual URL (truncated to fit the
      // column with a single-character ellipsis if needed) and overlay a
      // pdf.link rect that covers exactly the rendered text width so the
      // entire visible URL is the click target.
      const linkX = layout.marginSide + COL_NUM_W + COL_NAME_W + COL_SECTION_W;
      if (file.url) {
        pdf.setTextColor(37, 99, 235);
        // splitTextToSize wraps to fit, but we only want one line — take
        // line 0 and append an ellipsis if the URL had to be wrapped.
        const urlLines = pdf.splitTextToSize(file.url, COL_LINK_W - 2);
        const displayUrl = urlLines.length > 1 ? `${urlLines[0]}…` : urlLines[0] || file.url;
        pdf.text(displayUrl, linkX, baselineY);
        const linkW = Math.min(pdf.getTextWidth(displayUrl), COL_LINK_W - 2);
        // Click rect sits on top of the rendered text. baselineY - 3 / h 4.5
        // mm is a tight fit around 9pt helvetica (~3.2mm cap height).
        pdf.link(linkX, baselineY - 3, linkW, 4.5, { url: file.url });
      } else {
        pdf.setTextColor(180, 180, 180);
        pdf.text("—", linkX, baselineY);
      }

      // Faint row separator
      pdf.setDrawColor(245, 245, 245);
      pdf.line(
        layout.marginSide,
        cursorY + ROW_H - 1,
        layout.pageWidth - layout.marginSide,
        cursorY + ROW_H - 1
      );

      cursorY += ROW_H;
    });

    cursorY += PILLAR_GAP;
  }
}

/**
 * Generates a multi-page PDF with cover page, all ESG pillar sections, and footers.
 */
export async function generateReportPDF(params: ExportParams) {
  const { reportData, company, onProgress } = params;
  const { captures, cleanup } = await renderAndCaptureSections(reportData, onProgress);

  try {
    onProgress?.({ percent: 78, stage: "Building cover page…" });
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

    onProgress?.({ percent: 82, stage: "Assembling PDF pages…" });

    // Flow all section slices continuously across pages using a Y cursor.
    // The evidence-appendix section is intentionally skipped here — we
    // render it directly into the PDF as native text further down so the
    // URLs become clickable links and pagination is row-perfect.
    const sectionGap = 8; // mm gap between sections
    let cursorY = usableHeight + 1; // force first slice onto a new page
    let isFirstContentPage = true;

    for (const name of sectionNames) {
      if (name === "evidence-appendix") continue; // handled below as native text
      const capture = captures.get(name);
      if (!capture) continue;

      let slices: PageSlice[];
      try {
        slices = await sliceImageForPages(
          capture.image,
          usableWidth,
          usableHeight,
          capture.forcedBreaks
        );
      } catch (err) {
        console.warn(`PDF export: skipping section "${name}" — slice failed:`, err);
        continue;
      }

      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i];
        const sliceProps = pdf.getImageProperties(slice.image);
        const sliceDrawW = usableWidth;
        const sliceDrawH = (sliceProps.height * sliceDrawW) / sliceProps.width;

        // Add gap before first slice of a section (except the very first section)
        const gapNeeded = i === 0 && !isFirstContentPage ? sectionGap : 0;

        // forceNewPage from a data-pdf-page-break-before marker takes
        // priority over any "fits on current page" check — the marker
        // exists precisely because we WANT a clean page boundary here.
        if (slice.forceNewPage || cursorY + gapNeeded + sliceDrawH > usableHeight) {
          pdf.addPage();
          cursorY = marginTop;
          isFirstContentPage = false;
        } else {
          cursorY += gapNeeded;
        }

        pdf.addImage(slice.image, "PNG", marginSide, cursorY, sliceDrawW, sliceDrawH);
        cursorY += sliceDrawH;
      }

      isFirstContentPage = false;
    }

    // Render the Supporting Evidence appendix as native PDF text (clickable
    // links + perfect pagination, vs the raster image used for the pillar
    // tabs above).
    onProgress?.({ percent: 88, stage: "Rendering appendix…" });
    drawAppendixPdf(pdf, reportData.evidence, {
      marginTop,
      marginSide,
      pageWidth,
      pageHeight,
      usableWidth,
      usableHeight,
    });

    onProgress?.({ percent: 90, stage: "Adding footers…" });

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

    onProgress?.({ percent: 98, stage: "Downloading…" });
    const subsidiary = reportData.subsidiary ?? "ESG";
    const fileName = `${subsidiary}-Report-${reportData.startYear ?? ""}.pdf`;
    pdf.save(fileName);
    onProgress?.({ percent: 100, stage: "Done!" });
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
function drawPngFooter(ctx: CanvasRenderingContext2D, canvasWidth: number, y: number): number {
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
  const { reportData, company, onProgress } = params;
  const { captures, cleanup } = await renderAndCaptureSections(reportData, onProgress);

  try {
    onProgress?.({ percent: 78, stage: "Loading captured images…" });
    // Load all section images to get dimensions. A single bad section must
    // not abort the whole export — log and skip it. PNG export is a single
    // continuous image, so forced page-break markers don't apply here —
    // we just read the .image field from each capture.
    const loadedImages: HTMLImageElement[] = [];
    for (const name of sectionNames) {
      const capture = captures.get(name);
      if (!capture) continue;
      try {
        loadedImages.push(await loadImage(capture.image));
      } catch (err) {
        console.warn(`PNG export: skipping section "${name}":`, err);
      }
    }

    if (loadedImages.length === 0) return;

    const maxWidth = Math.max(...loadedImages.map((img) => img.naturalWidth));
    const sectionsHeight = loadedImages.reduce((sum, img) => sum + img.naturalHeight, 0);

    // Pre-calculate cover page height with a temporary canvas
    const coverPageHeight = 700; // approximate height for cover
    const footerHeight = 60;
    const totalHeight = coverPageHeight + sectionsHeight + footerHeight;

    onProgress?.({ percent: 82, stage: "Stitching image…" });
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

    onProgress?.({ percent: 95, stage: "Downloading…" });
    // Export and download
    const pngDataUrl = finalCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    const subsidiary = reportData.subsidiary ?? "ESG";
    link.download = `${subsidiary}-Report-${reportData.startYear ?? ""}.png`;
    link.href = pngDataUrl;
    link.click();
    onProgress?.({ percent: 100, stage: "Done!" });
  } finally {
    cleanup();
  }
}
