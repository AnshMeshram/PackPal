import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ai/client';
import { buildOptimizationPrompt } from '@/lib/ai/prompts';
import { PackingOptimizationSchema } from '@/lib/ai/schemas';
import { parseAIJson } from '@/lib/ai/parser';
import { logError } from '@/lib/sentry';
import { PackingItem, AIOptimizeRecommendation } from '@/types';
import { calculateTotalPackedWeight, calculateItemWeight } from '@/lib/packing/weights';

function ruleBasedOptimizationFallback(
  items: PackingItem[],
  baggageLimitKg: number
): AIOptimizeRecommendation[] {
  const totalWeight = calculateTotalPackedWeight(items);
  const excessKg = totalWeight - baggageLimitKg;
  const recommendations: AIOptimizeRecommendation[] = [];

  for (const item of items) {
    const itemWeight = calculateItemWeight(item);

    if (item.essential || item.category === 'documents') {
      recommendations.push({
        itemId: item.id,
        decision: 'keep',
        reason: 'Essential travel item; mandatory for trip.',
      });
    } else if (excessKg > 0 && (item.priority === 'optional' || item.category === 'accessories' || item.quantity > 3)) {
      recommendations.push({
        itemId: item.id,
        decision: 'remove',
        reason: `Luggage is ${excessKg.toFixed(1)}kg over limit. Removing non-essential item saves ${itemWeight.toFixed(2)}kg.`,
      });
    } else if (excessKg > 0 && itemWeight > 0.8) {
      recommendations.push({
        itemId: item.id,
        decision: 'optional',
        reason: 'Heavy item; consider wearing while traveling or packing lightweight alternative.',
      });
    } else {
      recommendations.push({
        itemId: item.id,
        decision: 'keep',
        reason: 'Fits within baggage allowance.',
      });
    }
  }

  return recommendations;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, baggageLimitKg, tripContext } = body;

    if (!items || !baggageLimitKg) {
      return NextResponse.json({ error: 'items and baggageLimitKg are required.' }, { status: 400 });
    }

    try {
      const prompt = buildOptimizationPrompt(items, baggageLimitKg, tripContext || '');
      const { response, ok } = await callOllama(prompt);

      if (ok && response) {
        const parsed = parseAIJson<unknown>(response);
        if (parsed) {
          const result = PackingOptimizationSchema.safeParse(parsed);
          if (result.success) {
            return NextResponse.json({
              recommendations: result.data.recommendations,
              status: 'success',
              source: 'ai',
            });
          }
        }
      }
    } catch {
      // Ollama offline, proceed to fallback
    }

    // Rule-based fallback
    const fallback = ruleBasedOptimizationFallback(items, baggageLimitKg);
    return NextResponse.json({
      recommendations: fallback,
      status: 'success',
      source: 'fallback',
    });
  } catch (err) {
    logError(err, { endpoint: '/api/ai/optimize' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
