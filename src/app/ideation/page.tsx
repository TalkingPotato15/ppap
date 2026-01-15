"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LoadingSpinner,
  ResearchSummary,
  IdeaCard,
  ImplementationResources,
  ResearchData,
  IdeaData,
} from "@/components";
import type { ImplementationResources as IResources } from "@/types";

function IdeationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");

  const [stage, setStage] = useState<"research" | "ideation" | "complete">("research");
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Implementation Resources state
  const [resources, setResources] = useState<IResources | null>(null);
  const [generatingIdeaId, setGeneratingIdeaId] = useState<string | null>(null);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

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

  // Handler for generating implementation resources
  const handleGenerateResources = async (ideaId: string) => {
    setGeneratingIdeaId(ideaId);
    setResourcesError(null);

    try {
      const response = await fetch(`/api/ideation/resources/${ideaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate resources");
      }

      const data = await response.json();
      if (data.success && data.data?.resources) {
        setResources(data.data.resources);
      } else {
        throw new Error(data.error || "Invalid response");
      }
    } catch (err) {
      console.error("Resource generation error:", err);
      setResourcesError(
        err instanceof Error ? err.message : "Failed to generate resources"
      );
    } finally {
      setGeneratingIdeaId(null);
    }
  };

  // Close resources modal
  const handleCloseResources = () => {
    setResources(null);
  };

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
        <LoadingSpinner message="Analyzing market trends..." />
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

          {/* Resources Error Message */}
          {resourcesError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{resourcesError}</p>
            </div>
          )}

          <div className="grid gap-4">
            {ideas.map((idea, idx) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={idx}
                onGenerateResources={handleGenerateResources}
                isGeneratingResources={generatingIdeaId === idea.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Implementation Resources Modal */}
      {resources && (
        <ImplementationResources
          resources={resources}
          onClose={handleCloseResources}
        />
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
