import { NextRequest, NextResponse } from "next/server";
import { getTrendsService } from "@/lib/trends";
import type { ApiResponse, CollectionJob } from "@/types";

/**
 * POST /api/trends/collect
 * 002 spec - 수동으로 트렌드 수집 트리거 (관리자용)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CollectionJob>>> {
  try {
    // 간단한 인증 체크 (production에서는 더 강력한 인증 필요)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const service = getTrendsService();

    // 비동기로 수집 시작
    const job = service.createJob("PENDING");

    // 백그라운드에서 수집 실행
    service
      .collectTrends()
      .then((collection) => {
        console.log(
          `[TrendsCollect] Job completed: ${collection.topics.length} topics`
        );
      })
      .catch((error) => {
        console.error("[TrendsCollect] Job failed:", error);
      });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...job,
          status: "PENDING",
        },
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("[API /trends/collect] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start collection job",
      },
      { status: 500 }
    );
  }
}
