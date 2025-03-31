"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

const MENU_LINKS = [
  { href: "/", label: "Home" },
  { href: "/txs", label: "Transactions" },
  { href: "/tokens", label: "Tokens" },
  { href: "/nfts", label: "NFTs" },
  { href: "/more", label: "More" },
  { href: "/apps", label: "Apps" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getMenuStyle = (path: string) => {
    const isActive = pathname === path;
    return `block px-4 py-2 text-[15px] ${
      isActive ? "text-[#3498db]" : "text-black hover:text-[#3498db]"
    }`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-[0_2px_4px_0_rgba(0,0,0,0.05)] z-10">
      <div className="container mx-auto">
        <div className="flex justify-between h-14 px-4 items-center">
          {/* Left section with Logo */}
          <div className="flex items-center">
            <Link href="/" className="relative h-8 w-32">
              <Image
                src="/logo.png"
                alt="DFS Scan"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Hamburger Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black focus:outline-none"
            >
              ☰
            </button>
          </div>

          {/* Right section with navigation links */}
          <div className="hidden md:flex h-full py-3 items-center text-sm">
            {MENU_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={getMenuStyle(href)}>
                {label}
              </Link>
            ))}
            <span className="text-gray-400 hidden md:inline">|</span>
            <div
              className="pl-4 cursor-pointer"
              onClick={() =>
                window.open("https://dfs-wallet.netlify.app", "_blank")
              }
            >
              <span>MetaFace</span>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden bg-white shadow-lg transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {MENU_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={getMenuStyle(href)}>
              {label}
            </Link>
          ))}
          <div
            className="block px-4 py-2 cursor-pointer"
            onClick={() =>
              window.open("https://dfs-wallet.netlify.app", "_blank")
            }
          >
            <span>MetaFace</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
