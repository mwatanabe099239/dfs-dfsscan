"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();

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
