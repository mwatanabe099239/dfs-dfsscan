import type { Metadata } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Toaster } from "react-hot-toast";
import Navbar from "@/src/components/Navbar";
import TopBar from "@/src/components/TopBar";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import SkeletonLoading from "../components/SkeletonLoading";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Footer from "../components/Footer";
config.autoAddCss = false;

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DFS Scan",
  description: "Web3 Education Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body
        className={roboto.className}
        style={{ backgroundColor: "#f6f7f8", color: "#000" }}
      >
        <Suspense fallback={<SkeletonLoading />}>
          <TopBar />
          <Navbar />
          <main className="container mx-auto px-4 pt-8 pb-20">{children}</main>
          <Footer />
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
