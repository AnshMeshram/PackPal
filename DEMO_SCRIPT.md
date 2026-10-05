# 🎬 PackPal — Hacktoberfest 2026 Judge Demo Script

> **Time to Complete:** 3–5 minutes  
> **Target Audience:** Hacktoberfest judges, evaluators, and developers  
> **Prerequisites:** Next.js dev server running on `http://localhost:3000`

---

## Step 1: The Landing Experience (0:00 – 0:45)
1. Navigate to **[http://localhost:3000](http://localhost:3000)**.
2. Note the **Cozy Editorial Aesthetic**:
   - Deep Brunswick Green (`#0C4137`) headings paired with warm Polar Sand (`#E6FBF6`, `#FAFCFB`) background.
   - Clean typography with **DM Serif Display**.
   - Handcrafted vector travel illustrations (Map, Suitcase, Weather, Wallet).
3. Scroll down to review:
   - **4 Core Pillars**: 01 Plan, 02 Pack, 03 Travel, 04 Share.
   - **Gemma 2 Open-Source AI Architecture diagram**: Visualizing the private local inference loop.
   - **Build for a Friend story**: Ansh's real-life packing and group travel challenge.

---

## Step 2: 1-Click Demo Trip Loading (0:45 – 1:15)
1. Click **“TRY DEMO TRIP”** in the hero section.
2. The app instantly seeds and opens the **Goa Getaway** (4 days, 4 travelers: Ansh, Rahul, Aman, Riya).
3. Inspect the **Command Center Dashboard**:
   - High-definition destination cover photography for Goa.
   - **Live SerpApi Weather Widget**: Live Google search weather context.
   - **Suitcase Readiness Bar**: Shows packed count (e.g., 72%) and baggage weight vs. cabin limit (5.2 / 7.0 kg).
   - **Financial Position**: Net balance owed/owing color-coded in Emerald.

---

## Step 3: Smart Packing & Luggage Budgeting (1:15 – 2:30)
1. Click **“Checklist”** or navigate to **Packing**.
2. **Category Filtering & Search**:
   - Click category tabs (Clothing, Toiletries, Beach, Hiking).
   - Type in the real-time search bar (e.g., *"sunscreen"*).
3. **Interactive Quantity & Weight Math**:
   - Click `+` on Cotton T-Shirts: Notice the suitcase weight automatically recalculates in real time!
4. **Luggage Setup Modal**:
   - Click **“Luggage Setup”**.
   - Select **Cabin Trolley (7 kg, 55 × 40 × 20 cm)** or adjust dimensions.
   - Change limit to **5.0 kg** and click Save.
   - Notice the suitcase bar immediately alerts in Coral/Amber: **⚠️ Over limit!**
5. **AI Luggage Advisor**:
   - Click one of the quick question chips: *“What can I remove to stay under cabin limit?”*
   - Gemma 2 analyzes the gear list against the limit and recommends non-destructive swaps.

---

## Step 4: Itinerary → Packing Intelligence (2:30 – 3:30)
1. Click **“Itinerary”** from the top navigation.
2. Browse through **Day 1 to Day 4** activity timelines.
3. Click **“Add Activity”**:
   - Enter *"Scuba Diving & Snorkeling"*.
   - Set Time to *"10:00"*.
   - Ensure the checkbox *"Automatically check and add required activity gear to packing list"* is checked.
   - Click **Save Activity**.
4. Notice the gear detection alert: required water gear is instantly synchronized with the packing checklist!

---

## Step 5: TripSplit Natural Language Expense Parsing (3:30 – 4:30)
1. Click **“TripSplit”** or navigate to **Expenses**.
2. Click **“Quick Add with AI”** or use natural language entry:
   - Type: *"Rahul paid ₹2400 for dinner for everyone"*
   - Click **Extract**.
3. **Structured Confirmation Review**:
   - Gemma 2 extracts: Payer: Rahul, Amount: ₹2,400, Participants: 4 members, Split: ₹600 each.
   - Click **Confirm & Save Expense**.
4. **Deterministic Settlement Verification**:
   - Scroll to **Optimal Settlements**: Notice minimal peer-to-peer transfers:
     * *“Aman pays Rahul ₹600”*
     * *“Ansh pays Rahul ₹600”*
     * *“Riya pays Rahul ₹600”*
   - All arithmetic uses integer **paise** (zero rounding drift guaranteed).

---

## Step 6: Technology Status Center & Diagnostics (4:30 – 5:00)
1. Navigate to **[http://localhost:3000/settings](http://localhost:3000/settings)**.
2. Inspect the **Technology Status Center**:
   - **Gemma 2 (Ollama)**: Local AI Inference status.
   - **SerpApi**: Real-time Google destination search status.
   - **MongoDB Atlas**: Cloud persistence status with local offline fallback.
   - **ElevenLabs**: Optional high-fidelity voice briefing.
3. Review user profile and default travel preferences.
