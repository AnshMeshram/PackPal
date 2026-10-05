import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callOllama } from '@/lib/ai/client';
import { parseAIJson } from '@/lib/ai/parser';

const RequestSchema = z.object({
  query: z.string().min(3).max(120),
});

const SuggestionItemSchema = z.object({
  destination: z.string().min(1),
  reason: z.string().min(1),
  tags: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.9),
});

const SuggestionResponseSchema = z.object({
  suggestions: z.array(SuggestionItemSchema).max(3),
});

export type DestinationSuggestion = z.infer<typeof SuggestionItemSchema>;

const KEYWORD_FALLBACKS: Array<{ keywords: string[]; suggestions: DestinationSuggestion[] }> = [
  {
    keywords: ['beach', 'sea', 'coastal', 'ocean', 'sand', 'surf', 'water'],
    suggestions: [
      {
        destination: 'Goa, India',
        reason: 'Sun-drenched beaches, Portuguese colonial quarters, and vibrant coastal shacks.',
        tags: ['Beach', 'Coastal', 'Nightlife'],
        confidence: 0.95,
      },
      {
        destination: 'Gokarna, India',
        reason: 'Serene uncrowded beaches, cliffside trekking paths, and peaceful temple-town charm.',
        tags: ['Beach', 'Trekking', 'Peaceful'],
        confidence: 0.9,
      },
      {
        destination: 'Varkala, India',
        reason: 'Striking red cliffs overlooking the Arabian Sea with seaside cafes and mineral springs.',
        tags: ['Beach', 'Cliffs', 'Sunset'],
        confidence: 0.85,
      },
    ],
  },
  {
    keywords: ['mountain', 'hill', 'cool', 'snow', 'trek', 'himalaya', 'alpine', 'valley', 'nature'],
    suggestions: [
      {
        destination: 'Manali, India',
        reason: 'Pine-fringed mountain valleys, Himalayan vistas, and high-altitude mountain passes.',
        tags: ['Mountain', 'Hiking', 'Adventure'],
        confidence: 0.95,
      },
      {
        destination: 'Munnar, India',
        reason: 'Rolling emerald tea plantations, mist-covered green hills, and refreshingly cool weather.',
        tags: ['Hills', 'Tea Gardens', 'Cool'],
        confidence: 0.9,
      },
      {
        destination: 'Mussoorie, India',
        reason: 'Queen of the Hills featuring colonial viewpoints, waterfalls, and scenic valley walks.',
        tags: ['Hills', 'Viewpoints', 'Heritage'],
        confidence: 0.85,
      },
    ],
  },
  {
    keywords: ['heritage', 'historical', 'rajasthan', 'fort', 'palace', 'culture', 'royal', 'desert', 'history'],
    suggestions: [
      {
        destination: 'Jaipur, India',
        reason: 'The legendary Pink City renowned for Amer Fort, royal palaces, and vibrant bazaars.',
        tags: ['Heritage', 'Palaces', 'Architecture'],
        confidence: 0.95,
      },
      {
        destination: 'Udaipur, India',
        reason: 'The City of Lakes with romantic marble palaces, serene boat rides, and Mewar art.',
        tags: ['Heritage', 'Lakes', 'Romance'],
        confidence: 0.92,
      },
      {
        destination: 'Jodhpur, India',
        reason: 'The Blue City crowned by the colossal Mehrangarh Fort and desert culture.',
        tags: ['Heritage', 'Forts', 'Desert'],
        confidence: 0.88,
      },
    ],
  },
];

function getKeywordFallback(query: string): DestinationSuggestion[] {
  const lower = query.toLowerCase();
  for (const group of KEYWORD_FALLBACKS) {
    if (group.keywords.some((kw) => lower.includes(kw))) {
      return group.suggestions;
    }
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Query must be between 3 and 120 characters.' }, { status: 400 });
    }

    const { query } = parsed.data;

    // 1. Fetch SerpApi snippet context if available (server-side only, short timeout)
    let searchSnippets = '';
    const apiKey = process.env.SERPAPI_API_KEY;
    if (apiKey) {
      try {
        const params = new URLSearchParams({
          engine: 'google',
          q: `${query} travel destinations`,
          api_key: apiKey,
          num: '3',
        });
        const serpRes = await fetch(`https://serpapi.com/search?${params.toString()}`, {
          signal: AbortSignal.timeout(2500),
        });
        if (serpRes.ok) {
          const sData = await serpRes.json();
          const organic = sData.organic_results || [];
          searchSnippets = organic.slice(0, 3).map((r: { snippet?: string }) => r.snippet || '').filter(Boolean).join(' ');
        }
      } catch {
        // SerpApi context fetch skipped
      }
    }

    // 2. Call Gemma 2 via Ollama client
    const prompt = `You are PackPal's Destination Scout. The user is dreaming of a trip with this description:
"${query}"
${searchSnippets ? `Search context: "${searchSnippets.slice(0, 300)}"` : ''}

Respond ONLY with valid JSON matching this schema:
{
  "suggestions": [
    {
      "destination": "City, Country",
      "reason": "One concise sentence explaining why this matches.",
      "tags": ["Tag1", "Tag2", "Tag3"],
      "confidence": 0.95
    }
  ]
}
Provide at most 3 top destination recommendations. No commentary, markdown fences, or text outside the JSON.`;

    try {
      const { response, ok } = await callOllama(prompt);
      if (ok && response) {
        const parsedJson = parseAIJson<unknown>(response);
        if (parsedJson) {
          const validated = SuggestionResponseSchema.safeParse(parsedJson);
          if (validated.success && validated.data.suggestions.length > 0) {
            return NextResponse.json({
              suggestions: validated.data.suggestions.slice(0, 3),
              source: 'gemma',
            });
          }
        }
      }
    } catch {
      // Ollama inference fallback
    }

    // 3. Deterministic keyword fallback
    const fallbackSuggestions = getKeywordFallback(query);
    return NextResponse.json({
      suggestions: fallbackSuggestions,
      source: 'fallback',
    });
  } catch (err) {
    console.error('Destination scout error:', err);
    return NextResponse.json({
      suggestions: [],
      source: 'fallback',
    });
  }
}
