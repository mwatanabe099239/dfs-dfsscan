"use client";

import Link from "next/link";
import Image from "next/image";

interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

// Helper function to build URLs using DFSCHAIN_BASEURL
const getDfsChainUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_DFSCHAIN_BASEURL || "";
  // Remove trailing slash from baseUrl if present, and ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
};

const DFS_CHAIN_LINKS = [
  { label: "Make Wallet", href: process.env.NEXT_PUBLIC_METAFACE_BASEURL || "#", isExternal: true },
  { label: "Get Token", href: process.env.NEXT_PUBLIC_WEX_BASEURL || "#", isExternal: true },
  { label: "Explore DApps", href: getDfsChainUrl("/explore-dapps"), isExternal: true },
];

const ACADEMY_LINKS = [
  { label: "DFS Academy", href: getDfsChainUrl("/academy"), isExternal: true },
  { label: "DIFINES AI", href: getDfsChainUrl("/ai"), isExternal: true },
];

const ABOUT_LINKS = [
  { label: "Blog", href: getDfsChainUrl("/blog"), isExternal: true },
  { label: "Whitepaper", href: getDfsChainUrl("/whitepaper"), isExternal: true },
  { label: "FAQ", href: getDfsChainUrl("/whitepaper/#faq"), isExternal: true },
  { label: "Privacy Policy", href: getDfsChainUrl("/whitepaper/#privacy-policy"), isExternal: true },
  { label: "Terms of Use", href: getDfsChainUrl("/whitepaper/#terms-of-use"), isExternal: true },
];

// Social Media Icon Components
const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.83 8.723c-.138.625-.497.778-1.007.485l-2.78-2.048-1.342 1.29c-.148.148-.272.272-.558.272l.199-2.82 5.16-4.66c.225-.2-.05-.31-.348-.11l-6.375 4.015-2.75-.857c-.6-.187-.616-.6.113-.89l10.72-4.135c.5-.19.937.112.773.69z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SOCIAL_LINKS = [
  { name: "Twitter", href: "https://x.com/difines_ofc", icon: TwitterIcon },
  { name: "Telegram", href: "https://t.me/DFSChain", icon: TelegramIcon },
  { name: "Discord", href: "#", icon: DiscordIcon },
  { name: "YouTube", href: "#", icon: YouTubeIcon },
];

const FooterLinkComponent = ({ link }: { link: FooterLink }) => (
  <Link
    href={link.href}
    className="hover:text-gray-900 hover:underline text-gray-600 text-xs font-normal transition-colors"
    target={link.isExternal ? "_blank" : "_self"}
    rel={link.isExternal ? "noopener noreferrer" : ""}
  >
    {link.label}
  </Link>
);


export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa]">
      <div className="w-full py-8 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
          {/* Left Section - Logo, Copyright, Social Icons */}
          <div className="space-y-4 md:mr-36">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-normal">Managed by</p>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="DFS Scan Logo"
                  width={100}
                  height={100}
                  className="w-32 h-auto"
                />
              </div>
              <p className="text-xs text-gray-600 font-normal">
                © 2026 DIFINES. All rights reserved.
              </p>
            </div>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:text-gray-900"
                    aria-label={social.name}
                  >
                    <IconComponent />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Middle Section - DFS Chain Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-base">DFS Scan</h4>
            <div className="flex flex-col space-y-2">
              {DFS_CHAIN_LINKS.map((link, index) => (
                <FooterLinkComponent key={index} link={link} />
              ))}
            </div>
          </div>

          {/* About Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-base">About</h4>
            <div className="flex flex-col space-y-2">
              {ABOUT_LINKS.map((link, index) => (
                <FooterLinkComponent key={index} link={link} />
              ))}
            </div>
          </div>

          {/* Academy Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-base">Academy</h4>
            <div className="flex flex-col space-y-2">
              {ACADEMY_LINKS.map((link, index) => (
                <FooterLinkComponent key={index} link={link} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
