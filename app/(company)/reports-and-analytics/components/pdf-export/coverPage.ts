import jsPDF from "jspdf";
import { fetchImageAsDataUrl } from "./pdfUtils";

/** Path to the ESG Horizon platform logo in /public */
const PLATFORM_LOGO_PATH = "/logo-new.png";
const PLATFORM_ADDRESS = "43 Oghosa Crescent, Off Ihama Road, GRA, Benin City, 300001";
const PLATFORM_EMAIL = "support@esghorizon.africa";

export interface CoverPageData {
  companyName: string;
  companyLogoUrl: string | null;
  companyAddress: string;
  companyCountry: string;
  subsidiary: string;
  reportingPeriod: string;
  status: string;
}

/**
 * Draws a cover page on the first page of the PDF.
 */
export async function drawCoverPage(pdf: jsPDF, data: CoverPageData) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // Background accent bar at top
  pdf.setFillColor(15, 76, 129);
  pdf.rect(0, 0, pageWidth, 6, "F");

  let y = 30;

  // ESG Horizon platform logo
  try {
    const platformLogoDataUrl = await fetchImageAsDataUrl(
      `${window.location.origin}${PLATFORM_LOGO_PATH}`
    );
    if (platformLogoDataUrl) {
      const logoW = 50;
      const logoH = 40;
      pdf.addImage(platformLogoDataUrl, "PNG", centerX - logoW / 2, y, logoW, logoH);
      y += logoH + 8;
    }
  } catch {
    // Skip platform logo if it fails
  }

  // Report title
  pdf.setFontSize(22);
  pdf.setTextColor(15, 76, 129);
  pdf.setFont("helvetica", "bold");
  pdf.text("ESG Performance Report", centerX, y, { align: "center" });
  y += 8;

  // Platform address
  pdf.setFontSize(9);
  pdf.setTextColor(130, 130, 130);
  pdf.setFont("helvetica", "normal");
  pdf.text(PLATFORM_ADDRESS, centerX, y, { align: "center" });
  y += 5;
  pdf.text(PLATFORM_EMAIL, centerX, y, { align: "center" });
  y += 12;

  // Divider
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(40, y, pageWidth - 40, y);
  y += 20;

  // Company logo (if available)
  if (data.companyLogoUrl) {
    try {
      const companyLogoDataUrl = await fetchImageAsDataUrl(data.companyLogoUrl);
      if (companyLogoDataUrl) {
        const logoSize = 30;
        pdf.addImage(companyLogoDataUrl, "PNG", centerX - logoSize / 2, y, logoSize, logoSize);
        y += logoSize + 8;
      }
    } catch {
      // Skip company logo if it fails
    }
  }

  // Company name
  pdf.setFontSize(24);
  pdf.setTextColor(30, 30, 30);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.companyName || "Company", centerX, y, { align: "center" });
  y += 10;

  // Address & Country (dotted placeholder if empty)
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont("helvetica", "normal");
  if (data.companyAddress || data.companyCountry) {
    const addressLine = [data.companyAddress, data.companyCountry].filter(Boolean).join(", ");
    pdf.text(addressLine, centerX, y, { align: "center" });
  } else {
    pdf.text("Address: .............................................", centerX, y, {
      align: "center",
    });
  }
  y += 10;

  y += 10;

  // Subsidiary
  if (data.subsidiary) {
    pdf.setFontSize(14);
    pdf.setTextColor(80, 80, 80);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Subsidiary: ${data.subsidiary}`, centerX, y, { align: "center" });
    y += 10;
  }

  // Reporting period
  pdf.setFontSize(13);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Reporting Period: ${data.reportingPeriod}`, centerX, y, { align: "center" });
  y += 10;

  // Status
  if (data.status) {
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Status: ${data.status}`, centerX, y, { align: "center" });
  }

  // Generation date near bottom
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  pdf.setFontSize(10);
  pdf.setTextColor(140, 140, 140);
  pdf.text(`Generated on ${today}`, centerX, pageHeight - 36, { align: "center" });

  // Platform info at bottom
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`ESG Horizon  |  ${PLATFORM_ADDRESS}`, centerX, pageHeight - 28, { align: "center" });
  pdf.text(PLATFORM_EMAIL, centerX, pageHeight - 24, { align: "center" });

  // Footer bar
  pdf.setFillColor(15, 76, 129);
  pdf.rect(0, pageHeight - 6, pageWidth, 6, "F");

  // Footer text
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text("Generated with ESG Horizon", centerX, pageHeight - 10, { align: "center" });
}
