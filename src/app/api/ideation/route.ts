import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/agent-b";
import { ResearchData } from "@/components";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { research } = body as { research: ResearchData };

    if (!research || !research.query) {
      return NextResponse.json(
        { error: "Research data is required" },
        { status: 400 }
      );
    }

    const ideas = await generateIdeas(research);
    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("Ideation error:", error);
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
