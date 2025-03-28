"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

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

  const getMenuStyle = (path: string) => {
    const isActive = pathname === path;
    return `inline-flex items-center px-4 text-[15px] ${
      isActive ? "text-[#3498db]" : "text-black hover:text-[#3498db]"
    }`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-[0_2px_4px_0_rgba(0,0,0,0.05)]">
      <div className="container mx-auto">
        <div className="flex justify-between h-16 px-8">
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

          {/* Right section with navigation links */}
          <div className="flex h-full -mr-4">
            {MENU_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={getMenuStyle(href)}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
