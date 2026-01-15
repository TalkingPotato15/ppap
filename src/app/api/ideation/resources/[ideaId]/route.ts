import { NextRequest, NextResponse } from "next/server";
import { getResourcesService } from "@/lib/resources";
import type { ApiResponse, ResourceGenerationResponse } from "@/types";

interface RouteParams {
  params: Promise<{ ideaId: string }>;
}

/**
 * POST /api/ideation/resources/{ideaId}
 * 005-US-001: 아이디어 기반 구현 리소스 생성
 * 이미 생성된 리소스가 있으면 캐시된 결과 반환
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { ideaId } = await params;

    if (!ideaId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "ideaId is required" },
        { status: 400 }
      );
    }

    const service = getResourcesService();

    // 캐시 확인
    const existing = await service.getResourcesForIdea(ideaId);
    if (existing) {
      return NextResponse.json<ApiResponse<ResourceGenerationResponse>>(
        {
          success: true,
          data: {
            success: true,
            resources: existing,
            status: "COMPLETED",
          },
        },
        { status: 200 }
      );
    }

    // 새로 생성
    const resources = await service.generateResources(ideaId);

    return NextResponse.json<ApiResponse<ResourceGenerationResponse>>(
      {
        success: true,
        data: {
          success: true,
          resources,
          status: "COMPLETED",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /ideation/resources] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<ResourceGenerationResponse>>(
      {
        success: false,
        error: `Failed to generate resources: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ideation/resources/{ideaId}
 * 기존 생성된 리소스 조회
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { ideaId } = await params;

    if (!ideaId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "ideaId is required" },
        { status: 400 }
      );
    }

    const service = getResourcesService();
    const resources = await service.getResourcesForIdea(ideaId);

    if (!resources) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Resources not found. Generate them first using POST." },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<ResourceGenerationResponse>>(
      {
        success: true,
        data: {
          success: true,
          resources,
          status: "COMPLETED",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API /ideation/resources GET] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
