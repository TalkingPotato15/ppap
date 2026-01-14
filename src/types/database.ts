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
      generation_sessions: {
        Row: {
          id: string;
          status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
          query: string;
          feedback: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          status?: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
          query: string;
          feedback?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          status?: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
          query?: string;
          feedback?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      ai_agent_ideas: {
        Row: {
          id: string;
          session_id: string;
          title: string;
          description: string;
          value_proposition: string;
          agent_architecture: Json;
          target_audience: string;
          revenue_model: Json;
          key_risks: string[];
          market_fit_score: number;
          implementation_hints: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          title: string;
          description: string;
          value_proposition: string;
          agent_architecture: Json;
          target_audience: string;
          revenue_model: Json;
          key_risks: string[];
          market_fit_score: number;
          implementation_hints: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          title?: string;
          description?: string;
          value_proposition?: string;
          agent_architecture?: Json;
          target_audience?: string;
          revenue_model?: Json;
          key_risks?: string[];
          market_fit_score?: number;
          implementation_hints?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_agent_ideas_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "generation_sessions";
            referencedColumns: ["id"];
          }
        ];
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
export type GenerationSessionRow = Database["public"]["Tables"]["generation_sessions"]["Row"];
export type AIAgentIdeaRow = Database["public"]["Tables"]["ai_agent_ideas"]["Row"];
