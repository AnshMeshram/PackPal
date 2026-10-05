---
title: "PackPal: The Local-AI Travel Companion Built for a Friend"
published: true
tags: hacktoberfest, ai, opensource, webdev
cover_image: https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80
canonical_url: https://github.com/shrin/packpal
description: "PackPal is an open-source, local-AI travel companion powered by Gemma 2 and Ollama. It brings weather-aware packing, airline cabin luggage budgeting, day-by-day itineraries, and natural language expense splitting together in one cozy travel journal."
---

# 🎒 PackPal — Pack Smarter. Travel Lighter.

*Built for the **Hacktoberfest 2026 DEV Weekend Challenge** — Theme: **“Build for a Friend”***

---

## 💡 The Real-World Motivation: Built for Ansh

Every group getaway starts with excitement and quickly degrades into four separate apps:
- Packing checklists in Apple Notes.
- Flight tickets in Gmail.
- Weather forecasts on Google.
- Awkward bill-splitting math in messy WhatsApp group chats.

My friend **Ansh** (a software engineer and avid weekend traveler based in Bangalore) kept running into the same two headaches:
1. **The 7.0 kg Cabin Luggage Trap:** Arriving at the airport gate with an 8.5 kg bag full of redundant clothing, paying steep excess baggage fees.
2. **The Final Evening Dinner Split:** Spending 45 minutes on the last night doing awkward napkin math to settle who paid for cabs, dinners, and villa bookings across 4 friends.

We built **PackPal** as a real solution: a handcrafted, cozy travel journal that brings packing, weather, itineraries, and group expenses together—powered privately by local open-source AI.

---

## ✨ What PackPal Does

### 1. 🧳 Smart Packing & Airline Baggage Budgeting
- Generates categorized checklists (Clothing, Toiletries, Electronics, Beach, Hiking, Documents) tailored to your destination and trip duration.
- **Luggage Setup**: Configure your actual bag (Cabin Trolley, Travel Backpack, Check-in suitcase) with dimensions in centimeters and maximum weight allowances (e.g. 7.0kg cabin limit).
- **Interactive Unit Weights**: Adjust quantities (`+` / `-`) and watch suitcase weight recalculate in real time.
- **AI Luggage Advisor**: Ask PackPal: *“Can I fit another pair of shoes?”* or *“I’m 1.2 kg over the limit, what should I remove?”* Gemma 2 analyzes the gear and recommends non-destructive swaps.

### 2. 🌦️ Live Destination Weather via SerpApi
- Fetches real-time destination weather forecasts via **SerpApi Google Search Engine**.
- Connects weather conditions directly to packing intelligence (e.g. *“Warm 28°C humid conditions — pack breathable cotton and SPF 50+ sunscreen”*).

### 3. 🗺️ Day-by-Day Itinerary with Packing Gear Detection
- Plan daily schedules from Day 1 to Day N.
- **Itinerary → Packing Intelligence**: When you add an activity like *“Mountain Hiking — Day 2”*, PackPal detects required gear (hiking boots, hydration pack) and offers to inject it directly into your packing checklist!

### 4. 💸 TripSplit Natural Language Expense Settler
- Say: *“Rahul paid ₹2400 for dinner for everyone”*.
- Gemma 2 extracts the amount, payer, and participants into a structured confirmation card.
- **Deterministic Integer Paise Arithmetic**: All financial calculations use integer paise (`₹1 = 100 paise`), guaranteeing zero floating-point rounding errors and a strict zero-sum balance invariant.
- **Greedy Debt Minimization**: Automatically calculates the minimum peer-to-peer transfers required to clear all debts (e.g. *“Aman pays Rahul ₹600”*).

---

## 🧠 Why Open Innovation Matters: Gemma 2 + Ollama

A central principle of PackPal is **local, open-source AI**:

```
User Request ──► Next.js App ──► Ollama (Port 11434) ──► Gemma 2 ──► Zod Schema ──► PackPal UI
                                                                         │
                                                             (If Ollama is offline)
                                                                         ▼
                                                            Pure TypeScript Heuristics
```

### Why Local AI?
1. **Privacy-First:** Your vacation dates, personal packing notes, companion names, and expenses never leave your local machine.
2. **Zero Vendor Lock-in:** No dependence on costly closed proprietary APIs.
3. **Deterministic Fail-Safe:** AI reasons and recommends; TypeScript authoritatively calculates weights and money. If Ollama is offline, the app switches to deterministic rule-based packing in < 3 seconds with zero crashes.

---

## 🎨 Design Philosophy: Handcrafted & Cozy (No Generic AI Look)

We deliberately avoided the generic, cookie-cutter "AI dashboard" look (purple gradients, floating sci-fi blobs, robot icons). Instead, PackPal feels like an **editorial travel magazine**:
- **Palette:** Deep Brunswick Green (`#0C4137`), vibrant Emerald (`#06D6A0`), warm Polar Sand (`#E6FBF6`, `#FAFCFB`), and subtle Cream accents (`#FAECB6`).
- **Typography:** DM Serif Display for headlines paired with Inter for data-dense tables.
- **High Contrast:** Every heading, label, and button satisfies WCAG AAA standards (> 7:1 contrast ratio) so text never blends into the background.

---

## 🛠️ Technology Stack & Partners

| Partner / Technology | Role in PackPal |
| :--- | :--- |
| **Gemma 2** | Open-source core AI for personalized packing, luggage reasoning, and NLP expense extraction |
| **Ollama** | Local inference runtime powering Gemma 2 on `http://localhost:11434` |
| **SerpApi** | Live Google search destination weather intelligence |
| **MongoDB Atlas** | Cloud database persistence with graceful offline local fallback |
| **ElevenLabs** | Optional natural voice packing briefings |
| **Next.js 16 + React 19** | Full-stack App Router with Turbopack |
| **Tailwind CSS 4** | Handcrafted design token system |

---

## 🚀 Running PackPal Locally

```bash
# 1. Clone repository
git clone https://github.com/shrin/packpal.git
cd packpal

# 2. Install dependencies
npm install

# 3. Pull Gemma 2 locally with Ollama
ollama run gemma2

# 4. Run tests
npm test

# 5. Start dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and click **“TRY DEMO TRIP”** to explore the Goa Getaway!

---

*Built with ❤️ for Hacktoberfest 2026.*
