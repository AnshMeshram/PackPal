import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ai/client';
import { buildTripChangePrompt } from '@/lib/ai/prompts';
import { TripChangeSchema } from '@/lib/ai/schemas';
import { parseAIJson } from '@/lib/ai/parser';
import { logError } from '@/lib/sentry';
import { AITripChange } from '@/types';

const wordToNum: Record<string, number> = {
  one: 1, a: 1, an: 1, another: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
};

function ruleBasedTripChangeFallback(text: string): AITripChange {
  const lower = text.toLowerCase();

  // Extend trip: e.g. "We're staying one extra day.", "extend by 2 days", "add 3 days", "stay 2 more days"
  const extendMatch = lower.match(/(?:extend(?:ing)?|stay(?:ing)?|add(?:ing)?|extra|more)\s*(?:for\s*)?(?:by\s*)?(\d+|one|two|three|four|five|six|seven|another|an|a)?\s*(?:more\s*|extra\s*)?(?:day|days)/i);
  if (extendMatch) {
    const rawVal = extendMatch[1] ? extendMatch[1].toLowerCase() : '1';
    const days = wordToNum[rawVal] || parseInt(rawVal, 10) || 1;
    return {
      action: 'extend_trip',
      days,
      details: `Extend trip duration by ${days} day${days > 1 ? 's' : ''}`,
    };
  }

  // Shorten trip: e.g. "shorten by 1 day", "cut 2 days", "leave 1 day early"
  const shortenMatch = lower.match(/(?:shorten(?:ing)?|cut(?:ting)?|reduce(?:ing)?|leave early)\s*(?:by\s*)?(\d+|one|two|three|four|five|six|seven|an|a)?\s*(?:day|days)/i);
  if (shortenMatch) {
    const rawVal = shortenMatch[1] ? shortenMatch[1].toLowerCase() : '1';
    const days = wordToNum[rawVal] || parseInt(rawVal, 10) || 1;
    return {
      action: 'shorten_trip',
      days,
      details: `Shorten trip duration by ${days} day${days > 1 ? 's' : ''}`,
    };
  }

  // Add activity: e.g. "add scuba diving", "plan surfing on day 2"
  const actMatch = lower.match(/(?:add|include|plan|go for|do)\s+([a-zA-Z0-9\s]+?)(?:\s+on\s+day\s*(\d+))?$/i);
  if (actMatch) {
    const activity = actMatch[1].trim();
    const day = actMatch[2] ? parseInt(actMatch[2], 10) : undefined;
    return {
      action: 'add_activity',
      activity: activity.charAt(0).toUpperCase() + activity.slice(1),
      details: `Add activity: ${activity}${day ? ` on Day ${day}` : ''}`,
    };
  }

  return {
    action: 'modify_activity',
    details: text,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text || body.changeDescription;
    const currentTrip = body.currentTrip;

    if (!text || !currentTrip) {
      return NextResponse.json(
        { error: 'text (or changeDescription) and currentTrip are required.' },
        { status: 400 }
      );
    }

    try {
      const prompt = buildTripChangePrompt(text, currentTrip);
      const { response, ok } = await callOllama(prompt);

      if (ok && response) {
        const parsed = parseAIJson<unknown>(response);
        if (parsed) {
          const result = TripChangeSchema.safeParse(parsed);
          if (result.success) {
            return NextResponse.json({ change: result.data, status: 'success', source: 'ai' });
          }
        }
      }
    } catch {
      // Ollama offline, gracefully proceed to fallback
    }

    // Graceful rule-based fallback
    const fallback = ruleBasedTripChangeFallback(text);
    return NextResponse.json({ change: fallback, status: 'success', source: 'fallback' });
  } catch (err) {
    logError(err, { endpoint: '/api/ai/trip-change' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
