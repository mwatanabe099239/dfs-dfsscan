"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumn = {
  id: string;
  title: string;
  items: FooterLink[];
};

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
];

const getDfsChainUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_DFSCHAIN_BASEURL || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}${cleanPath}` : cleanPath;
};

const isAbsolute = (href: string) =>
  href.startsWith("http://") || href.startsWith("https://");

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.83 8.723c-.138.625-.497.778-1.007.485l-2.78-2.048-1.342 1.29c-.148.148-.272.272-.558.272l.199-2.82 5.16-4.66c.225-.2-.05-.31-.348-.11l-6.375 4.015-2.75-.857c-.6-.187-.616-.6.113-.89l10.72-4.135c.5-.19.937.112.773.69z" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const GlobeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" focusable="false" className={className} aria-hidden>
    <path
      d="M 12 21.996094 C 10.601562 21.996094 9.292969 21.734375 8.074219 21.210938 C 6.859375 20.683594 5.800781 19.972656 4.902344 19.074219 C 4 18.171875 3.292969 17.109375 2.777344 15.886719 C 2.257812 14.660156 2 13.347656 2 11.949219 C 2 10.546875 2.257812 9.242188 2.777344 8.035156 C 3.292969 6.828125 4 5.773438 4.902344 4.875 C 5.800781 3.972656 6.859375 3.269531 8.074219 2.761719 C 9.292969 2.253906 10.601562 1.996094 12 1.996094 C 13.402344 1.996094 14.710938 2.253906 15.925781 2.761719 C 17.144531 3.269531 18.199219 3.972656 19.101562 4.875 C 20 5.773438 20.710938 6.828125 21.226562 8.035156 C 21.742188 9.242188 22 10.546875 22 11.949219 C 22 13.347656 21.742188 14.660156 21.226562 15.886719 C 20.710938 17.109375 20 18.171875 19.101562 19.074219 C 18.199219 19.972656 17.144531 20.683594 15.925781 21.210938 C 14.710938 21.734375 13.402344 21.996094 12 21.996094 Z M 12 20.546875 C 12.585938 19.949219 13.070312 19.261719 13.464844 18.484375 C 13.855469 17.710938 14.175781 16.789062 14.425781 15.722656 L 9.601562 15.722656 C 9.835938 16.722656 10.148438 17.625 10.539062 18.421875 C 10.929688 19.222656 11.417969 19.929688 12 20.546875 Z M 9.875 20.25 C 9.460938 19.613281 9.101562 18.929688 8.800781 18.199219 C 8.5 17.464844 8.25 16.640625 8.050781 15.722656 L 4.300781 15.722656 C 4.933594 16.90625 5.667969 17.835938 6.5 18.511719 C 7.335938 19.183594 8.460938 19.765625 9.875 20.25 Z M 14.152344 20.222656 C 15.351562 19.839844 16.429688 19.265625 17.386719 18.5 C 18.347656 17.730469 19.117188 16.804688 19.699219 15.722656 L 15.976562 15.722656 C 15.757812 16.625 15.503906 17.441406 15.214844 18.171875 C 14.921875 18.90625 14.566406 19.589844 14.152344 20.222656 Z M 3.800781 14.222656 L 7.777344 14.222656 C 7.726562 13.773438 7.695312 13.367188 7.6875 13.011719 C 7.679688 12.652344 7.675781 12.296875 7.675781 11.949219 C 7.675781 11.53125 7.683594 11.160156 7.699219 10.835938 C 7.71875 10.511719 7.75 10.148438 7.800781 9.75 L 3.800781 9.75 C 3.683594 10.148438 3.605469 10.507812 3.5625 10.824219 C 3.523438 11.140625 3.5 11.515625 3.5 11.949219 C 3.5 12.382812 3.523438 12.769531 3.5625 13.109375 C 3.605469 13.453125 3.683594 13.824219 3.800781 14.222656 Z M 9.324219 14.222656 L 14.699219 14.222656 C 14.769531 13.707031 14.808594 13.285156 14.824219 12.960938 C 14.84375 12.636719 14.851562 12.296875 14.851562 11.949219 C 14.851562 11.613281 14.84375 11.292969 14.824219 10.984375 C 14.808594 10.675781 14.769531 10.265625 14.699219 9.75 L 9.324219 9.75 C 9.257812 10.265625 9.21875 10.675781 9.199219 10.984375 C 9.183594 11.292969 9.175781 11.613281 9.175781 11.949219 C 9.175781 12.296875 9.183594 12.636719 9.199219 12.960938 C 9.21875 13.285156 9.257812 13.707031 9.324219 14.222656 Z M 16.199219 14.222656 L 20.199219 14.222656 C 20.316406 13.824219 20.398438 13.453125 20.4375 13.109375 C 20.480469 12.769531 20.5 12.382812 20.5 11.949219 C 20.5 11.515625 20.480469 11.140625 20.4375 10.824219 C 20.398438 10.507812 20.316406 10.148438 20.199219 9.75 L 16.226562 9.75 C 16.277344 10.332031 16.308594 10.777344 16.324219 11.085938 C 16.34375 11.394531 16.351562 11.679688 16.351562 11.949219 C 16.351562 12.316406 16.339844 12.660156 16.3125 12.984375 C 16.289062 13.3125 16.25 13.722656 16.199219 14.222656 Z M 15.949219 8.25 L 19.699219 8.25 C 19.152344 7.097656 18.398438 6.140625 17.4375 5.371094 C 16.480469 4.605469 15.375 4.066406 14.125 3.75 C 14.542969 4.363281 14.898438 5.03125 15.1875 5.746094 C 15.480469 6.464844 15.734375 7.296875 15.949219 8.25 Z M 9.601562 8.25 L 14.449219 8.25 C 14.269531 7.363281 13.960938 6.511719 13.527344 5.6875 C 13.09375 4.859375 12.585938 4.132812 12 3.496094 C 11.46875 3.949219 11.019531 4.539062 10.652344 5.273438 C 10.285156 6.007812 9.933594 7 9.601562 8.25 Z M 4.300781 8.25 L 8.074219 8.25 C 8.257812 7.347656 8.492188 6.542969 8.777344 5.835938 C 9.058594 5.128906 9.417969 4.441406 9.851562 3.773438 C 8.601562 4.089844 7.507812 4.621094 6.574219 5.371094 C 5.644531 6.121094 4.882812 7.082031 4.300781 8.25 Z M 4.300781 8.25 "
      fill="currentColor"
    />
  </svg>
);

const SOCIAL_LINKS = [
  { name: "X", href: "https://x.com/difines_ofc", icon: TwitterIcon },
  { name: "Telegram", href: "https://t.me/DFSChain", icon: TelegramIcon },
  { name: "Discord", href: "#", icon: DiscordIcon },
  { name: "YouTube", href: "#", icon: YouTubeIcon },
];

const LINK_COLUMNS: FooterColumn[] = [
  {
    id: "dfsChain",
    title: "DFS Chain",
    items: [
      {
        label: "Make Wallet",
        href: process.env.NEXT_PUBLIC_METAFACE_BASEURL || "https://metaface.dfsscan.com/get-started",
        external: true,
      },
      {
        label: "Get Token",
        href: process.env.NEXT_PUBLIC_WEX_BASEURL || "https://wexswap.com",
        external: true,
      },
      {
        label: "Explore DApps",
        href: getDfsChainUrl("/explore-dapps"),
        external: true,
      },
    ],
  },
  {
    id: "about",
    title: "About",
    items: [
      { label: "Blog", href: getDfsChainUrl("/blog"), external: true },
      { label: "Whitepaper", href: getDfsChainUrl("/whitepaper"), external: true },
      { label: "FAQ", href: getDfsChainUrl("/academy/qa"), external: true },
      {
        label: "Privacy Policy",
        href: getDfsChainUrl("/whitepaper#privacy-policy"),
        external: true,
      },
      {
        label: "Terms of Use",
        href: getDfsChainUrl("/whitepaper#terms-of-use"),
        external: true,
      },
    ],
  },
  {
    id: "academy",
    title: "Academy",
    items: [
      { label: "DFS Academy", href: getDfsChainUrl("/academy"), external: true },
      { label: "DIFINES AI", href: getDfsChainUrl("/ai"), external: true },
    ],
  },
];

function FooterAnchor({ item, className }: { item: FooterLink; className?: string }) {
  const external = item.external || isAbsolute(item.href);
  if (external) {
    return (
      <a
        href={item.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

function LanguageSwitcher({
  language,
  onChange,
  size = "desktop",
}: {
  language: string;
  onChange: (code: string) => void;
  size?: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`w-full flex items-center justify-between gap-1 rounded-lg transition-colors ${
          size === "desktop"
            ? "px-3 py-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
            : "px-3 py-2.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <GlobeIcon className={size === "desktop" ? "w-4 h-4" : "w-4 h-4"} />
          <span>{current.nativeName}</span>
        </div>
        <ChevronDown
          className={`${size === "desktop" ? "w-3 h-3" : "w-4 h-4"} transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute top-full mt-2 left-0 w-full rounded-lg shadow-lg border overflow-hidden z-50 bg-white border-gray-200">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`w-full px-4 text-left text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
                size === "desktop" ? "py-2" : "py-2.5"
              } ${
                language === lang.code
                  ? "bg-[#21f201] text-black"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="font-medium flex-shrink-0">{lang.nativeName}</span>
              <span
                className={`text-xs flex-shrink-0 ${
                  language === lang.code ? "text-black/60" : "text-gray-400"
                }`}
              >
                ({lang.name})
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LogoBlock({ size }: { size: "desktop" | "mobile" }) {
  return (
    <div>
      <p className="text-xs mb-2 text-gray-500">Managed by</p>
      <Image
        src="/logo.png"
        alt="DFS Scan Logo"
        width={128}
        height={40}
        className={size === "desktop" ? "md:w-32 w-24 h-auto" : "w-24 h-auto"}
        priority={false}
      />
    </div>
  );
}

export default function Footer() {
  const [open, setOpen] = useState<number | null>(null);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("language");
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setLanguage(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const changeLanguage = (code: string) => {
    setLanguage(code);
    try {
      localStorage.setItem("language", code);
    } catch {
      // ignore
    }
  };

  const toggle = (section: number) => {
    setOpen(open === section ? null : section);
  };

  const academyColumn = LINK_COLUMNS.find((c) => c.id === "academy");

  return (
    <footer className="pt-10 pb-6 text-sm relative bg-white text-gray-900 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Desktop */}
        <div className="hidden md:flex flex-row pb-8 justify-between">
          <div className="flex flex-col gap-2 flex-shrink-0">
            <LogoBlock size="desktop" />
            <div className="text-xs text-gray-500">
              <p>© 2026 DIFINES. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:text-gray-900"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {LINK_COLUMNS.filter((column) => column.id !== "academy").map(
            (column, colIdx) => (
              <div
                key={column.id}
                className={`min-w-[160px] ${colIdx === 0 ? "ml-12" : "ml-6"}`}
              >
                <h4 className="font-bold mb-4 text-gray-900">{column.title}</h4>
                <ul className="space-y-2 text-gray-600">
                  {column.items.map((item) => (
                    <li key={item.label} className="hover:underline cursor-pointer text-xs">
                      <FooterAnchor item={item} className="block" />
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}

          <div className="min-w-[160px] ml-6">
            <h4 className="font-bold mb-4 text-gray-900">Language</h4>
            <LanguageSwitcher language={language} onChange={changeLanguage} />

            {academyColumn ? (
              <div className="mt-6">
                <h4 className="font-bold mb-4 text-gray-900">{academyColumn.title}</h4>
                <ul className="space-y-2 text-gray-600">
                  {academyColumn.items.map((item) => (
                    <li key={item.label} className="hover:underline cursor-pointer text-xs">
                      <FooterAnchor item={item} className="block" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-6">
          <div className="flex flex-col gap-4 pb-4 border-b border-gray-300">
            <LogoBlock size="mobile" />
            <div className="text-xs text-gray-500">
              <p>© 2026 DIFINES. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:text-gray-900"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {LINK_COLUMNS.map((column, colIdx) => (
              <div key={column.id}>
                <button
                  type="button"
                  onClick={() => toggle(colIdx)}
                  className="w-full flex justify-between items-center font-bold py-3 border-b border-gray-300"
                >
                  <span className="text-sm">{column.title}</span>
                  <span className="text-xs">{open === colIdx ? "▲" : "▼"}</span>
                </button>
                <ul
                  className={`pt-3 space-y-2 overflow-hidden transition-all duration-500 ease-in-out text-gray-600 ${
                    open === colIdx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {column.items.map((item) => (
                    <li key={item.label} className="hover:underline cursor-pointer text-sm py-1">
                      <FooterAnchor item={item} className="block" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-300">
            <h4 className="font-bold mb-3 text-sm text-gray-900">Language</h4>
            <LanguageSwitcher
              language={language}
              onChange={changeLanguage}
              size="mobile"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
