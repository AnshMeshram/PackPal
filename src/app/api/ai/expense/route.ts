import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ai/client';
import { buildExpenseExtractionPrompt } from '@/lib/ai/prompts';
import { ExpenseExtractionSchema } from '@/lib/ai/schemas';
import { parseAIJson } from '@/lib/ai/parser';
import { logError } from '@/lib/sentry';
import { AIExpenseExtraction } from '@/types';

function ruleBasedExpenseFallback(text: string, memberNames: string[]): AIExpenseExtraction {
  const lower = text.toLowerCase();

  // Extract amount: e.g. ₹2400, 2400rs, rs 2400, 2400
  let amount = 0;
  const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
  }

  // Detect payer from memberNames
  let paidBy = memberNames[0] || 'You';
  for (const name of memberNames) {
    const regex = new RegExp(`\\b${name}\\b`, 'i');
    if (regex.test(text)) {
      paidBy = name;
      break;
    }
  }

  // Extract description: e.g. "for dinner", "for taxi", "for hotel", or generic words
  let description = 'Trip Expense';
  const forMatch = text.match(/(?:for|on)\s+([a-zA-Z0-9\s]+?)(?:[.,]|$)/i);
  if (forMatch) {
    description = forMatch[1].trim();
  } else {
    // Look for common keywords
    const keywords = ['dinner', 'lunch', 'breakfast', 'drinks', 'coffee', 'cab', 'taxi', 'hotel', 'resort', 'tickets', 'groceries', 'gas', 'snacks'];
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        description = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }
  }

  return {
    description,
    amount,
    paidBy,
    participants: [...memberNames],
    splitMethod: 'equal',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, memberNames } = body;

    if (!text || !memberNames || !Array.isArray(memberNames)) {
      return NextResponse.json({ error: 'text and memberNames are required.' }, { status: 400 });
    }

    try {
      const prompt = buildExpenseExtractionPrompt(text, memberNames);
      const { response, ok } = await callOllama(prompt);

      if (ok && response) {
        const parsed = parseAIJson<unknown>(response);
        if (parsed) {
          const result = ExpenseExtractionSchema.safeParse(parsed);
          if (result.success) {
            return NextResponse.json({ extraction: result.data, status: 'success', source: 'ai' });
          }
        }
      }
    } catch {
      // Ollama offline, proceed to fallback
    }

    // Rule-based fallback
    const fallback = ruleBasedExpenseFallback(text, memberNames);
    return NextResponse.json({ extraction: fallback, status: 'success', source: 'fallback' });
  } catch (err) {
    logError(err, { endpoint: '/api/ai/expense' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
