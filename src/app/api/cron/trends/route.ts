import { NextRequest, NextResponse } from "next/server";
import { fetchDailyTrends, saveTrendsToDatabase } from "@/lib/trends";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting trends collection...");

    const trends = await fetchDailyTrends("US");
    console.log(`Fetched ${trends.length} trending topics`);

    if (trends.length > 0) {
      await saveTrendsToDatabase(trends);
      console.log("Trends saved to database");
    }

    return NextResponse.json({
      success: true,
      collected: trends.length,
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
