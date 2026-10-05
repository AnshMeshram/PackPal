# 👥 Friend Profile — Built for Ansh & Friends

> **Hacktoberfest 2026 — DEV Weekend Challenge**  
> **Theme:** Build for a Friend  
> **Target User:** Ansh & his travel companion friend group (Rahul, Aman, Riya)

---

## 1. The Friend Story

### Who is Ansh?
Ansh is a 24-year-old software engineer and avid weekend traveler based in Bangalore, India. Every few months, he coordinates getaways with his close college friend group—often trekking in the Western Ghats, heading to Goa's coastal beaches, or exploring heritage towns.

### The Real-World Frustration
While the trips themselves are unforgettable, the **pre-trip preparation is always chaotic**:
1. **The Fragmented App Nightmare:**
   - Packing checklists lived in Apple Notes (and half the items were forgotten anyway).
   - Flight tickets and hotel bookings were scattered in Gmail and PDFs.
   - Weather forecasts had to be checked on separate browser tabs.
   - Activity schedules were discussed in unstructured WhatsApp voice notes.
2. **The Airline Cabin Luggage Panic:**
   - Indian domestic airlines (IndiGo, Air India Express) enforce a strict **7.0 kg cabin baggage limit**.
   - Ansh would constantly pack unnecessary heavy jeans and duplicate footwear, arriving at the airport gate with an 8.8 kg bag and paying steep excess baggage fines.
3. **The Awkward Dinner Bill Splitting:**
   - At the end of every trip, Rahul or Aman would pay for group dinners (₹2,400 to ₹4,000), Ansh would pay for airport prepaid cabs (₹1,200), and Riya would book the Airbnb.
   - Spending 45 minutes on the final evening doing manual math on napkins or dealing with complex split apps was frustrating.

---

## 2. How PackPal Solves Ansh's Problem

| Ansh's Pain Point | PackPal Solution |
| :--- | :--- |
| **Forgetting essential gear** | Gemma 2 + SerpApi analyzes Goa's forecast and automatically suggests sunscreen SPF 50+, beach towels, and trail footwear. |
| **Exceeding the 7.0kg cabin limit** | Visual **Luggage Setup** with real-time unit weight budgeting. The AI Luggage Advisor warns: *"You are 1.2 kg over the limit; swap the heavy boots."* |
| **Activity disconnect from packing** | When Ansh adds *"Fort Aguada Coastal Trek"* to Day 3 of the itinerary, PackPal automatically detects hiking activity and prompts to add required footwear to the packing list. |
| **Complex group debt math** | TripSplit allows typing natural language expenses: *"Rahul paid ₹2400 for dinner for everyone"*. Gemma 2 parses the text and deterministic integer paise math settles debts in the fewest possible transfers. |
| **Airplane mode & privacy** | Ansh can check off items on the plane without Wi-Fi because PackPal runs locally with zero cloud lock-in. |

---

## 3. Ansh's Feedback After Testing the Demo Trip

> *"This completely changes how we plan our Goa trips. I don't have to bounce between Google Weather, notes, and a calculator. The suitcase weight bar alone saved me from paying an extra baggage fee, and our dinner split took literally 5 seconds."*  
> — **Ansh, Bangalore**
