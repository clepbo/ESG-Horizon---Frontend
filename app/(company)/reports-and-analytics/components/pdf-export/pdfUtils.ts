import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Fetches an image URL and returns it as a base64 data URL.
 * Handles CORS by fetching via blob.
 */
export async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Waits for Recharts SVGs and images to render — AND for their entry
 * animations to finish — inside a container.
 *
 * Two phases:
 *   1. Poll until every chart wrapper has resolved its dimensions
 *      (Recharts' ResponsiveContainer reports width(-1) until ResizeObserver
 *      fires, which crashes the capture step in production builds).
 *   2. Once layout settles, wait for the Recharts entry animation to
 *      complete. By default Recharts animates Pie/Bar/Area in over 1500ms,
 *      so html-to-image was snapshotting mid-animation frames — pies looked
 *      like incomplete arcs and bars were short. We wait the full animation
 *      duration plus a small safety margin so the captured image shows the
 *      final rendered state.
 */
const RECHARTS_ANIMATION_DURATION_MS = 1500;
const ANIMATION_SAFETY_MARGIN_MS = 200;

export function waitForCharts(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    // Hard cap covers worst case: 5s for layout + 1.7s for animation settle
    const deadline = Date.now() + 5000 + RECHARTS_ANIMATION_DURATION_MS + ANIMATION_SAFETY_MARGIN_MS;

    // Force a synchronous layout pass so ResizeObservers fire on mount
    // (offscreen containers don't always trigger them otherwise).
    void container.offsetHeight;

    const allChartsSized = () => {
      const wrappers = container.querySelectorAll(".recharts-wrapper, .recharts-responsive-container");
      if (wrappers.length === 0) return false;
      for (const w of Array.from(wrappers)) {
        const rect = (w as HTMLElement).getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return false;
      }
      // Also require at least one rendered SVG (non-empty)
      const svgs = container.querySelectorAll("svg");
      return svgs.length > 0;
    };

    /** Final settle: wait for animations to finish + 2 frames for paint. */
    const finishWithAnimationSettle = () => {
      setTimeout(() => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve())
        );
      }, RECHARTS_ANIMATION_DURATION_MS + ANIMATION_SAFETY_MARGIN_MS);
    };

    function check() {
      if (allChartsSized()) {
        finishWithAnimationSettle();
      } else if (Date.now() >= deadline) {
        // Hard cap reached — resolve anyway, animations may be incomplete
        requestAnimationFrame(() => resolve());
      } else {
        // Force layout each tick in case the offscreen container isn't being measured
        void container.offsetHeight;
        setTimeout(check, 100);
      }
    }

    // Initial delay for React to mount + first layout pass
    requestAnimationFrame(() => setTimeout(check, 300));
  });
}

/**
 * Captures an HTML element as a PNG data URL. Returns null instead of
 * throwing if the section can't be captured (e.g. tainted canvas, missing
 * font) so a single bad section never aborts the whole export.
 */
export async function captureSection(element: HTMLElement): Promise<string | null> {
  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 1.5,
      filter: (node) => !node.classList?.contains("no-export"),
    });
    // Reject empty/sentinel data URLs ("data:," etc.) — html-to-image can
    // hand these back when an inner element fails to serialise.
    if (!dataUrl || dataUrl.length < 32 || dataUrl === "data:,") return null;
    return dataUrl;
  } catch (err) {
    console.warn("captureSection failed:", err);
    return null;
  }
}

const PLATFORM_ADDRESS = "43 Oghosa Crescent, Off Ihama Road, GRA, Benin City, 300001";

/**
 * Adds a footer with the platform logo to the current page of a jsPDF instance.
 * @param logoDataUrl - Pre-fetched base64 data URL of the ESG Horizon logo (or null).
 */
export function addFooter(
  pdf: jsPDF,
  pageNum: number,
  totalPages: number,
  logoDataUrl: string | null
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Platform address line (small, above the main footer line)
  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  pdf.text(PLATFORM_ADDRESS, pageWidth / 2, pageHeight - 14, { align: "center" });

  const footerY = pageHeight - 8;

  // Logo + "Generated with ESG Horizon" centered together
  const text = "Generated with ESG Horizon";
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);

  if (logoDataUrl) {
    const logoW = 10;
    const logoH = 8;
    const textWidth = pdf.getTextWidth(text);
    const totalWidth = logoW + 2 + textWidth;
    const startX = (pageWidth - totalWidth) / 2;

    try {
      pdf.addImage(logoDataUrl, "PNG", startX, footerY - logoH + 2, logoW, logoH);
    } catch {
      // Skip logo if it fails
    }
    pdf.text(text, startX + logoW + 2, footerY, { align: "left" });
  } else {
    pdf.text(text, pageWidth / 2, footerY, { align: "center" });
  }

  pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 15, footerY, {
    align: "right",
  });
}

/**
 * Given a section image data URL, adds it to the PDF across one or more pages.
 * Returns the number of pages added.
 */
export function addSectionToPDF(
  pdf: jsPDF,
  imageDataUrl: string,
  isFirstSection: boolean
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const footerSpace = 16;
  const usableHeight = pageHeight - margin - footerSpace;
  const usableWidth = pageWidth - margin * 2;

  const imgProps = pdf.getImageProperties(imageDataUrl);
  const imgWidth = usableWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let pagesAdded = 0;
  let heightLeft = imgHeight;

  while (heightLeft > 0) {
    if (!isFirstSection || pagesAdded > 0) {
      pdf.addPage();
    }
    pagesAdded++;

    const drawY = pagesAdded === 1 ? margin : margin - (imgHeight - heightLeft);
    pdf.addImage(
      imageDataUrl,
      "PNG",
      margin,
      drawY,
      imgWidth,
      imgHeight
    );
    heightLeft -= usableHeight;
  }

  return pagesAdded;
}

/**
 * Loads an image from a data URL and returns an HTMLImageElement.
 * Rejects with a real Error so the failure surfaces with a useful message
 * instead of an opaque DOM Event ("Uncaught (in promise) Event").
 */
export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!dataUrl) {
      reject(new Error("loadImage: empty source"));
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`loadImage: failed to decode image (${dataUrl.slice(0, 32)}…)`));
    img.src = dataUrl;
  });
}
