"use client";

import Image from "next/image";
import TopSearchBar from "./TopSearchBar";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const currentPath = usePathname();
  const isHome = currentPath === "/";

  return (
    <div
      className={`bg-white border-b border-gray-200 z-10 ${
        isHome ? "md:block hidden" : "block"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex md:justify-between justify-center items-center px-4 py-2">
          {/* Left section */}
          <div className="md:block hidden">
            {isHome ? (
              <button className="text-xs text-black hover:text-[#0784c3] border border-gray-300 rounded-md p-1">
                DFS WEBNET
              </button>
            ) : (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-600">
                  DFS Price:{" "}
                  <span className="text-[#0784c3]">$77.7</span>
                </span>
                <span className="text-gray-600">
                  Gas: <span className="text-[#0784c3]">1 DFS</span>
                </span>
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 md:w-auto w-full">
            {isHome ? <></> : <TopSearchBar />}
            <Image
              src="/dfs-logo-black.png"
              alt="DFS Logo"
              className="mt-1 md:block hidden"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
