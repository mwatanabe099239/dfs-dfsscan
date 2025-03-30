"use client";

import Image from "next/image";

export default function TopBar() {
  return (
    <div className="bg-white border-b border-gray-200 z-10">
      <div className="container mx-auto">
        <div className="flex justify-between px-8 py-2">
          {/* Left section */}
          <div className="flex items-center">
            <button className="text-xs text-black hover:text-[#0784c3] border border-gray-300 rounded-md p-1">
              DFS WEBNET
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center mt-1">
            <Image
              src="/dfs-logo-black.png"
              alt="DFS Logo"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
