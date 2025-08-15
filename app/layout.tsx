import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

import ClientToaster from "@/app/components/ui/reusables/ClientToaster";
import ReactQueryProvider from "@/app/providers/ReactQueryProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Horizon For ESG Evaluation",
  description: "Your first-step into ESG evaluation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ReactQueryProvider>
          <ClientToaster />
          <AuthProvider>
            {/* <TrackLastPath /> */}
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
