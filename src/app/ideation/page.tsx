"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LoadingSpinner,
  ResearchSummary,
  IdeaCard,
  ResearchData,
  IdeaData,
} from "@/components";

function IdeationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");

  const [stage, setStage] = useState<"research" | "ideation" | "complete">("research");
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      router.push("/");
      return;
    }

    async function runPipeline() {
      try {
        // Stage A: Research
        setStage("research");
        const researchRes = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!researchRes.ok) throw new Error("Research failed");
        const researchData = await researchRes.json();
        setResearch(researchData);

        // Stage B: Ideation
        setStage("ideation");
        const ideationRes = await fetch("/api/ideation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ research: researchData }),
        });

        if (!ideationRes.ok) throw new Error("Ideation failed");
        const ideationData = await ideationRes.json();
        setIdeas(ideationData.ideas);

        setStage("complete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    runPipeline();
  }, [query, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (stage === "research" && !research) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Researching market data with Gemini..." />
      </div>
    );
  }

  if (stage === "ideation" && ideas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Generating AI agent ideas..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Search
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Ideas for: {query}
        </h1>
      </header>

      {research && <ResearchSummary data={research} />}

      {ideas.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            AI Agent Ideas ({ideas.length})
          </h2>
          <div className="grid gap-4">
            {ideas.map((idea, idx) => (
              <IdeaCard key={idea.id} idea={idea} index={idx} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function IdeationPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <IdeationContent />
    </Suspense>
  );
}
