"use client";

interface GotNoClueButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function GotNoClueButton({ onClick, isLoading = false }: GotNoClueButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? "Finding..." : "Got no Clue? 🎲"}
    </button>
  );
}
