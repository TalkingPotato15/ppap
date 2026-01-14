// Supabase Database Types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trending_topics: {
        Row: {
          id: string;
          topic_name: string;
          rank: number | null;
          category: string | null;
          related_queries: string[] | null;
          traffic: string | null;
          collected_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_name: string;
          rank?: number | null;
          category?: string | null;
          related_queries?: string[] | null;
          traffic?: string | null;
          collected_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_name?: string;
          rank?: number | null;
          category?: string | null;
          related_queries?: string[] | null;
          traffic?: string | null;
          collected_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      research_cache: {
        Row: {
          id: string;
          query_hash: string;
          query_text: string;
          research_result: Json;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          query_hash: string;
          query_text: string;
          research_result: Json;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          query_hash?: string;
          query_text?: string;
          research_result?: Json;
          created_at?: string;
          expires_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface ResearchResultJson {
  query: string;
  marketOverview: string;
  trends: string[];
  painPoints: string[];
  existingSolutions: string[];
  gaps: string[];
  opportunities: string[];
  sources: { title: string; url: string; snippet?: string }[];
  createdAt: string;
}

// Row types for convenience
export type TrendingTopicRow = Database["public"]["Tables"]["trending_topics"]["Row"];
export type ResearchCacheRow = Database["public"]["Tables"]["research_cache"]["Row"];
