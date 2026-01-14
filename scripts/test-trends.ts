import googleTrends from "google-trends-api";

async function testTrends() {
  console.log("Testing Google Trends API...");

  try {
    const results = await googleTrends.dailyTrends({ geo: "KR" });
    console.log("Raw response (first 500 chars):");
    console.log(results.substring(0, 500));

    // Try parsing
    const data = JSON.parse(results);
    console.log("\n✅ Parsed successfully!");
    console.log("Days:", data.default?.trendingSearchesDays?.length);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testTrends();
