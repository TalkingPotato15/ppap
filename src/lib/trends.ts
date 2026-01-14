import googleTrends from "google-trends-api";
import { createServerClient } from "./supabase";

export interface TrendingTopic {
  name: string;
  rank: number;
  category?: string;
  relatedQueries?: string[];
  traffic?: string;
}

// Supported regions for trend collection
export const SUPPORTED_REGIONS = ["US", "KR", "JP", "GB", "DE", "FR", "BR", "IN"] as const;
export type SupportedRegion = (typeof SUPPORTED_REGIONS)[number];

export async function fetchDailyTrends(geo: string = "US"): Promise<TrendingTopic[]> {
  try {
    const results = await googleTrends.dailyTrends({ geo });
    const data = JSON.parse(results);

    const topics: TrendingTopic[] = [];
    const days = data.default.trendingSearchesDays || [];

    for (const day of days) {
      const searches = day.trendingSearches || [];
      searches.forEach(
        (
          search: {
            title: { query: string };
            formattedTraffic?: string;
            relatedQueries?: { query: string }[];
          },
          index: number
        ) => {
          topics.push({
            name: search.title.query,
            rank: index + 1,
            category: geo, // Store region as category
            traffic: search.formattedTraffic,
            relatedQueries: search.relatedQueries?.map((q) => q.query) || [],
          });
        }
      );
    }

    return topics; // Return all trends (no limit)
  } catch (error) {
    console.error(`Failed to fetch Google Trends for ${geo}:`, error);
    return [];
  }
}

// Fetch trends from multiple regions
export async function fetchTrendsFromAllRegions(): Promise<TrendingTopic[]> {
  const allTopics: TrendingTopic[] = [];

  for (const region of SUPPORTED_REGIONS) {
    console.log(`Fetching trends for ${region}...`);
    const topics = await fetchDailyTrends(region);
    allTopics.push(...topics);
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`Total topics collected: ${allTopics.length}`);
  return allTopics;
}

export async function saveTrendsToDatabase(topics: TrendingTopic[]): Promise<void> {
  const supabase = createServerClient();

  const records = topics.map((topic) => ({
    topic_name: topic.name,
    rank: topic.rank,
    category: topic.category || null,
    related_queries: topic.relatedQueries || [],
    traffic: topic.traffic || null,
    collected_at: new Date().toISOString(),
  }));

  // Insert in batches to avoid hitting limits
  const BATCH_SIZE = 100;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("trending_topics").insert(batch);

    if (error) {
      console.error(`Failed to save trends batch ${i / BATCH_SIZE + 1}:`, error);
      throw error;
    }
  }

  console.log(`Saved ${records.length} trends to database`);
}

// Save trends from all regions at once
export async function collectAndSaveAllTrends(): Promise<number> {
  const topics = await fetchTrendsFromAllRegions();
  if (topics.length > 0) {
    await saveTrendsToDatabase(topics);
  }
  return topics.length;
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
