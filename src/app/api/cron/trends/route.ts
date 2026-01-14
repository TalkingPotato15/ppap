import { NextRequest, NextResponse } from "next/server";
import { getTrendsService } from "@/lib/trends";

/**
 * GET /api/cron/trends
 * 002 spec - Vercel Cron Job으로 주기적 트렌드 수집
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vercel Cron 인증 체크
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log("[Cron /trends] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron /trends] Starting scheduled collection...");

    const service = getTrendsService();
    const collection = await service.collectTrends();

    console.log(
      `[Cron /trends] Collection completed: ${collection.topics.length} topics`
    );

    return NextResponse.json({
      success: true,
      message: `Collected ${collection.topics.length} trending topics`,
      collectedAt: collection.collectedAt,
    });
  } catch (error) {
    console.error("[Cron /trends] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Collection failed",
      },
      { status: 500 }
    );
  }
}
