"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useViewMode } from "@/src/contexts/ViewModeContext";
import ViewModeToggle from "./ViewModeToggle";
import { useDfsTokenPrice } from "../hooks/useDfsTokenPrice";
import { RowSkeleton } from "./common/ItemSkeleton";
import { formatNumber } from "../lib/utils";

const MENU_LINKS = [
  { href: "/", label: "Home" },
  { href: "/txs", label: "Transactions" },
  { href: "/coming-soon", label: "Tokens" },
  { href: "/coming-soon", label: "NFTs" },
  { href: "/coming-soon", label: "More" },
  { href: "/coming-soon", label: "Apps" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { viewMode } = useViewMode();
  const { data, loading } = useDfsTokenPrice();
  const isHomePage = pathname === "/";

  const getMenuStyle = (path: string) => {
    const isActive = pathname === path;
    if (viewMode === "solanascan") {
      return `block px-4 py-2 text-[15px] ${
        isActive ? (isHomePage ? "text-white" : "text-gray-600") : (isHomePage ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-[#3498db]")
      }`;
    }
    return `block px-4 py-2 text-[15px] ${
      isActive ? "text-[#3498db]" : "text-black hover:text-[#3498db]"
    }`;
  };

  return (
    <nav className={`${viewMode === "solanascan" && isHomePage ? "bg-transparent" : "bg-white border-gray-200 border-b"} ${viewMode === "solanascan" ? "" : "shadow-[0_2px_4px_0_rgba(0,0,0,0.05)]"} relative z-10`}>
      <div className="container mx-auto">
        <div className="flex justify-between h-14 px-4 items-center">
          {/* Left section with Logo and Price/Gas (SolanaScan) */}
          <div className="flex items-center gap-4">
            <Link href="/" className="relative h-8 w-32">
              <Image
                src={viewMode === "solanascan" && isHomePage ? "/dfs-logo-white.png" : "/logo.png"}
                alt="DFS Scan"
                fill
                className="object-contain"
                priority
              />
            </Link>
            {viewMode === "solanascan" && (
              <div className="hidden md:flex items-center gap-3 text-xs">
                <div
                  className="flex items-center gap-3 p-2 rounded-md"
                  style={{
                    backgroundColor: isHomePage ? "#ffffff33" : "#e0e0e088"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-white p-0.5">
                      <Image
                        src="/dfs-logo.png"
                        alt="DFS"
                        width={16}
                        height={16}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className={`${isHomePage ? "text-white" : "text-gray-600"}`}>
                      {loading ? (
                        <RowSkeleton className="h-3 w-16" />
                      ) : (
                        `$${formatNumber(data.priceData?.priceUsd || 0, 4)}`
                      )}
                    </span>
                    <span className={`${
                      (data.priceData?.priceChange?.h24 || 0) >= 0 ? "text-green-600" : "text-red-400"
                    }`}>
                      {loading ? (
                        <RowSkeleton className="h-3 w-12" />
                      ) : (
                        `${(data.priceData?.priceChange?.h24 || 0) >= 0 ? "+" : ""}${formatNumber(data.priceData?.priceChange?.h24 || 0, 2)}%`
                      )}
                    </span>
                  </div>
                  <div className={`h-4 w-px ${isHomePage ? "bg-white" : "bg-gray-300"}`}></div>
                  <span className={`${isHomePage ? "text-white" : "text-gray-600"} flex items-center gap-1`}>
                    Avg Fee:{" "}
                    <span className={`${isHomePage ? "text-blue-300" : "text-blue-600"}`}>
                      {loading ? (
                        <RowSkeleton className="h-3 w-20" />
                      ) : (
                        formatNumber(data.baseFee || 0, 8)
                      )}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={viewMode === "solanascan" ? "text-gray-300 focus:outline-none" : "text-black focus:outline-none"}
            >
              ☰
            </button>
          </div>

          {/* Right section with navigation links */}
          <div className="hidden md:flex h-full py-3 items-center text-sm">
            {MENU_LINKS.map(({ href, label }, index) => (
              <Link key={index} href={href} className={getMenuStyle(href)}>
                {label}
              </Link>
            ))}
            <span className={`${viewMode === "solanascan" && isHomePage ? "text-gray-300" : "text-gray-600"} hidden md:inline`}>|</span>
            <div
              className={`pl-4 cursor-pointer ${viewMode === "solanascan" && isHomePage ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-[#3498db]"}`}
              onClick={() => window.open("https://metaface.dfsscan.com", "_blank")}
            >
              <span>MetaFace</span>
            </div>
            <div className="pl-4">
              <ViewModeToggle compact={true} />
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden ${viewMode === "solanascan" ? "bg-black" : "bg-white"} shadow-lg transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {MENU_LINKS.map(({ href, label }, index) => (
            <Link key={index} href={href} className={getMenuStyle(href)}>
              {label}
            </Link>
          ))}
          <div
            className={`block px-4 py-2 cursor-pointer ${viewMode === "solanascan" ? "text-gray-300 hover:text-white" : ""}`}
            onClick={() =>
              window.open("https://metaface.dfsscan.com", "_blank")
            }
          >
            <span>MetaFace</span>
          </div>
          <div className="px-4 py-2">
            <ViewModeToggle compact={true} />
          </div>
        </div>
      </div>
    </nav>
  );
}
