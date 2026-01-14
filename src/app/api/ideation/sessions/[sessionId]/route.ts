import { NextRequest, NextResponse } from "next/server";
import { getIdeationService } from "@/lib/ideation";
import type { ApiResponse, GenerationSession } from "@/types";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * GET /api/ideation/sessions/{session_id}
 * US-004: 세션 상태 및 결과 조회
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "sessionId is required" },
        { status: 400 }
      );
    }

    const service = getIdeationService();
    const session = await service.getSession(sessionId);

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<GenerationSession>>(
      { success: true, data: session },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API /ideation/sessions] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: `Failed to get session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
