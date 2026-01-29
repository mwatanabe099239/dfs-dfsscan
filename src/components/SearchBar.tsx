"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewMode } from "@/src/contexts/ViewModeContext";

export default function SearchBar() {
  const router = useRouter();
  const { viewMode } = useViewMode();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearch = () => {
    if (!searchQuery) return;

    const isToken = searchQuery.startsWith("drc20_0x");
    const isAddress = searchQuery.startsWith("dfs_0x");
    const isTxn = searchQuery.startsWith("dfs_0x") && searchQuery.length === 70;

    if (isToken || isAddress) {
      const href = `/address/${searchQuery}`;
      router.push(href);
    }

    if (isTxn) {
      const href = `/tx/${searchQuery}`;
      router.push(href);
    }

    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (viewMode === "solanascan") {
    return (
      <div className="w-full sm:max-w-[458px]">
        <div className="w-full h-11 relative">
          <div className="flex gap-1 flex-row items-center justify-start flex-wrap bg-white rounded-lg w-full z-20 border border-gray-200 absolute">
            <div className="grid items-center gap-1.5 w-full">
              <div className="relative">
                <input
                  autoComplete="off"
                  type="string"
                  className="flex w-full rounded-lg border border-gray-200 px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#8B8B8B] focus-visible:shadow-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 h-inputMedium text-[14px] h-11 border-none text-gray-700 bg-white focus-visible:shadow-none! pr-[60px]"
                  id="home-search"
                  placeholder="Search transactions, blocks, programs and tokens"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <span className="absolute top-0 right-2 h-full flex items-center text-md">
                  <button
                    className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none inline-flex items-center justify-center font-bold transition-colors text-white bg-[#1F2937] hover:bg-[#111827] disabled:opacity-40 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent text-[12px] leading-4.5 gap-1 w-8 h-8 px-2 py-1 rounded-lg"
                    onClick={handleSearch}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search" aria-hidden="true">
                      <path d="m21 21-4.34-4.34"></path>
                      <circle cx="11" cy="11" r="8"></circle>
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl">
      <div className="flex">
        <button
          className="flex items-center gap-2 px-4 py-3 bg-white border border-r-0 border-gray-300 rounded-l-lg text-gray-600 hover:bg-gray-50"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        >
          All Filters
          <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
        </button>
        <div className="flex-1 relative rounded-lg">
          <input
            type="text"
            placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
            className="w-full text-black bg-white px-4 py-3 border border-gray-300 outline-none rounded-r-lg"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="absolute right-2 top-2 bottom-2 px-2 rounded-lg bg-[#0784c3] hover:bg-blue-600 text-white flex items-center cursor-pointer"
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
          <div className="py-1">
            <button className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
              All Filters
            </button>
            <button className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
              Addresses
            </button>
            <button className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
              Tokens
            </button>
            <button className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
              Name Tags
            </button>
            <button className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
              Labels
            </button>
            <button className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
              Websites
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
