"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  description?: string;
}

export default function CodeBlock({
  code,
  language,
  filename,
  description,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-sm font-mono text-gray-700">{filename}</span>
          )}
          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4 text-green-500" />
              <span className="text-green-500">복사됨!</span>
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" />
              <span>복사</span>
            </>
          )}
        </button>
      </div>

      {/* Description */}
      {description && (
        <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700 border-b border-gray-200">
          {description}
        </div>
      )}

      {/* Code */}
      <pre className="p-4 overflow-x-auto bg-gray-900 text-gray-100 text-sm max-h-96">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
