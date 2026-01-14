import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;

async function testGemini() {
  console.log("Testing Gemini API...");
  console.log("API Key length:", apiKey?.length);
  console.log("API Key preview:", apiKey?.substring(0, 15) + "...");

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent("Say hello");
    console.log("✅ Response:", result.response.text());
  } catch (error: unknown) {
    console.error("❌ Full error:", error);
  }
}

testGemini();
