import { NextRequest, NextResponse } from "next/server";
import { getTrendsService } from "@/lib/trends";
import type { ApiResponse, RandomTrendResponse } from "@/types";

/**
 * GET /api/trends/random
 * 002 spec - 랜덤 트렌딩 토픽 1개 반환 ("Got no Clue?" 버튼용)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RandomTrendResponse>>> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const service = getTrendsService();
    const topic = await service.getRandomTopic(category);

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          error: "No trending topics available",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        topic,
        collectedAt: topic.collectedAt,
      },
    });
  } catch (error) {
    console.error("[API /trends/random] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch random trend",
      },
      { status: 500 }
    );
  }
}
