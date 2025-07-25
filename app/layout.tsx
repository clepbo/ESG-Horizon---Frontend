import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";

import ClientToaster from "@/Components/ClientToaster";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ESG Horizon",
  description: "Enabling Transformation, Innovation and Sustainable Growth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ClientToaster />
        {children}
      </body>
    </html>
  );
}
