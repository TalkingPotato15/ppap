import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sampleTopics = [
  "AI Agents",
  "Real Estate Technology",
  "PropTech Startups",
  "Smart Home Automation",
  "Property Management AI",
  "Virtual Property Tours",
  "Mortgage Rate Trends",
  "Housing Market 2024",
  "Commercial Real Estate",
  "Rental Market Analysis",
  "Home Buying Assistant",
  "Real Estate CRM",
  "Property Valuation AI",
  "Tenant Screening AI",
  "Lease Management Software",
];

async function seedTrends() {
  console.log("Seeding trending topics...");

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const records = sampleTopics.map((topic, index) => ({
    topic_name: topic,
    rank: index + 1,
    category: "real_estate",
    collected_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("trending_topics")
    .insert(records)
    .select();

  if (error) {
    console.error("❌ Error:", error.message);
  } else {
    console.log(`✅ Inserted ${data.length} topics:`);
    data.forEach((t, i) => console.log(`  ${i + 1}. ${t.topic_name}`));
  }
}

seedTrends();
