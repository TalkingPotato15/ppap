import googleTrends from "google-trends-api";
import { createServerClient } from "./supabase";

export interface TrendingTopic {
  name: string;
  rank: number;
  category?: string;
}

export async function fetchDailyTrends(geo: string = "US"): Promise<TrendingTopic[]> {
  try {
    const results = await googleTrends.dailyTrends({ geo });
    const data = JSON.parse(results);

    const topics: TrendingTopic[] = [];
    const days = data.default.trendingSearchesDays || [];

    for (const day of days) {
      const searches = day.trendingSearches || [];
      searches.forEach((search: { title: { query: string } }, index: number) => {
        topics.push({
          name: search.title.query,
          rank: index + 1,
        });
      });
    }

    return topics.slice(0, 20); // Top 20 trends
  } catch (error) {
    console.error("Failed to fetch Google Trends:", error);
    return [];
  }
}

export async function saveTrendsToDatabase(topics: TrendingTopic[]): Promise<void> {
  const supabase = createServerClient();

  const records = topics.map((topic) => ({
    topic_name: topic.name,
    rank: topic.rank,
    category: topic.category || null,
    collected_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("trending_topics").insert(records);

  if (error) {
    console.error("Failed to save trends:", error);
    throw error;
  }
}

export async function getRandomTrendingTopic(): Promise<string | null> {
  const supabase = createServerClient();

  // Get recent trends (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("trending_topics")
    .select("topic_name")
    .gte("collected_at", sevenDaysAgo.toISOString())
    .order("collected_at", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    // Fallback: fetch fresh trends
    const freshTrends = await fetchDailyTrends();
    if (freshTrends.length > 0) {
      const randomIndex = Math.floor(Math.random() * freshTrends.length);
      return freshTrends[randomIndex].name;
    }
    return null;
  }

  const topics = data as { topic_name: string }[];
  const randomIndex = Math.floor(Math.random() * topics.length);
  return topics[randomIndex].topic_name;
}
