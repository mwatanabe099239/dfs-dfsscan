"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveSearchNavigation } from "@/src/lib/search";

export default function SearchBar() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const result = await resolveSearchNavigation(searchQuery);
      if (result.type !== "none") {
        router.push(result.href);
        setSearchQuery("");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex relative rounded-md w-full md:w-[500px] text-sm">
      <button
        className="absolute left-2 top-2 bottom-2 rounded-lg text-gray-400 flex items-center cursor-pointer disabled:opacity-40"
        onClick={handleSearch}
        disabled={isSearching}
      >
        <FontAwesomeIcon icon={faSearch} />
      </button>
      <input
        type="text"
        placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
        className="w-full text-black bg-gray-100 pl-8 pr-2 py-1 border border-gray-300 outline-none rounded-md"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSearching}
      />
    </div>
  );
}
