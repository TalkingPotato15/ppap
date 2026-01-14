import { NextResponse } from "next/server";
import { getRandomTrendingTopic } from "@/lib/trends";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topic = await getRandomTrendingTopic();

    if (!topic) {
      return NextResponse.json(
        { error: "No trending topics available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Failed to get random topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending topic" },
      { status: 500 }
    );
  }
}
