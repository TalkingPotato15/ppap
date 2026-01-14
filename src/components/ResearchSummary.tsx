"use client";

export interface ResearchData {
  query: string;
  trends: string[];
  problems: string[];
  opportunities: string[];
  sources: { title: string; url: string }[];
}

interface ResearchSummaryProps {
  data: ResearchData;
}

export default function ResearchSummary({ data }: ResearchSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Market Research: {data.query}
      </h2>

      <div className="space-y-4">
        {data.trends.length > 0 && (
          <Section title="Market Trends" items={data.trends} icon="📈" />
        )}
        {data.problems.length > 0 && (
          <Section title="Pain Points" items={data.problems} icon="🔥" />
        )}
        {data.opportunities.length > 0 && (
          <Section title="Opportunities" items={data.opportunities} icon="💡" />
        )}
      </div>

      {data.sources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Sources</h3>
          <ul className="space-y-1">
            {data.sources.map((source, idx) => (
              <li key={idx}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">
        {icon} {title}
      </h3>
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-gray-700 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
