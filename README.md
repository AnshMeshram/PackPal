# 🎒 PackPal — Intelligent Travel Companion

> **Pack less. Plan smarter. Travel together.**  
> An AI-driven travel packing, weather-aware itinerary, and group expense splitting application built for **Hacktoberfest 2026**.

---

## 🌟 Overview

**PackPal** is an end-to-end intelligent travel companion built with **Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS**. It bridges local LLM inference (**Ollama with Gemma 2**) with real-time Google search data (**SerpApi**), voice narration (**ElevenLabs**), error telemetry (**Sentry**), and cloud persistence (**MongoDB**).

PackPal is designed with **zero-block privacy and offline-first resilience**: every AI and external service feature includes instant, deterministic TypeScript fallback engines so the app is always 100% usable under any network condition.

---

## 🏗️ Architecture

```
                       User Request (Web Interface)
                                    │
                                    ▼
                          Next.js 16 App Router
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
           Trip Planner       Packing & Weight     TripSplit
           & Itinerary        Optimizer Engine     Expenses
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                                    ▼
                         Next.js API Layer
                                    │
         ┌───────────────┬──────────┴─────┬──────────────┬──────────────┐
         ▼               ▼                ▼              ▼              ▼
     SerpApi          Ollama          ElevenLabs      MongoDB        Sentry
   (Live Google      (Gemma 2)        (Voice TTS      (Trip &      (Telemetry
    & Weather)      Local Inference)   Audio)        Checklists)   & Errors)
         │               │                │              │              │
         └───────────────┴──────────┬─────┴──────────────┴──────────────┘
                                    │
                                    ▼
                     Pure TypeScript Fallback Logic
                 (Rule-based Packing, Heuristics, Paise Math)
```

---

## ✨ Key Features

### 1. 🧳 Smart AI Packing Recommendations
- Generates categorized, prioritized packing lists customized to destination, trip duration, trip style (vacation, business, adventure, conference), and specific activities.
- Automatically calculates unit weights per item to keep luggage under airline cabin/check-in weight limits.
- Powered by **Gemma 2** via Ollama with **Zod** schema validation and robust JSON parsing.

### 2. 🌦️ Live Destination & Weather Intelligence
- Queries **SerpApi** for real-time destination weather forecasts, temperature ranges, and travel advisories.
- Seamlessly integrates weather conditions directly into packing suggestions (e.g., rain ponchos, thermal layers, sun protection).

### 3. ⚖️ AI Luggage Weight Optimizer
- Calculates luggage weight in real time.
- Compares packed weight against airline baggage limits (e.g., 7kg cabin, 15kg/20kg check-in).
- Provides an **AI Weight Optimizer** that flags heavy or non-essential items to remove or swap.

### 4. 🎙️ ElevenLabs Voice Packing Briefings
- Converts your customized packing list and weather summary into natural voice audio narration.
- Features an integrated audio player with play/pause and dynamic briefing generation.

### 5. 🗺️ Day-by-Day Interactive Itinerary
- Plan daily schedules from Day 1 to Day N.
- **1-Click Packing Sync**: Scans scheduled activities across all days (beach, hiking, fine dining, water sports) and automatically injects required gear into your packing checklist!

### 6. 💸 TripSplit Expense Tracking & Settlements
- **Natural Language Parsing**: Type *"Rahul paid ₹2400 for dinner"* and let AI extract amount, payer, and participants automatically.
- **Integer Paise Arithmetic**: All transactions, shares, and balances are calculated deterministically in integer paise to eliminate floating-point rounding errors.
- **Greedy Debt Minimization**: Automatically computes the minimum number of peer-to-peer transfers required to settle all debts.

### 7. 👥 Traveler & Companion Management
- Add travel companions with dietary restrictions (Vegetarian, Gluten-Free, Allergies) and packing notes.
- Track individual financial positions and assigned luggage items per traveler.

