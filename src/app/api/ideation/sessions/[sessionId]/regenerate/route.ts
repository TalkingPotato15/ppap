import { NextRequest, NextResponse } from "next/server";
import { getIdeationService } from "@/lib/ideation";
import type { ApiResponse, GenerateIdeasResponse, RegenerateRequest } from "@/types";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * POST /api/ideation/sessions/{session_id}/regenerate
 * US-003: 피드백 반영 재생성
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = await params;
    const body = await request.json() as RegenerateRequest;

    if (!sessionId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "sessionId is required" },
        { status: 400 }
      );
    }

    if (!body.feedback || body.feedback.trim() === "") {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "feedback is required for regeneration" },
        { status: 400 }
      );
    }

    const service = getIdeationService();
    const newSession = await service.regenerate(sessionId, body.feedback);

    const response: GenerateIdeasResponse = {
      sessionId: newSession.id,
      status: newSession.status,
      message: newSession.status === "COMPLETED"
        ? "Regeneration completed with feedback"
        : "Regeneration started with feedback",
    };

    return NextResponse.json<ApiResponse<GenerateIdeasResponse>>(
      { success: true, data: response },
      { status: newSession.status === "COMPLETED" ? 200 : 202 }
    );
  } catch (error) {
    console.error("[API /ideation/regenerate] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // 세션 미발견 에러 처리
    if (errorMessage.includes("not found")) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: errorMessage },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: `Failed to regenerate ideas: ${errorMessage}` },
      { status: 500 }
    );
  }
}
