import { NextRequest, NextResponse } from "next/server";
import { performDeepResearch } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const research = await performDeepResearch(query);
    return NextResponse.json(research);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform research" },
      { status: 500 }
    );
  }
}