### 8. 🔄 Natural Language AI Trip Change Assistant
- Modify trips using conversational prompts (e.g., *"We extended our vacation by 2 days"* or *"Add scuba diving on day 3"*).
- Interprets modifications and updates trip duration, end dates, and activities with a single click.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components) |
| **Frontend Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) with Custom Design Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Local AI Inference** | [Ollama](https://ollama.com/) running `gemma2:latest` |
| **Search & Weather** | [SerpApi](https://serpapi.com/) Google Search Engine |
| **Voice Synthesis** | [ElevenLabs](https://elevenlabs.io/) Multilingual v2 API |
| **Database** | [MongoDB](https://www.mongodb.com/) Official Driver |
| **Error Monitoring** | [Sentry](https://sentry.io/) Integration |
| **Tooling & MCP** | DevRelay MCP for session evidence & developer tooling |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.17+ or v20+)
- **npm** (v9+)
- *(Optional)* **Ollama** installed with Gemma 2:
  ```bash
  ollama run gemma2
  ```

### Installation

1. Navigate to the project directory:
   ```bash
   cd packpal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. Populate keys in `.env.local` as needed:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/packpal
   MONGODB_DB=packpal

   # SerpApi (Weather & Search)
   SERPAPI_API_KEY=your_serpapi_key_here

   # ElevenLabs (Voice Synthesis)
   ELEVENLABS_API_KEY=your_elevenlabs_key_here
   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

   # Sentry (Telemetry)
   SENTRY_DSN=your_sentry_dsn_here

   # Ollama (Local AI)
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=gemma2:latest
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Core Verification

Run the standalone verification test suite to check financial calculations, settlement optimization, and luggage weight arithmetic:

```bash
node scripts/verify-logic.js
```

Expected output:
```
🧪 Starting PackPal Core Logic Verification...

Test 1 - Balances: [ ... ]
Test 1 - Settlements: [ ... ]
✅ Test 1 Passed: Expense split and settlement calculation verified.

Test 2 - Multi-way Balances: [ ... ]
Test 2 - Optimal Settlements: [ ... ]
✅ Test 2 Passed: Multi-way debt minimization verified.

✅ Test 3 Passed: Luggage weight calculations verified.

🎉 ALL PACKPAL CORE LOGIC TESTS PASSED SUCCESSFULLY!
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/pack` | Generates packing items via Gemma 2 or fallback logic, queries SerpApi weather, and optionally synthesizes ElevenLabs voice audio. |
| `GET` | `/api/weather?destination=<name>` | Queries live Google weather and destination highlights via SerpApi. |
| `POST` | `/api/ai/expense` | Extracts expense description, amount, payer, and participants from natural language text using Gemma 2 (with regex fallback). |
| `POST` | `/api/ai/optimize` | Analyzes packed items against baggage allowance limits and recommends items to keep, remove, or make optional. |
| `POST` | `/api/ai/trip-change` | Interprets trip modifications (duration changes, new activities) from natural language text into structured trip adjustments. |

---

## 📱 User Journey & Screens

1. **Landing Page (`/`)**: Hero section highlighting key capabilities, "Create a Trip", and 1-click "Try Demo Trip" with pre-populated data (Goa Getaway).
2. **Onboarding (`/onboarding`)**: Comprehensive trip creation wizard (destination, dates, companions, activities, and baggage limits).
3. **Trip Dashboard (`/trips/[tripId]`)**: Real-time luggage readiness, live SerpApi weather card, balance summaries, quick navigation, and AI Trip Change assistant.
4. **Packing Checklist (`/trips/[tripId]/packing`)**: Itemized checklists, ElevenLabs voice briefing playback, AI luggage weight optimizer, print/export, search, and category filters.
5. **Itinerary Schedule (`/trips/[tripId]/itinerary`)**: Day-by-day activity timelines with 1-click automatic packing synchronization.
6. **TripSplit Expenses (`/trips/[tripId]/expenses`)**: Natural language expense logging, manual expense entry, integer paise calculations, and debt settlement directions.
7. **Travelers (`/trips/[tripId]/members`)**: Traveler companion profiles, dietary requirements, and individual financial balances.

---

## 📄 License

MIT © [PackPal Team / Hacktoberfest 2026]
