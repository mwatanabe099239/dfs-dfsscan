import type { Metadata } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Toaster } from "react-hot-toast";
import Navbar from "@/src/components/Navbar";
import ConditionalTopBar from "@/src/components/ConditionalTopBar";
import ConditionalMain from "@/src/components/ConditionalMain";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import SkeletonLoading from "@/src/components/SkeletonLoading";
import ReactQueryProvider from "@/src/providers/react-query-provider";
import { ViewModeProvider } from "@/src/contexts/ViewModeContext";
import ViewModeWrapper from "@/src/components/ViewModeWrapper";
import Footer from "@/src/components/Footer";
import "./globals.scss";
import "@fortawesome/fontawesome-svg-core/styles.css";
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
        style={{
          color: "#000",
          backgroundImage:
            "linear-gradient(#f6f7f8 30%, rgba(255, 255, 255, 0) 80%)",
        }}
      >
        <Suspense fallback={<SkeletonLoading />}>
          <ReactQueryProvider>
            <ViewModeProvider>
              <ViewModeWrapper>
                <ConditionalTopBar />
                <Navbar />
                <ConditionalMain>{children}</ConditionalMain>
                <Footer />
                <Toaster />
              </ViewModeWrapper>
            </ViewModeProvider>
          </ReactQueryProvider>
        </Suspense>
      </body>
    </html>
  );
}
