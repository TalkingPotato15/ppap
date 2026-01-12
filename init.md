# AI Agent Business Builder - Project Init

## What This Project Does

A multi-agent AI system that helps developers build startups by:
1. **Finding real market problems** (from actual data, not guesses)
2. **Generating viable business ideas** (validated against market trends)

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
Agent B: Strategic Planner → Generates business ideas from research results
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
└─ Agent B generates 3-5 business ideas
   ├─ Input: Gemini Deep Research results
   ├─ Each idea includes: revenue model, risks, value prop
   └─ User reviews and picks one
```

---

## Tech Stack

### Data Layer
- **Google Trends API**: Fetches trending topics periodically
- **Cache/DB**: Stores trending topics list

### Processing Layer
- **Gemini API**: Deep Research for real-time market analysis
- **LLM (Agent B)**: Business idea generation from research data

### Service Layer
- **API Gateway**: Request routing
- **Scheduler**: Periodic Google Trends data collection

### Client Layer
- **Web/App**: Google-like search UI with "Got no Clue?" button

---

## Component Details

### Google Trends Collector (Background)
**Role**: Periodically fetch and store trending topics

**Process**:
1. Scheduled job runs every N hours
2. Fetches trending topics from Google Trends API
3. Stores ranked list in cache/DB

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
**Role**: Generate business ideas from research results

**Input**:
- Gemini Deep Research output
- User's original query context

**Process**:
1. Analyze research findings for viable opportunities
2. Validate market opportunity (demand signals, competition gaps)
3. Generate 3-5 solution concepts

**Output**: Business idea cards with:
- Core value proposition
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
/project-root
├── /agents
│   └── strategist.py       # Agent B: Business idea generation
├── /services
│   ├── gemini_service.py   # Gemini Deep Research API wrapper
│   ├── trends_service.py   # Google Trends API wrapper
│   └── llm_service.py      # LLM API wrapper for Agent B
├── /jobs
│   └── trends_collector.py # Scheduled job for Google Trends
├── /api
│   ├── /routes
│   │   ├── search.py       # Stage A: Search endpoint
│   │   ├── trends.py       # Trending topics endpoint
│   │   └── ideation.py     # Stage B: Ideation endpoint
│   └── gateway.py          # API Gateway
├── /client
│   ├── /components
│   │   ├── SearchBar.tsx   # Google-like search input
│   │   ├── GotNoClueButton.tsx  # Random trend selector
│   │   ├── ResearchSummary.tsx
│   │   └── IdeaCard.tsx
│   └── /pages
│       ├── search.tsx      # Stage A: Search UI
│       └── ideation.tsx    # Stage B: Results UI
├── /tests
│   ├── test_gemini.py
│   ├── test_trends.py
│   ├── test_agents.py
│   └── test_api.py
└── README.md
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
pip install -r requirements.txt

# Set API keys
export GEMINI_API_KEY=your_gemini_api_key

# Run Google Trends collector (background job)
python jobs/trends_collector.py

# Start API server
python api/gateway.py

# Start client
cd client && npm run dev

# Run tests
pytest tests/
```

---

## Key Differentiators

- **Google-like simplicity**: Single search bar, minimal UI
- **"Got no Clue?" discovery**: One-click access to trending topic ideas
- **Real-time research**: Gemini Deep Research fetches live market data
- **Research to Ideation**: Market research → Business ideas in one flow