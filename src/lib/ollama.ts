import { PackingItem, TripDetails } from '@/types';
import { callOllama } from '@/lib/ai/client';
import { buildPackingPrompt } from '@/lib/ai/prompts';
import { PackingGenerationSchema, PackingArraySchema } from '@/lib/ai/schemas';
import { parseAIJson } from '@/lib/ai/parser';
import { estimateItemUnitWeight } from '@/lib/packing/weights';

export async function generatePackingRecommendations(
  trip: TripDetails,
  destinationInfo?: { snippet?: string; weatherForecast?: string },
  baggageLimitKg?: number,
  packingRules?: string[],
  travelStyle?: string
): Promise<{ items: PackingItem[]; source: 'ai' | 'fallback' }> {
  const prompt = buildPackingPrompt(
    trip,
    destinationInfo?.weatherForecast,
    destinationInfo?.snippet,
    baggageLimitKg,
    packingRules,
    travelStyle
  );

  const { response, ok } = await callOllama(prompt);

  if (ok && response) {
    // Try { items: [...] } format first
    const parsedObj = parseAIJson<{ items: unknown[] }>(response);
    if (parsedObj) {
      const result = PackingGenerationSchema.safeParse(parsedObj);
      if (result.success) {
        return {
          source: 'ai',
          items: result.data.items.map((item, idx) => {
            const pi: PackingItem = {
              id: `ai-${Date.now()}-${idx}`,
              name: item.name,
              category: (item.category as PackingItem['category']) || 'miscellaneous',
              quantity: item.quantity,
              packed: false,
              essential: item.essential,
              priority: item.priority || 'recommended',
              weightEstimateKg: item.weightEstimateKg || 0.15,
              notes: item.notes || '',
              reason: item.reason || '',
              source: 'ai',
            };
            if (pi.weightEstimateKg <= 0) {
              pi.weightEstimateKg = estimateItemUnitWeight(pi);
            }
            return pi;
          }),
        };
      }
    }

    // Try bare array format
    const parsedArr = parseAIJson<unknown[]>(response);
    if (Array.isArray(parsedArr)) {
      const result = PackingArraySchema.safeParse(parsedArr);
      if (result.success) {
        return {
          source: 'ai',
          items: result.data.map((item, idx) => {
            const pi: PackingItem = {
              id: `ai-${Date.now()}-${idx}`,
              name: item.name,
              category: (item.category as PackingItem['category']) || 'miscellaneous',
              quantity: item.quantity,
              packed: false,
              essential: item.essential,
              priority: item.priority || 'recommended',
              weightEstimateKg: item.weightEstimateKg || 0.15,
              notes: item.notes || '',
              reason: item.reason || '',
              source: 'ai',
            };
            if (pi.weightEstimateKg <= 0) {
              pi.weightEstimateKg = estimateItemUnitWeight(pi);
            }
            return pi;
          }),
        };
      }
    }
  }

  // Fallback: TypeScript rule-based business logic
  return { items: generateRuleBasedPackingList(trip), source: 'fallback' };
}

export function generateRuleBasedPackingList(trip: TripDetails): PackingItem[] {
  const items: PackingItem[] = [
    { id: 'fb-1', name: 'Passport / ID', category: 'documents', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.05, source: 'activity', reason: 'Travel document' },
    { id: 'fb-2', name: 'Phone Charger & Cable', category: 'electronics', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.1, source: 'activity', reason: 'Always needed' },
    { id: 'fb-3', name: 'Power Bank', category: 'electronics', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.25, source: 'activity', reason: 'Long travel days' },
    { id: 'fb-4', name: 'Toothbrush & Toothpaste', category: 'toiletries', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.1, source: 'activity', reason: 'Hygiene essential' },
    { id: 'fb-5', name: 'T-Shirts / Tops', category: 'clothing', quantity: Math.min(trip.durationDays, 7), packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.2, source: 'activity', reason: `${trip.durationDays} day trip` },
    { id: 'fb-6', name: 'Pants / Shorts', category: 'clothing', quantity: Math.max(2, Math.ceil(trip.durationDays / 2)), packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.35, source: 'activity', reason: 'Daily wear' },
    { id: 'fb-7', name: 'Underwear & Socks', category: 'clothing', quantity: trip.durationDays + 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.05, source: 'activity', reason: 'One per day plus spare' },
    { id: 'fb-8', name: 'Light Jacket', category: 'clothing', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.4, source: 'weather', reason: 'Evening or cooler weather' },
    { id: 'fb-9', name: 'First Aid Kit', category: 'health', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.2, source: 'activity', reason: 'Safety essential' },
    { id: 'fb-10', name: 'Water Bottle', category: 'gear', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.15, source: 'activity', reason: 'Stay hydrated' },
    { id: 'fb-11', name: 'Sunglasses', category: 'accessories', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.05, source: 'activity', reason: 'Sun protection' },
    { id: 'fb-12', name: 'Wallet', category: 'documents', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.1, source: 'activity', reason: 'Cash and cards' },
  ];

  const activityLower = trip.activities.map((a) => a.toLowerCase());

  if (activityLower.includes('beach') || activityLower.includes('swimming')) {
    items.push({ id: 'fb-b1', name: 'Swimwear', category: 'beach', quantity: 2, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.15, source: 'activity', reason: 'Beach activity' });
    items.push({ id: 'fb-b2', name: 'Sunscreen', category: 'beach', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.15, source: 'activity', reason: 'Sun protection' });
    items.push({ id: 'fb-b3', name: 'Beach Towel', category: 'beach', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.3, source: 'activity', reason: 'Beach essential' });
    items.push({ id: 'fb-b4', name: 'Flip Flops', category: 'beach', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.2, source: 'activity', reason: 'Beach footwear' });
  }

  if (activityLower.includes('hiking') || activityLower.includes('trekking')) {
    items.push({ id: 'fb-h1', name: 'Hiking Shoes', category: 'hiking', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.8, source: 'activity', reason: 'Hiking essential' });
    items.push({ id: 'fb-h2', name: 'Cap / Hat', category: 'hiking', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.1, source: 'activity', reason: 'Sun protection on trails' });
    items.push({ id: 'fb-h3', name: 'Insect Repellent', category: 'health', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.1, source: 'activity', reason: 'Trail protection' });
  }

  if (activityLower.includes('business') || activityLower.includes('conference') || activityLower.includes('meeting')) {
    items.push({ id: 'fb-c1', name: 'Laptop & Charger', category: 'electronics', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 1.5, source: 'activity', reason: 'Work essential' });
    items.push({ id: 'fb-c2', name: 'Formal Shirt', category: 'clothing', quantity: 2, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.25, source: 'activity', reason: 'Business meetings' });
    items.push({ id: 'fb-c3', name: 'Formal Trousers', category: 'clothing', quantity: 2, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.4, source: 'activity', reason: 'Business attire' });
  }

  if (activityLower.includes('dinner') || activityLower.includes('nightlife')) {
    items.push({ id: 'fb-d1', name: 'Smart Casual Outfit', category: 'clothing', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.35, source: 'activity', reason: 'Evening dining' });
  }

  return items;
}
