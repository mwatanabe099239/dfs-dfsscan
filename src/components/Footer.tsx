"use client";

import Link from "next/link";
import Image from "next/image";

interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

const FOOTER_SECTIONS = {
  company: {
    title: "Company",
    links: [
      {
        label: "Delegate to BscScan Staking",
        href: "/#",
        isExternal: false,
      },
      { label: "Brand Assets", href: "/#", isExternal: false },
      { label: "Contact Us", href: "/#", isExternal: false },
      { label: "Terms & Privacy", href: "/#", isExternal: false },
      { label: "Bug Bounty", href: "/#", isExternal: true },
    ],
  },
  community: {
    title: "Community",
    links: [
      { label: "API Documentation", href: "/#", isExternal: false },
      { label: "Knowledge Base", href: "/#", isExternal: false },
      { label: "Network Status", href: "/#", isExternal: false },
      { label: "Learn DFS", href: "/#", isExternal: true },
    ],
  },
  products: {
    title: "Products & Services",
    links: [
      { label: "Advertise", href: "/#", isExternal: true },
      {
        label: "Explorer as a Service (EaaS)",
        href: "/#",
        isExternal: true,
      },
      { label: "API Plans", href: "/#", isExternal: true },
      { label: "Priority Support", href: "/#", isExternal: false },
      { label: "Blockscan", href: "/#", isExternal: true },
    ],
  },
};

const FooterLinkComponent = ({ link }: { link: FooterLink }) => (
  <Link
    href={link.href}
    className="hover:text-[#0784c3] text-[#081d35] text-sm flex items-center gap-1 font-thin"
    target={link.isExternal ? "_blank" : "_self"}
    rel={link.isExternal ? "noopener noreferrer" : ""}
  >
    {link.label}
    {link.isExternal && (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    )}
  </Link>
);

const FooterSection = ({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) => (
  <div className="space-y-4 col-span-2">
    <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
    <div className="flex flex-col space-y-2">
      {links.map((link) => (
        <FooterLinkComponent key={link.label} link={link} />
      ))}
    </div>
  </div>
);

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa]">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-8 py-8">
          {/* Logo and Description Section */}
          <div className="space-y-4 md:col-span-3 col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/dfs-logo-black.png"
                alt="DFS Logo"
                width={32}
                height={32}
                className="w-8 h-auto"
              />
              <span className="font-medium">Powered by DIFINES</span>
            </div>
            <p className="text-sm text-black font-thin">
              Dfs Scan is a block explorer and analytics platform for
              DfsWebChain (centralized) and the upcoming DfsChain
              (decentralized).
            </p>
            <button className="flex items-center gap-2 text-sm text-black hover:text-[#0784c3] bg-gray-200 px-2 py-1 rounded-md cursor-pointer">
              <Image
                src="/images/face-logo.png"
                alt="Meta Logo"
                width={24}
                height={24}
                className="w-6 h-auto"
              />
              Meta Face
            </button>
          </div>

          {/* Menu Sections */}
          {Object.entries(FOOTER_SECTIONS).map(([key, section]) => (
            <FooterSection
              key={key}
              title={section.title}
              links={section.links}
            />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center py-4 border-t border-gray-200 text-sm text-black font-thin">
          <div className="flex items-center gap-2">
            <span>Dfs Scan © 2025 (DFS-D) </span>
            <span>|</span>
            <div className="flex items-center gap-1">
              <span>👨‍👦‍👦Built by team</span>
              <Link
                href="https://difines.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0784c3] hover:text-blue-700 flex items-center gap-1"
              >
                DIFINES
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>Donations:</span>
            <Link
              href="https://etherscan.io/address/0x71c765...d8976f"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0784c3] hover:text-blue-700"
            >
              0x71c765...d8976f
            </Link>
            <span className="text-red-500">❤</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
