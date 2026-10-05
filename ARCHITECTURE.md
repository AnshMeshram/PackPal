# 🏛️ PackPal — System Architecture & Technical Specification

> **Hacktoberfest 2026 — DEV Weekend Challenge**  
> **Theme:** Build for a Friend  
> **Stack:** Next.js 16 (App Router + Turbopack), React 19, TypeScript 5, Tailwind CSS 4, Ollama, Gemma 2, SerpApi, MongoDB Atlas.

---

## 1. System Overview

PackPal is a local-first travel companion that combines open-weights AI inference with deterministic business logic. It handles the entire pre-trip workflow:
1. **Itinerary & Route Planning** (day-by-day scheduling with activity gear detection)
2. **Smart Luggage & Packing** (cabin baggage limit enforcement, unit weight math, and AI luggage advice)
3. **Destination Intelligence** (live weather search via SerpApi)
4. **Group Expense Splitting** (natural language expense entry with exact integer paise math)

---

## 2. Architecture Diagram

```
                             User Interaction (Browser / Mobile PWA)
                                               │
                                               ▼
                              Next.js 16 App Router UI Layer
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
            Itinerary Planner         Smart Luggage & Packing       TripSplit Expenses
            (Gear Detection)          (Airline Cabin Limits)       (Integer Paise Math)
                    │                          │                          │
                    └──────────────────────────┼──────────────────────────┘
                                               │
                                               ▼
                                    Next.js API Route Layer
                                               │
                     ┌─────────────────────────┼─────────────────────────┐
                     ▼                         ▼                         ▼
             GET /api/weather           POST /api/pack            POST /api/ai/expense
           (SerpApi Google Search)    (Gemma 2 + Weights)       (Gemma 2 NLP Parser)
                     │                         │                         │
                     └─────────────────────────┼─────────────────────────┘
                                               │
                         ┌─────────────────────┴─────────────────────┐
                         ▼                                           ▼
             Primary AI / Cloud Path                      Deterministic Fallback Path
           ├── Ollama (Gemma 2:latest)                   ├── Pure TypeScript Rule Engine
           ├── SerpApi (Live Google Search)              ├── Heuristic Weather Climate Data
           └── MongoDB Atlas (Cloud Records)             └── LocalStorage (Zero-Block Offline)
```

---

## 3. Core Architectural Pillars

### A. Open-Source AI (Gemma 2 via Ollama)
- **Engine:** Google Gemma 2 running locally via Ollama (`http://localhost:11434`).
- **Structured Outputs:** All AI responses use Zod schemas (`src/lib/ai/schemas.ts`) to validate JSON responses.
- **Fail-Safe Timeout:** Ollama calls use `AbortSignal.timeout(3000)`. If Ollama is offline, the app switches to deterministic TypeScript rules in < 3 seconds with zero crash or lag.
- **Privacy:** User itineraries, dates, companion names, and expenses never leave the user's computer.

### B. Live Web Context (SerpApi)
- **Role:** Executes live Google searches for real-time destination weather, advisories, and conditions.
- **Security:** Private API keys remain strictly server-side (`process.env.SERPAPI_API_KEY`).
- **Graceful Fallback:** If SerpApi is unavailable or unconfigured, PackPal supplies curated seasonal destination context.

### C. Deterministic Financial Math (TripSplit)
- **Zero-Sum Balance Invariant:** All calculations use integer **paise** internally (`₹1 = 100 paise`). Floating-point arithmetic is banned to prevent rounding errors.
- **Debt Minimization Graph Algorithm:** Greedy settlement algorithm computes the minimum number of peer-to-peer transfers required to clear all group debts.
- **AI Rule:** Gemma 2 only extracts raw parameters (payer, amount, description, participants); TypeScript authoritatively calculates balances and shares.

### D. Luggage Weight Budgeting
- **Unit Weights:** Each item has an estimated unit weight (e.g., T-shirt: 0.15kg, Hiking boots: 0.9kg).
- **Airline Limits:** Compares total packed weight against cabin (7.0kg) or check-in baggage limits.
- **Luggage Advisor:** Gemma 2 provides non-destructive recommendations (keep, swap, discard), leaving final control with the user.

---

## 4. Directory Structure

```
packpal/
├── public/
│   ├── media/
│   │   └── vectors/        # Handcrafted SVG travel illustrations
│   └── vectors/            # PackPal SVG brand marks & logos
├── src/
│   ├── app/
│   │   ├── api/            # Serverless API routes (pack, weather, ai/optimize, etc.)
│   │   ├── onboarding/     # Step-by-step trip creation wizard
│   │   ├── settings/       # Diagnostics center & user preferences
│   │   ├── trips/          # Expeditions directory & trip sub-pages
│   │   ├── globals.css     # Brunswick Green & Emerald design tokens
│   │   └── page.tsx        # Storytelling landing page
│   ├── lib/
│   │   ├── ai/             # Ollama client, prompts, parser, and Zod schemas
│   │   ├── expenses/       # Integer paise arithmetic & debt settlement graph
│   │   ├── media/          # Asset resolver abstraction layer
│   │   ├── packing/        # Unit weight estimator
│   │   ├── storage/        # LocalStorage persistence engine
│   │   ├── destinations.ts # Curated destination registry
│   │   ├── mongodb.ts      # Resilient MongoDB Atlas client
│   │   └── serpapi.ts      # Live weather search client
│   └── types/              # Domain models (Trip, PackingItem, LuggageConfig, etc.)
└── scripts/
    ├── verify-logic.js     # Standalone core arithmetic test suite
    └── test-e2e-api.js     # Live HTTP end-to-end API test suite
```
