import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import googleTrends from "google-trends-api";

// Load environment variables from .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Supported regions for trend collection
const REGIONS = ["US", "KR", "JP", "GB", "DE", "FR", "BR", "IN"];

interface TrendTopic {
  topic_name: string;
  rank: number;
  category: string;
  related_queries: string[];
  traffic: string | null;
}

async function fetchTrendsForRegion(geo: string): Promise<TrendTopic[]> {
  try {
    const results = await googleTrends.dailyTrends({ geo });
    const data = JSON.parse(results);

    const topics: TrendTopic[] = [];
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
            topic_name: search.title.query,
            rank: index + 1,
            category: geo,
            traffic: search.formattedTraffic || null,
            related_queries: search.relatedQueries?.map((q) => q.query) || [],
          });
        }
      );
    }

    return topics;
  } catch (error) {
    console.error(`Failed to fetch trends for ${geo}:`, error);
    return [];
  }
}

async function fetchAndSaveTrends() {
  console.log("Fetching Google Trends from multiple regions...\n");

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const allTopics: TrendTopic[] = [];

  for (const region of REGIONS) {
    console.log(`Fetching ${region}...`);
    const topics = await fetchTrendsForRegion(region);
    console.log(`  Found ${topics.length} topics`);
    allTopics.push(...topics);

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\nTotal topics collected: ${allTopics.length}`);

  // Show sample topics per region
  for (const region of REGIONS) {
    const regionTopics = allTopics.filter((t) => t.category === region);
    console.log(`\n${region} (${regionTopics.length} topics):`);
    regionTopics.slice(0, 3).forEach((t) => console.log(`  - ${t.topic_name}`));
    if (regionTopics.length > 3) {
      console.log(`  ... and ${regionTopics.length - 3} more`);
    }
  }

  // Save to database in batches
  const BATCH_SIZE = 100;
  const records = allTopics.map((topic) => ({
    ...topic,
    collected_at: new Date().toISOString(),
  }));

  console.log(`\nSaving ${records.length} topics to database...`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("trending_topics").insert(batch);

    if (error) {
      console.error(`Failed to save batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
    } else {
      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} topics saved`);
    }
  }

  console.log(`\n✅ Done! Saved ${records.length} topics from ${REGIONS.length} regions`);
}

fetchAndSaveTrends();
