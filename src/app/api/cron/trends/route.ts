import { NextRequest, NextResponse } from "next/server";
import { collectAndSaveAllTrends, SUPPORTED_REGIONS } from "@/lib/trends";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting trends collection from all regions...");

    const count = await collectAndSaveAllTrends();
    console.log(`Collected ${count} trending topics from ${SUPPORTED_REGIONS.length} regions`);

    return NextResponse.json({
      success: true,
      collected: count,
      regions: SUPPORTED_REGIONS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Failed to collect trends" },
      { status: 500 }
    );
  }
}
