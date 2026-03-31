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
 * Waits for Recharts SVGs and images to render inside a container.
 * Polls for SVG elements up to a deadline instead of a blind 2.5s sleep.
 * Resolves as soon as SVGs are found (or after 1.5s max).
 */
export function waitForCharts(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + 1500;
    function check() {
      const svgs = container.querySelectorAll("svg");
      if (svgs.length > 0 || Date.now() >= deadline) {
        // Give one extra frame for final paint
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(check, 100);
      }
    }
    // Initial delay for React to mount
    requestAnimationFrame(() => setTimeout(check, 200));
  });
}

/**
 * Captures an HTML element as a PNG data URL.
 */
export async function captureSection(element: HTMLElement): Promise<string> {
  return toPng(element, {
    cacheBust: true,
    pixelRatio: 1.5,
    filter: (node) => !node.classList?.contains("no-export"),
  });
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
 */
export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
