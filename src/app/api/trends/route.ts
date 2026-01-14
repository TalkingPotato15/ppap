import { NextRequest, NextResponse } from "next/server";
import { getTrendsService } from "@/lib/trends";
import type {
  ApiResponse,
  TrendsListResponse,
  RandomTrendResponse,
} from "@/types";

/**
 * GET /api/trends
 * 002 spec - 전체 트렌딩 토픽 목록 반환
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TrendsListResponse>>> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");

    const service = getTrendsService();
    const topics = await service.getTopics(category, Math.min(limit, 50));

    return NextResponse.json({
      success: true,
      data: {
        topics,
        total: topics.length,
        collectedAt: topics[0]?.collectedAt || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /trends] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trends",
      },
      { status: 500 }
    );
  }
}
