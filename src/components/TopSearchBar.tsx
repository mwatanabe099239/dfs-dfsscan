"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();

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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex relative rounded-md w-full md:w-[500px] text-sm">
      <button
        className="absolute left-2 top-2 bottom-2 rounded-lg text-gray-400 flex items-center cursor-pointer"
        onClick={handleSearch}
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
      />
    </div>
  );
}
