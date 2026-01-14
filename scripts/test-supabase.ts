import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function testConnection() {
  console.log("Testing Supabase connection...");
  console.log("URL:", supabaseUrl);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Test 1: Check if tables exist
  console.log("\n1. Checking tables...");

  const { data: tables, error: tablesError } = await supabase
    .from("trending_topics")
    .select("*")
    .limit(1);

  if (tablesError) {
    console.log("❌ trending_topics table not found or error:", tablesError.message);
    console.log("\n⚠️  You need to run the schema SQL first:");
    console.log("   Go to Supabase Dashboard > SQL Editor");
    console.log("   Paste contents of supabase/schema.sql and run it");
    return;
  } else {
    console.log("✅ trending_topics table exists");
  }

  const { error: cacheError } = await supabase
    .from("research_cache")
    .select("*")
    .limit(1);

  if (cacheError) {
    console.log("❌ research_cache table not found:", cacheError.message);
  } else {
    console.log("✅ research_cache table exists");
  }

  // Test 2: Insert a test record
  console.log("\n2. Testing insert...");
  const testTopic = {
    topic_name: "Test Topic " + Date.now(),
    rank: 1,
    category: "test",
  };

  const { data: inserted, error: insertError } = await supabase
    .from("trending_topics")
    .insert(testTopic)
    .select()
    .single();

  if (insertError) {
    console.log("❌ Insert failed:", insertError.message);
  } else {
    console.log("✅ Insert successful:", inserted.topic_name);

    // Clean up test data
    await supabase.from("trending_topics").delete().eq("id", inserted.id);
    console.log("✅ Cleanup successful");
  }

  console.log("\n🎉 Supabase connection test complete!");
}

testConnection().catch(console.error);
