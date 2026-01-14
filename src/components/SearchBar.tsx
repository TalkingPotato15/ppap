"use client";

import { useState, FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Enter a topic or domain to explore...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex items-center border-2 border-gray-200 rounded-full px-6 py-3 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow">
        <svg
          className="w-5 h-5 text-gray-400 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent disabled:opacity-50"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-gray-400 hover:text-gray-600 mr-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex justify-center mt-6 gap-3">
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Researching..." : "Research"}
        </button>
      </div>
    </form>
  );
}
