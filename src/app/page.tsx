"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar, GotNoClueButton, LoadingSpinner } from "@/components";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRandomLoading, setIsRandomLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    router.push(`/ideation?q=${encodeURIComponent(query)}`);
  };

  const handleRandomTopic = async () => {
    setIsRandomLoading(true);
    try {
      const res = await fetch("/api/trends/random");
      const data = await res.json();
      if (data.topic) {
        router.push(`/ideation?q=${encodeURIComponent(data.topic)}`);
      }
    } catch (error) {
      console.error("Failed to get random topic:", error);
      setIsRandomLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center pt-[30vh] p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          AI Agent Business Builder
        </h1>
        <p className="text-gray-500">
          Discover AI agent startup ideas based on real market data
        </p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <div className="mt-4">
        <GotNoClueButton onClick={handleRandomTopic} isLoading={isRandomLoading} />
      </div>

      {(isLoading || isRandomLoading) && (
        <div className="mt-8">
          <LoadingSpinner message="Preparing research..." />
        </div>
      )}
    </main>
  );
}
