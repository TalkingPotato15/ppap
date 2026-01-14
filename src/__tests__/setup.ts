import { vi } from "vitest";
import { webcrypto } from "crypto";

// Setup global crypto for tests
if (!global.crypto) {
  global.crypto = webcrypto as unknown as Crypto;
}

// Mock environment variables
process.env.GEMINI_API_KEY = "test-gemini-api-key";
process.env.GEMINI_MODEL = "gemini-2.0-flash-thinking-exp";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.RESEARCH_CACHE_TTL = "86400";
process.env.RESEARCH_TIMEOUT = "60000";
process.env.TRENDS_REGION = "KR";
process.env.TRENDS_MAX_TOPICS = "50";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gt: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => ({
        lt: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
}));

// Mock Google Generative AI
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(),
    })),
  })),
}));

// Mock google-trends-api
vi.mock("google-trends-api", () => ({
  default: {
    dailyTrends: vi.fn(),
  },
}));
