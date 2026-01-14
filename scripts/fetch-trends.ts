import { createClient } from "@supabase/supabase-js";
import googleTrends from "google-trends-api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function fetchAndSaveTrends() {
  console.log("Fetching Google Trends...");

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const results = await googleTrends.dailyTrends({ geo: "US" });
    const data = JSON.parse(results);

    const topics: { topic_name: string; rank: number }[] = [];
    const days = data.default.trendingSearchesDays || [];

    for (const day of days) {
      const searches = day.trendingSearches || [];
      searches.forEach((search: { title: { query: string } }, index: number) => {
        topics.push({
          topic_name: search.title.query,
          rank: index + 1,
        });
      });
    }

    const uniqueTopics = topics.slice(0, 20);
    console.log(`Found ${uniqueTopics.length} trending topics:`);
    uniqueTopics.forEach((t, i) => console.log(`  ${i + 1}. ${t.topic_name}`));

    // Save to database
    const records = uniqueTopics.map((topic) => ({
      topic_name: topic.topic_name,
      rank: topic.rank,
      collected_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("trending_topics").insert(records);

    if (error) {
      console.error("Failed to save:", error.message);
    } else {
      console.log(`\n✅ Saved ${records.length} topics to database`);
    }
  } catch (error) {
    console.error("Failed to fetch trends:", error);
  }
}

fetchAndSaveTrends();
