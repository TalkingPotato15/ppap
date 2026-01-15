"use client";

export interface IdeaData {
  id: string;
  title: string;
  description: string;
  targetUser: string;
  painPoint: string;
  solution: string;
  agentArchitecture: string;
  agentCapabilities: string[];
  monetization: string;
  mvpScope: string;
}

interface IdeaCardProps {
  idea: IdeaData;
  index: number;
  onGenerateResources?: (ideaId: string) => void;
  isGeneratingResources?: boolean;
}

export default function IdeaCard({
  idea,
  index,
  onGenerateResources,
  isGeneratingResources = false,
}: IdeaCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Idea #{index + 1}
        </span>
        <span className="text-xs text-gray-400">AI Agent</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">{idea.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{idea.description}</p>

      <div className="space-y-3 text-sm">
        <InfoRow label="Target User" value={idea.targetUser} />
        <InfoRow label="Pain Point" value={idea.painPoint} />
        <InfoRow label="Solution" value={idea.solution} />

        <div className="pt-3 border-t border-gray-100">
          <p className="text-gray-500 font-medium mb-1">Agent Architecture</p>
          <p className="text-gray-700">{idea.agentArchitecture}</p>
        </div>

        {idea.agentCapabilities.length > 0 && (
          <div>
            <p className="text-gray-500 font-medium mb-1">Capabilities</p>
            <div className="flex flex-wrap gap-1">
              {idea.agentCapabilities.map((cap, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <InfoRow label="Monetization" value={idea.monetization} />
          <InfoRow label="MVP Scope" value={idea.mvpScope} />
        </div>
      </div>

      {/* Generate Resources Button */}
      {onGenerateResources && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onGenerateResources(idea.id)}
            disabled={isGeneratingResources}
            className={`
              w-full py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${
                isGeneratingResources
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {isGeneratingResources ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating Resources...
              </span>
            ) : (
              "Generate Implementation Resources"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500">{label}:</span>{" "}
      <span className="text-gray-700">{value}</span>
    </div>
  );
}
