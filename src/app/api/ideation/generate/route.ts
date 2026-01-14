import { NextRequest, NextResponse } from "next/server";
import { getIdeationService } from "@/lib/ideation";
import type { IdeaGenerationRequest, ApiResponse, GenerateIdeasResponse } from "@/types";

/**
 * POST /api/ideation/generate
 * US-001: AI 에이전트 아이디어 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as IdeaGenerationRequest;

    // 필수 필드 검증
    if (!body.researchResult) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "researchResult is required" },
        { status: 400 }
      );
    }

    if (!body.originalQuery) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "originalQuery is required" },
        { status: 400 }
      );
    }

    const service = getIdeationService();
    const session = await service.generateIdeas(
      body.researchResult,
      body.originalQuery,
      body.feedback
    );

    // 성공 응답 (스펙에 맞게 202 Accepted 반환)
    const response: GenerateIdeasResponse = {
      sessionId: session.id,
      status: session.status,
      message: session.status === "COMPLETED"
        ? "Idea generation completed"
        : "Idea generation in progress",
    };

    return NextResponse.json<ApiResponse<GenerateIdeasResponse>>(
      { success: true, data: response },
      { status: session.status === "COMPLETED" ? 200 : 202 }
    );
  } catch (error) {
    console.error("[API /ideation/generate] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: `Failed to generate ideas: ${errorMessage}` },
      { status: 500 }
    );
  }
}
