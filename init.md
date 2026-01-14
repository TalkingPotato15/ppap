# AI Agent Business Builder - Project Init

## What This Project Does

A multi-agent AI system that helps developers build startups by:
1. **Finding real market problems** (from actual data, not guesses)
2. **Generating AI agent project ideas** (validated against market trends)

**Focus**: All generated ideas are AI agent-based solutions
**Target domains**: Investment, Education, Real Estate (high-value markets)

---

## Core Problem We're Solving

**Developer pain point**: "I can code, but I don't know what to build that people will actually pay for."

**Our solution**: AI agents do the market research and ideation for you.

---

## System Architecture

### Core Components

```
Google Trends Collector → Background job: fetches trending topics periodically
Gemini Deep Research   → Real-time market research based on user query
Agent B: Strategic Planner → Generates AI agent project ideas from research results
```

### Two-Stage User Flow

```
BACKGROUND: Google Trends Collector
└─ Periodically fetches trending topics from Google Trends
   └─ Stores ranked list of trending topics in cache/DB

STAGE A: Search (User starts here - Google-like UI)
└─ Minimal search page with:
   ├─ Search bar: User enters topic/domain of interest
   ├─ "Got no Clue?" button: Auto-selects from Google Trends
   │   └─ Picks random topic from pre-fetched trending list
   ├─ Gemini Deep Research fetches comprehensive market data
   └─ Returns: trends, problems, opportunities, competitor analysis

STAGE B: Ideation (Research complete)
└─ Agent B generates 3-5 AI agent project ideas
   ├─ Input: Gemini Deep Research results
   ├─ Each idea: AI agent solution with revenue model, risks, value prop
   └─ User reviews and picks one
```

---

## Tech Stack

### Platform
- **Vercel**: Frontend hosting, API routes (Edge Functions)
- **Supabase**: PostgreSQL database, Auth, Edge Functions

### Data Layer
- **Google Trends API**: Fetches trending topics periodically
- **Supabase PostgreSQL**: Stores trending topics, research cache

### Processing Layer
- **Gemini API**: Deep Research for real-time market analysis
- **LLM (Agent B)**: Business idea generation from research data

### Service Layer
- **Vercel API Routes**: Request routing
- **Supabase Edge Functions / Vercel Cron**: Periodic Google Trends data collection

### Client Layer
- **Next.js (Vercel)**: Google-like search UI with "Got no Clue?" button

---

## Component Details

### Google Trends Collector (Background)
**Role**: Weekly fetch and store trending topics

**Process**:
1. Scheduled job runs once per week (Vercel Cron)
2. Fetches trending topics from Google Trends API
3. Stores ranked list in Supabase

**Output**: List of trending topics with:
- Topic name
- Rank/popularity score
- Category (if available)
- Last updated timestamp

---

### Gemini Deep Research (Stage A)
**Role**: Real-time comprehensive market research

**Input**:
- User search query (topic/domain)

**Process**:
1. Deep web search across multiple sources
2. Analyze market trends, pain points, opportunities
3. Identify existing solutions and competitors
4. Synthesize findings into structured report

**Output**: Research report containing:
- Market overview and trends
- Key problems/pain points identified
- Existing solutions and gaps
- Opportunity analysis
- Source citations

---

### Agent B: Strategic Planner (Stage B)
**Role**: Generate AI agent project ideas from research results

**Input**:
- Gemini Deep Research output
- User's original query context

**Constraint**: All generated ideas must be AI agent-based solutions

**Process**:
1. Analyze research findings for viable opportunities
2. Validate market opportunity (demand signals, competition gaps)
3. Generate 3-5 AI agent solution concepts

**Output**: AI Agent idea cards with:
- Core value proposition
- AI agent architecture overview
- Revenue model
- Key risks
- Market fit score

---

## PoC Scope (Minimum Viable Test)

### Constraints
- **Single domain**: Real estate/housing only
- **User test group**: 10 target users

### Success Metrics
1. **Research quality**: Gemini returns relevant, comprehensive market data
2. **Idea quality**: Agent B ideas are logically complete (user rating 4+/5)
3. **Response time**: Full flow completes within reasonable time

### Test Flow
```
Flow 1: Manual Search
User → Enter topic in search bar (Stage A)
     → Wait for Gemini Deep Research
     → Review research summary
     → Review 3-5 ideas (Stage B)
     → Pick one idea
     → Survey satisfaction

Flow 2: Got no Clue
User → Click "Got no Clue?" button
     → System picks trending topic from Google Trends
     → Wait for Gemini Deep Research
     → Review research summary
     → Review 3-5 ideas (Stage B)
     → Pick one idea
     → Survey satisfaction
```

---

## Key Risks & Mitigations

### Risk 1: Hallucination
**Problem**: AI invents fake market data

**Mitigation**:
- Gemini Deep Research provides source citations
- Show citations in responses
- Cross-reference multiple sources

### Risk 2: API Rate Limits / Costs
**Problem**: Gemini Deep Research API costs and limits

**Mitigation**:
- Cache research results for similar queries
- Implement rate limiting per user
- Monitor API usage closely

---

## Project Structure (Recommended)

```
/project-root (Next.js on Vercel)
├── /app
│   ├── page.tsx              # Stage A: Search UI (Google-like)
│   ├── /ideation
│   │   └── page.tsx          # Stage B: Results UI
│   └── /api
│       ├── /search
│       │   └── route.ts      # Stage A: Search endpoint
│       ├── /trends
│       │   └── route.ts      # Trending topics endpoint
│       └── /ideation
│           └── route.ts      # Stage B: Ideation endpoint
├── /components
│   ├── SearchBar.tsx         # Google-like search input
│   ├── GotNoClueButton.tsx   # Random trend selector
│   ├── ResearchSummary.tsx
│   └── IdeaCard.tsx
├── /lib
│   ├── gemini.ts             # Gemini Deep Research API wrapper
│   ├── trends.ts             # Google Trends API wrapper
│   ├── agent-b.ts            # Agent B: Business idea generation
│   └── supabase.ts           # Supabase client
├── /supabase
│   ├── /functions
│   │   └── trends-collector  # Scheduled job for Google Trends
│   └── /migrations           # Database schema
├── /__tests__
│   ├── gemini.test.ts
│   ├── trends.test.ts
│   └── agent-b.test.ts
└── vercel.json               # Cron job config (optional)
```

---

## Next Steps (Post-PoC)

1. **Domain expansion**: Add healthcare, travel, finance domains
2. **Community features**: Let users share/rate ideas

---

## Reference Inspirations

- **Google Search**: Minimal, clean search UI as starting point
- **Google "I'm Feeling Lucky"**: Random discovery feature → "Got no Clue?" button
- **Google Trends**: Real-time trending topics data source
- **Gemini Deep Research**: Comprehensive AI-powered research capability
- **Perplexity AI**: Research-first approach with citations

---

## Quick Start Commands (Example)

```bash
# Setup
npm install

# Set environment variables (.env.local)
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run Supabase locally (optional)
npx supabase start

# Start dev server
npm run dev

# Run tests
npm test

# Deploy to Vercel
vercel deploy
```

---

## Key Differentiators

- **AI Agent focused**: All ideas are AI agent-based project solutions
- **Google-like simplicity**: Single search bar, minimal UI
- **"Got no Clue?" discovery**: One-click access to trending topic ideas
- **Real-time research**: Gemini Deep Research fetches live market data
- **Research to Ideation**: Market research → AI agent project ideas in one flow