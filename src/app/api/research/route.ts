import { NextRequest, NextResponse } from "next/server";
import { getGeminiService } from "@/lib/gemini";
import type { ResearchRequest, ApiResponse, ResearchResult } from "@/types";

/**
 * POST /api/research
 * 001 spec - 주제에 대한 시장 조사 수행
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ResearchResult>>> {
  try {
    const body = await request.json();

    // 요청 검증
    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid query: query is required" },
        { status: 400 }
      );
    }

    const query = body.query.trim();
    if (query.length < 2 || query.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query: must be between 2 and 500 characters",
        },
        { status: 400 }
      );
    }

    const researchRequest: ResearchRequest = {
      query,
      domain: body.domain,
    };

    const service = getGeminiService();
    const result = await service.research(researchRequest);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[API /research] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // 타임아웃 에러 처리
    if (errorMessage.includes("timeout") || errorMessage.includes("abort")) {
      return NextResponse.json(
        {
          success: false,
          error: "Request timeout. Please try again.",
        },
        { status: 504 }
      );
    }

    // Rate limit 에러 처리
    if (errorMessage.includes("rate") || errorMessage.includes("quota")) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform research. Please try again.",
      },
      { status: 500 }
    );
  }
}
