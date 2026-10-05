import { TripDetails, PackingItem } from '@/types';

export function buildPackingPrompt(
  trip: TripDetails,
  weatherContext?: string,
  destinationContext?: string,
  baggageLimitKg?: number,
  packingRules?: string[],
  travelStyle?: string
): string {
  return `You are PackPal, an expert travel packing assistant. Generate a JSON packing list for this trip.

TRIP DETAILS:
- Destination: ${trip.destination}
- Duration: ${trip.durationDays} days (${trip.startDate} to ${trip.endDate})
- Trip type: ${trip.tripType}
- Activities: ${trip.activities.join(', ')}
${baggageLimitKg ? `- Baggage limit: ${baggageLimitKg} kg` : ''}
${weatherContext ? `\nWEATHER CONTEXT:\n${weatherContext}` : ''}
${destinationContext ? `\nDESTINATION INFO:\n${destinationContext}` : ''}
${travelStyle ? `\nTRAVEL STYLE:\n${travelStyle}` : ''}
${packingRules && packingRules.length > 0 ? `\nUSER PACKING RULES:\n${packingRules.map((r) => `- ${r}`).join('\n')}` : ''}

RULES:
- Be practical and specific
- Adjust quantities to trip duration
- Mark truly essential items (passport, phone charger) as essential
- Include activity-specific items (beach: swimwear, sunscreen; hiking: boots, cap)
- Consider weather when suggesting clothing
- Estimate realistic weights in kg per unit
- Do NOT claim weather data unless provided above

Respond with ONLY valid JSON in this exact format:
{"items": [{"name": "Item Name", "category": "clothing|toiletries|electronics|documents|beach|hiking|health|accessories|gear|miscellaneous", "quantity": 1, "essential": true, "priority": "essential|recommended|optional", "weightEstimateKg": 0.2, "notes": "", "reason": "Why this item"}]}`;
}

export function buildOptimizationPrompt(
  items: PackingItem[],
  baggageLimitKg: number,
  tripContext: string
): string {
  const itemsList = items
    .map(
      (i) =>
        `- [${i.id}] ${i.name} (qty: ${i.quantity}, ~${i.weightEstimateKg}kg/unit, ${i.priority}, ${i.source})`
    )
    .join('\n');

  return `You are PackPal's bag optimizer. Review the packing list and recommend what to keep, remove, or mark optional to meet the baggage limit.

TRIP CONTEXT:
${tripContext}

BAGGAGE LIMIT: ${baggageLimitKg} kg

CURRENT ITEMS:
${itemsList}

RULES:
- Prioritize essential and activity-specific items
- Suggest removing or marking optional items that are least needed
- Never suggest removing documents or essential safety items
- Consider weather and activities
- Do NOT calculate weights — just recommend decisions

Respond with ONLY valid JSON:
{"recommendations": [{"itemId": "item-id", "decision": "keep|remove|optional|replace", "reason": "Why"}]}`;
}

export function buildExpenseExtractionPrompt(
  userText: string,
  memberNames: string[]
): string {
  return `You are PackPal's expense parser. Extract expense details from the user's natural language input.

TRIP MEMBERS: ${memberNames.join(', ')}

USER INPUT: "${userText}"

RULES:
- Extract: description, amount (as number, no currency symbol), paidBy, participants, splitMethod
- "everyone" or "all" means ALL trip members listed above
- Never invent a person not in TRIP MEMBERS
- Never invent or guess an amount — if missing, include "amount" in missingInfo
- Never invent a payer — if unclear, include "paidBy" in missingInfo
- If amount has ₹ symbol, extract just the number
- Default splitMethod is "equal"

Respond with ONLY valid JSON:
{"description": "Dinner", "amount": 2400, "paidBy": "Rahul", "participants": ["Ansh", "Rahul", "Aman", "Riya"], "splitMethod": "equal", "missingInfo": []}`;
}

export function buildTripChangePrompt(
  userText: string,
  currentTrip: { destination: string; startDate: string; endDate: string; durationDays: number; activities: string[] }
): string {
  return `You are PackPal's trip change interpreter. Parse the user's natural language description of a trip modification.

CURRENT TRIP:
- Destination: ${currentTrip.destination}
- Dates: ${currentTrip.startDate} to ${currentTrip.endDate}
- Duration: ${currentTrip.durationDays} days
- Activities: ${currentTrip.activities.join(', ')}

USER INPUT: "${userText}"

ALLOWED ACTIONS:
- extend_trip (include "days" field)
- shorten_trip (include "days" field)
- add_activity (include "activity" and optional "date" field)
- remove_activity (include "activity" field)
- modify_activity (include "activity" and "details" field)

RULES:
- Only return ONE action per request
- Never invent information not implied by the user
- Be conservative — if unsure, add a "details" explanation

Respond with ONLY valid JSON:
{"action": "extend_trip", "days": 1}`;
}
